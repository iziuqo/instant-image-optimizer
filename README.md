# Instant Image Optimizer

Compress images **before they hit your server**.

This repository contains a frontend-only, high-performance web app that optimizes images directly in the browser using the Canvas API. It supports WebP / AVIF (where available) / JPEG output, a near-lossless quality range, optional resizing, a pixel-aligned before/after comparison slider, and detailed file size analytics.

## Why this repo exists

This is the foundation for a broader open-source solution/library around client-side image optimization.

- The current deliverable is a **production-ready demo app**.
- Next steps can evolve the internals into a reusable library + adapters.

## Is this valuable? Who is it for?

**Yes — this project is genuinely useful**, and it targets a clear gap: a zero-dependency, no-build-step tool for both end-users and developers who want to understand or embed client-side image optimization.

### End-users (non-developers)

Anyone who regularly uploads images — bloggers, e-commerce sellers, social media managers, designers — benefits from a fast, private, browser-based tool that shrinks image files without installing software or sending data to a server.

### Frontend developers

- **Learning resource**: The codebase is deliberately minimal (~400 lines total), making it an ideal reference for how the Canvas API, `createImageBitmap`, and `toBlob` work together for real-world image encoding.
- **Embed or fork**: Because there are zero npm dependencies and no build step, a developer can drop the `utils/imageProcessor.js` module into an existing project and call `optimizeImageFile()` directly.
- **Library seed**: The repo explicitly positions itself as the foundation for a reusable library. The modular structure (`utils/`, `components/`) means the core logic is already decoupled from the UI.

### Teams uploading user-generated content

Any product that lets users upload images (profile pictures, product photos, forum attachments) can adapt this code to compress files on the client before they are sent, reducing bandwidth and server-side processing costs with no backend changes required.

### Why it stands out

| Property | This project |
|---|---|
| Dependencies | Zero (pure HTML/CSS/JS) |
| Build step | None |
| Output formats | AVIF → WebP → JPEG (graceful fallback) |
| Visual comparison | Pixel-aligned before/after slider |
| Privacy | 100% client-side; no data ever leaves the browser |
| Metadata stripping | Automatic (Canvas re-encode removes EXIF) |
| Bundle size | ~5 KB of source across all files |

## Similar projects on GitHub

Several other open-source projects tackle browser-side image compression. Here is how they compare:

| Project | Stars | Approach | Key difference vs this project |
|---|---|---|---|
| [browser-image-compression](https://github.com/Donaldcwl/browser-image-compression) | ~1,700 ⭐ | npm library, Web Workers | Library you import — no UI, no before/after viewer, requires a build pipeline |
| [squish](https://github.com/addyosmani/squish) | ~1,000 ⭐ | TypeScript app, batch mode | TypeScript + bundler required; focuses on batch processing rather than single-image comparison |
| [react-shrink](https://github.com/MoussaabBadla/react-shrink) | ~26 ⭐ | React hook + Web Workers | Tied to React; not usable outside a React project |
| [omni-compress](https://github.com/dharanish-v/omni-compress) | ~2 ⭐ | TypeScript, FFmpeg WASM | Supports audio too; heavier due to WASM; requires Node.js or a bundler |

**Summary**: `browser-image-compression` and `squish` are the closest alternatives. `browser-image-compression` is a mature library but offers no visual interface. `squish` is a full app but requires TypeScript and a build tool. Neither provides a zero-dependency, no-build-step starting point with a built-in before/after comparison slider. This project fills that niche.

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
