// src/hooks/use-auth.tsx
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client'; // Corrected import
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User as AppUser } from '@/lib/types';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createSupabaseBrowserClient(); // Corrected function call
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getActiveUserProfile = async (supabaseUser: SupabaseUser | null): Promise<AppUser | null> => {
      if (!supabaseUser) {
        return null;
      }

      // Corrigido: Usar .maybeSingle() para evitar erros quando o perfil ainda não existe.
      // Ele retorna null em vez de lançar um erro, tornando o código mais resiliente.
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user profile:", error.message);
        return null;
      }
      return userProfile as AppUser;
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setLoading(true);
        const appUser = await getActiveUserProfile(session?.user ?? null);
        setUser(appUser);
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

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
