import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/database.types";
import { NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_URL } from "./constants";

if (!NEXT_PUBLIC_SUPABASE_URL) throw new Error("Missing env.NEXT_APP_SUPABASE_URL");
if (!NEXT_PUBLIC_SUPABASE_ANON_KEY)
  throw new Error("Missing env.NEXT_APP_SUPABASE_ANON_KEY");

export const supabaseClient = createClient(
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY
);
