// src/app/dashboard/layout.tsx
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { createClient } from '@/lib/supabase/server';
import type { User } from '@/lib/types';
import { redirect } from 'next/navigation';
import { AuthProvider } from '@/hooks/use-auth-context';
import { NotificationListener } from '@/components/dashboard/notification-listener';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    return redirect('/');
  }

  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (!userProfile) {
    console.error("Layout error: User profile not found for authenticated user.");
    return redirect('/');
  }

  const user: User = userProfile;

  return (
    // O AuthProvider agora gerencia o carregamento dos projetos no cliente
    <AuthProvider user={user}>
      <NotificationListener />
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar /> {/* Não precisa mais de props */}
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
