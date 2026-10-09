import { navigationUrl, phoneUrl, webMapsUrl } from './stopLinks';

const stop = { storeName: 'Store A', address: '1 Main St', latitude: 6.87, longitude: 79.88 };

describe('navigationUrl', () => {
  it('uses coordinates per platform', () => {
    expect(navigationUrl(stop, 'ios')).toBe('maps:0,0?q=6.87,79.88');
    expect(navigationUrl(stop, 'android')).toBe('geo:0,0?q=6.87,79.88');
    expect(navigationUrl(stop, 'web')).toBe('https://maps.google.com/?q=6.87,79.88');
    expect(webMapsUrl(stop)).toBe('https://maps.google.com/?q=6.87,79.88');
  });

  it('falls back to the address', () => {
    expect(navigationUrl({ ...stop, latitude: null, longitude: null }, 'web')).toBe(
      'https://maps.google.com/?q=Store%20A%2C%201%20Main%20St'
    );
  });

  it('returns null without coordinates or address', () => {
    expect(navigationUrl({ ...stop, latitude: null, longitude: null, address: null }, 'ios')).toBeNull();
  });
});

describe('phoneUrl', () => {
  it('strips formatting', () => expect(phoneUrl('+94 77 123-4567')).toBe('tel:+94771234567'));
  it('rejects empty numbers', () => {
    expect(phoneUrl(null)).toBeNull();
    expect(phoneUrl('n/a')).toBeNull();
  });
});
