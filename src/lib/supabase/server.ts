// src/lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createSupabaseServerClient = () => {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // Await the cookieStore.get call
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            // Await the cookieStore.set call
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // O erro "ReadonlyRequestCookies" pode ocorrer em certas rotas do Next.js.
            // Ignorá-lo é geralmente seguro, pois o cliente Supabase tentará
            // definir cookies de várias maneiras.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            // Await the cookieStore.set call
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // O erro "ReadonlyRequestCookies" pode ocorrer em certas rotas do Next.js.
            // Ignorá-lo é geralmente seguro.
          }
        },
      },
    }
  );
};
