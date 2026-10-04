// The discography. Newest release first, tracks in album order, and every
// year checked against Wikipedia rather than vibes, because the first draft
// had Vena in 2011 and Final Destination in 2007 and I only found out after
// someone could have noticed.
//
// The "sid" on everything is a permanent number that seeds are built from.
// It is NOT the position in these lists. That distinction is the only thing
// standing between you and silently corrupting every saved profile the next
// time you reorder a tracklist. Give a new entry the next unused number.
// Never, ever reuse one.
// Next free song sid: 130. Next free album sid: 18.
//
// Album sids 1, 11, 12 and 16 are retired and are staying that way. The
// graveyard, for the curious: the Optimize EP became disc one of OPTIMIZE =
// OPTDEMISE, the "Singles & B-Sides" bucket got split into the two real maxi
// singles, Until The End turned out to be the back half of The Revelation's
// reissue, and NEW DAWN got absorbed into the Singles group. Four
// restructures. Zero broken seeds. Worth every argument.
const CR = {

  // Two flags, pulling in opposite directions, both earned the hard way:
  //
  //   guess:false  -- rankable, but kept out of Name The Songs. Only the
  //                   re-recorded Final Destination, whose twelve titles are
  //                   already on the 2009 album and would be free points. A
  //                   single track can set guess:true to climb back out.
  //   rank:false   -- sortable and nameable, but never in an album ranking.
  //                   Only Singles, because putting two standalone singles up
  //                   against Vena in a head to head is not a question.
  //
  // A song in the Singles group carries its own year and kind, which is what
  // gets it onto the Info timeline as a release in its own right. "mo" is the
  // month and only exists where two things share a year and would otherwise
  // sort by whatever order the loop happened to run in.
  albums: [
    { id:"oo",   sid:13, title:"OPTIMIZE = OPTDEMISE",            kind:"Album",   img:"img/crsong/cr_oo.jpg",  year:2026 },
    { id:"fdr",  sid:4,  title:"Final Destination (Re-Recorded)", kind:"Album",   img:"img/crsong/cr_fdr.jpg", year:2024, guess:false },
    { id:"sng",  sid:17, title:"Singles",                         kind:"Singles", img:"img/crsong/cr_nd.jpg",  year:null, rank:false },
    { id:"nn",   sid:5,  title:"Nonnegative",                     kind:"Album",   img:"img/crsong/cr_nn.jpg",  year:2022 },
    { id:"tsf",  sid:6,  title:"The Side Effects",                kind:"Album",   img:"img/crsong/cr_tsf.jpg", year:2019 },
    { id:"f",    sid:7,  title:"Fateless",                        kind:"Album",   img:"img/crsong/cr_f.jpg",   year:2017 },
    { id:"v",    sid:8,  title:"Vena",                            kind:"Album",   img:"img/crsong/cr_v.jpg",   year:2015 },
    { id:"tr",   sid:0,  title:"The Revelation",                  kind:"Album",   img:"img/crsong/cr_tr.jpg",  year:2013 },
    { id:"tc",   sid:2,  title:"Through Clarity",                 kind:"EP",      img:"img/crsong/cr_tc.jpg",  year:2012 },
    { id:"tei",  sid:9,  title:"The Enemy Inside",                kind:"Album",   img:"img/crsong/cr_tei.jpg", year:2011 },
    { id:"nlf",  sid:3,  title:"Nothing Lasts Forever",           kind:"EP",      img:"img/crsong/cr_nlf.jpg", year:2010 },
    { id:"fd",   sid:10, title:"Final Destination",               kind:"Album",   img:"img/crsong/cr_fd.jpg",  year:2009, mo:10 },
    { id:"8am",  sid:15, title:"8AM",                             kind:"Maxi Single",  img:"img/crsong/cr_8.jpg",   year:2009, mo:4 },
    { id:"fic",  sid:14, title:"Fiction",                         kind:"Maxi Single",  img:"img/crsong/cr_fi.jpg",  year:2008 },
  ],

  songs: [
    // OPTIMIZE = OPTDEMISE (2026). Disc one is the 2025 Optimize EP note for
    // note, so those five keep the EP sleeve. Everything after it gets the
    // crane. Six of these are not out yet at time of writing, so good luck
    // naming them.
    {sid:18,  title:"OPTIMIZE",                      albumId:"oo",   img:"img/crsong/cr_o.jpg"},
    {sid:17,  title:"CHASING SHADOWS",               albumId:"oo",   img:"img/crsong/cr_o.jpg"},
    {sid:19,  title:"DIGITOLL",                      albumId:"oo",   img:"img/crsong/cr_o.jpg"},
    {sid:16,  title:"INCOMPLETE",                    albumId:"oo",   img:"img/crsong/cr_o.jpg"},
    {sid:15,  title:"FREE FALL",                     albumId:"oo",   img:"img/crsong/cr_o.jpg"},
    {sid:123, title:"EX-HUMANITY",                   albumId:"oo",   img:"img/crsong/cr_oo.jpg"},
    {sid:124, title:"REST OF ME",                    albumId:"oo",   img:"img/crsong/cr_oo.jpg"},
    {sid:20,  title:"POISON",                        albumId:"oo",   img:"img/crsong/cr_oo.jpg"},
    {sid:125, title:"G.I.A.I.G",                     albumId:"oo",   img:"img/crsong/cr_oo.jpg"},
    {sid:126, title:"SING",                          albumId:"oo",   img:"img/crsong/cr_oo.jpg"},
    {sid:127, title:"PICTURE PERFECT HELL",          albumId:"oo",   img:"img/crsong/cr_oo.jpg"},
    {sid:128, title:"SAVIOR",                        albumId:"oo",   img:"img/crsong/cr_oo.jpg"},

    // Final Destination XV Re:Recorded (2024). Skipped by Name The Songs,
    // because typing "Fiction" and scoring twice is not a memory test.
    {sid:33,  title:"Final Destination (Re-Rec.)",   albumId:"fdr",  img:"img/crsong/cr_fdr.jpg"},
    {sid:34,  title:"Counterfeits & Lies (Re-Rec.)", albumId:"fdr",  img:"img/crsong/cr_fdr.jpg"},
    {sid:35,  title:"Someday (Re-Rec.)",             albumId:"fdr",  img:"img/crsong/cr_fdr.jpg"},
    {sid:36,  title:"Fiction (Re-Rec.)",             albumId:"fdr",  img:"img/crsong/cr_fdr.jpg"},
    {sid:37,  title:"Just Tonight (Re-Rec.)",        albumId:"fdr",  img:"img/crsong/cr_fdr.jpg"},
    {sid:38,  title:"24-7 (Re-Rec.)",                albumId:"fdr",  img:"img/crsong/cr_fdr.jpg"},
    {sid:39,  title:"Doors (Re-Rec.)",               albumId:"fdr",  img:"img/crsong/cr_fdr.jpg"},
    {sid:40,  title:"Deja Vu (Re-Rec.)",             albumId:"fdr",  img:"img/crsong/cr_fdr.jpg"},
    {sid:41,  title:"Survive (Re-Rec.)",             albumId:"fdr",  img:"img/crsong/cr_fdr.jpg"},
    {sid:42,  title:"My Addiction (Re-Rec.)",        albumId:"fdr",  img:"img/crsong/cr_fdr.jpg"},
    {sid:43,  title:"Painting (Re-Rec.)",            albumId:"fdr",  img:"img/crsong/cr_fdr.jpg"},
    {sid:44,  title:"8AM (Re-Rec.)",                 albumId:"fdr",  img:"img/crsong/cr_fdr.jpg"},

    // Standalone singles plus one demo track. Sortable, nameable, and firmly
    // not a release, so they stay out of album rankings.
    //
    // Been So Long was on the self-titled demo Gil Soundworks put out on 11
    // January 2008 and has never surfaced since, which makes it the rarest
    // thing the band has recorded and the single hardest point on this site.
    // No year on it deliberately, so it stays off the timeline.
    {sid:45,  title:"Vengeance",                     albumId:"sng",  img:"img/crsong/cr_fdr.jpg", year:2024, kind:"Single"},
    {sid:121, title:"New Dawn",                      albumId:"sng",  img:"img/crsong/cr_nd.jpg",  year:2023, kind:"Single"},
    {sid:129, title:"Been So Long",                  albumId:"sng",  img:"img/crsong/cr_1.jpg"},

    // Nonnegative (2022)
    {sid:46,  title:"Help Me Help You",              albumId:"nn",   img:"img/crsong/cr_nn.jpg"},
    {sid:47,  title:"Calling",                       albumId:"nn",   img:"img/crsong/cr_nn.jpg"},
    {sid:48,  title:"Cut Me",                        albumId:"nn",   img:"img/crsong/cr_nn.jpg"},
    {sid:49,  title:"Before I Go",                   albumId:"nn",   img:"img/crsong/cr_nn.jpg"},
    {sid:50,  title:"Bloody Power Fame",             albumId:"nn",   img:"img/crsong/cr_nn.jpg"},
    {sid:51,  title:"Here With You",                 albumId:"nn",   img:"img/crsong/cr_nn.jpg"},
    {sid:52,  title:"Boys And Girls",                albumId:"nn",   img:"img/crsong/cr_nn.jpg"},
    {sid:53,  title:"Paradise (Kill the Silence)",   albumId:"nn",   img:"img/crsong/cr_nn.jpg"},
    {sid:54,  title:"2020",                          albumId:"nn",   img:"img/crsong/cr_nn.jpg"},
    {sid:55,  title:"Rabbit Hole",                   albumId:"nn",   img:"img/crsong/cr_nn.jpg"},
    {sid:56,  title:"Don't Speak",                   albumId:"nn",   img:"img/crsong/cr_nn.jpg"},
    {sid:57,  title:"From Today",                    albumId:"nn",   img:"img/crsong/cr_nn.jpg"},

    // The Side Effects (2019)
    {sid:58,  title:"Mayday",                        albumId:"tsf",  img:"img/crsong/cr_tsf.jpg"},
    {sid:59,  title:"Coexist",                       albumId:"tsf",  img:"img/crsong/cr_tsf.jpg"},
    {sid:60,  title:"See You",                       albumId:"tsf",  img:"img/crsong/cr_tsf.jpg"},
    {sid:61,  title:"Speak",                         albumId:"tsf",  img:"img/crsong/cr_tsf.jpg"},
    {sid:62,  title:"The Side Effects",              albumId:"tsf",  img:"img/crsong/cr_tsf.jpg"},
    {sid:63,  title:"January 1st",                   albumId:"tsf",  img:"img/crsong/cr_tsf.jpg"},
    {sid:64,  title:"Insomnia",                      albumId:"tsf",  img:"img/crsong/cr_tsf.jpg"},
    {sid:65,  title:"Answer/Sickness",               albumId:"tsf",  img:"img/crsong/cr_tsf.jpg"},
    {sid:66,  title:"Breathe",                       albumId:"tsf",  img:"img/crsong/cr_tsf.jpg"},
    {sid:67,  title:"Stay The Course",               albumId:"tsf",  img:"img/crsong/cr_tsf.jpg"},
    {sid:68,  title:"Revolution",                    albumId:"tsf",  img:"img/crsong/cr_tsf.jpg"},
    {sid:69,  title:"Li(e)fe",                       albumId:"tsf",  img:"img/crsong/cr_tsf.jpg"},

    // Fateless (2017)
    {sid:70,  title:"Envy",                          albumId:"f",    img:"img/crsong/cr_f.jpg"},
    {sid:71,  title:"Feed the Fire",                 albumId:"f",    img:"img/crsong/cr_f.jpg"},
    {sid:72,  title:"Lost in Faith",                 albumId:"f",    img:"img/crsong/cr_f.jpg"},
    {sid:73,  title:"Bury Me",                       albumId:"f",    img:"img/crsong/cr_f.jpg"},
    {sid:74,  title:"R.I.P",                         albumId:"f",    img:"img/crsong/cr_f.jpg"},
    {sid:75,  title:"Inside Out",                    albumId:"f",    img:"img/crsong/cr_f.jpg"},
    {sid:76,  title:"Stay",                          albumId:"f",    img:"img/crsong/cr_f.jpg"},
    {sid:77,  title:"Colorblind",                    albumId:"f",    img:"img/crsong/cr_f.jpg"},
    {sid:78,  title:"F.T.T.T",                       albumId:"f",    img:"img/crsong/cr_f.jpg"},
    {sid:79,  title:"Uninvited",                     albumId:"f",    img:"img/crsong/cr_f.jpg"},
    {sid:80,  title:"Aftermath",                     albumId:"f",    img:"img/crsong/cr_f.jpg"},
    {sid:81,  title:"A Decade in the Rain",          albumId:"f",    img:"img/crsong/cr_f.jpg"},

    // Vena (2015). The last two turned up on the Vena II maxi-single a year
    // later and are close enough to bonus tracks to live here.
    {sid:82,  title:"Vena",                          albumId:"v",    img:"img/crsong/cr_v.jpg"},
    {sid:83,  title:"Wrong",                         albumId:"v",    img:"img/crsong/cr_v.jpg"},
    {sid:84,  title:"Divine",                        albumId:"v",    img:"img/crsong/cr_v.jpg"},
    {sid:85,  title:"Gone",                          albumId:"v",    img:"img/crsong/cr_v.jpg"},
    {sid:86,  title:"Words of the Youth",            albumId:"v",    img:"img/crsong/cr_v.jpg"},
    {sid:87,  title:"The Story",                     albumId:"v",    img:"img/crsong/cr_v.jpg"},
    {sid:88,  title:"Whole",                         albumId:"v",    img:"img/crsong/cr_v.jpg"},
    {sid:89,  title:"Runaway",                       albumId:"v",    img:"img/crsong/cr_v.jpg"},
    {sid:90,  title:"Pretty Little Liar",            albumId:"v",    img:"img/crsong/cr_v.jpg"},
    {sid:91,  title:"Heart of the Young",            albumId:"v",    img:"img/crsong/cr_v.jpg"},
    {sid:92,  title:"Fire in the Sky",               albumId:"v",    img:"img/crsong/cr_v.jpg"},
    {sid:93,  title:"Born to Bleed",                 albumId:"v",    img:"img/crsong/cr_v.jpg"},
    {sid:94,  title:"Undertow",                      albumId:"v",    img:"img/crsong/cr_v.jpg"},

    // The Revelation (2013), as the sixteen-track Australian deluxe, which is
    // the only edition that contains everything and therefore the only one
    // worth modelling
    {sid:1,   title:"The War is On",                 albumId:"tr",   img:"img/crsong/cr_tr.jpg"},
    {sid:2,   title:"The Revelation",                albumId:"tr",   img:"img/crsong/cr_tr.jpg"},
    {sid:13,  title:"Falling Forever",               albumId:"tr",   img:"img/crsong/cr_tr.jpg"},
    {sid:8,   title:"Behind the Curtain",            albumId:"tr",   img:"img/crsong/cr_tr.jpg"},
    {sid:14,  title:"Next to You",                   albumId:"tr",   img:"img/crsong/cr_tr.jpg"},
    {sid:5,   title:"Time Bomb",                     albumId:"tr",   img:"img/crsong/cr_tr.jpg"},
    {sid:10,  title:"Voiceless",                     albumId:"tr",   img:"img/crsong/cr_tr.jpg"},
    {sid:11,  title:"Chasing Dreams",                albumId:"tr",   img:"img/crsong/cr_tr.jpg"},
    {sid:4,   title:"Given Up on You",               albumId:"tr",   img:"img/crsong/cr_tr.jpg"},
    {sid:12,  title:"Carry On",                      albumId:"tr",   img:"img/crsong/cr_tr.jpg"},
    // The 2014 reissue pulled these five off the Until The End EP and the
    // deluxe tacked House Of Cards on the end, which is why that EP no longer
    // exists as its own thing here.
    {sid:9,   title:"Aware and Awake",               albumId:"tr",   img:"img/crsong/cr_tr.jpg"},
    {sid:7,   title:"Evolve",                        albumId:"tr",   img:"img/crsong/cr_tr.jpg"},
    {sid:6,   title:"You Lie",                       albumId:"tr",   img:"img/crsong/cr_tr.jpg"},
    {sid:3,   title:"Fade Away",                     albumId:"tr",   img:"img/crsong/cr_tr.jpg"},
    {sid:122, title:"March On",                      albumId:"tr",   img:"img/crsong/cr_tr.jpg"},
    // Deluxe only, and it keeps the Until The End sleeve, because that is the
    // cover it actually came out under and the per-song art field exists for
    // exactly one situation and this is it
    {sid:0,   title:"House Of Cards",                albumId:"tr",   img:"img/crsong/cr_ute.jpg"},

    // Through Clarity (EP, 2012)
    {sid:21,  title:"No Escape",                     albumId:"tc",   img:"img/crsong/cr_tc.jpg"},
    {sid:22,  title:"Persona",                       albumId:"tc",   img:"img/crsong/cr_tc.jpg"},
    {sid:23,  title:"The Future",                    albumId:"tc",   img:"img/crsong/cr_tc.jpg"},
    {sid:24,  title:"Six Feet Under",                albumId:"tc",   img:"img/crsong/cr_tc.jpg"},
    {sid:25,  title:"Never Look Away",               albumId:"tc",   img:"img/crsong/cr_tc.jpg"},
    {sid:26,  title:"Inside of Me",                  albumId:"tc",   img:"img/crsong/cr_tc.jpg"},

    // The Enemy Inside (2011)
    {sid:95,  title:"To Be Alive",                   albumId:"tei",  img:"img/crsong/cr_tei.jpg"},
    {sid:96,  title:"New Fate",                      albumId:"tei",  img:"img/crsong/cr_tei.jpg"},
    {sid:97,  title:"Rescue Me",                     albumId:"tei",  img:"img/crsong/cr_tei.jpg"},
    {sid:98,  title:"Adrenaline",                    albumId:"tei",  img:"img/crsong/cr_tei.jpg"},
    {sid:99,  title:"You",                           albumId:"tei",  img:"img/crsong/cr_tei.jpg"},
    {sid:100, title:"The Maze",                      albumId:"tei",  img:"img/crsong/cr_tei.jpg"},
    {sid:101, title:"Rise and Fall",                 albumId:"tei",  img:"img/crsong/cr_tei.jpg"},
    {sid:102, title:"Confession",                    albumId:"tei",  img:"img/crsong/cr_tei.jpg"},
    {sid:103, title:"A Tragic Instinct",             albumId:"tei",  img:"img/crsong/cr_tei.jpg"},
    {sid:104, title:"Hollow",                        albumId:"tei",  img:"img/crsong/cr_tei.jpg"},

    // Nothing Lasts Forever (EP, 2010)
    {sid:27,  title:"Die Tomorrow",                  albumId:"nlf",  img:"img/crsong/cr_nlf.jpg"},
    {sid:28,  title:"We're Not Alone",               albumId:"nlf",  img:"img/crsong/cr_nlf.jpg"},
    {sid:29,  title:"Stuck",                         albumId:"nlf",  img:"img/crsong/cr_nlf.jpg"},
    {sid:30,  title:"After Dark",                    albumId:"nlf",  img:"img/crsong/cr_nlf.jpg"},
    {sid:31,  title:"The Youth",                     albumId:"nlf",  img:"img/crsong/cr_nlf.jpg"},
    {sid:32,  title:"Miss You",                      albumId:"nlf",  img:"img/crsong/cr_nlf.jpg"},

    // Final Destination (2009)
    {sid:105, title:"Final Destination",             albumId:"fd",   img:"img/crsong/cr_fd.jpg"},
    {sid:106, title:"Counterfeits & Lies",           albumId:"fd",   img:"img/crsong/cr_fd.jpg"},
    {sid:107, title:"Someday",                       albumId:"fd",   img:"img/crsong/cr_fd.jpg"},
    {sid:108, title:"Fiction",                       albumId:"fd",   img:"img/crsong/cr_fd.jpg"},
    {sid:109, title:"Just Tonight",                  albumId:"fd",   img:"img/crsong/cr_fd.jpg"},
    {sid:110, title:"24-7",                          albumId:"fd",   img:"img/crsong/cr_fd.jpg"},
    {sid:111, title:"Doors",                         albumId:"fd",   img:"img/crsong/cr_fd.jpg"},
    {sid:112, title:"Deja Vu",                       albumId:"fd",   img:"img/crsong/cr_fd.jpg"},
    {sid:113, title:"Survive",                       albumId:"fd",   img:"img/crsong/cr_fd.jpg"},
    {sid:114, title:"My Addiction",                  albumId:"fd",   img:"img/crsong/cr_fd.jpg"},
    {sid:115, title:"Painting",                      albumId:"fd",   img:"img/crsong/cr_fd.jpg"},
    {sid:116, title:"8AM",                           albumId:"fd",   img:"img/crsong/cr_fd.jpg"},

    // 8AM (maxi single, 2009). The title track is already on Final
    // Destination and the unplugged Fiction went out with the other acoustic
    // versions, so what is left is the two B-sides. A single that does not
    // contain its own single. Sure.
    {sid:117, title:"Time to Go",                    albumId:"8am",  img:"img/crsong/cr_8.jpg"},
    {sid:118, title:"Believe",                       albumId:"8am",  img:"img/crsong/cr_8.jpg"},

    // Fiction (maxi single, 2008). Same story, same shrug.
    {sid:119, title:"Come Awake",                    albumId:"fic",  img:"img/crsong/cr_fi.jpg"},
    {sid:120, title:"I Know",                        albumId:"fic",  img:"img/crsong/cr_fi.jpg"},
  ],
};
