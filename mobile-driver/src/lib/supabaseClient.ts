import 'expo-sqlite/localStorage/install';

import { createClient } from '@supabase/supabase-js';

const rawUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const rawKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Fallback to placeholder endpoint if env is missing so offline-first local mode does not crash
const supabaseUrl = rawUrl && rawUrl.startsWith('http') ? rawUrl : 'https://placeholder.supabase.co';
const supabaseAnonKey = rawKey || 'placeholder-anon-key';

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  !rawUrl.includes('placeholder') &&
  !rawUrl.includes('your-supabase-project')
);

if (!isSupabaseConfigured && process.env.NODE_ENV !== 'production') {
  console.warn('Running with placeholder Supabase credentials. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in mobile-driver/.env for live backend integration.');
}

/**
 * Supabase client for the driver app. The session is persisted with
 * expo-sqlite's localStorage polyfill (browser localStorage on web) so a
 * driver stays signed in across restarts and while offline.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type SupabaseClientLike = typeof supabase;
