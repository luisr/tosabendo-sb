// src/app/dashboard/layout.tsx
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { createClient } from '@/lib/supabase/server';
import type { User, Project } from '@/lib/types';
import { redirect } from 'next/navigation';
import { AuthProvider } from '@/hooks/use-auth-context';
import { getProjectsAction } from '@/app/actions';
import { NotificationListener } from '@/components/dashboard/notification-listener';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  let user: User | null = null;
  let projects: Project[] = [];

  try {
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return redirect('/');
    }

    // Tenta buscar o perfil do usuário e os projetos
    const userProfilePromise = supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();
      
    const projectsPromise = getProjectsAction();

    // Executa ambas as promessas em paralelo para melhor performance
    const [userProfileResult, projectsResult] = await Promise.allSettled([
      userProfilePromise,
      projectsPromise,
    ]);

    if (userProfileResult.status === 'fulfilled' && userProfileResult.value.data) {
      user = userProfileResult.value.data as User;
    } else {
      console.error("Failed to fetch user profile:", userProfileResult.status === 'rejected' ? userProfileResult.reason : 'No data');
    }

    if (projectsResult.status === 'fulfilled') {
      projects = projectsResult.value;
    } else {
      console.error("Failed to fetch projects:", projectsResult.reason);
    }

  } catch (error: any) {
    // CORRIGIDO: Log de erro robusto que mostra a mensagem real
    console.error("Error in DashboardLayout data fetching:", error.message || JSON.stringify(error));
    // Em um cenário de produção, você poderia redirecionar para uma página de erro
    // ou mostrar um estado de erro na UI. Por enquanto, continuamos com dados vazios.
  }
  
  // Se o usuário não pôde ser carregado, redireciona para o login.
  if (!user) {
    return redirect('/');
  }

  return (
    <AuthProvider user={user}>
      <NotificationListener />
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar user={user} projects={projects} />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
