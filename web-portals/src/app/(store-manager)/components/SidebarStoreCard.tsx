"use client";

import { formatWindow } from "../utils/dates";
import { useStore } from "./StoreProvider";

export function SidebarStoreCard() {
  const { store } = useStore();
  return (
    <div className="bg-[#1C1C1C] text-white p-4 rounded-2xl shadow-sm">
      <p className="text-[11px] text-neutral-400 font-normal">Delivery window</p>
      <p className="text-xs font-semibold mt-0.5 text-white">
        {formatWindow(store.delivery_window_start, store.delivery_window_end)}
      </p>
      {store.access_conditions && <p className="text-[11px] text-neutral-400 mt-2">{store.access_conditions}</p>}
    </div>
  );
}
