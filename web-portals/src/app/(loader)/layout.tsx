"use client";

import { useState } from "react";
import { Tablet, Maximize2 } from "lucide-react";

export default function LoaderLayout({ children }: { children: React.ReactNode }) {
  const [tabletFrame, setTabletFrame] = useState(false);

  return (
    <div className={`min-h-screen bg-[#EFEFEA] flex flex-col font-sans transition-all duration-300 ${
      tabletFrame ? "p-4 sm:p-10 flex items-center justify-center bg-gray-950" : ""
    }`}>
      {/* Prototype Frame Switcher (Fixed top right on desktop) */}
      <div className="fixed top-3 right-4 z-50 hidden md:flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-200/90 shadow-sm text-xs font-semibold text-gray-700">
        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Device View:</span>
        <button
          onClick={() => setTabletFrame(false)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all ${
            !tabletFrame ? "bg-waypoint-yellow text-waypoint-text shadow-xs font-bold" : "hover:bg-gray-100 text-gray-600"
          }`}
        >
          <Maximize2 className="w-3.5 h-3.5" /> Normal
        </button>
        <button
          onClick={() => setTabletFrame(true)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all ${
            tabletFrame ? "bg-waypoint-yellow text-waypoint-text shadow-xs font-bold" : "hover:bg-gray-100 text-gray-600"
          }`}
        >
          <Tablet className="w-3.5 h-3.5" /> Tablet Frame
        </button>
      </div>

      {/* Main Container matching the screenshot's portrait tablet proportions */}
      <div className={`w-full bg-[#FAFAF7] transition-all duration-300 mx-auto ${
        tabletFrame 
          ? "max-w-[440px] min-h-[920px] rounded-[44px] shadow-2xl border-[14px] border-gray-900 overflow-hidden relative ring-1 ring-white/10 p-5 pb-24" 
          : "max-w-[460px] min-h-screen p-4 sm:p-6 pb-28 shadow-lg"
      }`}>
        {children}
      </div>
    </div>
  );
}
