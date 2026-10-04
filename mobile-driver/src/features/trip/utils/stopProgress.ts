import type { StopStatus, TripStop } from '../types';

export type StopKind = 'done' | 'failed' | 'current' | 'upcoming';

export const isStopClosed = (status: StopStatus) => status === 'COMPLETED' || status === 'FAILED';

/** Index of the stop the driver should work on: first IN_PROGRESS, else first PENDING, else -1. */
export function activeStopIndex(stops: TripStop[]): number {
  const inProgress = stops.findIndex((s) => s.status === 'IN_PROGRESS');
  if (inProgress !== -1) return inProgress;
  return stops.findIndex((s) => s.status === 'PENDING');
}

export function stopKind(stops: TripStop[], index: number): StopKind {
  const stop = stops[index];
  if (!stop) return 'upcoming';
  if (stop.status === 'COMPLETED') return 'done';
  if (stop.status === 'FAILED') return 'failed';
  return index === activeStopIndex(stops) ? 'current' : 'upcoming';
}

const KIND_LABELS: Record<StopKind, string> = {
  done: 'Completed',
  failed: 'Failed',
  current: 'Current Stop',
  upcoming: 'Upcoming',
};

export const stopKindLabel = (kind: StopKind) => KIND_LABELS[kind];

const STATUS_LABELS: Record<StopStatus, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Delivered',
  FAILED: 'Failed',
};

export const stopStatusLabel = (status: StopStatus) => STATUS_LABELS[status];

export interface TripProgress {
  total: number;
  closed: number;
  remaining: number;
  percent: number;
  totalItems: number;
  totalWeightKg: number;
}

export function tripProgress(stops: TripStop[]): TripProgress {
  const total = stops.length;
  const closed = stops.filter((s) => isStopClosed(s.status)).length;
  return {
    total,
    closed,
    remaining: total - closed,
    percent: total === 0 ? 0 : Math.round((closed / total) * 100),
    totalItems: stops.reduce((sum, s) => sum + s.itemCount, 0),
    totalWeightKg: stops.reduce((sum, s) => sum + s.weightKg, 0),
  };
}

/** Return a copy of the stops with one stop's status (and completion time) replaced. */
export function withStopStatus(
  stops: TripStop[],
  stopId: string,
  status: StopStatus,
  completedAt: string | null = null
): TripStop[] {
  return stops.map((s) =>
    s.id === stopId ? { ...s, status, completedAt: isStopClosed(status) ? completedAt ?? s.completedAt : s.completedAt } : s
  );
}
