# Jackie Jeans Smart Fit Onboarding

A deployable mobile-first onboarding experience for the Jackie Jeans hackathon challenge.

## Included Features

- Manual onboarding flow with all 10 fit quiz questions.
- AI voice onboarding flow using browser speech synthesis and speech recognition.
- Voice parsing for heights, measurements, optional weight skipping, single-choice answers, multi-brand selection, and per-brand sizes.
- Conditional Q9 brand-size inputs based on selected Q8 brands.
- Validation, progress, back/edit flow, completion summary, profile persistence, and final redirect.
- Collected fit profile is saved to `localStorage` and passed to the Jackie Jeans site as a `fitProfile` query parameter.

## Run Locally

Because the app is static, any local web server works:

```bash
npm start
```

Then open `http://localhost:5173`.

Voice recognition works best in Chrome. Some browsers require HTTPS for microphone access when not on `localhost`.

## Deploy

Deploy the folder as a static site on Vercel or Netlify. No build command is required; the entry file is `index.html`.
