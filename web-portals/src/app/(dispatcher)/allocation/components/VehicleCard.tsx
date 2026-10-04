import type { VehiclePlan } from "../../utils/allocation";
import { planUtilisation } from "../../utils/allocation";
import CapacityBar from "../../components/CapacityBar";

export default function VehicleCard({ plan, highlighted }: { plan: VehiclePlan; highlighted: boolean }) {
  const veh = plan.vehicle;
  const { weightPercent, volumePercent } = planUtilisation(plan);
  const subtitle = [veh.vehicleType, veh.driverName, veh.tripNumber].filter(Boolean).join(" · ");

  return (
    <div className={`flex flex-col p-4 bg-white rounded-2xl border shadow-sm transition-colors ${highlighted ? "border-waypoint-yellow ring-4 ring-[#FFF8E6]/60" : "border-gray-200 hover:border-gray-300"}`}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-[14px] overflow-hidden shrink-0 border border-gray-100 bg-gray-100 shadow-2xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={veh.image} alt={veh.plateNumber} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-bold text-waypoint-text leading-tight">{veh.plateNumber}</span>
              {veh.isRefrigerated && <span className="px-2 py-0.5 bg-[#EAF5FF] text-[#3B82F6] rounded-md text-[10px] font-extrabold uppercase">Reefer</span>}
            </div>
            <span className="text-[12px] font-medium text-gray-400 mt-0.5">{subtitle}</span>
          </div>
        </div>
        <span className="text-[12px] font-bold text-gray-400">{veh.departureTime ?? "No trip yet"}</span>
      </div>

      <div className="flex flex-col gap-2.5">
        <CapacityBar label="Weight" percent={weightPercent} />
        <CapacityBar label="Volume" percent={volumePercent} />
      </div>

      {plan.orders.length > 0 && (
        <ol className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-1">
          {plan.orders.map((o, i) => (
            <li key={o.id} className="text-[11px] font-medium text-gray-500 flex justify-between">
              <span>
                <span className="font-bold text-waypoint-text">{i + 1}.</span> {o.storeName} · {o.orderNumber}
              </span>
              <span>{o.windowStart ?? o.deliveryWindow}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
