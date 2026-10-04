import { normalizeIdentifier } from './normalizeIdentifier';

describe('normalizeIdentifier', () => {
  it.each([
    ['driver', 'driver@waypoint.com'],
    ['  Driver2 ', 'driver2@waypoint.com'],
    ['Kasun.Perera', 'kasun.perera@waypoint.com'],
    ['Driver@Waypoint.com', 'driver@waypoint.com'],
    ['someone@example.org', 'someone@example.org'],
  ])('%s → %s', (input, expected) => {
    expect(normalizeIdentifier(input)).toBe(expected);
  });

  it.each(['', '   ', 'two words', 'bad@', '@nope.com', 'a@b', 'x;drop'])('rejects %p', (input) => {
    expect(normalizeIdentifier(input)).toBeNull();
  });
});
