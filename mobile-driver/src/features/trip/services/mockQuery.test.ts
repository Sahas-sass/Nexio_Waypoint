import { mockQueryClient } from './mockQuery';

describe('mockQueryClient', () => {
  it('records calls and resolves configured results', async () => {
    const { client, calls } = mockQueryClient({ t: { data: [1], error: null } });
    const result = await client.from('t').select('*').eq('a', 1);
    expect(result).toEqual({ data: [1], error: null });
    expect(calls.map((c) => c.method)).toEqual(['select', 'eq']);
    await expect(client.from('missing').single()).resolves.toMatchObject({ error: { message: 'no mock for missing' } });
  });
});
