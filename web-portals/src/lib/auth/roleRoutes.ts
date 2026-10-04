export type PortalRole = "dispatcher" | "loader" | "store_manager";

export const LOGIN_PATH = "/login";

const ROLE_DASHBOARDS: Record<PortalRole, string> = {
  dispatcher: "/command-center",
  loader: "/trip-queue",
  store_manager: "/overview",
};

const ROLE_ROUTE_PREFIXES: Record<PortalRole, string[]> = {
  dispatcher: ["/command-center", "/allocation", "/deferrals", "/tracking"],
  loader: ["/trip-queue"],
  store_manager: ["/overview", "/orders", "/receiving", "/alerts", "/history"],
};

/** Paths that answer with JSON and must return 401/403 instead of redirecting. */
const API_PREFIXES = ["/api/", "/profile/update", "/profile/upload-avatar"];

function matchesPrefix(path: string, prefix: string): boolean {
  return path === prefix || path.startsWith(`${prefix}/`);
}

/** Home page of the web portal for a role, or the login page when the role has no portal (e.g. driver). */
export function getRoleDashboard(role: string | null | undefined): string {
  return role && Object.hasOwn(ROLE_DASHBOARDS, role) ? ROLE_DASHBOARDS[role as PortalRole] : LOGIN_PATH;
}

/** True when the role has a web portal (drivers use the mobile app). */
export function hasPortal(role: string | null | undefined): boolean {
  return getRoleDashboard(role) !== LOGIN_PATH;
}

/** The role a page path is reserved for, or null when any signed-in user may open it. */
export function getRequiredRole(path: string): PortalRole | null {
  for (const role of Object.keys(ROLE_ROUTE_PREFIXES) as PortalRole[]) {
    if (ROLE_ROUTE_PREFIXES[role].some((prefix) => matchesPrefix(path, prefix))) return role;
  }
  return null;
}

export function isApiPath(path: string): boolean {
  return API_PREFIXES.some((prefix) => path === prefix.replace(/\/$/, "") || path.startsWith(prefix));
}

/** Whether a user with `role` may open `path`. */
export function canAccess(role: string | null | undefined, path: string): boolean {
  const required = getRequiredRole(path);
  return required === null || required === role;
}
