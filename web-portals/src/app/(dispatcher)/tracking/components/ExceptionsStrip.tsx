import { Check, Clock, WifiOff, AlertTriangle } from "lucide-react";
import type { RouteExceptionEvent } from "../../services/types";

export default function ExceptionsStrip({ exceptions }: { exceptions: RouteExceptionEvent[] }) {
  if (exceptions.length === 0) {
    return <div className="py-4 text-center text-xs text-gray-400">No recent route exceptions recorded.</div>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100 gap-4 md:gap-0 pt-2">
      {exceptions.slice(0, 3).map((exc, idx) => {
        const isSuccess = exc.severity === "success";
        const isCritical = exc.severity === "critical";
        const isWarning = !isSuccess && !isCritical;
        return (
          <div key={exc.id} className={`flex items-center gap-3.5 ${idx === 0 ? "md:pr-6" : idx === 1 ? "md:px-6" : "md:pl-6"} pt-3 md:pt-0`}>
            <span className="text-xs font-semibold text-gray-400 shrink-0 w-11">{exc.eventTime}</span>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isSuccess ? "bg-emerald-50 text-emerald-600" : isWarning ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-500"}`}>
              {isSuccess && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
              {isWarning && (exc.eventType === "delay" ? <Clock className="w-3.5 h-3.5" strokeWidth={2.5} /> : <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2.5} />)}
              {isCritical && <WifiOff className="w-3.5 h-3.5" strokeWidth={2.5} />}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-waypoint-text leading-tight truncate">{exc.title}</p>
              <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5">{exc.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
