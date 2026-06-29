import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Loud failure on purpose: a silently-missing config means auth would
  // appear to "hang" with no explanation. Better to fail at startup.
  console.error(
    "Missing Supabase env vars. Copy .env.example to .env and fill in your project's URL and anon key."
  );
}

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "");
