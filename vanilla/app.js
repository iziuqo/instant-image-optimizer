import { optimizeImageFile } from "./utils/imageProcessor.js";
import { pickBestOutputType } from "./utils/formatSupport.js";
import { createComparisonSlider } from "./components/slider.js";

const dropzone = document.getElementById("dropzone");
const originalCanvas = document.getElementById("original");
const optimizedCanvas = document.getElementById("optimized");
const overlay = document.getElementById("overlay");
const handle = document.getElementById("handle");
const viewerEl = document.querySelector(".viewer");
const appEl = document.querySelector(".app");

const formatEl = document.getElementById("format");
const qualityEl = document.getElementById("quality");
const maxWidthEl = document.getElementById("maxWidth");

const originalSizeEl = document.getElementById("originalSize");
const optimizedSizeEl = document.getElementById("optimizedSize");
const reductionEl = document.getElementById("reduction");
const dimensionsEl = document.getElementById("dimensions");
const outputFormatEl = document.getElementById("outputFormat");
const noticeEl = document.getElementById("notice");

const downloadBtn = document.getElementById("download");

let originalFile = null;
let optimizedBlob = null;
let optimizedMime = null;
let originalBitmapSize = null;
let activeObjectUrl = null;
let compareReady = false;

function setHasImage(nextHasImage) {
  appEl.classList.toggle("has-image", Boolean(nextHasImage));
}

function debounce(fn, ms) {
  let t;
  return (...args) => {
    window.clearTimeout(t);
    t = window.setTimeout(() => fn(...args), ms);
  };
}

function formatBytes(bytes) {
  const b = Number(bytes) || 0;
  if (b < 1024) return `${b} B`;
  const kb = b / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

function animateText(el, nextText) {
  el.style.transition = "opacity 120ms ease";
  el.style.opacity = "0.55";
  window.setTimeout(() => {
    el.textContent = nextText;
    el.style.opacity = "1";
  }, 90);
}

function extFromMime(mime) {
  if (mime === "image/avif") return "avif";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

function baseNameFromFile(file) {
  const name = file?.name || "image";
  const idx = name.lastIndexOf(".");
  return idx > 0 ? name.slice(0, idx) : name;
}

function revokeActiveUrl() {
  if (!activeObjectUrl) return;
  URL.revokeObjectURL(activeObjectUrl);
  activeObjectUrl = null;
}

function drawBitmapToCanvas(canvas, bitmap) {
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d", { alpha: false });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0);
}

function drawBitmapToCanvasFit(canvas, bitmap, width, height) {
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: false });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, width, height);
}

function setComparisonVisible(visible) {
  viewerEl.classList.toggle("has-compare", visible);
  compareReady = visible;
}

function setViewerAspectRatio(width, height) {
  if (!width || !height) return;
  viewerEl.style.setProperty("--img-ar", `${width} / ${height}`);
}

function setNotice({ text, tone }) {
  if (!noticeEl) return;
  noticeEl.classList.remove("is-visible", "is-warn", "is-ok");

  if (!text) {
    noticeEl.textContent = "";
    return;
  }

  noticeEl.textContent = text;
  noticeEl.classList.add("is-visible");
  if (tone === "warn") noticeEl.classList.add("is-warn");
  if (tone === "ok") noticeEl.classList.add("is-ok");
}

const slider = createComparisonSlider({
  container: viewerEl,
  overlayEl: overlay,
  handleEl: handle,
  getRectTarget: () => viewerEl.getBoundingClientRect(),
});
slider.setEnabled(false);

async function handleFile(file) {
  if (!file) return;
  if (!file.type?.startsWith("image/")) return;

  originalFile = file;
  optimizedBlob = null;
  optimizedMime = null;
  revokeActiveUrl();
  setComparisonVisible(false);
  slider.setEnabled(false);
  setHasImage(true);
  setNotice({ text: "", tone: "" });

  const bitmap = await createImageBitmap(file);
  originalBitmapSize = { width: bitmap.width, height: bitmap.height };
  drawBitmapToCanvas(originalCanvas, bitmap);
  setViewerAspectRatio(bitmap.width, bitmap.height);
  bitmap.close?.();

  slider.setRatio(0.5);
  downloadBtn.disabled = true;

  scheduleOptimize();
}

