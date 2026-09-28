"use client";

import { useState } from "react";
import { 
  Truck, 
  Clock, 
  MapPin, 
  Package, 
  ArrowRight, 
  AlertTriangle, 
  Layers, 
  CheckCircle2, 
  ArrowLeft, 
  Barcode, 
  Thermometer, 
  ShieldCheck, 
  X, 
  Check, 
  Sparkles,
  ChevronDown
} from "lucide-react";

// Types
interface PalletItem {
  id: string;
  sku: string;
  name: string;
  category: "ambient" | "chilled" | "frozen";
  tempReq?: string;
  weightKg: number;
  verified: boolean;
}

interface StopGroup {
  stopNumber: number;
  loadSequence: number;
  storeName: string;
  location: string;
  pallets: PalletItem[];
}

interface VehicleCardData {
  id: string;
  code: string;
  dock: string;
  statusText: string;
  statusType: "ready_to_load" | "ready" | "chilled_load" | "dispatched";
  vehicleType: string;
  tags: string[];
  departure: string;
  stopsCount: number;
  ordersCount: number;
  image: string;
  isFeatured?: boolean;
  stops: StopGroup[];
}

const VEHICLES_DATA: VehicleCardData[] = [
  {
    id: "trk-024",
    code: "TRK-024",
    dock: "DOCK 04",
    statusText: "READY TO LOAD",
    statusType: "ready_to_load",
    vehicleType: "Heavy Freight Truck",
    tags: ["Fresh", "Style"],
    departure: "06:30 AM",
    stopsCount: 6,
    ordersCount: 18,
    image: "/truck_scania.png",
    isFeatured: true,
    stops: [
      {
        stopNumber: 6,
        loadSequence: 1,
        storeName: "Colombo South Superstore",
        location: "Wellawatte, Colombo 06",
        pallets: [
          { id: "p1", sku: "SKU-9921-A", name: "Fresh Dairy Cheeses", category: "chilled", tempReq: "4°C", weightKg: 380, verified: true },
          { id: "p2", sku: "SKU-9921-B", name: "Frozen Meat Cuts", category: "frozen", tempReq: "-18°C", weightKg: 520, verified: true },
          { id: "p3", sku: "SKU-9921-C", name: "Dry Bakery Staples", category: "ambient", weightKg: 290, verified: false },
        ]
      },
      {
        stopNumber: 5,
        loadSequence: 2,
        storeName: "Havelock Town Branch",
        location: "Havelock Rd, Colombo 05",
        pallets: [
          { id: "p4", sku: "SKU-8820-A", name: "Orchard Fresh Produce", category: "ambient", weightKg: 310, verified: true },
          { id: "p5", sku: "SKU-8820-B", name: "Ice Cream Confections", category: "frozen", tempReq: "-18°C", weightKg: 240, verified: false },
        ]
      },
      {
        stopNumber: 1,
        loadSequence: 3,
        storeName: "Downtown Flagship Hub",
        location: "Union Place, Colombo 02",
        pallets: [
          { id: "p6", sku: "SKU-1205-A", name: "Daily Vegetables Crate", category: "ambient", weightKg: 250, verified: false },
          { id: "p7", sku: "SKU-1205-B", name: "Chilled Deli Packs", category: "chilled", tempReq: "4°C", weightKg: 210, verified: false },
        ]
      }
    ]
  },
  {
    id: "van-012",
    code: "VAN-012",
    dock: "DOCK 05",
    statusText: "READY",
    statusType: "ready",
    vehicleType: "Delivery Van",
    tags: ["Style"],
    departure: "07:00 AM",
    stopsCount: 4,
    ordersCount: 9,
    image: "/van_white.png",
    stops: [
      {
        stopNumber: 4,
        loadSequence: 1,
        storeName: "Kollupitiya Metro Store",
        location: "Kollupitiya, Colombo 03",
        pallets: [
          { id: "p8", sku: "SKU-5501-A", name: "Chilled Deli Goods", category: "chilled", tempReq: "4°C", weightKg: 260, verified: false },
          { id: "p9", sku: "SKU-5501-B", name: "Artisan Bread Packs", category: "ambient", weightKg: 180, verified: false },
        ]
      },
      {
        stopNumber: 1,
        loadSequence: 2,
        storeName: "Fort Central Pantry",
        location: "York St, Colombo 01",
        pallets: [
          { id: "p10", sku: "SKU-1901-A", name: "Daily Grocery Parcels", category: "ambient", weightKg: 220, verified: false },
        ]
      }
    ]
  },
  {
    id: "trk-019",
    code: "TRK-019",
    dock: "DOCK 05",
    statusText: "CHILLED LOAD",
    statusType: "chilled_load",
    vehicleType: "Refrigerated Truck",
    tags: ["Chilled"],
    departure: "07:15 AM",
    stopsCount: 5,
    ordersCount: 14,
    image: "/truck_semi.png",
    stops: [
      {
        stopNumber: 5,
        loadSequence: 1,
        storeName: "Bambalapitiya Market",
        location: "Galle Rd, Colombo 04",
        pallets: [
          { id: "p11", sku: "SKU-4211-A", name: "Frozen Seafood Pallet", category: "frozen", tempReq: "-18°C", weightKg: 420, verified: false },
          { id: "p12", sku: "SKU-4211-B", name: "Chilled Dairy Milk", category: "chilled", tempReq: "4°C", weightKg: 350, verified: false },
        ]
      }
    ]
  }
];

