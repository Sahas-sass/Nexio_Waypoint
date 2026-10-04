import { vi } from "vitest";

type Result = { data: unknown; error: unknown };

/** Chainable, awaitable stand-in for a PostgREST query builder used by service tests. */
export function queryMock(result: Result) {
  const calls: [string, unknown[]][] = [];
  const builder: Record<string, unknown> = {};
  for (const name of ["select", "eq", "in", "order", "limit", "single", "maybeSingle", "neq", "gte"]) {
    builder[name] = vi.fn((...args: unknown[]) => {
      calls.push([name, args]);
      return builder;
    });
  }
  builder.then = (resolve: (r: Result) => unknown, reject: (e: unknown) => unknown) => Promise.resolve(result).then(resolve, reject);
  return { builder, calls };
}
