let clientPromise = null;

export function getSupabase() {
  if (clientPromise) return clientPromise;

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase credentials missing. Operating in offline/local fallback mode.");
    clientPromise = Promise.resolve(null);
    return clientPromise;
  }

  clientPromise = (async () => {
    try {
      new URL(supabaseUrl);
      const { createClient } = await import('@supabase/supabase-js');
      return createClient(supabaseUrl, supabaseAnonKey);
    } catch (e) {
      console.error("Supabase client init failed:", e);
      return null;
    }
  })();

  return clientPromise;
}
