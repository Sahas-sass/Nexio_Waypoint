"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Check, Info } from "lucide-react";
import { placeOrder } from "../../services/ordersService";
import type { Order } from "../../types";
import { earliestDeliveryDate } from "../../utils/dates";
import { errorMessage } from "../../utils/errors";
import { emptyOrderForm, ORDER_LIMITS, validateOrderForm, type OrderFormErrors, type OrderFormValues } from "../../utils/orderValidation";
import { FormField, inputClass } from "../FormField";
import { Panel } from "../Panel";

export function PlaceOrderForm({ now, onPlaced }: { now: Date; onPlaced: (order: Order) => void }) {
  const [values, setValues] = useState<OrderFormValues>(() => emptyOrderForm(now));
  const [errors, setErrors] = useState<OrderFormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (field: keyof OrderFormValues) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [field]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setSuccess(null);
    const result = validateOrderForm(values, new Date());
    setErrors(result.errors);
    if (!result.input) return;
    setSubmitting(true);
    try {
      const order = await placeOrder(result.input);
      setSuccess(`Order ${order.order_number} placed for ${order.target_delivery_date}.`);
      setValues(emptyOrderForm(new Date()));
      onPlaced(order);
    } catch (err) {
      setServerError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Panel title="Place order" subtitle="Sent to warehouse planning">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="flex gap-2 bg-[#FDF6E2] text-amber-900 rounded-xl p-3 text-[11px]">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>Orders placed before 4:00 PM (Sri Lanka time) can be delivered the next day; later orders from the day after.</span>
        </div>
        <FormField label="Delivery date" htmlFor="targetDate" error={errors.targetDate}>
          <input id="targetDate" type="date" min={earliestDeliveryDate(now)} value={values.targetDate} onChange={set("targetDate")} className={inputClass} />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Temperature" htmlFor="temp" error={errors.temp}>
            <select id="temp" value={values.temp} onChange={set("temp")} className={inputClass}>
              <option value="ambient">Ambient</option>
              <option value="chilled">Chilled</option>
            </select>
          </FormField>
          <FormField label="Priority" htmlFor="priority" error={errors.priority}>
            <select id="priority" value={values.priority} onChange={set("priority")} className={inputClass}>
              <option value="High">High</option>
              <option value="Standard">Standard</option>
              <option value="Low">Low</option>
            </select>
          </FormField>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <FormField label="Weight (kg)" htmlFor="weightKg" error={errors.weightKg}>
            <input id="weightKg" type="number" min="0" step="0.1" max={ORDER_LIMITS.maxWeightKg} value={values.weightKg} onChange={set("weightKg")} className={inputClass} />
          </FormField>
          <FormField label="Volume (m³)" htmlFor="volumeM3" error={errors.volumeM3}>
            <input id="volumeM3" type="number" min="0" step="0.01" max={ORDER_LIMITS.maxVolumeM3} value={values.volumeM3} onChange={set("volumeM3")} className={inputClass} />
          </FormField>
          <FormField label="Items" htmlFor="itemCount" error={errors.itemCount}>
            <input id="itemCount" type="number" min="1" step="1" max={ORDER_LIMITS.maxItems} value={values.itemCount} onChange={set("itemCount")} className={inputClass} />
          </FormField>
        </div>
        <FormField label="Notes (optional)" htmlFor="notes" error={errors.notes}>
          <textarea id="notes" rows={3} maxLength={ORDER_LIMITS.maxNotes} value={values.notes} onChange={set("notes")} className={inputClass} />
        </FormField>

        {serverError && <p className="text-[11px] text-red-600 bg-red-50 rounded-xl p-3" role="alert">{serverError}</p>}
        {success && (
          <p className="text-[11px] text-emerald-700 bg-emerald-50 rounded-xl p-3 flex items-center gap-2" role="status">
            <Check className="w-3.5 h-3.5" /> {success}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-xl bg-[#F5C242] hover:bg-[#eab308] disabled:opacity-60 text-neutral-900 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
        >
          <span>{submitting ? "Placing order…" : "Place order"}</span>
          {!submitting && <ArrowRight className="w-3.5 h-3.5" />}
        </button>
      </form>
    </Panel>
  );
}
