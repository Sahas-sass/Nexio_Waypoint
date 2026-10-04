"use client";

import { useCallback } from "react";
import { HistoryTable } from "../components/HistoryTable";
import { PageHero } from "../components/PageHero";
import { Panel } from "../components/Panel";
import { AsyncView } from "../components/States";
import { useStore } from "../components/StoreProvider";
import { useAsyncData } from "../hooks/useAsyncData";
import { fetchStoreReceipts } from "../services/receiptsService";

export default function HistoryPage() {
  const { store } = useStore();
  const loader = useCallback(() => fetchStoreReceipts(store.id), [store.id]);
  const { data, loading, error, reload } = useAsyncData(loader);

  return (
    <>
      <PageHero title="Receiving history" subtitle={`Confirmed deliveries for ${store.name}`} />
      <main className="p-8 max-w-[1400px] w-full mx-auto">
        <Panel title="Store receipts" subtitle={data ? `${data.length} confirmed deliver${data.length === 1 ? "y" : "ies"}` : undefined}>
          <AsyncView
            data={data}
            loading={loading}
            error={error}
            onRetry={reload}
            isEmpty={(rows) => rows.length === 0}
            empty={{ title: "No receipts yet", hint: "Deliveries you confirm on the Receiving page will be listed here." }}
          >
            {(rows) => <HistoryTable receipts={rows} />}
          </AsyncView>
        </Panel>
      </main>
    </>
  );
}
