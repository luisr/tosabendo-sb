// src/app/dashboard/layout.tsx
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { User, Project } from '@/lib/types';
import { redirect } from 'next/navigation';
import { AuthProvider } from '@/hooks/use-auth-context';

// Lógica de busca de dados movida diretamente para o Server Component.
// CORRIGIDO: Simplificando a query para evitar recursão e erros de embedding.
// Agora, consultamos 'projects' diretamente e deixamos o RLS fazer o trabalho de filtragem.
async function getProjectsForUser(): Promise<Project[]> {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
        .from('projects')
        .select('*');
    
    if (error) {
        console.error('Erro ao buscar projetos do usuário:', error);
        return [];
    }
    
    return data as Project[];
}


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseServerClient();
  // CORRIGIDO: Usando getUser() para segurança, em vez de getSession().
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login');
  }

  // A busca pelo perfil do usuário na tabela 'users' é necessária para obter o 'role'.
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (profileError || !userProfile) {
    console.error("Erro ao buscar perfil do usuário:", profileError);
    // Mesmo que o usuário esteja autenticado, se não tiver perfil, não deve prosseguir.
    redirect('/login');
  }

  const projects = await getProjectsForUser();

  return (
    <AuthProvider initialUser={userProfile as User} initialProjects={projects}>
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <main className="flex-1 p-8 bg-muted/40">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
