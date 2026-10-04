import { UnsupportedImageTypeError } from "./image-errors";

/** Resize + re-encode so the final data URL lands around this size. */
const TARGET_BYTES = 235 * 1024; // ~230KB, safely under the 200-250KB budget
const MAX_ATTEMPTS = 8;

function dataUrlBytes(dataUrl: string): number {
  const base64 = dataUrl.split(",")[1] || "";
  return Math.ceil((base64.length * 3) / 4);
}

function loadImage(src: string, crossOrigin = false): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Canvas-based compressor: shrinks quality first, then dimensions, toward TARGET_BYTES. */
function compressLoadedImage(img: HTMLImageElement): string {
  let maxDim = 1000;
  let quality = 0.85;
  let result = "";

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas-unavailable");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    result = canvas.toDataURL("image/jpeg", quality);
    if (dataUrlBytes(result) <= TARGET_BYTES) break;
    if (quality > 0.5) {
      quality -= 0.12;
    } else {
      maxDim = Math.round(maxDim * 0.8);
      quality = 0.7;
    }
  }
  return result;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function compressImageFile(file: File): Promise<string> {
  if (!file.type || !file.type.startsWith("image/")) {
    throw new UnsupportedImageTypeError();
  }
  const img = await loadImage(await readAsDataUrl(file));
  return compressLoadedImage(img);
}

/**
 * Caches a remote cover (e.g. Open Library) as a compressed local data URL so
 * the library never depends on the external host being up. Some hosts omit CORS
 * headers, which taints the canvas — in that case we fall back to the remote URL.
 */
export async function compressImageFromUrl(url: string): Promise<string> {
  try {
    const img = await loadImage(url, true);
    return compressLoadedImage(img);
  } catch {
    return url;
  }
}
