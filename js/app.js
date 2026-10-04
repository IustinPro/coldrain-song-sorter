// The controller. Every screen, every render, one file, no framework.
//
// This started as a weekend thing. It is now eighteen hundred lines of
// vanilla JavaScript with a bespoke binary serialisation format and a
// conditional hint engine, and at no point did anyone stop me.
//
// It still ships as three script tags and zero dependencies, which is
// either the best or the worst decision here and I have stopped trying to
// work out which.

let profile = Profile.load();
let sorter = null;
let sorterMode = 'songs';   // 'songs' | 'albums'
let currentView = 'home';
let useOptimized = false;   // reuse past picks instead of asking again

document.addEventListener('DOMContentLoaded', () => {
  renderProfileBadge();
  buildHomeBackdrop();
  showView(openSharedLink() ? 'profile' : 'home');
  document.addEventListener('keydown', handleKey);
});

// Navigation
// Show one section, hide the others. This is the entire router. It has
// never once broken, which is more than I can say for any real one.

function showView(name) {
  // Walking off the guessing screen stops the clock and banks the run,
  // because coming back to find you scored 4 in nine hours is not fun
  if (currentView === 'songguess' && name !== 'songguess') {
    pauseGuessTimer();
    saveGuessProgress();
  }
  // Someone else's profile is a look, not somewhere you live
  if (currentView === 'profile' && name !== 'profile') guest = null;
  currentView = name;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');
  document.querySelectorAll('.nav-link, .bn-item').forEach(l =>
    l.classList.toggle('active', l.dataset.view === name));
  document.body.classList.toggle('on-home', name === 'home');
  window.scrollTo(0, 0);

  if (name === 'info')      buildInfoPage();
  if (name === 'sorter')    renderSorterSetup();
  if (name === 'profile')   renderProfileView();
  if (name === 'songguess') renderSongGuessView();
}

// Home
// Three cards and a logo. The restraint here was hard won: this screen has
// previously held a stats strip, a tip, and nine link pills, all of which
// were removed by someone with better taste than me.

// Sleeves drifting past behind the home screen. Each row holds the covers
// twice so the -50% slide loops with no seam, and the spacing lives on the
// item rather than as a gap for the same reason. Half a gap of drift every
// sixty seconds is the sort of thing you cannot unsee once you have seen
// it, so I fixed it before I could.
function buildHomeBackdrop() {
  const orders = [CR.albums, CR.albums.slice().reverse()];
  orders.forEach((albums, i) => {
    const row = document.getElementById('home-bg-row-' + (i + 1));
    if (!row) return;
    const art = albums.map(a =>
      `<div class="home-bg-art" style="background-image:url('${a.img}')"></div>`).join('');
    row.innerHTML = art + art;
  });
}

// Info
// What began as "maybe a credits page" and became an encyclopaedia entry
// with footnotes. Nobody asked for footnotes. There are ten of them.

// Everything on the Info page that is a table rather than a sentence. The
// prose lives in index.html; this is the part that would otherwise be two
// hundred lines of <td> that I would typo in four places and never find.
//
// Every number here comes off the English Wikipedia article or an interview
// it cites. null means "did not chart", which is a very polite way of
// writing "did not chart". Upcoming releases get 'TBA', because the future
// has not reported its Oricon position yet, the lazy thing.
const INFO = {

  members: [
    { tag: 'Masato', name: 'Masato David Hayakawa', role: 'Lead vocals',
      bio: `Born in Nagoya on 17 December 1986 to an American mother from Iowa and a
        Japanese father from Niigata. Before coldrain he fronted Script of Creation and
        then AVER, both with Katsuma, and studied law at Nanzan University before leaving
        to focus on the band. He co-wrote One Ok Rock's "Renegades" with Ed Sheeran, and
        in 2021 sang "Remember" for the anime Jujutsu Kaisen.` },
    { tag: 'Y.K.C.', name: 'Ryo Yokochi', role: 'Lead guitar, programming, piano, keyboards',
      bio: `The band's main composer, who writes most of the songs with Masato. His rule
        for a song is that it has to have holding power on its own before anything else
        about it means anything.` },
    { tag: 'Sugi', name: 'Kazuya Sugiyama', role: 'Rhythm and baritone guitar, backing vocals',
      bio: `Recorded his parts for Nonnegative at home in Japan after the birth of his
        first child, while the rest of the band worked in the United States. Guested on
        Kala's "Kingsblood" in 2025.` },
    { tag: 'RxYxO', name: 'Ryo Shimizu', role: 'Bass, backing vocals',
      bio: `A singer until coldrain formed, when he switched to bass for the new band. Has
        named J, Rikiji, Tim Commerford, Vinnie Hornsby and Sam Rivers as his favourite
        bassists.` },
    { tag: 'Katsuma', name: 'Katsuma Minatani', role: 'Drums, percussion',
      bio: `Met Masato in high school and played beside him in two bands before this one.
        Stepped away for several months in 2012 for treatment of a hereditary illness,
        and has guested for Duran and Dreamcatcher.` },
  ],

  subs: [
    ['Jin "ZAX" Kanza', 'Pay Money to My Pain', 'Drums', '2012'],
    ['Tatsuya "Tatsu" Amano', 'Crossfaith', 'Drums', '2012'],
    ['YOUTH-K!!!', 'BPM13GROOVE', 'Drums', '2012'],
  ],

  // Four chart columns, because the Revelation went to number 4 on the
  // Australian Hitseekers chart and I am not leaving that out for tidiness
  studio: [
    ['Final Destination',    '28 October 2009',   'VAP',                     88, 73, null, null, ''],
    ['The Enemy Inside',     '16 February 2011',  'VAP',                     21, 22, null, null, ''],
    ['The Revelation',       '17 April 2013',     'VAP, Hopeless, Sony',     7,  7,  4,    null, ''],
    ['Vena',                 '21 October 2015',   'VAP, Hopeless',           9,  10, null, 15,   'US: 310'],
    ['Fateless',             '11 October 2017',   'Warner Music Japan',      8,  8,  null, null, 'JP: 12,980'],
    ['The Side Effects',     '28 August 2019',    'Warner Music Japan',      10, 8,  null, null, 'JP: 9,811'],
    ['Nonnegative',          '6 July 2022',       'Warner Music Japan',      15, 11, null, null, 'JP: 7,826'],
    ['OPTIMIZE = OPTDEMISE', '25 September 2026', 'Sony Music, Century Media', 'TBA', 'TBA', 'TBA', 'TBA', ''],
  ],

  eps: [
    ['Nothing Lasts Forever',       '23 June 2010',      'VAP',                       63,   49],
    ['Through Clarity',             '4 July 2012',       'VAP',                       14,   13],
    ['Until the End',               '18 June 2014',      'VAP',                       17,   15],
    ['Paradise (Kill the Silence)', '17 September 2021', 'Warner Music Japan',        null, 14],
    ['OPTIMIZE',                    '24 October 2025',   'Sony Music, Century Media', null, null],
    ['EX-HUMANITY',                 '17 July 2026',      'Sony Music, Century Media', null, null],
  ],

  maxi: [
    ['Fiction', '2008', 181, 'Final Destination'],
    ['8AM',     '2009', 111, 'Final Destination'],
    ['Vena II', '2016', 21,  'Non-album single'],
  ],

  live: [
    ['Three Days of Adrenaline',               '7 December 2011',   'VAP',                'DVD',          null, 31],
    ['Evolve',                                 '30 April 2014',     'VAP',                'BD, DVD',      13,   12],
    ['20180206 Live at Budokan',               '26 September 2018', 'Warner Music Japan', 'BD, DVD',      24,   9],
    ['Live & Backstage at Blare Fest. 2020',   '28 October 2020',   'Warner Music Japan', 'BD, DVD',      20,   6],
    ['15x(5+U) Live at Yokohama Arena',        '17 May 2023',       'Warner Music Japan', 'BD, DVD',      16,   11],
    ['Homecoming Live at Nippon Gaishi Hall',  '31 January 2025',   'Warner Music Japan', 'BD, DVD, LP',  null, null],
  ],

  rerec: [
    ['Final Destination (XV Re:Recorded)', '10 February 2024', 'Warner Music Japan', 'CD, digital', 74],
  ],

  // Releases that happened, but that the sorter deliberately does not carry.
  // Until the End is the entire reason this array exists: five of its six
  // tracks are on the international Revelation, so ranking it would have been
  // voting on the same songs twice, and out of data.js it went. It still came
  // out in June 2014 though, and a discography timeline with a hole in it is
  // just a lie with nice sleeves. Anything added here shows on the timeline
  // and nowhere else, which is the point.
  offRoster: [
    { year: 2014, mo: 6, title: 'Until the End', kind: 'EP', tracks: 6,
      img: 'img/crsong/cr_ute.jpg' },
  ],

  toursHead: [
    ['Final Destination Tour', '2009'], ['Nothing Lasts Forever Tour', '2010'],
    ['The Enemy Inside Tour', '2011'], ['Through Clarity Tour', '2012'],
    ['The Revelation Tour', '2013'], ['Until the End Tour', '2014'],
    ['Vena Japan Tour', '2015 \u2013 16'], ['Vena European May Tour', '2016'],
    ['Fateless: A Decade in the Rain Tour', '2017'], ['Another Decade in the Rain Tour', '2018'],
    ['Summer European Tour', '2019'], ['The Side Effects One Man Tour', '2019'],
    ['Paradise One Man Tour', '2021'], ['Nonnegative Tour', '2022'],
    ['Brisbane Headline Show', '2023'], ['February European Tour', '2024'],
    ['Summer in Germany Tour', '2025'], ['OPTIMIZE Asian Tour', '2025'],
    ['OPTIMIZE European Tour', '2025'],
  ],

  toursSupport: [
    ['Crossfaith, Apocalyze Japan Tour', '2013'],
    ['Man with a Mission, Tales of Purefly Japan Tour', '2014'],
    ['Bullet for My Valentine, European Tour', '2014'],
    ['Crossfaith, European Tour', '2014'],
    ['One Ok Rock, 35xxxv Japan Tour', '2015'],
    ['Papa Roach, UK Tour', '2015'],
    ['Bullet for My Valentine, Venom European Tour', '2015'],
    ['Volumes and Northlane, North American Tour', '2015'],
    ['Silverstein, North American Tour', '2016'],
    ['Vans Warped Tour', '2016'],
    ['SiM, The Beautiful People Japan Tour', '2016'],
    ['One Ok Rock, Ambitions Japan Tour', '2017'],
    ['Crown the Empire, European Tour', '2018'],
    ['Papa Roach and The Used, Australian Tour', '2023'],
    ['Electric Callboy, European Tour', '2024'],
    ['Electric Callboy, Australian Tour', '2026'],
  ],

  // The ones that come up in every write-up of the band, which is its own
  // kind of peer review
  fests: [
    { year: 2009, name: 'Summer Sonic',                where: 'Japan' },
    { year: 2012, name: 'Summer Sonic',                where: 'Japan, without Katsuma' },
    { year: 2013, name: 'Megaport Festival',           where: 'Kaohsiung, Taiwan' },
    { year: 2013, name: 'Ozzfest Japan',               where: 'Chiba' },
    { year: 2014, name: 'Rock am Ring, Rock im Park',  where: 'Germany' },
    { year: 2014, name: 'Download Festival',           where: 'Donington, UK' },
    { year: 2015, name: 'Lunatic Fest',                where: 'Makuhari Messe' },
    { year: 2016, name: 'Slam Dunk Festival',          where: 'UK' },
    { year: 2016, name: 'Vans Warped Tour',            where: 'United States' },
    { year: 2019, name: 'Download Festival',           where: 'Dogtooth Stage' },
    { year: 2020, name: 'Blare Fest',                  where: 'Nagoya, hosts' },
    { year: 2025, name: 'Summer Breeze, Open Flair, Reload', where: 'Germany' },
  ],

  media: [
    ['8AM',                         2009, 'Hajime no Ippo: New Challenger',              'Anime ending'],
    ["We're Not Alone",             2010, 'Rainbow: Nisha Rokub\u014D no Shichinin',     'Anime opening'],
    ['Die Tomorrow',                2010, 'Pro Evolution Soccer 2011',                   'Game soundtrack'],
    ['No Escape',                   2012, 'Resident Evil: Operation Raccoon City',       'Japanese trailer'],
    ['Evolve',                      2015, 'Shinjuku Swan',                               'Film, inspired tracks'],
    ['Feed the Fire',               2017, "King's Game The Animation",                   'Anime opening'],
    ['Revolution',                  2018, 'Mobile Suit Gundam: Extreme Vs. 2',           'Game main theme'],
    ['Mayday',                      2019, 'Fire Force',                                  'Anime opening'],
    ['Remember',                    2021, 'Jujutsu Kaisen',                              'Masato, solo'],
    ['From Today',                  2022, 'Sharp Aquos XLED',                            'TV advert'],
    ['Before I Go',                 2022, 'Sapporo Beer Gold Star',                      'Ad campaign'],
    ['Bloody Power Fame',           2022, 'Bastard!!',                                   'Anime opening'],
    ['Paradise (Kill the Silence)', 2023, 'New Balance MET24',                           'TV advert'],
    ['Help Me Help You',            2023, 'New Emperor of Minami',                       'Opening theme'],
    ['New Dawn',                    2023, 'Bastard!! season 2',                          'Anime opening'],
    ['Vengeance',                   2024, 'Ninja Kamui',                                 'Anime opening'],
  ],

  guests: [
    { song: 'The Maze',  year: 2011, who: 'MAH',            band: 'SiM' },
    { song: 'Runaway',   year: 2015, who: 'Jacoby Shaddix', band: 'Papa Roach' },
    { song: 'Mayday',    year: 2019, who: 'Ryo Kinoshita',  band: 'Crystal Lake' },
    { song: 'POISON',    year: 2026, who: 'Bert McCracken', band: 'The Used' },
    { song: 'SAVIOR',    year: 2026, who: 'Kenta Koie',     band: 'Crossfaith' },
  ],

  // Twenty of them. Masato is on sixteen. The man does not say no.
  features: [
    ['Demise and Kiss',    2011, 'Crossfaith',               'Masato',  'The Dream, the Space'],
    ['Dead Dust',          2013, 'Before My Life Fails',     'Masato',  '(For)Lorn'],
    ['Resurrection',       2013, 'Pay Money to My Pain',     'Masato',  'Gene'],
    ['Free the Monster',   2016, 'AA=',                      'Masato',  'Free the Monster'],
    ['Skyfall',            2017, 'One Ok Rock',              'Masato',  'Non-album single'],
    ['Bumps in the Night', 2017, 'Miyavi',                   'Masato',  'Samurai Sessions Vol. 2'],
    ['Take Me Higher',     2018, 'Duran',                    'Katsuma', 'Face'],
    ['Faint',              2018, 'Crossfaith',               'Masato',  'Ex Machina'],
    ['The Circle',         2018, 'Crystal Lake',             'Masato',  'Non-album single'],
    ['Endless Night',      2020, 'Dreamcatcher',             'Katsuma', 'Non-album single'],
    ['Chemical Heart',     2020, 'Five New Old',             'Masato',  'Music Wardrobe'],
    ['Damage Control',     2021, 'Annalynn',                 'Masato',  'A Conversation With Evil'],
    ['Revive',             2021, 'Duran',                    'Katsuma', 'Kaleido Garden'],
    ['Rumble',             2023, 'Paledusk',                 'Masato',  'Palehell'],
    ['Dunk',               2024, 'The Oral Cigarettes',      'Masato',  'AlterGeist0000'],
    ['All We Have',        2024, "Nothing's Carved in Stone", 'Masato', 'Fire Inside Us'],
    ['Supernatural',       2024, 'Noisemaker',               'Masato',  'Non-album single'],
    ['Kingsblood',         2025, 'Kala',                     'Sugi',    'The Beginning After the End'],
    ['Speak of the Devil', 2026, 'Survive Said the Prophet', 'Masato',  'Fire Force season 3'],
    ['Zion',               2026, 'SiM',                      'Masato',  'Hooman After All'],
  ],

  covers: [
    ['Stuck',       2010, 'Stacie Orrico',     'Nothing Lasts Forever'],
    ['Chandler',    2011, 'Kuroyume',          'Kuroyume tribute album'],
    ['Uninvited',   2017, 'Alanis Morissette', 'Fateless'],
    ['Elevator',    2019, 'ROTTENGRAFFTY',     'Mouse Trap tribute album'],
    ["Don't Speak", 2022, 'No Doubt',          'Nonnegative'],
  ],

  awards: [
    ['2020', 'coldrain',    'Space Shower Music Awards', 'Best Punk/Loud Rock Artist', 'Nominated'],
    ['2021', 'Triple Axe',  'Space Shower Music Awards', 'Best Punk/Loud Rock Artist', 'Won'],
  ],

  trivia: [
    `The cover of Vena is a photograph of one of Masato's tattoos. Another is the sword
     and rose from the Nothing Lasts Forever sleeve, a reminder not to take life for
     granted.`,
    `Masato's first tattoo was a key. His mother disapproved, so he added two owls, her
     favourite animal, one either side, to stand for his two nationalities.`,
    `Before the band took over, Masato was studying law at Nanzan University, hoping to
     become a sports agent. He left after two and a half years.`,
    `Linkin Park's "In The End" is Masato's karaoke song, and he does both vocal parts:
     "I'm not giving anyone the mic. I do it all myself."`,
    `Limp Bizkit's "Nookie", caught on MTV during a family holiday in the US in 1999, is
     the video that made Masato want to do this for a living.`,
    `Blare Fest started life as Blaredown Barriers, the band's own yearly show, before it
     became a two-day festival in 2020.`,
    `The live video for "Paradise (Kill the Silence)" was filmed at the final show at Usen
     Studio Coast in Tokyo, and released in memory of the venue after it closed.`,
    `"Coexist" passed 345,000 views in its first three weeks in 2019, the fastest any
     coldrain video had grown at the time.`,
    `After years of touring abroad every two or three years, the band now want to come
     back annually: "We want to make Europe, especially Germany, like our second home."`,
  ],
};

