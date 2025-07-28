// src/hooks/use-auth-context.tsx
'use client';

import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import type { User, Project } from '@/lib/types';
// Removemos a chamada de actions daqui, pois os dados virão do layout

interface AuthContextType {
  user: User | null;
  projects: Project[];
  loading: boolean;
  refreshProjects: () => void; // A lógica será implementada se necessário
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  initialUser: User;
  initialProjects: Project[];
}

export const AuthProvider = ({ children, initialUser, initialProjects }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(initialUser);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [loading, setLoading] = useState(false); // Carregamento inicial já foi feito no servidor

  // Função para re-buscar projetos (pode ser chamada após criar um novo projeto)
  const refreshProjects = useCallback(async () => {
    // A lógica para buscar projetos do lado do cliente pode ser adicionada aqui
    // usando uma nova server action `getProjectsAction` se necessário.
    // Por enquanto, vamos manter simples.
    console.log("Atualizando projetos...");
  }, []);

  return (
    <AuthContext.Provider value={{ user, projects, loading, refreshProjects }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
