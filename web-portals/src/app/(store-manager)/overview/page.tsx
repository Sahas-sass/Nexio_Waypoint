"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { Check, Plus, ShoppingBag, TriangleAlert } from "lucide-react";
import { ActivityFeed } from "../components/overview/ActivityFeed";
import { KpiCard } from "../components/overview/KpiCard";
import { NextDeliveryCard } from "../components/overview/NextDeliveryCard";
import { StoreInfoCard } from "../components/overview/StoreInfoCard";
import { CutoffCard } from "../components/CutoffCard";
import { PageHero } from "../components/PageHero";
import { AsyncView } from "../components/States";
import { useStore } from "../components/StoreProvider";
import { useAsyncData } from "../hooks/useAsyncData";
import { useNow } from "../hooks/useNow";
import { loadOverviewData } from "../services/pageLoaders";
import { buildActivity } from "../utils/activity";
import { colomboToday, greeting, headlineDate } from "../utils/dates";
import { todaysStops } from "../utils/deliveries";
import { computeOrderKpis } from "../utils/orders";
import { firstName } from "../utils/text";

export default function OverviewPage() {
  const { store, fullName } = useStore();
  const now = useNow();
  const loader = useCallback(() => loadOverviewData(store.id), [store.id]);
  const { data, loading, error, reload } = useAsyncData(loader);
  const today = colomboToday(now);

  const view = useMemo(() => {
    if (!data) return null;
    return {
      kpis: computeOrderKpis(data.orders, data.receipts),
      stops: todaysStops(data.stops, today),
      activity: buildActivity(data.orders, data.receipts, data.deferrals),
    };
  }, [data, today]);

  const name = firstName(fullName);

  return (
    <>
      <PageHero
        eyebrow={headlineDate(now)}
        title={name ? `${greeting(now)}, ${name}` : greeting(now)}
        subtitle={`Here is what is happening at ${store.name} today`}
        action={
          <Link
            href="/orders"
            className="bg-[#F5C242] hover:bg-[#eab308] text-neutral-900 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create new order</span>
          </Link>
        }
      />

      <main className="p-8 space-y-6 max-w-[1400px] w-full mx-auto">
        <AsyncView data={view} loading={loading} error={error} onRetry={reload}>
          {(v) => (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KpiCard href="/orders" icon={ShoppingBag} iconClass="bg-[#FDF6E2] text-amber-700" label="Open orders" value={v.kpis.open} hint="Pending, planning or assigned" />
                <KpiCard href="/receiving" icon={Check} iconClass="bg-emerald-50 text-emerald-600" label="Awaiting confirmation" value={v.kpis.awaitingConfirmation} hint="Delivered, not yet received" />
                <KpiCard href="/alerts" icon={TriangleAlert} iconClass="bg-amber-50 text-amber-600" label="Deferred" value={v.kpis.deferred} hint="Moved to a later run" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-8 space-y-6">
                  <NextDeliveryCard stops={v.stops} orders={data?.orders ?? []} />
                  <ActivityFeed items={v.activity} />
                </div>
                <div className="lg:col-span-4 space-y-6">
                  <CutoffCard now={now} />
                  <StoreInfoCard store={store} />
                </div>
              </div>
            </>
          )}
        </AsyncView>
      </main>
    </>
  );
}
