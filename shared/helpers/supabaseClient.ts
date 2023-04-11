import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_SERVICE_KEY } from '@/shared/helpers/constants';

if (!SUPABASE_URL) throw new Error("Missing env.NEXT_APP_SUPABASE_URL");
if (!SUPABASE_SERVICE_KEY)
  throw new Error("Missing env.NEXT_APP_SUPABASE_ANON_KEY");

export const supabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY
);
