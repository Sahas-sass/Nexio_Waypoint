import { stopRow, trip, tripRow, tripStop } from './fixtures';

describe('fixtures', () => {
  it('build consistent defaults', () => {
    expect(stopRow().id).toBe('stop-1');
    expect(tripRow().stops).toHaveLength(2);
    expect(trip([tripStop()]).stops[0].storeName).toBe('Store One');
  });
});
