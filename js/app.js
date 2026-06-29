// Main App — wires UI, typing engine, storage, themes, charts together
(function () {
  'use strict';

  const App = {
    currentPage: 'test',
    charts: { wpm: null, accuracy: null },
    dailyWords: null,
    lastResult: null,

    init() {
      Sound.init();
      this.applyTheme();
      this.applySettings();
      this.loadProfile();
      this.bindNavigation();
      this.bindTypingTest();
      this.bindModeSelector();
      this.bindSettings();
      this.bindDashboard();
      this.bindProfileEditor();
      this.initTypingEngine();
      this.updateStreakDisplay();
      this.updateGreeting();
      this.maybeAutoShowTutorial();
    },



    // ========== Theme ==========
    applyTheme() {
      const theme = Storage.getTheme();
      document.documentElement.setAttribute('data-theme', theme);
    },

    setTheme(theme) {
      Storage.setTheme(theme);
      document.documentElement.setAttribute('data-theme', theme);
      this.updateThemeCards();
      showToast(`Theme: ${theme}`, 'info');
    },

    cycleTheme() {
      const order = ['dark', 'light', 'cyberpunk', 'amoled'];
      const cur = Storage.getTheme();
      const next = order[(order.indexOf(cur) + 1) % order.length];
      this.setTheme(next);
    },

    // ========== Focus mode ==========
    setFocusMode(on) {
      document.body.classList.toggle('focus-mode', !!on);

      // Re-measure after layout settles so the centering transform is correct.
      requestAnimationFrame(() => this.scrollCurrentIntoView());
      // Refocus the hidden input so typing continues uninterrupted.
      if (on) {
        const input = document.getElementById('hidden-input');
        if (input) input.focus();
      }
    },

    updateThemeCards() {
      const cur = Storage.getTheme();
      document.querySelectorAll('.theme-card').forEach(card => {
        const isActive = card.dataset.theme === cur;
        card.classList.toggle('theme-active', isActive);
      });
    },

    // ========== Settings ==========
    applySettings() {
      const settings = Storage.getSettings();
      const theme = Storage.getTheme();

      // Apply font size
      document.documentElement.style.setProperty('--font-size', `${settings.fontSize}px`);

      // Apply sound
      Sound.setEnabled(settings.soundOn);
      Sound.setProfile(settings.soundProfile || 'typewriter');
      Sound.setMasterVolume((settings.masterVolume ?? 0.6));
      const soundIcon = document.getElementById('sound-on-icon');
      const soundOffIcon = document.getElementById('sound-off-icon');
      if (soundIcon && soundOffIcon) {
        soundIcon.classList.toggle('hidden', !settings.soundOn);
        soundOffIcon.classList.toggle('hidden', settings.soundOn);
      }

      // Ambient hum — start if enabled AND main sound is on
      Sound.setAmbientVolume(settings.ambientVolume ?? 0.04);
      const wantAmbient = settings.ambientOn && settings.soundOn;
      if (wantAmbient && !Sound.ambientEnabled) Sound.setAmbientEnabled(true);
      else if (!wantAmbient && Sound.ambientEnabled) Sound.setAmbientEnabled(false);

      // Apply duration
      TypingTest.setDuration(settings.duration);
      this.updateDurationButtons(settings.duration);

      // Apply test mode, words target, and sudden death
      TypingTest.mode = settings.mode || 'time';
      TypingTest.wordsTarget = settings.wordsTarget || 25;
      TypingTest.suddenDeath = !!settings.suddenDeath;

      // Update UI state for these options
      const suddenDeathToggle = document.getElementById('sudden-death-toggle');
      if (suddenDeathToggle) suddenDeathToggle.checked = TypingTest.suddenDeath;

      const customTextInput = document.getElementById('custom-text-input');
      if (customTextInput) customTextInput.value = settings.customText || '';

      // Set active classes for mode buttons
      const timeBtn = document.getElementById('mode-time-btn');
      const wordsBtn = document.getElementById('mode-words-btn');
      const customBtn = document.getElementById('mode-custom-btn');
      if (timeBtn && wordsBtn && customBtn) {
        timeBtn.classList.toggle('difficulty-active', TypingTest.mode === 'time');
        wordsBtn.classList.toggle('difficulty-active', TypingTest.mode === 'words');
        customBtn.classList.toggle('difficulty-active', TypingTest.mode === 'custom');
      }

      // Show/hide mode goal containers
      const timeContainer = document.getElementById('goal-time-container');
      const wordsContainer = document.getElementById('goal-words-container');
      const customContainer = document.getElementById('custom-text-container');
      if (timeContainer) timeContainer.classList.toggle('hidden', TypingTest.mode !== 'time');
      if (wordsContainer) wordsContainer.classList.toggle('hidden', TypingTest.mode !== 'words');
      if (customContainer) customContainer.classList.toggle('hidden', TypingTest.mode !== 'custom');

      // Update words goal buttons active state
      document.querySelectorAll('.words-btn').forEach(btn => {
        btn.classList.toggle('words-active', parseInt(btn.dataset.words) === TypingTest.wordsTarget);
      });

      // Update settings UI inputs
      const fontSizeInput = document.getElementById('font-size-setting');
      const fontSizeLabel = document.getElementById('font-size-label');
      const soundInput = document.getElementById('sound-setting');
      const liveWPMInput = document.getElementById('live-wpm-setting');
      const durationSel = document.getElementById('duration-setting');
      const volumeInput = document.getElementById('volume-setting');
      const volumeLabel = document.getElementById('volume-label');
      const ambientInput = document.getElementById('ambient-setting');
      const ambientVolInput = document.getElementById('ambient-volume-setting');
      const ambientVolLabel = document.getElementById('ambient-volume-label');

      if (fontSizeInput) fontSizeInput.value = settings.fontSize;
      if (fontSizeLabel) fontSizeLabel.textContent = `${settings.fontSize}px`;
      if (soundInput) soundInput.checked = settings.soundOn;
      if (liveWPMInput) liveWPMInput.checked = settings.showLiveWPM;
      if (durationSel) durationSel.value = settings.duration;
      if (volumeInput) volumeInput.value = Math.round((settings.masterVolume ?? 0.6) * 100);
      if (volumeLabel) volumeLabel.textContent = `${Math.round((settings.masterVolume ?? 0.6) * 100)}%`;
      if (ambientInput) ambientInput.checked = !!settings.ambientOn;
      if (ambientVolInput) ambientVolInput.value = Math.round((settings.ambientVolume ?? 0.04) * 100);
      if (ambientVolLabel) ambientVolLabel.textContent = `${Math.round((settings.ambientVolume ?? 0.04) * 100)}%`;

      // Profile cards
      document.querySelectorAll('.profile-card').forEach(card => {
        card.classList.toggle('profile-active', card.dataset.profile === (settings.soundProfile || 'typewriter'));
      });

      this.updateThemeCards();
    },

    updateDurationButtons(duration) {
      document.querySelectorAll('.duration-btn').forEach(btn => {
        btn.classList.toggle('duration-active', parseInt(btn.dataset.duration) === duration);
      });
    },

    bindSettings() {
      // Sound toggle (header)
      document.getElementById('sound-toggle').addEventListener('click', () => {
        const settings = Storage.getSettings();
        settings.soundOn = !settings.soundOn;
        Storage.setSettings(settings);
        Sound.setEnabled(settings.soundOn);
        const soundOnIcon = document.getElementById('sound-on-icon');
        const soundOffIcon = document.getElementById('sound-off-icon');
        soundOnIcon.classList.toggle('hidden', !settings.soundOn);
        soundOffIcon.classList.toggle('hidden', settings.soundOn);
        const soundInput = document.getElementById('sound-setting');
        if (soundInput) soundInput.checked = settings.soundOn;
        // Ambient follows
        if (!settings.soundOn && Sound.ambientEnabled) Sound.setAmbientEnabled(false);
        else if (settings.soundOn && settings.ambientOn) Sound.setAmbientEnabled(true);
        showToast(settings.soundOn ? 'Sound enabled' : 'Sound muted', 'info');
      });

      // Theme toggle (header)
      document.getElementById('theme-toggle').addEventListener('click', () => this.cycleTheme());

      // Focus mode toggle (header) — toggles, and jumps to test page when turning on.
      document.getElementById('focus-toggle').addEventListener('click', () => {
        const turningOn = !document.body.classList.contains('focus-mode');
        if (turningOn && this.currentPage !== 'test') this.navigate('test');
        this.setFocusMode(turningOn);
      });
      document.getElementById('focus-exit').addEventListener('click', () => this.setFocusMode(false));



      // Theme cards
      document.querySelectorAll('.theme-card').forEach(card => {
        card.addEventListener('click', () => this.setTheme(card.dataset.theme));
      });

      // Font size
      const fontSizeInput = document.getElementById('font-size-setting');
      fontSizeInput.addEventListener('input', (e) => {
        const size = parseInt(e.target.value);
        document.documentElement.style.setProperty('--font-size', `${size}px`);
        document.getElementById('font-size-label').textContent = `${size}px`;
        const settings = Storage.getSettings();
        settings.fontSize = size;
        Storage.setSettings(settings);
      });

      // Sound setting
      document.getElementById('sound-setting').addEventListener('change', (e) => {
        const settings = Storage.getSettings();
        settings.soundOn = e.target.checked;
        Storage.setSettings(settings);
        Sound.setEnabled(settings.soundOn);
        const soundOnIcon = document.getElementById('sound-on-icon');
        const soundOffIcon = document.getElementById('sound-off-icon');
        soundOnIcon.classList.toggle('hidden', !settings.soundOn);
        soundOffIcon.classList.toggle('hidden', settings.soundOn);
        // Re-evaluate ambient
        if (!settings.soundOn && Sound.ambientEnabled) Sound.setAmbientEnabled(false);
        else if (settings.soundOn && settings.ambientOn) Sound.setAmbientEnabled(true);
      });

      // Profile cards
      document.querySelectorAll('.profile-card').forEach(card => {
        card.addEventListener('click', () => {
          const settings = Storage.getSettings();
          settings.soundProfile = card.dataset.profile;
          Storage.setSettings(settings);
          Sound.setProfile(settings.soundProfile);
          // Demo the new sound
          Sound.keyClick();
          document.querySelectorAll('.profile-card').forEach(c => c.classList.toggle('profile-active', c === card));
        });
      });

      // Master volume
      document.getElementById('volume-setting').addEventListener('input', (e) => {
        const v = parseInt(e.target.value) / 100;
        const settings = Storage.getSettings();
        settings.masterVolume = v;
        Storage.setSettings(settings);
        Sound.setMasterVolume(v);
        document.getElementById('volume-label').textContent = `${e.target.value}%`;
      });

      // Ambient on/off
      document.getElementById('ambient-setting').addEventListener('change', (e) => {
        const settings = Storage.getSettings();
        settings.ambientOn = e.target.checked;
        Storage.setSettings(settings);
        if (settings.ambientOn && settings.soundOn) Sound.setAmbientEnabled(true);
        else Sound.setAmbientEnabled(false);
      });

      // Ambient volume
      document.getElementById('ambient-volume-setting').addEventListener('input', (e) => {
        const v = parseInt(e.target.value) / 100; // 0..0.20
        const settings = Storage.getSettings();
        settings.ambientVolume = v;
        Storage.setSettings(settings);
        Sound.setAmbientVolume(v);
        document.getElementById('ambient-volume-label').textContent = `${e.target.value}%`;
      });

      // Live WPM
      document.getElementById('live-wpm-setting').addEventListener('change', (e) => {
        const settings = Storage.getSettings();
        settings.showLiveWPM = e.target.checked;
        Storage.setSettings(settings);
        this.updateLiveWPMVisibility();
      });

      // Duration
      document.getElementById('duration-setting').addEventListener('change', (e) => {
        const settings = Storage.getSettings();
        settings.duration = parseInt(e.target.value);
        Storage.setSettings(settings);
        TypingTest.setDuration(settings.duration);
        this.updateDurationButtons(settings.duration);
      });

      // Reset buttons
      document.getElementById('reset-stats').addEventListener('click', () => {
        if (confirm('Reset stats, history, achievements and streak? Profile and settings will be kept.')) {
          Storage.clearHistory();
          Storage.set(Storage.KEYS.LEADERBOARD, []);
          Storage.set(Storage.KEYS.ACHIEVEMENTS, {});
          Storage.set(Storage.KEYS.STREAK, { current: 0, longest: 0, lastDate: null });
          Storage.set(Storage.KEYS.ANALYTICS, { tests: [] });
          showToast('Stats reset', 'success');
          this.renderDashboard();
          this.updateStreakDisplay();
        }
      });

      document.getElementById('reset-all').addEventListener('click', () => {
        if (confirm('Erase ALL data including profile? This cannot be undone.')) {
          Object.values(Storage.KEYS).forEach(k => Storage.remove(k));
          location.reload();
        }
      });

      this.updateLiveWPMVisibility();
    },

    updateLiveWPMVisibility() {
      const settings = Storage.getSettings();
      const wpmCard = document.querySelectorAll('.stat-card')[1];
      if (wpmCard) wpmCard.style.opacity = settings.showLiveWPM ? '1' : '0.5';
    },

    // ========== Profile ==========
    loadProfile() {
      const profile = Storage.getProfile();
      this.renderProfile(profile);
    },

    renderProfile(profile) {
      const initial = (profile.username || 'A')[0].toUpperCase();
      const initials = { 'profile-initial': initial, 'profile-name': profile.username, 'greeting-name': profile.username };
      Object.entries(initials).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
      });
      const avatar = document.getElementById('profile-avatar');
      if (avatar && profile.avatar) {
        avatar.innerHTML = `<img src="${profile.avatar}" alt="avatar" class="w-full h-full object-cover">`;
      } else if (avatar) {
        avatar.innerHTML = `<span id="profile-initial">${initial}</span>`;
      }
      const settingsInitial = document.getElementById('settings-avatar-initial');
      if (settingsInitial) settingsInitial.textContent = initial;
      const settingsAvatar = document.getElementById('settings-avatar');
      if (settingsAvatar && profile.avatar) {
        settingsAvatar.innerHTML = `<img src="${profile.avatar}" alt="avatar" class="w-full h-full object-cover">`;
      } else if (settingsAvatar) {
        settingsAvatar.innerHTML = `<span id="settings-avatar-initial">${initial}</span>`;
      }
      const usernameInput = document.getElementById('settings-username');
      if (usernameInput) usernameInput.value = profile.username === 'Anonymous' ? '' : profile.username;
    },

    bindProfileEditor() {
      document.getElementById('settings-username').addEventListener('input', (e) => {
        const profile = Storage.getProfile();
        profile.username = e.target.value.trim() || 'Anonymous';
        Storage.setProfile(profile);
        this.renderProfile(profile);
        this.updateGreeting();
      });

      document.getElementById('avatar-upload').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
          showToast('Image too large (max 2MB)', 'error');
          return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
          const profile = Storage.getProfile();
          profile.avatar = ev.target.result;
          Storage.setProfile(profile);
          this.renderProfile(profile);
          showToast('Avatar updated', 'success');
        };
        reader.readAsDataURL(file);
      });

      document.getElementById('profile-chip').addEventListener('click', () => this.navigate('settings'));
    },

    updateGreeting() {
      const hour = new Date().getHours();
      let greet = 'Welcome';
      if (hour < 12) greet = 'Good morning';
      else if (hour < 18) greet = 'Good afternoon';
      else greet = 'Good evening';
      document.getElementById('greeting').textContent = greet;
      const profile = Storage.getProfile();
      document.getElementById('greeting-name').textContent = profile.username;
    },

    // ========== Navigation ==========
    bindNavigation() {
      document.querySelectorAll('[data-nav]').forEach(btn => {
        btn.addEventListener('click', () => this.navigate(btn.dataset.nav));
      });
      document.getElementById('mobile-menu-btn').addEventListener('click', () => {
        document.getElementById('mobile-menu').classList.toggle('hidden');
      });
    },

    navigate(page) {
      this.currentPage = page;
      document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
      document.getElementById(`page-${page}`).classList.remove('hidden');

      document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('nav-active', btn.dataset.nav === page);
      });

      document.getElementById('mobile-menu').classList.add('hidden');

      if (page === 'dashboard') this.renderDashboard();
    },

    // ========== Typing Engine ==========
    initTypingEngine() {
      TypingTest.onUpdate = () => this.renderTyping();
      TypingTest.onFinish = (result) => this.handleTestFinish(result);
      
      const settings = Storage.getSettings();
      if (TypingTest.mode === 'words') {
        TypingTest.loadWords(TypingTest.wordsTarget);
      } else if (TypingTest.mode === 'custom' && settings.customText) {
        const wordsList = settings.customText.split(/\s+/).filter(w => w.length > 0);
        TypingTest.loadWords(wordsList.length, wordsList);
      } else {
        TypingTest.loadWords(60);
      }
      this.renderTyping();
    },

    bindTypingTest() {
      const typingArea = document.getElementById('typing-area');
      const wordsDisplay = document.getElementById('words-display');
      const placeholder = document.getElementById('typing-placeholder');
      const hiddenInput = document.getElementById('hidden-input');

      const focusInput = () => {
        hiddenInput.focus();
        if (TypingTest.state === 'idle' && placeholder) placeholder.style.display = 'none';
      };

      typingArea.addEventListener('click', focusInput);
      wordsDisplay.addEventListener('click', focusInput);

      // (F shortcut is bound separately in bindFocusShortcut in capture phase,
      // so it runs before this handler and never reaches the typing engine.)

      document.addEventListener('keydown', (e) => {
        if (this.currentPage !== 'test') return;

        // Esc = exit focus mode (and also close fullscreen)
        if (e.key === 'Escape' && document.body.classList.contains('focus-mode')) {
          e.preventDefault();
          this.setFocusMode(false);
          return;
        }

        // Tab = restart (don't focus blur)
        if (e.key === 'Tab') {
          e.preventDefault();
          if (TypingTest.state !== 'idle' || TypingTest.typedChars.length > 0) {
            TypingTest.restart();
            if (placeholder) placeholder.style.display = 'block';
          }
          return;
        }

        // Skip modifier-key combos
        if (e.ctrlKey || e.metaKey || e.altKey) return;

        // Only handle typing keys when test is active area focused or just on this page
        const handledKeys = ['Backspace', ' '];
        if (handledKeys.includes(e.key) || e.key.length === 1) {
          e.preventDefault();
          focusInput();
          TypingTest.handleKey(e.key);
          if (placeholder) placeholder.style.display = 'none';
        }
      });

      hiddenInput.addEventListener('blur', () => {
        if (TypingTest.state === 'running') {
          // Keep input logically "active" even if blurred — re-focus on next key
        }
      });

      // Duration buttons
      document.querySelectorAll('.duration-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const seconds = parseInt(btn.dataset.duration);
          TypingTest.setDuration(seconds);
          TypingTest.restart();
          this.updateDurationButtons(seconds);
          const settings = Storage.getSettings();
          settings.duration = seconds;
          Storage.setSettings(settings);
          const sel = document.getElementById('duration-setting');
          if (sel) sel.value = seconds;
          placeholder.style.display = 'block';
        });
      });

      document.getElementById('btn-restart').addEventListener('click', () => {
        TypingTest.restart();
        placeholder.style.display = 'block';
      });

      document.getElementById('btn-new-words').addEventListener('click', () => {
        TypingTest.newWords(60);
        placeholder.style.display = 'block';
      });

      document.getElementById('btn-daily').addEventListener('click', () => {
        this.dailyWords = generateDailyWords(60);
        TypingTest.words = this.dailyWords;
        TypingTest.restart();
        placeholder.style.display = 'block';
        showToast('Daily challenge loaded', 'info');
      });

      // Mobile drawer toggles
      const optionsPanel = document.getElementById('options-panel');
      const statsPanel = document.getElementById('stats-panel');
      document.getElementById('mobile-options-toggle').addEventListener('click', () => {
        optionsPanel.classList.toggle('open');
        statsPanel.classList.remove('open');
      });
      document.getElementById('mobile-stats-toggle').addEventListener('click', () => {
        statsPanel.classList.toggle('open');
        optionsPanel.classList.remove('open');
      });

      // Difficulty buttons
      document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const level = btn.dataset.difficulty;
          TypingTest.setDifficulty(level);
          document.querySelectorAll('.difficulty-btn').forEach(b => {
            b.classList.toggle('difficulty-active', b === btn);
          });
          // If a lesson is active, it overrides; clear lesson
          if (TypingTest.lesson) {
            TypingTest.clearLesson();
            document.querySelectorAll('.lesson-btn').forEach(lb => lb.classList.remove('lesson-active'));
          }
          TypingTest.newWords(60);
          placeholder.style.display = 'block';
          showToast(`Difficulty: ${level}`, 'info');
        });
      });

      // Lesson buttons
      document.querySelectorAll('.lesson-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const key = btn.dataset.lesson || null;
          if (key) {
            TypingTest.setLesson(key);
            TypingTest.loadWords(60);
            document.querySelectorAll('.lesson-btn').forEach(lb => {
              lb.classList.toggle('lesson-active', lb === btn);
            });
          } else {
            TypingTest.clearLesson();
            TypingTest.newWords(60);
            document.querySelectorAll('.lesson-btn').forEach(lb => lb.classList.remove('lesson-active'));
          }
          placeholder.style.display = 'block';
        });
      });

      // Tutorial
      this.bindTutorial();

      // Share + Certificate (in results modal)
      this.bindShareAndCertificate();

      // Results modal
      document.getElementById('result-close').addEventListener('click', () => {
        document.getElementById('results-modal').classList.add('hidden');
      });
      document.getElementById('result-again').addEventListener('click', () => {
        document.getElementById('results-modal').classList.add('hidden');
        TypingTest.restart();
        placeholder.style.display = 'block';
      });

      // Leaderboard submit
      document.getElementById('lb-submit').addEventListener('click', () => {
        const name = document.getElementById('lb-name').value.trim() || Storage.getProfile().username;
        const wpm = parseInt(document.getElementById('result-wpm').textContent);
        const accuracy = parseInt(document.getElementById('result-accuracy').textContent);
        Storage.addToLeaderboard({ name, wpm, accuracy, date: new Date().toISOString() });
        document.getElementById('leaderboard-prompt').classList.add('hidden');
        showToast('Score saved to leaderboard!', 'success');
      });
    },

    bindModeSelector() {
      const timeBtn = document.getElementById('mode-time-btn');
      const wordsBtn = document.getElementById('mode-words-btn');
      const customBtn = document.getElementById('mode-custom-btn');

      const timeContainer = document.getElementById('goal-time-container');
      const wordsContainer = document.getElementById('goal-words-container');
      const customContainer = document.getElementById('custom-text-container');

      const placeholder = document.getElementById('typing-placeholder');

      const switchMode = (mode) => {
        TypingTest.mode = mode;
        timeBtn.classList.toggle('difficulty-active', mode === 'time');
        wordsBtn.classList.toggle('difficulty-active', mode === 'words');
        customBtn.classList.toggle('difficulty-active', mode === 'custom');

        timeContainer.classList.toggle('hidden', mode !== 'time');
        wordsContainer.classList.toggle('hidden', mode !== 'words');
        customContainer.classList.toggle('hidden', mode !== 'custom');

        const settings = Storage.getSettings();
        settings.mode = mode;
        Storage.setSettings(settings);

        if (mode === 'time') {
          TypingTest.setDuration(settings.duration || 30);
          TypingTest.newWords(60);
        } else if (mode === 'words') {
          TypingTest.wordsTarget = settings.wordsTarget || 25;
          TypingTest.newWords(TypingTest.wordsTarget);
        } else if (mode === 'custom') {
          const text = (settings.customText || '').trim();
          if (text) {
            const wordsList = text.split(/\s+/).filter(w => w.length > 0);
            TypingTest.wordsTarget = wordsList.length;
            TypingTest.loadWords(wordsList.length, wordsList);
          } else {
            TypingTest.wordsTarget = 0;
            TypingTest.loadWords(0, []);
          }
        }
        
        if (placeholder) placeholder.style.display = 'block';
        const hiddenInput = document.getElementById('hidden-input');
        if (hiddenInput) hiddenInput.blur();
      };

      timeBtn.addEventListener('click', () => switchMode('time'));
      wordsBtn.addEventListener('click', () => switchMode('words'));
      customBtn.addEventListener('click', () => switchMode('custom'));

      // Word target buttons
      document.querySelectorAll('.words-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.words-btn').forEach(b => b.classList.remove('words-active'));
          btn.classList.add('words-active');
          const target = parseInt(btn.dataset.words);
          TypingTest.wordsTarget = target;
          TypingTest.newWords(target);

          const settings = Storage.getSettings();
          settings.wordsTarget = target;
          Storage.setSettings(settings);

          if (placeholder) placeholder.style.display = 'block';
          const hiddenInput = document.getElementById('hidden-input');
          if (hiddenInput) hiddenInput.focus();
        });
      });

      // Load custom text button
      document.getElementById('btn-load-custom').addEventListener('click', () => {
        const text = document.getElementById('custom-text-input').value.trim();
        if (!text) {
          if (typeof showToast !== 'undefined') showToast('Please enter some text first!', 'error');
          return;
        }
        const wordsList = text.split(/\s+/).filter(w => w.length > 0);
        TypingTest.wordsTarget = wordsList.length;
        TypingTest.loadWords(wordsList.length, wordsList);

        const settings = Storage.getSettings();
        settings.customText = text;
        Storage.setSettings(settings);

        if (placeholder) placeholder.style.display = 'block';
        if (typeof showToast !== 'undefined') showToast(`Loaded custom practice text (${wordsList.length} words)!`, 'success');
        const hiddenInput = document.getElementById('hidden-input');
        if (hiddenInput) hiddenInput.focus();
      });

      // Sudden Death toggle
      const suddenDeathToggle = document.getElementById('sudden-death-toggle');
      if (suddenDeathToggle) {
        suddenDeathToggle.addEventListener('change', (e) => {
          const checked = e.target.checked;
          TypingTest.suddenDeath = checked;
          
          const settings = Storage.getSettings();
          settings.suddenDeath = checked;
          Storage.setSettings(settings);

          if (typeof showToast !== 'undefined') {
            showToast(checked ? 'Sudden Death mode enabled!' : 'Sudden Death mode disabled!', 'success');
          }
          TypingTest.restart();
          if (placeholder) placeholder.style.display = 'block';
        });
      }
    },

    renderTyping() {
      const display = document.getElementById('words-display');
      // Use an inner wrapper so horizontal translateX doesn't get clipped by
      // the display's overflow:hidden (or visibly clip adjacent words).
      display.innerHTML = `<span class="words-inner">${this.buildWordsHTML()}</span>`;

      // Update stats (both side panel IDs)
      const acc = `${TypingTest.stats.accuracy}<span class="text-base text-fg/50">%</span>`;
      
      // Handle dynamic time remaining / elapsed representation
      let displayTime = TypingTest.timeRemaining;
      document.getElementById('stat-time').textContent = displayTime;
      document.getElementById('stat-wpm').textContent = TypingTest.stats.wpm;
      document.getElementById('stat-accuracy').innerHTML = acc;
      document.getElementById('stat-chars').textContent = TypingTest.stats.charactersTyped;
      document.getElementById('stat-errors').textContent = TypingTest.stats.incorrectChars;

      // Progress bar calculation based on mode
      let progress = 0;
      if (TypingTest.mode === 'time') {
        progress = TypingTest.duration > 0
          ? Math.round(((TypingTest.duration - TypingTest.timeRemaining) / TypingTest.duration) * 100)
          : 0;
      } else {
        progress = TypingTest.wordsTarget > 0
          ? Math.round((TypingTest.currentWordIndex / TypingTest.wordsTarget) * 100)
          : 0;
      }
      const bar = document.getElementById('progress-bar');
      const pct = document.getElementById('progress-pct');
      if (bar) bar.style.width = `${progress}%`;
      if (pct) pct.textContent = `${progress}%`;

      // Body class triggers hero collapse (CSS handles animation)
      if (TypingTest.state === 'running') {
        document.body.classList.add('is-typing');
      } else if (TypingTest.state === 'idle' || TypingTest.state === 'finished') {
        // Only remove on idle (not finished — results modal still visible)
        if (TypingTest.state === 'idle' && TypingTest.typedChars.length === 0) {
          document.body.classList.remove('is-typing');
        }
      }

      // Auto-scroll: keep current word centered
      this.scrollCurrentIntoView();
    },

    buildWordsHTML() {
      // Build char-by-char map
      const charMap = new Map(); // "w-c" -> {char, correct}
      TypingTest.typedChars.forEach(t => {
        if (!t.isSpace) charMap.set(`${t.wordIdx}-${t.charIdx}`, { char: t.char, correct: t.correct });
      });

      // Determine word-level state: past / current / future
      const curWI = TypingTest.currentWordIndex;
      const curCI = TypingTest.currentCharIndex;

      // Render a sliding window of words (current ± a few) for performance
      const windowStart = Math.max(0, curWI - 4);
      const windowEnd = Math.min(TypingTest.words.length, curWI + 8);
      const rendered = [];

      for (let wi = windowStart; wi < windowEnd; wi++) {
        const word = TypingTest.words[wi];
        let wordClass;
        if (wi < curWI) wordClass = 'word past';
        else if (wi === curWI) wordClass = 'word current';
        else wordClass = 'word future';

        const chars = [];
        for (let ci = 0; ci < word.length; ci++) {
          const typed = charMap.get(`${wi}-${ci}`);
          let cls = 'char remaining';
          let displayChar = word[ci];
          if (typed) {
            cls = typed.correct ? 'char correct' : 'char incorrect';
            displayChar = typed.correct ? word[ci] : typed.char;
          }
          if (wi === curWI && ci === curCI) {
            cls += ' current';
          }
          chars.push(`<span class="${cls}">${this.escapeHTML(displayChar)}</span>`);
        }

        // Render extra characters typed past word length
        let extraCi = word.length;
        while (charMap.has(`${wi}-${extraCi}`)) {
          const typed = charMap.get(`${wi}-${extraCi}`);
          let cls = 'char incorrect extra';
          if (wi === curWI && extraCi === curCI) {
            cls += ' current';
          }
          chars.push(`<span class="${cls}">${this.escapeHTML(typed.char)}</span>`);
          extraCi++;
        }

        // General caret placement (at end of standard chars or extra chars)
        if (wi === curWI && curCI === extraCi) {
          chars.push('<span class="char current space-cursor">&nbsp;</span>');
        }

        rendered.push(`<span class="${wordClass}">${chars.join('')}</span>`);
      }

      return rendered.join('');
    },

    escapeHTML(s) {
      if (s === ' ') return '&nbsp;';
      return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    },

    // ========== Tutorial ==========
    openTutorial() {
      const modal = document.getElementById('tutorial-modal');
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    },

    closeTutorial() {
      const modal = document.getElementById('tutorial-modal');
      modal.classList.remove('open');
      document.body.style.overflow = '';
      Storage.setTutorialSeen(true);
    },

    switchTutorialTab(name) {
      document.querySelectorAll('.tutorial-tab').forEach(t => {
        t.classList.toggle('tutorial-tab-active', t.dataset.tab === name);
      });
      document.querySelectorAll('.tutorial-panel').forEach(p => {
        p.classList.toggle('tutorial-panel-active', p.id === `tab-${name}`);
      });
    },

    bindTutorial() {
      document.getElementById('btn-tutorial').addEventListener('click', () => this.openTutorial());
      document.getElementById('tutorial-close').addEventListener('click', () => this.closeTutorial());
      document.getElementById('tutorial-start').addEventListener('click', () => {
        this.closeTutorial();
        const placeholder = document.getElementById('typing-placeholder');
        if (placeholder) placeholder.style.display = 'block';
        const hiddenInput = document.getElementById('hidden-input');
        if (hiddenInput) hiddenInput.focus();
      });

      document.querySelectorAll('.tutorial-tab').forEach(tab => {
        tab.addEventListener('click', () => this.switchTutorialTab(tab.dataset.tab));
      });

      // Click outside modal closes
      document.getElementById('tutorial-modal').addEventListener('click', (e) => {
        if (e.target.id === 'tutorial-modal') this.closeTutorial();
      });

      // Esc closes
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          const modal = document.getElementById('tutorial-modal');
          if (modal && modal.classList.contains('open')) {
            e.preventDefault();
            this.closeTutorial();
          }
        }
      });
    },

    maybeAutoShowTutorial() {
      if (!Storage.getTutorialSeen()) {
        // Small delay so the page paints first
        setTimeout(() => this.openTutorial(), 350);
      }
    },

    // ========== Share + Certificate ==========
    _shareOpts() {
      return { username: Storage.getProfile().username };
    },

    bindShareAndCertificate() {
      const shareBtn = document.getElementById('btn-share');
      const certBtn = document.getElementById('btn-certificate');
      const popover = document.getElementById('share-popover');
      if (!shareBtn || !certBtn || !popover) return;

      // Toggle popover
      shareBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const wasOpen = !popover.classList.contains('hidden');
        popover.classList.toggle('hidden');
        shareBtn.setAttribute('data-active', wasOpen ? 'false' : 'true');
      });

      // Popover actions
      popover.querySelectorAll('[data-share]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const action = btn.dataset.share;
          if (!this.lastResult) {
            showToast('No test result to share yet', 'error');
            return;
          }
          const text = Share.buildShareText(this.lastResult, this._shareOpts().username);
          const url = Share.buildShareUrl();
          try {
            if (action === 'twitter') {
              Share.shareToTwitter(text, url);
            } else if (action === 'facebook') {
              Share.shareToFacebook(url);
            } else if (action === 'copy') {
              const ok = await Share.copyLink(text);
              showToast(ok ? 'Link copied to clipboard' : 'Could not copy', ok ? 'success' : 'error');
            } else if (action === 'image') {
              const filename = await Share.downloadShareCard(this.lastResult, this._shareOpts());
              showToast(`Saved ${filename}`, 'success');
            }
          } catch (err) {
            console.error('Share error', err);
            showToast(`Could not ${action}: ${err.message || err}`, 'error');
          }
          // Close popover after action
          popover.classList.add('hidden');
          shareBtn.setAttribute('data-active', 'false');
        });
      });

      // Click anywhere else closes the popover
      document.addEventListener('click', () => {
        if (!popover.classList.contains('hidden')) {
          popover.classList.add('hidden');
          shareBtn.setAttribute('data-active', 'false');
        }
      });

      // Certificate — generate + download immediately
      certBtn.addEventListener('click', async () => {
        if (!this.lastResult) {
          showToast('Complete a test first', 'error');
          return;
        }
        certBtn.disabled = true;
        const originalText = certBtn.textContent.trim();
        certBtn.innerHTML = `
          <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-opacity="0.25" stroke-width="2"></circle><path d="M12 2a10 10 0 0110 10" stroke-width="2" stroke-linecap="round"></path></svg>
          Generating…
        `;
        try {
          const filename = await Share.downloadCertificate(this.lastResult, this._shareOpts());
          showToast(`Certificate saved: ${filename}`, 'success');
        } catch (err) {
          console.error('Certificate error', err);
          showToast(`Could not generate certificate: ${err.message || err}`, 'error');
        } finally {
          certBtn.disabled = false;
          // Restore the original button content (with icon)
          certBtn.innerHTML = `
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            Certificate
          `;
        }
      });
    },

    scrollCurrentIntoView() {
      const display = document.getElementById('words-display');
      const inner = display.querySelector('.words-inner');
      const currentWord = display.querySelector('.word.current');
      if (!currentWord) return;

      // Reset prior transform so we always measure the "natural" layout.
      // (Reading the word's rect while a translateX is applied would shift
      // the value we're trying to compute, causing feedback / jitter.)
      if (inner) inner.style.transform = '';

      const displayRect = display.getBoundingClientRect();
      const wordRect = currentWord.getBoundingClientRect();

      // Vertical centering — clamp so we don't scroll past top/bottom.
      const wordCenterY = wordRect.top + wordRect.height / 2;
      const displayCenterY = displayRect.top + displayRect.height / 2;
      const maxScroll = display.scrollHeight - display.clientHeight;
      const desiredScroll = display.scrollTop + (wordCenterY - displayCenterY);
      display.scrollTop = Math.max(0, Math.min(maxScroll, desiredScroll));

      // Horizontal centering — re-measure after the transform reset, then
      // shift the inner wrapper so the current word sits on the center axis.
      if (inner) {
        const wordRect2 = currentWord.getBoundingClientRect();
        const wordCenterX = wordRect2.left + wordRect2.width / 2;
        const displayCenterX = displayRect.left + displayRect.width / 2;
        const xOffset = displayCenterX - wordCenterX;
        if (Math.abs(xOffset) > 0.5) {
          inner.style.transform = `translateX(${xOffset}px)`;
        }
      }
    },

    handleTestFinish(result) {
      // Stash for the Share + Certificate buttons in the modal
      this.lastResult = result;

      // Save history
      const entry = {
        date: new Date().toISOString(),
        wpm: result.wpm,
        accuracy: result.accuracy,
        duration: result.duration,
        correctChars: result.correctChars,
        incorrectChars: result.incorrectChars
      };
      Storage.addHistoryEntry(entry);

      // Save analytics
      Storage.addAnalytics({
        date: entry.date,
        samples: result.samples,
        wpm: result.wpm,
        accuracy: result.accuracy
      });

      // Update streak
      const streak = Storage.recordPracticeToday();
      this.updateStreakDisplay();

      // Evaluate achievements
      const unlocked = evaluateAchievements(result);

      // Populate modal
      document.getElementById('result-wpm').textContent = result.wpm;
      document.getElementById('result-accuracy').textContent = `${result.accuracy}%`;
      document.getElementById('result-duration').textContent = `${result.duration}s`;
      document.getElementById('result-correct').textContent = result.correctChars;
      document.getElementById('result-incorrect').textContent = result.incorrectChars;

      // Populate mistakes to practice
      const mistakesContainer = document.getElementById('result-mistakes-container');
      const mistakesEl = document.getElementById('result-mistakes');
      if (mistakesContainer && mistakesEl) {
        const sortedMistakes = Object.entries(result.mistakesByKey || {})
          .sort((a, b) => b[1] - a[1]);

        if (sortedMistakes.length > 0) {
          mistakesContainer.classList.remove('hidden');
          mistakesEl.innerHTML = sortedMistakes
            .slice(0, 5)
            .map(([key, count]) => `<span class="px-2.5 py-1 rounded font-chalk text-xs" style="background-color: var(--bg-soft); border: 1px solid var(--glass-border); color: var(--fg-soft)"><strong style="color: var(--fg)">${key.toUpperCase()}</strong> (${count})</span>`)
            .join('');
        } else {
          mistakesContainer.classList.add('hidden');
        }
      }

      const tier = getPerformanceTier(result.wpm);
      const tierEl = document.getElementById('result-tier');
      tierEl.textContent = `${tier.label}`;
      tierEl.className = `mt-3 text-lg font-semibold ${tier.color}`;

      // Achievements
      const achBlock = document.getElementById('new-achievements');
      const achList = document.getElementById('achievements-list');
      if (unlocked.length > 0) {
        achBlock.classList.remove('hidden');
        achList.innerHTML = unlocked.map(key => {
          const a = ACHIEVEMENTS[key];
          return `<div class="px-3 py-2 rounded font-chalk text-xs" style="border: 1px solid var(--fg)">${a.icon} ${a.name}</div>`;
        }).join('');
        setTimeout(() => {
          unlocked.forEach(key => {
            showToast(`🏆 ${ACHIEVEMENTS[key].name} unlocked!`, 'success');
          });
        }, 600);
      } else {
        achBlock.classList.add('hidden');
      }

      // Leaderboard prompt
      const lbPrompt = document.getElementById('leaderboard-prompt');
      if (Storage.isLeaderboardWorthy(result.wpm, result.accuracy)) {
        lbPrompt.classList.remove('hidden');
        document.getElementById('lb-name').value = Storage.getProfile().username;
      } else {
        lbPrompt.classList.add('hidden');
      }

      document.getElementById('results-modal').classList.remove('hidden');

      // Refresh dashboard if visible
      if (this.currentPage === 'dashboard') this.renderDashboard();
    },

    updateStreakDisplay() {
      const streak = Storage.getStreak();
      document.getElementById('streak-current').textContent = streak.current;
      document.getElementById('streak-longest').textContent = streak.longest;
      const sideEl = document.getElementById('streak-current-side');
      if (sideEl) sideEl.textContent = streak.current;
      const dailyStreak = document.getElementById('daily-streak');
      if (dailyStreak && streak.current > 0) {
        dailyStreak.textContent = `${streak.current} day${streak.current === 1 ? '' : 's'} 🔥`;
      } else if (dailyStreak) {
        dailyStreak.textContent = '';
      }
    },

    // ========== Dashboard ==========
    bindDashboard() {
      document.getElementById('clear-history').addEventListener('click', () => {
        if (confirm('Clear all test history?')) {
          Storage.clearHistory();
          this.renderHistory();
          showToast('History cleared', 'success');
        }
      });
      document.getElementById('clear-leaderboard').addEventListener('click', () => {
        if (confirm('Clear leaderboard?')) {
          Storage.set(Storage.KEYS.LEADERBOARD, []);
          this.renderLeaderboard();
          showToast('Leaderboard cleared', 'success');
        }
      });
    },

    renderDashboard() {
      this.renderStatTiles();
      this.renderCharts();
      this.renderLeaderboard();
      this.renderHistory();
      this.renderAchievements();
    },

    renderStatTiles() {
      const history = Storage.getHistory();
      const tests = history.length;
      const avgWPM = tests > 0 ? Math.round(history.reduce((s, h) => s + h.wpm, 0) / tests) : 0;
      const bestWPM = tests > 0 ? Math.max(...history.map(h => h.wpm)) : 0;
      const avgAcc = tests > 0 ? Math.round(history.reduce((s, h) => s + h.accuracy, 0) / tests) : 0;
      document.getElementById('dash-tests').textContent = tests;
      document.getElementById('dash-avg-wpm').textContent = avgWPM;
      document.getElementById('dash-best-wpm').textContent = bestWPM;
      document.getElementById('dash-avg-acc').textContent = `${avgAcc}%`;
    },

    renderCharts() {
      const analytics = Storage.getAnalytics();
      const tests = analytics.tests.slice().reverse(); // chronological
      const labels = tests.map((t, i) => `#${i + 1}`);
      const wpmData = tests.map(t => t.wpm);
      const accData = tests.map(t => t.accuracy);

      const theme = Storage.getTheme();
      const isLight = theme === 'light';
      const textColor = isLight ? '#2a2820' : '#a8a59c';
      const gridColor = isLight ? 'rgba(42,40,32,0.08)' : 'rgba(245,240,225,0.06)';

      const chartOpts = (label, data) => ({
        type: 'line',
        data: {
          labels,
          datasets: [{
            label, data,
            borderColor: isLight ? '#2a2820' : '#f5f0e1',
            backgroundColor: isLight ? 'rgba(42,40,32,0.06)' : 'rgba(245,240,225,0.04)',
            tension: 0.2, fill: true,
            pointRadius: 2, pointHoverRadius: 4,
            pointBackgroundColor: isLight ? '#2a2820' : '#f5f0e1',
            borderWidth: 1.5
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: textColor, font: { size: 10, family: 'JetBrains Mono' } }, grid: { color: gridColor, display: false } },
            y: { ticks: { color: textColor, font: { size: 10, family: 'JetBrains Mono' } }, grid: { color: gridColor }, beginAtZero: true }
          }
        }
      });

      if (this.charts.wpm) this.charts.wpm.destroy();
      if (this.charts.accuracy) this.charts.accuracy.destroy();

      const wpmCtx = document.getElementById('chart-wpm').getContext('2d');
      const accCtx = document.getElementById('chart-accuracy').getContext('2d');
      this.charts.wpm = new Chart(wpmCtx, chartOpts('WPM', wpmData));
      this.charts.accuracy = new Chart(accCtx, chartOpts('Accuracy %', accData));
    },

    renderLeaderboard() {
      const lb = Storage.getLeaderboard();
      const list = document.getElementById('leaderboard-list');
      const empty = document.getElementById('leaderboard-empty');
      if (lb.length === 0) {
        list.innerHTML = '';
        empty.classList.remove('hidden');
        return;
      }
      empty.classList.add('hidden');
      const top10 = lb.slice(0, 10);
      list.innerHTML = top10.map((entry, i) => {
        const rankClass = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : '';
        return `
          <div class="lb-row">
            <div class="rank ${rankClass}">${String(i + 1).padStart(2, '0')}</div>
            <div class="font-chalk truncate">${this.escapeHTML(entry.name)}</div>
            <div class="font-chalk">${entry.wpm} <span class="text-xs" style="color: var(--fg-faint)">wpm</span></div>
            <div class="lb-acc font-chalk text-sm">${entry.accuracy}%</div>
          </div>`;
      }).join('');
    },

    renderHistory() {
      const history = Storage.getHistory();
      const list = document.getElementById('history-list');
      const empty = document.getElementById('history-empty');
      if (history.length === 0) {
        list.innerHTML = '';
        empty.classList.remove('hidden');
        return;
      }
      empty.classList.add('hidden');
      list.innerHTML = history.map((h, i) => {
        const d = new Date(h.date);
        const dateStr = `${d.getMonth() + 1}/${d.getDate()}/${String(d.getFullYear()).slice(-2)} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
        return `
          <div class="history-row">
            <div class="truncate" style="color: var(--fg-soft)">${dateStr}</div>
            <div class="font-chalk">${h.wpm}<span class="hide-mobile text-xs" style="color: var(--fg-faint)"> wpm</span></div>
            <div class="font-chalk">${h.accuracy}<span class="hide-mobile text-xs" style="color: var(--fg-faint)">%</span></div>
            <div class="hide-mobile font-chalk" style="color: var(--fg-soft)">${h.duration}s</div>
            <button class="delete-btn" data-delete="${i}" title="Delete">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"/></svg>
            </button>
          </div>`;
      }).join('');

      list.querySelectorAll('[data-delete]').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.delete);
          Storage.deleteHistoryEntry(idx);
          this.renderHistory();
          this.renderStatTiles();
        });
      });
    },

    renderAchievements() {
      const grid = document.getElementById('achievements-grid');
      const earned = Storage.getAchievements();
      const total = Object.keys(ACHIEVEMENTS).length;
      const earnedCount = Object.values(earned).filter(Boolean).length;
      document.getElementById('achievement-progress').textContent = `${earnedCount} / ${total}`;

      grid.innerHTML = Object.entries(ACHIEVEMENTS).map(([key, ach]) => {
        const unlocked = earned[key];
        return `
          <div class="achievement-badge ${unlocked ? 'unlocked' : 'locked'}">
            <div class="achievement-icon">${ach.icon}</div>
            <div class="text-xs font-chalk uppercase tracking-wider">${ach.name}</div>
            <div class="text-xs font-chalk leading-tight" style="color: var(--fg-faint)">${ach.desc}</div>
          </div>`;
      }).join('');
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
  } else {
    App.init();
  }
})();