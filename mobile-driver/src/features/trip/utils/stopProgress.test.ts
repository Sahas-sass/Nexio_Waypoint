import { tripStop } from '../fixtures';
import {
  activeStopIndex,
  isStopClosed,
  stopKind,
  stopKindLabel,
  stopStatusLabel,
  tripProgress,
  withStopStatus,
} from './stopProgress';

const stops = [
  tripStop({ id: 'a', sequence: 1, status: 'COMPLETED', itemCount: 5, weightKg: 50 }),
  tripStop({ id: 'b', sequence: 2, status: 'FAILED' }),
  tripStop({ id: 'c', sequence: 3, status: 'PENDING' }),
  tripStop({ id: 'd', sequence: 4, status: 'PENDING' }),
];

describe('stopProgress', () => {
  it('finds the active stop (in progress first, else first pending)', () => {
    expect(activeStopIndex(stops)).toBe(2);
    expect(activeStopIndex(withStopStatus(stops, 'd', 'IN_PROGRESS'))).toBe(3);
    expect(activeStopIndex(withStopStatus(withStopStatus(stops, 'c', 'COMPLETED'), 'd', 'COMPLETED'))).toBe(-1);
  });

  it('classifies stops', () => {
    expect(stops.map((_, i) => stopKind(stops, i))).toEqual(['done', 'failed', 'current', 'upcoming']);
    expect(stopKind(stops, 99)).toBe('upcoming');
    expect(stopKindLabel('current')).toBe('Current Stop');
    expect(stopStatusLabel('COMPLETED')).toBe('Delivered');
    expect(isStopClosed('FAILED')).toBe(true);
    expect(isStopClosed('IN_PROGRESS')).toBe(false);
  });

  it('computes progress and totals', () => {
    expect(tripProgress(stops)).toEqual({ total: 4, closed: 2, remaining: 2, percent: 50, totalItems: 35, totalWeightKg: 350 });
    expect(tripProgress([]).percent).toBe(0);
  });

  it('updates a stop immutably and stamps completion only when closed', () => {
    const next = withStopStatus(stops, 'c', 'COMPLETED', '2026-10-04T03:00:00Z');
    expect(next[2]).toMatchObject({ status: 'COMPLETED', completedAt: '2026-10-04T03:00:00Z' });
    expect(stops[2].status).toBe('PENDING');
    expect(withStopStatus(stops, 'c', 'IN_PROGRESS', 'x')[2].completedAt).toBeNull();
  });
});
