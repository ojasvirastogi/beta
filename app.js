(function () {
  const SITE_URL = "https://jackie-jeans.vercel.app/";
  const app = document.querySelector("#app");

  const heights = range(58, 74).map((inches) => ({
    value: String(inches),
    label: `${Math.floor(inches / 12)}'${inches % 12}"`
  }));
  const waistOptions = range(24, 52).map((n) => `${n}"`);
  const hipOptions = range(32, 60).map((n) => `${n}"`);
  const brands = [
    "Levi's",
    "Wrangler",
    "Lee",
    "Madewell",
    "Abercrombie",
    "American Eagle",
    "Gap",
    "Old Navy",
    "Zara",
    "H&M",
    "Uniqlo",
    "Everlane",
    "AGOLDE",
    "Good American",
    "Frame",
    "Paige",
    "7 For All Mankind",
    "Citizens of Humanity",
    "Topshop",
    "Mango"
  ];

  const questions = [
    {
      id: "height",
      title: "What is your height?",
      helper: "This helps Jackie tune the inseam and overall length.",
      type: "select",
      options: heights,
      voice: "What is your height? You can say something like five foot six."
    },
    {
      id: "weight",
      title: "What is your weight?",
      helper: "Optional. You can skip this if you prefer.",
      type: "weight",
      optional: true,
      voice: "What is your weight? This is optional, so you can also say skip."
    },
    {
      id: "waist",
      title: "Waist measurement in inches",
      helper: "Use the narrowest point of your waist.",
      type: "select",
      options: waistOptions.map((n) => ({ value: n, label: n })),
      voice: "What is your waist measurement in inches, at the narrowest point?"
    },
    {
      id: "hip",
      title: "Hip measurement in inches",
      helper: "Measure around the fullest point of your hips.",
      type: "select",
      options: hipOptions.map((n) => ({ value: n, label: n })),
      voice: "What is your hip measurement in inches, around the fullest point?"
    },
    {
      id: "waistFit",
      title: "How do you like jeans to fit at the waist?",
      helper: "Same body measurements can lead to different sizes depending on preference.",
      type: "single",
      options: ["Snug", "Slightly relaxed", "Relaxed"],
      voice: "How do you like jeans to fit at the waist: snug, slightly relaxed, or relaxed?"
    },
    {
      id: "rise",
      title: "Where should the waistband sit?",
      helper: "Rise preference helps narrow the style recommendation.",
      type: "single",
      options: ["High rise", "Mid rise", "Low rise"],
      voice: "Where should the waistband sit: high rise, mid rise, or low rise?"
    },
    {
      id: "thighFit",
      title: "How should jeans fit through the thighs?",
      helper: "This catches one of the most common fit complaints.",
      type: "single",
      options: ["Fitted", "Relaxed", "Loose"],
      voice: "How should jeans fit through the thighs: fitted, relaxed, or loose?"
    },
    {
      id: "brands",
      title: "Which denim brands have you bought before?",
      helper: "Pick every brand that applies. This calibrates against known sizing.",
      type: "multi",
      options: brands,
      voice: "Which denim brands have you bought before? You can say several, like Levi's, Madewell, and Gap."
    },
    {
      id: "brandSizes",
      title: "What size did you buy in those brands?",
      helper: "Add the size you typically bought for each selected brand.",
      type: "brandSizes",
      voice: "Now tell me what size you bought in each selected brand."
    },
    {
      id: "frustration",
      title: "Biggest fit frustration when buying jeans?",
      helper: "Jackie uses this to explain the final recommendation in your language.",
      type: "single",
      options: ["Waist gap", "Hip tightness", "Wrong length", "Thigh fit", "Rise", "Other"],
      voice: "Last one. What is your biggest fit frustration: waist gap, hip tightness, wrong length, thigh fit, rise, or other?"
    }
  ];

  const state = {
    screen: "home",
    mode: null,
    step: 0,
    answers: loadProfile(),
    error: "",
    voice: {
      active: false,
      listening: false,
      speaking: false,
      messages: [],
      status: "",
      currentBrandIndex: 0,
      recognition: null
    }
  };

  let canvasAnimationId = null;
  let wavePhase = 0;
  let countdownTimer = null;
  let countdownValue = 5;

  function range(start, end) {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  function applyTheme() {
    const theme = state.answers.theme || "dark";
    if (theme === "light") {
      document.documentElement.classList.remove("dark-theme");
      document.documentElement.classList.add("light-theme");
    } else {
      document.documentElement.classList.remove("light-theme");
      document.documentElement.classList.add("dark-theme");
    }
  }

  function shell(inner) {
    const isDark = (state.answers.theme || "dark") === "dark";
    const themeIcon = isDark
      ? `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"/></svg>`
      : `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"/></svg>`;

    return `
      <section class="shell">
        <div class="phone">
          <div class="topbar">
            <button class="brand" data-action="home" aria-label="Go to start">
              <span class="mark">JJ</span>
              <span class="brand-copy">
                <span class="brand-title">Jackie Jeans</span>
                <span class="brand-subtitle">Smart Fit Onboarding</span>
              </span>
            </button>
            <div style="display: flex; gap: 8px;">
              <button class="ghost theme-toggle-btn" data-action="toggle-theme" aria-label="Toggle light and dark mode">
                ${themeIcon}
              </button>
              ${state.screen === "home" ? "" : '<button class="ghost" data-action="switch">Switch</button>'}
            </div>
          </div>
          ${inner}
        </div>
      </section>
    `;
  }

  function render() {
    applyTheme();
    clearHandoffCountdown();
    
    if (state.screen === "home") {
      renderHome();
      return;
    }
    if (state.screen === "done") {
      renderDone();
      return;
    }
    if (state.mode === "manual") {
      renderManual();
    } else {
      renderVoice();
    }
    
    // Auto-update slider positions
    const activeSlider = document.querySelector(".tape-slider");
    if (activeSlider) {
      const sliderId = activeSlider.dataset.fieldSlider;
      const val = Number(activeSlider.value);
      const step = sliderId === "weight" ? 5 : 1;
      let min = 58, max = 74;
      if (sliderId === "weight") { min = 70; max = 350; }
      else if (sliderId === "waist") { min = 24; max = 52; }
      else if (sliderId === "hip") { min = 32; max = 60; }
      
      setTimeout(() => {
        updateTapeTicks(sliderId, min, max, val, step);
      }, 20);
    }

    // Auto-start voice canvas if on voice screen
    if (state.mode === "voice") {
      setTimeout(startCanvasAnimation, 20);
    } else {
      if (canvasAnimationId) {
        cancelAnimationFrame(canvasAnimationId);
        canvasAnimationId = null;
      }
    }
  }

  function renderHome() {
    app.innerHTML = shell(`
      <div class="content hero">
        <span class="eyebrow">Fit quiz</span>
        <h1>Jeans that start with you.</h1>
        <p class="lead">Complete Jackie’s fit profile by hand or with a friendly voice stylist. Both paths collect every detail needed for a confident denim recommendation.</p>
        <div class="denim-panel" aria-hidden="true">
          <div class="panel-stat">10-question fit profile</div>
          <div class="panel-fit">Length, waist, hips, rise, brands, sizes.</div>
        </div>
        <div class="choice-grid">
          <button class="flow-choice" data-action="start-manual">
            <strong>Manual onboarding</strong>
            <span>A guided mobile quiz with tactile tape measures, multi-select, and back edits.</span>
          </button>
          <button class="flow-choice" data-action="start-voice">
            <strong>AI voice onboarding</strong>
            <span>Speak with Jackie’s stylist. The app asks, listens, confirms, and fills your fit profile.</span>
          </button>
        </div>
      </div>
    `);
  }

  function progressMarkup() {
    const percent = Math.round((state.step / questions.length) * 100);
    return `
      <div class="progress">
        <div class="progress-row">
          <span>${state.mode === "manual" ? "Manual" : "Voice"} quiz</span>
          <span>${Math.min(state.step + 1, questions.length)} / ${questions.length}</span>
        </div>
        <div class="track"><div class="bar" style="--progress:${percent}%"></div></div>
      </div>
    `;
  }

  function renderManual() {
    const q = questions[state.step];
    app.innerHTML = shell(`
      ${progressMarkup()}
      <div class="content question">
        <span class="eyebrow">${q.optional ? "Optional" : "Fit detail"}</span>
        <h2>${q.title}</h2>
        <p class="helper">${q.helper}</p>
        ${manualInput(q)}
        <div class="error">${state.error}</div>
        ${q.optional ? '<div class="skip-row"><button class="text-link" data-action="skip">Skip this question</button></div>' : ""}
        <div class="actions">
          <button class="secondary" data-action="back">${state.step === 0 ? "Start" : "Back"}</button>
          <button class="primary" data-action="next">${state.step === questions.length - 1 ? "Finish" : "Continue"}</button>
        </div>
      </div>
    `);
  }

  function renderTapeMeasure(fieldId, min, max, value, unit, isHeight) {
    const ticksHtml = [];
    const step = fieldId === "weight" ? 5 : 1;
    
    for (let i = min; i <= max; i += step) {
      let type = "minor";
      let label = "";
      if (isHeight) {
        if (i % 12 === 0) {
          type = "major";
          label = `${i / 12}'`;
        } else if (i % 6 === 0) {
          type = "mid";
        }
      } else if (fieldId === "weight") {
        if (i % 50 === 0) {
          type = "major";
          label = `${i}`;
        } else if (i % 10 === 0) {
          type = "mid";
          label = `${i}`;
        }
      } else {
        if (i % 5 === 0) {
          type = "major";
          label = `${i}`;
        } else if (i % 2 === 0) {
          type = "mid";
        }
      }
      
      ticksHtml.push(`
        <div class="tick ${type}">
          ${label ? `<span class="tick-label">${label}</span>` : ""}
        </div>
      `);
    }

    let displayVal = "";
    if (isHeight) {
      displayVal = formatHeight(value) || "5'6\"";
    } else {
      displayVal = value ? `${value}${unit}` : `Select`;
    }

    return `
      <div class="tape-measure-wrapper" data-field-id="${fieldId}">
        <div class="tape-display-val" id="val-${fieldId}">
          ${displayVal}
        </div>
        <div class="tape-measure" id="tape-${fieldId}">
          <div class="tape-ticks" id="ticks-${fieldId}">
            ${ticksHtml.join("")}
          </div>
        </div>
        <input type="range" class="tape-slider" data-field-slider="${fieldId}" min="${min}" max="${max}" step="${step}" value="${value}" />
      </div>
    `;
  }

  function updateTapeTicks(fieldId, min, max, value, step) {
    const ticksEl = document.getElementById(`ticks-${fieldId}`);
    const tapeEl = document.getElementById(`tape-${fieldId}`);
    if (!ticksEl || !tapeEl) return;
    const tapeWidth = tapeEl.offsetWidth || 380;
    const valIndex = (value - min) / step;
    const tickWidth = 15; // 15px per tick width in CSS
    const translation = (tapeWidth / 2) - (valIndex * tickWidth);
    ticksEl.style.transform = `translateX(${translation}px)`;
  }

  function manualInput(q) {
    const value = state.answers[q.id];
    if (q.id === "height") {
      return renderTapeMeasure("height", 58, 74, value ? parseInt(value) : 66, "", true);
    }
    if (q.id === "weight") {
      return renderTapeMeasure("weight", 70, 350, value ? parseInt(value) : 150, " lbs", false);
    }
    if (q.id === "waist") {
      return renderTapeMeasure("waist", 24, 52, value ? parseInt(value) : 32, "\"", false);
    }
    if (q.id === "hip") {
      return renderTapeMeasure("hip", 32, 60, value ? parseInt(value) : 40, "\"", false);
    }
    if (q.type === "single") {
      return `<div class="pill-grid">${q.options.map((o) => pill(o, value === o, q.id)).join("")}</div>`;
    }
    if (q.type === "multi") {
      const selected = Array.isArray(value) ? value : [];
      return `<div class="pill-grid two">${q.options.map((o) => pill(o, selected.includes(o), q.id, true)).join("")}</div>`;
    }
    if (q.type === "brandSizes") {
      const selected = state.answers.brands || [];
      if (!selected.length) return '<p class="unsupported">No brands selected. Go back to choose brands, or continue to skip brand sizing.</p>';
      return `
        <div class="field-stack">
          ${selected.map((brand) => `
            <div class="brand-size">
              <label for="size-${slug(brand)}">${brand}</label>
              <input id="size-${slug(brand)}" class="input" data-brand-size="${brand}" placeholder="e.g. 28, 6, W29" value="${(state.answers.brandSizes || {})[brand] || ""}" />
            </div>
          `).join("")}
        </div>
      `;
    }
    return "";
  }

  function pill(label, selected, field, multi) {
    const isChecked = selected ? `<span style="font-size:12px;">✓</span>` : "";
    return `<button class="pill ${selected ? "selected" : ""}" data-${multi ? "toggle" : "choose"}="${field}" data-value="${label}">${isChecked} ${label}</button>`;
  }

  function renderDone() {
    const recommendation = recommendationText();
    const leatherPatch = renderLeatherPatch();
    
    app.innerHTML = shell(`
      <div class="content question">
        <span class="eyebrow">Profile complete</span>
        <h2>Your fit profile is ready.</h2>
        <p class="helper">${recommendation}</p>
        <div class="summary">${leatherPatch}</div>
        
        <div class="redirect-countdown" id="redirect-countdown">
          <svg class="countdown-svg">
            <circle class="countdown-circle" cx="12" cy="12" r="10"></circle>
            <circle class="countdown-progress" cx="12" cy="12" r="10"></circle>
          </svg>
          <span class="countdown-text">Handoff in 5s...</span>
        </div>

        <div class="actions">
          <button class="secondary" data-action="edit">Edit profile</button>
          <button class="primary" data-action="handoff">Continue now</button>
        </div>
      </div>
    `);

    // Auto-start handoff countdown
    setTimeout(startHandoffCountdown, 100);
  }

  function renderLeatherPatch() {
    const h = formatHeight(state.answers.height) || "Not selected";
    const w = state.answers.weight ? `${state.answers.weight} lbs` : "Skipped";
    const waist = state.answers.waist || "Not selected";
    const hip = state.answers.hip || "Not selected";
    const fit = state.answers.waistFit || "Not selected";
    const rise = state.answers.rise || "Not selected";
    const thigh = state.answers.thighFit || "Not selected";
    const frustration = state.answers.frustration || "Not selected";
    const brandsList = (state.answers.brands || []).join(", ") || "None";
    const sizesList = formatBrandSizes();

    return `
      <div class="leather-patch-card">
        <div class="patch-header">
          <div class="patch-title">Jackie Jeans Fit Profile</div>
        </div>
        <div class="patch-grid">
          <div class="patch-item">
            <span class="patch-item-label">Height</span>
            <span class="patch-item-val">${h}</span>
          </div>
          <div class="patch-item">
            <span class="patch-item-label">Weight</span>
            <span class="patch-item-val">${w}</span>
          </div>
          <div class="patch-item">
            <span class="patch-item-label">Waist Measure</span>
            <span class="patch-item-val">${waist}</span>
          </div>
          <div class="patch-item">
            <span class="patch-item-label">Hip Measure</span>
            <span class="patch-item-val">${hip}</span>
          </div>
          <div class="patch-item">
            <span class="patch-item-label">Waist Fit</span>
            <span class="patch-item-val">${fit}</span>
          </div>
          <div class="patch-item">
            <span class="patch-item-label">Style Rise</span>
            <span class="patch-item-val">${rise}</span>
          </div>
          <div class="patch-item">
            <span class="patch-item-label">Thigh Fit</span>
            <span class="patch-item-val">${thigh}</span>
          </div>
          <div class="patch-item">
            <span class="patch-item-label">Fit Fix</span>
            <span class="patch-item-val">${frustration}</span>
          </div>
          <div class="patch-item full">
            <span class="patch-item-label">Reference Brands</span>
            <span class="patch-item-val">${brandsList}</span>
          </div>
          <div class="patch-item full">
            <span class="patch-item-label">Typical Sizes</span>
            <span class="patch-item-val">${sizesList}</span>
          </div>
        </div>
        <div class="patch-bar-code"></div>
      </div>
    `;
  }

  function startHandoffCountdown() {
    clearHandoffCountdown();
    countdownValue = 5;
    const countdownEl = document.getElementById("redirect-countdown");
    if (!countdownEl) return;

    const circle = countdownEl.querySelector(".countdown-progress");
    if (circle) circle.style.strokeDashoffset = "0";

    countdownTimer = setInterval(() => {
      countdownValue -= 1;
      const textEl = countdownEl.querySelector(".countdown-text");
      if (textEl) {
        textEl.textContent = `Handoff in ${countdownValue}s...`;
      }
      if (circle) {
        const offset = 63 - (countdownValue / 5) * 63;
        circle.style.strokeDashoffset = offset;
      }
      if (countdownValue <= 0) {
        clearHandoffCountdown();
        handoff();
      }
    }, 1000);
  }

  function clearHandoffCountdown() {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }

  function startCanvasAnimation() {
    const canvas = document.getElementById("voice-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    if (canvasAnimationId) cancelAnimationFrame(canvasAnimationId);
    
    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;
      
      let numWaves = 3;
      let amplitude = 12;
      let speed = 0.05;
      
      if (state.voice.listening) {
        numWaves = 4;
        amplitude = 24;
        speed = 0.16;
      } else if (state.voice.speaking) {
        numWaves = 3;
        amplitude = 18;
        speed = 0.09;
      } else {
        numWaves = 2;
        amplitude = 6;
        speed = 0.02;
      }
      
      wavePhase += speed;
      
      for (let i = 0; i < numWaves; i++) {
        ctx.beginPath();
        ctx.lineWidth = i === 0 ? 3 : 1.5;
        
        const offsetPhase = wavePhase + i * Math.PI / 4;
        const waveFreq = 0.015 + i * 0.005;
        
        const theme = state.answers.theme || "dark";
        if (state.voice.listening) {
          ctx.strokeStyle = i === 0 ? "rgba(212, 175, 55, 0.9)" : `rgba(58, 96, 171, ${0.4 - i * 0.1})`;
        } else {
          ctx.strokeStyle = `rgba(${theme === "light" ? "35, 63, 120" : "142, 155, 179"}, ${0.6 - i * 0.15})`;
        }
        
        for (let x = 0; x < width; x++) {
          const envelope = Math.sin((x / width) * Math.PI);
          const y = centerY + Math.sin(x * waveFreq + offsetPhase) * amplitude * envelope;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
      canvasAnimationId = requestAnimationFrame(draw);
    }
    
    draw();
  }

  function renderVoice() {
    const supported = supportsVoice();
    const q = questions[state.step];
    const orbClass = state.voice.listening ? "listening" : state.voice.speaking ? "speaking" : "";
    const avatar = state.voice.listening ? "🎙️" : state.voice.speaking ? "🔊" : "👖";
    
    app.innerHTML = shell(`
      ${progressMarkup()}
      <div class="content question">
        <span class="eyebrow">Voice stylist</span>
        <h2>${q.title}</h2>
        <p class="helper">${voiceHelper(q)}</p>
        ${supported ? "" : '<div class="unsupported">This browser does not expose speech recognition. Chrome on Android or desktop works best. Manual onboarding is still fully available.</div>'}
        
        <div class="voice-orb ${orbClass}">
          <canvas id="voice-canvas" width="220" height="220"></canvas>
          <span class="orb-avatar">${avatar}</span>
        </div>
        
        <div class="interim-caption" id="interim-caption"></div>
        
        <div class="transcript">
          ${state.voice.messages.map((m) => `<div class="bubble ${m.role}">${m.text}</div>`).join("")}
        </div>
        <div class="status">${state.voice.status}</div>
        <div class="voice-controls">
          <button class="primary" data-action="${state.voice.active ? "listen" : "voice-start"}" ${supported ? "" : "disabled"}>
            ${state.voice.active ? "Answer by voice" : "Start voice quiz"}
          </button>
          <button class="secondary" data-action="voice-repeat" ${supported ? "" : "disabled"}>Repeat question</button>
          ${q.optional ? '<button class="secondary" data-action="voice-skip">Skip optional question</button>' : ""}
        </div>
        <div class="actions">
          <button class="secondary" data-action="voice-back">${state.step === 0 ? "Start" : "Back"}</button>
          <button class="primary" data-action="manual-from-voice">Use manual input</button>
        </div>
      </div>
    `);
  }

  function voiceHelper(q) {
    if (q.type === "multi") return "Say one or more brands. For example: Levi's, Madewell, and Gap.";
    if (q.type === "brandSizes") {
      const brand = currentVoiceBrand();
      return brand ? `Tell Jackie the size you bought in ${brand}.` : q.helper;
    }
    return q.helper;
  }

  function recommendationText() {
    const rise = (state.answers.rise || "mid rise").toLowerCase();
    const thigh = (state.answers.thighFit || "relaxed").toLowerCase();
    const waist = (state.answers.waistFit || "slightly relaxed").toLowerCase();
    return `Jackie will prioritize a ${rise}, ${waist} waist feel with a ${thigh} thigh, then calibrate sizing from your measurements and brand history.`;
  }

  function formatBrandSizes() {
    const sizes = state.answers.brandSizes || {};
    const pairs = Object.entries(sizes).filter(([, value]) => value);
    return pairs.length ? pairs.map(([brand, size]) => `${brand}: ${size}`).join(", ") : "Not provided";
  }

  function bindEvents() {
    app.addEventListener("click", (event) => {
      const target = event.target.closest("button");
      if (!target) return;
      const action = target.dataset.action;
      const choose = target.dataset.choose;
      const toggle = target.dataset.toggle;
      if (choose) {
        state.answers[choose] = target.dataset.value;
        state.error = "";
        saveProfile();
        render();
        return;
      }
      if (toggle) {
        const list = new Set(state.answers[toggle] || []);
        list.has(target.dataset.value) ? list.delete(target.dataset.value) : list.add(target.dataset.value);
        state.answers[toggle] = Array.from(list);
        state.answers.brandSizes = pruneBrandSizes(state.answers.brandSizes || {}, state.answers.brands);
        state.error = "";
        saveProfile();
        render();
        return;
      }
      handleAction(action);
    });

    app.addEventListener("input", (event) => {
      const field = event.target.dataset.field;
      const brand = event.target.dataset.brandSize;
      const slider = event.target.dataset.fieldSlider;

      if (slider) {
        // height is saved as raw inches (e.g. 66)
        // weight is saved as raw lbs (e.g. 150)
        // waist/hip are saved with quotes (e.g. 32")
        if (slider === "height" || slider === "weight") {
          state.answers[slider] = String(event.target.value);
        } else {
          state.answers[slider] = `${event.target.value}"`;
        }

        const valEl = document.getElementById(`val-${slider}`);
        if (valEl) {
          if (slider === "height") {
            valEl.innerHTML = formatHeight(event.target.value);
          } else if (slider === "weight") {
            valEl.innerHTML = `${event.target.value} lbs`;
          } else {
            valEl.innerHTML = `${event.target.value}"`;
          }
        }

        const step = slider === "weight" ? 5 : 1;
        let min = 58, max = 74;
        if (slider === "weight") { min = 70; max = 350; }
        else if (slider === "waist") { min = 24; max = 52; }
        else if (slider === "hip") { min = 32; max = 60; }
        
        updateTapeTicks(slider, min, max, Number(event.target.value), step);
        state.error = "";
        saveProfile();
      }

      if (field) {
        state.answers[field] = event.target.value;
        state.error = "";
        saveProfile();
      }
      if (brand) {
        state.answers.brandSizes = state.answers.brandSizes || {};
        state.answers.brandSizes[brand] = event.target.value;
        state.error = "";
        saveProfile();
      }
    });
  }

  function handleAction(action) {
    if (!action) return;
    if (action === "home") {
      resetVoice();
      state.screen = "home";
      render();
    }
    if (action === "switch") {
      resetVoice();
      state.screen = "home";
      render();
    }
    if (action === "toggle-theme") {
      state.answers.theme = (state.answers.theme || "dark") === "dark" ? "light" : "dark";
      saveProfile();
      render();
    }
    if (action === "start-manual") startManual();
    if (action === "start-voice") startVoice();
    if (action === "next") nextManual();
    if (action === "back") backManual();
    if (action === "skip") {
      state.answers.weight = "";
      state.error = "";
      nextStep();
    }
    if (action === "edit") {
      clearHandoffCountdown();
      startManual();
    }
    if (action === "handoff") handoff();
    if (action === "voice-start") activateVoice();
    if (action === "listen") listen();
    if (action === "voice-repeat") askCurrentQuestion();
    if (action === "voice-skip") handleVoiceResult("skip");
    if (action === "voice-back") voiceBack();
    if (action === "manual-from-voice") {
      resetVoice();
      state.mode = "manual";
      state.screen = "quiz";
      render();
    }
  }

  function startManual() {
    resetVoice();
    state.screen = "quiz";
    state.mode = "manual";
    state.step = firstIncompleteStep();
    // Default sliders to middle value if they don't exist yet
    if (!state.answers.height) state.answers.height = "66";
    if (!state.answers.waist) state.answers.waist = "32\"";
    if (!state.answers.hip) state.answers.hip = "40\"";
    
    state.error = "";
    render();
  }

  function startVoice() {
    state.screen = "quiz";
    state.mode = "voice";
    state.step = firstIncompleteStep();
    state.voice.active = false;
    state.voice.messages = [];
    state.voice.currentBrandIndex = 0;
    state.voice.status = "";
    render();
  }

  function nextManual() {
    const q = questions[state.step];
    const validationError = validateQuestion(q);
    if (validationError) {
      state.error = validationError;
      render();
      return;
    }
    nextStep();
  }

  function backManual() {
    state.error = "";
    if (state.step === 0) {
      state.screen = "home";
    } else {
      state.step -= 1;
    }
    render();
  }

  function nextStep() {
    state.error = "";
    saveProfile();
    if (state.step >= questions.length - 1) {
      finish();
      return;
    }
    state.step += 1;
    if (state.mode === "voice") {
      state.voice.currentBrandIndex = 0;
      render();
      askCurrentQuestion();
      return;
    }
    render();
  }

  function finish() {
    saveProfile();
    resetVoice();
    state.screen = "done";
    render();
  }

  function isAnswered(q) {
    if (q.optional) return true;
    if (q.type === "multi") return Array.isArray(state.answers[q.id]) && state.answers[q.id].length > 0;
    if (q.type === "brandSizes") {
      const selected = state.answers.brands || [];
      if (!selected.length) return true;
      return selected.every((brand) => state.answers.brandSizes && state.answers.brandSizes[brand]);
    }
    return Boolean(state.answers[q.id]);
  }

  function validateQuestion(q) {
    if (q.id === "weight") {
      const value = state.answers.weight;
      if (!value) return "";
      const pounds = Number(value);
      return pounds >= 70 && pounds <= 350 ? "" : "Enter a weight from 70 to 350 lb, or skip.";
    }
    if (isAnswered(q)) return "";
    if (q.type === "brandSizes") return "Add a size for each selected brand.";
    if (q.type === "multi") return "Choose at least one brand to continue.";
    return "Choose an answer to continue.";
  }

  function activateVoice() {
    state.voice.active = true;
    state.voice.messages = [];
    state.voice.status = "Jackie will ask each question, then listen for your answer.";
    render();
    askCurrentQuestion();
  }

  function askCurrentQuestion() {
    if (!supportsVoice()) return;
    const q = questions[state.step];
    let text = q.voice;
    if (q.type === "brandSizes") {
      const brand = currentVoiceBrand();
      if (!brand) {
        nextStep();
        return;
      }
      text = `What size did you buy in ${brand}?`;
    }
    say(text, true);
  }

  function say(text, shouldListenAfter) {
    stopListening();
    state.voice.messages.push({ role: "ai", text });
    state.voice.speaking = true;
    state.voice.listening = false;
    state.voice.status = "Speaking";
    render();
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.96;
    utterance.pitch = 1.02;
    utterance.onend = () => {
      state.voice.speaking = false;
      state.voice.status = shouldListenAfter ? "Ready for your answer" : "";
      render();
      if (shouldListenAfter) listen();
    };
    window.speechSynthesis.speak(utterance);
  }

  function listen() {
    if (!supportsVoice()) return;
    stopListening();
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    state.voice.recognition = recognition;
    state.voice.listening = true;
    state.voice.status = "Listening";
    render();

    let finalTranscript = "";
    recognition.onresult = (event) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const captionEl = document.getElementById("interim-caption");
      if (captionEl && interimTranscript) {
        captionEl.textContent = `"${interimTranscript}"`;
      }

      if (finalTranscript) {
        state.voice.messages.push({ role: "user", text: finalTranscript });
        state.voice.listening = false;
        render();
        handleVoiceResult(finalTranscript);
      }
    };

    recognition.onerror = (e) => {
      // Speech recognition might fail if silent, we re-prompt if active
      if (e.error !== "no-speech") {
        state.voice.listening = false;
        render();
        say("I missed that. Could you say it one more time?", true);
      } else {
        state.voice.listening = false;
        state.voice.status = "No speech detected. Say again.";
        render();
      }
    };

    recognition.onend = () => {
      state.voice.listening = false;
      render();
    };
    recognition.start();
  }

  function handleVoiceResult(raw) {
    const q = questions[state.step];
    const text = normalize(raw);
    if (q.optional && isSkip(text)) {
      state.answers[q.id] = "";
      saveProfile();
      say("No problem, we will skip that.", false);
      setTimeout(nextStep, 900);
      return;
    }

    let parsed = null;
    if (q.id === "height") parsed = parseHeight(text);
    if (q.id === "weight") parsed = parseNumber(text, 70, 350);
    if (q.id === "waist") parsed = parseMeasurement(text, 24, 52);
    if (q.id === "hip") parsed = parseMeasurement(text, 32, 60);
    if (q.type === "single") parsed = matchOption(text, q.options);
    if (q.type === "multi") parsed = matchBrands(text);
    if (q.type === "brandSizes") parsed = parseBrandSize(text);

    if (!parsed || (Array.isArray(parsed) && !parsed.length)) {
      say(retryPrompt(q), true);
      return;
    }

    if (q.type === "multi") {
      state.answers.brands = parsed;
      state.answers.brandSizes = pruneBrandSizes(state.answers.brandSizes || {}, parsed);
      saveProfile();
      say(`Got it: ${parsed.join(", ")}.`, false);
      setTimeout(nextStep, 900);
      return;
    }

    if (q.type === "brandSizes") {
      const brand = currentVoiceBrand();
      state.answers.brandSizes = state.answers.brandSizes || {};
      state.answers.brandSizes[brand] = parsed;
      saveProfile();
      state.voice.currentBrandIndex += 1;
      const nextBrand = currentVoiceBrand();
      if (nextBrand) {
        say(`Got it, ${brand} size ${parsed}. What size did you buy in ${nextBrand}?`, true);
      } else {
        say("Perfect, I have your brand sizes.", false);
        setTimeout(nextStep, 900);
      }
      return;
    }

    state.answers[q.id] = parsed;
    saveProfile();
    say(confirmation(q, parsed), false);
    setTimeout(nextStep, 900);
  }

  function retryPrompt(q) {
    if (q.type === "multi") return "I did not catch a matching brand. Try saying one or more brand names from the list, like Levi's or Gap.";
    if (q.type === "single") return `I want to make sure I heard you. Please choose: ${q.options.join(", ")}.`;
    if (q.type === "brandSizes") return "I missed the size. You can say something like twenty eight, size six, or W thirty.";
    return "I missed that. Could you answer with a number in the requested range?";
  }

  function confirmation(q, value) {
    if (q.id === "height") return `Perfect, height ${formatHeight(value)}.`;
    if (q.id === "weight") return `Got it, ${value} pounds.`;
    if (q.id === "waist" || q.id === "hip") return `Got it, ${value}.`;
    return `Great, ${value}.`;
  }

  function voiceBack() {
    resetVoice();
    if (state.step === 0) {
      state.screen = "home";
    } else {
      state.step -= 1;
      state.voice.active = true;
    }
    render();
  }

  function currentVoiceBrand() {
    const selected = state.answers.brands || [];
    return selected[state.voice.currentBrandIndex];
  }

  function resetVoice() {
    stopListening();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    state.voice.active = false;
    state.voice.listening = false;
    state.voice.speaking = false;
    state.voice.status = "";
    if (canvasAnimationId) {
      cancelAnimationFrame(canvasAnimationId);
      canvasAnimationId = null;
    }
  }

  function stopListening() {
    if (state.voice.recognition) {
      try {
        state.voice.recognition.stop();
      } catch (error) {
        // SpeechRecognition throws if it has already stopped.
      }
    }
    state.voice.recognition = null;
  }

  function supportsVoice() {
    return Boolean((window.SpeechRecognition || window.webkitSpeechRecognition) && window.speechSynthesis);
  }

  function parseHeight(text) {
    const numbers = numbersFromText(text);
    let feet = null;
    let inches = null;
    const compact = text.match(/\b([4-6])\s*[' ]\s*(\d{1,2})\b/);
    if (compact) {
      feet = Number(compact[1]);
      inches = Number(compact[2]);
    } else if (numbers.length >= 2) {
      feet = numbers[0];
      inches = numbers[1];
    } else if (numbers.length === 1) {
      // Handle conversational height like "five foot" or "six feet" or "5 feet"
      if (text.includes("foot") || text.includes("feet") || text.includes("ft") || text.includes("height")) {
        feet = numbers[0];
        inches = 0;
      } else if (numbers[0] >= 58 && numbers[0] <= 74) {
        return String(numbers[0]);
      }
    }
    if (feet !== null && inches !== null) {
      const total = feet * 12 + inches;
      if (total >= 58 && total <= 74) return String(total);
    }
    return null;
  }

  function parseMeasurement(text, min, max) {
    const num = parseNumber(text, min, max);
    return num ? `${num}"` : null;
  }

  function parseNumber(text, min, max) {
    const numbers = numbersFromText(text);
    const found = numbers.find((n) => n >= min && n <= max);
    return found ? String(found) : null;
  }

  function parseBrandSize(text) {
    const match = text.match(/\b(w\s*)?(\d{1,2})\b/i);
    if (match) return match[2];
    const numbers = numbersFromText(text);
    if (numbers.length) return String(numbers[0]);
    return text.replace(/^size\s+/, "").trim().slice(0, 12) || null;
  }

  function numbersFromText(text) {
    const cleaned = text
      .replace(/twenty one/g, "21")
      .replace(/twenty two/g, "22")
      .replace(/twenty three/g, "23")
      .replace(/twenty four/g, "24")
      .replace(/twenty five/g, "25")
      .replace(/twenty six/g, "26")
      .replace(/twenty seven/g, "27")
      .replace(/twenty eight/g, "28")
      .replace(/twenty nine/g, "29")
      .replace(/thirty one/g, "31")
      .replace(/thirty two/g, "32")
      .replace(/thirty three/g, "33")
      .replace(/thirty four/g, "34")
      .replace(/thirty five/g, "35")
      .replace(/thirty six/g, "36")
      .replace(/thirty seven/g, "37")
      .replace(/thirty eight/g, "38")
      .replace(/thirty nine/g, "39")
      .replace(/forty one/g, "41")
      .replace(/forty two/g, "42")
      .replace(/forty three/g, "43")
      .replace(/forty four/g, "44")
      .replace(/forty five/g, "45")
      .replace(/forty six/g, "46")
      .replace(/forty seven/g, "47")
      .replace(/forty eight/g, "48")
      .replace(/forty nine/g, "49")
      .replace(/fifty one/g, "51")
      .replace(/fifty two/g, "52")
      .replace(/fifty three/g, "53")
      .replace(/fifty four/g, "54")
      .replace(/fifty five/g, "55")
      .replace(/fifty six/g, "56")
      .replace(/fifty seven/g, "57")
      .replace(/fifty eight/g, "58")
      .replace(/fifty nine/g, "59")
      .replace(/sixty/g, "60")
      .replace(/fifty/g, "50")
      .replace(/forty/g, "40")
      .replace(/thirty/g, "30")
      .replace(/twenty/g, "20")
      .replace(/nineteen/g, "19")
      .replace(/eighteen/g, "18")
      .replace(/seventeen/g, "17")
      .replace(/sixteen/g, "16")
      .replace(/fifteen/g, "15")
      .replace(/fourteen/g, "14")
      .replace(/thirteen/g, "13")
      .replace(/twelve/g, "12")
      .replace(/eleven/g, "11")
      .replace(/ten/g, "10")
      .replace(/nine/g, "9")
      .replace(/eight/g, "8")
      .replace(/seven/g, "7")
      .replace(/six/g, "6")
      .replace(/five/g, "5")
      .replace(/four/g, "4")
      .replace(/three/g, "3")
      .replace(/two/g, "2")
      .replace(/one/g, "1");
    return (cleaned.match(/\d+/g) || []).map(Number);
  }

  function matchOption(text, options) {
    const normalizedOptions = options.map((option) => ({ option, key: normalize(option) }));
    const direct = normalizedOptions.find(({ key }) => text.includes(key));
    if (direct) return direct.option;
    if (text.includes("little relaxed") || text.includes("slightly")) return "Slightly relaxed";
    if (text.includes("high")) return options.find((o) => normalize(o).includes("high")) || null;
    if (text.includes("mid") || text.includes("middle")) return options.find((o) => normalize(o).includes("mid")) || null;
    if (text.includes("low")) return options.find((o) => normalize(o).includes("low")) || null;
    if (text.includes("gap")) return "Waist gap";
    if (text.includes("hip")) return "Hip tightness";
    if (text.includes("length") || text.includes("long") || text.includes("short")) return "Wrong length";
    if (text.includes("thigh")) return "Thigh fit";
    if (text.includes("other")) return "Other";
    return null;
  }

  function matchBrands(text) {
    const aliases = {
      "levis": "Levi's",
      "levi": "Levi's",
      "h and m": "H&M",
      "hm": "H&M",
      "seven for all mankind": "7 For All Mankind",
      "citizens": "Citizens of Humanity"
    };
    const found = new Set();
    brands.forEach((brand) => {
      const key = normalize(brand).replace(/\bfor all mankind\b/, "for all mankind");
      if (text.includes(key)) found.add(brand);
    });
    Object.entries(aliases).forEach(([alias, brand]) => {
      if (text.includes(alias)) found.add(brand);
    });
    return Array.from(found);
  }

  function isSkip(text) {
    return ["skip", "pass", "rather not", "no thanks", "prefer not"].some((word) => text.includes(word));
  }

  function normalize(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9\s']/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function formatHeight(value) {
    if (!value) return "";
    const inches = Number(value);
    return `${Math.floor(inches / 12)}'${inches % 12}"`;
  }

  function pruneBrandSizes(sizes, selected) {
    return Object.fromEntries(Object.entries(sizes || {}).filter(([brand]) => selected.includes(brand)));
  }

  function slug(value) {
    return normalize(value).replace(/\s+/g, "-");
  }

  function firstIncompleteStep() {
    const index = questions.findIndex((q) => !isAnswered(q));
    return index === -1 ? 0 : index;
  }

  function saveProfile() {
    localStorage.setItem("jackieFitProfile", JSON.stringify(state.answers));
  }

  function loadProfile() {
    try {
      const profile = JSON.parse(localStorage.getItem("jackieFitProfile")) || {};
      if (!profile.theme) profile.theme = "dark";
      return profile;
    } catch (error) {
      return { theme: "dark" };
    }
  }

  function handoff() {
    saveProfile();
    clearHandoffCountdown();
    const profile = btoa(unescape(encodeURIComponent(JSON.stringify(state.answers))));
    window.location.href = `${SITE_URL}?fitProfile=${encodeURIComponent(profile)}`;
  }

  bindEvents();
  render();
})();
