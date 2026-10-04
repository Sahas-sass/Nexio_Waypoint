import { isDue, nonNegativeOrUndefined } from './throttle';

describe('isDue', () => {
  it('is due when nothing was sent yet', () => expect(isDue(null, 0, 1000)).toBe(true));
  it('waits for the interval', () => {
    expect(isDue(1000, 1500, 1000)).toBe(false);
    expect(isDue(1000, 2000, 1000)).toBe(true);
  });
});

describe('nonNegativeOrUndefined', () => {
  it('keeps valid readings', () => {
    expect(nonNegativeOrUndefined(0)).toBe(0);
    expect(nonNegativeOrUndefined(12.5)).toBe(12.5);
  });
  it('drops unknown readings', () => {
    expect(nonNegativeOrUndefined(-1)).toBeUndefined();
    expect(nonNegativeOrUndefined(null)).toBeUndefined();
    expect(nonNegativeOrUndefined(undefined)).toBeUndefined();
  });
});
