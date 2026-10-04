import { isDue } from './throttle';

describe('isDue', () => {
  it('is due when nothing was sent yet', () => expect(isDue(null, 0, 1000)).toBe(true));
  it('waits for the interval', () => {
    expect(isDue(1000, 1500, 1000)).toBe(false);
    expect(isDue(1000, 2000, 1000)).toBe(true);
  });
});
