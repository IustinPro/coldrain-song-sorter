// A merge sort that stops every two elements to ask a human which one they
// like more. Roughly as fast as it sounds.
//
// The one genuinely good thing in here: it is completely deterministic. Same
// items plus same answers always lands on the same state, which is why a
// half-finished sort can be stored as a list of two-bit answers and rebuilt
// with replay() instead of dragging a thousand array entries through a URL.
// Working that out was the high point of a week that had no other high
// points.
//
// status: 0 = untouched, 1 = in the trenches, 2 = mercifully over
class MergeSorter {
  constructor(items) {
    this.items = items.slice();
    this._zero();
  }

  // Wipe everything back to nothing. Called by init() rather than being the
  // constructor's job, because a sorter gets rebuilt more often than it gets
  // created and I got tired of two places drifting apart.
  _zero() {
    this.tempData=[]; this.sortData=[]; this.parentData=[];
    this.equalData=[]; this.recordData=[];
    this.leftList=0; this.leftID=0; this.rightList=0; this.rightID=0;
    this.recordID=0; this.count=0; this.total=0; this.completed=0; this.status=0;
    this.undoStack=[]; this.undoIndex=-1;
  }

  // Shred the list into the full tree of halves up front, all of them, before
  // a single question is asked. Looks wasteful and is not: the shape is fixed
  // by the item count, so it can be regenerated identically on the other side
  // of a seed. That property is the only reason any of this fits in a URL.
  init(filteredItems) {
    this._zero();
    this.tempData   = filteredItems;
    this.equalData  = new Array(filteredItems.length + 1).fill(-1);
    this.recordData = new Array(filteredItems.length).fill(0);
    this.count = 1;

    this.sortData[0] = filteredItems.map((_, i) => i);
    let ptr = 1;
    for (let i = 0; i < this.sortData.length; i++) {
      if (this.sortData[i].length >= 2) {
        const m = Math.ceil(this.sortData[i].length / 2);
        this.sortData[ptr] = this.sortData[i].slice(0, m);
        this.total += this.sortData[ptr].length;
        this.parentData[ptr] = i; ptr++;
        this.sortData[ptr] = this.sortData[i].slice(m);
        this.total += this.sortData[ptr].length;
        this.parentData[ptr] = i; ptr++;
      }
    }
    this.leftList  = this.sortData.length - 2;
    this.rightList = this.sortData.length - 1;
    this.status = 1;
    this._push();
  }

  // A flat copy with nothing clever in it, because the moment you put a Set
  // or a Map in here JSON.stringify quietly turns it into {} and you lose an
  // afternoon.
  snapshot() {
    return {
      sortData:   this.sortData.map(a => a.slice()),
      parentData: this.parentData.slice(),
      equalData:  this.equalData.slice(),
      recordData: this.recordData.slice(),
      recordID:   this.recordID,
      leftList:   this.leftList,  leftID:   this.leftID,
      rightList:  this.rightList, rightID:  this.rightID,
      count:      this.count,     completed: this.completed,
      total:      this.total,     status:    this.status,
    };
  }

  getComparison() {
    if (this.status !== 1) return null;
    return {
      left:  this.tempData[this.sortData[this.leftList][this.leftID]],
      right: this.tempData[this.sortData[this.rightList][this.rightID]],
    };
  }

  get progress() { return this.total > 0 ? Math.floor(this.completed * 100 / this.total) : 0; }

  // Fast-forward through someone's old answers to rebuild where they were.
  // Deliberately goes through choose() rather than some clever shortcut,
  // partly so the undo history comes back for free and partly because the
  // clever shortcut is how you end up with two subtly different sorters.
  replay(choices) {
    for (const c of choices) {
      if (this.status !== 1) break;
      this.choose(c);
    }
  }

