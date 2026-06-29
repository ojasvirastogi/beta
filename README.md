# Jackie Jeans — Smart Fit Onboarding

Most people buy denim by guessing their size, returning what doesn't work, and guessing again. Jackie Jeans replaces that guesswork with a short, intelligent **Fit Quiz** that learns about the user and recommends the right fit with confidence. 

This repository implements the complete onboarding experience featuring two high-fidelity, mobile-first flows: **Manual Onboarding** and **AI Voice Onboarding**.

---

## 📸 Project Interface

![Jackie Jeans Smart Fit Onboarding Mockup](./smart_fit_mockup.png)

---

## 💎 Features & Capabilities

### 1. Manual Onboarding Flow (Tactile Controls)
* **Custom Tape-Measure Sliders**: Replaced basic selects with custom horizontal tape-measure sliders for **Height**, **Weight**, **Waist**, and **Hip** measurements. Ticks (major, mid, minor) and numeric indicators slide smoothly in real-time as you drag the handle.
* **Interactive Choice Grids**: Stylish tag grids with hover feedback and toggle checkmarks for brand selection (Q8) and style preferences.
* **Conditional Brand Sizes (Q9)**: Shows input boxes styled per brand only for the brands the user selected.
* **Back/Edit Navigation & Validation**: Allows users to step backwards to change answers, with built-in validation messages on incorrect ranges.

### 2. AI Voice Onboarding Flow (Real Voice Conversation)
* **Real Voice Synthesis & Recognition**: The AI stylist reads questions out loud (SpeechSynthesis) and records responses out loud (SpeechRecognition).
* **Dynamic Canvas Wave Visualizer**: An HTML5 Canvas renders a multi-layered procedural sine wave animation inside the central voice orb. The waves transition dynamically:
  * **Idle**: Renders slow, calm, breathing waves.
  * **Speaking**: Renders rolling waves synchronized with the voice.
  * **Listening**: Renders high-amplitude, gold vibrating waves to indicate recording.
* **Real-time Speech Captioning**: Includes `interimResults = true` so the user sees a real-time transcript of their speech (e.g. *"thirty-two inches"*) directly below the orb as they speak.
* **Robust Voice Parsing**:
  * Resolves conversational heights (e.g. `"five foot"`, `"five feet six"`, `"six foot"`) into valid inches.
  * Resolves measurement formats (e.g., `"around thirty inches"` -> `30"`).
  * Gracefully skips the optional weight question if the user says `"skip"`, `"pass"`, or `"no thanks"`.

### 3. Editorial Aesthetics & Dual Themes
* **Premium Typography**: Styled with Google Fonts **Outfit** (clean geometric sans-serif for numbers/controls) and **Playfair Display** (editorial serif for headers).
* **Dual Theme Toggle**: Animated transition between a default **Dark Theme** (deep raw-indigo and bronze/gold accents) and a **Light Theme** (refined warm cream and sand). Toggle is accessible via the header icon.
* **Luxury Finish**: Subtle glassmorphic layers, blur backdrops, depth shadows, and interactive micro-animations.

### 4. Leather Patch Done Card & Automated Redirection
* **Leather Patch Summary**: Displays the fit profile formatted as a classic leather patch (like those on the back of denim jeans) with stitched dashed borders and a barcode.
* **Handoff Progress Ring**: Runs a 5-second automatic redirect timer with an animated SVG countdown ring.
* **Handoff Redirection**: Encodes the final profile using base64 and safely redirects the user to the main Jackie Jeans website:
  👉 `https://jackie-jeans.vercel.app/?fitProfile=...`

---

## 🛠️ Tech Stack & Architecture

* **Frontend**: Pure HTML5, Vanilla JavaScript (Modular ES6), and custom CSS3 variables (no bulky frameworks or Tailwind dependencies).
* **Graphics**: HTML5 Canvas API (Procedural math waves).
* **AI & Speech**: Native Web Speech API (`SpeechRecognition` & `SpeechSynthesisUtterance`).
* **Server**: Node.js micro-server (`server.mjs`) for local static hosting.

---

## 🚀 Local Development

1. Ensure Node.js is installed.
2. Spin up the server:
   ```bash
   npm start
   ```
3. Open `http://localhost:5174` in your browser.

> [!NOTE]
> Web Speech Recognition works best in Google Chrome. For mobile browsers, microphone permissions require localhost or a secure HTTPS connection.

---

## 📦 Vercel Deployment configuration

To deploy this project to Vercel without Serverless Function compilation issues, `vercel.json` is configured to force static file serving for the SPA entry points and handle client-side routing cleanly:

```json
{
  "cleanUrls": true,
  "builds": [
    { "src": "index.html", "use": "@vercel/static" },
    { "src": "styles.css", "use": "@vercel/static" },
    { "src": "app.js", "use": "@vercel/static" }
  ],
  "routes": [
    { "src": "/styles.css", "dest": "/styles.css" },
    { "src": "/app.js", "dest": "/app.js" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```
