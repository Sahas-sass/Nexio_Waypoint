export interface CapturedPhoto {
  uri: string;
  base64: string;
  mimeType: string;
}

interface PickerAsset {
  uri: string;
  base64?: string | null;
  mimeType?: string | null;
}

/** Normalise an expo-image-picker asset (native gives base64, web gives a data: uri). */
export function toCapturedPhoto(asset: PickerAsset | null | undefined): CapturedPhoto | null {
  if (!asset?.uri) return null;
  let base64 = asset.base64 ?? null;
  let mimeType = asset.mimeType ?? null;
  const dataUrl = /^data:([^;]+);base64,(.*)$/.exec(asset.uri);
  if (!base64 && dataUrl) base64 = dataUrl[2];
  if (!mimeType && dataUrl) mimeType = dataUrl[1];
  if (!base64) return null;
  return { uri: asset.uri, base64, mimeType: mimeType ?? 'image/jpeg' };
}
