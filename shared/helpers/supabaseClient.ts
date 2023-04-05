import { createClient } from "@supabase/supabase-js";
import { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } from '@/shared/helpers/constants';

if (!NEXT_PUBLIC_SUPABASE_URL) throw new Error("Missing env.NEXT_APP_SUPABASE_URL");
if (!NEXT_PUBLIC_SUPABASE_ANON_KEY)
  throw new Error("Missing env.NEXT_APP_SUPABASE_ANON_KEY");

export const supabaseClient = createClient(
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY
);
