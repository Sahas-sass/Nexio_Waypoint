import { canShowNativeMap } from './mapAvailability';

describe('canShowNativeMap', () => {
  it('always shows the map on iOS', () => {
    expect(canShowNativeMap({ platform: 'ios', isExpoGo: false, androidMapsApiKey: null })).toBe(true);
  });
  it('shows the map in Expo Go on Android', () => {
    expect(canShowNativeMap({ platform: 'android', isExpoGo: true, androidMapsApiKey: null })).toBe(true);
  });
  it('shows the map in an Android build that has a Maps key', () => {
    expect(canShowNativeMap({ platform: 'android', isExpoGo: false, androidMapsApiKey: 'key' })).toBe(true);
  });
  it('hides the map in an Android build without a Maps key', () => {
    expect(canShowNativeMap({ platform: 'android', isExpoGo: false, androidMapsApiKey: undefined })).toBe(false);
    expect(canShowNativeMap({ platform: 'android', isExpoGo: false, androidMapsApiKey: '' })).toBe(false);
  });
});
