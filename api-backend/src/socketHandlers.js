const { validateLocationPayload } = require("./validation");

const DISPATCHERS_ROOM = "dispatchers";

/** Handles one driver location ping; returns the ack object sent back to the driver. */
async function handleDriverLocation({ io, socket, repo, payload, now = new Date() }) {
  const user = socket.data.user;
  if (user?.role !== "driver") return { ok: false, error: "Only drivers can send location updates" };

  const check = validateLocationPayload(payload, now);
  if (!check.ok) return { ok: false, error: check.error };
  const loc = check.value;

  // Trip ownership is checked once per trip per connection
  const verified = socket.data.verifiedTrips ?? (socket.data.verifiedTrips = new Set());
  if (!verified.has(loc.tripId)) {
    if (!(await repo.isDriverOfTrip(loc.tripId, user.id))) {
      return { ok: false, error: "Trip is not assigned to you" };
    }
    verified.add(loc.tripId);
  }

  await repo.saveTripLocation(loc.tripId, loc.lat, loc.lng, loc.timestamp);
  io.to(DISPATCHERS_ROOM).emit("dispatcher_location_update", { ...loc, driverId: user.id });
  return { ok: true };
}

/** Wires connection handling: dispatchers join their room, drivers may publish their position. */
function registerSocketHandlers(io, repo, logger = console) {
  io.on("connection", (socket) => {
    const { id: userId, role } = socket.data.user;
    if (role === "dispatcher") socket.join(DISPATCHERS_ROOM);

    socket.on("driver_location_update", async (payload, ack) => {
      let result;
      try {
        result = await handleDriverLocation({ io, socket, repo, payload });
      } catch (err) {
        logger.error(`[socket] location update from ${userId} failed:`, err.message);
        result = { ok: false, error: "Could not save location" };
      }
      if (typeof ack === "function") ack(result);
    });
  });
}

module.exports = { registerSocketHandlers, handleDriverLocation, DISPATCHERS_ROOM };
