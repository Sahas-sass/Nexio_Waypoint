import { AlertTriangle, Check, X } from "lucide-react";

export interface Banner {
  text: string;
  type: "success" | "warning" | "error";
}

export default function FeedbackBanner({ banner, onClose }: { banner: Banner; onClose: () => void }) {
  const style =
    banner.type === "success"
      ? "bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]"
      : banner.type === "warning"
        ? "bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]"
        : "bg-red-50 border-red-200 text-red-700";
  return (
    <div className={`mb-6 p-4 rounded-2xl flex items-center justify-between border shadow-sm ${style}`}>
      <div className="flex items-center gap-2.5">
        {banner.type === "success" ? <Check className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5" />}
        <span className="text-xs font-bold">{banner.text}</span>
      </div>
      <button onClick={onClose} aria-label="Dismiss" className="p-1 hover:bg-black/5 rounded-lg transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
