"use client";

import { useMemo, useState } from "react";
import { Sparkles, AlertTriangle, Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/app/profile/useUserProfile";
import { recordUserActivity } from "@/app/profile/activityLogger";
import PageHeader from "../components/PageHeader";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../components/StatusBlocks";
import { usePlanningData } from "../hooks/usePlanningData";
import { publishAllocation } from "../services/planningService";
import { allocateOrders, type AllocationResult, type VehiclePlan } from "../utils/allocation";
import { isoDate } from "../utils/format";
import OrderCard from "./components/OrderCard";
import VehicleCard from "./components/VehicleCard";
import FeedbackBanner, { type Banner } from "./components/FeedbackBanner";

const CARD = "flex flex-col gap-4 p-5 bg-white rounded-3xl border-[1.6px] border-[#E8E8E3]/80 shadow-[0_12px_40px_0_rgba(32,33,36,0.05)]";

export default function AllocationPage() {
  const router = useRouter();
  const { profile } = useUserProfile();
  const [planningDate, setPlanningDate] = useState(() => isoDate(new Date(), 1));
  const { data, loading, error, reload } = usePlanningData(planningDate);
  const [plan, setPlan] = useState<{ key: string; result: AllocationResult } | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const orders = useMemo(() => data?.orders ?? [], [data]);
  const vehicles = useMemo(() => data?.vehicles ?? [], [data]);
  // A computed plan is only valid for the data it was computed from.
  const result = plan && plan.key === planningDate && data ? plan.result : null;

  const plans: VehiclePlan[] = result?.plans ?? vehicles.map((vehicle) => ({ vehicle, orders: [], weightKg: 0, volumeM3: 0 }));
  const deferredReason = useMemo(() => new Map(result?.deferred.map((d) => [d.order.id, d.reason]) ?? []), [result]);
  const vehicleOfSelected = result?.plans.find((p) => p.orders.some((o) => o.id === selectedOrderId))?.vehicle.id;
  const totalVolume = orders.reduce((sum, o) => sum + o.totalVolumeM3, 0);

  const q = searchQuery.toLowerCase();
  const filteredOrders = orders.filter((o) => !q || o.storeName.toLowerCase().includes(q) || o.orderNumber.toLowerCase().includes(q));
  const filteredPlans = plans.filter((p) => !q || p.vehicle.plateNumber.toLowerCase().includes(q) || p.vehicle.vehicleType.toLowerCase().includes(q));

  const handleAutoAllocate = () => {
    const res = allocateOrders(orders, vehicles);
    setPlan({ key: planningDate, result: res });
    setBanner({
      text: `Allocated ${res.assignedCount} of ${orders.length} orders. ${res.deferred.length} order${res.deferred.length === 1 ? "" : "s"} cannot fit and will be deferred.`,
      type: res.deferred.length > 0 ? "warning" : "success",
    });
  };

  const handlePublishPlan = async () => {
    if (!result) return;
    setIsPublishing(true);
    try {
      const res = await publishAllocation(planningDate, result, profile?.id);
      setBanner({ text: `Plan published: ${res.assignedCount} orders on ${res.tripsCount} trips, ${res.deferredCount} deferred.`, type: "success" });
      if (profile?.id) {
        recordUserActivity(profile.id, {
          title: "Published Daily Delivery Plan",
          meta: `${res.assignedCount} orders on ${res.tripsCount} trips · ${res.deferredCount} deferred`,
          type: "check",
        });
      }
      setPlan(null);
      reload();
    } catch (err: unknown) {
      setBanner({ text: err instanceof Error ? err.message : "Failed to publish plan", type: "error" });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="relative min-h-screen pb-32">
      {banner && <FeedbackBanner banner={banner} onClose={() => setBanner(null)} />}

      <PageHeader
        title="Allocation & Planning"
        subtitle="Assign confirmed orders to available vehicles"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        date={planningDate}
        onDateChange={(d) => {
          setPlanningDate(d);
          setBanner(null);
        }}
        actions={
          <button
            onClick={handleAutoAllocate}
            disabled={loading || orders.length === 0 || vehicles.length === 0}
            className="bg-waypoint-yellow hover:bg-[#F0B92B] text-waypoint-text px-5 h-10 rounded-xl font-bold text-[13px] flex items-center gap-2 transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4" />
            <span>Auto Allocate</span>
          </button>
        }
      />

      {error ? (
        <div className={CARD}>
          <ErrorBlock message={error} onRetry={reload} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-6">
          <div className={CARD}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-[18px] font-bold text-waypoint-text mb-0.5">Unassigned Orders</h3>
                <p className="text-[12px] text-gray-400 font-medium">
                  {orders.length} orders · {totalVolume.toFixed(1)} m³ total
                </p>
              </div>
              <div className="w-6 h-6 bg-[#FFF8E6] text-waypoint-orange rounded-md flex items-center justify-center text-[11px] font-bold">{orders.length}</div>
            </div>
            <div className="flex flex-col gap-3 overflow-y-auto pr-1 max-h-155">
              {loading ? (
                <LoadingBlock label="Loading unassigned orders..." />
              ) : filteredOrders.length === 0 ? (
                <EmptyBlock label={orders.length === 0 ? "No pending orders for this date." : "No orders match your search."} />
              ) : (
                filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    selected={selectedOrderId === order.id}
                    deferralReason={deferredReason.get(order.id)}
                    onSelect={() => setSelectedOrderId(order.id)}
                  />
                ))
              )}
            </div>
          </div>

          <div className={CARD}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-[18px] font-bold text-waypoint-text mb-0.5">Vehicle Allocation</h3>
                <p className="text-[12px] text-gray-400 font-medium">{vehicles.length} active vehicles</p>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`w-1.5 h-1.5 rounded-full ${result ? "bg-waypoint-orange" : "bg-emerald-500"}`}></span>
                <span className="text-[11px] font-bold text-gray-500">{result ? "Proposed plan" : "Committed load"}</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 overflow-y-auto max-h-155">
              {loading ? (
                <LoadingBlock label="Loading vehicle capacities..." />
              ) : filteredPlans.length === 0 ? (
                <EmptyBlock label={vehicles.length === 0 ? "No active vehicles." : "No vehicles match your search."} />
              ) : (
                filteredPlans.map((p) => <VehicleCard key={p.vehicle.id} plan={p} highlighted={p.vehicle.id === vehicleOfSelected} />)
              )}
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-6 left-28 right-8 z-30 pointer-events-none flex justify-center">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-gray-200 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] px-8 py-4 flex items-center justify-between gap-16 pointer-events-auto max-w-4xl w-full">
          <div className="flex items-center gap-8">
            <p className="text-[13px] font-bold text-waypoint-text">
              {orders.length} <span className="font-medium text-gray-500">orders in queue</span>
            </p>
            <p className="text-[13px] font-bold text-waypoint-text">
              {vehicles.length} <span className="font-medium text-gray-500">vehicles available</span>
            </p>
            {result && (
              <p className="text-[13px] font-bold text-waypoint-orange flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-waypoint-orange"></span>
                <span>{result.deferred.length} to defer</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/deferrals?date=${planningDate}`)}
              className="flex items-center gap-2 h-10 px-5 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-bold text-[13px] text-waypoint-text cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Manage Deferrals
            </button>
            <button
              onClick={handlePublishPlan}
              disabled={!result || isPublishing}
              title={result ? "Commit this plan" : "Run Auto Allocate first"}
              className="flex items-center gap-2 h-10 px-6 bg-waypoint-yellow hover:bg-[#F0B92B] rounded-xl transition-colors font-bold text-[13px] text-waypoint-text shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>{isPublishing ? "Committing..." : "Publish Plan"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
