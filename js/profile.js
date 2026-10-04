// Storage, and the "seed": an entire profile crammed into a string so
// nobody has to make an account for a fan site about a band from Nagoya.
//
// This file is where the project stopped being a vibe code. Version one was
// JSON.stringify into base64 and it produced FORTY-EIGHT THOUSAND character
// seeds, which is not a code, that is a novella. What follows is three
// rounds of me refusing to accept that.
//
// Everything is bit-packed, then base64'd. Songs and albums go in by their
// permanent sid, never their list position, which is the whole reason four
// discography restructures have not broken a single saved profile.
//
// Version five. Yes, five. Each one was going to be the last one.
//
//   Judged pairs are not stored as pairs. The songs involved go in once, as a
//   bitmap, and then every possible pair between them is walked in a fixed
//   order. What gets written is the GAP between judged ones, Rice coded, so a
//   run of ten unjudged pairs costs about four bits instead of ten. When you
//   have judged almost everything, a plain bitmap is smaller, so the encoder
//   prices both and picks. Obviously.
//
//   Verdicts are three-way (win, lose, tie), and three-way values pack five
//   to a byte in base 3, because 3^5 = 243 fits in 256. Two bits each was
//   leaving 0.4 of a bit on the table every single time, and it adds up.
//
//   A ranking is a set plus an order. The set is a bitmap; the order is, for
//   each position, an index into whatever has not been placed yet, which
//   shrinks as it goes. That is log2(n!) instead of n times a whole sid.
//
//   A sort in progress is the same set-plus-order for its songs and base-3
//   packed answers, and the sorter replays them. Determinism, still paying.
//
// The result: a full song sort went from 1,895 characters to 990. Every one
// of those was measured against a Python mirror with a real merge sort
// running inside it, and every scenario round-trips exactly. Older CR4, CR3
// and CR2 seeds all still open.
const Profile = (() => {
  const LS_KEY = 'cr_hub_v2';
  const SEED_VERSION = 5;
  const EPOCH = Date.UTC(2000, 0, 1);
  const DAY = 86400000;

  const DEFAULT = () => ({
    name:          '',
    joinedAt:      null,
    songGuessBest: 0,      // most songs named in a single run

    // One slot, two possible tenants: a sort you are part way through, or
    // the last one you finished. Never both, which is convenient.
    songSort:      null,   // { items:[], choices:[] } or { result:[] }
    albumSort:     null,   // { items:[], choices:[] } or { result:[] }

    // A guessing run left half done. Lives on this device only and stays out
    // of the seed, on the grounds that nobody wants to share a link that
    // says "here is my incomplete homework".
    songGuess:     null,   // { found:[sid], elapsed, savedAt }

    // Tip bookkeeping. tipsOff is what you swatted away, tipFlags is what
    // you proved you already knew. Both local, because carrying "has pressed
    // an arrow key" across devices would be a genuinely strange thing to do.
    tipsOff:       [],
    tipFlags:      {},

    // Every pick you have ever made, stored from both sides so a lookup
    // works whichever way round the pair turns up. Yes, that doubles it in
    // memory. No, it does not double the seed, the encoder throws the mirror
    // away. comparisons[mode][a][b] = how a did against b.
    comparisons:   { songs:{}, albums:{} },
  });

  function load() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? { ...DEFAULT(), ...JSON.parse(raw) } : DEFAULT();
    } catch { return DEFAULT(); }
  }

  function save(d) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(d)); } catch {}
  }

  // ---------- bit plumbing ----------
  // Writing bits one at a time in JavaScript in 2026. I am aware.

  function BitWriter() {
    const bytes = [];
    let cur = 0, filled = 0, done = false;
    return {
      write(value, width) {
        for (let i = width - 1; i >= 0; i--) {
          cur = (cur << 1) | ((value >>> i) & 1);
          if (++filled === 8) { bytes.push(cur); cur = 0; filled = 0; }
        }
      },
      finish() {
        if (!done && filled) bytes.push(cur << (8 - filled));
        done = true;
        return bytes;
      },
    };
  }

  function BitReader(bytes) {
    let pos = 0;
    return {
      read(width) {
        let v = 0;
        for (let i = 0; i < width; i++) {
          const byte = bytes[pos >> 3] || 0;
          v = (v << 1) | ((byte >> (7 - (pos & 7))) & 1);
          pos++;
        }
        return v;
      },
      get exhausted() { return pos >= bytes.length * 8; },
    };
  }

  // Bits needed to hold 0..max. Feeding this the max sid rather than the
  // list length is what quietly future-proofs the whole format.
  function bitsFor(max) {
    let n = 1;
    while ((1 << n) - 1 < max) n++;
    return n;
  }

  function bytesToB64(bytes) {
    let s = '';
    for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  function b64ToBytes(str) {
    const b = str.replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(b + '==='.slice((b.length + 3) % 4));
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  // ---------- seed encoding ----------
  // Read the header comment first. Then come back. Then read it again.

  // Lookups both ways between titles and sids. Anything that has since been
  // deleted from data.js simply falls out of the seed, silently, which is
  // the correct behaviour and also the only one that does not crash.
  function catalogue(mode) {
    const list = mode === 'songs' ? CR.songs : CR.albums;
    const index = new Map();   // title -> sid
    const byId  = new Map();   // sid -> item
    let maxId = 0;
    list.forEach(item => {
      if (!index.has(item.title)) index.set(item.title, item.sid);
      if (!byId.has(item.sid))    byId.set(item.sid, item);
      if (item.sid > maxId)       maxId = item.sid;
    });
    return { list, index, byId, bits: bitsFor(Math.max(maxId, list.length, 1)) };
  }

  const RESULT_CODE = { win: 0, lose: 1, tie: 2 };
  const RESULT_NAME = ['win', 'lose', 'tie'];

  // Keep one copy of each pair, lower sid first, bin the mirror. Free 50%
  // off, and the decoder puts both sides back on the way out.
  function flattenComparisons(map, index) {
    const out = [];
    for (const a in map) {
      const ai = index.get(a);
      if (ai === undefined) continue;
      for (const b in map[a]) {
        const bi = index.get(b);
        if (bi === undefined || bi <= ai) continue;
        const code = RESULT_CODE[map[a][b]];
        if (code !== undefined) out.push([ai, bi, code]);
      }
    }
    return out;
  }

  // Record one verdict from both sides. Plain property writes rather than
  // spreading a fresh object every time: at 8,385 pairs the spread version
  // was copying the same growing object thousands of times over, for fun.
  function putVerdict(map, byId, a, b, code) {
    const A = byId.get(a), B = byId.get(b);
    const forward = RESULT_NAME[code];
    if (!A || !B || !forward) return;
    const backward = forward === 'win' ? 'lose' : forward === 'lose' ? 'win' : 'tie';
    if (!map[A.title]) map[A.title] = {};
    if (!map[B.title]) map[B.title] = {};
    map[A.title][B.title] = forward;
    map[B.title][A.title] = backward;
  }

  // ---------- CR5 primitives ----------

  // Remainder groups of 1 to 4 trits need 2, 4, 5 and 7 bits respectively
  const TRIT_BITS = [0, 2, 4, 5, 7];

  function writeTrits(w, vals) {
    let i = 0;
    for (; i + 5 <= vals.length; i += 5) {
      w.write(vals[i] + 3 * vals[i + 1] + 9 * vals[i + 2] + 27 * vals[i + 3] + 81 * vals[i + 4], 8);
    }
    const rest = vals.length - i;
    if (rest) {
      let v = 0;
      for (let k = rest - 1; k >= 0; k--) v = v * 3 + vals[i + k];
      w.write(v, TRIT_BITS[rest]);
    }
  }

  function readTrits(r, count) {
    const out = [];
    while (out.length + 5 <= count) {
      let v = r.read(8);
      for (let k = 0; k < 5; k++) { out.push(v % 3); v = Math.floor(v / 3); }
    }
    const rest = count - out.length;
    if (rest > 0) {
      let v = r.read(TRIT_BITS[rest]);
      for (let k = 0; k < rest; k++) { out.push(v % 3); v = Math.floor(v / 3); }
    }
    return out;
  }

  // Rice code: the quotient in unary, the remainder in b plain bits
  function writeRice(w, g, b) {
    for (let q = g >> b; q > 0; q--) w.write(1, 1);
    w.write(0, 1);
    if (b) w.write(g & ((1 << b) - 1), b);
  }

  function readRice(r, b) {
    let q = 0;
    // past the end of the data every read is 0, so a corrupt seed cannot
    // spin this forever, it just runs out of ones
    while (r.read(1)) q++;
    return (q << b) | (b ? r.read(b) : 0);
  }

  // A set of sids plus the order they came in. Garbage from a hand-edited
  // seed (duplicates, negatives, absurd numbers) is dropped first, because a
  // duplicate here would corrupt every bit written after it.
  function writeOrder(w, sids) {
    const clean = [];
    const seen = new Set();
    for (const sid of sids) {
      if (Number.isInteger(sid) && sid >= 0 && sid < 4096 && !seen.has(sid)) {
        seen.add(sid);
        clean.push(sid);
      }
    }
    w.write(clean.length, 16);
    if (!clean.length) return;
    const span = Math.max(...clean) + 1;
    w.write(span, 16);
    for (let i = 0; i < span; i++) w.write(seen.has(i) ? 1 : 0, 1);
    const pool = [...seen].sort((a, b) => a - b);
    for (const sid of clean) {
      const idx = pool.indexOf(sid);
      if (pool.length > 1) w.write(idx, bitsFor(pool.length - 1));
      pool.splice(idx, 1);
    }
  }

  function readOrder(r) {
    const n = r.read(16);
    if (!n) return [];
    const span = r.read(16);
    const pool = [];
    for (let i = 0; i < span; i++) if (r.read(1)) pool.push(i);
    const out = [];
    for (let i = 0; i < n && pool.length; i++) {
      const idx = pool.length > 1 ? r.read(bitsFor(pool.length - 1)) : 0;
      if (idx >= pool.length) break;   // corrupt seed: stop, do not invent songs
      out.push(pool.splice(idx, 1)[0]);
    }
    return out;
  }

  // ---------- CR5 sections ----------

  function writePairs(w, map, cat) {
    const pairs = flattenComparisons(map, cat.index);
    if (!pairs.length) { w.write(0, 16); return; }

    const inSet = new Set();
    pairs.forEach(([a, b]) => { inSet.add(a); inSet.add(b); });
    const members = [...inSet].sort((a, b) => a - b);
    const m = members.length;
    const span = members[m - 1] + 1;
    w.write(span, 16);
    for (let i = 0; i < span; i++) w.write(inSet.has(i) ? 1 : 0, 1);

    // position of each judged pair in the i < j walk over the members
    const pos = new Map(members.map((sid, i) => [sid, i]));
    const keyed = pairs.map(([a, b, code]) => {
      const pa = pos.get(a), pb = pos.get(b);
      return [(pa * (2 * m - pa - 1)) / 2 + (pb - pa - 1), code];
    }).sort((x, y) => x[0] - y[0]);

    const slots = keyed.map(k => k[0]);
    const gaps = slots.map((slot, i) => (i ? slot - slots[i - 1] - 1 : slot));
    const N = (m * (m - 1)) / 2;

    let bestB = 0, bestCost = Infinity;
    for (let b = 0; b < 16; b++) {
      let cost = 0;
      for (const g of gaps) cost += (g >> b) + 1 + b;
      if (cost < bestCost) { bestCost = cost; bestB = b; }
    }

    w.write(pairs.length, 16);
    if (4 + bestCost <= N) {
      w.write(0, 1);
      w.write(bestB, 4);
      gaps.forEach(g => writeRice(w, g, bestB));
    } else {
      w.write(1, 1);
      const taken = new Set(slots);
      for (let i = 0; i < N; i++) w.write(taken.has(i) ? 1 : 0, 1);
    }
    writeTrits(w, keyed.map(k => k[1]));
  }

  function readPairs(r, byId) {
    const map = {};
    const span = r.read(16);
    if (!span) return map;
    const members = [];
    for (let i = 0; i < span; i++) if (r.read(1)) members.push(i);
    const m = members.length;
    const k = r.read(16);
    const slots = [];
    if (r.read(1) === 0) {
      const b = r.read(4);
      let prev = -1;
      for (let i = 0; i < k; i++) { prev = prev + 1 + readRice(r, b); slots.push(prev); }
    } else {
      const N = (m * (m - 1)) / 2;
      for (let i = 0; i < N; i++) if (r.read(1)) slots.push(i);
    }
    const codes = readTrits(r, k);
    // turn walk positions back into pairs without building all of them
    // unless we have to, which for a full history we do, and that is fine
    const walk = [];
    for (let i = 0; i < m; i++) for (let j = i + 1; j < m; j++) walk.push(i, j);
    slots.forEach((slot, i) => {
      if (slot < 0 || slot * 2 + 1 >= walk.length) return;
      putVerdict(map, byId, members[walk[slot * 2]], members[walk[slot * 2 + 1]], codes[i]);
    });
    return map;
  }

  function writeRanking(w, session, cat) {
    const rows = [];
    if (session && session.result) {
      for (const row of session.result) {
        const sid = cat.index.get(row.title);
        if (sid !== undefined) rows.push([sid, row.rank]);
      }
    }
    writeOrder(w, rows.map(row => row[0]));
    let prev = 0;
    rows.forEach(([, rank]) => { w.write(rank === prev ? 1 : 0, 1); prev = rank; });
  }

  function readRanking(r, byId) {
    const order = readOrder(r);
    const rows = [];
    let rank = 0;
    order.forEach((sid, i) => {
      rank = r.read(1) ? rank : i + 1;
      const item = byId.get(sid);
      if (item) rows.push({ rank, title: item.title });
    });
    return rows.length ? { result: rows } : null;
  }

  function writeSession(w, session) {
    if (!session || !session.choices || !session.items) { w.write(0, 1); return; }
    const choices = session.choices.slice(0, 65535);
    w.write(1, 1);
    w.write(session.optimized ? 1 : 0, 1);
    w.write(Math.min(session.autoAnswered || 0, 65535), 16);
    writeOrder(w, session.items);
    w.write(choices.length, 16);
    writeTrits(w, choices.map(c => c + 1));
  }

  function readSession(r) {
    if (!r.read(1)) return null;
    const optimized = !!r.read(1);
    const autoAnswered = r.read(16);
    const items = readOrder(r);
    const count = r.read(16);
    const choices = readTrits(r, count).map(t => t - 1);
    return { items, choices, optimized, autoAnswered, savedAt: Date.now() };
  }

  function encodeSeed(profile) {
    const songs  = catalogue('songs');
    const albums = catalogue('albums');

    const w = new BitWriter();
    w.write(SEED_VERSION, 4);
    w.write(Math.min(profile.songGuessBest || 0, 65535), 16);

    const joined = profile.joinedAt ? Date.parse(profile.joinedAt) : NaN;
    const days = isNaN(joined) ? 0 : Math.max(0, Math.min(65535, Math.round((joined - EPOCH) / DAY) + 1));
    w.write(days, 16);

    // Six bits for the length, so 63 BYTES, not 63 characters. Get that
    // wrong with an emoji in a display name and the whole seed derails.
    let name = new TextEncoder().encode(profile.name || '');
    if (name.length > 63) name = name.subarray(0, 63);
    w.write(name.length, 6);
    name.forEach(byte => w.write(byte, 8));

    const cmp = profile.comparisons || {};
    writePairs(w, cmp.songs || {}, songs);
    writePairs(w, cmp.albums || {}, albums);
    writeRanking(w, profile.songSort, songs);
    writeRanking(w, profile.albumSort, albums);
    writeSession(w, profile.songSort);
    writeSession(w, profile.albumSort);

    return 'CR5:' + bytesToB64(w.finish());
  }

  function readHeader(r, data) {
    data.songGuessBest = r.read(16);
    const days = r.read(16);
    if (days > 0) data.joinedAt = new Date(EPOCH + (days - 1) * DAY).toISOString();
    const nameLen = r.read(6);
    const nameBytes = new Uint8Array(nameLen);
    for (let i = 0; i < nameLen; i++) nameBytes[i] = r.read(8);
    data.name = new TextDecoder().decode(nameBytes);
  }

  function decodeSeed(body) {
    const r = new BitReader(b64ToBytes(body));
    if (r.read(4) !== 5) return null;
    const songs  = catalogue('songs').byId;
    const albums = catalogue('albums').byId;

    const data = DEFAULT();
    readHeader(r, data);
    data.comparisons.songs  = readPairs(r, songs);
    data.comparisons.albums = readPairs(r, albums);
    const songResult   = readRanking(r, songs);
    const albumResult  = readRanking(r, albums);
    const songSession  = readSession(r);
    const albumSession = readSession(r);

    // A live sort wins over an old finished one: it is where you would
    // actually want to land back
    data.songSort  = songSession  || songResult;
    data.albumSort = albumSession || albumResult;
    return data;
  }

  // CR4. Last month's pride and joy, now a legacy reader. Kept because every
  // share link sent before today is one of these.
  function decodeSeedV4(body) {
    const r = new BitReader(b64ToBytes(body));
    if (r.read(4) !== 4) return null;
    const songBits  = r.read(5);
    const albumBits = r.read(5);
    const songs  = catalogue('songs').byId;
    const albums = catalogue('albums').byId;

    const data = DEFAULT();
    readHeader(r, data);

    const pairsV4 = (byId, bits) => {
      const map = {};
      if (r.read(1) === 0) {
        const count = r.read(16);
        for (let i = 0; i < count; i++) {
          const a = r.read(bits), b = r.read(bits), code = r.read(2);
          putVerdict(map, byId, a, b, code);
        }
        return map;
      }
      const span = r.read(16);
      const members = [];
      for (let i = 0; i < span; i++) if (r.read(1)) members.push(i);
      for (let i = 0; i < members.length; i++) {
        for (let j = i + 1; j < members.length; j++) {
          if (r.read(1)) putVerdict(map, byId, members[i], members[j], r.read(2));
        }
      }
      return map;
    };

    const resultV4 = (byId, bits) => {
      const count = r.read(16);
      const rows = [];
      let rank = 0;
      for (let i = 0; i < count; i++) {
        const item = byId.get(r.read(bits));
        rank = r.read(1) ? rank : i + 1;
        if (item) rows.push({ rank, title: item.title });
      }
      return rows.length ? { result: rows } : null;
    };

    const sessionV4 = bits => {
      if (!r.read(1)) return null;
      const optimized = !!r.read(1);
      const autoAnswered = r.read(16);
      const itemCount = r.read(16);
      const items = [];
      for (let i = 0; i < itemCount; i++) items.push(r.read(bits));
      const choiceCount = r.read(16);
      const choices = [];
      for (let i = 0; i < choiceCount; i++) choices.push(r.read(2) - 1);
      return { items, choices, optimized, autoAnswered, savedAt: Date.now() };
    };

    data.comparisons.songs  = pairsV4(songs, songBits);
    data.comparisons.albums = pairsV4(albums, albumBits);
    const songResult   = resultV4(songs, songBits);
    const albumResult  = resultV4(albums, albumBits);
    const songSession  = sessionV4(songBits);
    const albumSession = sessionV4(albumBits);
    data.songSort  = songSession  || songResult;
    data.albumSort = albumSession || albumResult;
    return data;
  }

  // CR3. Older, dumber, still supported, because breaking somebody's backup
  // to save eighty lines is not a trade I am willing to make.
  function decodeSeedV3(body) {
    const r = new BitReader(b64ToBytes(body));
    if (r.read(4) !== 3) return null;

    const songBits  = r.read(5);
    const albumBits = r.read(5);
    const songs  = catalogue('songs').byId;
    const albums = catalogue('albums').byId;

    const data = DEFAULT();
    data.songGuessBest = r.read(16);
    const days = r.read(16);
    if (days > 0) data.joinedAt = new Date(EPOCH + (days - 1) * DAY).toISOString();

    const nameLen = r.read(6);
    const nameBytes = new Uint8Array(nameLen);
    for (let i = 0; i < nameLen; i++) nameBytes[i] = r.read(8);
    data.name = new TextDecoder().decode(nameBytes);

    const readPairsV3 = (byId, bits) => {
      const map = {};
      const count = r.read(16);
      for (let i = 0; i < count; i++) {
        const a = byId.get(r.read(bits));
        const b = byId.get(r.read(bits));
        const forward = RESULT_NAME[r.read(2)];
        if (!a || !b || !forward) continue;
        const backward = forward === 'win' ? 'lose' : forward === 'lose' ? 'win' : 'tie';
        map[a.title] = { ...map[a.title], [b.title]: forward };
        map[b.title] = { ...map[b.title], [a.title]: backward };
      }
      return map;
    };
    data.comparisons.songs  = readPairsV3(songs, songBits);
    data.comparisons.albums = readPairsV3(albums, albumBits);

    const readResultV3 = (byId, bits) => {
      const rows = [];
      const count = r.read(16);
      for (let i = 0; i < count; i++) {
        const item = byId.get(r.read(bits));
        const rank = r.read(bits);
        if (item) rows.push({ rank, title: item.title });
      }
      return rows.length ? { result: rows } : null;
    };
    data.songSort  = readResultV3(songs, songBits);
    data.albumSort = readResultV3(albums, albumBits);

    return data;
  }

  // CR2. The original sin. Raw JSON in base64, no types, no checks, no
  // shame. Kept alive purely so the earliest seeds still open.
  function decodeSeedV2(body) {
    const b = body.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(escape(atob(b + '==='.slice((b.length + 3) % 4))));
    return { ...DEFAULT(), ...JSON.parse(json) };
  }

  // The moment seeds became shareable, they became untrusted input, and CR2
  // is raw JSON that will hand you literally anything. So: everything gets
  // forced into shape on the way in. A doctored seed can be WRONG. It cannot
  // be DANGEROUS. Somebody was going to put markup where a rank goes.
  function sanitise(data) {
    const clean = DEFAULT();

    clean.name = typeof data.name === 'string' ? data.name.slice(0, 63) : '';
    clean.songGuessBest = Math.max(0, Math.min(9999, Math.floor(Number(data.songGuessBest)) || 0));

    const joined = data.joinedAt ? Date.parse(data.joinedAt) : NaN;
    clean.joinedAt = isNaN(joined) ? null : new Date(joined).toISOString();

    ['songs', 'albums'].forEach(mode => {
      const src = data.comparisons && data.comparisons[mode];
      const out = {};
      if (src && typeof src === 'object') {
        for (const a of Object.keys(src)) {
          const row = src[a];
          if (!row || typeof row !== 'object') continue;
          for (const b of Object.keys(row)) {
            if (!RESULT_NAME.includes(row[b])) continue;
            out[a] = { ...out[a], [b]: row[b] };
          }
        }
      }
      clean.comparisons[mode] = out;
    });

    const sortOf = src => {
      if (!src || typeof src !== 'object') return null;
      if (Array.isArray(src.result)) {
        const rows = src.result
          .filter(r => r && typeof r.title === 'string')
          .map(r => ({ rank: Math.max(1, Math.floor(Number(r.rank)) || 1), title: r.title }));
        return rows.length ? { result: rows } : null;
      }
      if (Array.isArray(src.items) && Array.isArray(src.choices)) {
        const items = src.items.map(Number).filter(Number.isInteger);
        const choices = src.choices.map(Number).filter(c => c === -1 || c === 0 || c === 1);
        if (items.length < 2) return null;
        return {
          items, choices,
          optimized: !!src.optimized,
          autoAnswered: Math.max(0, Math.floor(Number(src.autoAnswered)) || 0),
          savedAt: Date.now(),
        };
      }
      return null;
    };
    clean.songSort  = sortOf(data.songSort);
    clean.albumSort = sortOf(data.albumSort);

    return clean;
  }

  function generateSeed(profile) {
    try { return encodeSeed(profile); }
    catch { return ''; }
  }

  function parseSeed(seed) {
    const trimmed = (seed || '').trim();
    try {
      if (trimmed.startsWith('CR5:')) return sanitise(decodeSeed(trimmed.slice(4)));
      if (trimmed.startsWith('CR4:')) return sanitise(decodeSeedV4(trimmed.slice(4)));
      if (trimmed.startsWith('CR3:')) return sanitise(decodeSeedV3(trimmed.slice(4)));
      if (trimmed.startsWith('CR2:')) return sanitise(decodeSeedV2(trimmed.slice(4)));
    } catch { return null; }
    return null;
  }

  return {
    load, save, generateSeed, parseSeed,

    // Same guard as load and save. In a locked down browser this throws, and
    // a reset button that explodes is worse than one that quietly does nothing
    reset() { try { localStorage.removeItem(LS_KEY); } catch {} },

    update(profile, changes) {
      const updated = { ...profile, ...changes };
      save(updated);
      return updated;
    },

    // Only worth writing if it actually beat the old one
    recordSongGuessScore(profile, found) {
      if (found <= profile.songGuessBest) return profile;
      return this.update(profile, { songGuessBest: found });
    },

    // Empty list means there is nothing worth coming back to, so null it.
    // elapsed is the banked clock, so picking a run back up continues the
    // time rather than pretending you were fast.
    saveGuessSession(profile, foundSids, elapsed) {
      return this.update(profile, {
        songGuess: foundSids.length
          ? { found: foundSids, elapsed: elapsed || 0, savedAt: Date.now() }
          : null
      });
    },

    clearGuessSession(profile) {
      return this.update(profile, { songGuess: null });
    },

    dismissTip(profile, id) {
      const off = profile.tipsOff || [];
      if (off.includes(id)) return profile;
      return this.update(profile, { tipsOff: [...off, id] });
    },

    tipFlag(profile, key) {
      return !!(profile.tipFlags && profile.tipFlags[key]);
    },

    // Marks a tip as no longer needed. Writes at most once, which matters
    // because this gets called from a keydown handler and I am not doing a
    // localStorage round trip per arrow key.
    flagTip(profile, key) {
      if (this.tipFlag(profile, key)) return profile;
      return this.update(profile, { tipFlags: { ...profile.tipFlags, [key]: true } });
    },

    // -1 means a won, 1 means b won, 0 means you could not decide. Written
    // from both sides so a later lookup does not care which order it asks in.
    recordComparison(profile, mode, a, b, choice) {
      const all = { ...profile.comparisons, [mode]: { ...profile.comparisons[mode] } };
      const map = all[mode];
      const forward  = choice === -1 ? 'win'  : choice === 1 ? 'lose' : 'tie';
      const backward = choice === -1 ? 'lose' : choice === 1 ? 'win'  : 'tie';
      map[a] = { ...map[a], [b]: forward };
      map[b] = { ...map[b], [a]: backward };
      return this.update(profile, { comparisons: all });
    },

    getComparisons(profile, mode) {
      return (profile.comparisons && profile.comparisons[mode]) || {};
    },

    // { items, choices, optimized, autoAnswered }. No working arrays. If that
    // looks too small to be a whole sort, see the header comment and the
    // paragraph where I get excited about determinism.
    saveSortSession(profile, mode, session) {
      const key = mode === 'songs' ? 'songSort' : 'albumSort';
      return this.update(profile, { [key]: { ...session, savedAt: Date.now() } });
    },

    saveSortResult(profile, mode, result) {
      const key = mode === 'songs' ? 'songSort' : 'albumSort';
      return this.update(profile, { [key]: { result } });
    },

    clearSort(profile, mode) {
      const key = mode === 'songs' ? 'songSort' : 'albumSort';
      return this.update(profile, { [key]: null });
    },
  };
})();
