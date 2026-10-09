import type { FleetCapacityItem } from "../../services/types";
import CapacityBar from "../../components/CapacityBar";
import { EmptyBlock } from "../../components/StatusBlocks";

export default function FleetCapacityList({ fleet, onOpen, emptyLabel }: { fleet: FleetCapacityItem[]; onOpen: () => void; emptyLabel: string }) {
  if (fleet.length === 0) return <EmptyBlock label={emptyLabel} />;
  return (
    <div className="flex flex-col gap-5">
      {fleet.map((veh) => (
        <div
          key={veh.id}
          onClick={onOpen}
          className="flex flex-col gap-3 pb-5 border-b border-[#E8E8E3]/60 last:border-b-0 last:pb-0 cursor-pointer group hover:bg-gray-50/40 p-1.5 -m-1.5 rounded-2xl transition-all"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-[14px] overflow-hidden shrink-0 border border-gray-100 bg-gray-100 shadow-2xs group-hover:ring-2 group-hover:ring-waypoint-yellow/60 transition-all">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={veh.image} alt={veh.plate} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="flex flex-col pt-0.5 min-w-0">
                <span className="text-[14px] font-bold text-waypoint-text leading-tight group-hover:text-waypoint-orange transition-colors">{veh.plate}</span>
                <span className="text-[12px] font-medium text-gray-400 mt-0.5 truncate max-w-44">{veh.model}</span>
              </div>
            </div>
            <span className="text-[15px] font-bold text-waypoint-text shrink-0">{veh.volumePercent}%</span>
          </div>
          <div className="flex flex-col gap-2.5 pl-1">
            <CapacityBar label="Weight" percent={veh.weightPercent} compact />
            <CapacityBar label="Volume" percent={veh.volumePercent} compact />
          </div>
        </div>
      ))}
    </div>
  );
}
