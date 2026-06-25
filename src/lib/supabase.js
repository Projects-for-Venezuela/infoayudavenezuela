import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

let supabaseInstance = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    // Validar que tenga un formato de URL correcto antes de inicializar
    new URL(supabaseUrl);
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    console.error("Invalid PUBLIC_SUPABASE_URL configured:", e);
  }
} else {
  console.warn("Supabase credentials missing. Operating in offline/local fallback mode.");
}

export const supabase = supabaseInstance;
