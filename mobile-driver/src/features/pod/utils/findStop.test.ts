import type { TripStop } from '@/features/trip/types';

import { findStop, nextOpenStop } from './findStop';

const stop = (id: string, status: TripStop['status'] = 'PENDING') => ({ id, status }) as TripStop;

describe('findStop', () => {
  const stops = [stop('a'), stop('b')];
  it('finds by id (string or array param)', () => {
    expect(findStop(stops, 'b', null)?.id).toBe('b');
    expect(findStop(stops, ['a'], null)?.id).toBe('a');
  });
  it('falls back to the active stop', () => {
    expect(findStop(stops, 'zzz', stops[0])?.id).toBe('a');
    expect(findStop(stops, undefined, null)).toBeNull();
  });
});

describe('nextOpenStop', () => {
  it('skips the given stop and closed stops', () => {
    const stops = [stop('a', 'COMPLETED'), stop('b', 'COMPLETED'), stop('c', 'FAILED'), stop('d')];
    expect(nextOpenStop(stops, 'b')?.id).toBe('d');
    expect(nextOpenStop([stop('a')], 'a')).toBeNull();
  });
});
