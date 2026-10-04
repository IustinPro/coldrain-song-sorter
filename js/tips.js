// Hints that know when to shut up.
//
// The first version showed the same five paragraphs to everyone forever,
// including people who had been using the site for months, which is the
// software equivalent of a colleague explaining your own job to you daily.
//
// Now every tip carries a condition and fires itself the moment you prove
// you no longer need it. Press an arrow key and the shortcut tip never
// returns. No "seen three times" counters, no timers, no nagging. Anything
// still unwanted has an x.
//
// One rule per screen, first match wins, so no screen ever turns into a
// stack of advice nobody asked for.
const Tips = (() => {
  // ctx is whatever the asking screen happens to know. Every rule reads only
  // the fields its own screen supplies, so do not go adding a rule that
  // wants c.battles on the profile page and then wonder why it never fires.
  const RULES = [

    // ----- Sorter setup -----
    {
      id: 'optimized', where: 'sorter',
      when: c => !c.optimized && c.pairs >= 25,
      text: c => `You have ${c.pairs} pairs on record. Tick the optimized sort and it will answer the ones you have already settled.`,
    },

    // ----- Mid-sort -----
    {
      id: 'keys', where: 'battle',
      // Telling a phone user about Ctrl+Z is just rude
      when: c => c.fine && !c.usedKeys && c.battles >= 3,
      text: 'Left and right arrows pick a side, Ctrl+Z takes one back.',
    },
    {
      // For the moment around pick 25 where someone looks at the progress bar,
      // realises what they have signed up for, and wonders if closing the tab
      // costs them everything. That worry has a window, so this does too.
      id: 'autosave', where: 'battle',
      when: c => !c.resumedSort && c.battles >= 25 && c.battles <= 45,
      text: 'Every pick is saved as you make it. You can close this and carry on from here later.',
    },

    // ----- After a sort -----
    {
      id: 'reruns', where: 'result',
      when: c => !c.optimized && c.pairs >= 25,
      text: 'Those picks are on record now. Turn on the optimized sort next time and it will skip whatever they already settle.',
    },

    // ----- Name The Songs -----
    {
      // Three rejections in a row is not someone drawing a blank, it is
      // someone who knows the song and is spelling it wrong
      id: 'typos', where: 'guess',
      when: c => c.misses >= 3,
      text: 'Sure you have one? Press enter to submit it. A submitted guess is allowed a few wrong letters, while typing only accepts an exact title.',
    },
    {
      id: 'dots', where: 'guess',
      when: c => c.found === 0 && !c.best,
      text: 'Each dot is one character, so the length of a title is a clue. Punctuation and spacing never matter.',
    },
    {
      id: 'guesssave', where: 'guess',
      when: c => c.found >= 8 && !c.resumedGuess,
      text: 'Your progress is saved as you go, so leaving this tab will not cost you the run.',
    },

    // ----- Profile -----
    {
      id: 'seed', where: 'profile',
      when: c => c.hasData && !c.copiedSeed,
      text: 'None of this leaves your browser. Copy the seed if you want it back after clearing your history or moving to another device.',
    },
  ];

  // Best tip for this screen right now, or nothing at all, which is very
  // often the correct answer and took me embarrassingly long to accept
  function pick(profile, where, ctx) {
    const off = profile.tipsOff || [];
    for (const rule of RULES) {
      if (rule.where !== where) continue;
      if (off.includes(rule.id)) continue;
      if (!rule.when(ctx)) continue;
      return { id: rule.id, text: typeof rule.text === 'function' ? rule.text(ctx) : rule.text };
    }
    return null;
  }

  return { pick };
})();
