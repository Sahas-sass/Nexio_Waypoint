import { describe, expect, it } from "vitest";
import { canAccess, getRequiredRole, getRoleDashboard, hasPortal, isApiPath } from "./roleRoutes";

describe("getRoleDashboard", () => {
  it("maps portal roles to their home page", () => {
    expect(getRoleDashboard("dispatcher")).toBe("/command-center");
    expect(getRoleDashboard("loader")).toBe("/trip-queue");
    expect(getRoleDashboard("store_manager")).toBe("/overview");
  });

  it("sends roles without a portal to login", () => {
    expect(getRoleDashboard("driver")).toBe("/login");
    expect(getRoleDashboard(undefined)).toBe("/login");
    expect(getRoleDashboard("toString")).toBe("/login");
  });
});

describe("hasPortal", () => {
  it("is false for drivers and unknown roles", () => {
    expect(hasPortal("dispatcher")).toBe(true);
    expect(hasPortal("driver")).toBe(false);
    expect(hasPortal(null)).toBe(false);
  });
});

describe("getRequiredRole", () => {
  it("maps route prefixes to roles", () => {
    expect(getRequiredRole("/command-center")).toBe("dispatcher");
    expect(getRequiredRole("/tracking/abc")).toBe("dispatcher");
    expect(getRequiredRole("/trip-queue")).toBe("loader");
    expect(getRequiredRole("/orders/new")).toBe("store_manager");
    expect(getRequiredRole("/history")).toBe("store_manager");
  });

  it("does not match look-alike paths", () => {
    expect(getRequiredRole("/ordersx")).toBeNull();
    expect(getRequiredRole("/profile")).toBeNull();
    expect(getRequiredRole("/")).toBeNull();
  });
});

describe("isApiPath", () => {
  it("detects JSON endpoints", () => {
    expect(isApiPath("/api/dispatcher/fleet")).toBe(true);
    expect(isApiPath("/profile/update")).toBe(true);
    expect(isApiPath("/profile/upload-avatar")).toBe(true);
    expect(isApiPath("/profile")).toBe(false);
    expect(isApiPath("/apiary")).toBe(false);
  });
});

describe("canAccess", () => {
  it("enforces the route's role", () => {
    expect(canAccess("dispatcher", "/allocation")).toBe(true);
    expect(canAccess("loader", "/allocation")).toBe(false);
    expect(canAccess("store_manager", "/receiving")).toBe(true);
    expect(canAccess("driver", "/overview")).toBe(false);
  });

  it("allows shared pages for any role", () => {
    expect(canAccess("loader", "/profile")).toBe(true);
  });
});
