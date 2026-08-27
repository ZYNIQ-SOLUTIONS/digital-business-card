import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_KEY ||
    process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("CRITICAL ERROR: Supabase environment variables are missing on the client.");
    // We initialize with a dummy to avoid crashing the React tree immediately,
    // but expose a way for the auth page to know it's broken.
    return createBrowserClient("https://missing-env.supabase.co", "missing-key");
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
