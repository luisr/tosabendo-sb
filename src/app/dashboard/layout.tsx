import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { getProjects } from '@/lib/supabase/service';
import { createClient } from '@/lib/supabase/server'; // Corrigido
import type { User } from '@/lib/types';
import { redirect } from 'next/navigation';
import { AuthProvider } from '@/hooks/use-auth-context';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return redirect('/');
  }

  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  const projects = await getProjects();
  const user: User | null = userProfile;

  return (
    <AuthProvider user={user}>
      <div className="flex min-h-screen bg-background">
        {user && <DashboardSidebar user={user} projects={projects} />}
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
