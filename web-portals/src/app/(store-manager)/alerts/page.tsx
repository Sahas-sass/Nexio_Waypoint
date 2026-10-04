"use client";

import { useCallback, useMemo } from "react";
import { AlertsList } from "../components/AlertsList";
import { PageHero } from "../components/PageHero";
import { Panel } from "../components/Panel";
import { AsyncView } from "../components/States";
import { useStore } from "../components/StoreProvider";
import { useAsyncData } from "../hooks/useAsyncData";
import { loadAlertsData } from "../services/pageLoaders";
import { buildAlerts } from "../utils/alerts";

export default function AlertsPage() {
  const { store } = useStore();
  const loader = useCallback(() => loadAlertsData(store.id), [store.id]);
  const { data, loading, error, reload } = useAsyncData(loader);
  const alerts = useMemo(() => (data ? buildAlerts(data.deferrals, data.orders, data.exceptions) : null), [data]);

  return (
    <>
      <PageHero title="Alerts" subtitle="Deferred orders and delivery exceptions for your store" />
      <main className="p-8 max-w-[1400px] w-full mx-auto">
        <Panel title="Notifications" subtitle={alerts ? `${alerts.length} alert${alerts.length === 1 ? "" : "s"}` : undefined}>
          <AsyncView
            data={alerts}
            loading={loading}
            error={error}
            onRetry={reload}
            isEmpty={(rows) => rows.length === 0}
            empty={{ title: "All clear", hint: "Deferrals and exceptions for your store will appear here." }}
          >
            {(rows) => <AlertsList alerts={rows} />}
          </AsyncView>
        </Panel>
      </main>
    </>
  );
}
