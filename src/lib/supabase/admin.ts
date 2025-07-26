// src/lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js';

// Este cliente usa a chave de serviço e DEVE ser usado apenas no lado do servidor.
// Ele ignora todas as políticas de RLS.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!, // Corrigido para usar a variável segura
  { auth: { persistSession: false } }
);
