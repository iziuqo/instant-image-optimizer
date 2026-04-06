import { pickBestOutputType } from "./formatSupport.js";

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export function calcTargetSize(srcWidth, srcHeight, maxWidth) {
  const mw = Number(maxWidth);
  if (!mw || !Number.isFinite(mw) || mw <= 0) {
    return { width: srcWidth, height: srcHeight, scale: 1 };
  }

  if (srcWidth <= mw) return { width: srcWidth, height: srcHeight, scale: 1 };

  const scale = mw / srcWidth;
  return {
    width: Math.max(1, Math.round(srcWidth * scale)),
    height: Math.max(1, Math.round(srcHeight * scale)),
    scale,
  };
}

export async function decodeImageBitmap(file) {
  return createImageBitmap(file);
}

export async function encodeCanvasToBlob(canvas, mimeType, quality) {
  const q = clamp(Number(quality), 0, 1);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, q);
  });
}

export async function optimizeImageFile({
  file,
  outputType,
  quality,
  maxWidth,
  preferredFallbacks = ["image/avif", "image/webp", "image/jpeg"],
}) {
  const bitmap = await decodeImageBitmap(file);

  const target = calcTargetSize(bitmap.width, bitmap.height, maxWidth);

  const canvas = document.createElement("canvas");
  canvas.width = target.width;
  canvas.height = target.height;

  const ctx = canvas.getContext("2d", { alpha: false });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(bitmap, 0, 0, target.width, target.height);
  bitmap.close?.();

  const chosenType = outputType || (await pickBestOutputType(preferredFallbacks));
  const blob = await encodeCanvasToBlob(canvas, chosenType, quality);

  // If encoding failed, return original
  if (!blob) {
    return {
      blob: file,
      outputType: file.type || "image/*",
      width: target.width,
      height: target.height,
      didOptimize: false,
      reason: "encode_failed",
    };
  }

  // Avoid unnecessary recompression if no benefit
  if (blob.size >= file.size) {
    return {
      blob: file,
      outputType: file.type || chosenType,
      width: bitmap.width,
      height: bitmap.height,
      didOptimize: false,
      reason: "no_gain",
    };
  }

  return {
    blob,
    outputType: chosenType,
    width: target.width,
    height: target.height,
    didOptimize: true,
    reason: "ok",
  };
}
