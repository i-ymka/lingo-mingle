Lingo Mingle — Offline PWA for Language Learning Pairs
=======================================================

A mini-application for learning vocabulary together with a partner. Works as an offline PWA: you can install it from Safari to the Home Screen and use it without internet.

Built with: React + TypeScript + Vite + Tailwind (local build). No external CDN.

Features
- Offline mode: all UI and assets are cached by the service worker.
- Local storage: data is saved in `localStorage` on the device.
- Easy installation on iPhone/Android as a PWA (Home Screen icon, fullscreen mode).

Local Development
- Install dependencies: `npm ci` (or `npm install`)
- Start dev server: `npm run dev`
- Production build: `npm run build` (files in `dist/`)

Deploy to GitHub Pages (pre-configured)
1) The repository already contains GitHub Actions: `.github/workflows/deploy.yml`.
2) In `Settings → Pages` select Source: GitHub Actions (already configured).
3) Any push to the `main` branch automatically:
   - builds the project (`npm run build`)
   - publishes the contents of `dist/` to GitHub Pages
4) The ready URL will appear in `Settings → Pages` and in the Actions output.

Install as PWA on iPhone
1) Open the site in Safari at the GitHub Pages URL.
2) Tap "Share" → "Add to Home Screen".
3) First launch should be online (to prime the cache), then it works offline.

Offline Notes
- The project includes `public/manifest.webmanifest` and `public/service-worker.js`.
- Service worker registration is in `index.tsx`.
- GitHub Pages subfolder path is handled: `vite.config.ts` with `base: './'` and relative links in `index.html`.

Icons & Splash
- Custom icons are in `public/icons` (192, 512 and apple-touch 180). You can replace them with your own PNGs using the same filenames.
- Splash screen photos are in `assets/hero`. All photos are from Pexels (free license, attribution not required but appreciated if you replace them).

FAQ
- Can I install it "as a file" on iPhone without a developer account? No. But a PWA can be added to the Home Screen and works offline, which covers most use cases.
- Why no external CDN links? So the app works completely offline.

License
- Private use. Do not add sensitive keys to the repository.
