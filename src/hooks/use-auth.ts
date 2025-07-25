// src/hooks/use-auth.ts
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/lib/supabase/config';
import type { User as AuthUser } from '@supabase/supabase-js';
import type { User as AppUser } from '@/lib/types'; // Nosso tipo de usuário da aplicação

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca a sessão inicial para verificar se o usuário já está logado
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Mapeia o usuário do Supabase para o nosso tipo AppUser
        // Você pode precisar buscar mais detalhes do seu banco de dados aqui
        const appUser: AppUser = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || 'Usuário',
          avatar: session.user.user_metadata?.avatar_url || '',
          // Adicione outras propriedades padrão se necessário
          status: 'active',
          role: 'Admin', // Defina um papel padrão ou busque do seu DB
        };
        setUser(appUser);
      }
      setLoading(false);
    };

    getInitialSession();

    // Escuta por mudanças no estado de autenticação (login, logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
           const appUser: AppUser = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || 'Usuário',
            avatar: session.user.user_metadata?.avatar_url || '',
            status: 'active',
            role: 'Admin',
          };
          setUser(appUser);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Limpa o listener quando o componente é desmontado
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// O hook useAuth agora consome o contexto
export const useAuth = () => {
  return useContext(AuthContext);
};
