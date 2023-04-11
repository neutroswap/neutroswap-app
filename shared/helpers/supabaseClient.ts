import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_SERVICE_KEY } from '@/shared/helpers/constants';

if (!SUPABASE_URL) throw new Error("Missing env.SUPABASE_URL");
if (!SUPABASE_SERVICE_KEY)
  throw new Error("Missing env.SUPABASE_SERVICE_KEY");

export const supabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY
);
