"use client";

import { useState } from "react";
import { 
  Truck, 
  Search, 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  ChevronRight, 
  ArrowLeft, 
  Barcode, 
  Thermometer, 
  Weight, 
  Layers, 
  Phone, 
  Sparkles, 
  X, 
  Check, 
  FileText, 
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  Warehouse
} from "lucide-react";

// Trip & Pallet Type Definitions
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
  stopNumber: number; // 1 = first dropoff, 4 = last dropoff
  loadSequence: number; // 1 = first loaded into truck, 4 = loaded last (near doors)
  storeId: string;
  storeName: string;
  location: string;
  pallets: PalletItem[];
}

interface TripVehicle {
  id: string;
  tripNumber: string;
  bay: string;
  status: "loading" | "ready" | "scheduled" | "dispatched";
  statusText: string;
  plateNumber: string;
  vehicleModel: string;
  vehicleType: string;
  driverName: string;
  driverPhone: string;
  departureTime: string;
  cutoffTime: string;
  maxWeightTons: number;
  currentWeightTons: number;
  image: string;
  stops: StopGroup[];
}

// Initial Mock Trips aligned with Waypoint Logistics architecture
const INITIAL_TRIPS: TripVehicle[] = [
  {
    id: "trip-1042",
    tripNumber: "TRIP #1042",
    bay: "Bay 04",
    status: "loading",
    statusText: "LOADING (78%)",
    plateNumber: "WP-8921",
    vehicleModel: "Isuzu NPR Dual-Zone",
    vehicleType: "5.0 Ton Heavy Duty",
    driverName: "Kamal Perera",
    driverPhone: "+94 77 123 4567",
    departureTime: "06:30 AM",
    cutoffTime: "05:45 AM",
    maxWeightTons: 4.8,
    currentWeightTons: 3.75,
    image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=1000&auto=format&fit=crop",
    stops: [
      {
        stopNumber: 4,
        loadSequence: 1, // Loaded first (deep front of cargo bay)
        storeId: "STR-104",
        storeName: "Colombo South Superstore",
        location: "Wellawatte, Colombo 06",
        pallets: [
          { id: "p-104-1", sku: "SKU-9921-A", name: "Dairy & Chilled Cheeses", category: "chilled", tempReq: "4°C", weightKg: 420, verified: true },
          { id: "p-104-2", sku: "SKU-9921-B", name: "Poultry & Frozen Meats", category: "frozen", tempReq: "-18°C", weightKg: 580, verified: true },
          { id: "p-104-3", sku: "SKU-9921-C", name: "Dry Packaged Staples", category: "ambient", weightKg: 350, verified: true },
          { id: "p-104-4", sku: "SKU-9921-D", name: "Beverage Crate Stacks", category: "ambient", weightKg: 610, verified: true },
        ]
      },
      {
        stopNumber: 3,
        loadSequence: 2,
        storeId: "STR-088",
        storeName: "Havelock Town Branch",
        location: "Havelock Rd, Colombo 05",
        pallets: [
          { id: "p-088-1", sku: "SKU-8820-A", name: "Fresh Orchard Fruits", category: "ambient", weightKg: 310, verified: true },
          { id: "p-088-2", sku: "SKU-8820-B", name: "Ice Creams & Confectionery", category: "frozen", tempReq: "-18°C", weightKg: 280, verified: true },
          { id: "p-088-3", sku: "SKU-8820-C", name: "Household & Cleaners", category: "ambient", weightKg: 240, verified: true },
          { id: "p-088-4", sku: "SKU-8820-D", name: "Bottled Mineral Water", category: "ambient", weightKg: 450, verified: false },
        ]
      },
      {
        stopNumber: 2,
        loadSequence: 3,
        storeId: "STR-042",
        storeName: "Bambalapitiya Express",
        location: "Galle Rd, Colombo 04",
        pallets: [
          { id: "p-042-1", sku: "SKU-4211-A", name: "Artisan Bakery Bread Packs", category: "ambient", weightKg: 190, verified: true },
          { id: "p-042-2", sku: "SKU-4211-B", name: "Yogurts & Fresh Milk", category: "chilled", tempReq: "4°C", weightKg: 310, verified: false },
        ]
      },
      {
        stopNumber: 1,
        loadSequence: 4, // Loaded last (doors) - first stop on road!
        storeId: "STR-012",
        storeName: "Downtown Flagship Center",
        location: "Union Place, Colombo 02",
        pallets: [
          { id: "p-012-1", sku: "SKU-1205-A", name: "Daily Vegetable Crates", category: "ambient", weightKg: 290, verified: false },
          { id: "p-012-2", sku: "SKU-1205-B", name: "Chilled Deli & Cold Cuts", category: "chilled", tempReq: "4°C", weightKg: 220, verified: false },
          { id: "p-012-3", sku: "SKU-1205-C", name: "Snack Foods & Cereals", category: "ambient", weightKg: 180, verified: false },
        ]
      }
    ]
  },
  {
    id: "trip-1045",
    tripNumber: "TRIP #1045",
    bay: "Bay 02",
    status: "ready",
    statusText: "READY TO LOAD",
    plateNumber: "WP-4102",
    vehicleModel: "Toyota HiAce Refrigerated",
    vehicleType: "1.8 Ton Urban Express",
    driverName: "Nimal Silva",
    driverPhone: "+94 71 987 6543",
    departureTime: "07:15 AM",
    cutoffTime: "06:15 AM",
    maxWeightTons: 1.8,
    currentWeightTons: 0.0,
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=1000&auto=format&fit=crop",
    stops: [
      {
        stopNumber: 2,
        loadSequence: 1,
        storeId: "STR-055",
        storeName: "Kollupitiya Metro Store",
        location: "Kollupitiya, Colombo 03",
        pallets: [
          { id: "p-055-1", sku: "SKU-5501-A", name: "Frozen Seafood Assortment", category: "frozen", tempReq: "-18°C", weightKg: 340, verified: false },
          { id: "p-055-2", sku: "SKU-5501-B", name: "Packaged Deli Items", category: "chilled", tempReq: "4°C", weightKg: 260, verified: false },
        ]
      },
      {
        stopNumber: 1,
        loadSequence: 2,
        storeId: "STR-019",
        storeName: "Fort Central Pantry",
        location: "York St, Colombo 01",
        pallets: [
          { id: "p-019-1", sku: "SKU-1901-A", name: "Fresh Bakery & Pastries", category: "ambient", weightKg: 180, verified: false },
          { id: "p-019-2", sku: "SKU-1901-B", name: "Milk Cartons", category: "chilled", tempReq: "4°C", weightKg: 290, verified: false },
        ]
      }
    ]
  },
  {
    id: "trip-1049",
    tripNumber: "TRIP #1049",
    bay: "Bay 06",
    status: "scheduled",
    statusText: "SCHEDULED (08:00 AM)",
    plateNumber: "WP-7743",
    vehicleModel: "Mitsubishi Fuso Fighter",
    vehicleType: "6.5 Ton Multi-Temp",
    driverName: "Sunil Fernando",
    driverPhone: "+94 76 555 4321",
    departureTime: "08:00 AM",
    cutoffTime: "07:00 AM",
    maxWeightTons: 6.5,
    currentWeightTons: 0.0,
    image: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=1000&auto=format&fit=crop",
    stops: []
  }
];