// Twelve tables, a timeline, a bar chart, fourteen folded tracklists and a
// contents sidebar that watches you scroll. Building all of that on first
// paint, for a page most people will never open: no. It waits until
// someone actually goes there, and then never does it again.
let infoBuilt = false;

function buildInfoPage() {
  if (infoBuilt) { syncToc(); return; }
  infoBuilt = true;
  buildMembers();
  buildInfoTables();
  buildTours();
  buildGuests();
  buildChartRanks();
  buildTimeline();
  buildDisco();
  buildTrivia();
  buildToc();
}

// One table builder for every table on the page. Column types, because I
// wrote six nearly identical table functions first and then had to live
// with myself:
//   title  row header, italic (albums)
//   song   row header, in quotes (songs)
//   name   row header, plain
//   n      number, right aligned, null becomes a dash
//   i      italic cell, unless it is the words "Non-album", which are not a title
//   win    Won or Nominated, coloured, because awards deserve a little theatre
function wikiTable(id, cols, rows, note) {
  const el = document.getElementById(id);
  if (!el) return;

  const cell = (v, t) => {
    if (t === 'n') {
      return v === null
        ? '<td class="n nc">&ndash;</td>'
        : `<td class="n">${escapeHtml(String(v))}</td>`;
    }
    const s = escapeHtml(String(v));
    if (t === 'title') return `<th scope="row"><i>${s}</i></th>`;
    if (t === 'song')  return `<th scope="row">"${s}"</th>`;
    if (t === 'name')  return `<th scope="row">${s}</th>`;
    if (t === 'i')     return /^Non-album/.test(v) ? `<td class="dim">${s}</td>` : `<td><i>${s}</i></td>`;
    if (t === 'win')   return `<td class="res ${v === 'Won' ? 'won' : 'nom'}">${s}</td>`;
    return `<td>${s}</td>`;
  };

  el.innerHTML = `
    <table class="wt">
      ${note ? `<caption>${note}</caption>` : ''}
      <thead><tr>${cols.map(([h, t]) =>
        `<th scope="col"${t === 'n' ? ' class="n"' : ''}>${h}</th>`).join('')}</tr></thead>
      <tbody>${rows.map(r =>
        `<tr>${r.map((v, j) => cell(v, cols[j][1])).join('')}</tr>`).join('')}</tbody>
    </table>`;
}

// The column headers carry HTML on purpose: the chart names go small under
// the country, the way every discography table on the internet does it, and
// the way my patience does not
function buildInfoTables() {
  const chart = (a, b) => `${a}<small>${b}</small>`;
  const dash = '&ndash; did not chart';

  wikiTable('tbl-studio', [
    ['Title', 'title'], ['Released', ''], ['Label', ''],
    [chart('JPN', 'Oricon'), 'n'], [chart('JPN', 'Billboard'), 'n'],
    [chart('AUS', 'Hitseekers'), 'n'], [chart('UK', 'Indie Breakers'), 'n'],
    ['Sales', ''],
  ], INFO.studio, dash);

  wikiTable('tbl-eps', [
    ['Title', 'title'], ['Released', ''], ['Label', ''],
    [chart('JPN', 'Oricon'), 'n'], [chart('JPN', 'Billboard'), 'n'],
  ], INFO.eps, dash);

  wikiTable('tbl-maxi', [
    ['Title', 'song'], ['Year', 'n'], [chart('JPN', 'Oricon'), 'n'], ['Album', 'i'],
  ], INFO.maxi);

  wikiTable('tbl-live', [
    ['Title', 'title'], ['Released', ''], ['Label', ''], ['Formats', ''],
    [chart('JPN', 'Blu-ray'), 'n'], [chart('JPN', 'DVD'), 'n'],
  ], INFO.live, dash);

  wikiTable('tbl-other', [
    ['Title', 'title'], ['Released', ''], ['Label', ''], ['Formats', ''],
    [chart('JPN', 'Downloads'), 'n'],
  ], INFO.rerec);

  wikiTable('tbl-subs', [
    ['Name', 'name'], ['Usual band', ''], ['Role', ''], ['Years', ''],
  ], INFO.subs);

  wikiTable('tbl-media', [
    ['Song', 'song'], ['Year', 'n'], ['Used in', 'i'], ['As', ''],
  ], INFO.media);

  wikiTable('tbl-features', [
    ['Song', 'song'], ['Year', 'n'], ['Artist', ''], ['Member', ''], ['Release', 'i'],
  ], INFO.features);

  wikiTable('tbl-covers', [
    ['Song', 'song'], ['Year', 'n'], ['Original artist', ''], ['Released on', ''],
  ], INFO.covers);

  wikiTable('tbl-awards', [
    ['Year', 'n'], ['Recipient', ''], ['Ceremony', ''], ['Category', ''], ['Result', 'win'],
  ], INFO.awards);
}

function buildMembers() {
  const el = document.getElementById('members');
  if (!el) return;
  el.innerHTML = INFO.members.map((m, i) => `
    <div class="member-card" style="--d:${i * 55}ms">
      <div class="member-tag">${escapeHtml(m.tag)}</div>
      <div class="member-full">${escapeHtml(m.name)}</div>
      <div class="member-role">${escapeHtml(m.role)}</div>
      <p class="member-bio">${escapeHtml(m.bio.replace(/\s+/g, ' ').trim())}</p>
    </div>`).join('');
}

// Two lists and a grid of festival cards. The lists are lists. I did try
// making them a chart. A chart of tour names is a list with extra steps.
function buildTours() {
  const list = (id, rows) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = rows.map(([what, year]) => `
      <li><span class="tour-what">${escapeHtml(what)}</span><span class="tour-year">${escapeHtml(year)}</span></li>`).join('');
  };
  list('tours-head', INFO.toursHead);
  list('tours-support', INFO.toursSupport);

  const fests = document.getElementById('fests');
  if (!fests) return;
  fests.innerHTML = INFO.fests.map((f, i) => `
    <div class="fest" style="--d:${i * 35}ms">
      <span class="fest-year">${f.year}</span>
      <span class="fest-name">${escapeHtml(f.name)}</span>
      <span class="fest-where">${escapeHtml(f.where)}</span>
    </div>`).join('');
}

function buildGuests() {
  const el = document.getElementById('guests');
  if (!el) return;
  el.innerHTML = INFO.guests.map((g, i) => `
    <div class="guest-row" style="--d:${i * 45}ms">
      <span class="guest-year">${g.year}</span>
      <span class="guest-track">"${escapeHtml(g.song)}"</span>
      <span class="guest-who">${escapeHtml(g.who)}</span>
      <span class="guest-band">${escapeHtml(g.band)}</span>
    </div>`).join('');
}

// Chart peaks, as bars, which took three attempts.
//
// Rank runs backwards: 1 is the good one. A linear axis put five albums
// within three pixels of each other, because 7, 8, 9, 10 and 15 all live in
// the same corner. So the scale is log(100/peak): a number one fills the
// track, a hundred is nothing, and all the room goes to the top end where
// the band actually moved.
//
// It reads straight off the studio table now, so the table and the chart
// cannot disagree, which is a sentence I should not have needed to write.
function buildChartRanks() {
  const el = document.getElementById('chart');
  if (!el) return;

  const pos = peak => Math.log(100 / peak) / Math.log(100) * 100;
  const ticks = [100, 50, 25, 10, 5, 1];
  const charted = INFO.studio.filter(r => typeof r[3] === 'number');

  const rows = charted.map((r, i) => `
    <div class="chart-row" style="--d:${i * 55}ms">
      <div class="chart-label">
        <span class="chart-album">${escapeHtml(r[0])}</span>
        <span class="chart-year">${r[1].slice(-4)}</span>
      </div>
      <div class="chart-track">
        <div class="chart-bar" style="width:${pos(r[3]).toFixed(1)}%"></div>
        <span class="chart-val">${r[3]}</span>
      </div>
    </div>`).join('');

  const axis = ticks.map((t, i) => {
    const shift = i === 0 ? '0' : i === ticks.length - 1 ? '-100%' : '-50%';
    return `<span class="chart-tick"
                  style="left:${pos(t).toFixed(1)}%;transform:translateX(${shift})">${t}</span>`;
  }).join('');

  el.innerHTML = rows + `
    <div class="chart-axis">
      <div class="chart-axis-line">${axis}</div>
      <div class="chart-axis-label">Oricon peak</div>
    </div>`;
}

// The timeline. Oldest first, so it reads as a career and not a list.
//
// Two things can appear: a release, and any song carrying its own year,
// which is how the standalone singles get on without pretending to be
// albums. Ties inside a year are broken by the month, which exists on
// exactly the entries that needed it, and I refuse to date the rest just
// for symmetry.
function buildTimeline() {
  const el = document.getElementById('timeline');
  if (!el) return;

  const entries = [];

  CR.albums.filter(a => a.year).forEach(a => {
    const tracks = CR.songs.filter(s => s.albumId === a.id).length;
    entries.push({
      year: a.year, mo: a.mo || 6, img: a.img, title: a.title,
      sub: `${a.kind} &middot; ${tracks} track${tracks === 1 ? '' : 's'}`,
      single: false,
    });
  });

  CR.songs.filter(s => s.year).forEach(s => {
    entries.push({
      year: s.year, mo: s.mo || 6, img: s.img, title: s.title,
      sub: s.kind || 'Single', single: true,
    });
  });

  // And the releases the sorter does not know about, which are still releases
  INFO.offRoster.forEach(r => {
    entries.push({
      year: r.year, mo: r.mo, img: r.img, title: r.title,
      sub: `${r.kind} &middot; ${r.tracks} track${r.tracks === 1 ? '' : 's'}`,
      single: false,
    });
  });

  entries.sort((a, b) => a.year - b.year || a.mo - b.mo);

  el.innerHTML = entries.map((e, i) => `
    <div class="tl-item${e.single ? ' single' : ''}" style="--d:${i * 40}ms">
      <div class="tl-year">${e.year}</div>
      <div class="tl-marker"></div>
      <div class="tl-body">
        <div class="tl-art" style="background-image:url('${e.img}')"></div>
        <div class="tl-meta">
          <div class="tl-title">${escapeHtml(e.title)}</div>
          <div class="tl-sub">${e.sub}</div>
        </div>
      </div>
    </div>`).join('');
}

