import heic2any from "heic2any";

/**
 * Detects whether a file is HEIC/HEIF.
 */
export function isHeicFile(file: File): boolean {
  const name = file.name.toLowerCase();

  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    file.type === "image/heic-sequence" ||
    file.type === "image/heif-sequence" ||
    name.endsWith(".heic") ||
    name.endsWith(".heif")
  );
}

/**
 * Converts a HEIC/HEIF image to WebP.
 * Returns the original file if it's not HEIC.
 */
export async function convertHeicToWebP(file: File): Promise<File> {
  if (!isHeicFile(file)) {
    return file;
  }

  const convertedBlob = await heic2any({
    blob: file,
    toType: "image/webp",
    quality: 0.9,
  });

  const blob = Array.isArray(convertedBlob)
    ? convertedBlob[0]
    : convertedBlob;

  const fileName = file.name.replace(/\.(heic|heif)$/i, ".webp");

  return new File([blob], fileName, {
    type: "image/webp",
    lastModified: Date.now(),
  });
}

/**
 * Processes multiple files.
 */
export async function processImageFiles(files: File[]): Promise<File[]> {
  return Promise.all(files.map(convertHeicToWebP));
}