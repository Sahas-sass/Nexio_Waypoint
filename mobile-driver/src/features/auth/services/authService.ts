import { fetchProfile, type ProfileWithRole, type TripQueryClient } from '@/features/trip/services/tripService';

import { normalizeIdentifier } from '../utils/normalizeIdentifier';

export const NOT_A_DRIVER_MESSAGE = 'This app is for drivers only. Please use the Waypoint web portal.';

export interface AuthClient extends TripQueryClient {
  auth: {
    signInWithPassword(credentials: { email: string; password: string }): Promise<{
      data: { user: { id: string } | null };
      error: { message: string } | null;
    }>;
    signOut(): Promise<{ error: { message: string } | null }>;
  };
}

/**
 * Load the profile and make sure the account is a driver. Any other role is
 * signed out again so it never holds a session in this app.
 */
export async function requireDriver(client: AuthClient, userId: string): Promise<ProfileWithRole> {
  const profile = await fetchProfile(client, userId);
  if (profile.role !== 'driver') {
    await client.auth.signOut();
    throw new Error(NOT_A_DRIVER_MESSAGE);
  }
  return profile;
}

/** Supabase email + password sign-in restricted to driver profiles. */
export async function signInDriver(client: AuthClient, identifier: string, password: string): Promise<ProfileWithRole> {
  const email = normalizeIdentifier(identifier);
  if (!email) throw new Error('Enter your driver ID or email.');
  if (!password) throw new Error('Enter your password.');

  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.user) throw new Error(error?.message ?? 'Sign in failed.');
  return requireDriver(client, data.user.id);
}