let optimizeSeq = 0;
async function runOptimize() {
  if (!originalFile) return;

  const mySeq = ++optimizeSeq;
  const q = Number(qualityEl.value);
  const requestedType = formatEl.value;
  const outputType = await pickBestOutputType([requestedType, "image/webp", "image/jpeg"]);
  const maxWidth = maxWidthEl.value ? Number(maxWidthEl.value) : undefined;

  const res = await optimizeImageFile({
    file: originalFile,
    outputType,
    quality: q,
    maxWidth,
  });

  if (mySeq !== optimizeSeq) return;

  optimizedBlob = res.blob;
  optimizedMime = res.outputType;

  if (!res.didOptimize) {
    if (res.reason === "no_gain") {
      setNotice({
        text: "No savings: optimized output would be larger, so the original is kept.",
        tone: "warn",
      });
    } else if (res.reason === "encode_failed") {
      setNotice({
        text: "Encoding failed for this format/settings. Using the original file.",
        tone: "warn",
      });
    } else {
      setNotice({ text: "Using the original file.", tone: "warn" });
    }
  } else {
    setNotice({ text: "", tone: "" });
  }

  const bmp = await createImageBitmap(optimizedBlob);
  // Quality-only comparison: both canvases render the same pixel dimensions.
  // If optimization resized, scale optimized output back to original display size.
  drawBitmapToCanvasFit(
    optimizedCanvas,
    bmp,
    originalCanvas.width,
    originalCanvas.height
  );
  bmp.close?.();

  updateStats();
  downloadBtn.disabled = !optimizedBlob;
  setComparisonVisible(true);
  slider.setRatio(0.5);
  slider.setEnabled(true);
}

const scheduleOptimize = debounce(() => {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(() => runOptimize(), { timeout: 400 });
  } else {
    runOptimize();
  }
}, 140);

function updateStats() {
  if (!originalFile || !optimizedBlob) return;

  const o = originalFile.size;
  const n = optimizedBlob.size;
  const r = o ? (1 - n / o) * 100 : 0;

  animateText(originalSizeEl, `Original: ${formatBytes(o)}`);
  animateText(optimizedSizeEl, `Optimized: ${formatBytes(n)}`);
  animateText(reductionEl, `${r.toFixed(1)}% saved`);

  const w = optimizedCanvas.width || originalBitmapSize?.width;
  const h = optimizedCanvas.height || originalBitmapSize?.height;
  animateText(dimensionsEl, `${w}×${h}px`);
  animateText(outputFormatEl, (optimizedMime || originalFile.type || "").replace("image/", "").toUpperCase());
}

dropzone.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.click();
  input.onchange = () => handleFile(input.files?.[0]);
});

dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropzone.classList.add("is-dragover");
});

dropzone.addEventListener("dragleave", () => {
  dropzone.classList.remove("is-dragover");
});

dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropzone.classList.remove("is-dragover");
  handleFile(e.dataTransfer.files?.[0]);
});

formatEl.addEventListener("change", scheduleOptimize);
qualityEl.addEventListener("input", scheduleOptimize);
maxWidthEl.addEventListener("input", scheduleOptimize);

downloadBtn.addEventListener("click", () => {
  if (!optimizedBlob) return;
  revokeActiveUrl();

  activeObjectUrl = URL.createObjectURL(optimizedBlob);
  const a = document.createElement("a");
  a.href = activeObjectUrl;

  const ext = extFromMime(optimizedMime || optimizedBlob.type);
  a.download = `${baseNameFromFile(originalFile)}.optimized.${ext}`;
  a.click();

  window.setTimeout(revokeActiveUrl, 2000);
});

downloadBtn.disabled = true;
setHasImage(false);