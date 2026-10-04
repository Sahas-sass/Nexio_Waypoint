"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import { errorMessage } from "../utils/errors";
import { asyncReducer, initialAsyncState, type AsyncAction, type AsyncState } from "./asyncState";

/** Runs a (memoised) async loader and exposes data/loading/error plus reload(). */
export function useAsyncData<T>(loader: () => Promise<T>) {
  const [state, dispatch] = useReducer(
    asyncReducer as (state: AsyncState<T>, action: AsyncAction<T>) => AsyncState<T>,
    initialAsyncState as AsyncState<T>,
  );
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    loader().then(
      (data) => !cancelled && dispatch({ type: "success", data }),
      (error) => !cancelled && dispatch({ type: "error", error: errorMessage(error) }),
    );
    return () => {
      cancelled = true;
    };
  }, [loader, version]);

  const reload = useCallback(() => {
    dispatch({ type: "start" });
    setVersion((v) => v + 1);
  }, []);

  return { ...state, reload };
}
