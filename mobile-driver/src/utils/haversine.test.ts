import { distanceLabel, haversineKm } from './haversine';

describe('haversineKm', () => {
  it('is zero for identical points', () => {
    expect(haversineKm({ latitude: 6.9, longitude: 79.8 }, { latitude: 6.9, longitude: 79.8 })).toBe(0);
  });

  it('matches a known distance (Colombo Fort → Nugegoda ≈ 7.5 km)', () => {
    const km = haversineKm({ latitude: 6.9344, longitude: 79.8428 }, { latitude: 6.8724, longitude: 79.8895 });
    expect(km).toBeGreaterThan(8);
    expect(km).toBeLessThan(9);
  });
});

describe('distanceLabel', () => {
  it('returns null when a coordinate is missing', () => {
    expect(distanceLabel(null, { latitude: 1, longitude: 1 })).toBeNull();
    expect(distanceLabel({ latitude: 1, longitude: 1 }, { latitude: null, longitude: 1 })).toBeNull();
  });

  it('uses metres below one kilometre', () => {
    expect(distanceLabel({ latitude: 6.9, longitude: 79.8 }, { latitude: 6.9045, longitude: 79.8 })).toBe('500 m');
  });

  it('uses one decimal kilometres otherwise', () => {
    expect(distanceLabel({ latitude: 6.9, longitude: 79.8 }, { latitude: 6.9, longitude: 79.85 })).toMatch(/^5\.\d km$/);
  });
});
