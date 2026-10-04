"use client";

import { useCallback, useMemo, useState } from "react";
import { CutoffCard } from "../components/CutoffCard";
import { OrderFiltersBar } from "../components/orders/OrderFiltersBar";
import { OrdersTable } from "../components/orders/OrdersTable";
import { PlaceOrderForm } from "../components/orders/PlaceOrderForm";
import { PageHero } from "../components/PageHero";
import { Panel } from "../components/Panel";
import { AsyncView, EmptyState } from "../components/States";
import { useStore } from "../components/StoreProvider";
import { useAsyncData } from "../hooks/useAsyncData";
import { useNow } from "../hooks/useNow";
import { fetchStoreOrders } from "../services/ordersService";
import { filterOrders, type OrderFilters } from "../utils/orders";

export default function OrdersPage() {
  const { store } = useStore();
  const now = useNow();
  const loader = useCallback(() => fetchStoreOrders(store.id), [store.id]);
  const { data, loading, error, reload } = useAsyncData(loader);
  const [filters, setFilters] = useState<OrderFilters>({ status: "all", temp: "all", search: "" });
  const filtered = useMemo(() => (data ? filterOrders(data, filters) : null), [data, filters]);

  return (
    <>
      <PageHero title="Orders" subtitle={`Replenishment orders for ${store.name}`} />
      <main className="p-8 max-w-[1400px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
          <Panel title="Your orders" subtitle={data ? `${data.length} order${data.length === 1 ? "" : "s"} in total` : undefined}>
            <OrderFiltersBar filters={filters} onChange={setFilters} />
            <AsyncView
              data={filtered}
              loading={loading}
              error={error}
              onRetry={reload}
              isEmpty={(rows) => rows.length === 0}
              empty={data && data.length > 0 ? { title: "No orders match your filters" } : { title: "No orders yet", hint: "Use the form to place your first order." }}
            >
              {(rows) => <OrdersTable orders={rows} />}
            </AsyncView>
            {error && data && <EmptyState title="Could not refresh orders" hint={error} />}
          </Panel>
        </div>
        <div className="lg:col-span-4 space-y-6">
          <CutoffCard now={now} showAction={false} />
          <PlaceOrderForm now={now} onPlaced={reload} />
        </div>
      </main>
    </>
  );
}
