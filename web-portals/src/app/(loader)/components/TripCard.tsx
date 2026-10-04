"use client";

import { Layers, Weight, ShieldCheck, ChevronRight } from "lucide-react";
import { TripVehicle } from "../types";
import { isTripDispatched, isTripReady, tripProgress } from "../utils/tripQueueHelpers";

interface TripCardProps {
  trip: TripVehicle;
  onSelect: (tripId: string) => void;
}

export default function TripCard({ trip, onSelect }: TripCardProps) {
  const { verified: tripVerified, total: tripTotal, percent: tripPercent } = tripProgress(trip);
  const isDispatched = isTripDispatched(trip.status);

  return (
    <div
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
              {trip.bay || "No bay"}
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
              <span className="text-xs font-black text-red-300 font-mono">{trip.cutoffTime || "—"}</span>
            </div>
            <div className="flex items-center justify-end gap-1.5">
              <span className="text-gray-400 text-[9px] font-bold uppercase tracking-wider">Depart</span>
              <span className="text-xs sm:text-sm font-extrabold text-amber-300 font-mono">{trip.departureTime || "—"}</span>
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
            {trip.status === "loading" && `Loading in progress at ${trip.bay || "dock"}`}
            {isTripReady(trip.status) && `Ready for loading crew at ${trip.bay || "dock"}`}
            {isDispatched && "Sealed and cleared for gate dispatch"}
          </div>

          <button
            type="button"
            onClick={() => onSelect(trip.id)}
            className="bg-waypoint-yellow hover:bg-[#F0B92B] text-waypoint-text font-extrabold text-xs sm:text-sm px-6 py-3 rounded-xl flex items-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer"
          >
            <span>{trip.status === "loading" ? "Continue Loading" : "Start Loading"}</span>
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}
