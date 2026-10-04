"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UserProfile } from "./types";
import { 
  fetchCurrentUserProfile, 
  signOutUser, 
  uploadUserAvatar, 
  updateUserProfile,
  getDashboardUrlForRole,
  type ProfileUpdates,
} from "./userProfileService";

export function useUserProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      const data = await fetchCurrentUserProfile();
      setProfile(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load user profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial load; state is only set from the promise callbacks
    fetchCurrentUserProfile()
      .then((data) => setProfile(data))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load user profile"))
      .finally(() => setLoading(false));
  }, []);

  const uploadAvatar = useCallback(async (file: File) => {
    try {
      const publicUrl = await uploadUserAvatar(file);
      setProfile((prev) => (prev ? { ...prev, avatarUrl: publicUrl } : null));
      return publicUrl;
    } catch (err) {
      console.error("Avatar upload error:", err);
      throw err;
    }
  }, []);

  const updateProfile = useCallback(async (updates: ProfileUpdates) => {
    try {
      await updateUserProfile(updates);
      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (err) {
      console.error("Profile update error:", err);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOutUser();
    } catch {
      // ignore
    }
    router.push("/login");
  }, [router]);

  const dashboardUrl = profile ? getDashboardUrlForRole(profile.role) : "/login";

  return {
    profile,
    loading,
    error,
    dashboardUrl,
    uploadAvatar,
    updateProfile,
    logout,
    refetch: loadProfile,
  };
}
