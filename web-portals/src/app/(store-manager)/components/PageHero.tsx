import type { ReactNode } from "react";

/** Dark headline band used at the top of each store-manager page. */
export function PageHero({ eyebrow, title, subtitle, action }: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <section className="bg-[#1C1C1C] text-white px-8 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        {eyebrow && <div className="text-[10px] font-semibold tracking-widest text-[#F5C242] uppercase">{eyebrow}</div>}
        <h1 className="text-2xl font-bold mt-1 tracking-tight text-white">{title}</h1>
        {subtitle && <p className="text-xs text-neutral-400 mt-1">{subtitle}</p>}
      </div>
      {action}
    </section>
  );
}
