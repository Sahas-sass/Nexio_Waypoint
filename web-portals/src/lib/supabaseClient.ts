import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Initialize and export the Supabase browser client with cookie session support
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);