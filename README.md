# Aethelgard-Hanba

Top-down survival roguelike demo built with Phaser, TypeScript, and Vite.

## Local Development

```bash
npm install
npm run dev
```

## Verification

```bash
npm test
npm run build
npm run test:e2e
```

For `npm run test:e2e`, start the dev server first or set `E2E_BASE_URL` to the running app.

## 2D Asset Staging

Generated and optimized 2D sample assets live in `assets/generated/`. Runtime character, enemy, and weapon PNGs are separated so weapons can be rendered independently from character models. Preview compositions are only for visual review.

## Cloudflare Pages

Use these project settings:

- Build command: `npm run build`
- Build output directory: `dist`
- Node.js version: current LTS

The app is static. No backend, Worker, database, or environment variables are required for the first release.

## Asset Credits

The current 2D art comes from CC0 sources:

- Kenney Top-down Shooter: <https://kenney.nl/assets/top-down-shooter>
- Kenney Roguelike Modern City: <https://kenney.nl/assets/roguelike-modern-city>
- OpenGameArt Top Down Shooter and Zombie: <https://opengameart.org/content/top-down-shooter-and-zombie>

Kenney assets are licensed under CC0. OpenGameArt asset licensing depends on the source page; the files currently used here were downloaded from CC0-listed pages.
