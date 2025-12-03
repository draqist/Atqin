import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Supabase client instance for interacting with Supabase services.
 * Initialized with environment variables.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);