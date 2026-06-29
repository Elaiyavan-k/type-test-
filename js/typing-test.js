// TypingTest — core engine
const TypingTest = {
  // State
  words: [],
  currentWordIndex: 0,
  currentCharIndex: 0,
  typedChars: [],          // each entry: { char, correct: bool }
  startTime: null,
  endTime: null,
  duration: 30,            // seconds
  timeRemaining: 30,
  timerInterval: null,
  state: 'idle',           // idle | running | finished
  perSecondSamples: [],    // { sec, wpm, accuracy }
  difficulty: 'medium',    // easy | medium | hard
  lesson: null,            // active lesson key or null
  mode: 'time',            // time | words | custom
  wordsTarget: 25,         // target word count for words/custom modes
  suddenDeath: false,      // restart instantly on any mistake

  // Live stats
  stats: {
    wpm: 0,
    accuracy: 100,
    charactersTyped: 0,
    correctChars: 0,
    incorrectChars: 0,
    rawWPM: 0,
    mistakesByKey: {}      // key -> count
  },

  // Callbacks
  onUpdate: null,
  onFinish: null,

  init() {
    // nothing yet
  },

  // Generate fresh words
  loadWords(count = 60, wordList = null) {
    if (wordList) {
      this.words = wordList;
    } else if (this.lesson) {
      this.words = getLessonWords(this.lesson);
    } else {
      this.words = getWordsByDifficulty(this.difficulty, count);
    }
    this.reset();
  },

  setDifficulty(level) {
    this.difficulty = level;
  },

  setLesson(key) {
    this.lesson = key;
  },

  clearLesson() {
    this.lesson = null;
  },

  // Reset state without regenerating words
  reset() {
    this.currentWordIndex = 0;
    this.currentCharIndex = 0;
    this.typedChars = [];
    this.startTime = null;
    this.endTime = null;
    this.timeRemaining = this.mode === 'time' ? this.duration : 0;
    this.perSecondSamples = [];
    this.stats = {
      wpm: 0,
      accuracy: 100,
      charactersTyped: 0,
      correctChars: 0,
      incorrectChars: 0,
      rawWPM: 0,
      mistakesByKey: {}
    };
    this.state = 'idle';
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.onUpdate) this.onUpdate();
  },

  // Start the test (called on first keypress)
  start() {
    if (this.state !== 'idle') return;
    this.state = 'running';
    this.startTime = performance.now();
    this.timerInterval = setInterval(() => this.tick(), 1000);
    // Carriage-return swoosh — once when the test kicks off
    if (this.typedChars.length === 0) {
      Sound.carriageReturn();
    }
  },

  tick() {
    if (this.state !== 'running') return;
    if (this.mode === 'time') {
      this.timeRemaining--;
      this.recomputeStats();
      if (this.onUpdate) this.onUpdate();
      if (this.timeRemaining <= 0) {
        this.finish();
      }
    } else {
      this.timeRemaining++;
      this.recomputeStats();
      if (this.onUpdate) this.onUpdate();
    }
  },

  // Handle key press
  handleKey(key) {
    if (this.state === 'finished') return;
    Sound.init();

    if (this.state === 'idle') {
      // First keystroke starts the timer
      this.start();
    }

    if (key === 'Backspace') {
      this.handleBackspace();
    } else if (key === ' ') {
      this.handleSpace();
    } else if (key.length === 1) {
      this.handleChar(key);
    }

    this.recomputeStats();
    if (this.onUpdate) this.onUpdate();
  },

  handleChar(key) {
    const currentWord = this.words[this.currentWordIndex];
    if (!currentWord) return;

    const expected = currentWord[this.currentCharIndex];
    const correct = key === expected;
    this.typedChars.push({ wordIdx: this.currentWordIndex, charIdx: this.currentCharIndex, char: key, correct });
    this.currentCharIndex++;

    if (correct) {
      Sound.keyClick();
    } else {
      Sound.error();
      const expectedChar = expected ? expected.toLowerCase() : '';
      if (expectedChar && expectedChar.match(/[a-z0-9]/i)) {
        this.stats.mistakesByKey[expectedChar] = (this.stats.mistakesByKey[expectedChar] || 0) + 1;
      }
      if (this.suddenDeath) {
        setTimeout(() => {
          this.restart();
          if (typeof showToast !== 'undefined') {
            showToast('Resetting test due to mistake (Sudden Death)!', 'error');
          }
        }, 50);
        return;
      }
    }

    // Check if finished in words/custom mode
    if (this.mode !== 'time' &&
        this.currentWordIndex === this.wordsTarget - 1 &&
        this.currentCharIndex === currentWord.length) {
      this.finish();
    }
  },

  handleSpace() {
    // Move to next word; mark word boundary
    if (this.currentCharIndex === 0) return; // don't allow leading space
    this.typedChars.push({ wordIdx: this.currentWordIndex, charIdx: this.currentCharIndex, char: ' ', correct: true, isSpace: true });
    this.currentWordIndex++;
    this.currentCharIndex = 0;
    // Deeper thud for spacebar
    Sound.spacebar();

    // Check if finished in words/custom mode
    if (this.mode !== 'time' && this.currentWordIndex >= this.wordsTarget) {
      this.finish();
      return;
    }

    // Auto-extend with more words if running low (respects difficulty/lesson)
    if (this.mode === 'time' && this.currentWordIndex >= this.words.length - 10) {
      let more;
      if (this.lesson) more = getLessonWords(this.lesson);
      else more = getWordsByDifficulty(this.difficulty, 30);
      this.words = this.words.concat(more);
    }
  },

  handleBackspace() {
    if (this.typedChars.length === 0) return;
    const last = this.typedChars[this.typedChars.length - 1];
    if (last.isSpace) {
      // Move back to previous word
      this.typedChars.pop();
      this.currentWordIndex--;
      // Recount current char index for the word
      let count = 0;
      for (let i = this.typedChars.length - 1; i >= 0; i--) {
        const t = this.typedChars[i];
        if (t.isSpace || t.wordIdx !== this.currentWordIndex) break;
        count++;
      }
      this.currentCharIndex = count;
    } else {
      this.typedChars.pop();
      this.currentCharIndex--;
      if (this.currentCharIndex < 0) this.currentCharIndex = 0;
    }
  },

  recomputeStats() {
    let correct = 0;
    let incorrect = 0;
    let total = 0;

    for (const t of this.typedChars) {
      total++;
      if (t.correct) correct++;
      else incorrect++;
    }

    const elapsedMs = this.startTime ? performance.now() - this.startTime : 0;
    const elapsedMin = elapsedMs / 60000;
    // Standard WPM: 5 chars = 1 word
    // Stability safeguard: only compute WPM after 1 second has elapsed to avoid starting spikes
    const wpm = elapsedMs >= 1000 ? Math.round(correct / 5 / elapsedMin) : 0;
    const rawWPM = elapsedMs >= 1000 ? Math.round(total / 5 / elapsedMin) : 0;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 100;

    this.stats.wpm = wpm;
    this.stats.rawWPM = rawWPM;
    this.stats.accuracy = accuracy;
    this.stats.correctChars = correct;
    this.stats.incorrectChars = incorrect;
    this.stats.charactersTyped = total;

    // Per-second sample for charts
    if (this.state === 'running') {
      const elapsedSec = Math.floor(elapsedMs / 1000);
      const last = this.perSecondSamples[this.perSecondSamples.length - 1];
      if (!last || last.sec !== elapsedSec) {
        this.perSecondSamples.push({ sec: elapsedSec, wpm, accuracy });
      } else {
        last.wpm = wpm;
        last.accuracy = accuracy;
      }
    }
  },

  finish() {
    if (this.state === 'finished') return;
    this.state = 'finished';
    this.endTime = performance.now();
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.recomputeStats();
    Sound.finish();

    const elapsedSec = this.startTime && this.endTime ? Math.round((this.endTime - this.startTime) / 1000) : this.duration;
    const finalDuration = this.mode === 'time' ? this.duration : (elapsedSec || 1);

    if (this.onFinish) {
      this.onFinish({
        wpm: this.stats.wpm,
        accuracy: this.stats.accuracy,
        correctChars: this.stats.correctChars,
        incorrectChars: this.stats.incorrectChars,
        totalChars: this.stats.charactersTyped,
        duration: finalDuration,
        samples: [...this.perSecondSamples],
        mistakesByKey: { ...this.stats.mistakesByKey }
      });
    }
  },

  // Restart same words
  restart() {
    this.reset();
    if (this.onUpdate) this.onUpdate();
  },

  // New random words
  newWords(count = 60) {
    if (this.mode === 'custom') {
      this.reset();
      if (this.onUpdate) this.onUpdate();
      return;
    }
    if (this.lesson) {
      this.words = getLessonWords(this.lesson);
    } else {
      const loadCount = (this.mode === 'words') ? this.wordsTarget : count;
      this.words = getWordsByDifficulty(this.difficulty, loadCount);
    }
    this.reset();
    if (this.onUpdate) this.onUpdate();
  },

  setDuration(seconds) {
    this.duration = seconds;
    this.timeRemaining = seconds;
    if (this.state === 'idle' && this.onUpdate) this.onUpdate();
  }
};