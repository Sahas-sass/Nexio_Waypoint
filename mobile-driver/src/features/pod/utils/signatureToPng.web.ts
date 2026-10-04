import { stripDataUrl } from '@/features/sync/utils/payloads';

import type { SignatureSource } from './signatureToPng';

/** Web: draw the SVG path data onto a canvas and export it as PNG (base64, no prefix). */
export function signatureToPng({ path, width, height }: SignatureSource): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.reject(new Error('Canvas is not available.'));
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke(new Path2D(path));
  return Promise.resolve(stripDataUrl(canvas.toDataURL('image/png')));
}
