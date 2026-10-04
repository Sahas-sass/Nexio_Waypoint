"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Package, BarChart3, MapPin, Clock, Check, ChevronDown, X, Calendar, Bell, Loader2 } from "lucide-react";
import { useUserProfile } from "@/app/profile/useUserProfile";
import { recordUserActivity } from "@/app/profile/activityLogger";
import PageHeader from "../components/PageHeader";
import KpiCard from "../components/KpiCard";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../components/StatusBlocks";
import { usePlanningData } from "../hooks/usePlanningData";
import { submitDeferrals } from "../services/deferralService";
import { allocateOrders } from "../utils/allocation";
import { DEFERRAL_REASONS } from "../utils/constants";
import { deferralSummary, nextRunOptions } from "../utils/deferral";
import { isoDate } from "../utils/format";
import DeferralTable from "./components/DeferralTable";
import OptionPicker from "./components/OptionPicker";

function DeferralManager() {
  const params = useSearchParams();
  const { profile } = useUserProfile();
  const [planningDate, setPlanningDate] = useState(() => {
    const d = params.get("date");
    return d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : isoDate(new Date(), 1);
  });
  const { data, loading, error, reload } = usePlanningData(planningDate);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReason, setSelectedReason] = useState<string>(DEFERRAL_REASONS[0]);
  const runOptions = useMemo(() => nextRunOptions(planningDate), [planningDate]);
  const [selectedRun, setSelectedRun] = useState<string | null>(null);
  const nextRun = selectedRun && runOptions.includes(selectedRun) ? selectedRun : runOptions[0];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);

  // Orders that cannot fit the active fleet under the planning constraints.
  const deferred = useMemo(() => (data ? allocateOrders(data.orders, data.vehicles).deferred : []), [data]);
  const q = searchQuery.toLowerCase();
  const filtered = deferred.filter(
    ({ order, reason }) =>
      !q || order.storeName.toLowerCase().includes(q) || order.orderNumber.toLowerCase().includes(q) || reason.toLowerCase().includes(q),
  );
  const selected = deferred.filter((d) => selectedIds.includes(d.order.id));
  const totals = deferralSummary(deferred);
  const selectedTotals = deferralSummary(selected);

  const toggle = (id: string) => setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleAll = () =>
    setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map((d) => d.order.id));

  const handleConfirm = async () => {
    if (selected.length === 0 || !nextRun) return;
    setIsSubmitting(true);
    try {
      const res = await submitDeferrals({
        orders: selected.map((d) => d.order),
        reason: selectedReason,
        rescheduledRun: nextRun,
        deferredBy: profile?.id,
      });
      setToast({ text: `Deferred ${res.count} orders to ${nextRun}. Store managers notified.`, ok: true });
      if (profile?.id) {
        recordUserActivity(profile.id, {
          title: `Deferred ${res.count} orders`,
          meta: `Reason: ${selectedReason} · Rescheduled: ${nextRun}`,
          type: "truck",
        });
      }
      setSelectedIds([]);
      reload();
    } catch (err: unknown) {
      setToast({ text: err instanceof Error ? err.message : "Failed to defer orders", ok: false });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-360 mx-auto space-y-6 pb-28 relative">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 ${toast.ok ? "bg-[#16A34A]" : "bg-red-600"} text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3`}>
          <Check className="w-5 h-5 shrink-0" />
          <p className="text-xs font-bold leading-relaxed">{toast.text}</p>
          <button onClick={() => setToast(null)} aria-label="Dismiss" className="p-1 hover:bg-white/20 rounded-lg transition-colors ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <PageHeader
        title="Deferral Manager"
        subtitle="Review orders that cannot be delivered in the current run"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        date={planningDate}
        onDateChange={(d) => {
          setPlanningDate(d);
          setSelectedIds([]);
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard
          icon={<Package className="w-5 h-5" strokeWidth={2} />}
          iconClass="bg-[#FFF8E6] text-amber-600"
          label="Orders Affected"
          value={totals.orders}
          caption={`Across ${totals.stores} store locations`}
          dotClass="bg-amber-500"
        />
        <KpiCard
          icon={<BarChart3 className="w-5 h-5" strokeWidth={2} />}
          iconClass="bg-[#FFF8E6] text-amber-600"
          label="Capacity Shortfall"
          value={`${totals.volumeM3.toFixed(1)} m³`}
          caption={`${totals.weightKg.toFixed(0)} kg not allocated`}
          dotClass="bg-amber-500"
        />
        <KpiCard
          icon={<MapPin className="w-5 h-5" strokeWidth={2} />}
          iconClass="bg-[#EFF6FF] text-blue-500"
          label="Estimated Impact"
          value={`${totals.stores} Stores`}
          caption="Managers will be notified"
          dotClass="bg-blue-500"
        />
      </div>

      <div className="bg-white rounded-3xl p-6 border border-[#E8E8E3]/80 shadow-[0_12px_40px_0_rgba(32,33,36,0.05)] space-y-4">
        <div>
          <h3 className="text-[18px] font-bold text-waypoint-text tracking-tight">Orders requiring review</h3>
          <p className="text-xs text-gray-400 font-medium mt-0.5">Pending orders the fleet cannot carry under capacity, temperature, van-only and window constraints</p>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <LoadingBlock label="Loading orders requiring review..." />
          ) : error ? (
            <ErrorBlock message={error} onRetry={reload} />
          ) : filtered.length === 0 ? (
            <EmptyBlock label={deferred.length === 0 ? "All pending orders fit the available fleet. Nothing to defer." : "No orders match your search."} />
          ) : (
            <DeferralTable items={filtered} selectedIds={selectedIds} onToggle={toggle} onToggleAll={toggleAll} />
          )}
        </div>
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-[94%] max-w-4xl">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl md:rounded-[22px] px-6 py-3.5 border border-[#E8E8E3] shadow-[0_16px_50px_0_rgba(0,0,0,0.12)] flex flex-wrap md:flex-nowrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[#FFF8E6] text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-4.5 h-4.5" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-bold text-waypoint-text leading-tight">Defer Selected Orders</p>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                {selectedTotals.orders} orders · {selectedTotals.volumeM3.toFixed(1)} m³ capacity
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <OptionPicker
              label="Reason"
              value={selectedReason}
              options={DEFERRAL_REASONS}
              onChange={setSelectedReason}
              icon={<ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
            />
            {nextRun && (
              <OptionPicker
                label="Next available run"
                value={nextRun}
                options={runOptions}
                onChange={setSelectedRun}
                icon={<Calendar className="w-3.5 h-3.5 text-gray-400" />}
                widthClass="w-52"
              />
            )}
            <div className="hidden lg:flex items-center gap-1.5 text-[10px] text-gray-400 max-w-32.5 leading-tight">
              <Bell className="w-3 h-3 text-gray-400 shrink-0" />
              <span>Store managers can see deferrals in their portal.</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 ml-auto">
            <button onClick={() => setSelectedIds([])} className="text-xs font-bold text-gray-500 hover:text-gray-800 px-3 py-2 transition-colors cursor-pointer">
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={selected.length === 0 || isSubmitting}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm ${
                selected.length > 0 && !isSubmitting ? "bg-waypoint-yellow hover:bg-[#F0B92B] text-waypoint-text cursor-pointer" : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>{isSubmitting ? "Processing..." : "Confirm Deferral"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DeferralManagerPage() {
  return (
    <Suspense fallback={<LoadingBlock label="Loading deferral manager..." />}>
      <DeferralManager />
    </Suspense>
  );
}
