"use client";

import { useState } from "react";
import { Truck, CheckCircle2, ShieldCheck, Search, ArrowLeft, Eye, History } from "lucide-react";
import { PastLogEntry } from "../types";
import { filterLogs, summarizeLogs, LogsPeriodFilter } from "../utils/logFilters";

interface LoadingLogsViewProps {
  logs: PastLogEntry[];
  isLoading: boolean;
  onBackToQueue: () => void;
  onSelectLogForAudit: (log: PastLogEntry) => void;
}

export default function LoadingLogsView({
  logs,
  isLoading,
  onBackToQueue,
  onSelectLogForAudit,
}: LoadingLogsViewProps) {
  const [logsFilter, setLogsFilter] = useState<LogsPeriodFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Pure filtering and aggregation utilities
  const filteredLogs = filterLogs(logs, logsFilter, searchQuery);
  const summary = summarizeLogs(logs);

  return (
    <div className="space-y-6 font-sans">
      {/* Header & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-waypoint-orange text-[10px] font-extrabold tracking-widest uppercase mb-1">
            Warehouse Audit Trail
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-waypoint-text tracking-tight">
            Loading & Dispatch Logs
          </h1>
          <p className="text-waypoint-secondary text-xs sm:text-sm font-medium mt-0.5">
            Complete audit history of verified sequence loads, sealed vehicles, and past dispatch records
          </p>
        </div>

        <button
          type="button"
          onClick={onBackToQueue}
          className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-gray-500" />
          <span>Trip Queue</span>
        </button>
      </div>

      {/* 3 Top Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5 text-waypoint-orange" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Dispatched Vehicles
            </p>
            <p className="text-sm font-extrabold text-waypoint-text">{summary.tripCount} Trips Total</p>
            <p className="text-[10px] text-emerald-600 font-semibold">
              {summary.fullyVerifiedTrips} fully verified
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Audited Pallets
            </p>
            <p className="text-sm font-extrabold text-waypoint-text">
              {summary.verifiedPallets.toLocaleString()} Pallets
            </p>
            <p className="text-[10px] text-emerald-600 font-semibold">
              of {summary.totalPallets.toLocaleString()} loaded
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Security Seals
            </p>
            <p className="text-sm font-extrabold text-waypoint-text">{summary.tripCount} Logged</p>
            <p className="text-[10px] text-blue-600 font-semibold">
              {summary.discrepancyCount} with exceptions
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-3.5 shadow-2xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search logs by Trip, Plate, Driver, or Seal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200/90 rounded-xl text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-waypoint-yellow/50"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setLogsFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              logsFilter === "all"
                ? "bg-waypoint-text text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Logs ({logs.length})
          </button>
          <button
            type="button"
            onClick={() => setLogsFilter("today")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              logsFilter === "today"
                ? "bg-waypoint-text text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setLogsFilter("past")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              logsFilter === "past"
                ? "bg-waypoint-text text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Past Shifts
          </button>
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-4">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="bg-white border border-gray-200/90 rounded-2xl sm:rounded-3xl p-5 shadow-xs hover:border-gray-300 transition-all space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-extrabold text-sm sm:text-base text-gray-900 tracking-tight">
                  {log.tripNumber}
                </span>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                  {log.bay}
                </span>
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md border border-gray-200">
                  {log.plateNumber}
                </span>
                <span className="text-xs text-gray-400 font-medium">{log.shift}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="capitalize">{log.status}</span>
                </span>
                <span className="text-xs text-gray-400 font-medium">{log.dispatchedAt}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                  Vehicle
                </span>
                <span className="font-bold text-gray-800 mt-0.5 block">{log.vehicleModel}</span>
                <span className="text-[10px] text-gray-500">{log.vehicleType}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                  Driver
                </span>
                <span className="font-bold text-gray-800 mt-0.5 block">{log.driverName}</span>
                {log.driverPhone && <span className="text-[10px] text-gray-500">{log.driverPhone}</span>}
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                  Security Seal
                </span>
                <span className="font-mono font-bold text-blue-700 mt-0.5 inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {log.sealNumber}
                </span>

              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                  Pallets & Weight
                </span>
                <span
                  className={`font-bold mt-0.5 block ${
                    log.verifiedPallets >= log.totalPallets ? "text-emerald-700" : "text-amber-700"
                  }`}
                >
                  {log.verifiedPallets}/{log.totalPallets} Verified
                </span>
                <span className="text-[10px] text-gray-500">
                  {log.totalWeightKg.toLocaleString()} kg Total
                </span>
              </div>
            </div>

            <div className="bg-[#FAF9F5] border border-[#ECECE6] rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Delivery Stores ({log.storesCount})
                </span>
                <p className="text-xs font-semibold text-gray-800 truncate mt-0.5">
                  {log.storesSummary}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <span className="text-[10px] text-gray-400 font-semibold block">Signed off by</span>
                  <span className="text-xs font-bold text-gray-700">{log.signature}</span>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectLogForAudit(log)}
                  className="px-3.5 py-1.5 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-gray-500" />
                  <span>Audit Details</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {isLoading && logs.length === 0 && (
          <div className="p-12 text-center bg-white rounded-3xl border border-gray-200 shadow-xs text-xs font-bold text-gray-500">
            Loading dispatch logs...
          </div>
        )}

        {!isLoading && filteredLogs.length === 0 && (
          <div className="p-12 text-center bg-white rounded-3xl border border-gray-200 shadow-xs">
            <History className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-gray-800">
              {logs.length === 0 ? "No dispatches recorded yet" : "No logs found"}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {logs.length === 0
                ? "Sealed and dispatched trips will appear here"
                : "Try adjusting your search query or filter"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
