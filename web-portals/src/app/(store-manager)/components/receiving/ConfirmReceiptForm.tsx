"use client";

import { useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import { confirmReceipt } from "../../services/receiptsService";
import type { Order } from "../../types";
import { errorMessage } from "../../utils/errors";
import { ISSUE_TYPES, MAX_ISSUE_NOTE, validateReceiptForm, type ReceiptFormValues } from "../../utils/receiving";
import { FormField, inputClass } from "../FormField";

export function ConfirmReceiptForm({ order, defaultItems, onConfirmed }: {
  order: Order;
  defaultItems: number | null;
  onConfirmed: () => void;
}) {
  const [values, setValues] = useState<ReceiptFormValues>({
    itemsReceived: String(defaultItems ?? order.item_count ?? ""),
    issueType: "",
    issueNote: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const id = order.id;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const result = validateReceiptForm(order.id, order.item_count, values);
    setError(result.error);
    if (!result.input) return;
    setSubmitting(true);
    try {
      await confirmReceipt(result.input);
      onConfirmed();
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3" noValidate>
      <div className="grid grid-cols-2 gap-3">
        <FormField label={`Items received (of ${order.item_count ?? "?"})`} htmlFor={`items-${id}`}>
          <input id={`items-${id}`} type="number" min="0" step="1" max={order.item_count ?? undefined} value={values.itemsReceived}
            onChange={(e) => setValues((v) => ({ ...v, itemsReceived: e.target.value }))} className={inputClass} />
        </FormField>
        <FormField label="Issue (optional)" htmlFor={`issue-${id}`}>
          <select id={`issue-${id}`} value={values.issueType} onChange={(e) => setValues((v) => ({ ...v, issueType: e.target.value }))} className={inputClass}>
            <option value="">No issue</option>
            {ISSUE_TYPES.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
          </select>
        </FormField>
      </div>
      <FormField label="Note (optional)" htmlFor={`note-${id}`}>
        <textarea id={`note-${id}`} rows={2} maxLength={MAX_ISSUE_NOTE} value={values.issueNote}
          onChange={(e) => setValues((v) => ({ ...v, issueNote: e.target.value }))} className={inputClass} />
      </FormField>
      {error && <p className="text-[11px] text-red-600 bg-red-50 rounded-xl p-3" role="alert">{error}</p>}
      <button type="submit" disabled={submitting}
        className="w-full py-2.5 rounded-xl bg-[#F5C242] hover:bg-[#eab308] disabled:opacity-60 text-neutral-900 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs">
        <Check className="w-3.5 h-3.5" />
        <span>{submitting ? "Confirming…" : "Confirm receipt"}</span>
      </button>
    </form>
  );
}
