/**
 * Test helper: a chainable PostgREST-like query mock. Every builder method
 * records its call and returns the chain; awaiting the chain (or .single())
 * resolves to the configured result for that table.
 */
export function mockQueryClient(results: Record<string, { data: unknown; error: { message: string } | null }>) {
  const calls: { table: string; method: string; args: unknown[] }[] = [];
  const from = (table: string): any => {
    const result = results[table] ?? { data: null, error: { message: `no mock for ${table}` } };
    const chain: Record<string, unknown> = {};
    for (const method of ['select', 'eq', 'in', 'order', 'limit']) {
      chain[method] = (...args: unknown[]) => {
        calls.push({ table, method, args });
        return chain;
      };
    }
    chain.single = () => {
      calls.push({ table, method: 'single', args: [] });
      return Promise.resolve(result);
    };
    chain.then = (resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) =>
      Promise.resolve(result).then(resolve, reject);
    return chain;
  };
  return { client: { from }, calls };
}
