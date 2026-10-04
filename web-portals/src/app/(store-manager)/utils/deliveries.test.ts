import { describe, expect, it } from "vitest";
import type { TripStop } from "../types";
import { stopStatusLabel, todaysStops, tripStatusLabel } from "./deliveries";

const stop = (id: string, extra: Partial<TripStop> = {}, date = "2026-10-04"): TripStop => ({
  id, order_id: null, stop_sequence: 1, status: "PENDING", estimated_arrival: null, completed_at: null,
  trip: { trip_number: "T", trip_date: date, status: "en_route", eta_time: null, vehicle: null }, ...extra,
});

describe("todaysStops", () => {
  it("keeps today's stops ordered active first then by ETA", () => {
    const stops = [
      stop("done", { status: "COMPLETED" }),
      stop("late", { estimated_arrival: "2026-10-04T08:00:00Z" }),
      stop("early", { estimated_arrival: "2026-10-04T02:00:00Z" }),
      stop("noeta"),
      stop("active", { status: "IN_PROGRESS" }),
      stop("other-day", {}, "2026-10-03"),
      stop("no-trip", { trip: null }),
    ];
    expect(todaysStops(stops, "2026-10-04").map((s) => s.id)).toEqual(["active", "early", "late", "noeta", "done"]);
  });
  it("breaks ties with stop sequence", () => {
    expect(todaysStops([stop("b", { stop_sequence: 3 }), stop("a", { stop_sequence: 1 })], "2026-10-04").map((s) => s.id)).toEqual(["a", "b"]);
  });
});

describe("labels", () => {
  it("maps stop and trip statuses", () => {
    expect(stopStatusLabel("IN_PROGRESS")).toBe("Arriving now");
    expect(stopStatusLabel("WEIRD")).toBe("WEIRD");
    expect(tripStatusLabel("en_route")).toBe("On the road");
    expect(tripStatusLabel("x")).toBe("x");
    expect(tripStatusLabel(null)).toBe("Unknown");
  });
});