// Every release, every track, folded away until wanted. Generated from the
// same array the sorter runs on, because maintaining a second copy of a
// discography is a promise nobody in history has kept past the third week.
function buildDisco() {
  const el = document.getElementById('disco');
  if (!el) return;

  el.innerHTML = CR.albums.map(a => {
    const songs = CR.songs.filter(s => s.albumId === a.id);
    const tag = a.year ? `${a.kind} &middot; ${a.year}` : a.kind;
    const rows = songs.map((s, i) => `
      <li><span class="disco-n">${i + 1}</span>${escapeHtml(s.title)}</li>`).join('');

    return `
      <details class="disco-item">
        <summary>
          <span class="disco-art" style="background-image:url('${a.img}')"></span>
          <span class="disco-meta">
            <span class="disco-title">${escapeHtml(a.title)}</span>
            <span class="disco-tag">${tag} &middot; ${songs.length} track${songs.length === 1 ? '' : 's'}</span>
          </span>
          <span class="disco-chev">&rsaquo;</span>
        </summary>
        <ol class="disco-tracks">${rows}</ol>
      </details>`;
  }).join('');
}

function buildTrivia() {
  const el = document.getElementById('trivia');
  if (!el) return;
  el.innerHTML = INFO.trivia.map((t, i) => `
    <div class="trivia-card" style="--d:${i * 45}ms">
      <span class="trivia-n">${String(i + 1).padStart(2, '0')}</span>
      <p>${escapeHtml(t.replace(/\s+/g, ' ').trim())}</p>
    </div>`).join('');
}

// Contents
// Built from the headings themselves, so adding a section to the page adds
// it here too. The previous contents box was typed out by hand and was
// wrong within a day, which is roughly my track record with lists.
const toc = { heads: [], links: new Map(), current: null, ticking: false };

function buildToc() {
  const body = document.getElementById('wiki-body');
  const list = document.getElementById('toc-list');
  if (!body || !list) return;

  const heads = [...body.querySelectorAll('h3[id], h4[id]')];
  const tree = [];
  heads.forEach(h => {
    if (h.tagName === 'H3') tree.push({ h, kids: [] });
    else if (tree.length) tree[tree.length - 1].kids.push(h);
  });

  const link = (h, num, sub) => `
    <a href="#${h.id}" data-target="${h.id}"${sub ? ' class="sub"' : ''}>
      <span class="toc-n">${num}</span><span class="toc-t">${h.innerHTML}</span>
    </a>`;

  list.innerHTML =
    `<li>${link({ id: 'i-top', innerHTML: 'Beginning' }, '', false)}</li>` +
    tree.map((s, i) => `
      <li>${link(s.h, i + 1)}${s.kids.length
        ? `<ol>${s.kids.map((k, j) => `<li>${link(k, `${i + 1}.${j + 1}`, true)}</li>`).join('')}</ol>`
        : ''}</li>`).join('');

  toc.heads = [document.getElementById('i-top'), ...heads].filter(Boolean);
  toc.links = new Map([...list.querySelectorAll('a')].map(a => [a.dataset.target, a]));

  document.getElementById('view-info').addEventListener('click', infoClick);
  document.getElementById('toc-bar').addEventListener('click', () => setTocOpen());
  window.addEventListener('scroll', onInfoScroll, { passive: true });
  window.addEventListener('resize', onInfoScroll, { passive: true });
  syncToc();
}

function setTocOpen(open) {
  const nav = document.getElementById('toc');
  const bar = document.getElementById('toc-bar');
  if (!nav || !bar) return;
  const next = open === undefined ? !nav.classList.contains('open') : open;
  nav.classList.toggle('open', next);
  bar.setAttribute('aria-expanded', String(next));
}

// Scroll events arrive at a hundred and twenty a second on a nice monitor.
// This does its work at most once a frame, which is still more attention
// than most of my commits got.
function onInfoScroll() {
  if (currentView !== 'info' || toc.ticking) return;
  toc.ticking = true;
  requestAnimationFrame(() => { toc.ticking = false; syncToc(); });
}

// The last heading above the line wins. The line sits a little below the
// sticky bits, because a heading that is technically on screen behind the
// nav bar is not a heading anyone is reading.
function syncToc() {
  if (!toc.heads.length) return;
  const nav = document.getElementById('toc');
  const line = (nav ? nav.getBoundingClientRect().bottom : 0) + 40;
  const deskLine = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) + 90;
  const cut = window.matchMedia('(min-width: 1000px)').matches ? deskLine : Math.max(line, deskLine);

  let id = toc.heads[0].id;
  for (const h of toc.heads) {
    if (h.getBoundingClientRect().top <= cut) id = h.id;
    else break;
  }
  if (id === toc.current) return;
  toc.current = id;

  toc.links.forEach(a => a.classList.remove('on', 'on-parent'));
  const a = toc.links.get(id);
  if (!a) return;
  a.classList.add('on');

  // A subsection lights its parent too, dimmer, so the sidebar still says
  // "History" while you are three years deep in it
  const parentLi = a.classList.contains('sub') ? a.closest('ol').closest('li') : null;
  if (parentLi) parentLi.querySelector(':scope > a').classList.add('on-parent');

  const now = document.getElementById('toc-now');
  if (now) now.textContent = id === 'i-top' ? '' : a.querySelector('.toc-t').textContent;

  // Keep the lit link in view when the sidebar itself has to scroll
  const list = document.getElementById('toc-list');
  if (list && list.scrollHeight > list.clientHeight + 4) {
    const top = a.offsetTop - list.clientHeight / 2;
    list.scrollTo({ top: Math.max(0, top) });
  }
}

// In-page links, done by hand. Letting the browser do it would write
// #i-history into the address bar, and then the next person to copy a share
// link from that tab sends their friend to a heading instead of a profile.
function infoClick(e) {
  const nav = document.getElementById('toc');
  const a = e.target.closest('a[href^="#"]');

  if (!a) {
    // tapping anywhere outside an open contents panel closes it, like
    // every dropdown on earth except the first two versions of this one
    if (nav && nav.classList.contains('open') && !nav.contains(e.target)) setTocOpen(false);
    return;
  }

  const target = document.getElementById(a.getAttribute('href').slice(1));
  if (!target) return;
  e.preventDefault();
  setTocOpen(false);

  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'start' });

  // Footnotes flash when you land on them, or you jump to the bottom of a
  // long page and have to hunt for which of ten lines you came for
  if (target.matches('.ref-list li')) {
    target.classList.remove('flash');
    void target.offsetWidth;
    target.classList.add('flash');
  }
}

function handleKey(e) {
  if (e.key === 'Escape' && isControlsOpen()) { toggleControls(); return; }
  if (currentView !== 'sorter' || !sorter || sorter.status !== 1 || isControlsOpen()) return;

  if (devTrackKey(e)) { devRandomiseSort(); return; }

  const handled =
    e.key === 'ArrowLeft' || e.key === 'ArrowRight' ||
    ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'y'));
  // You just used one. You know. The tip can stop now.
  if (handled) profile = Profile.flagTip(profile, 'usedKeys');

  if (e.key === 'ArrowLeft')                        { sorterChoose(-1); e.preventDefault(); }
  else if (e.key === 'ArrowRight')                  { sorterChoose(1);  e.preventDefault(); }
  else if ((e.ctrlKey||e.metaKey) && e.key === 'z') { sorterUndo();     e.preventDefault(); }
  else if ((e.ctrlKey||e.metaKey) && e.key === 'y') { sorterRedo();     e.preventDefault(); }
}

function renderProfileBadge() {
  const el = document.getElementById('profile-badge');
  if (el) el.textContent = profile.name || 'Profile';
}

function isControlsOpen() {
  const modal = document.getElementById('controls-modal');
  return !!modal && modal.classList.contains('open');
}

function toggleControls() {
  document.getElementById('controls-modal').classList.toggle('open');
}

// Known results
// Otherwise known as "the reason you do not have to answer this again".

// Every verdict you have ever handed down, arranged so the sorter can stop
// asking you things you have already answered.
//
// Wins get followed through the graph, so A over B and B over C quietly
// settles A over C without troubling you. This is the whole optimized sort
// in one function, and it is the difference between a second run taking
// seven hundred clicks and taking eighty.
//
// Draws are gone from the site, but old profiles are full of them, so the
// grouping stays: if you once called A and B level and later put B over C,
// that still tells us A beats C. What it will not do any more is hand you
// back a draw as an answer.
//
// It does assume your taste is transitive. It is not. Nobody's is. But the
// alternative is asking you the same question forever, so.
function buildKnownGraph(mode) {
  const map = Profile.getComparisons(profile, mode);
  const parent = new Map();

  function find(t) {
    if (!parent.has(t)) parent.set(t, t);
    let root = t;
    while (parent.get(root) !== root) root = parent.get(root);
    while (parent.get(t) !== root) { const next = parent.get(t); parent.set(t, root); t = next; }
    return root;
  }
  function union(a, b) {
    const ra = find(a), rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  }

  const wins = [];
  for (const a in map) {
    for (const b in map[a]) {
      const r = map[a][b];
      find(a); find(b);
      if (r === 'tie')       union(a, b);
      else if (r === 'win')  wins.push([a, b]);
      else if (r === 'lose') wins.push([b, a]);
    }
  }

  // Edges between tie groups, not individual songs, or the whole thing
  // collapses the first time somebody calls a draw
  const edges = new Map();
  for (const [winner, loser] of wins) {
    const gw = find(winner), gl = find(loser);
    if (gw === gl) continue;   // contradicts a tie, leave it alone
    if (!edges.has(gw)) edges.set(gw, new Set());
    edges.get(gw).add(gl);
  }

  function reaches(from, to) {
    const seen = new Set([from]);
    const queue = [from];
    for (let i = 0; i < queue.length; i++) {
      const next = edges.get(queue[i]);
      if (!next) continue;
      for (const n of next) {
        if (n === to) return true;
        if (!seen.has(n)) { seen.add(n); queue.push(n); }
      }
    }
    return false;
  }

  return {
    // -1, 1, or null when we honestly have no idea, which is the answer
    // that actually matters because it is the one that asks you
    query(a, b) {
      if (!parent.has(a) || !parent.has(b)) return null;
      const ga = find(a), gb = find(b);
      if (ga === gb) return null;   // two halves of an old draw: ask again
      if (reaches(ga, gb)) return -1;
      if (reaches(gb, ga)) return 1;
      return null;
    },
  };
}

// Tips
// The rules live in tips.js. This is just the plumbing that puts one on a
// screen and takes it away again.

function tipHtml(tip) {
  return `
    <div class="tip" data-tip-id="${tip.id}">
      <span class="tip-text">${tip.text}</span>
      <button class="tip-x" onclick="dismissTip('${tip.id}')" aria-label="Dismiss tip">&times;</button>
    </div>`;
}

// For screens rendered once and left alone
function tipFor(where, ctx) {
  const tip = Tips.pick(profile, where, ctx);
  return tip ? tipHtml(tip) : '';
}

// For screens where the right tip changes under you. The DOM is the source
// of truth here, deliberately: an earlier version tracked it in a variable,
// the variable drifted out of step with the DOM, and the tip re-animated on
// every single pick like a fire alarm.
function renderTipSlot(slotId, where, ctx) {
  const slot = document.getElementById(slotId);
  if (!slot) return;
  const shown = slot.firstElementChild ? slot.firstElementChild.dataset.tipId : '';
  const tip = Tips.pick(profile, where, ctx);
  const next = tip ? tip.id : '';
  if (shown === next) return;
  slot.innerHTML = tip ? tipHtml(tip) : '';
}

// Dismissing leaves the slot empty rather than immediately queueing the
// next tip. Swatting one away and having another appear instantly would be
// actively hostile.
function dismissTip(id) {
  profile = Profile.dismissTip(profile, id);
  document.querySelectorAll(`[data-tip-id="${id}"]`).forEach(el => el.remove());
}

// rank:false groups hold songs but are not releases, so they never turn up
// in an album ranking. Currently just Singles.
function rankableAlbums() {
  return CR.albums.filter(a => a.rank !== false);
}

// Is there a real keyboard here, or am I about to tell a phone about Ctrl+Z
function hasFinePointer() {
  return window.matchMedia && window.matchMedia('(hover:hover) and (pointer:fine)').matches;
}

// Dev shortcuts
//
// Because testing the end-of-run screen by correctly naming a hundred and
// eighteen songs, by hand, every time, is not a life.
//
// Neither of these is mentioned in the UI, the controls list or the readme.
// They are also both sitting in a plaintext file on a static site, so let
// us be honest with each other: undocumented, not secret. If someone digs
// them out of the source they have earned it.
const DEV_FILL_WORD = 'crdev';   // type it into the guessing box
const DEV_SORT_KEY  = 'r';       // press it this many times mid-sort
const DEV_SORT_HITS = 5;

let devKeyStreak = 0;

// Fills the board and drops you on the finish card. Deliberately does not
// touch your personal best, because leaving a fake 118 on someone's profile
// is the kind of thing you discover six months later.
function devFillGuesses(raw) {
  if (SongGuess.squash(raw) !== DEV_FILL_WORD) return false;
  const remaining = guessSongs().map(s => s.title).filter(t => !guessFound.has(t));
  remaining.forEach(t => markSongFound(t, true));
  updateGuessTotals();
  finishGuessRun();
  return true;
}

// Answers the rest of the sort by coin flip and dumps you on the result.
// The picks are pointedly NOT written to the comparison history: seven
// hundred random verdicts would poison the all-time album ranking and the
// optimized sort permanently, and there is no undo for that.
function devRandomiseSort() {
  let answered = 0;
  while (sorter.status === 1) {
    const roll = Math.random();
    const choice = roll < 0.45 ? -1 : roll < 0.9 ? 1 : 0;
    recordChoice(choice);
    sorter.choose(choice);
    answered++;
  }
  autosave();
  showToast(`Randomised ${answered} picks.`);
  renderSorterResult();
}

