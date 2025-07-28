// src/app/dashboard/admin/users/page.tsx
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { UsersPageClient } from "./users-page-client";
import { redirect } from 'next/navigation';

export default async function AdminUsersPage() {
  const supabase = createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login'); // Ou sua página de login
  }

  // Apenas Admins podem acessar esta página
  if (user.role !== 'Admin') {
    return redirect('/dashboard');
  }

  const { data: users, error } = await supabase.from('users').select('*');

  if (error) {
    console.error("Erro ao buscar usuários (server component):", error);
    // Pode-se renderizar uma página de erro aqui
    return <div>Ocorreu um erro ao carregar os usuários.</div>;
  }

  return <UsersPageClient initialUsers={users ?? []} />;
}
