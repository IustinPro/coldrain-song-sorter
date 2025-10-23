// 2008/7/3 Scripted by K-Factory@migiwa
// 2009/1/27 Modified by K-Factory@migiwa
// 2025/10/10 coldrain Fork by IustinPro

// *****************************************************************************
str_CenterT = 'Tie!';
str_CenterB = 'Undo last choice';

str_ImgPath = 'img/';
// 0:順番に　1:昔の
var bln_ResultMode = 1;
// 0:テキスト　1:イラスト　2:テキスト＋イラスト
var int_ResultImg = 2;
// イラスト表示時、何位までをイラスト表示にするか。
var int_ResultRank = 3;

// ソート用のテーブルを
// 0:残す　1:消す
var bln_ResultStyle = 0;

// ソート進捗バーの表示
// 0:表示　1:消す
var bln_ProgessBar = 1;

// Maximum number of result rows before being broken off into another table.
var maxRows = 20;

// * タイトル情報（編集可能。最後の行に”,”を付けないようにしてください）
var int_Colspan = 14;
var ary_TitleData = [
  "Until The End",
  "Optimize",
  "Through Clarity",
  "Nothing Lasts Forever",
  "Final Destination (Re-Recorded)",
  "Nonnegative",
  "The Side Effects",
  "Fateless",
  "Vena",
  "The Revelation",
  "The Enemy Inside",
  "Final Destination",
  "Maxi Singles",
  "Other"
];
// * キャラクター情報（編集可能。最後の行に”,”を付けないようにしてください）
// * 使用フラグ（0にするとソートに入りません）, 
//   "タイトルID"（先頭から0, 1, 2...）, 
//   {タイトル別参加フラグ}（1を入れると対象タイトルに入ります）,
//   "キャラクター名", "画像（空白の場合、キャラクター名が使用されます）"
//                                      [1,2,3,4,5,6,7,8,9,
var ary_CharacterData = [
// Until The End
[1, "House Of Cards", [1,0,0,0,0,0,0,0,0,0,0,0,0,0], "crsong/cr_ute.jpg"],


// Optimize
[1, "FREE FALL", [0,1,0,0,0,0,0,0,0,0,0,0,0,0], "crsong/cr_o.jpg"],
[1, "INCOMPLETE", [0,1,0,0,0,0,0,0,0,0,0,0,0,0], "crsong/cr_o.jpg"],
[1, "CHASING SHADOWS", [0,1,0,0,0,0,0,0,0,0,0,0,0,0], "crsong/cr_o.jpg"],
[1, "OPTIMIZE", [0,1,0,0,0,0,0,0,0,0,0,0,0,0], "crsong/cr_o.jpg"],
[1, "DIGITOLL", [0,1,0,0,0,0,0,0,0,0,0,0,0,0], "crsong/cr_o.jpg"],

// Through Clarity
[1, "No Escape", [0,0,1,0,0,0,0,0,0,0,0,0,0,0], "crsong/cr_tc.jpg"],
[1, "Persona", [0,0,1,0,0,0,0,0,0,0,0,0,0,0], "crsong/cr_tc.jpg"],
[1, "The Future", [0,0,1,0,0,0,0,0,0,0,0,0,0,0], "crsong/cr_tc.jpg"],
[1, "Six Feet Under", [0,0,1,0,0,0,0,0,0,0,0,0,0,0], "crsong/cr_tc.jpg"],
[1, "Never Look Away", [0,0,1,0,0,0,0,0,0,0,0,0,0,0], "crsong/cr_tc.jpg"],
[1, "Inside of Me", [0,0,1,0,0,0,0,0,0,0,0,0,0,0], "crsong/cr_tc.jpg"],

// Nothing Lasts Forever
[1, "Die Tommorow", [0,0,0,1,0,0,0,0,0,0,0,0,0,0], "crsong/cr_nlf.jpg"],
[1, "Were Not Alone", [0,0,0,1,0,0,0,0,0,0,0,0,0,0], "crsong/cr_nlf.jpg"],
[1, "Stuck", [0,0,0,1,0,0,0,0,0,0,0,0,0,0], "crsong/cr_nlf.jpg"],
[1, "After Dark", [0,0,0,1,0,0,0,0,0,0,0,0,0,0], "crsong/cr_nlf.jpg"],
[1, "The Youth", [0,0,0,1,0,0,0,0,0,0,0,0,0,0], "crsong/cr_nlf.jpg"],
[1, "Miss You", [0,0,0,1,0,0,0,0,0,0,0,0,0,0], "crsong/cr_nlf.jpg"],

// Final Destination (Re-Recorded)
[1, "Final Destination (Re-Recorded)", [0,0,0,0,1,0,0,0,0,0,0,0,0,0], "crsong/cr_fdr.jpg"],
[1, "Counterfits & Lies (Re-Recorded)", [0,0,0,0,1,0,0,0,0,0,0,0,0,0], "crsong/cr_fdr.jpg"],
[1, "Someday (Re-Recorded)", [0,0,0,0,1,0,0,0,0,0,0,0,0,0], "crsong/cr_fdr.jpg"],
[1, "Fiction (Re-Recorded)", [0,0,0,0,1,0,0,0,0,0,0,0,0,0], "crsong/cr_fdr.jpg"],
[1, "Just Tonight (Re-Recorded)", [0,0,0,0,1,0,0,0,0,0,0,0,0,0], "crsong/cr_fdr.jpg"],
[1, "24-7 (Re-Recorded)", [0,0,0,0,1,0,0,0,0,0,0,0,0,0], "crsong/cr_fdr.jpg"],
[1, "Doors (Re-Recorded)", [0,0,0,0,1,0,0,0,0,0,0,0,0,0], "crsong/cr_fdr.jpg"],
[1, "Deja Vu (Re-Recorded)", [0,0,0,0,1,0,0,0,0,0,0,0,0,0], "crsong/cr_fdr.jpg"],
[1, "Survive (Re-Recorded)", [0,0,0,0,1,0,0,0,0,0,0,0,0,0], "crsong/cr_fdr.jpg"],
[1, "My Addiction (Re-Recorded)", [0,0,0,0,1,0,0,0,0,0,0,0,0,0], "crsong/cr_fdr.jpg"],
[1, "Painting (Re-Recorded)", [0,0,0,0,1,0,0,0,0,0,0,0,0,0], "crsong/cr_fdr.jpg"],
[1, "8AM (Re-Recorded)", [0,0,0,0,1,0,0,0,0,0,0,0,0,0], "crsong/cr_fdr.jpg"],
[1, "Vengeance", [0,0,0,0,1,0,0,0,0,0,0,0,0,0], "crsong/cr_fdr.jpg"],

// Nonnegative
[1, "Help Me Help You", [0,0,0,0,0,1,0,0,0,0,0,0,0,0], "crsong/cr_nn.jpg"],
[1, "Calling", [0,0,0,0,0,1,0,0,0,0,0,0,0,0], "crsong/cr_nn.jpg"],
[1, "Cut Me", [0,0,0,0,0,1,0,0,0,0,0,0,0,0], "crsong/cr_nn.jpg"],
[1, "Before I Go", [0,0,0,0,0,1,0,0,0,0,0,0], "crsong/cr_nn.jpg"],
[1, "Bloody Power Fame", [0,0,0,0,0,1,0,0,0,0,0,0,0,0], "crsong/cr_nn.jpg"],
[1, "Here With You", [0,0,0,0,0,1,0,0,0,0,0,0,0,0], "crsong/cr_nn.jpg"],
[1, "Boys And Girls", [0,0,0,0,0,1,0,0,0,0,0,0,0,0], "crsong/cr_nn.jpg"],
[1, "Paradise (Kill the SIlence)", [0,0,0,0,0,1,0,0,0,0,0,0,0,0], "crsong/cr_nn.jpg"],
[1, "2020", [0,0,0,0,0,1,0,0,0,0,0,0,0,0], "crsong/cr_nn.jpg"],
[1, "Rabbit Hole", [0,0,0,0,0,1,0,0,0,0,0,0,0,0], "crsong/cr_nn.jpg"],
[1, "Dont Speak", [0,0,0,0,0,1,0,0,0,0,0,0,0,0], "crsong/cr_nn.jpg"],
[1, "From Today", [0,0,0,0,0,1,0,0,0,0,0,0,0,0], "crsong/cr_nn.jpg"],

// The Side Effects
[1, "Mayday", [0,0,0,0,0,0,1,0,0,0,0,0,0,0], "crsong/cr_tsf.jpg"],
[1, "Coexist", [0,0,0,0,0,0,1,0,0,0,0,0,0,0], "crsong/cr_tsf.jpg"],
[1, "See You", [0,0,0,0,0,0,1,0,0,0,0,0,0,0], "crsong/cr_tsf.jpg"],
[1, "Speak", [0,0,0,0,0,0,1,0,0,0,0,0,0,0], "crsong/cr_tsf.jpg"],
[1, "The Side Effects", [0,0,0,0,0,0,1,0,0,0,0,0,0,0], "crsong/cr_tsf.jpg"],
[1, "January 1st", [0,0,0,0,0,0,1,0,0,0,0,0,0,0], "crsong/cr_tsf.jpg"],
[1, "Insomnia", [0,0,0,0,0,0,1,0,0,0,0,0,0,0], "crsong/cr_tsf.jpg"],
[1, "Answer/Sickness", [0,0,0,0,0,0,1,0,0,0,0,0,0,0], "crsong/cr_tsf.jpg"],
[1, "Breathe", [0,0,0,0,0,0,1,0,0,0,0,0,0,0], "crsong/cr_tsf.jpg"],
[1, "Stay The Course", [0,0,0,0,0,0,1,0,0,0,0,0,0,0], "crsong/cr_tsf.jpg"],
[1, "Revolution", [0,0,0,0,0,0,1,0,0,0,0,0,0,0], "crsong/cr_tsf.jpg"],
[1, "Li(e)fe", [0,0,0,0,0,0,1,0,0,0,0,0,0,0], "crsong/cr_tsf.jpg"],

// Fateless
[1, "Envy", [0,0,0,0,0,0,0,1,0,0,0,0,0,0], "crsong/cr_f.jpg"],
[1, "Feed the Fire", [0,0,0,0,0,0,0,1,0,0,0,0,0,0], "crsong/cr_f.jpg"],
[1, "Lost in Faith", [0,0,0,0,0,0,0,1,0,0,0,0,0,0], "crsong/cr_f.jpg"],
[1, "Bury Me", [0,0,0,0,0,0,0,1,0,0,0,0,0,0], "crsong/cr_f.jpg"],
[1, "R.I.P", [0,0,0,0,0,0,0,1,0,0,0,0,0,0], "crsong/cr_f.jpg"],
[1, "Inside Out", [0,0,0,0,0,0,0,1,0,0,0,0,0,0], "crsong/cr_f.jpg"],
[1, "Stay", [0,0,0,0,0,0,0,1,0,0,0,0,0,0], "crsong/cr_f.jpg"],
[1, "Colorblind", [0,0,0,0,0,0,0,1,0,0,0,0,0,0], "crsong/cr_f.jpg"],
[1, "F.T.T.T", [0,0,0,0,0,0,0,1,0,0,0,0,0,0], "crsong/cr_f.jpg"],
[1, "Uninvited", [0,0,0,0,0,0,0,1,0,0,0,0,0,0], "crsong/cr_f.jpg"],
[1, "Aftermath", [0,0,0,0,0,0,0,1,0,0,0,0,0,0], "crsong/cr_f.jpg"],
[1, "A Decade in the Rain", [0,0,0,0,0,0,0,1,0,0,0,0,0,0], "crsong/cr_f.jpg"],

// Vena (Vena II included)
[1, "Vena", [0,0,0,0,0,0,0,0,1,0,0,0,0,0], "crsong/cr_v.jpg"],
[1, "Wrong", [0,0,0,0,0,0,0,0,1,0,0,0,0,0], "crsong/cr_v.jpg"],
[1, "Divine", [0,0,0,0,0,0,0,0,1,0,0,0,0,0], "crsong/cr_v.jpg"],
[1, "Gone", [0,0,0,0,0,0,0,0,1,0,0,0,0,0], "crsong/cr_v.jpg"],
[1, "Words of the Youth", [0,0,0,0,0,0,0,0,1,0,0,0,0,0], "crsong/cr_v.jpg"],
[1, "The Story", [0,0,0,0,0,0,0,0,1,0,0,0,0,0], "crsong/cr_v.jpg"],
[1, "Whole", [0,0,0,0,0,0,0,0,1,0,0,0,0,0], "crsong/cr_v.jpg"],
[1, "Runaway", [0,0,0,0,0,0,0,0,1,0,0,0,0,0], "crsong/cr_v.jpg"],
[1, "Pretty Little Liar", [0,0,0,0,0,0,0,0,1,0,0,0,0,0], "crsong/cr_v.jpg"],
[1, "Heart of the Young", [0,0,0,0,0,0,0,0,1,0,0,0,0,0], "crsong/cr_v.jpg"],
[1, "Fire in the Sky", [0,0,0,0,0,0,0,0,1,0,0,0,0,0], "crsong/cr_v.jpg"],
[1, "Born to Bleed", [0,0,0,0,0,0,0,0,1,0,0,0,0,0], "crsong/cr_v.jpg"],
[1, "Undertow", [0,0,0,0,0,0,0,0,1,0,0,0,0,0], "crsong/cr_v.jpg"],
[1, "Gone (Acoustic)", [0,0,0,0,0,0,0,0,1,0,0,0,0,0], "crsong/cr_v.jpg"],
[1, "The Story (Acoustic)", [0,0,0,0,0,0,0,0,1,0,0,0,0,0], "crsong/cr_v.jpg"],

// The Revelation
[1, "The War is On", [0,0,0,0,0,0,0,0,0,1,0,0,0,0], "crsong/cr_tr.jpg"],
[1, "The Revelation", [0,0,0,0,0,0,0,0,0,1,0,0,0,0], "crsong/cr_tr.jpg"],
[1, "Fade Away", [0,0,0,0,0,0,0,0,0,1,0,0,0,0], "crsong/cr_tr.jpg"],
[1, "Given Up on You", [0,0,0,0,0,0,0,0,0,1,0,0,0,0], "crsong/cr_tr.jpg"],
[1, "Time Bomb", [0,0,0,0,0,0,0,0,0,1,0,0,0,0], "crsong/cr_tr.jpg"],
[1, "You Lie", [0,0,0,0,0,0,0,0,0,1,0,0,0,0], "crsong/cr_tr.jpg"],
[1, "Evolve", [0,0,0,0,0,0,0,0,0,1,0,0,0,0], "crsong/cr_tr.jpg"],
[1, "Behind the Curtain", [0,0,0,0,0,0,0,0,0,1,0,0,0,0], "crsong/cr_tr.jpg"],
[1, "Aware and Awake", [0,0,0,0,0,0,0,0,0,1,0,0,0,0], "crsong/cr_tr.jpg"],
[1, "Voiceless", [0,0,0,0,0,0,0,0,0,1,0,0,0,0], "crsong/cr_tr.jpg"],
[1, "Chasing Dreams", [0,0,0,0,0,0,0,0,0,1,0,0,0,0], "crsong/cr_tr.jpg"],
[1, "Carry On", [0,0,0,0,0,0,0,0,0,1,0,0,0,0], "crsong/cr_tr.jpg"],
[1, "Falling Forever", [0,0,0,0,0,0,0,0,0,1,0,0,0,0], "crsong/cr_tr.jpg"],
[1, "Next to You", [0,0,0,0,0,0,0,0,0,1,0,0,0,0], "crsong/cr_tr.jpg"],

// The Enemy Inside
[1, "To Be Alive", [0,0,0,0,0,0,0,0,0,0,1,0,0,0], "crsong/cr_tei.jpg"],
[1, "New Fate", [0,0,0,0,0,0,0,0,0,0,1,0,0,0], "crsong/cr_tei.jpg"],
[1, "Rescue Me", [0,0,0,0,0,0,0,0,0,0,1,0,0,0], "crsong/cr_tei.jpg"],
[1, "Adrenaline", [0,0,0,0,0,0,0,0,0,0,1,0,0,0], "crsong/cr_tei.jpg"],
[1, "You", [0,0,0,0,0,0,0,0,0,0,1,0,0,0], "crsong/cr_tei.jpg"],
[1, "The Maze", [0,0,0,0,0,0,0,0,0,0,1,0,0,0], "crsong/cr_tei.jpg"],
[1, "Rise and Fall", [0,0,0,0,0,0,0,0,0,0,1,0,0,0], "crsong/cr_tei.jpg"],
[1, "Confession", [0,0,0,0,0,0,0,0,0,0,1,0,0,0], "crsong/cr_tei.jpg"],
[1, "A Tragic Instinct", [0,0,0,0,0,0,0,0,0,0,1,0,0,0], "crsong/cr_tei.jpg"],
[1, "Hollow", [0,0,0,0,0,0,0,0,0,0,1,0,0,0], "crsong/cr_tei.jpg"],

// Final Destination
[1, "Final Destination", [0,0,0,0,0,0,0,0,0,0,0,1,0,0], "crsong/cr_fd.jpg"],
[1, "Counterfits & Lies", [0,0,0,0,0,0,0,0,0,0,0,1,0,0], "crsong/cr_fd.jpg"],
[1, "Someday", [0,0,0,0,0,0,0,0,0,0,0,1,0,0], "crsong/cr_fd.jpg"],
[1, "Fiction", [0,0,0,0,0,0,0,0,0,0,0,1,0,0], "crsong/cr_fd.jpg"],
[1, "Just Tonight", [0,0,0,0,0,0,0,0,0,0,0,1,0,0], "crsong/cr_fd.jpg"],
[1, "24-7", [0,0,0,0,0,0,0,0,0,0,0,1,0,0], "crsong/cr_fd.jpg"],
[1, "Doors", [0,0,0,0,0,0,0,0,0,0,0,1,0,0], "crsong/cr_fd.jpg"],
[1, "Deja Vu", [0,0,0,0,0,0,0,0,0,0,0,1,0,0], "crsong/cr_fd.jpg"],
[1, "Survive", [0,0,0,0,0,0,0,0,0,0,0,1,0,0], "crsong/cr_fd.jpg"],
[1, "My Addiction", [0,0,0,0,0,0,0,0,0,0,0,1,0,0], "crsong/cr_fd.jpg"],
[1, "Painting", [0,0,0,0,0,0,0,0,0,0,0,1,0,0], "crsong/cr_fd.jpg"],
[1, "8AM", [0,0,0,0,0,0,0,0,0,0,0,1,0,0], "crsong/cr_fd.jpg"],

// Maxi Singles
[1, "Time to Go", [0,0,0,0,0,0,0,0,0,0,0,0,1,0], "crsong/cr_8.jpg"],
[1, "Believe", [0,0,0,0,0,0,0,0,0,0,0,0,1,0], "crsong/cr_8.jpg"],
[1, "Fiction (Unpluged)", [0,0,0,0,0,0,0,0,0,0,0,0,1,0], "crsong/cr_8.jpg"],
[1, "Come Awake", [0,0,0,0,0,0,0,0,0,0,0,0,1,0], "crsong/cr_fi.jpg"],
[1, "I Know", [0,0,0,0,0,0,0,0,0,0,0,0,1,0], "crsong/cr_8.jpg"],

// Other
[1, "New Dawn", [0,0,0,0,0,0,0,0,0,0,0,0,0,1], "crsong/cr_nd.jpg"],
  
];
