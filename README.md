# coldrain Fan Hub

An unofficial fan site for [coldrain](https://coldrain.jp/). Rank the whole
discography head to head, see how many songs you can name from memory, and
share the results.

No account, no sign-up, no tracking. Everything lives in your own browser.

Not affiliated with coldrain or their label.

[Discord](https://discord.gg/dRbCy4eTPg) &middot;
[r/coldrain_jp](https://www.reddit.com/r/coldrain_jp/) &middot;
[coldrain.jp](https://coldrain.jp/)

https://iustinpro.github.io/coldrain-song-sorter/

---

## What you can do

### Rank

Two songs, one question: which one is better. Answer a few hundred of those
and you get a ranked list of the entire discography.

- **Songs or albums.** Song mode lets you narrow it to whichever releases you
  want, so you can rank one album in about forty picks instead of doing all
  118 in one sitting.
- **You can undo.** Ctrl+Z, as many times as you need.
- **It saves after every single pick.** Close the tab mid-sort, come back next
  week, and it offers to pick up exactly where you were.
- **Optimized sort** reuses everything you have already decided, including
  things it can work out on its own. If you have said A beats B and B beats C,
  it will not ask you about A and C. A second full sort can be a fraction of
  the length of the first.

A full 118-song sort is roughly 700 questions. The site warns you before you
start. It is not a quick game.

### Name The Songs

A text box and 118 blanks, grouped by release, against a clock.

- Type a title and it **locks in the moment you finish it**. No enter, no
  button.
- Press **enter** to submit something you are not sure you have spelled right.
  A submitted guess is allowed a few wrong letters.
- **Punctuation and spacing never matter.** `dont speak`, `Don't Speak` and
  `DONTSPEAK` are all the same answer.
- The dots show how long each title is, so the shape is a clue.
- Progress and your time are saved as you go. Leave and come back whenever.
- Finishing gives you a card with your score, your time, and which records you
  cleared, which you can save as an image or copy straight into a chat.

The re-recorded Final Destination is left out, because its twelve tracks are
already on the 2009 album and naming them twice is not a memory test.

### Info

An encyclopaedia-style page on the band, adapted from Wikipedia: the full
history from 2007 to the new album, their style and influences, the five
members, discography tables with chart peaks, every tracklist, tours and
festivals, anime and game tie-ins, collaborations, awards and trivia. Quotes
come from interviews with the band, and every source is listed at the bottom.

The contents list follows you down the page. On a phone it sits in a bar at
the top that shows which section you are in, and opens into the full list.

### Profile

Your stats (songs named, pairs judged, songs ranked, albums ranked), your
number one song and album, and two charts: which records your song ranking actually
favours, and how often each album wins its head-to-heads. Open someone's share
link and you get the same page for them.

### Sharing

Every finished ranking and every Name The Songs run ends on a share card. A
song ranking shows your top twenty, an album ranking shows every release.
**Save Image** downloads it as a PNG (on a phone it opens the share sheet, so it
can go straight into a story or a group chat), **Copy Image** puts it on the
clipboard, and **Copy Link** sends the whole profile.

**Copy Share Link** on the profile page puts your entire profile into a link.
Send it to anyone and they see your stats, your rankings and how far along any
sort you left running, read-only. Their own profile is not touched.

That link is also **how you move to a new phone or browser**: open it on the
new device and press *Use As Mine*.

The whole profile is packed into the part of the URL after the `#`, which
browsers never send to a server. Nothing about you leaves your machine.

---

## Things worth knowing

**Where is my data?** In your browser's local storage, on that device only.
There is no server and no account.

**So if I clear my browser history?** It is gone. Copy your share link
somewhere first. That link is the only backup there is.

**Does it work on a phone?** Yes. That is most of what it was built for. Use
*Add to Home Screen* and it opens full screen, like an app.

**Can I see someone else's rankings without losing mine?** Yes. Opening a
share link is read-only until you explicitly press *Use As Mine*.

**Something in the discography is wrong.** Very possibly. Open an issue on
[GitHub](https://github.com/IustinPro/coldrain-song-sorter) or say so in the
Discord.

---

## Running it on your own machine

You do not need to. The site is live and there is nothing to install. This
section is for anyone who wants to poke at it locally.

### Why you need a local server

You can open `index.html` by double-clicking it, and most of the site will
work. Two things will not:

- **Copying a share link, and saving or copying a share card.** Browsers only
  allow clipboard access on a secure origin, and refuse to export an image drawn
  from local files. A `file://` path trips both.
- **Saved progress** behaves oddly, because every `file://` page gets its own
  isolated storage.

Running a tiny local web server fixes both. Pick whichever of these you
already have.

### Option 1: Python

Most Macs and Linux machines already have it, and on Windows it is a two
minute install from [python.org](https://www.python.org/downloads/) (tick
*Add Python to PATH*).

Open a terminal **in the project folder** and run:

```
python -m http.server 8080
```

On Mac or Linux you may need `python3` instead of `python`.

Then open <http://localhost:8080> in your browser. Press `Ctrl+C` in the
terminal to stop it.

### Option 2: Node

If you have [Node](https://nodejs.org) installed:

```
npx serve -l 8080
```

Say yes if it offers to install `serve`. Same address, <http://localhost:8080>.

### Option 3: VS Code

Install the **Live Server** extension, then right-click `index.html` in the
file list and choose *Open with Live Server*. It picks a port and opens the
browser for you, and reloads on every save.

### Option 4: PHP

Genuinely, if it is what you have:

```
php -S localhost:8080
```

### Opening it on your phone on the same wifi

Start the server with Python as above, find your computer's local IP address
(`ipconfig` on Windows, `ipconfig getifaddr en0` on a Mac), then on your phone
visit `http://THAT-IP:8080`.

Clipboard access needs a secure origin, so *Copy Share Link* will still not
work over plain `http` to an IP address. Everything else will.

### Common problems

**"python is not recognised"**: Python is not on your PATH. Reinstall it
with the *Add Python to PATH* box ticked, or use one of the other options.

**"Address already in use"**: something is already on port 8080. Use a
different number, for example `python -m http.server 3000`, and visit
<http://localhost:3000>.

**The page loads but looks unstyled**: you are almost certainly serving
the wrong folder. The terminal must be in the folder that contains
`index.html`.

**Changes are not showing up**: hard refresh with `Ctrl+Shift+R`, or
`Cmd+Shift+R` on a Mac.

---

## For anyone reading the code

Static site. No build step, no dependencies, no framework. Open the folder,
edit a file, refresh.

```
index.html            Markup and the view containers
css/style.css         All of the styling
js/data.js            The discography, and the stable ids seeds are built on
js/sorter.js          Head-to-head merge sort with undo and replay
js/songguess.js       Fuzzy title matching for Name The Songs
js/tips.js            Contextual hints and the conditions that retire them
js/profile.js         Storage and the bit-packed seed format
js/app.js             Everything else
```

Two rules if you touch `js/data.js`:

1. **Never reuse a `sid`.** They are permanent ids that saved profiles are
   built on. Give a new entry the next unused number.
2. **Reordering is fine.** Tracks can move between releases freely, because
   nothing anywhere depends on list position.

The comments explain the rest, and are not shy about it.

## Deployment

`.github/workflows/static.yml` publishes to GitHub Pages on every push to
`main`. Pages must be enabled in the repository settings with the source set
to *GitHub Actions*, and on a free account the repository has to be public.

The build publishes the repository root as it stands, minus
`coldrain-hub-internals.docx`, which the workflow deletes from the runner's
copy first so it does not end up on the live site.

### Remotes

Two of them. `origin` is the working repo, `sorter` is the one the site is
meant to live on:

```
origin   https://github.com/IustinPro/coldrain-fan-hub.git
sorter   https://github.com/IustinPro/coldrain-song-sorter.git
```

Publishing to the sorter repo:

```
git push-sorter
```

That is an alias for `git push sorter main`. Add both to a fresh clone with:

```
git remote add sorter https://github.com/IustinPro/coldrain-song-sorter.git
git config alias.push-sorter "push sorter main"
```

The links on the Info page, and the preview tags in `index.html`, all point at
the sorter repository and its Pages URL, so that is the one to enable Pages on.
