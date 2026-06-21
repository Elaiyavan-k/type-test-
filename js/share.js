// Share — build social share text, themed share card PNG, and PDF certificate
const Share = {
  // -------- Theme resolution --------
  // Read CSS variables off <html data-theme=...> at click-time so the rendered
  // card respects the user's currently-selected theme.
  resolveThemeColors() {
    const root = document.documentElement;
    const cs = getComputedStyle(root);
    const get = (name) => cs.getPropertyValue(name).trim();
    return {
      bg:       get('--bg')       || '#1a1d20',
      bgDeep:   get('--bg-deep')  || '#14171a',
      bgSoft:   get('--bg-soft')  || '#202427',
      fg:       get('--fg')       || '#f0ebe0',
      fgSoft:   get('--fg-soft')  || '#a8a59c',
      fgFaint:  get('--fg-faint') || '#5a5d61',
      chalk:    get('--chalk')    || '#f5f0e1',
      chalkDim: get('--chalk-dim')|| 'rgba(245,240,225,0.55)',
      accent:   get('--accent')   || '#f5f0e1',
      accent2:  get('--accent-2') || '#d4cfc1',
      success:  get('--success')  || '#c8d4b8',
      error:    get('--error')    || '#d4a89c',
      border:   get('--glass-border') || 'rgba(245,240,225,0.10)'
    };
  },

  // Map WPM → tier color, but using resolved theme colors so the canvas
  // capture matches the live UI instead of fighting Tailwind class names.
  tierAccent(wpm, c) {
    if (wpm >= 80) return c.chalk;
    if (wpm >= 50) return c.accent;
    if (wpm >= 30) return c.accent2;
    return c.fgSoft;
  },

  // -------- Helpers --------
  escape(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
  },

  formatDate(d = new Date()) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  },

  formatLongDate(d = new Date()) {
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  },

  buildShareText(result, username) {
    return `I scored ${result.wpm} WPM at ${result.accuracy}% accuracy on TypeFlow in ${result.duration}s.`;
  },

  // -------- Share card HTML (800×420) --------
  // Built with inline styles so html2canvas doesn't need external CSS to render correctly.
  buildShareCardHTML(result, opts = {}) {
    const username = opts.username || 'Anonymous';
    const date = opts.date || this.formatDate();
    const c = this.resolveThemeColors();
    const tier = getPerformanceTier(result.wpm);
    const accent = this.tierAccent(result.wpm, c);

    // Error color — derive a warm red but allow theme override
    const errColor = result.incorrectChars > 0 ? c.error : c.fgSoft;

    return `
<div id="share-card" style="
  width: 800px;
  height: 420px;
  background-color: ${c.bg};
  color: ${c.chalk};
  font-family: 'Inter', sans-serif;
  border: 1px solid ${c.border};
  box-sizing: border-box;
  padding: 48px 56px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
">
  <!-- Eyebrow -->
  <div style="display: flex; align-items: center; justify-content: space-between;">
    <div style="font-family: 'JetBrains Mono', monospace; font-size: 14px; letter-spacing: 0.32em; color: ${c.fgSoft}; text-transform: uppercase;">
      TypeFlow
    </div>
    <div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: 0.18em; color: ${c.fgFaint}; text-transform: uppercase;">
      typing test
    </div>
  </div>

  <!-- Hairline -->
  <div style="height: 1px; background-color: ${c.border}; margin: 24px 0 12px 0;"></div>

  <!-- Headline numbers -->
  <div style="display: flex; align-items: flex-end; gap: 56px; margin-top: 12px;">
    <div>
      <div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: 0.22em; color: ${c.fgFaint}; text-transform: uppercase; margin-bottom: 8px;">
        Words per minute
      </div>
      <div style="font-family: 'JetBrains Mono', monospace; font-size: 96px; line-height: 1; color: ${c.chalk}; font-weight: 500; font-variant-numeric: tabular-nums; letter-spacing: -0.02em;">
        ${result.wpm}
      </div>
    </div>
    <div style="padding-bottom: 8px;">
      <div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: 0.22em; color: ${c.fgFaint}; text-transform: uppercase; margin-bottom: 8px;">
        Accuracy
      </div>
      <div style="font-family: 'JetBrains Mono', monospace; font-size: 36px; line-height: 1; color: ${c.chalk}; font-weight: 500; font-variant-numeric: tabular-nums;">
        ${result.accuracy}<span style="font-size: 22px; color: ${c.fgSoft};">%</span>
      </div>
    </div>
    <div style="margin-left: auto; text-align: right; padding-bottom: 8px;">
      <div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: 0.22em; color: ${c.fgFaint}; text-transform: uppercase; margin-bottom: 8px;">
        Tier
      </div>
      <div style="font-family: 'JetBrains Mono', monospace; font-size: 28px; line-height: 1; color: ${accent}; font-weight: 500;">
        ${this.escape(tier.label)}
      </div>
      <div style="height: 2px; background-color: ${accent}; margin-top: 10px; width: 120px; margin-left: auto;"></div>
    </div>
  </div>

  <!-- Detail row -->
  <div style="display: flex; gap: 32px; font-family: 'JetBrains Mono', monospace; font-size: 13px; color: ${c.fgSoft}; letter-spacing: 0.06em; text-transform: uppercase;">
    <div><span style="color: ${c.fgFaint};">Duration</span> · ${result.duration}s</div>
    <div><span style="color: ${c.fgFaint};">Correct</span> · ${result.correctChars}</div>
    <div><span style="color: ${c.fgFaint};">Errors</span> · <span style="color: ${errColor};">${result.incorrectChars}</span></div>
  </div>

  <!-- Footer -->
  <div style="display: flex; align-items: flex-end; justify-content: space-between; border-top: 1px solid ${c.border}; padding-top: 20px;">
    <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.22em; color: ${c.fgFaint}; text-transform: uppercase;">
      typeflow · take the test
    </div>
    <div style="text-align: right;">
      <div style="font-family: 'JetBrains Mono', monospace; font-size: 14px; color: ${c.chalk}; letter-spacing: 0.04em;">
        ${this.escape(username)}
      </div>
      <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.16em; color: ${c.fgFaint}; margin-top: 4px;">
        ${date}
      </div>
    </div>
  </div>
</div>`;
  },

  // -------- Certificate HTML (A4 portrait, 1240×1754) --------
  // Cream/light paper feel even in dark themes — reads as a real document.
  // Light theme uses dark ink; dark theme uses a warm cream paper.
  buildCertificateHTML(result, opts = {}) {
    const username = opts.username || 'Anonymous';
    const dateLong = this.formatLongDate(opts.date ? new Date(opts.date) : new Date());
    const c = this.resolveThemeColors();
    const tier = getPerformanceTier(result.wpm);

    // Paper color — warm off-white; ink color — derived from theme.
    // This keeps the certificate looking like an actual paper document
    // regardless of whether the app is in dark, light, cyberpunk, or AMOLED mode.
    const isLightTheme = (document.documentElement.getAttribute('data-theme') === 'light');
    const paper = isLightTheme ? '#faf7ee' : '#f4f1e8';
    const ink  = isLightTheme ? '#2a2820' : '#1a1d20';
    const inkSoft = isLightTheme ? '#5a564a' : '#4a4740';
    const inkFaint = isLightTheme ? '#a8a39a' : '#8a857a';
    const rule = isLightTheme ? 'rgba(42,40,32,0.35)' : 'rgba(26,29,32,0.35)';

    const serial = `${this.formatDate()}-${result.wpm}-${result.accuracy}`;

    return `
<div id="certificate" style="
  width: 1240px;
  height: 1754px;
  background-color: ${paper};
  color: ${ink};
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
  position: relative;
">
  <!-- Outer hairline border -->
  <div style="position: absolute; top: 60px; left: 60px; right: 60px; bottom: 60px; border: 1px solid ${rule}; box-sizing: border-box;"></div>
  <!-- Inner hairline border (40px gap) -->
  <div style="position: absolute; top: 100px; left: 100px; right: 100px; bottom: 100px; border: 1px solid ${rule}; box-sizing: border-box;"></div>

  <!-- Top eyebrow -->
  <div style="position: absolute; top: 170px; left: 0; right: 0; text-align: center;">
    <div style="font-family: 'JetBrains Mono', monospace; font-size: 14px; letter-spacing: 0.5em; color: ${inkSoft}; text-transform: uppercase; padding-left: 0.5em;">
      TypeFlow
    </div>
  </div>

  <!-- Title -->
  <div style="position: absolute; top: 220px; left: 0; right: 0; text-align: center;">
    <div style="font-family: 'Inter', sans-serif; font-size: 84px; font-weight: 300; color: ${ink}; letter-spacing: 0.04em; line-height: 1;">
      Certificate
    </div>
    <div style="font-family: 'Inter', sans-serif; font-size: 36px; font-weight: 300; color: ${inkSoft}; letter-spacing: 0.32em; text-transform: uppercase; margin-top: 24px; padding-left: 0.32em;">
      of Achievement
    </div>
  </div>

  <!-- Divider rule -->
  <div style="position: absolute; top: 460px; left: 50%; transform: translateX(-50%); width: 240px; height: 1px; background-color: ${rule};"></div>

  <!-- "This certifies that" -->
  <div style="position: absolute; top: 540px; left: 0; right: 0; text-align: center;">
    <div style="font-family: 'Inter', sans-serif; font-size: 28px; font-weight: 300; color: ${inkSoft}; font-style: italic; letter-spacing: 0.02em;">
      This certifies that
    </div>
  </div>

  <!-- Recipient name -->
  <div style="position: absolute; top: 620px; left: 0; right: 0; text-align: center;">
    <div style="font-family: 'JetBrains Mono', monospace; font-size: 72px; font-weight: 500; color: ${ink}; letter-spacing: 0.02em; line-height: 1;">
      ${this.escape(username)}
    </div>
    <div style="width: 480px; height: 1px; background-color: ${ink}; margin: 28px auto 0 auto;"></div>
  </div>

  <!-- Body text -->
  <div style="position: absolute; top: 850px; left: 0; right: 0; text-align: center;">
    <div style="font-family: 'Inter', sans-serif; font-size: 28px; font-weight: 300; color: ${inkSoft}; line-height: 1.6; letter-spacing: 0.01em;">
      has demonstrated typing proficiency of
    </div>
  </div>

  <!-- Headline WPM -->
  <div style="position: absolute; top: 980px; left: 0; right: 0; text-align: center;">
    <div style="font-family: 'JetBrains Mono', monospace; font-size: 144px; font-weight: 500; color: ${ink}; line-height: 1; letter-spacing: -0.02em; font-variant-numeric: tabular-nums;">
      ${result.wpm}
    </div>
    <div style="font-family: 'JetBrains Mono', monospace; font-size: 18px; letter-spacing: 0.4em; color: ${inkSoft}; text-transform: uppercase; margin-top: 12px; padding-left: 0.4em;">
      words per minute
    </div>
  </div>

  <!-- Accuracy subline -->
  <div style="position: absolute; top: 1240px; left: 0; right: 0; text-align: center;">
    <div style="font-family: 'JetBrains Mono', monospace; font-size: 32px; color: ${ink}; font-variant-numeric: tabular-nums;">
      ${result.accuracy}<span style="font-size: 22px; color: ${inkSoft};">%</span> accuracy
    </div>
  </div>

  <!-- Date -->
  <div style="position: absolute; top: 1330px; left: 0; right: 0; text-align: center;">
    <div style="font-family: 'Inter', sans-serif; font-size: 24px; font-weight: 300; color: ${inkSoft}; letter-spacing: 0.02em;">
      on ${dateLong}, in a ${result.duration}-second test
    </div>
  </div>

  <!-- Footer signature block -->
  <div style="position: absolute; bottom: 220px; left: 0; right: 0; text-align: center;">
    <div style="width: 360px; height: 1px; background-color: ${rule}; margin: 0 auto 24px auto;"></div>
    <div style="font-family: 'JetBrains Mono', monospace; font-size: 13px; letter-spacing: 0.32em; color: ${ink}; text-transform: uppercase;">
      TypeFlow · ${this.escape(tier.label)} tier
    </div>
    <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.22em; color: ${inkFaint}; margin-top: 8px;">
      serial · ${serial}
    </div>
  </div>
</div>`;
  },

  // -------- Render to DOM (off-screen mount) --------
  // Mount is positioned at left: -99999px so html2canvas still sees it but it
  // doesn't affect page layout. The mount container is wiped between renders.
  //
  // Tailwind CDN's preflight injects oklch() color values into the universal
  // selector. html2canvas 1.4.1 can't parse oklch and throws. To neutralise
  // that, we inject a scoped stylesheet into the mount that resets every
  // inherited property to a safe hex/keyword default before capture.
  mountHTML(mountId, html) {
    const mount = document.getElementById(mountId);
    if (!mount) throw new Error(`Missing mount: ${mountId}`);
    // Wipe previous render entirely (style + content).
    mount.innerHTML = '';

    // The mount container must have explicit dimensions so absolutely-
    // positioned children (the share card and certificate use lots of
    // them for precise layout) have a positioning context to lay out
    // against. We read dimensions from the first descendant element of
    // the injected HTML — the share-card / certificate div sets its own
    // width/height inline.
    // Inject the render target first so we can measure it.
    const wrap = document.createElement('div');
    wrap.setAttribute('data-share-iso', 'true');
    wrap.innerHTML = html;
    mount.appendChild(wrap.firstElementChild);
    const target = mount.lastElementChild;

    // Give the mount the same dimensions as the target so absolute
    // children resolve their positions correctly.
    const w = target.offsetWidth  || parseInt(target.style.width)  || 800;
    const h = target.offsetHeight || parseInt(target.style.height) || 420;
    mount.style.width  = w + 'px';
    mount.style.height = h + 'px';

    // Reset ONLY color-affecting properties to safe hex defaults. Tailwind's
    // preflight injects oklch() values which html2canvas 1.4.1 can't parse.
    // Layout properties (width, height, position, top/left, etc.) must NOT
    // be reset — those are set inline on the share-card / certificate div.
    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-share-scope', 'true');
    styleEl.textContent = `
      #${mountId}, #${mountId} *,
      #${mountId} *::before, #${mountId} *::after {
        color: #000000 !important;
        background-color: transparent !important;
        border-color: #000000 !important;
        fill: #000000 !important;
        stroke: #000000 !important;
        text-decoration-color: #000000 !important;
        caret-color: #000000 !important;
        outline-color: #000000 !important;
        column-rule-color: #000000 !important;
        box-shadow: none !important;
        filter: none !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        background-image: none !important;
        accent-color: #000000 !important;
        scrollbar-color: auto !important;
      }
    `;
    // Prepend the scoped style so it loads before any sibling stylesheets.
    mount.insertBefore(styleEl, mount.firstChild);

    return target;
  },

  // -------- Font readiness --------
  async waitForFonts() {
    // If fonts are still loading (Google Fonts are async), html2canvas will
    // fall back to system fonts and the capture will look wrong.
    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.load('16px "JetBrains Mono"');
        await document.fonts.load('16px "Inter"');
        await document.fonts.ready;
      } catch (e) { /* ignore — fall back to whatever's loaded */ }
    }
  },

  // -------- Capture helpers --------
  async captureNode(node, scale = 2) {
    await this.waitForFonts();
    if (typeof html2canvas !== 'function') {
      throw new Error('html2canvas not loaded');
    }
    return html2canvas(node, {
      backgroundColor: null,
      scale,
      logging: false,
      useCORS: true,
      // Allow the off-screen mount to render correctly
      windowWidth: node.scrollWidth,
      windowHeight: node.scrollHeight,
      // Tailwind CDN's preflight and our own stylesheet can leak oklch() into
      // computed styles. Strip every stylesheet (except the one we inject
      // ourselves with safe hex defaults) when html2canvas clones the DOM.
      onclone: (clonedDoc) => {
        try {
          const styles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
          styles.forEach((s) => {
            // Keep our own scoped reset; remove everything else.
            if (s.hasAttribute('data-share-scope')) return;
            s.parentNode && s.parentNode.removeChild(s);
          });
        } catch (e) { /* ignore */ }
      }
    });
  },

  canvasToBlob(canvas, type = 'image/png', quality = 0.95) {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) reject(new Error('Canvas toBlob failed'));
        else resolve(blob);
      }, type, quality);
    });
  },

  triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 100);
  },

  // -------- Public API --------
  // After html2canvas returns, paint an explicit background colour onto the
  // canvas. Without this, the PNG comes out with a transparent background
  // (html2canvas picks up the bg from getComputedStyle, which can be
  // transparent for our mount), and PDF viewers then render the transparent
  // areas as black on dark themes or white on light themes. The card and
  // certificate set their own background-color inline, but a solid base
  // layer eliminates any transparent edge cases.
  paintBackground(canvas, fillColor) {
    if (!fillColor) return;
    try {
      const ctx = canvas.getContext('2d');
      // Save current transform, paint background underneath, restore.
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = fillColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    } catch (e) { /* non-fatal — fall back to whatever html2canvas produced */ }
  },

  async generateShareCard(result, opts = {}) {
    const node = this.mountHTML('share-card-mount', this.buildShareCardHTML(result, opts));
    try {
      const canvas = await this.captureNode(node, 2);
      // Use the resolved theme background so PNG export is opaque.
      const c = this.resolveThemeColors();
      this.paintBackground(canvas, c.bg);
      const blob = await this.canvasToBlob(canvas);
      return { node, canvas, blob };
    } finally {
      setTimeout(() => node.remove(), 500);
    }
  },

  async downloadShareCard(result, opts = {}) {
    const { blob } = await this.generateShareCard(result, opts);
    const filename = `typeflow-${result.wpm}wpm-${this.formatDate()}.png`;
    this.triggerDownload(blob, filename);
    return filename;
  },

  async generateCertificate(result, opts = {}) {
    const node = this.mountHTML('certificate-mount', this.buildCertificateHTML(result, opts));
    try {
      const canvas = await this.captureNode(node, 2);
      // Certificate uses a cream paper background regardless of theme.
      const isLightTheme = (document.documentElement.getAttribute('data-theme') === 'light');
      const paper = isLightTheme ? '#faf7ee' : '#f4f1e8';
      this.paintBackground(canvas, paper);
      return { node, canvas };
    } finally {
      setTimeout(() => node.remove(), 500);
    }
  },

  async downloadCertificate(result, opts = {}) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      throw new Error('jsPDF not loaded');
    }
    const { canvas } = await this.generateCertificate(result, opts);
    const { jsPDF } = window.jspdf;

    // The canvas comes back from html2canvas at scale=2 (so canvas.width
    // = cssWidth * 2). jsPDF needs the *actual* canvas dimensions, not
    // the CSS dimensions. PNG (not JPEG) so the cream background and any
    // subtle shading are preserved losslessly.
    const w = canvas.width;
    const h = canvas.height;
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [w, h],
      compress: true
    });
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, w, h);
    const filename = `typeflow-certificate-${result.wpm}wpm-${this.formatDate()}.pdf`;
    pdf.save(filename);
    return filename;
  },

  // -------- Social share intents --------
  buildShareUrl() {
    return window.location.href || 'https://typeflow.app';
  },

  shareToTwitter(text, url) {
    const u = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(u, '_blank', 'noopener,noreferrer,width=550,height=420');
  },

  shareToFacebook(url) {
    const u = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(u, '_blank', 'noopener,noreferrer,width=550,height=420');
  },

  async copyLink(text) {
    const fullText = text + '\n' + this.buildShareUrl();
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(fullText);
      return true;
    }
    // Fallback for non-secure contexts
    const ta = document.createElement('textarea');
    ta.value = fullText;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    return ok;
  }
};
