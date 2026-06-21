// Sound module — typewriter & mechanical keyboard synthesis (Web Audio API, no external files)
//
// Layers:
//   1. Click  — bright percussive transient (like a key stem striking)
//   2. Thock  — lower body resonance (key bottoming out on the plate)
//   3. Spacebar — distinctive deeper thud with longer decay
//   4. Return  — long carriage-return swoosh (when starting a test)
//   5. Ambient — continuous gentle mechanical hum that fades in/out around your typing
//
// Profiles:
//   typewriter — vintage manual typewriter (sharp, metallic)
//   cherry-mx — modern mechanical keyboard (clicky red/brown)
//   topre      — smooth electrostatic (soft, deeper)
//   silent     — muted rubber dome

const Sound = {
  ctx: null,
  enabled: true,
  ambientEnabled: false,
  ambientVolume: 0.04,        // 0..1
  masterVolume: 0.6,          // 0..1
  profile: 'typewriter',      // current profile
  ambientNodes: null,         // active ambient loop

  // Profile presets — each character has slight randomization for natural feel
  profiles: {
    typewriter: {
      clickFreq: 2400,
      clickDecay: 0.04,
      thockFreq: 180,
      thockDecay: 0.08,
      spaceFreq: 90,
      spaceDecay: 0.18,
      bodyGain: 0.55,
      variation: 0.18
    },
    'cherry-mx': {
      clickFreq: 3200,
      clickDecay: 0.025,
      thockFreq: 280,
      thockDecay: 0.05,
      spaceFreq: 160,
      spaceDecay: 0.10,
      bodyGain: 0.45,
      variation: 0.12
    },
    topre: {
      clickFreq: 1800,
      clickDecay: 0.06,
      thockFreq: 140,
      thockDecay: 0.12,
      spaceFreq: 80,
      spaceDecay: 0.22,
      bodyGain: 0.40,
      variation: 0.08
    },
    silent: {
      clickFreq: 0, clickDecay: 0.001,
      thockFreq: 0, thockDecay: 0.001,
      spaceFreq: 0, spaceDecay: 0.001,
      bodyGain: 0.15, variation: 0
    }
  },

  init() {
    if (this.ctx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
    } catch (e) {
      this.ctx = null;
    }
  },

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  },

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) this.stopAmbient();
  },

  setProfile(name) {
    if (this.profiles[name]) this.profile = name;
  },

  setMasterVolume(v) {
    this.masterVolume = Math.max(0, Math.min(1, v));
  },

  // Random helper for natural variation
  rand(min, max) { return Math.random() * (max - min) + min; },

  // Build a quick noise buffer (used for the percussive transient)
  _noiseBuffer(durationSec) {
    const sr = this.ctx.sampleRate;
    const len = Math.max(1, Math.floor(sr * durationSec));
    const buf = this.ctx.createBuffer(1, len, sr);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  },

  // The "click" transient — short noise burst shaped with a high-pass envelope
  _click(now, gain) {
    const p = this.profiles[this.profile];
    if (p.clickFreq <= 0) return;
    const dur = p.clickDecay;
    const src = this.ctx.createBufferSource();
    src.buffer = this._noiseBuffer(dur);
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = p.clickFreq * this.rand(0.9, 1.1);
    bp.Q.value = 8;
    const g = this.ctx.createGain();
    const peak = 0.32 * gain * this.masterVolume * p.bodyGain;
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(peak, now + 0.001);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    src.connect(bp).connect(g).connect(this.ctx.destination);
    src.start(now);
    src.stop(now + dur + 0.01);
  },

  // The "thock" — sine sweep giving the body its deep resonance
  _thock(now, gain, freq, dur, peak) {
    if (freq <= 0) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 1.4, now);
    osc.frequency.exponentialRampToValueAtTime(freq, now + 0.012);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(peak * gain * this.masterVolume, now + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(g).connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + dur + 0.01);
  },

  // Standard key press — click + thock layered
  keyClick() {
    if (!this.enabled || !this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;
    const p = this.profiles[this.profile];
    const variation = 1 + (Math.random() - 0.5) * 2 * p.variation;
    this._click(now, 1);
    this._thock(now, 1, p.thockFreq * variation, p.thockDecay, 0.55);
  },

  // Spacebar — deeper, longer
  spacebar() {
    if (!this.enabled || !this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;
    const p = this.profiles[this.profile];
    this._click(now, 1.1);
    this._thock(now, 1.2, p.spaceFreq, p.spaceDecay, 0.7);
  },

  // Error buzz — dissonant downward sweep
  error() {
    if (!this.enabled || !this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;
    // Dissonant layer: two detuned sawtooths sliding down
    [180, 215].forEach(f => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.18);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.05 * this.masterVolume, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
      osc.connect(g).connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.24);
    });
  },

  // Return carriage — long metallic swoosh (plays once at test start)
  carriageReturn() {
    if (!this.enabled || !this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;
    // Noise sweep with bandpass glide
    const src = this.ctx.createBufferSource();
    src.buffer = this._noiseBuffer(0.5);
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 6;
    bp.frequency.setValueAtTime(4000, now);
    bp.frequency.exponentialRampToValueAtTime(600, now + 0.45);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.18 * this.masterVolume, now + 0.02);
    g.gain.linearRampToValueAtTime(0.10 * this.masterVolume, now + 0.4);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
    src.connect(bp).connect(g).connect(this.ctx.destination);
    src.start(now);
    src.stop(now + 0.6);
  },

  // Test finished — soft chime
  finish() {
    if (!this.enabled || !this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;
    [523, 659, 784].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0, now + i * 0.12);
      g.gain.linearRampToValueAtTime(0.07 * this.masterVolume, now + i * 0.12 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 0.4);
      osc.connect(g).connect(this.ctx.destination);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.42);
    });
  },

  // ===== Ambient mechanical hum =====
  // A continuous, very quiet "machine running" sound. Mostly low-frequency rumble
  // with filtered noise that suggests a constant mechanism in the background.
  startAmbient() {
    if (!this.ctx || this.ambientNodes) return;
    this.resume();

    const now = this.ctx.currentTime;
    const ctx = this.ctx;

    // Layer 1: low rumble (two detuned sine oscillators)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 55;
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 73;
    const osc3 = ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.value = 110;

    const rumbleGain = ctx.createGain();
    rumbleGain.gain.setValueAtTime(0, now);
    rumbleGain.gain.linearRampToValueAtTime(0.012 * this.masterVolume * (this.ambientVolume / 0.04), now + 0.8);

    osc1.connect(rumbleGain);
    osc2.connect(rumbleGain);
    osc3.connect(rumbleGain);

    // Layer 2: filtered noise (paper/mechanism hiss)
    const noise = ctx.createBufferSource();
    noise.buffer = this._noiseBuffer(2);
    noise.loop = true;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 800;
    noiseFilter.Q.value = 0.8;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(0.018 * this.masterVolume * (this.ambientVolume / 0.04), now + 1.2);

    noise.connect(noiseFilter).connect(noiseGain);

    // Layer 3: gentle mid "hum" (mechanical resonance)
    const humOsc = ctx.createOscillator();
    humOsc.type = 'triangle';
    humOsc.frequency.value = 220;
    const humGain = ctx.createGain();
    humGain.gain.setValueAtTime(0, now);
    humGain.gain.linearRampToValueAtTime(0.008 * this.masterVolume * (this.ambientVolume / 0.04), now + 1.0);
    humOsc.connect(humGain);

    // Output -> master gain so we can fade out cleanly
    const masterGain = ctx.createGain();
    masterGain.gain.value = 1;

    rumbleGain.connect(masterGain);
    noiseGain.connect(masterGain);
    humGain.connect(masterGain);
    masterGain.connect(ctx.destination);

    // Start
    osc1.start(now); osc2.start(now); osc3.start(now);
    noise.start(now);
    humOsc.start(now);

    this.ambientNodes = { osc1, osc2, osc3, noise, humOsc, masterGain, rumbleGain, noiseGain, humGain };
  },

  stopAmbient() {
    if (!this.ambientNodes || !this.ctx) return;
    const now = this.ctx.currentTime;
    const n = this.ambientNodes;
    // Fade out
    [n.rumbleGain, n.noiseGain, n.humGain].forEach(g => {
      try { g.gain.cancelScheduledValues(now); g.gain.setValueAtTime(g.gain.value, now); g.gain.linearRampToValueAtTime(0, now + 0.4); } catch (e) {}
    });
    // Stop oscillators after fade
    setTimeout(() => {
      try { n.osc1.stop(); n.osc2.stop(); n.osc3.stop(); n.noise.stop(); n.humOsc.stop(); } catch (e) {}
    }, 500);
    this.ambientNodes = null;
  },

  setAmbientEnabled(on) {
    this.ambientEnabled = on;
    if (on) this.startAmbient();
    else this.stopAmbient();
  },

  setAmbientVolume(v) {
    this.ambientVolume = Math.max(0, Math.min(0.2, v));
    if (this.ambientNodes) {
      // Update live gains proportionally
      const ratio = this.ambientVolume / 0.04;
      const now = this.ctx.currentTime;
      const n = this.ambientNodes;
      try {
        n.rumbleGain.gain.linearRampToValueAtTime(0.012 * this.masterVolume * ratio, now + 0.1);
        n.noiseGain.gain.linearRampToValueAtTime(0.018 * this.masterVolume * ratio, now + 0.1);
        n.humGain.gain.linearRampToValueAtTime(0.008 * this.masterVolume * ratio, now + 0.1);
      } catch (e) {}
    }
  }
};

// Auto-pause ambient when the tab is hidden, resume on return
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!Sound.ambientNodes) return;
    if (document.hidden) {
      Sound.stopAmbient();
    } else if (Sound.ambientEnabled) {
      Sound.startAmbient();
    }
  });
}