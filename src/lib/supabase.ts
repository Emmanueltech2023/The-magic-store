import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing. App may not function correctly.");
}

export const supabase = createClient(
  supabaseUrl || "https://vrcpgcfsxpfnbqvdjobw.supabase.co",
  supabaseAnonKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyY3BnY2ZzeHBmbmJxdmRqb2J3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NDE1NDQsImV4cCI6MjA5MzQxNzU0NH0.SnmjvQ03oPsiXxlp5IpeILy2GfX5FsbnxL02hF27WWE"
);
