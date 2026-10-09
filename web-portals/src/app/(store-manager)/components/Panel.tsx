import type { ReactNode } from "react";

export function Panel({ title, subtitle, action, children, className = "" }: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`bg-white p-6 rounded-2xl border border-[#ECEAE4] shadow-[0_1px_3px_rgba(0,0,0,0.02)] ${className}`}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            {title && <h2 className="text-base font-bold text-neutral-900">{title}</h2>}
            {subtitle && <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
