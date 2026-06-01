import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Clear debug logger to trace values on your live site
console.log("Supabase URL Detected:", supabaseUrl ? "YES" : "NO");
console.log("Supabase Key Detected:", supabaseAnonKey ? "YES" : "NO");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("CRITICAL ERROR: Supabase environment variables are missing completely!");
}

export const supabase = createClient(
  supabaseUrl || "",
  supabaseAnonKey || ""
);