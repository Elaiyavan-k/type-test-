// Storage module — handles all localStorage persistence
const Storage = {
  KEYS: {
    HISTORY: 'typing_test_history',
    LEADERBOARD: 'typing_test_leaderboard',
    ACHIEVEMENTS: 'typing_test_achievements',
    STREAK: 'typing_test_streak',
    PROFILE: 'typing_test_profile',
    SETTINGS: 'typing_test_settings',
    THEME: 'typing_test_theme',
    ANALYTICS: 'typing_test_analytics',
    TUTORIAL_SEEN: 'typing_test_tutorial_seen'
  },

  // Generic helpers
  get(key, fallback = null) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      return fallback;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  },

  remove(key) {
    localStorage.removeItem(key);
  },

  // History
  getHistory() {
    return this.get(this.KEYS.HISTORY, []);
  },

  addHistoryEntry(entry) {
    const history = this.getHistory();
    history.unshift(entry);
    // Keep last 100 entries
    if (history.length > 100) history.length = 100;
    this.set(this.KEYS.HISTORY, history);
  },

  deleteHistoryEntry(index) {
    const history = this.getHistory();
    history.splice(index, 1);
    this.set(this.KEYS.HISTORY, history);
  },

  clearHistory() {
    this.set(this.KEYS.HISTORY, []);
  },

  // Leaderboard
  getLeaderboard() {
    return this.get(this.KEYS.LEADERBOARD, []);
  },

  addToLeaderboard(entry) {
    const lb = this.getLeaderboard();
    lb.push(entry);
    lb.sort((a, b) => b.wpm - a.wpm);
    if (lb.length > 50) lb.length = 50;
    this.set(this.KEYS.LEADERBOARD, lb);
  },

  isLeaderboardWorthy(wpm, accuracy) {
    const lb = this.getLeaderboard();
    if (lb.length < 10) return true;
    const lowest = lb[lb.length - 1];
    return wpm > lowest.wpm || (wpm === lowest.wpm && accuracy > lowest.accuracy);
  },

  // Achievements
  getAchievements() {
    return this.get(this.KEYS.ACHIEVEMENTS, {
      firstTest: false,
      wpm50: false,
      wpm80: false,
      wpm100: false,
      accuracy95: false
    });
  },

  unlockAchievement(key) {
    const achievements = this.getAchievements();
    if (!achievements[key]) {
      achievements[key] = true;
      this.set(this.KEYS.ACHIEVEMENTS, achievements);
      return true; // newly unlocked
    }
    return false;
  },

  // Streak
  getStreak() {
    return this.get(this.KEYS.STREAK, { current: 0, longest: 0, lastDate: null });
  },

  recordPracticeToday() {
    const streak = this.getStreak();
    const today = new Date().toDateString();

    if (streak.lastDate === today) return streak.current;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (streak.lastDate === yesterdayStr) {
      streak.current += 1;
    } else {
      streak.current = 1;
    }

    streak.longest = Math.max(streak.longest, streak.current);
    streak.lastDate = today;
    this.set(this.KEYS.STREAK, streak);
    return streak.current;
  },

  // Profile
  getProfile() {
    return this.get(this.KEYS.PROFILE, {
      username: 'Anonymous',
      avatar: null
    });
  },

  setProfile(profile) {
    this.set(this.KEYS.PROFILE, profile);
  },

  // Settings
  getSettings() {
    return this.get(this.KEYS.SETTINGS, {
      fontSize: 24,
      soundOn: true,
      duration: 30,
      showLiveWPM: true,
      soundProfile: 'typewriter',
      ambientOn: false,
      ambientVolume: 0.04,
      masterVolume: 0.6
    });
  },

  setSettings(settings) {
    this.set(this.KEYS.SETTINGS, settings);
  },

  // Theme
  getTheme() {
    return localStorage.getItem(this.KEYS.THEME) || 'dark';
  },

  setTheme(theme) {
    localStorage.setItem(this.KEYS.THEME, theme);
  },

  // Analytics - per-second data from tests
  getAnalytics() {
    return this.get(this.KEYS.ANALYTICS, { tests: [] });
  },

  addAnalytics(testData) {
    const analytics = this.getAnalytics();
    analytics.tests.unshift(testData);
    if (analytics.tests.length > 30) analytics.tests.length = 30;
    this.set(this.KEYS.ANALYTICS, analytics);
  },

  // Tutorial
  getTutorialSeen() {
    return this.get(this.KEYS.TUTORIAL_SEEN, false) === true;
  },

  setTutorialSeen(seen) {
    this.set(this.KEYS.TUTORIAL_SEEN, !!seen);
  }
};