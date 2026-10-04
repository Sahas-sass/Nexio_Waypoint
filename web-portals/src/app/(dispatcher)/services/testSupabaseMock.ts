// Test helper: a chainable fake of the supabase-js query builder.
// Each `from(table)` call consumes the next queued response for that table;
// `rpc(name, args)` is recorded under the table key "rpc:<name>".
type Response = { data?: unknown; error?: { message: string } | null; count?: number | null };

export interface Call {
  table: string;
  ops: { method: string; args: unknown[] }[];
}

export function createSupabaseMock() {
  const queues = new Map<string, Response[]>();
  const calls: Call[] = [];
  const channel = { on: () => channel, subscribe: () => channel };

  const client = {
    from(table: string) {
      const call: Call = { table, ops: [] };
      calls.push(call);
      const res = queues.get(table)?.shift() ?? { data: [], error: null };
      const builder: Record<string, unknown> = {};
      for (const m of ["select", "insert", "update", "delete", "eq", "neq", "in", "order", "limit", "single"]) {
        builder[m] = (...args: unknown[]) => {
          call.ops.push({ method: m, args });
          return builder;
        };
      }
      builder.then = (resolve: (r: Response) => unknown, reject: (e: unknown) => unknown) =>
        Promise.resolve({ data: null, error: null, count: null, ...res }).then(resolve, reject);
      return builder;
    },
    rpc(name: string, args: unknown) {
      const table = `rpc:${name}`;
      calls.push({ table, ops: [{ method: "rpc", args: [args] }] });
      const res = queues.get(table)?.shift() ?? { data: null, error: null };
      return Promise.resolve({ data: null, error: null, ...res });
    },
    channel: () => channel,
    removeChannel: () => undefined,
  };

  return {
    client,
    calls,
    queue(table: string, ...responses: Response[]) {
      queues.set(table, [...(queues.get(table) ?? []), ...responses]);
    },
    reset() {
      queues.clear();
      calls.length = 0;
    },
    opsOf(table: string, index = 0) {
      return calls.filter((c) => c.table === table)[index]?.ops ?? [];
    },
  };
}
