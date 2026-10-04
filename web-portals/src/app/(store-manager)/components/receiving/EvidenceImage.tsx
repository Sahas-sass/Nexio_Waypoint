"use client";

import { useCallback } from "react";
import { useAsyncData } from "../../hooks/useAsyncData";
import { getEvidenceUrl } from "../../services/deliveriesService";

/** Shows a POD photo/signature; storage paths are resolved to short-lived signed URLs. */
export function EvidenceImage({ refPath, label }: { refPath: string | null; label: string }) {
  const loader = useCallback(() => getEvidenceUrl(refPath), [refPath]);
  const { data: url, loading, error } = useAsyncData(loader);

  return (
    <figure className="rounded-xl border border-[#ECEAE4] bg-[#FCFBF9] overflow-hidden">
      <div className="h-32 flex items-center justify-center bg-white">
        {!refPath ? (
          <span className="text-[11px] text-neutral-400">No {label.toLowerCase()} captured</span>
        ) : loading ? (
          <span className="text-[11px] text-neutral-400">Loading…</span>
        ) : error || !url ? (
          <span className="text-[11px] text-red-600">{error ?? "Unavailable"}</span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- signed storage URLs are not known to next/image
          <img src={url} alt={label} className="max-h-32 w-full object-contain" />
        )}
      </div>
      <figcaption className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 px-3 py-2 border-t border-[#ECEAE4]">{label}</figcaption>
    </figure>
  );
}
