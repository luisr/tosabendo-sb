// src/app/dashboard/admin/page.tsx
import { getProjectsAction } from '@/app/actions';
import { getAllUsers } from '@/lib/supabase/service';
import type { Project, User } from "@/lib/types";
import { KpiCard } from '@/components/dashboard/kpi-card';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Folder, User as UserIcon, CheckSquare, Settings } from "lucide-react";
import { AdminDashboardClient } from './admin-dashboard-client';

export default async function AdminDashboardPage() {
  
  const projects: Project[] = await getProjectsAction();
  const users: User[] = await getAllUsers();
  
  const totalProjects = projects.length;
  const totalUsers = users.length;
  const totalTasks = projects.reduce((acc, p) => acc + (p.tasks?.length ?? 0), 0);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Painel do Super Admin</h1>
          <p className="text-muted-foreground">Visão geral e gerenciamento de todo o sistema.</p>
        </div>
        <Link href="/dashboard/admin/settings">
            <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Configurações do Sistema
            </Button>
        </Link>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
          <KpiCard title="Total de Projetos" value={totalProjects} icon={Folder} color="blue" />
          <KpiCard title="Total de Usuários" value={totalUsers} icon={UserIcon} color="purple" />
          <KpiCard title="Total de Tarefas" value={totalTasks} icon={CheckSquare} color="green" />
      </div>

      <AdminDashboardClient initialProjects={projects} initialUsers={users} />
    </div>
  );
}
