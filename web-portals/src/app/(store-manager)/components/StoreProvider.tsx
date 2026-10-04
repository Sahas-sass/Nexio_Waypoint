"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useAsyncData } from "../hooks/useAsyncData";
import { fetchStoreContext } from "../services/storeService";
import type { StoreContextData } from "../types";
import { ErrorState, LoadingState } from "./States";

const StoreContext = createContext<StoreContextData | null>(null);

/** Loads the manager's store once and renders children only when it is available. */
export function StoreProvider({ children }: { children: ReactNode }) {
  const { data, loading, error, reload } = useAsyncData(fetchStoreContext);

  if (error && !data) {
    return (
      <div className="p-8">
        <ErrorState message={error} onRetry={reload} />
      </div>
    );
  }
  if (loading && !data) {
    return (
      <div className="p-8">
        <LoadingState label="Loading your store…" />
      </div>
    );
  }
  return <StoreContext.Provider value={data}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextData {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
