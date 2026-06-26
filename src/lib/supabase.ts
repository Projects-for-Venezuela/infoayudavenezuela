import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load .env variables in development
if (import.meta && import.meta.env && import.meta.env.MODE === 'development') {
    dotenv.config();
}

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || (import.meta.env && import.meta.env.PUBLIC_SUPABASE_URL);
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY || (import.meta.env && import.meta.env.PUBLIC_SUPABASE_ANON_KEY);

export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;
