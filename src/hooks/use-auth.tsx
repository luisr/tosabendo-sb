// src/hooks/use-auth.tsx
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User as AppUser } from '@/lib/types';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true); // Começa como true por padrão

  useEffect(() => {
    // Função para buscar o perfil do usuário de forma segura
    const getActiveUserProfile = async (supabaseUser: SupabaseUser): Promise<AppUser | null> => {
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single(); // .single() é mais seguro aqui
      
      if (error) {
        console.error("Error fetching user profile:", error.message); 
        return null;
      }
      return userProfile as AppUser;
    };

    // Ouve as mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Se houver uma sessão, busca o perfil
          const appUser = await getActiveUserProfile(session.user);
          setUser(appUser);
        } else {
          // Se não houver sessão (logout), limpa o usuário
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Limpa a inscrição quando o componente é desmontado
    return () => {
      subscription?.unsubscribe();
    };
  }, []); // A dependência vazia garante que isso só rode uma vez

  const value = {
    user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
