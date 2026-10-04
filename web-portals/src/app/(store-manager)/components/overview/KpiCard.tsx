import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";

export function KpiCard({ href, icon: Icon, iconClass, label, value, hint }: {
  href: string;
  icon: LucideIcon;
  iconClass: string;
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white px-5 py-4 rounded-2xl border border-[#ECEAE4] flex items-center justify-between hover:shadow-md hover:border-neutral-300 transition-all group"
    >
      <div className="flex items-center gap-4">
        <div className={`${iconClass} w-11 h-11 rounded-xl flex items-center justify-center shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">{label}</div>
          <div className="flex items-baseline mt-0.5">
            <span className="text-2xl font-bold text-neutral-900">{value}</span>
            <span className="text-xs text-neutral-400 ml-2">{hint}</span>
          </div>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
    </Link>
  );
}
