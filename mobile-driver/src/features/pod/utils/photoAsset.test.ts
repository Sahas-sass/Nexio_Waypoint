import { toCapturedPhoto } from './photoAsset';

describe('toCapturedPhoto', () => {
  it('uses native base64 + mime type', () => {
    expect(toCapturedPhoto({ uri: 'file:///a.jpg', base64: 'AAA', mimeType: 'image/png' })).toEqual({
      uri: 'file:///a.jpg',
      base64: 'AAA',
      mimeType: 'image/png',
    });
  });

  it('defaults the mime type to jpeg', () => {
    expect(toCapturedPhoto({ uri: 'file:///a.jpg', base64: 'AAA' })?.mimeType).toBe('image/jpeg');
  });

  it('reads web data urls', () => {
    expect(toCapturedPhoto({ uri: 'data:image/webp;base64,BBB' })).toEqual({
      uri: 'data:image/webp;base64,BBB',
      base64: 'BBB',
      mimeType: 'image/webp',
    });
  });

  it('returns null without image data', () => {
    expect(toCapturedPhoto(null)).toBeNull();
    expect(toCapturedPhoto({ uri: 'file:///a.jpg' })).toBeNull();
  });
});
