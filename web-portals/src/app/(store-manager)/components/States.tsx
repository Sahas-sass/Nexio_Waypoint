import { Inbox, Loader2, TriangleAlert } from "lucide-react";

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-xs text-neutral-400" role="status">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center" role="alert">
      <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
        <TriangleAlert className="w-5 h-5" />
      </div>
      <p className="text-xs text-neutral-600 max-w-sm">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-4 py-2 rounded-xl border border-[#E5E2DC] bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <div className="w-10 h-10 rounded-xl bg-[#F5F4F0] text-neutral-400 flex items-center justify-center">
        <Inbox className="w-5 h-5" />
      </div>
      <p className="text-xs font-semibold text-neutral-700">{title}</p>
      {hint && <p className="text-[11px] text-neutral-400 max-w-sm">{hint}</p>}
    </div>
  );
}

interface AsyncViewProps<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  isEmpty?: (data: T) => boolean;
  empty?: { title: string; hint?: string };
  children: (data: T) => React.ReactNode;
}

/** Renders loading / error / empty states around data-driven content. */
export function AsyncView<T>({ data, loading, error, onRetry, isEmpty, empty, children }: AsyncViewProps<T>) {
  if (error && data === null) return <ErrorState message={error} onRetry={onRetry} />;
  if (data === null) return loading ? <LoadingState /> : null;
  if (isEmpty?.(data) && empty) return <EmptyState title={empty.title} hint={empty.hint} />;
  return <>{children(data)}</>;
}
