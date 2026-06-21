import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Standard client for public/user actions
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for bypassing RLS and doing admin operations
// This should ONLY be used in Server Components or API Routes
export const supabaseAdmin = typeof window === 'undefined'
  ? createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;
