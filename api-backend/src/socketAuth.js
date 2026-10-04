/**
 * socket.io middleware: the client must connect with
 *   io(API_URL, { auth: { token: <supabase access_token> } })
 * The token is validated with Supabase Auth and the user's profile role is attached to socket.data.
 */
function createSocketAuth(repo, logger = console) {
  return async function authenticateSocket(socket, next) {
    const token = socket.handshake?.auth?.token;
    if (typeof token !== "string" || token.length === 0) {
      return next(new Error("unauthorized: missing token"));
    }
    try {
      const user = await repo.getUserFromToken(token);
      if (!user) return next(new Error("unauthorized: invalid token"));
      const role = await repo.getProfileRole(user.id);
      if (!role) return next(new Error("unauthorized: no profile"));
      socket.data.user = { id: user.id, role };
      return next();
    } catch (err) {
      logger.error("[socket] auth failed:", err.message);
      return next(new Error("unauthorized"));
    }
  };
}

module.exports = { createSocketAuth };
