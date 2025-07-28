// src/app/dashboard/layout.tsx
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { User, Project } from '@/lib/types';
import { redirect } from 'next/navigation';
import { AuthProvider } from '@/hooks/use-auth-context';
import { getProjects } from '@/app/actions';
import { NotificationListener } from '@/components/dashboard/notification-listener';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseServerClient();

  // Correção: Desestruturação segura
  const { data } = await supabase.auth.getUser();
  const authUser = data?.user;

  if (!authUser) {
    return redirect('/');
  }

  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (!userProfile) {
    // Isso pode acontecer brevemente se o perfil ainda não foi criado.
    // Redirecionar para o login forçará o fluxo de criação de perfil.
    return redirect('/');
  }

  const user: User = userProfile;
  const projects = await getProjects();

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
