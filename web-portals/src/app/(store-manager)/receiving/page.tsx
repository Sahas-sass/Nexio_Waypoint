"use client";

import { useCallback } from "react";
import { PageHero } from "../components/PageHero";
import { PendingReceiptCard } from "../components/receiving/PendingReceiptCard";
import { AsyncView } from "../components/States";
import { useStore } from "../components/StoreProvider";
import { useAsyncData } from "../hooks/useAsyncData";
import { loadPendingReceipts } from "../services/pageLoaders";

export default function ReceivingPage() {
  const { store } = useStore();
  const loader = useCallback(() => loadPendingReceipts(store.id), [store.id]);
  const { data, loading, error, reload } = useAsyncData(loader);

  return (
    <>
      <PageHero title="Receiving" subtitle="Check delivered orders against the driver's proof of delivery and confirm receipt" />
      <main className="p-8 max-w-[1400px] w-full mx-auto space-y-6">
        <AsyncView
          data={data}
          loading={loading}
          error={error}
          onRetry={reload}
          isEmpty={(rows) => rows.length === 0}
          empty={{ title: "Nothing to receive", hint: "Delivered orders waiting for your confirmation will appear here." }}
        >
          {(rows) => rows.map((item) => <PendingReceiptCard key={item.order.id} item={item} onConfirmed={reload} />)}
        </AsyncView>
      </main>
    </>
  );
}
