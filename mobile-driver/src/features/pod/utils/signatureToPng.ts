import type Svg from 'react-native-svg';

import { stripDataUrl } from '@/features/sync/utils/payloads';

export interface SignatureSource {
  svg: Svg | null;
  path: string;
  width: number;
  height: number;
}

/** Native: let react-native-svg rasterise the drawn signature to a PNG (base64, no prefix). */
export function signatureToPng({ svg, width, height }: SignatureSource): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!svg) {
      reject(new Error('Signature pad is not ready.'));
      return;
    }
    svg.toDataURL((base64: string) => resolve(stripDataUrl(base64)), {
      width: Math.round(width),
      height: Math.round(height),
    });
  });
}
