// middleware.ts
import { type NextRequest } from 'next/server';
import { createSupabaseMiddlewareClient } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // Esta função `createClient` (agora `createSupabaseMiddlewareClient`) lida com a criação de um cliente Supabase
  // que pode ler e escrever cookies na middleware.
  const { supabase, response } = createSupabaseMiddlewareClient(request);

  // O Supabase Auth Helpers precisa rodar `getSession` para atualizar
  // os cookies de autenticação em cada requisição.
  // Isso garante que a sessão do usuário permaneça válida.
  await supabase.auth.getSession();

  // Retorna a resposta, que pode ter sido modificada com cookies de sessão atualizados.
  return response;
}

export const config = {
  matcher: [
    /*
     * Faz a correspondência de todos os caminhos de requisição, exceto os que começam com:
     * - _next/static (arquivos estáticos)
     * - _next/image (arquivos de otimização de imagem)
     * - favicon.ico (arquivo de favicon)
     * - api/ (rotas de API, para evitar que a middleware interfira)
     * Sinta-se à vontade para modificar este padrão para incluir mais caminhos.
     */
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};
