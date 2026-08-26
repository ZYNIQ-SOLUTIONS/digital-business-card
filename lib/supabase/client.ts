import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // Support both standard Next.js keys and Netlify Supabase integration keys (SUPABASE_URL, SUPABASE_ANON_KEY)
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "https://placeholder.supabase.co";

  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_KEY ||
    process.env.SUPABASE_KEY ||
    "placeholder-anon-key";

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
