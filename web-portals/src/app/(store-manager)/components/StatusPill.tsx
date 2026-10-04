export type Tone = "green" | "amber" | "yellow" | "red" | "neutral" | "blue";

const TONES: Record<Tone, { pill: string; dot: string }> = {
  green: { pill: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-600" },
  amber: { pill: "bg-amber-50 text-amber-700", dot: "bg-amber-600" },
  yellow: { pill: "bg-[#FDF6E2] text-amber-800", dot: "bg-amber-600" },
  red: { pill: "bg-red-50 text-red-700", dot: "bg-red-600" },
  blue: { pill: "bg-sky-50 text-sky-700", dot: "bg-sky-600" },
  neutral: { pill: "bg-[#F5F4F0] text-neutral-600", dot: "bg-neutral-400" },
};

export function StatusPill({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  const t = TONES[tone];
  return (
    <span className={`${t.pill} text-[11px] font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 whitespace-nowrap capitalize`}>
      <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />
      {children}
    </span>
  );
}
