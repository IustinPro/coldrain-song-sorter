// Deciding whether what someone typed is a coldrain song. Turns out this is
// the hard part of the whole site, which is not where I expected the hard
// part to be.
//
// Two strictnesses, because one was not enough. findExact runs on every
// keystroke and only takes a correctly spelled title, otherwise typing "The"
// would instantly hoover up The Revelation, The Maze and The Future before
// you finished the word. findMatch runs on enter and forgives typos, because
// by then you have committed and deserve some grace.
//
// Both are aggressively relaxed about punctuation. Nobody is losing a point
// over an apostrophe.
const SongGuess = (() => {
  const COMBINING = /\p{M}/gu;              // the bits NFD snaps off accents
  const APOSTROPHE = /[\p{Pi}\p{Pf}'`]/gu;   // straight, curly, and the backtick nobody meant to type

  // Flatten a title until only the letters and numbers survive. Lowercase,
  // strip accents, spell out the ampersand, delete apostrophes entirely so
  // "dont" equals "don't", and mash everything else into single spaces.
  // An accented Deja Vu and a plain one come out identical, which was the
  // entire point of the exercise.
  function normalize(s) {
    return String(s)
      .toLowerCase()
      .normalize('NFD').replace(COMBINING, '')
      .replace(APOSTROPHE, '')
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  // Spacing-blind version, for the people who type like it costs money
  function squash(s) {
    return normalize(s).replace(/ /g, '');
  }

  // Chop a trailing "(Re-Rec.)" or "[Live]" off the end. The || at the end is
  // there in case someone ever names a song "(Untitled)" and strips it to
  // nothing, which would be extremely on brand for this project.
  function stripSuffix(title) {
    return String(title).replace(/[([{][^)\]}]*[)\]}]\s*$/, '').trim() || String(title);
  }

  // Every spelling of a title we will accept, best one first
  function formsOf(title) {
    const full = squash(title);
    const base = squash(stripSuffix(title));
    return base && base !== full ? [full, base] : [full];
  }

  // Levenshtein, two rows instead of a full matrix. The early bail on a big
  // length gap is not an optimisation for its own sake, it is what stops
  // "Vena" being scored against "Counterfeits & Lies (Re-Rec.)" a hundred
  // and eighteen times a keystroke.
  function distance(a, b) {
    const m = a.length, n = b.length;
    if (!m) return n;
    if (!n) return m;
    if (Math.abs(m - n) > 6) return Math.abs(m - n);

    let prev = Array.from({ length: n + 1 }, (_, j) => j);
    let row  = new Array(n + 1);

    for (let i = 1; i <= m; i++) {
      row[0] = i;
      for (let j = 1; j <= n; j++) {
        row[j] = a[i - 1] === b[j - 1]
          ? prev[j - 1]
          : 1 + Math.min(prev[j - 1], prev[j], row[j - 1]);
      }
      [prev, row] = [row, prev];
    }
    return prev[n];
  }

  // Longer titles get more rope. One wrong letter in "A Decade in the Rain"
  // is a slip; one wrong letter in "You" is a different word.
  function tolerance(len) {
    if (len <= 3)  return 0;
    if (len <= 6)  return 1;
    if (len <= 11) return 2;
    return Math.min(5, Math.round(len * 0.22));
  }

  // Correct spelling, any punctuation. The full title always beats a
  // bracket-stripped one, which is the only reason typing "Fiction" gives you
  // Fiction and not Fiction (Re-Rec.). That bug shipped once. It will not
  // ship twice.
  function findExact(guess, candidates) {
    const g = squash(guess);
    if (!g) return null;

    let loose = null, looseCount = 0;
    for (const title of candidates) {
      const forms = formsOf(title);
      if (forms[0] === g) return title;
      if (forms.length > 1 && forms[1] === g) { loose = title; looseCount++; }
    }
    return looseCount === 1 ? loose : null;
  }

  // Nearest title within the typo budget, or nothing. Runs on enter only,
  // because running Levenshtein against a hundred and eighteen titles on
  // every keystroke is a choice you make once.
  function findMatch(guess, candidates) {
    const g = squash(guess);
    if (!g) return null;

    let best = null, bestDist = Infinity, bestForm = Infinity;
    for (const title of candidates) {
      const forms = formsOf(title);
      for (let f = 0; f < forms.length; f++) {
        const d = distance(g, forms[f]);
        if (d > tolerance(Math.max(forms[f].length, g.length))) continue;
        // Same distance, so the tiebreak is which form matched: a whole title
        // beats a stripped one. This single comparison is load-bearing.
        if (d < bestDist || (d === bestDist && f < bestForm)) {
          best = title;
          bestDist = d;
          bestForm = f;
        }
      }
    }
    return best;
  }

  return { normalize, squash, distance, findExact, findMatch };
})();
