import type { OrderQueueItem } from "../../services/types";
import { EmptyBlock, LoadingBlock } from "../../components/StatusBlocks";

export default function OrderQueueTable({ orderQueue, loading }: { orderQueue: OrderQueueItem[]; loading: boolean }) {
  return (
    <>
      <div className="grid grid-cols-[2.5fr_1.5fr_1.5fr_1fr_1fr] w-full bg-[#FAF9F7] px-6 py-3 border-y border-[#E8E8E3]/80">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Store</div>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Delivery Window</div>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Temperature</div>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Size</div>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</div>
      </div>
      {loading ? (
        <LoadingBlock label="Loading orders..." />
      ) : orderQueue.length === 0 ? (
        <EmptyBlock label="No orders found in queue." />
      ) : (
        orderQueue.map((order) => (
          <div
            key={order.id}
            className="grid grid-cols-[2.5fr_1.5fr_1.5fr_1fr_1fr] items-center w-full px-6 py-4 border-b border-[#E8E8E3]/60 hover:bg-gray-50/50 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#FFF8E6] text-waypoint-orange font-bold text-sm flex items-center justify-center shrink-0 border border-amber-200/50">
                {order.storeInitial}
              </div>
              <div>
                <span className="text-[13px] font-bold text-waypoint-text leading-tight block">{order.storeName}</span>
                <span className="text-[10px] text-gray-400 font-medium">{order.orderNumber}</span>
              </div>
            </div>
            <div className="text-[13px] font-medium text-gray-500">{order.timeWindow}</div>
            <div>
              <span className={`inline-flex px-3 py-1 text-[11px] font-bold rounded-full ${order.tempRequirement === "chilled" ? "bg-[#EAF5FF] text-[#3B82F6]" : "bg-[#F3F4F6] text-gray-500"}`}>
                {order.tempRequirement === "chilled" ? "Chilled" : "Ambient"}
              </span>
            </div>
            <div className="text-[13px] font-medium text-gray-500">{order.volumeM3} m³</div>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${order.status === "Pending" ? "bg-waypoint-orange" : "bg-waypoint-success"}`}></span>
              <span className={`text-[13px] font-bold ${order.status === "Pending" ? "text-waypoint-orange" : "text-waypoint-success"}`}>{order.status}</span>
            </div>
          </div>
        ))
      )}
    </>
  );
}