export default function TripQueuePage() {
  const [vehicles, setVehicles] = useState<VehicleCardData[]>(VEHICLES_DATA);
  const [activeTab, setActiveTab] = useState<"trips" | "loading" | "issues">("trips");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("trk-024");
  
  // Verification Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sealNumber, setSealNumber] = useState("SL-892301-X");
  const [hasDiscrepancy, setHasDiscrepancy] = useState(false);
  const [discrepancyNote, setDiscrepancyNote] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];
  const allPallets = selectedVehicle.stops.flatMap((s) => s.pallets);
  const verifiedCount = allPallets.filter((p) => p.verified).length;
  const totalCount = allPallets.length;
  const progressPercent = totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 0;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTogglePallet = (palletId: string) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id !== selectedVehicleId) return v;
        return {
          ...v,
          stops: v.stops.map((s) => ({
            ...s,
            pallets: s.pallets.map((p) =>
              p.id === palletId ? { ...p, verified: !p.verified } : p
            )
          }))
        };
      })
    );
  };

  const handleStartLoading = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    setActiveTab("loading");
  };

  const handleConfirmSeal = () => {
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === selectedVehicleId
          ? {
              ...v,
              statusText: "DISPATCHED",
              statusType: "dispatched",
              stops: v.stops.map((s) => ({
                ...s,
                pallets: s.pallets.map((p) => ({ ...p, verified: true }))
              }))
            }
          : v
      )
    );
    setIsModalOpen(false);
    showToast(`Vehicle ${selectedVehicle.code} sealed with #${sealNumber} and cleared!`);
    setActiveTab("trips");
  };

  return (
    <div className="space-y-4">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-[#1E1E1E] text-white px-4 py-2.5 rounded-full shadow-xl border border-gray-700 flex items-center gap-2 text-xs font-bold animate-in fade-in zoom-in duration-150">
          <Sparkles className="w-3.5 h-3.5 text-[#FFC83D]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* HEADER SECTION (Waypoint Logistics • Dock: 04 • Online • Alex) */}
      {/* ========================================================= */}
      <header className="flex items-center justify-between pt-1 pb-1">
        {/* Left: Yellow Icon + Text */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-linear-to-b from-[#FFCF4B] to-[#FFB82E] flex items-center justify-center shadow-md shadow-amber-300/40">
            <Truck className="w-4.5 h-4.5 text-gray-900" />
          </div>
          <div>
            <h2 className="text-[13px] font-bold text-gray-900 leading-tight">Waypoint Logistics</h2>
            <p className="text-[10px] text-gray-400 font-medium leading-tight">Warehouse Loading</p>
          </div>
        </div>

        {/* Right: Status Pills */}
        <div className="flex items-center gap-1.5">
          {/* Dock Pill */}
          <div className="px-2.5 py-1 bg-white border border-gray-200/90 rounded-full text-[11px] shadow-2xs">
            <span className="text-gray-400 font-medium">Dock: </span>
            <span className="text-gray-900 font-bold">04</span>
          </div>

          {/* Online Pill */}
          <div className="px-2.5 py-1 bg-[#EAF8EE] border border-emerald-200/60 rounded-full text-[11px] font-bold text-[#16A34A] flex items-center gap-1.5 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
            <span>Online</span>
          </div>

          {/* User Avatar Pill */}
          <div className="flex items-center gap-1.5 pl-1 pr-2.5 py-0.5 bg-white border border-gray-200/90 rounded-full shadow-2xs">
            <div className="w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center text-[10px] font-bold">
              A
            </div>
            <span className="text-[11px] font-bold text-gray-800">Alex</span>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* VIEW 1: TRIPS QUEUE (Exact Match to Figma Screenshot)      */}
      {/* ========================================================= */}
      {activeTab === "trips" && (
        <div className="space-y-4">
          {/* Title Section */}
          <div className="pt-2">
            <h1 className="text-[22px] font-extrabold text-gray-900 tracking-tight leading-tight">Trip Queue</h1>
            <p className="text-xs text-gray-400 font-normal mt-0.5">Vehicles ready for loading</p>
          </div>

          {/* 3 Summary Metric Cards */}
          <div className="space-y-2.5">
            {/* Top Row: 2 Cards */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Card 1: Next Departure */}
              <div className="bg-white border border-gray-100 rounded-[20px] p-3 shadow-2xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FFF6DB] flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-[#B45309]" />
                </div>
                <div>
                  <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block">NEXT DEPARTURE</span>
                  <span className="text-base font-black text-gray-900 tracking-tight leading-snug block">06:30 AM</span>
                  <span className="text-[10px] text-gray-400 font-medium block">TRK-024 • Dock 04</span>
                </div>
              </div>

              {/* Card 2: Vehicles Waiting */}
              <div className="bg-white border border-gray-100 rounded-[20px] p-3 shadow-2xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F0F2F5] flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4 text-gray-700" />
                </div>
                <div>
                  <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block">VEHICLES WAITING</span>
                  <span className="text-base font-black text-gray-900 tracking-tight leading-snug block">06</span>
                  <span className="text-[10px] text-gray-400 font-medium block">Across 4 dock doors</span>
                </div>
              </div>
            </div>

            {/* Bottom Row: Card 3 on Left */}
            <div className="w-full sm:w-[calc(50%-5px)]">
              <div className="bg-white border border-gray-100 rounded-[20px] p-3 shadow-2xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#EAF8EE] flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4 text-[#16A34A]" />
                </div>
                <div>
                  <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block">ORDERS TO LOAD</span>
                  <span className="text-base font-black text-gray-900 tracking-tight leading-snug block">42</span>
                  <span className="text-[10px] text-gray-400 font-medium block">18 chilled • 24 ambient</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section Header: Dock Queue */}
          <div className="flex items-center justify-between pt-2">
            <h2 className="text-[13px] font-bold text-gray-900">Dock Queue</h2>
            <span className="text-[10px] text-gray-400 font-medium">Sorted by departure time</span>
          </div>

          {/* Vehicle Cards List */}
          <div className="space-y-3.5">
            {vehicles.map((v) => {
              return (
                <div
                  key={v.id}
                  className={`bg-white rounded-[24px] p-3 transition-all ${
                    v.isFeatured 
                      ? "border-2 border-[#FFC83D] shadow-sm" 
                      : "border border-gray-100/90 shadow-2xs"
                  }`}
                >
                  {/* Truck Image Banner with Inset Corners */}
                  <div className="relative w-full h-24 sm:h-28 overflow-hidden rounded-[14px] bg-gray-100">
                    <img 
                      src={v.image} 
                      alt={v.code} 
                      className="w-full h-full object-cover" 
                    />
                  </div>

                  {/* Card Content Below Banner */}
                  <div className="pt-3 px-1 space-y-2">
                    {/* Header Row: Vehicle Code + Status Badge */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black text-gray-900 tracking-tight">{v.code}</h3>

                      {/* Status Pills */}
                      {v.statusType === "ready_to_load" && (
                        <div className="bg-[#FFF4D6] text-[#B45309] text-[9px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                          <span>READY TO LOAD</span>
                        </div>
                      )}

                      {v.statusType === "ready" && (
                        <div className="bg-[#EAF8EE] text-[#16A34A] text-[9px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                          <span>READY</span>
                        </div>
                      )}

                      {v.statusType === "chilled_load" && (
                        <div className="bg-[#E0F2FE] text-[#0284C7] text-[9px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <span>❄</span>
                          <span>CHILLED LOAD</span>
                        </div>
                      )}

                      {v.statusType === "dispatched" && (
                        <div className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>DISPATCHED</span>
                        </div>
                      )}
                    </div>

                    {/* Subtitle: Vehicle Type */}
                    <p className="text-[11px] text-gray-400 font-medium -mt-1">{v.vehicleType}</p>

                    {/* Category Tags */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      {v.tags.map((tag) => (
                        <span 
                          key={tag}
                          className="border border-gray-200 text-gray-600 bg-white rounded-md text-[10px] font-medium px-2 py-0.5"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* 3 Metrics: Departure, Stops, Orders */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100/80">
                      <div>
                        <div className="flex items-center gap-1 text-[9px] font-extrabold text-gray-400 uppercase tracking-wider">
                          <Clock className="w-3 h-3" />
                          <span>DEPARTURE</span>
                        </div>
                        <span className="text-sm font-black text-gray-900 mt-0.5 block">{v.departure}</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-1 text-[9px] font-extrabold text-gray-400 uppercase tracking-wider">
                          <MapPin className="w-3 h-3" />
                          <span>STOPS</span>
                        </div>
                        <span className="text-sm font-black text-gray-900 mt-0.5 block">{v.stopsCount}</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-1 text-[9px] font-extrabold text-gray-400 uppercase tracking-wider">
                          <Package className="w-3 h-3" />
                          <span>ORDERS</span>
                        </div>
                        <span className="text-sm font-black text-gray-900 mt-0.5 block">{v.ordersCount}</span>
                      </div>
                    </div>

                    {/* Full Width Action Button */}
                    <button
                      onClick={() => handleStartLoading(v.id)}
                      className="w-full mt-3 py-3 bg-[#FFC83D] hover:bg-[#FBBF24] text-gray-900 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-[0_6px_16px_-4px_rgba(255,200,61,0.6)] transition-all active:scale-[0.99]"
                    >
                      <span>Start Loading</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 2: LOADING CHECKLIST (Interactive Stop Sequence)     */}
      {/* ========================================================= */}
      {activeTab === "loading" && (
        <div className="space-y-4 pt-1">
          {/* Back button */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveTab("trips")}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Queue</span>
            </button>

            <span className="text-[11px] font-bold text-amber-800 bg-[#FFF6DB] px-2.5 py-1 rounded-full">
              {selectedVehicle.dock}
            </span>
          </div>

          {/* Active Vehicle Header Card */}
          <div className="bg-white rounded-[24px] p-3.5 border border-gray-200/90 shadow-2xs flex items-center gap-3">
            <img 
              src={selectedVehicle.image} 
              alt={selectedVehicle.code} 
              className="w-16 h-16 rounded-xl object-cover border border-gray-200" 
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-gray-900">{selectedVehicle.code}</h3>
                <span className="text-xs font-black text-amber-700">{progressPercent}%</span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium">{selectedVehicle.vehicleType}</p>
              
              {/* Mini Progress Bar */}
              <div className="w-full h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full bg-[#FFC83D] rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Reverse Loading Notice */}
          <div className="bg-amber-50 border border-amber-300/70 rounded-2xl p-3 flex items-start gap-2.5">
            <Layers className="w-4 h-4 text-amber-800 mt-0.5 shrink-0" />
            <div className="text-[11px] text-amber-900 leading-snug">
              <span className="font-extrabold uppercase block">Reverse Sequence Enforced</span>
              Load furthest stop first deep in the cargo bay; Stop 1 is loaded last near doors.
            </div>
          </div>

          {/* Stops List */}
          <div className="space-y-3">
            {selectedVehicle.stops.map((stop) => (
              <div key={stop.storeName} className="bg-white rounded-2xl border border-gray-200/90 p-3 shadow-2xs space-y-2">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-gray-900 text-white text-[10px] font-bold flex items-center justify-center">
                      #{stop.loadSequence}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">{stop.storeName}</h4>
                      <p className="text-[10px] text-gray-400">{stop.location}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-500">Stop #{stop.stopNumber}</span>
                </div>

                {/* Pallets */}
                <div className="space-y-1.5 pt-1">
                  {stop.pallets.map((pallet) => (
                    <div
                      key={pallet.id}
                      onClick={() => handleTogglePallet(pallet.id)}
                      className={`p-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                        pallet.verified ? "bg-emerald-50/60" : "bg-gray-50 hover:bg-gray-100/70"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center text-white ${
                          pallet.verified ? "bg-[#22C55E]" : "border-2 border-gray-300 bg-white"
                        }`}>
                          {pallet.verified && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${pallet.verified ? "line-through text-gray-400" : "text-gray-900"}`}>
                            {pallet.name}
                          </p>
                          <span className="text-[10px] font-mono text-gray-400">[{pallet.sku}]</span>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold text-gray-500">{pallet.weightKg} kg</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Action to Seal */}
          <div className="pt-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full py-3.5 bg-[#FFC83D] hover:bg-[#FBBF24] text-gray-900 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Finalize & Seal Vehicle</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 3: ISSUES LOG VIEW                                    */}
      {/* ========================================================= */}
      {activeTab === "issues" && (
        <div className="space-y-4 pt-1">
          <div className="pt-2">
            <h1 className="text-[20px] font-extrabold text-gray-900 tracking-tight">Reported Issues</h1>
            <p className="text-xs text-gray-400">Warehouse dock exception logs</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-gray-800">No Critical Exceptions</h3>
            <p className="text-[11px] text-gray-400">All temperature seals and ratchet restraints are within normal parameters.</p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* BOTTOM FLOATING DOCK (Trips • Loading • Issues)           */}
      {/* ========================================================= */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40">
        <div className="bg-white/95 backdrop-blur-md border border-gray-200/90 rounded-full p-1.5 shadow-xl flex items-center gap-1.5">
          {/* Trips Tab */}
          <button
            onClick={() => setActiveTab("trips")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === "trips"
                ? "bg-[#FFC83D] text-gray-900 shadow-2xs"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Trips</span>
          </button>

          {/* Loading Tab */}
          <button
            onClick={() => setActiveTab("loading")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === "loading"
                ? "bg-[#FFC83D] text-gray-900 shadow-2xs"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Loading</span>
          </button>

          {/* Issues Tab */}
          <button
            onClick={() => setActiveTab("issues")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === "issues"
                ? "bg-[#FFC83D] text-gray-900 shadow-2xs"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Issues</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SEAL CONFIRMATION MODAL                                    */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-[28px] max-w-sm w-full p-5 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-black text-gray-900">Seal & Clear Vehicle</h3>
                <p className="text-[10px] text-gray-400">{selectedVehicle.code} • {selectedVehicle.dock}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-700">Door Seal Tag ID #</label>
              <input
                type="text"
                value={sealNumber}
                onChange={(e) => setSealNumber(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#FFC83D]"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSeal}
                className="flex-1 py-2.5 bg-[#FFC83D] hover:bg-[#FBBF24] text-gray-900 font-bold text-xs rounded-xl shadow-xs"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
