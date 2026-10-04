/**
 * Database access for the realtime server. Uses the service-key client, so every
 * function here must only be called after the caller has been authorised.
 */
function createRepository(supabase) {
  return {
    /** Validates a Supabase access token with the Auth server; returns the user or null. */
    async getUserFromToken(token) {
      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data?.user) return null;
      return data.user;
    },

    async getProfileRole(userId) {
      const { data, error } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
      if (error) throw new Error(error.message);
      return data?.role ?? null;
    },

    async isDriverOfTrip(tripId, userId) {
      const { data, error } = await supabase
        .from("trips")
        .select("id")
        .eq("id", tripId)
        .eq("driver_id", userId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return Boolean(data);
    },

    async saveTripLocation(tripId, lat, lng, recordedAt) {
      const { error } = await supabase
        .from("trips")
        .update({
          current_lat: lat,
          current_lng: lng,
          last_lat: lat,
          last_lng: lng,
          last_ping_at: recordedAt,
          last_updated: new Date().toISOString(),
          connection_status: "online",
        })
        .eq("id", tripId);
      if (error) throw new Error(error.message);
    },
  };
}

module.exports = { createRepository };
