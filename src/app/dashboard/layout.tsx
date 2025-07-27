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

  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return redirect('/');
  }

  // Busca sequencial para simplificar a depuração
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (profileError || !userProfile) {
      console.error("Error fetching user profile in layout:", profileError);
      return redirect('/'); // Se não encontrar o perfil, volta para o login
  }

  const user: User = userProfile;
  const projects = await getProjectsAction();

  return (
    <AuthProvider user={user}>
      {/* Renderização condicional para garantir que o contexto não seja nulo */}
      {user && <NotificationListener />}
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar user={user} projects={projects} />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
