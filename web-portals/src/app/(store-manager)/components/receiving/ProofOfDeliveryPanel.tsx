import type { ProofOfDelivery } from "../../types";
import { formatDateTime } from "../../utils/dates";
import { outcomeTone } from "../../utils/tones";
import { StatusPill } from "../StatusPill";
import { EvidenceImage } from "./EvidenceImage";

export function ProofOfDeliveryPanel({ proof }: { proof: ProofOfDelivery | null }) {
  if (!proof) {
    return <p className="text-[11px] text-neutral-400 bg-[#F7F6F2] rounded-xl p-3">The driver has not recorded proof of delivery for this order.</p>;
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <StatusPill tone={outcomeTone(proof.outcome)}>{proof.outcome}</StatusPill>
        <span className="text-neutral-700">
          {proof.items_delivered ?? "?"} of {proof.items_expected ?? "?"} items delivered
        </span>
        <span className="text-neutral-400">· {formatDateTime(proof.captured_at)}</span>
        {proof.captured_offline && <span className="text-[11px] text-neutral-400">(captured offline)</span>}
      </div>
      {proof.notes && <p className="text-[11px] text-neutral-600 bg-[#F7F6F2] rounded-xl p-3">Driver note: {proof.notes}</p>}
      <div className="grid grid-cols-2 gap-3">
        <EvidenceImage refPath={proof.photo_url} label="Photo" />
        <EvidenceImage refPath={proof.signature_url} label="Signature" />
      </div>
    </div>
  );
}
