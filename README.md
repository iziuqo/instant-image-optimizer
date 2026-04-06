# Instant Image Optimizer

Compress images **before they hit your server**.

This repository contains a frontend-only, high-performance web app that optimizes images directly in the browser using the Canvas API. It supports WebP / AVIF (where available) / JPEG output, a near-lossless quality range, optional resizing, a pixel-aligned before/after comparison slider, and detailed file size analytics.

## Why this repo exists

This is the foundation for a broader open-source solution/library around client-side image optimization.

- The current deliverable is a **production-ready demo app**.
- Next steps can evolve the internals into a reusable library + adapters.

## Demo app

The app lives in:

- `vanilla/`

## Run locally

Because the project uses ES Modules, run it with a local static server.

```bash
python -m http.server 5173
```

Then open:

- `http://localhost:5173/vanilla/`

## Deploy (Vercel)

- Import the repo in Vercel
- Set the **Root Directory** to `vanilla`
- Framework preset: **Other**

## License

MIT
