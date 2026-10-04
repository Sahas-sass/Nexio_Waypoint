"use client";

import { useState } from "react";
import { Warehouse, Truck, Clock, Search, RefreshCw } from "lucide-react";
import { TripVehicle } from "../types";
import { getEarliestCutoffTrip, filterTrips, summarizeQueue, TripStatusFilter } from "../utils/tripQueueHelpers";
import TripCard from "./TripCard";

interface TripQueueViewProps {
  trips: TripVehicle[];
  onSelectTrip: (tripId: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  assignedBay?: string | null;
  stationName?: string | null;
}

export default function TripQueueView({
  trips,
  onSelectTrip,
  onRefresh,
  isLoading,
  assignedBay,
  stationName,
}: TripQueueViewProps) {
  const [activeFilter, setActiveFilter] = useState<TripStatusFilter>("all");
  const [selectedBayFilter, setSelectedBayFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Unique bays in current trips list
  const availableBays = Array.from(new Set(trips.map((t) => t.bay))).filter(Boolean);

  // Filtered trips via pure helper utility
  const filteredTrips = filterTrips(trips, activeFilter, selectedBayFilter, searchQuery);

  const { loading: loadingCount, ready: readyCount, dispatched: dispatchedCount } = summarizeQueue(trips);

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
              {assignedBay || "No bay assigned"}
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
            <p className="text-sm font-extrabold text-waypoint-text">{assignedBay || "Not assigned"}</p>
            <p className="text-[10px] text-gray-500 font-semibold">{stationName || "No station set in profile"}</p>
          </div>
        </div>

        {/* Metric 2: Vehicles in Queue */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-yellow-50 border border-yellow-100 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5 text-waypoint-yellow" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Vehicles in Queue</p>
            <p className="text-sm font-extrabold text-waypoint-text">{trips.length} Trips</p>
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
              {nextCutoffTrip ? nextCutoffTrip.cutoffTime || "Not set" : "All Clear"}
            </p>
            <p className="text-[10px] text-gray-500 font-medium truncate">
              {nextCutoffTrip
                ? `${nextCutoffTrip.tripNumber} • Depart ${nextCutoffTrip.departureTime || "—"}`
                : "All shipments dispatched"}
            </p>
          </div>
        </div>
      </div>

      {/* Bay Selector & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {([
            { key: "all", label: `All (${trips.length})` },
            { key: "loading", label: `In Progress (${loadingCount})` },
            { key: "ready", label: `Ready (${readyCount})` },
            { key: "dispatched", label: `Dispatched (${dispatchedCount})` },
          ] as { key: TripStatusFilter; label: string }[]).map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setActiveFilter(f.key)}
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
        {filteredTrips.map((trip) => (
          <TripCard key={trip.id} trip={trip} onSelect={onSelectTrip} />
        ))}

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
            <h3 className="text-sm font-bold text-gray-800">
              {trips.length === 0 ? "No trips scheduled" : "No vehicles matching filter"}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {trips.length === 0
                ? "Trips appear here once dispatch publishes the delivery plan"
                : "Try resetting the filter pills or search terms"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
