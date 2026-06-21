// Achievement definitions
const ACHIEVEMENTS = {
  firstTest: { name: 'First Steps', desc: 'Complete your first typing test', icon: '🎯' },
  wpm50: { name: 'Speed Demon', desc: 'Reach 50 WPM', icon: '⚡' },
  wpm80: { name: 'Lightning Fingers', desc: 'Reach 80 WPM', icon: '⚡⚡' },
  wpm100: { name: 'Centurion', desc: 'Reach 100 WPM', icon: '🏆' },
  accuracy95: { name: 'Precision', desc: 'Achieve 95% accuracy', icon: '🎯' }
};

// Performance tiers by WPM
const PERFORMANCE_TIERS = [
  { min: 0, label: 'Beginner', color: 'text-slate-400' },
  { min: 30, label: 'Intermediate', color: 'text-blue-400' },
  { min: 50, label: 'Advanced', color: 'text-purple-400' },
  { min: 80, label: 'Expert', color: 'text-yellow-400' }
];

function getPerformanceTier(wpm) {
  let tier = PERFORMANCE_TIERS[0];
  for (const t of PERFORMANCE_TIERS) {
    if (wpm >= t.min) tier = t;
  }
  return tier;
}

// Check and unlock achievements after a test
function evaluateAchievements(result) {
  const unlocked = [];
  if (Storage.unlockAchievement('firstTest')) unlocked.push('firstTest');
  if (result.wpm >= 50 && Storage.unlockAchievement('wpm50')) unlocked.push('wpm50');
  if (result.wpm >= 80 && Storage.unlockAchievement('wpm80')) unlocked.push('wpm80');
  if (result.wpm >= 100 && Storage.unlockAchievement('wpm100')) unlocked.push('wpm100');
  if (result.accuracy >= 95 && Storage.unlockAchievement('accuracy95')) unlocked.push('accuracy95');
  return unlocked;
}

// Toast notifications
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'px-4 py-3 rounded font-chalk text-sm border animate-slideIn';
  toast.style.cssText = 'background-color: var(--bg-soft); border-color: var(--glass-border); color: var(--fg);';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(6px)';
    toast.style.transition = 'opacity 0.3s, transform 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}