import { describe, expect, it } from "vitest";
import { MAX_AVATAR_BYTES, sniffImageType, validateAvatarFile } from "./avatarFile";

describe("validateAvatarFile", () => {
  it("accepts supported images and derives the extension from the type", () => {
    expect(validateAvatarFile({ type: "image/jpeg", size: 1000 })).toEqual({ ok: true, extension: "jpg" });
    expect(validateAvatarFile({ type: "image/png", size: MAX_AVATAR_BYTES })).toEqual({ ok: true, extension: "png" });
  });

  it("rejects missing, wrong-type, empty and oversized files", () => {
    expect(validateAvatarFile(null).ok).toBe(false);
    expect(validateAvatarFile({ type: "image/svg+xml", size: 10 }).ok).toBe(false);
    expect(validateAvatarFile({ type: "text/html", size: 10 }).ok).toBe(false);
    expect(validateAvatarFile({ type: "image/png", size: 0 }).ok).toBe(false);
    expect(validateAvatarFile({ type: "image/png", size: MAX_AVATAR_BYTES + 1 }).ok).toBe(false);
  });
});

describe("sniffImageType", () => {
  it("recognises image signatures", () => {
    expect(sniffImageType(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0, 0]))).toBe("image/png");
    expect(sniffImageType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe("image/jpeg");
    expect(sniffImageType(new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]))).toBe("image/gif");
    expect(
      sniffImageType(new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]))
    ).toBe("image/webp");
  });

  it("returns null for anything else", () => {
    expect(sniffImageType(new TextEncoder().encode("<svg onload=alert(1)>"))).toBeNull();
    expect(sniffImageType(new Uint8Array([]))).toBeNull();
  });
});
