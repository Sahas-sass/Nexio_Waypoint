import { AlertTriangle, Loader2 } from "lucide-react";

export function LoadingBlock({ label }: { label: string }) {
  return (
    <div className="py-16 flex items-center justify-center gap-2 text-gray-400">
      <Loader2 className="w-5 h-5 animate-spin text-waypoint-orange" />
      <span className="text-xs font-semibold">{label}</span>
    </div>
  );
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="py-10 flex flex-col items-center justify-center gap-3 text-center">
      <div className="flex items-center gap-2 text-red-600">
        <AlertTriangle className="w-4 h-4" />
        <span className="text-xs font-bold">{message}</span>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="text-xs font-bold text-waypoint-orange hover:text-amber-600 cursor-pointer">
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyBlock({ label }: { label: string }) {
  return <div className="py-10 text-center text-xs text-gray-400">{label}</div>;
}