export default function TripQueuePage() {
  const [trips, setTrips] = useState<TripVehicle[]>(INITIAL_TRIPS);
  const [activeFilter, setActiveFilter] = useState<"all" | "loading" | "ready" | "dispatched">("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Navigation State inside Loader Prototype:
  // "queue" = Screen 2 (Trip Queue)
  // "verify" = Screen 3 (Loading Verification Checklist)
  const [currentView, setCurrentView] = useState<"queue" | "verify">("queue");
  const [selectedTripId, setSelectedTripId] = useState<string>("trip-1042");

  // Modal State: Screen 4 (Confirm Loading & Seal Truck)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [securitySeal, setSecuritySeal] = useState("SL-892301-X");
  const [hasDiscrepancy, setHasDiscrepancy] = useState(false);
  const [discrepancyNote, setDiscrepancyNote] = useState("");
  const [signatureName, setSignatureName] = useState("Loader Peter (LDR-8821)");
  const [scanInput, setScanInput] = useState("");
  const [scanNotification, setScanNotification] = useState<string | null>(null);

  // Selected Trip Object
  const selectedTrip = trips.find((t) => t.id === selectedTripId) || trips[0];

  // Helper stats for selected trip
  const allPallets = selectedTrip.stops.flatMap((s) => s.pallets);
  const verifiedPalletsCount = allPallets.filter((p) => p.verified).length;
  const totalPalletsCount = allPallets.length;
  const progressPercent = totalPalletsCount > 0 ? Math.round((verifiedPalletsCount / totalPalletsCount) * 100) : 0;

  // Toggle Pallet Verification
  const togglePallet = (palletId: string) => {
    setTrips((prevTrips) =>
      prevTrips.map((t) => {
        if (t.id !== selectedTripId) return t;
        return {
          ...t,
          stops: t.stops.map((s) => ({
            ...s,
            pallets: s.pallets.map((p) =>
              p.id === palletId ? { ...p, verified: !p.verified } : p
            )
          }))
        };
      })
    );
  };

  // Simulate Barcode Scan
  const handleBarcodeSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!scanInput.trim()) {
      // If empty, auto-scan the next unverified pallet for easy demo!
      const nextUnverified = allPallets.find((p) => !p.verified);
      if (nextUnverified) {
        togglePallet(nextUnverified.id);
        triggerToast(`Scanned & Verified: ${nextUnverified.sku} (${nextUnverified.name})`);
      } else {
        triggerToast("All pallets are already verified!");
      }
      return;
    }

    const matched = allPallets.find(
      (p) => p.sku.toLowerCase() === scanInput.trim().toLowerCase()
    );

    if (matched) {
      if (!matched.verified) {
        togglePallet(matched.id);
        triggerToast(`Verified: ${matched.sku} • ${matched.name}`);
      } else {
        triggerToast(`Already verified: ${matched.sku}`);
      }
    } else {
      triggerToast(`Invalid barcode "${scanInput}". SKU not found in manifest.`);
    }
    setScanInput("");
  };

  const triggerToast = (msg: string) => {
    setScanNotification(msg);
    setTimeout(() => setScanNotification(null), 3500);
  };

  // Confirm Final Load (Screen 4 Submission)
  const handleConfirmLoad = () => {
    setTrips((prev) =>
      prev.map((t) =>
        t.id === selectedTripId
          ? {
              ...t,
              status: "dispatched",
              statusText: "SEALED & DISPATCHED",
              stops: t.stops.map((s) => ({
                ...s,
                pallets: s.pallets.map((p) => ({ ...p, verified: true }))
              }))
            }
          : t
      )
    );
    setIsModalOpen(false);
    triggerToast(`Truck ${selectedTrip.plateNumber} sealed with #${securitySeal} and cleared for gate dispatch!`);
    setCurrentView("queue");
  };

  // Filtered trips list
  const filteredTrips = trips.filter((t) => {
    if (activeFilter === "loading") return t.status === "loading";
    if (activeFilter === "ready") return t.status === "ready";
    if (activeFilter === "dispatched") return t.status === "dispatched";
    return true;
  }).filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.tripNumber.toLowerCase().includes(q) ||
      t.plateNumber.toLowerCase().includes(q) ||
      t.driverName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Toast Notification Alert */}
      {scanNotification && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 bg-waypoint-text text-white px-5 py-3 rounded-2xl shadow-xl border border-gray-700 flex items-center gap-3 text-xs font-bold animate-bounce">
          <Sparkles className="w-4 h-4 text-waypoint-yellow shrink-0" />
          <span>{scanNotification}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* SCREEN 2: TRIP QUEUE VIEW (Vehicles List)                  */}
      {/* ========================================================= */}
      {currentView === "queue" && (
        <div className="space-y-6">
          {/* Header & Subtitle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-waypoint-orange text-[10px] font-extrabold tracking-widest uppercase mb-1">
                Warehouse Station
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-waypoint-text tracking-tight">
                Trip Queue
              </h1>
              <p className="text-waypoint-secondary text-xs sm:text-sm font-medium mt-0.5">
                Vehicles assigned for warehouse sequence loading
              </p>
            </div>

            {/* Quick Refresh */}
            <button 
              onClick={() => triggerToast("Syncing latest dispatch schedule from server...")}
              className="self-start sm:self-auto flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-waypoint-orange" />
              <span>Refresh Queue</span>
            </button>
          </div>

          {/* 3 Top Summary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                <Warehouse className="w-5 h-5 text-waypoint-orange" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Station Bay</p>
                <p className="text-sm font-extrabold text-waypoint-text">Bay 04 (Multi-Temp)</p>
                <p className="text-[10px] text-emerald-600 font-semibold">Active & Sensor Synced</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-yellow-50 border border-yellow-100 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5 text-waypoint-yellow" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Vehicles in Queue</p>
                <p className="text-sm font-extrabold text-waypoint-text">3 Assigned Today</p>
                <p className="text-[10px] text-gray-500 font-medium">1 in progress, 2 pending</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Next Cut-Off</p>
                <p className="text-sm font-extrabold text-red-600">05:45 AM (45 min left)</p>
                <p className="text-[10px] text-gray-500 font-medium">TRIP #1042 departure</p>
              </div>
            </div>
          </div>

          {/* Search Bar & Filter Pills */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {[
                { key: "all", label: "All Vehicles (3)" },
                { key: "loading", label: "In Progress (1)" },
                { key: "ready", label: "Ready to Load (1)" },
                { key: "dispatched", label: "Dispatched (0)" },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeFilter === f.key
                      ? "bg-waypoint-yellow text-waypoint-text shadow-2xs"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search trip #, plate, driver..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-waypoint-yellow"
              />
            </div>
          </div>

          {/* Vehicles Trip Cards List */}
          <div className="space-y-4">
            {filteredTrips.map((trip) => {
              const tripPallets = trip.stops.flatMap((s) => s.pallets);
              const tripVerified = tripPallets.filter((p) => p.verified).length;
              const tripTotal = tripPallets.length;
              const tripPercent = tripTotal > 0 ? Math.round((tripVerified / tripTotal) * 100) : 0;
              const isSelected = trip.id === selectedTripId;

              return (
                <div 
                  key={trip.id}
                  className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden shadow-2xs ${
                    trip.status === "loading"
                      ? "border-amber-300 ring-2 ring-amber-400/20"
                      : "border-gray-200/90 hover:border-gray-300"
                  }`}
                >
                  {/* Hero Vehicle Banner Image */}
                  <div className="relative h-36 w-full overflow-hidden bg-gray-900">
                    <img 
                      src={trip.image} 
                      alt={trip.vehicleModel} 
                      className="w-full h-full object-cover opacity-85" 
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
                    
                    {/* Top Floating Badges */}
                    <div className="absolute top-3 left-4 right-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="bg-white/95 text-waypoint-text px-2.5 py-1 rounded-lg text-xs font-black tracking-tight shadow-xs">
                          {trip.tripNumber}
                        </span>
                        <span className="bg-black/60 backdrop-blur-md text-amber-300 border border-amber-300/30 px-2 py-0.5 rounded-lg text-[11px] font-bold">
                          {trip.bay}
                        </span>
                      </div>

                      {/* Status Tag */}
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${
                        trip.status === "loading"
                          ? "bg-waypoint-yellow text-waypoint-text shadow-xs"
                          : trip.status === "ready"
                          ? "bg-blue-500 text-white"
                          : trip.status === "dispatched"
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-700 text-gray-200"
                      }`}>
                        {trip.statusText}
                      </span>
                    </div>

                    {/* Bottom Info on Banner */}
                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
                      <div>
                        <h3 className="text-base font-extrabold tracking-tight">{trip.vehicleModel}</h3>
                        <p className="text-[11px] text-gray-300 font-medium">Plate: <span className="font-bold text-white">{trip.plateNumber}</span> • {trip.vehicleType}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Departure</p>
                        <p className="text-sm font-extrabold text-amber-300">{trip.departureTime}</p>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Card Body */}
                  <div className="p-4 sm:p-5 space-y-4">
                    {/* Metrics Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2 border-b border-gray-100 text-xs">
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase block">Driver</span>
                        <div className="flex items-center gap-1.5 mt-0.5 font-bold text-waypoint-text">
                          <span>{trip.driverName}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase block">Load Progress</span>
                        <div className="flex items-center gap-1.5 mt-0.5 font-bold text-waypoint-text">
                          <Layers className="w-3.5 h-3.5 text-waypoint-orange" />
                          <span>{tripVerified} / {tripTotal} Pallets</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase block">Weight Total</span>
                        <div className="flex items-center gap-1.5 mt-0.5 font-bold text-waypoint-text">
                          <Weight className="w-3.5 h-3.5 text-gray-500" />
                          <span>{trip.currentWeightTons}T / {trip.maxWeightTons}T</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase block">Stops Sequence</span>
                        <div className="flex items-center gap-1.5 mt-0.5 font-bold text-emerald-700">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{trip.stops.length} Drops (Rev-Order)</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar (if loading or completed) */}
                    {tripTotal > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-bold text-gray-500">
                          <span>Verification Progress</span>
                          <span className={tripPercent === 100 ? "text-emerald-600" : "text-waypoint-text"}>{tripPercent}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              tripPercent === 100 ? "bg-emerald-500" : "bg-waypoint-yellow"
                            }`} 
                            style={{ width: `${tripPercent}%` }} 
                          />
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="pt-1 flex items-center justify-between gap-3">
                      <div className="text-[11px] text-gray-500">
                        {trip.status === "loading" && "Loading in progress at Bay 04"}
                        {trip.status === "ready" && "Ready for loading crew"}
                        {trip.status === "dispatched" && "Sealed and cleared"}
                      </div>

                      <button
                        onClick={() => {
                          setSelectedTripId(trip.id);
                          setCurrentView("verify");
                        }}
                        className="bg-waypoint-yellow hover:bg-[#F0B92B] text-waypoint-text font-extrabold text-xs sm:text-sm px-6 py-3 rounded-xl flex items-center gap-2 shadow-xs transition-transform active:scale-95"
                      >
                        <span>{trip.status === "loading" ? "Continue Loading" : "Start Loading"}</span>
                        <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SCREEN 3: LOADING VERIFICATION CHECKLIST (Reverse-Order)   */}
      {/* ========================================================= */}
      {currentView === "verify" && (
        <div className="space-y-6">
          {/* Top Bar: Back to Queue */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentView("queue")}
              className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-waypoint-text bg-white px-3.5 py-2 rounded-xl border border-gray-200 shadow-2xs hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Trip Queue</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500">Bay:</span>
              <span className="bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg text-xs font-extrabold">
                {selectedTrip.bay}
              </span>
            </div>
          </div>

          {/* Active Trip Header Card with Vehicle Picture */}
          <div className="bg-white rounded-3xl border border-gray-200/90 p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img 
                src={selectedTrip.image} 
                alt={selectedTrip.vehicleModel} 
                className="w-20 h-20 rounded-2xl object-cover border border-gray-200 shrink-0" 
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-extrabold text-waypoint-text">{selectedTrip.tripNumber}</h2>
                  <span className="bg-[#FFF6D8] text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase">
                    {selectedTrip.plateNumber}
                  </span>
                </div>
                <p className="text-xs font-medium text-gray-600">{selectedTrip.vehicleModel}</p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                  <span>Driver: <strong className="text-gray-800">{selectedTrip.driverName}</strong></span>
                  <span>•</span>
                  <span>Depart: <strong className="text-amber-700">{selectedTrip.departureTime}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Completion Gauge */}
            <div className="w-full sm:w-auto bg-[#FAFAF7] border border-gray-200 rounded-2xl p-3.5 text-right min-w-[200px]">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Verification</span>
                <span className="text-sm font-extrabold text-waypoint-text">
                  {verifiedPalletsCount} / {totalPalletsCount} ({progressPercent}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    progressPercent === 100 ? "bg-emerald-500" : "bg-waypoint-yellow"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* CRITICAL LOGISTICS BANNER: Enforce Reverse-Stop Loading */}
          <div className="bg-amber-50 border-2 border-amber-300/80 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 flex items-center justify-center shrink-0 mt-0.5">
              <Layers className="w-4.5 h-4.5 text-amber-800" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider">
                  Reverse-Stop Loading Enforced
                </h4>
                <span className="bg-amber-200 text-amber-900 text-[9px] font-extrabold px-1.5 py-0.2 rounded">
                  LIFO Sequence
                </span>
              </div>
              <p className="text-xs text-amber-900/90 mt-0.5 leading-relaxed">
                Load the furthest destination (Stop 4) <strong>first</strong> deep inside the vehicle bed. Stop 1 is loaded <strong>last</strong> near the roll-up door so the driver unloads in order without cargo shuffling.
              </p>
            </div>
          </div>

          {/* Quick Barcode Scanner Simulation Bar */}
          <form 
            onSubmit={handleBarcodeSubmit}
            className="bg-white border border-gray-200 rounded-2xl p-3 shadow-2xs flex flex-col sm:flex-row items-center gap-2.5"
          >
            <div className="relative w-full flex-1">
              <Barcode className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Scan pallet barcode (e.g. SKU-8820-D) or press 'Simulate Scan'..."
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-waypoint-yellow"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="submit"
                className="flex-1 sm:flex-none px-4 py-2.5 bg-waypoint-yellow hover:bg-[#F0B92B] text-waypoint-text text-xs font-extrabold rounded-xl shadow-2xs transition-colors whitespace-nowrap"
              >
                Scan Barcode
              </button>
              <button
                type="button"
                onClick={() => handleBarcodeSubmit()}
                className="flex-1 sm:flex-none px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors whitespace-nowrap"
              >
                ⚡ Quick Auto-Check
              </button>
            </div>
          </form>

          {/* Stops List (Sorted by Load Sequence 1 -> 4) */}
          <div className="space-y-4">
            {selectedTrip.stops.map((stop) => {
              const stopAllDone = stop.pallets.every((p) => p.verified);
              const stopVerifiedCount = stop.pallets.filter((p) => p.verified).length;

              return (
                <div 
                  key={stop.storeId} 
                  className={`bg-white rounded-3xl border transition-all overflow-hidden shadow-2xs ${
                    stopAllDone 
                      ? "border-emerald-200 bg-emerald-50/10" 
                      : "border-gray-200"
                  }`}
                >
                  {/* Stop Header */}
                  <div className="p-4 sm:p-5 bg-gray-50/70 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                        stopAllDone ? "bg-emerald-500 text-white" : "bg-waypoint-text text-white"
                      }`}>
                        #{stop.loadSequence}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-extrabold text-waypoint-text">{stop.storeName}</h3>
                          <span className="text-[10px] font-bold text-gray-400">({stop.storeId})</span>
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium">{stop.location}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <span className="text-[10px] font-bold text-gray-500">
                        Stop #{stop.stopNumber} on Route
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                        stopAllDone 
                          ? "bg-emerald-100 text-emerald-800" 
                          : "bg-amber-100 text-amber-900"
                      }`}>
                        {stopVerifiedCount}/{stop.pallets.length} Loaded
                      </span>
                    </div>
                  </div>

                  {/* Pallets Checklist */}
                  <div className="divide-y divide-gray-100 p-2 sm:p-3">
                    {stop.pallets.map((pallet) => (
                      <div 
                        key={pallet.id}
                        onClick={() => togglePallet(pallet.id)}
                        className={`p-3 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                          pallet.verified ? "bg-emerald-50/40 hover:bg-emerald-50/70" : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          {/* Checkbox Icon */}
                          <div className="shrink-0">
                            {pallet.verified ? (
                              <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                                <Check className="w-4 h-4 stroke-[3]" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-lg border-2 border-gray-300 hover:border-gray-400 bg-white" />
                            )}
                          </div>

                          {/* Item Info */}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-extrabold ${pallet.verified ? "text-gray-900 line-through opacity-70" : "text-gray-900"}`}>
                                {pallet.name}
                              </span>
                              <span className="text-[10px] font-mono text-gray-400">
                                [{pallet.sku}]
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2.5 mt-1 text-[10px] font-bold">
                              {/* Category Badges */}
                              {pallet.category === "frozen" && (
                                <span className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                                  <Thermometer className="w-3 h-3" /> Frozen ({pallet.tempReq})
                                </span>
                              )}
                              {pallet.category === "chilled" && (
                                <span className="flex items-center gap-1 text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200">
                                  <Thermometer className="w-3 h-3" /> Chilled ({pallet.tempReq})
                                </span>
                              )}
                              {pallet.category === "ambient" && (
                                <span className="text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                                  Ambient
                                </span>
                              )}

                              <span className="text-gray-500 font-medium">
                                Weight: {pallet.weightKg} kg
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status Label */}
                        <div className="text-right shrink-0">
                          {pallet.verified ? (
                            <span className="text-[11px] font-extrabold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-gray-400">
                              Tap to Verify
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sticky Bottom Actions Bar */}
          <div className="sticky bottom-20 bg-white/95 backdrop-blur-md border border-gray-200 p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
              <ShieldCheck className="w-5 h-5 text-waypoint-orange" />
              <span>
                {verifiedPalletsCount === totalPalletsCount 
                  ? "All 18 Pallets verified! Ready to seal." 
                  : `${totalPalletsCount - verifiedPalletsCount} items remaining to load.`}
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setHasDiscrepancy(true);
                  setIsModalOpen(true);
                }}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold border border-red-200 transition-colors"
              >
                Report Exception
              </button>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-waypoint-yellow hover:bg-[#F0B92B] text-waypoint-text rounded-xl text-xs sm:text-sm font-extrabold shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Finalize & Seal Truck</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SCREEN 4: CONFIRM LOADING & SEAL TRUCK MODAL DIALOG       */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-gray-200 space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <p className="text-waypoint-orange text-[10px] font-extrabold tracking-widest uppercase">
                  Dock Clearance
                </p>
                <h3 className="text-xl font-extrabold text-waypoint-text">
                  Complete Vehicle Loading
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  {selectedTrip.tripNumber} • {selectedTrip.plateNumber} ({selectedTrip.vehicleModel})
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 4 Stat Summary Badges */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="bg-[#FAFAF7] border border-gray-200 p-3 rounded-2xl">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Verified Pallets</span>
                <span className="text-base font-extrabold text-emerald-600">
                  {verifiedPalletsCount} / {totalPalletsCount} Items
                </span>
              </div>
              <div className="bg-[#FAFAF7] border border-gray-200 p-3 rounded-2xl">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Total Weight</span>
                <span className="text-base font-extrabold text-waypoint-text">
                  {selectedTrip.currentWeightTons}T / {selectedTrip.maxWeightTons}T
                </span>
              </div>
              <div className="bg-[#FAFAF7] border border-gray-200 p-3 rounded-2xl">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Compartment Temp</span>
                <span className="text-base font-extrabold text-blue-600">-18°C / 4°C OK</span>
              </div>
              <div className="bg-[#FAFAF7] border border-gray-200 p-3 rounded-2xl">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Loading Bay</span>
                <span className="text-base font-extrabold text-amber-700">{selectedTrip.bay}</span>
              </div>
            </div>

            {/* Security Seal Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                <span>Security Door Seal Tag #</span>
                <span className="text-[10px] text-amber-600 font-semibold">Required for Gatepass</span>
              </label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={securitySeal}
                  onChange={(e) => setSecuritySeal(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-waypoint-yellow"
                  placeholder="e.g. SL-892301-X"
                  required
                />
              </div>
            </div>

            {/* Discrepancy Toggle & Notes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700">Any Discrepancies or Damage?</label>
                <button
                  type="button"
                  onClick={() => setHasDiscrepancy(!hasDiscrepancy)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors ${
                    hasDiscrepancy ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {hasDiscrepancy ? "Exception Logged" : "No Issues"}
                </button>
              </div>

              {hasDiscrepancy && (
                <textarea
                  rows={2}
                  placeholder="Detail any carton damage, temperature deviance, or deferred items..."
                  value={discrepancyNote}
                  onChange={(e) => setDiscrepancyNote(e.target.value)}
                  className="w-full p-3 bg-red-50/50 border border-red-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              )}
            </div>

            {/* Digital Signature Confirmation */}
            <div className="bg-[#FFF9E6] border border-amber-200/80 p-3 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-waypoint-orange shrink-0" />
                <div>
                  <p className="font-extrabold text-amber-950">Loader Sign-off</p>
                  <p className="text-[10px] text-amber-800">{signatureName}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-amber-700 font-bold">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors"
              >
                Cancel / Edit
              </button>
              <button
                type="button"
                onClick={handleConfirmLoad}
                className="flex-1 py-3 bg-waypoint-yellow hover:bg-[#F0B92B] text-waypoint-text font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Confirm & Dispatch</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
