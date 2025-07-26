import { getAllUsers } from "@/lib/supabase/service";
import { UsersPageClient } from "./users-page-client";
import { Shell } from "@/components/ui/shell";

export default async function AdminSettingsPage() {
  
  // Busca os dados no servidor
  const initialUsers = await getAllUsers();

  return (
    <Shell>
      <UsersPageClient initialUsers={initialUsers} />
    </Shell>
  );
}
