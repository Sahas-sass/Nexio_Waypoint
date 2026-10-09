import { ArrowRight, AlertTriangle, BarChart2, Clock } from "lucide-react";
import type { OperationalAlert } from "../../services/types";
import { EmptyBlock } from "../../components/StatusBlocks";

export default function AlertsGrid({ alerts, onOpen }: { alerts: OperationalAlert[]; onOpen: (alert: OperationalAlert) => void }) {
  if (alerts.length === 0) return <EmptyBlock label="No operational alerts. Everything is on track." />;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          onClick={() => onOpen(alert)}
          className={`flex min-h-20 p-3.5 items-center gap-3.5 rounded-[20px] border-[1.6px] border-[#E8E8E3] transition-all cursor-pointer hover:border-amber-300 hover:shadow-xs group ${alert.type === "time" ? "bg-[#FFFCF5]" : "bg-white"}`}
        >
          <div className="w-11 h-11 bg-[#FFF8E6] text-waypoint-orange rounded-[14px] flex items-center justify-center shrink-0 group-hover:bg-[#FEF3C7] transition-colors">
            {alert.type === "capacity" && <BarChart2 className="w-5 h-5" strokeWidth={2} />}
            {alert.type === "time" && <Clock className="w-5 h-5" strokeWidth={2} />}
            {alert.type === "review" && <AlertTriangle className="w-5 h-5" strokeWidth={2} />}
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <p className="text-[13px] font-bold text-waypoint-text leading-tight mb-0.5 truncate group-hover:text-amber-800 transition-colors">{alert.title}</p>
            <p className="text-[11px] font-medium text-gray-400 truncate">{alert.description}</p>
          </div>
          <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-waypoint-text group-hover:bg-waypoint-yellow group-hover:border-waypoint-yellow transition-colors shrink-0">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      ))}
    </div>
  );
}
