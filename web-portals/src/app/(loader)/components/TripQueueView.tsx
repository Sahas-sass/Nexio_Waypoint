"use client";

import { useState, useEffect } from "react";
import {
  Warehouse,
  Truck,
  Clock,
  Search,
  Layers,
  Weight,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Filter,
} from "lucide-react";
import { TripVehicle } from "../types";
import { getEarliestCutoffTrip, filterTrips } from "../utils/tripQueueHelpers";

interface TripQueueViewProps {
  trips: TripVehicle[];
  onSelectTrip: (tripId: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  assignedBay?: string;
  stationName?: string;
}

export default function TripQueueView({
  trips,
  onSelectTrip,
  onRefresh,
  isLoading,
  assignedBay = "Bay 04",
  stationName = "Station 04",
}: TripQueueViewProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | "loading" | "ready" | "dispatched">("all");
  const [selectedBayFilter, setSelectedBayFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Unique bays in current trips list
  const availableBays = Array.from(new Set(trips.map((t) => t.bay))).filter(Boolean);

  // Filtered trips via pure helper utility
  const filteredTrips = filterTrips(trips, activeFilter, selectedBayFilter, searchQuery);

  const loadingCount = trips.filter((t) => t.status === "loading").length;
  const readyCount = trips.filter((t) => t.status === "ready" || t.status === "planning").length;
  const dispatchedCount = trips.filter(
    (t) => t.status === "dispatched" || t.status === "en_route" || t.status === "completed"
  ).length;

  // Chronologically sorted earliest active cut-off via pure helper utility
  const nextCutoffTrip = getEarliestCutoffTrip(trips, selectedBayFilter);

  return (
    <div className="space-y-6 font-sans">
      {/* Header & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-waypoint-orange text-[10px] font-extrabold tracking-widest uppercase">
              Station
            </span>
            <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
              {assignedBay}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-waypoint-text tracking-tight">
            Trip Queue
          </h1>
          <p className="text-waypoint-secondary text-xs sm:text-sm font-medium mt-0.5">
            Active loading dock schedule
          </p>
        </div>

        {/* Quick Refresh */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          suppressHydrationWarning
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-waypoint-orange ${isLoading ? "animate-spin" : ""}`} />
          <span>{isLoading ? "Syncing..." : "Refresh Queue"}</span>
        </button>
      </div>

      {/* 3 Top Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Metric 1: Assigned Station Bay */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
            <Warehouse className="w-5 h-5 text-waypoint-orange" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Station Bay</p>
            <p className="text-sm font-extrabold text-waypoint-text">{assignedBay}</p>
            <p className="text-[10px] text-emerald-600 font-semibold">{stationName} • Active</p>
          </div>
        </div>

        {/* Metric 2: Vehicles in Queue */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-yellow-50 border border-yellow-100 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5 text-waypoint-yellow" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Vehicles in Queue</p>
            <p className="text-sm font-extrabold text-waypoint-text">{trips.length} Assigned Today</p>
            <p className="text-[10px] text-gray-500 font-medium">
              {loadingCount} loading, {readyCount} ready
            </p>
          </div>
        </div>

        {/* Metric 3: Next Cut-Off Clock */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-red-500" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Next Cut-Off</p>
              {nextCutoffTrip && (
                <span className="text-[9px] font-black px-1.5 py-0.2 bg-red-100 text-red-700 rounded-sm">
                  {nextCutoffTrip.bay}
                </span>
              )}
            </div>
            <p className="text-sm font-extrabold text-red-600 font-mono">
              {nextCutoffTrip ? nextCutoffTrip.cutoffTime : "All Clear"}
            </p>
            <p className="text-[10px] text-gray-500 font-medium truncate">
              {nextCutoffTrip
                ? `${nextCutoffTrip.tripNumber} • Depart ${nextCutoffTrip.departureTime}`
                : "All shipments dispatched"}
            </p>
          </div>
        </div>
      </div>

      {/* Bay Selector & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: "all", label: `All (${trips.length})` },
            { key: "loading", label: `In Progress (${loadingCount})` },
            { key: "ready", label: `Ready (${readyCount})` },
            { key: "dispatched", label: `Dispatched (${dispatchedCount})` },
          ].map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setActiveFilter(f.key as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === f.key
                  ? "bg-waypoint-yellow text-waypoint-text shadow-2xs"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {f.label}
            </button>
          ))}

          {/* Bay Quick Filter */}
          {availableBays.length > 1 && (
            <div className="flex items-center gap-1 pl-2 border-l border-gray-200">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Bay:</span>
              <select
                value={selectedBayFilter}
                onChange={(e) => setSelectedBayFilter(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold text-gray-700 focus:outline-none focus:ring-1 focus:ring-waypoint-yellow"
              >
                <option value="all">All Bays</option>
                {availableBays.map((bay) => (
                  <option key={bay} value={bay}>
                    {bay}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search trip, plate, driver..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-60 pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-waypoint-yellow"
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
          const isDispatched =
            trip.status === "dispatched" || trip.status === "en_route" || trip.status === "completed";

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
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${
                      trip.status === "loading"
                        ? "bg-waypoint-yellow text-waypoint-text shadow-xs"
                        : isDispatched
                        ? "bg-emerald-600 text-white"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    {trip.statusText}
                  </span>
                </div>

                {/* Bottom Info on Banner */}
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
                  <div>
                    <h3 className="text-base font-extrabold tracking-tight">{trip.vehicleModel}</h3>
                    <p className="text-[11px] text-gray-300 font-medium">
                      Plate: <span className="font-bold text-white">{trip.plateNumber}</span> • {trip.vehicleType}
                    </p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="text-gray-300 text-[9px] font-bold uppercase tracking-wider">Cut-Off</span>
                      <span className="text-xs font-black text-red-300 font-mono">{trip.cutoffTime}</span>
                    </div>
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="text-gray-400 text-[9px] font-bold uppercase tracking-wider">Depart</span>
                      <span className="text-xs sm:text-sm font-extrabold text-amber-300 font-mono">{trip.departureTime}</span>
                    </div>
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
                      <span>
                        {tripVerified} / {tripTotal} Pallets
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Weight Total</span>
                    <div className="flex items-center gap-1.5 mt-0.5 font-bold text-waypoint-text">
                      <Weight className="w-3.5 h-3.5 text-gray-500" />
                      <span>
                        {trip.currentWeightTons}T / {trip.maxWeightTons}T
                      </span>
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

                {/* Progress Bar */}
                {tripTotal > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold text-gray-500">
                      <span>Verification Progress</span>
                      <span className={tripPercent === 100 ? "text-emerald-600" : "text-waypoint-text"}>
                        {tripPercent}%
                      </span>
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
                    {trip.status === "loading" && `Loading in progress at ${trip.bay}`}
                    {(trip.status === "ready" || trip.status === "planning") &&
                      `Ready for loading crew at ${trip.bay}`}
                    {isDispatched && "Sealed and cleared for gate dispatch"}
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectTrip(trip.id)}
                    className="bg-waypoint-yellow hover:bg-[#F0B92B] text-waypoint-text font-extrabold text-xs sm:text-sm px-6 py-3 rounded-xl flex items-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer"
                  >
                    <span>{trip.status === "loading" ? "Continue Loading" : "Start Loading"}</span>
                    <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && trips.length === 0 && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl border border-gray-200/90 p-6 animate-pulse space-y-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="h-6 w-32 bg-gray-200 rounded-lg" />
                  <div className="h-6 w-20 bg-gray-200 rounded-lg" />
                </div>
                <div className="h-28 bg-gray-100 rounded-2xl" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="h-10 bg-gray-100 rounded-xl" />
                  <div className="h-10 bg-gray-100 rounded-xl" />
                  <div className="h-10 bg-gray-100 rounded-xl" />
                  <div className="h-10 bg-gray-100 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filteredTrips.length === 0 && (
          <div className="p-12 text-center bg-white rounded-3xl border border-gray-200 shadow-xs">
            <Truck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-gray-800">No vehicles matching filter</h3>
            <p className="text-xs text-gray-400 mt-1">Try resetting the filter pills or search terms</p>
          </div>
        )}
      </div>
    </div>
  );
}
