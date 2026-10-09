export const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

export type AvatarCheck = { ok: true; extension: string } | { ok: false; error: string };

/** Validates an uploaded avatar's MIME type and size; the extension is derived from the type, never the file name. */
export function validateAvatarFile(file: { type: string; size: number } | null | undefined): AvatarCheck {
  if (!file) return { ok: false, error: "No file provided" };
  const extension = EXTENSIONS[file.type];
  if (!extension) return { ok: false, error: "Only PNG, JPEG, WebP or GIF images are allowed" };
  if (file.size <= 0) return { ok: false, error: "File is empty" };
  if (file.size > MAX_AVATAR_BYTES) return { ok: false, error: "Image file exceeds 5MB limit" };
  return { ok: true, extension };
}

/** Detects the image type from the file's first bytes so a renamed non-image cannot be stored as one. */
export function sniffImageType(bytes: Uint8Array): string | null {
  const starts = (sig: number[], offset = 0) => sig.every((b, i) => bytes[offset + i] === b);
  if (starts([0x89, 0x50, 0x4e, 0x47])) return "image/png";
  if (starts([0xff, 0xd8, 0xff])) return "image/jpeg";
  if (starts([0x47, 0x49, 0x46, 0x38])) return "image/gif";
  if (starts([0x52, 0x49, 0x46, 0x46]) && starts([0x57, 0x45, 0x42, 0x50], 8)) return "image/webp";
  return null;
}
