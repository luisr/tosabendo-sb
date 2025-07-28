// middleware.ts
import { type NextRequest } from 'next/server'
import { createSupabaseMiddlewareClient } from '@/lib/supabase/middleware' // Corrigido

export async function middleware(request: NextRequest) {
  const { supabase, response } = createSupabaseMiddlewareClient(request) // Corrigido
  await supabase.auth.getSession()
  return response
}

// ... (config mantida) ...
