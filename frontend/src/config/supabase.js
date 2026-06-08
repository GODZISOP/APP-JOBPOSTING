import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// ⚡ CRITICAL: Polyfill DOMException BEFORE react-native-url-polyfill loads.
// react-native-url-polyfill/auto uses DOMException internally, and Hermes/JSC 
// does not expose it globally. Using require() here bypasses Babel import hoisting.
if (typeof globalThis.DOMException === 'undefined') {
  class DOMExceptionPolyfill extends Error {
    constructor(message = '', name = 'Error') {
      super(message);
      this.name = name;
      this.message = message;
    }
  }
  globalThis.DOMException = DOMExceptionPolyfill;
  global.DOMException = DOMExceptionPolyfill;
}

// Load url polyfill AFTER DOMException is set (require is not hoisted by Babel)
require('react-native-url-polyfill/auto');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a singleton instance of the Supabase Client safely to avoid startup crashes if env vars are missing
let supabaseInstance;
try {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ [SUPABASE] Warning: Supabase URL or Anon Key is missing! Fallback to placeholders to avoid startup crash.');
  }
  supabaseInstance = createClient(
    supabaseUrl || 'https://placeholder-url.supabase.co', 
    supabaseAnonKey || 'placeholder-anon-key', 
    {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    }
  );
} catch (error) {
  console.error('❌ [SUPABASE] Fatal initialization error:', error);
  // Fallback minimal safe object to prevent app crash
  supabaseInstance = {
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      getSession: async () => ({ data: { session: null } }),
    },
    from: () => ({
      select: () => ({ order: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }) }),
    }),
  };
}

export const supabase = supabaseInstance;
