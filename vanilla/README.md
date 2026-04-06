# Instant Image Optimizer

Compress images **before they hit your server**.

A frontend-only, high-performance web app that optimizes images in your browser using the Canvas API. It supports WebP / AVIF (where available) / JPEG output, a near-lossless quality range, optional resizing, a pixel-aligned before/after comparison slider, and detailed file size analytics.

## Why frontend image optimization matters

- **Faster uploads**: smaller files reach your server.
- **Lower bandwidth cost**: less data transferred.
- **Better UX**: users don’t wait for server-side processing.

## How it works (simple)

- **Decode** the uploaded image with `createImageBitmap`.
- **Draw** onto a canvas (this strips most metadata).
- **Optionally resize** to a max width.
- **Re-encode** into AVIF/WebP/JPEG with a quality setting.
- **Skip recompression** if the result is bigger than the original.

## Tech stack

- Vanilla HTML/CSS/JS (ES Modules)
- Canvas API + `createImageBitmap`
- No backend, no dependencies

## Project structure

- `index.html`
- `styles.css`
- `app.js`
- `utils/formatSupport.js`
- `utils/imageProcessor.js`
- `components/slider.js`

## Run locally

Because this uses ES Modules, run it with a local static server.

Examples:

- VS Code: **Live Server** extension
- Python:
  - `python -m http.server 5173`

Then open:

- `http://localhost:5173/vanilla/`

## Deploy (Vercel)

- Import the repo in Vercel
- Set the **Root Directory** to `vanilla`
- Framework preset: **Other**

## Live demo

- Add your Vercel link here after deploying.

## Screenshots / GIF

- Add screenshots or a short GIF here.

## License

MIT
