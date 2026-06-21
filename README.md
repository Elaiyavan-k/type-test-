# TypeFlow

A modern typing test web app with a minimalist blackboard aesthetic. Test your speed, track your progress, and earn a printable certificate — all in your browser, no account required.

## Features

- **Live typing test** with three difficulty levels (Easy / Medium / Hard) and five keyboard-row lessons (Home Row, Top Row, Bottom Row, Numbers, Capitals)
- **Real-time stats** — WPM, accuracy, errors, and a per-second sparkline
- **Spotify-lyrics-style word highlighting** with auto-centered scrolling
- **Themed typing experience** — Dark, Light, Cyberpunk, and AMOLED themes
- **Mechanical keyboard audio** — synthesized typewriter, Cherry MX, Topre, and Silent profiles (no audio files, all Web Audio API)
- **Daily challenge** with deterministic shared words for everyone
- **Personal dashboard** — WPM and accuracy charts (Chart.js), test history, achievements, leaderboard, and streak tracking
- **Share your score** — Twitter/X, Facebook, copy link, or download a themed PNG card
- **PDF certificate** — generate a printable A4 certificate after any completed test
- **Interactive tutorial** — learn proper touch-typing technique and how to use the app
- **Tutorial auto-shows on first visit**, never again after
- **Fully client-side** — all data stored in localStorage, no backend, no tracking

## Tech Stack

- Vanilla JavaScript (no framework)
- HTML5 + CSS3 with custom properties for theming
- Tailwind CSS via CDN
- Chart.js for analytics
- html2canvas + jsPDF for share cards and certificates
- Web Audio API for synthesized sound

## Project Structure

```
newappp/
├── index.html          # Main HTML with all pages (test, dashboard, settings)
├── styles.css          # Blackboard theme system + component styles
└── js/
    ├── words.js        # Word lists, difficulty filters, lessons, daily challenge
    ├── storage.js      # localStorage wrapper (history, leaderboard, profile, settings)
    ├── sound.js        # Web Audio synthesizer (4 keyboard profiles)
    ├── achievements.js # Achievement definitions, performance tiers, toast notifications
    ├── typing-test.js  # Core typing engine (state, keystroke handling, stats)
    ├── share.js        # Share card PNG + PDF certificate builder
    └── app.js          # UI wiring and event handlers
```

## Getting Started

### Run locally

Any static HTTP server works. From the project folder:

```bash
python -m http.server 8080
```

Then open http://localhost:8080 in your browser.

Or with Node:

```bash
npx serve .
```

### Deploy

The app is fully static — drop it on any static host. Vercel, Netlify, GitHub Pages, or a plain web server all work without configuration.

## Usage

1. Open the app and start typing in the central area. The test begins on your first keystroke.
2. Press <kbd>Tab</kbd> to restart with the same words, or click **New words** for a fresh set.
3. Pick a difficulty from the left panel (Easy / Medium / Hard) or drill a specific row with a **Lesson**.
4. After 30 seconds (or 15 / 60 / 120 if you change it), the results modal appears.
5. Click **Share** to post your score or download a themed PNG card.
6. Click **Certificate** to generate and download a printable PDF certificate.

### Keyboard shortcuts

- <kbd>Tab</kbd> — Restart current test
- <kbd>Esc</kbd> — Close tutorial

## Touch Typing Tips

The built-in tutorial covers the essentials, but the short version:

- Sit up straight, wrists floating above the keyboard
- Home row: left hand on <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> <kbd>F</kbd>, right on <kbd>J</kbd> <kbd>K</kbd> <kbd>L</kbd> <kbd>;</kbd>
- The <kbd>F</kbd> and <kbd>J</kbd> keys have small bumps — feel for them to recenter without looking
- Hit the spacebar with your **right thumb**
- Accuracy first — speed follows naturally

## Customization

All customization lives in **Settings**:

- Font size of the typing text
- Default test duration
- Sound on/off and profile selection
- Master volume and ambient typewriter hum
- Theme switcher
- Username and avatar (stored locally)

## Privacy

TypeFlow stores everything in your browser's localStorage. Nothing is sent to any server. Clear your browser data to reset the app entirely.

## Browser Support

Modern Chromium, Firefox, and Safari. The share and certificate features require `navigator.clipboard` (secure context — HTTPS or localhost).

## License

MIT — do whatever you want with it.

---

**Developed by Elaiyavan**
