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

// Create a singleton instance of the Supabase Client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
