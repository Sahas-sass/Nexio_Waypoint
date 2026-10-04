import { Search } from "lucide-react";
import { ORDER_STATUSES, type OrderFilters } from "../../utils/orders";

const selectClass =
  "bg-[#F5F4F0] rounded-full px-3 py-2 text-xs text-neutral-700 border border-transparent focus:outline-none focus:border-[#F5C242] capitalize";

export function OrderFiltersBar({ filters, onChange }: { filters: OrderFilters; onChange: (f: OrderFilters) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <div className="bg-[#F5F4F0] rounded-full px-4 py-2 flex-1 min-w-[200px] flex items-center gap-2.5 border border-transparent focus-within:border-[#F5C242] focus-within:bg-white transition-all">
        <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        <input
          type="search"
          aria-label="Search orders"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search order number or notes…"
          className="bg-transparent text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none w-full"
        />
      </div>
      <select aria-label="Status" value={filters.status} onChange={(e) => onChange({ ...filters, status: e.target.value as OrderFilters["status"] })} className={selectClass}>
        <option value="all">All statuses</option>
        {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <select aria-label="Temperature" value={filters.temp} onChange={(e) => onChange({ ...filters, temp: e.target.value as OrderFilters["temp"] })} className={selectClass}>
        <option value="all">All temps</option>
        <option value="ambient">Ambient</option>
        <option value="chilled">Chilled</option>
      </select>
    </div>
  );
}