// Counts repeats of one key and forgets everything the instant you press
// something else, so nobody triggers this by leaning on a keyboard
function devTrackKey(e) {
  if (e.key !== DEV_SORT_KEY || e.ctrlKey || e.metaKey || e.altKey) {
    devKeyStreak = 0;
    return false;
  }
  devKeyStreak++;
  if (devKeyStreak < DEV_SORT_HITS) return false;
  devKeyStreak = 0;
  return true;
}

// Sorter setup
// Pick a mode, pick your releases, get warned about what you are agreeing
// to, press the button, regret it around pick 200.

function renderSorterSetup() {
  const el = document.getElementById('sorter-content');
  const hasSongSession  = profile.songSort  && profile.songSort.choices;
  const hasAlbumSession = profile.albumSort && profile.albumSort.choices;
  const hasSongResult   = profile.songSort  && profile.songSort.result;
  const hasAlbumResult  = profile.albumSort && profile.albumSort.result;

  // Offer the unfinished one back before letting anyone start another
  let resumeHtml = '';
  if (hasSongSession || hasAlbumSession) {
    const which = hasSongSession ? 'song' : 'album';
    const saved = new Date((hasSongSession ? profile.songSort : profile.albumSort).savedAt);
    const when  = saved.toLocaleDateString(undefined, { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
    resumeHtml = `
      <div class="resume-banner">
        <div class="resume-text">
          <span class="resume-icon">&#8987;</span>
          <span>Unfinished <strong>${which}</strong> sort from ${when}</span>
        </div>
        <button class="resume-btn" onclick="resumeSort('${which}s')">Resume &rarr;</button>
      </div>`;
  }

  let prevResultHtml = '';
  if (hasSongResult) {
    prevResultHtml += `<button type="button" class="prev-result-banner" onclick="showSavedResult('songs')">
      \u{1F3C6} Your last song ranking</button>`;
  }
  if (hasAlbumResult) {
    prevResultHtml += `<button type="button" class="prev-result-banner" onclick="showSavedResult('albums')">
      \u{1F3C6} Your last album ranking</button>`;
  }

  const albumCheckboxes = CR.albums.map(a => `
    <label class="album-check">
      <input type="checkbox" class="sr-only album-filter-cb" value="${a.id}" checked>
      <span class="check-pill" style="background-image:url('${a.img}')">
        <span class="check-pill-label">${escapeHtml(a.title)}</span>
        <span class="check-pill-year">${a.year || a.kind}</span>
      </span>
    </label>`).join('');

  const sorterTip = tipFor('sorter', {
    pairs:     countComparisons(),
    optimized: useOptimized,
  });

  el.innerHTML = `
    <div class="sorter-setup">
      <div class="page-head">
        <h2 class="page-title">Rank</h2>
        <p class="page-sub">Pick a winner from each pair. The picks add up to a full ranking.</p>
      </div>

      ${resumeHtml}
      ${prevResultHtml}

      <div class="mode-toggle">
        <button class="mode-btn ${sorterMode==='songs'?'active':''}"  onclick="setSorterMode('songs')">Songs</button>
        <button class="mode-btn ${sorterMode==='albums'?'active':''}" onclick="setSorterMode('albums')">Albums</button>
      </div>

      <label class="optimized-toggle">
        <input type="checkbox" ${useOptimized ? 'checked' : ''} onchange="useOptimized=this.checked">
        <span>Optimized sort <span class="dimmed">(fills in pairs your past picks already settle)</span></span>
      </label>

      ${sorterTip}

      <div id="song-filter-section">
        <div class="filter-bar">
          <span class="filter-label">Albums to include</span>
          <button class="select-all-btn" id="select-all-btn" onclick="toggleSelectAll()">Deselect All</button>
        </div>
        <div class="album-filters">${albumCheckboxes}</div>
        <p class="filter-hint" id="filter-hint"></p>
      </div>

      <p class="sort-warning" id="sort-warning" style="display:none"></p>

      <button class="cta-btn" onclick="startSorter()">Start Sorting</button>
    </div>`;

  document.querySelectorAll('.album-filter-cb').forEach(cb =>
    cb.addEventListener('change', updateFilterHint));

  setSorterMode(sorterMode);
  updateFilterHint();
}

function setSorterMode(mode) {
  sorterMode = mode;
  document.querySelectorAll('.mode-btn').forEach((b, i) =>
    b.classList.toggle('active', (i === 0) === (mode === 'songs')));
  const sec = document.getElementById('song-filter-section');
  if (sec) sec.style.display = mode === 'songs' ? '' : 'none';
  updateFilterHint();
}

function toggleSelectAll() {
  const cbs = document.querySelectorAll('.album-filter-cb');
  const allChecked = [...cbs].every(c => c.checked);
  cbs.forEach(c => c.checked = !allChecked);
  updateFilterHint();
}

function updateSelectAllBtn() {
  const cbs = document.querySelectorAll('.album-filter-cb');
  const btn = document.getElementById('select-all-btn');
  if (!btn) return;
  btn.textContent = [...cbs].every(c => c.checked) ? 'Deselect All' : 'Select All';
}

const LONG_SORT_THRESHOLD = 40;

function updateFilterHint() {
  updateSelectAllBtn();
  const hint = document.getElementById('filter-hint');
  if (!hint) return;
  let count;
  if (sorterMode === 'albums') {
    count = rankableAlbums().length;
    hint.textContent = `All ${count} albums and EPs.`;
  } else {
    const checked = getCheckedAlbums();
    count = CR.songs.filter(s => checked.includes(s.albumId)).length;
    hint.textContent = count > 0 ? `${count} songs selected.` : 'Select at least one album.';
  }
  updateSortWarning(count);
}

// n log n minus n plus one, roughly. Exists so nobody wanders into a seven
// hundred click marathon thinking it will take five minutes. It will not
// take five minutes.
function updateSortWarning(count) {
  const warn = document.getElementById('sort-warning');
  if (!warn) return;
  if (count <= LONG_SORT_THRESHOLD) { warn.style.display = 'none'; return; }
  const estimate = Math.max(count - 1, Math.round(count * Math.log2(count) - count + 1));
  const noun = sorterMode === 'albums' ? 'albums' : 'songs';
  warn.textContent = `${count} ${noun} works out to roughly ${estimate} comparisons.`;
  warn.style.display = '';
}

function getCheckedAlbums() {
  return [...document.querySelectorAll('.album-filter-cb:checked')].map(c => c.value);
}

// Optimized sort bookkeeping
let knownGraph = null;
let autoIndices = new Set();   // undo positions the optimizer answered for us
let autoBase = 0;              // carried over when a session is resumed

// Every answer this run, in order. This tiny array is the entire saved
// session and the entire session half of a seed, because the sorter is
// deterministic and replaying answers rebuilds it exactly.
//
// It has to stay in lockstep with the undo stack: entry i is the answer
// that produced snapshot i+1, so slicing at undoIndex gives you the state
// you are actually looking at rather than the one you undid away from. I
// verified that invariant against a Python port of the sorter under random
// undos and redos, because I did not trust myself, correctly.
let sorterChoices = [];
let sorterItemSids = [];

function recordChoice(choice) {
  sorterChoices.length = sorter.undoIndex;   // drop anything you undid past
  sorterChoices[sorter.undoIndex] = choice;
}

function startSorter() {
  let source;
  if (sorterMode === 'albums') {
    source = rankableAlbums();
  } else {
    const checked = getCheckedAlbums();
    source = CR.songs.filter(s => checked.includes(s.albumId));
    if (source.length < 2) { showToast('Select at least 2 songs.', 'error'); return; }
  }
  const items = source.map(x => ({ title: x.title, img: x.img }));
  sorterItemSids = source.map(x => x.sid);

  // Frozen before this run records anything, so undo does not start
  // skipping over picks you made thirty seconds ago
  knownGraph = useOptimized ? buildKnownGraph(sorterMode) : null;
  autoIndices = new Set();
  autoBase = 0;
  sorterChoices = [];

  profile = Profile.clearSort(profile, sorterMode);
  sorter = new MergeSorter(items);
  sorter.init(items);

  const filled = autoAnswerKnown();
  autosave();
  if (filled > 0) showToast(`Filled in ${filled} pair${filled === 1 ? '' : 's'} from your history.`, 'good');
  renderSorterBattle();
}

// Burn through every pair we can already answer until we hit one that
// genuinely needs a human. This is the good bit.
function autoAnswerKnown() {
  if (!knownGraph) return 0;
  let filled = 0;
  while (sorter.status === 1) {
    const cmp = sorter.getComparison();
    if (!cmp) break;
    const known = knownGraph.query(cmp.left.title, cmp.right.title);
    if (known === null) break;
    autoIndices.add(sorter.undoIndex);
    recordChoice(known);
    sorter.choose(known);
    filled++;
  }
  return filled;
}

function autoAnsweredCount() {
  if (!sorter) return autoBase;
  let n = autoBase;
  autoIndices.forEach(i => { if (i < sorter.undoIndex) n++; });
  return n;
}

// Stored sids back into real items, in the saved order, because the order
// is load-bearing for replay
function itemsFromSids(mode, sids) {
  const byId = new Map((mode === 'albums' ? CR.albums : CR.songs).map(x => [x.sid, x]));
  return (sids || []).map(sid => byId.get(sid)).filter(Boolean);
}

function resumeSort(mode) {
  sorterMode = mode === 'songs' ? 'songs' : 'albums';
  const session = mode === 'songs' ? profile.songSort : profile.albumSort;
  if (!session || !session.choices) { renderSorterSetup(); return; }

  const source = itemsFromSids(sorterMode, session.items);
  if (source.length < 2) {
    showToast('That sort refers to songs that are no longer here.', 'error');
    profile = Profile.clearSort(profile, sorterMode);
    renderSorterSetup();
    return;
  }

  profile = Profile.flagTip(profile, 'resumedSort');
  useOptimized = !!session.optimized;
  knownGraph = useOptimized ? buildKnownGraph(sorterMode) : null;
  autoIndices = new Set();
  autoBase = session.autoAnswered || 0;
  sorterItemSids = source.map(x => x.sid);
  sorterChoices = session.choices.slice();

  const items = source.map(x => ({ title: x.title, img: x.img }));
  sorter = new MergeSorter(items);
  sorter.init(items);
  sorter.replay(sorterChoices);

  if (sorter.status === 2) { renderSorterResult(); return; }
  renderSorterBattle();
}

function autosave() {
  if (!sorter) return;
  profile = Profile.saveSortSession(profile, sorterMode, {
    items:        sorterItemSids,
    choices:      sorterChoices.slice(0, sorter.undoIndex),
    optimized:    useOptimized,
    autoAnswered: autoAnsweredCount(),
  });
}

// Sorter battle
// Two sleeves and an impossible question, several hundred times.

function renderSorterBattle() {
  if (sorter.status === 2) { renderSorterResult(); return; }
  const cmp = sorter.getComparison();
  const el  = document.getElementById('sorter-content');
  const filled = autoAnsweredCount();

  el.innerHTML = `
    <div class="battle-header">
      <div class="battle-stat">Battle <strong id="s-count">${sorter.count}</strong></div>
      <div class="progress-bar-wrap">
        <div class="progress-bar-fill" id="s-progress" style="width:${sorter.progress}%"></div>
      </div>
      <div class="battle-stat"><strong id="s-pct">${sorter.progress}</strong>%</div>
    </div>
    <div class="battle-skips" id="s-skips" ${filled ? '' : 'hidden'}>
      <span id="s-skips-n">${filled}</span> answered from your history
    </div>
    <div class="battle-arena">
      <button class="battle-card" id="card-left" onclick="sorterChoose(-1)">
        <div class="battle-card-img" style="background-image:url('${cmp.left.img}')"></div>
        <div class="battle-card-name">${escapeHtml(cmp.left.title)}</div>
      </button>
      <div class="battle-middle">
        <div class="undo-redo">
          <button class="icon-btn" id="undo-btn" onclick="sorterUndo()"
            ${sorter.canUndo?'':'disabled'} title="Undo (Ctrl+Z)">&#8617;</button>
          <button class="icon-btn" id="redo-btn" onclick="sorterRedo()"
            ${sorter.canRedo?'':'disabled'} title="Redo (Ctrl+Y)">&#8618;</button>
        </div>
        <div class="key-hints">&larr; / &rarr;</div>
      </div>
      <button class="battle-card" id="card-right" onclick="sorterChoose(1)">
        <div class="battle-card-img" style="background-image:url('${cmp.right.img}')"></div>
        <div class="battle-card-name">${escapeHtml(cmp.right.title)}</div>
      </button>
    </div>
    <div id="battle-tip-slot"></div>
    <button class="ghost-btn" onclick="renderSorterSetup()">Back</button>`;

  refreshBattleTip();
}

function sorterChoose(choice) {
  const cmp = sorter.getComparison();
  flashPicked(choice);
  if (cmp) profile = Profile.recordComparison(profile, sorterMode, cmp.left.title, cmp.right.title, choice);
  recordChoice(choice);
  sorter.choose(choice);
  autoAnswerKnown();
  autosave();
  if (sorter.status === 2) { renderSorterResult(); return; }
  updateBattleUI();
}

// Flash whichever card won. Both, for a draw. The void offsetWidth is a
// reflow forced on purpose so the animation restarts, which looks like a
// typo and is not, so please stop deleting it.
function flashPicked(choice) {
  const left  = document.getElementById('card-left');
  const right = document.getElementById('card-right');
  const cards = choice === -1 ? [left] : choice === 1 ? [right] : [left, right];
  cards.forEach(c => {
    if (!c) return;
    c.classList.remove('picked');
    void c.offsetWidth;
    c.classList.add('picked');
  });
}

function updateBattleUI() {
  const cmp = sorter.getComparison();
  const left  = document.getElementById('card-left');
  const right = document.getElementById('card-right');
  if (!left || !cmp) return;

  left.classList.add('flip'); right.classList.add('flip');
  setTimeout(() => {
    left.querySelector('.battle-card-img').style.backgroundImage  = `url('${cmp.left.img}')`;
    left.querySelector('.battle-card-name').textContent           = cmp.left.title;
    right.querySelector('.battle-card-img').style.backgroundImage = `url('${cmp.right.img}')`;
    right.querySelector('.battle-card-name').textContent          = cmp.right.title;
    left.classList.remove('flip'); right.classList.remove('flip');
  }, 180);

  bumpStat('s-count', sorter.count);
  bumpStat('s-pct', sorter.progress);
  document.getElementById('s-progress').style.width = sorter.progress + '%';
  document.getElementById('undo-btn').disabled = !sorter.canUndo;
  document.getElementById('redo-btn').disabled = !sorter.canRedo;

  const filled = autoAnsweredCount();
  const skips = document.getElementById('s-skips');
  if (skips) {
    skips.hidden = filled === 0;
    document.getElementById('s-skips-n').textContent = filled;
  }

  refreshBattleTip();
}

function refreshBattleTip() {
  renderTipSlot('battle-tip-slot', 'battle', {
    fine:        hasFinePointer(),
    usedKeys:    Profile.tipFlag(profile, 'usedKeys'),
    resumedSort: Profile.tipFlag(profile, 'resumedSort'),
    battles:     sorter ? sorter.count : 0,
  });
}

// Bump a number so the eye catches that it moved
function bumpStat(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = value;
  el.classList.remove('bump');
  void el.offsetWidth;
  el.classList.add('bump');
}

// Undo and redo skate over anything the optimizer answered, so you only
// ever land back on a pair you actually decided. Landing on a machine's
// pick and being asked to reconsider it would be a fun way to lose an
// afternoon.
function sorterUndo() {
  if (!sorter.undo()) return;
  while (sorter.canUndo && autoIndices.has(sorter.undoIndex)) sorter.undo();
  autosave();
  updateBattleUI();
}

function sorterRedo() {
  if (!sorter.redo()) return;
  while (sorter.canRedo && autoIndices.has(sorter.undoIndex)) sorter.redo();
  autosave();
  if (sorter.status === 2) { renderSorterResult(); return; }
  updateBattleUI();
}

let lastResults = [];   // whatever the result screen is currently showing

function renderSorterResult(results) {
  results = results || sorter.getResult();
  lastResults = results;
  const el = document.getElementById('sorter-content');

  profile = Profile.saveSortResult(profile, sorterMode, results.map(r => ({ rank: r.rank, title: r.item.title })));

  const medals = ['\u{1F947}', '\u{1F948}', '\u{1F949}'];
  const podium = results.slice(0, 3).map((r, i) => `
    <div class="podium-card podium-${i+1}">
      <div class="podium-img" style="background-image:url('${r.item.img}')"></div>
      <div class="podium-medal">${medals[i]}</div>
      <div class="podium-title">${escapeHtml(r.item.title)}</div>
    </div>`).join('');

  const rows = results.slice(3).map((r, i) =>
    `<tr style="--d:${Math.min(i, 25) * 22}ms">
       <td class="rank-num">${r.rank}</td><td>${escapeHtml(r.item.title)}</td>
     </tr>`).join('');

  const copyText = results.map(r => `${r.rank}. ${r.item.title}`).join('\n');

  el.innerHTML = `
    <div class="result-wrap">
      <div class="page-head">
        <h2 class="page-title">Your Ranking</h2>
      </div>
      <div class="podium">${podium}</div>
      ${rows ? `<table class="rank-table"><tbody>${rows}</tbody></table>` : ''}
      <div class="result-actions">
        <button class="cta-btn" onclick="showRankCard()">Share Card</button>
        <button class="ghost-btn" onclick="copyRanking(\`${escapeTick(copyText)}\`)">Copy List</button>
        <button class="ghost-btn" onclick="renderSorterSetup()">Sort Again</button>
      </div>
      ${tipFor('result', { optimized: useOptimized, pairs: countComparisons() })}
    </div>`;
}

// Did everything you just ranked come off one record? If so the card can
// be about that record instead of pretending to be a discography survey.
function soleAlbumOf(results) {
  if (sorterMode !== 'songs' || !results.length) return null;
  const byTitle = new Map(CR.songs.map(s => [s.title, s.albumId]));
  const ids = new Set(results.map(r => byTitle.get(r.item.title)));
  if (ids.size !== 1) return null;
  return CR.albums.find(a => a.id === [...ids][0]) || null;
}

// ---------- Share cards ----------
//
// Every card is described once, as plain data, and then drawn twice: as HTML
// for the screen, and onto a canvas for Save Image. The first version only
// had the HTML, which meant "sharing" was a polite way of saying "take a
// screenshot and crop out the nav bar with your thumb".
//
// The model is the single source of truth. If you are tempted to tweak the
// HTML card without touching the model, the downloaded PNG will quietly
// disagree with the screen and someone will post both side by side.

// How much of a song ranking goes on the card. Twenty rows is about two
// phone screens of card, which is fine: people scroll a share card, they
// just will not scroll a list of 118.
const CARD_ROWS = 20;

let cardModelCurrent = null;   // whatever card is on screen right now
let cardBusy = false;          // double-tapping Save should not draw it twice

function rankCardModel() {
  const album = soleAlbumOf(lastResults);
  if (album) {
    return {
      glow: album.img, cover: album.img, kicker: 'My top', title: album.title,
      tag: album.year ? `${album.kind} \u00B7 ${album.year}` : album.kind,
      tracks: lastResults.map(r => ({ rank: r.rank, title: r.item.title, hi: r.rank === 1 })),
    };
  }
  // Songs get a top twenty, because ten was answering "what are your
  // favourites" with a shrug and half a list. Albums get the lot, because
  // fourteen fits and cutting it short lops off the half everyone argues
  // about.
  const albumsMode = sorterMode === 'albums';
  const shown = albumsMode ? lastResults : lastResults.slice(0, CARD_ROWS);
  return {
    glow: lastResults[0].item.img, kicker: 'My top',
    title: albumsMode ? 'Albums' : 'Songs',
    rows: shown.map(r => ({ rank: r.rank, title: r.item.title, img: r.item.img, hi: r.rank <= 3 })),
  };
}

// The on-screen card. No footer: the tagline strip at the bottom is gone,
// it was a date and a sentence nobody read, sat exactly where thumbs crop.
function cardHtml(m) {
  let body = '';
  if (m.cover) body += `<div class="rc-cover" style="background-image:url('${m.cover}')"></div>`;
  body += `<p class="rc-kicker">${escapeHtml(m.kicker)}</p>`;

  if (m.score) {
    body += `
      <div class="rc-score">${m.score.found}<span>/${m.score.total}</span></div>
      <p class="rc-verdict">${escapeHtml(m.score.verdict)}</p>`;
  } else {
    body += `<h3 class="rc-title">${escapeHtml(m.title)}</h3>`;
    if (m.tag) body += `<p class="rc-tag">${escapeHtml(m.tag)}</p>`;
  }
  body += '<div class="rc-rule"></div>';

  if (m.rows) {
    body += `<div class="rc-list">${m.rows.map((r, i) => `
      <div class="rc-row${r.hi ? ' hi' : ''}" style="--d:${i * 45}ms">
        <span class="rc-rank">${r.rank}</span>
        <span class="rc-art" style="background-image:url('${r.img}')"></span>
        <span class="rc-name">${escapeHtml(r.title)}</span>
      </div>`).join('')}</div>`;
  }

  if (m.tracks) {
    // Column-first, so ranks read 1 to 8 down the left and 9 onwards down the
    // right. The previous row-first grid had 1 and 2 side by side, which made
    // a ranking look like a seating plan.
    const two = m.tracks.length > 8;
    const perCol = two ? Math.ceil(m.tracks.length / 2) : m.tracks.length;
    body += `<ol class="rc-tracks${two ? ' two' : ''}" style="grid-template-rows:repeat(${perCol},auto)">
      ${m.tracks.map((t, i) => `
        <li class="rc-track${t.hi ? ' hi' : ''}" style="--d:${i * 30}ms">
          <span class="rc-rank">${t.rank}</span>
          <span class="rc-name">${escapeHtml(t.title)}</span>
        </li>`).join('')}</ol>`;
  }

  if (m.score) {
    body += `
      <div class="rc-stats">${m.score.stats.map(st => `
        <div><span class="rc-stat-v">${escapeHtml(st.v)}${st.of ? `<em>${st.of}</em>` : ''}</span>
             <span class="rc-stat-l">${st.l}</span></div>`).join('')}
      </div>
      <div class="rc-grid">${m.score.tiles.map((t, i) => `
        <div class="rc-tile${t.done ? ' done' : ''}"
             style="background-image:url('${t.img}');--d:${i * 35}ms"
             title="${escapeHtml(t.title)}"></div>`).join('')}
      </div>`;
  }

  return `
    <div class="rc">
      <div class="rc-glow" style="background-image:url('${m.glow}')"></div>
      <div class="rc-inner">
        <div class="rc-brand">
          <img class="rc-mark" src="img/cr-icon.jpg" alt="">
          <span>coldrain fan hub</span>
        </div>
        ${body}
      </div>
    </div>`;
}

// The three buttons under every card, then whatever that screen wants after
function cardActions(extra) {
  return `
    <div class="rc-actions">
      <button class="cta-btn" onclick="saveCardImage()">Save Image</button>
      <button class="ghost-btn" onclick="copyCardImage()">Copy Image</button>
      <button class="ghost-btn" onclick="copyShareLink()">Copy Link</button>
    </div>
    <div class="result-actions rc-after">${extra}</div>`;
}

function showRankCard() {
  if (!lastResults.length) return;
  cardModelCurrent = rankCardModel();
  document.getElementById('sorter-content').innerHTML = `
    ${cardHtml(cardModelCurrent)}
    ${cardActions(`
      <button class="ghost-btn" onclick="renderSorterResult(lastResults)">Full List</button>
      <button class="ghost-btn" onclick="renderSorterSetup()">Sort Again</button>`)}`;
  window.scrollTo(0, 0);
}

// ---------- Drawing the card onto a canvas ----------
//
// No html2canvas, no dom-to-image, no CDN. This site has zero dependencies
// and I will die on that hill, so the card gets redrawn by hand with the 2D
// API at 1080px wide. It is long. It is also the only way the saved image
// looks identical on every browser instead of "roughly like the page, minus
// the fonts, plus a mysterious white border".

const CARD_W = 1080;
const INK = { bg: '#08090d', text: '#f1f2f5', muted: '#797e8f', accent: '#6d90ff' };

// Old Safari lets you assign ctx.filter and reads it straight back, without
// ever applying it, because it is just an expando. Checking the prototype is
// the only honest test.
const CANVAS_FILTERS = typeof CanvasRenderingContext2D !== 'undefined'
  && 'filter' in CanvasRenderingContext2D.prototype;

function loadImage(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);   // one missing sleeve should not sink the card
    img.src = src;
  });
}

