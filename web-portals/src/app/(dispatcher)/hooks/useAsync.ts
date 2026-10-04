"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface AsyncState<T> {
  key: string | null;
  data: T | null;
  error: string | null;
}

/**
 * Runs `loader` whenever `key` changes (or `reload` is called) and exposes
 * loading / error / data. Previous data is kept while a reload is in flight.
 */
export function useAsync<T>(loader: () => Promise<T>, key: string) {
  const [state, setState] = useState<AsyncState<T>>({ key: null, data: null, error: null });
  const [nonce, setNonce] = useState(0);
  const loaderRef = useRef(loader);
  const requestKey = `${key}#${nonce}`;

  useEffect(() => {
    loaderRef.current = loader;
  });

  useEffect(() => {
    let active = true;
    loaderRef.current().then(
      (data) => active && setState({ key: requestKey, data, error: null }),
      (err: unknown) =>
        active &&
        setState((prev) => ({ key: requestKey, data: prev.data, error: err instanceof Error ? err.message : "Failed to load data" })),
    );
    return () => {
      active = false;
    };
  }, [requestKey]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return { data: state.data, loading: state.key !== requestKey, error: state.error, reload };
}
