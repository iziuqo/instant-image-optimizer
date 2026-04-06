export async function canEncodeType(mimeType) {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;

  if (!canvas.toDataURL) return false;

  try {
    const dataUrl = canvas.toDataURL(mimeType);
    return typeof dataUrl === "string" && dataUrl.startsWith(`data:${mimeType}`);
  } catch {
    return false;
  }
}

export async function pickBestOutputType(preferredTypes) {
  for (const t of preferredTypes) {
    // eslint-disable-next-line no-await-in-loop
    if (await canEncodeType(t)) return t;
  }
  return "image/jpeg";
}