function setFont(ctx, weight, size, display) {
  ctx.font = display
    ? `${weight} ${size}px Anton, Impact, sans-serif`
    : `${weight} ${size}px "Space Grotesk", system-ui, sans-serif`;
}

// Letter spacing by hand, one glyph at a time, because ctx.letterSpacing is
// supported in exactly the browsers you are not testing on
function spacedWidth(ctx, text, gap) {
  const chars = [...text];
  return chars.reduce((w, c) => w + ctx.measureText(c).width, 0) + gap * (chars.length - 1);
}

function spacedText(ctx, text, x, y, gap, align) {
  const chars = [...text];
  const total = spacedWidth(ctx, text, gap);
  let cx = align === 'center' ? x - total / 2 : x;
  const was = ctx.textAlign;
  ctx.textAlign = 'left';
  chars.forEach(c => { ctx.fillText(c, cx, y); cx += ctx.measureText(c).width + gap; });
  ctx.textAlign = was;
}

function wrapWords(ctx, text, maxW) {
  const lines = [];
  let line = '';
  text.split(/\s+/).forEach(word => {
    const test = line ? `${line} ${word}` : word;
    if (!line || ctx.measureText(test).width <= maxW) line = test;
    else { lines.push(line); line = word; }
  });
  if (line) lines.push(line);
  return lines;
}