  // Here be dragons. This is lifted from Sakura Sort and it walks the merge
  // by hand, advancing whichever side lost and dragging tied items along
  // behind it. It works. I have read it four times and I could not tell you
  // why the second while loop is load-bearing, but remove it and everything
  // ties with everything. Do not refactor this at midnight.
  //
  // Nothing on the site sends a 0 any more: the TIE button is gone. The
  // handling stays because half the saved sorts and shared seeds in the
  // world still have draws in them, and replaying those has to land in the
  // same place it did the day they were made.
  choose(choice) {
    if (this.status !== 1) return;
    if (choice !== 1) {
      this._up(0);
      while (this.equalData[this.recordData[this.recordID-1]] !== -1) this._up(0);
    }
    if (choice === 0)
      this.equalData[this.recordData[this.recordID-1]] = this.sortData[this.rightList][this.rightID];
    if (choice !== -1) {
      this._up(1);
      while (this.equalData[this.recordData[this.recordID-1]] !== -1) this._up(1);
    }
    if (this.leftID < this.sortData[this.leftList].length && this.rightID === this.sortData[this.rightList].length)
      while (this.leftID  < this.sortData[this.leftList].length)  this._up(0);
    if (this.leftID === this.sortData[this.leftList].length && this.rightID < this.sortData[this.rightList].length)
      while (this.rightID < this.sortData[this.rightList].length) this._up(1);

    if (this.leftID === this.sortData[this.leftList].length && this.rightID === this.sortData[this.rightList].length) {
      const len = this.sortData[this.leftList].length + this.sortData[this.rightList].length;
      for (let i = 0; i < len; i++)
        this.sortData[this.parentData[this.leftList]][i] = this.recordData[i];
      this.sortData.pop(); this.sortData.pop();
      this.leftList -= 2; this.rightList -= 2;
      this.leftID = 0; this.rightID = 0;
      this.recordData = new Array(this.tempData.length).fill(0);
      this.recordID = 0;
    }
    this.status = this.leftList < 0 ? 2 : 1;
    if (this.status === 1) this.count++;
    this._push();
  }

  // Standard competition ranking: tied items share a number and the next one
  // down skips ahead. 1, 2, 2, 4. Not 1, 2, 2, 3. People have opinions about
  // this and they will tell you about them. New sorts cannot produce a draw,
  // so this only ever fires for a ranking made before they were removed.
  getResult() {
    if (this.status !== 2) return [];
    const out = []; let rank = 1, same = 1;
    for (let i = 0; i < this.tempData.length; i++) {
      out.push({ rank, item: this.tempData[this.sortData[0][i]] });
      if (i < this.tempData.length - 1) {
        if (this.equalData[this.sortData[0][i]] === this.sortData[0][i+1]) same++;
        else { rank += same; same = 1; }
      }
    }
    return out;
  }

  undo() { if (this.undoIndex <= 0) return false; this.undoIndex--; this._load(this.undoStack[this.undoIndex]); return true; }
  redo() { if (this.undoIndex >= this.undoStack.length-1) return false; this.undoIndex++; this._load(this.undoStack[this.undoIndex]); return true; }
  get canUndo() { return this.undoIndex > 0; }
  get canRedo() { return this.undoIndex < this.undoStack.length - 1; }

  // Take the next item off one side of the merge and write it into the run.
  // "up" as in "moved up into the result", not as in anything cheerful.
  _up(side) {
    const list = side===0 ? this.leftList  : this.rightList;
    const id   = side===0 ? this.leftID    : this.rightID;
    this.recordData[this.recordID] = this.sortData[list][id];
    if (side===0) this.leftID++; else this.rightID++;
    this.recordID++; this.completed++;
  }
  // Snapshot after every pick so undo works. Yes, a full copy each time. A
  // 130-song sort ends up holding a few hundred of these and the browser has
  // not complained once, so this is now a permanent decision.
  _push() {
    this.undoIndex++;
    if (this.undoIndex < this.undoStack.length) this.undoStack.length = this.undoIndex;
    this.undoStack[this.undoIndex] = this.snapshot();
  }
  // Put a snapshot back. Note tempData is untouched: the items never change,
  // only the mess we make of their order.
  _load(s) {
    this.sortData   = s.sortData.map(a=>a.slice());
    this.parentData = s.parentData.slice(); this.equalData  = s.equalData.slice();
    this.recordData = s.recordData.slice(); this.recordID   = s.recordID;
    this.leftList=s.leftList; this.leftID=s.leftID;
    this.rightList=s.rightList; this.rightID=s.rightID;
    this.count=s.count; this.completed=s.completed;
    this.total=s.total; this.status=s.status;
  }
}
