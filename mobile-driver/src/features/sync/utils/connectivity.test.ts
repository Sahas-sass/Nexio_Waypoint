import { isOnlineState } from './connectivity';

describe('isOnlineState', () => {
  it.each([
    [{ isConnected: true, isInternetReachable: true }, true],
    [{ isConnected: true, isInternetReachable: null }, true],
    [{ isConnected: true, isInternetReachable: false }, false],
    [{ isConnected: false, isInternetReachable: null }, false],
    [{ isConnected: null, isInternetReachable: null }, false],
  ])('%j → %s', (state, expected) => {
    expect(isOnlineState(state)).toBe(expected);
  });
});
