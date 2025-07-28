// src/lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createSupabaseServerClient = () => { // Renomeado
  const cookieStore = cookies();
  // ... (resto da função mantido)
};