function ellipsize(ctx, text, maxW) {
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}...`).width > maxW) t = t.slice(0, -1);
  return `${t.trimEnd()}...`;
}

// Hand-rolled rounded rectangle, since ctx.roundRect is another thing that
// is "widely supported" right up until someone opens the site on an old iPad
function roundedPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// A square sleeve, cropped to fill, rounded, and optionally dimmed to grey
function drawSleeve(ctx, img, x, y, size, r, dim) {
  ctx.save();
  roundedPath(ctx, x, y, size, size, r);
  ctx.clip();
  if (!img) {
    ctx.fillStyle = '#1a1c24';
    ctx.fillRect(x, y, size, size);
  } else {
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = (img.naturalWidth - side) / 2;
    const sy = (img.naturalHeight - side) / 2;
    if (dim && CANVAS_FILTERS) ctx.filter = 'grayscale(1) brightness(0.32)';
    ctx.drawImage(img, sx, sy, side, side, x, y, size, size);
    ctx.filter = 'none';
    // no filters: fake "not cleared" with a dark wash instead of true grey
    if (dim && !CANVAS_FILTERS) {
      ctx.fillStyle = 'rgba(8,9,13,0.74)';
      ctx.fillRect(x, y, size, size);
    }
  }
  ctx.restore();
}

// Lays out and paints the whole card. Runs twice: once with draw=false just
// to find out how tall the thing is, because a canvas cannot grow after the
// fact without wiping itself, and once for real.
function paintCard(ctx, m, imgs, draw, height) {
  const W = CARD_W, P = 80, inner = W - P * 2, cx = W / 2;
  ctx.textBaseline = 'top';
  let y = P;

  if (draw) {
    ctx.fillStyle = INK.bg;
    ctx.fillRect(0, 0, W, height);
    const glow = imgs.get(m.glow);
    if (glow) {
      // Free blur: crush the sleeve to a postage stamp, blow it back up with
      // smoothing on. Real blur on top where the browser allows it.
      const stamp = document.createElement('canvas');
      stamp.width = stamp.height = 24;
      stamp.getContext('2d').drawImage(glow, 0, 0, 24, 24);
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      if (CANVAS_FILTERS) ctx.filter = 'blur(40px) saturate(1.4)';
      ctx.drawImage(stamp, -W * 0.25, -W * 0.4, W * 1.5, W * 1.25);
      ctx.restore();
      const fadeTo = Math.min(height, W * 0.95);
      const fade = ctx.createLinearGradient(0, 0, 0, fadeTo);
      fade.addColorStop(0, 'rgba(8,9,13,0.1)');
      fade.addColorStop(1, 'rgba(8,9,13,1)');
      ctx.fillStyle = fade;
      ctx.fillRect(0, 0, W, fadeTo);
    }
  }

  // brand row: icon plus letterspaced name, centred as one group
  setFont(ctx, 700, 22, false);
  const brand = 'COLDRAIN FAN HUB';
  const group = 40 + 16 + spacedWidth(ctx, brand, 5);
  if (draw) {
    drawSleeve(ctx, imgs.get('img/cr-icon.jpg'), cx - group / 2, y, 40, 9, false);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    spacedText(ctx, brand, cx - group / 2 + 56, y + 10, 5, 'left');
  }
  y += 40 + 52;

  if (m.cover) {
    const size = 300;
    if (draw) {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.65)';
      ctx.shadowBlur = 56;
      ctx.shadowOffsetY = 22;
      roundedPath(ctx, cx - size / 2, y, size, size, 22);
      ctx.fillStyle = INK.bg;
      ctx.fill();
      ctx.restore();
      drawSleeve(ctx, imgs.get(m.cover), cx - size / 2, y, size, 22, false);
    }
    y += size + 46;
  }

  setFont(ctx, 700, 24, false);
  if (draw) {
    ctx.fillStyle = INK.accent;
    spacedText(ctx, m.kicker.toUpperCase(), cx, y, 7, 'center');
  }
  y += 24 + 18;

  if (m.score) {
    // Big number and its denominator share a baseline, which needs the
    // alphabetic baseline for exactly these two calls and nowhere else
    const s = m.score;
    setFont(ctx, 400, 220, true);
    const bigW = ctx.measureText(String(s.found)).width;
    setFont(ctx, 400, 88, true);
    const ofText = `/${s.total}`;
    const start = cx - (bigW + 10 + ctx.measureText(ofText).width) / 2;
    if (draw) {
      ctx.textBaseline = 'alphabetic';
      setFont(ctx, 400, 220, true);
      ctx.fillStyle = INK.text;
      ctx.fillText(String(s.found), start, y + 190);
      setFont(ctx, 400, 88, true);
      ctx.fillStyle = INK.muted;
      ctx.fillText(ofText, start + bigW + 10, y + 190);
      ctx.textBaseline = 'top';
    }
    y += 212;
    setFont(ctx, 500, 32, false);
    if (draw) {
      ctx.fillStyle = INK.muted;
      ctx.textAlign = 'center';
      ctx.fillText(s.verdict, cx, y);
      ctx.textAlign = 'left';
    }
    y += 32 + 10;
  } else {
    // Shrink the title until it fits in two lines. "Final Destination
    // (Re-Recorded)" is the reason this loop exists.
    let size = 108;
    const upper = m.title.toUpperCase();
    setFont(ctx, 400, size, true);
    let lines = wrapWords(ctx, upper, inner);
    while (size > 48 && (lines.length > 2 || lines.some(l => ctx.measureText(l).width > inner))) {
      size -= 6;
      setFont(ctx, 400, size, true);
      lines = wrapWords(ctx, upper, inner);
    }
    if (draw) {
      ctx.fillStyle = INK.text;
      ctx.textAlign = 'center';
      lines.forEach((line, i) => ctx.fillText(line, cx, y + i * size));
      ctx.textAlign = 'left';
    }
    y += lines.length * size + 8;
    if (m.tag) {
      setFont(ctx, 700, 24, false);
      if (draw) {
        ctx.fillStyle = INK.muted;
        spacedText(ctx, m.tag.toUpperCase(), cx, y + 6, 5, 'center');
      }
      y += 6 + 32;
    }
  }

  y += 22;
  if (draw) {
    const rule = ctx.createLinearGradient(P, 0, W - P, 0);
    rule.addColorStop(0, 'rgba(255,255,255,0)');
    rule.addColorStop(0.5, 'rgba(255,255,255,0.22)');
    rule.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = rule;
    ctx.fillRect(P, y, inner, 2);
  }
  y += 2 + 42;

  if (m.rows) {
    m.rows.forEach(r => {
      const art = r.hi ? 88 : 64;
      const rowH = art + 20;
      const mid = y + rowH / 2;
      if (draw) {
        ctx.textBaseline = 'middle';
        setFont(ctx, 400, r.hi ? 44 : 36, true);
        ctx.fillStyle = r.hi ? INK.accent : INK.muted;
        ctx.textAlign = 'right';
        ctx.fillText(String(r.rank), P + 56, mid + 2);
        ctx.textAlign = 'left';
        drawSleeve(ctx, imgs.get(r.img), P + 80, mid - art / 2, art, 10, false);
        if (r.hi) {
          roundedPath(ctx, P + 80, mid - art / 2, art, art, 10);
          ctx.strokeStyle = 'rgba(109,144,255,0.55)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        setFont(ctx, r.hi ? 700 : 600, r.hi ? 36 : 32, false);
        ctx.fillStyle = INK.text;
        const tx = P + 80 + art + 26;
        ctx.fillText(ellipsize(ctx, r.title, W - P - tx), tx, mid + 1);
        ctx.textBaseline = 'top';
      }
      y += rowH;
    });
  }

  if (m.tracks) {
    const two = m.tracks.length > 8;
    const perCol = two ? Math.ceil(m.tracks.length / 2) : m.tracks.length;
    const gap = 44;
    const colW = two ? (inner - gap) / 2 : inner;
    const rowH = 54;
    if (draw) {
      m.tracks.forEach((t, i) => {
        const col = two ? Math.floor(i / perCol) : 0;
        const row = two ? i % perCol : i;
        const x = P + col * (colW + gap);
        const mid = y + row * rowH + rowH / 2;
        ctx.textBaseline = 'middle';
        setFont(ctx, 400, t.hi ? 34 : 30, true);
        ctx.fillStyle = t.hi ? INK.accent : INK.muted;
        ctx.textAlign = 'right';
        ctx.fillText(String(t.rank), x + 44, mid);
        ctx.textAlign = 'left';
        setFont(ctx, t.hi ? 700 : 500, 28, false);
        ctx.fillStyle = INK.text;
        ctx.fillText(ellipsize(ctx, t.title, colW - 62), x + 60, mid + 1);
        ctx.textBaseline = 'top';
      });
    }
    y += perCol * rowH;
  }

  if (m.score) {
    const colW = inner / 3;
    if (draw) {
      m.score.stats.forEach((st, i) => {
        const sx = P + colW * i + colW / 2;
        setFont(ctx, 400, 64, true);
        const vW = ctx.measureText(st.v).width;
        setFont(ctx, 400, 38, true);
        const oW = st.of ? ctx.measureText(st.of).width : 0;
        const left = sx - (vW + oW) / 2;
        ctx.textBaseline = 'alphabetic';
        setFont(ctx, 400, 64, true);
        ctx.fillStyle = INK.text;
        ctx.fillText(st.v, left, y + 58);
        if (st.of) {
          setFont(ctx, 400, 38, true);
          ctx.fillStyle = INK.muted;
          ctx.fillText(st.of, left + vW, y + 58);
        }
        ctx.textBaseline = 'top';
        setFont(ctx, 700, 20, false);
        ctx.fillStyle = INK.muted;
        spacedText(ctx, st.l.toUpperCase(), sx, y + 78, 4, 'center');
      });
    }
    y += 78 + 20 + 48;

    const cols = 7, tg = 14;
    const tile = (inner - tg * (cols - 1)) / cols;
    if (draw) {
      m.score.tiles.forEach((t, i) => {
        const tx = P + (i % cols) * (tile + tg);
        const ty = y + Math.floor(i / cols) * (tile + tg);
        drawSleeve(ctx, imgs.get(t.img), tx, ty, tile, 8, !t.done);
      });
    }
    const tileRows = Math.ceil(m.score.tiles.length / cols);
    y += tileRows * tile + (tileRows - 1) * tg;
  }

  return Math.ceil(y + P);
}

async function drawCard(m) {
  // Draw with a fallback font and the PNG comes out in Impact. Ask me how
  // many test images of that exist.
  try {
    await Promise.all([
      document.fonts.load('400 100px Anton'),
      document.fonts.load('500 30px "Space Grotesk"'),
      document.fonts.load('600 30px "Space Grotesk"'),
      document.fonts.load('700 30px "Space Grotesk"'),
    ]);
  } catch {}

  const wanted = new Set(['img/cr-icon.jpg', m.glow]);
  if (m.cover) wanted.add(m.cover);
  (m.rows || []).forEach(r => wanted.add(r.img));
  if (m.score) m.score.tiles.forEach(t => wanted.add(t.img));
  const imgs = new Map();
  await Promise.all([...wanted].map(src => loadImage(src).then(img => imgs.set(src, img))));

  const canvas = document.createElement('canvas');
  canvas.width = CARD_W;
  canvas.height = 16;
  const height = paintCard(canvas.getContext('2d'), m, imgs, false, 0);
  canvas.height = height;   // resizing wipes every setting on the context, hence a fresh one
  paintCard(canvas.getContext('2d'), m, imgs, true, height);
  return canvas;
}

function renderCardBlob() {
  return drawCard(cardModelCurrent).then(canvas => new Promise((resolve, reject) => {
    try {
      canvas.toBlob(b => (b ? resolve(b) : reject(new Error('empty canvas'))), 'image/png');
    } catch (err) {
      // opened as a file:// page, the sleeves taint the canvas and this throws
      reject(err);
    }
  }));
}

function cardFileName() {
  const m = cardModelCurrent;
  const base = (m.score ? 'name-the-songs' : `my-top-${m.title}`)
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `coldrain-${base}.png`;
}

// On a phone, hand the image straight to the share sheet so it can go into
// Instagram or a group chat in one tap. Everywhere else, just download it,
// because nobody on a laptop wants a Windows share dialog to appear.
function saveCardImage() {
  if (cardBusy || !cardModelCurrent) return;
  cardBusy = true;
  showToast('Drawing the card...');
  renderCardBlob()
    .then(async blob => {
      const file = new File([blob], cardFileName(), { type: 'image/png' });
      const touch = window.matchMedia && window.matchMedia('(pointer:coarse)').matches;
      if (touch && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file] });
          return;
        } catch (err) {
          if (err && err.name === 'AbortError') return;   // they closed the sheet, which is allowed
        }
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      showToast('Image saved.', 'good');
    })
    .catch(() => showToast('Could not draw the image here. Open the site from its web address and try again.', 'error'))
    .finally(() => { cardBusy = false; });
}

// Safari only allows a clipboard write inside the click itself, so the blob
// has to go in as a promise that is still pending, not an awaited result.
// Chrome accepts that too. Firefox, older, gets the second attempt.
function copyCardImage() {
  if (cardBusy || !cardModelCurrent) return;
  if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
    showToast('This browser cannot copy images. Use Save Image instead.', 'error');
    return;
  }
  cardBusy = true;
  const pending = renderCardBlob();
  navigator.clipboard.write([new ClipboardItem({ 'image/png': pending })])
    .catch(() => pending.then(blob =>
      navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])))
    .then(() => showToast('Image copied. Paste it anywhere.', 'good'))
    .catch(() => showToast('Copying the image failed. Use Save Image instead.', 'error'))
    .finally(() => { cardBusy = false; });
}

function showSavedResult(mode) {
  sorterMode = mode;
  const session = mode === 'songs' ? profile.songSort : profile.albumSort;
  if (!session || !session.result) return;
  // Saved results only keep rank and title, so the sleeves get looked up
  // again. Storing image paths in the profile would have aged terribly.
  const results = session.result.map(r => {
    const found = mode === 'songs'
      ? CR.songs.find(s => s.title === r.title)
      : CR.albums.find(a => a.title === r.title);
    return { rank: r.rank, item: { title: r.title, img: found ? found.img : '' } };
  });
  renderSorterResult(results);
}

function copyRanking(text) {
  navigator.clipboard.writeText(text).then(() => showToast('Copied.', 'good')).catch(() => {});
}

// Name The Songs
// The feature that was supposed to take an afternoon and instead produced
// an entire fuzzy string matching module. See songguess.js. I am fine.

let guessFound = new Set();     // titles found this run
let guessOver = false;          // true once the run has ended, either way
let guessPrevBest = 0;          // best going in, so we can tell if this run beat it
let guessMisses = 0;            // rejected guesses since the last hit

// The clock only runs while you are actually on the screen. Starts on the
// first keystroke, not on render, so opening the tab and making a coffee
// costs nothing. Time banks when you leave, so resuming continues the total
// instead of politely pretending you were quick.
let guessStartedAt = null;
let guessBankedMs = 0;
let guessTimerId = null;

// Who is actually in the guessing game.
//
// guess:false releases sit it out, which is only the re-recorded Final
// Destination, because typing "Fiction" and scoring twice is not a memory
// test. A single song can set guess:true to climb back out, which is how
// Vengeance stays nameable while the twelve re-recordings around it do not.
//
// Cached, because the discography does not change while the page is open
// and this was being recomputed on every single keystroke.
let guessableCache = null;

function guessSongs() {
  if (!guessableCache) {
    const albumById = new Map(CR.albums.map(a => [a.id, a]));
    guessableCache = CR.songs.filter(song => {
      if (song.guess === true) return true;
      if (song.guess === false) return false;
      const album = albumById.get(song.albumId);
      return !album || album.guess !== false;
    });
  }
  return guessableCache;
}

function guessAlbums() {
  const ids = new Set(guessSongs().map(s => s.albumId));
  return CR.albums.filter(a => ids.has(a.id));
}

function guessSongsOf(albumId) {
  return guessSongs().filter(s => s.albumId === albumId);
}

function guessElapsedMs() {
  return guessBankedMs + (guessStartedAt ? Date.now() - guessStartedAt : 0);
}

function startGuessTimer() {
  if (guessStartedAt || guessOver) return;
  guessStartedAt = Date.now();
  guessTimerId = setInterval(renderGuessTime, 1000);
  renderGuessTime();
}

function pauseGuessTimer() {
  if (guessStartedAt) {
    guessBankedMs += Date.now() - guessStartedAt;
    guessStartedAt = null;
  }
  clearInterval(guessTimerId);
  guessTimerId = null;
}

function renderGuessTime() {
  const el = document.getElementById('guess-time');
  if (el) el.textContent = formatDuration(guessElapsedMs());
}

function formatDuration(ms) {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor(total / 60) % 60;
  const s = total % 60;
  const pad = n => String(n).padStart(2, '0');
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

// restore is a list of titles to pre-fill, for picking a saved run back up
function renderSongGuessView(restore) {
  pauseGuessTimer();
  guessFound = new Set();
  guessOver = false;
  guessMisses = 0;
  guessBankedMs = 0;
  guessPrevBest = profile.songGuessBest;

  const songs = guessSongs();
  const saved = profile.songGuess;

  // Offer the saved run instead of silently restoring it. Being handed
  // someone else's half-finished attempt with no warning is unsettling.
  let resumeHtml = '';
  if (!restore && saved && saved.found.length) {
    const when = new Date(saved.savedAt).toLocaleDateString(undefined,
      { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
    resumeHtml = `
      <div class="resume-banner" id="guess-resume">
        <div class="resume-text">
          <span class="resume-icon">&#8987;</span>
          <span><strong>${saved.found.length}</strong> named on ${when}</span>
        </div>
        <button class="resume-btn" onclick="resumeSongGuess()">Resume &rarr;</button>
      </div>`;
  }

  const el = document.getElementById('songguess-content');
  el.innerHTML = `
    <div class="page-head">
      <h2 class="page-title">Name The Songs</h2>
      <p class="page-sub">Titles are accepted as you type. Press enter to submit one that might be spelled wrong.</p>
    </div>

    ${resumeHtml}

    <div class="guess-bar">
      <form class="guess-form" id="guess-form">
        <input type="text" class="text-input guess-input" id="guess-input"
               placeholder="Song title" autocomplete="off" autocapitalize="off" spellcheck="false">
        <button class="cta-btn" type="submit">Enter</button>
      </form>
      <div class="guess-meter">
        <div class="guess-count-wrap">
          <div class="guess-count" id="guess-count">0<span>/${songs.length}</span></div>
          <div class="guess-best" id="guess-best"></div>
        </div>
        <div class="guess-track"><div class="guess-track-fill" id="guess-fill"></div></div>
        <div class="guess-time" id="guess-time">0:00</div>
      </div>
    </div>

    <div id="guess-tip-slot" class="tip-slot-snug"></div>

    <div class="guess-albums">${guessAlbums().map(renderGuessAlbum).join('')}</div>

    <div class="guess-actions">
      <button class="ghost-btn" onclick="revealAllSongs()">Give Up &amp; Reveal</button>
      <button class="ghost-btn" onclick="restartSongGuess()">Start Over</button>
    </div>`;

  const input = document.getElementById('guess-input');
  const form  = document.getElementById('guess-form');

  // Accepted the instant you finish typing it. No enter, no button, no
  // ceremony. This one change is most of why the game feels good.
  input.addEventListener('input', () => {
    startGuessTimer();
    tryGuess(input.value, false);
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    startGuessTimer();
    tryGuess(input.value, true);
  });

  if (restore) restore.forEach(title => markSongFound(title, true));

  renderGuessBest();
  renderGuessTime();
  refreshGuessTip();
  input.focus();
}

function refreshGuessTip() {
  renderTipSlot('guess-tip-slot', 'guess', {
    misses:       guessMisses,
    found:        guessFound.size,
    best:         profile.songGuessBest,
    resumedGuess: Profile.tipFlag(profile, 'resumedGuess'),
  });
}

function resumeSongGuess() {
  const saved = profile.songGuess;
  if (!saved) { renderSongGuessView(); return; }
  profile = Profile.flagTip(profile, 'resumedGuess');
  const byId = new Map(guessSongs().map(s => [s.sid, s.title]));
  const titles = saved.found.map(sid => byId.get(sid)).filter(Boolean);
  const banked = saved.elapsed || 0;
  renderSongGuessView(titles);
  guessBankedMs = banked;
  renderGuessTime();
  showToast(`Picked up at ${titles.length}.`, 'good');
}

function restartSongGuess() {
  profile = Profile.clearGuessSession(profile);
  renderSongGuessView();
}

function saveGuessProgress() {
  if (guessOver || !guessFound.size) return;
  const byTitle = new Map(guessSongs().map(s => [s.title, s.sid]));
  const sids = [...guessFound].map(t => byTitle.get(t)).filter(sid => sid !== undefined);
  profile = Profile.saveGuessSession(profile, sids, guessElapsedMs());
}

function renderGuessAlbum(album, i) {
  const songs = guessSongsOf(album.id);
  const rows = songs.map((s, i) => `
      <li class="guess-song masked" id="gs-${s.sid}">
        <span class="idx">${i + 1}</span>
        <span class="title">${maskTitle(s.title)}</span>
      </li>`).join('');

  const tag = album.year ? `${album.kind} &middot; ${album.year}` : album.kind;

  return `
    <div class="guess-album" id="ga-${album.id}" style="--d:${i * 45}ms">
      <div class="guess-album-head">
        <div class="guess-album-art" style="background-image:url('${album.img}')"></div>
        <div class="guess-album-meta">
          <div class="guess-album-title">${escapeHtml(album.title)}<span class="guess-album-tag">${tag}</span></div>
          <div class="guess-album-progress">
            <div class="guess-album-track"><div class="guess-album-fill" id="gaf-${album.id}"></div></div>
            <div class="guess-album-count" id="gac-${album.id}">0/${songs.length}</div>
          </div>
        </div>
      </div>
      <ul class="guess-songs">${rows}</ul>
    </div>`;
}

// Dots instead of letters, one per character, so the shape of a title is a
// clue and a fifteen-letter blank looks like a fifteen-letter blank
function maskTitle(title) {
  return escapeHtml(title).replace(/\S/g, '&bull;');
}

function tryGuess(raw, allowTypos) {
  const input = document.getElementById('guess-input');
  const guess = raw.trim();
  if (!guess || guessOver) return;

  if (devFillGuesses(guess)) { input.value = ''; return; }

  const remaining = guessSongs().map(s => s.title).filter(t => !guessFound.has(t));

  // Typing takes exact spellings only, or the letters "the" would swallow
  // half the discography before you finished the word. Enter is forgiving,
  // because by then you have committed.
  const match = allowTypos
    ? SongGuess.findMatch(guess, remaining)
    : SongGuess.findExact(guess, remaining);

  if (!match) {
    if (allowTypos) {
      input.classList.remove('miss');
      void input.offsetWidth;
      input.classList.add('miss');
      showToast('No match for that one.', 'error');
      guessMisses++;
      refreshGuessTip();
    }
    return;
  }

  guessMisses = 0;
  input.value = '';
  input.classList.remove('miss');
  input.classList.add('hit');
  setTimeout(() => input.classList.remove('hit'), 400);
  markSongFound(match);
}

// quiet means we are replaying a saved run, so fill the board in silently
// rather than firing ninety animations and ninety toasts and ninety writes
// to localStorage in one frame
function markSongFound(title, quiet) {
  guessFound.add(title);

  const song = guessSongs().find(s => s.title === title);
  const row  = document.getElementById('gs-' + song.sid);
  if (row) {
    row.querySelector('.title').textContent = title;
    row.classList.remove('masked');
    row.classList.add('found');
    if (!quiet) {
      row.classList.add('just-found');
      setTimeout(() => row.classList.remove('just-found'), 700);
    }
  }

  updateGuessTotals(quiet);
  const albumDone = updateAlbumProgress(song.albumId);
  if (quiet) return;

  // First find of a fresh run just overwrote the saved one, so the offer to
  // return to it is now a lie and has to go
  const banner = document.getElementById('guess-resume');
  if (banner) banner.remove();

  profile = Profile.recordSongGuessScore(profile, guessFound.size);
  renderGuessBest();

  if (guessFound.size === guessSongs().length) {
    finishGuessRun();
    return;
  }

  saveGuessProgress();
  refreshGuessTip();
  if (albumDone) {
    const album = CR.albums.find(a => a.id === song.albumId);
    showToast(`${album.title} complete.`, 'good');
  } else {
    showToast(title, 'good');
  }
}

function updateGuessTotals(quiet) {
  const count = document.getElementById('guess-count');
  const fill  = document.getElementById('guess-fill');
  if (!count) return;
  const total = guessSongs().length;
  count.innerHTML = `${guessFound.size}<span>/${total}</span>`;
  if (!quiet) {
    count.classList.remove('bump');
    void count.offsetWidth;
    count.classList.add('bump');
  }
  fill.style.width = (guessFound.size / total * 100) + '%';
}

// Update one release's counter, and say whether that just completed it, so
// the caller knows whether to make a fuss
function updateAlbumProgress(albumId) {
  const songs = guessSongsOf(albumId);
  const found = songs.filter(s => guessFound.has(s.title)).length;

  const fill  = document.getElementById('gaf-' + albumId);
  const count = document.getElementById('gac-' + albumId);
  const card  = document.getElementById('ga-' + albumId);
  if (!fill) return false;

  fill.style.width = (found / songs.length * 100) + '%';
  count.textContent = `${found}/${songs.length}`;

  const complete = found === songs.length;
  const wasComplete = card.classList.contains('complete');
  card.classList.toggle('complete', complete);
  return complete && !wasComplete;
}

function albumsCleared() {
  return guessAlbums().filter(a =>
    guessSongsOf(a.id).every(s => guessFound.has(s.title))).length;
}

// Giving up shows the answers in place rather than jumping to a score
// card, because at that exact moment you want to know what you missed, not
// how badly you did
function revealAllSongs() {
  if (guessOver) return;
  endGuessRun();
  revealRemaining();
  showGuessSummary();
}

function revealRemaining() {
  guessSongs().forEach(s => {
    if (guessFound.has(s.title)) return;
    const row = document.getElementById('gs-' + s.sid);
    if (!row) return;
    row.querySelector('.title').textContent = s.title;
    row.classList.remove('masked');
    row.classList.add('revealed');
  });
}

function endGuessRun() {
  guessOver = true;
  pauseGuessTimer();
  profile = Profile.clearGuessSession(profile);
  const input = document.getElementById('guess-input');
  if (input) input.disabled = true;
}

// The consolation panel, for a run that ended on your terms
function showGuessSummary() {
  const slot = document.getElementById('guess-tip-slot');
  if (!slot) return;
  const total = guessSongs().length;
  const pct = Math.round(guessFound.size / total * 100);
  slot.innerHTML = `
    <div class="guess-done">
      <h3>${guessFound.size} / ${total}</h3>
      <p>${pct}% in ${formatDuration(guessElapsedMs())}.</p>
      <button class="ghost-btn" onclick="showGuessCard()">Share Card</button>
    </div>`;
  window.scrollTo(0, 0);
}

// You got all of them. Genuinely, well done.
function finishGuessRun() {
  endGuessRun();
  showGuessCard();
  showToast(`All ${guessSongs().length}.`, 'good');
}

// Same frame, different payload. The grid of sleeves is the bit people
// actually post: it says which records you cleared without anyone having to
// read a single number.
function guessCardModel() {
  const total = guessSongs().length;
  const found = guessFound.size;
  const albums = guessAlbums();
  const done = a => guessSongsOf(a.id).every(s => guessFound.has(s.title));

  const verdict = found === total
    ? 'Every single one of them.'
    : found > guessPrevBest
      ? 'A new personal best.'
      : guessPrevBest > 0 ? `Personal best is ${guessPrevBest}.` : 'First run on the board.';

  return {
    // Coloured by a record they actually finished, not by whatever is newest
    glow: (albums.find(done) || albums[0]).img,
    kicker: 'Name the songs',
    score: {
      found, total, verdict,
      stats: [
        { v: `${Math.round(found / total * 100)}%`, l: 'Named' },
        { v: formatDuration(guessElapsedMs()), l: 'Time' },
        { v: String(albumsCleared()), of: `/${albums.length}`, l: 'Cleared' },
      ],
      tiles: albums.map(a => ({ img: a.img, done: done(a), title: a.title })),
    },
  };
}

function showGuessCard() {
  cardModelCurrent = guessCardModel();
  document.getElementById('songguess-content').innerHTML = `
    ${cardHtml(cardModelCurrent)}
    ${cardActions(`
      <button class="ghost-btn" onclick="showGuessAnswers()">See The Answers</button>
      <button class="ghost-btn" onclick="restartSongGuess()">Play Again</button>`)}`;
  window.scrollTo(0, 0);
}

// From the card back to the board, everything revealed
function showGuessAnswers() {
  const found = [...guessFound];
  const elapsed = guessElapsedMs();
  renderSongGuessView(found);
  guessBankedMs = elapsed;
  renderGuessTime();
  endGuessRun();
  revealRemaining();
  showGuessSummary();
}

function renderGuessBest() {
  const el = document.getElementById('guess-best');
  if (el) el.textContent = profile.songGuessBest ? `BEST ${profile.songGuessBest}` : '';
}

// Profile
// Your numbers, your rankings, and the string that carries all of it.

function countComparisons(src = profile) {
  let pairs = 0;
  ['songs', 'albums'].forEach(mode => {
    const map = Profile.getComparisons(src, mode);
    Object.values(map).forEach(opponents => { pairs += Object.keys(opponents).length; });
  });
  return Math.round(pairs / 2); // each pair is stored from both sides
}

// ---------- Profile insights ----------
//
// Everything here is squeezed out of data the profile already had. There is
// no new tracking, no timestamps per pick, no analytics, because the moment a
// fan site starts logging when you clicked things it has become a very sad
// little ad network.

// How often each album won its head-to-heads. Anything that is not a win or
// a loss is a draw from before draws were removed, and still counts as half
// a win, which is the only fair way to score "I refuse to choose".
function albumWinRates(src) {
  const map = Profile.getComparisons(src, 'albums');
  return rankableAlbums().map(album => {
    let w = 0, l = 0, t = 0;
    Object.values(map[album.title] || {}).forEach(r => {
      if (r === 'win') w++; else if (r === 'lose') l++; else t++;
    });
    const n = w + l + t;
    return n ? { album, value: (w + t / 2) / n, n } : null;
  }).filter(Boolean).sort((a, b) => b.value - a.value || b.n - a.n);
}

// Where each release's tracks landed in your last full song ranking, as an
// average percentile: 100% means every one of its songs sat at the very top.
// Answers "which record do you actually rate" better than any single pick.
function releaseStanding(src) {
  const res = src.songSort && src.songSort.result;
  if (!res || res.length < 2) return [];
  const bottom = Math.max(...res.map(r => r.rank));
  if (bottom < 2) return [];
  const albumOf = new Map(CR.songs.map(s => [s.title, s.albumId]));
  const groups = new Map();
  res.forEach(r => {
    const id = albumOf.get(r.title);
    if (!id) return;
    if (!groups.has(id)) groups.set(id, []);
    groups.get(id).push(1 - (r.rank - 1) / (bottom - 1));
  });
  const rows = [...groups].map(([id, list]) => ({
    album: CR.albums.find(a => a.id === id),
    value: list.reduce((a, b) => a + b, 0) / list.length,
    n: list.length,
  })).filter(r => r.album);
  // One release on its own is not a comparison, it is a sentence
  return rows.length >= 2 ? rows.sort((a, b) => b.value - a.value) : [];
}

// A bar list. One series, one hue, the number printed beside every bar so
// nobody has to guess a length, and the sleeve standing in for a legend.
function barList(rows, noun) {
  return `<div class="pbars">${rows.map((r, i) => `
    <div class="pbar-row" style="--d:${i * 40}ms">
      <span class="pbar-art" style="background-image:url('${r.album.img}')"></span>
      <span class="pbar-name">${escapeHtml(r.album.title)}</span>
      <span class="pbar-track"><span class="pbar-fill" style="width:${(r.value * 100).toFixed(1)}%"></span></span>
      <span class="pbar-val">${Math.round(r.value * 100)}%</span>
      <span class="pbar-n">${r.n} ${noun}${r.n === 1 ? '' : 's'}</span>
    </div>`).join('')}</div>`;
}

function profileInsightsHtml(src) {
  const guessTotal = guessSongs().length;
  const songRes = src.songSort && src.songSort.result;
  const albumRes = src.albumSort && src.albumSort.result;
  const pairs = countComparisons(src);

  const stats = [
    { v: String(Math.min(src.songGuessBest || 0, guessTotal)), of: `/${guessTotal}`, l: 'Songs named' },
    { v: String(pairs), l: 'Pairs judged' },
    { v: String(songRes ? songRes.length : 0), l: 'Songs ranked' },
    { v: String(albumRes ? albumRes.length : 0), l: 'Albums ranked' },
  ];

  const statHtml = `<div class="stat-grid">${stats.map((s, i) => `
    <div class="stat-card" style="--d:${60 + i * 60}ms">
      <div class="stat-val">${s.v}${s.of ? `<span class="stat-of">${s.of}</span>` : ''}</div>
      <div class="stat-label">${s.l}</div>
    </div>`).join('')}</div>`;

  // Number ones, with their sleeves, because that is the bit people ask about
  const favs = [];
  if (songRes && songRes.length) {
    const song = CR.songs.find(s => s.title === songRes[0].title);
    if (song) favs.push({ label: 'Number one song', title: song.title, img: song.img });
  }
  const winRates = albumWinRates(src);
  const topAlbum = albumRes && albumRes.length
    ? CR.albums.find(a => a.title === albumRes[0].title)
    : winRates.length ? winRates[0].album : null;
  if (topAlbum) favs.push({ label: 'Number one album', title: topAlbum.title, img: topAlbum.img });

  const favHtml = favs.length ? `<div class="fav-strip">${favs.map((f, i) => `
    <div class="fav" style="--d:${i * 70}ms">
      <span class="fav-art" style="background-image:url('${f.img}')"></span>
      <span class="fav-meta">
        <span class="fav-label">${f.label}</span>
        <span class="fav-title">${escapeHtml(f.title)}</span>
      </span>
    </div>`).join('')}</div>` : '';

  const standing = releaseStanding(src);
  const standingHtml = standing.length ? `
    <div class="insight">
      <h3>Which records ${src === profile ? 'you' : 'they'} rate</h3>
      <p class="insight-note">Where each release's songs landed in the last full
        song ranking, on average. 100% would mean every track sat at the top.</p>
      ${barList(standing, 'song')}
    </div>` : '';

  const winHtml = winRates.length ? `
    <div class="insight">
      <h3>Album head-to-heads</h3>
      <p class="insight-note">How often each album won when it came up against
        another one.</p>
      ${barList(winRates, 'match')}
    </div>` : '';

  const empty = !pairs && !(src.songGuessBest > 0) ? `
    <p class="dimmed insight-empty">${src === profile
      ? 'Nothing to chart yet. Rank something or play Name The Songs and this page fills itself in.'
      : 'Nothing to chart yet. Whoever this is has not ranked or named anything.'}</p>` : '';

  return statHtml + favHtml + standingHtml + winHtml + empty;
}

// Someone else's profile, open for inspection. Memory only. Nothing down
// this path touches storage, so looking at a friend's rankings cannot
// possibly eat yours, which was the first thing I got wrong.
let guest = null;

function renderProfileView() {
  if (guest) { renderGuestProfile(); return; }

  const el = document.getElementById('profile-content');

  const seed = Profile.generateSeed(profile);
  const days = profile.joinedAt
    ? Math.max(0, Math.floor((Date.now() - Date.parse(profile.joinedAt)) / 86400000))
    : null;

  el.innerHTML = `
    <div class="profile-wrap">
      <div class="profile-header">
        <div class="profile-avatar">${profile.name ? escapeHtml(profile.name[0].toUpperCase()) : '?'}</div>
        <div>
          <h2>${escapeHtml(profile.name || 'Anonymous Fan')}</h2>
          ${profile.joinedAt ? `<p class="dimmed">Fan since ${new Date(profile.joinedAt).toLocaleDateString()}${days ? ` &middot; ${days} day${days === 1 ? '' : 's'}` : ''}</p>` : ''}
        </div>
      </div>

      ${profileInsightsHtml(profile)}

      <div class="name-edit">
        <input id="name-input" class="text-input" placeholder="Your name" value="${escapeHtml(profile.name || '')}">
        <button class="cta-btn" onclick="saveName()">Save</button>
      </div>

      <div class="seed-section">
        <h3>Share Your Account</h3>
        <p class="dimmed">A link that opens everything you see here on anyone else's device, read-only. It is also how you carry your profile to a new browser.</p>
        <button class="cta-btn full-w" onclick="copyShareLink()">Copy Share Link</button>
        <div class="seed-box">
          <textarea class="seed-code" id="seed-display" readonly>${seed}</textarea>
          <button class="seed-copy-btn" onclick="copySeed()" title="Copy the raw seed">&#9099;</button>
        </div>
        ${tipFor('profile', {
          hasData:    countComparisons() > 0 || profile.songGuessBest > 0,
          copiedSeed: Profile.tipFlag(profile, 'copiedSeed'),
        })}
      </div>

      <button class="danger-btn" onclick="resetProfile()">Reset All Data</button>
      <button class="dev-link" onclick="showView('info')">Info &amp; Credits</button>
    </div>`;
}

function saveName() {
  const name = document.getElementById('name-input').value.trim();
  if (!name) return;
  if (!profile.joinedAt) profile.joinedAt = new Date().toISOString();
  profile = Profile.update(profile, { name });
  renderProfileBadge();
  renderProfileView();
  showToast('Name saved.', 'good');
}

// The share link is just the seed hung off wherever this page is being
// served from, so it works identically on localhost and on Pages with
// nothing hardcoded. It lives in the fragment, which never gets sent to a
// server, which is a nice property for something containing your name.
function shareUrl() {
  const seed = Profile.generateSeed(profile);
  if (!seed) return '';
  return location.origin + location.pathname + '#p=' + encodeURIComponent(seed);
}

function copyShareLink() {
  const url = shareUrl();
  if (!url) { showToast('Nothing to share yet.', 'error'); return; }
  navigator.clipboard.writeText(url).then(() => {
    profile = Profile.flagTip(profile, 'copiedSeed');
    document.querySelectorAll('[data-tip-id="seed"]').forEach(el => el.remove());
    showToast('Share link copied.', 'good');
  }).catch(() => {});
}

// Somebody arrived with a profile attached to the URL
function openSharedLink() {
  const match = location.hash.match(/[#&]p=([^&]+)/);
  if (!match) return false;
  const data = Profile.parseSeed(decodeURIComponent(match[1]));
  if (!data) { showToast('That share link is not valid.', 'error'); return false; }
  guest = data;
  return true;
}

function copySeed() {
  navigator.clipboard.writeText(Profile.generateSeed(profile))
    .then(() => {
      profile = Profile.flagTip(profile, 'copiedSeed');
      // Advice taken. Off it goes, no re-render required.
      document.querySelectorAll('[data-tip-id="seed"]').forEach(el => el.remove());
      showToast('Seed copied.', 'good');
    })
    .catch(() => {});
}

// Viewing someone else's seed
// Read-only, in memory, and paranoid about it.

function exitGuest() {
  guest = null;
  // Drop the link out of the address bar so a refresh does not reopen it
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  renderProfileView();
}

// The one door from someone else's profile into yours. It lives here
// rather than in settings because it only makes sense while you are looking
// at what you are about to overwrite. It also asks first, obviously.
function adoptGuest() {
  if (!guest) return;
  const name = guest.name || 'this profile';
  if (!confirm(`Replace your name, stats, rankings and history with ${name}? This cannot be undone.`)) return;
  profile = guest;
  Profile.save(profile);
  guest = null;
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  renderProfileBadge();
  renderProfileView();
  showToast('This is your profile now.', 'good');
}

// A seed holds either a finished ranking or a sort in flight. Say which.
function describeSort(session, noun) {
  if (!session || (!session.result && !session.choices)) {
    return `No ${noun} ranking in this seed yet.`;
  }
  if (session.result) return `Ranked all ${session.result.length} ${noun}s.`;

  const n = (session.items || []).length;
  const expected = n > 1 ? Math.max(n - 1, Math.round(n * Math.log2(n) - n + 1)) : 1;
  const pct = Math.min(99, Math.round(session.choices.length / expected * 100));
  return `Part way through a ${noun} sort of ${n}: ${session.choices.length} answers in, roughly ${pct}%.`;
}

function guestRankList(session, limit) {
  if (!session || !session.result) return '';
  const rows = session.result.slice(0, limit).map((r, i) =>
    `<li style="--d:${i * 28}ms"><span class="rank-n">${Number(r.rank) || 0}.</span> ${escapeHtml(r.title)}</li>`).join('');
  const rest = session.result.length - limit;
  return `<ol class="mini-rank">${rows}</ol>` +
    (rest > 0 ? `<p class="dimmed no-rank">and ${rest} more</p>` : '');
}

function renderGuestProfile() {
  const el = document.getElementById('profile-content');
  const name = guest.name || 'Anonymous Fan';
  const songList  = guestRankList(guest.songSort, 10);
  const albumList = guestRankList(guest.albumSort, 13);

  el.innerHTML = `
    <div class="profile-wrap">
      <div class="guest-bar">
        <div class="guest-bar-text">
          <span class="guest-tag">Viewing</span>
          <span>Someone else's seed. Nothing here is saved.</span>
        </div>
        <button class="resume-btn" onclick="exitGuest()">Close</button>
      </div>

      <div class="profile-header">
        <div class="profile-avatar guest">${guest.name ? escapeHtml(guest.name[0].toUpperCase()) : '?'}</div>
        <div>
          <h2>${escapeHtml(name)}</h2>
          ${guest.joinedAt ? `<p class="dimmed">Fan since ${new Date(guest.joinedAt).toLocaleDateString()}</p>` : ''}
        </div>
      </div>

      ${profileInsightsHtml(guest)}

      <div class="ranking-section">
        <h3>Their Song Ranking</h3>
        ${songList || `<p class="dimmed no-rank">${describeSort(guest.songSort, 'song')}</p>`}

        <h3>Their Album Ranking</h3>
        ${albumList || `<p class="dimmed no-rank">${describeSort(guest.albumSort, 'album')}</p>`}
      </div>

      <div class="result-actions">
        ${guest.songSort && guest.songSort.result
          ? `<button class="cta-btn" onclick="copyGuestRanking()">Copy Their List</button>` : ''}
        <button class="ghost-btn" onclick="exitGuest()">Back To Mine</button>
        <button class="ghost-btn" onclick="adoptGuest()">Use As Mine</button>
      </div>
      <p class="dimmed">Use As Mine replaces everything you have with this. That is how you move your own profile to a new browser.</p>
    </div>`;
  window.scrollTo(0, 0);
}

function copyGuestRanking() {
  if (!guest || !guest.songSort || !guest.songSort.result) return;
  const text = guest.songSort.result.map(r => `${r.rank}. ${r.title}`).join('\n');
  copyRanking(text);
}

function resetProfile() {
  if (!confirm('Reset all data? This cannot be undone.')) return;
  Profile.reset();
  profile = Profile.load();
  renderProfileBadge();
  renderProfileView();
  showToast('Data reset.');
}

// Utilities
// The junk drawer. Every project has one and pretending otherwise is how
// you end up with four of them.

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeTick(s) { return s.replace(/`/g, '\\`'); }

let toastTimer = null;

function showToast(msg, type = '') {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  clearTimeout(toastTimer);

  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));

  toastTimer = setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 300);
  }, 2200);
}
