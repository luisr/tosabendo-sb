// src/app/dashboard/projects/[id]/page.tsx
import { getProject } from "@/lib/supabase/service";
import { ProjectDashboardClient } from "@/components/dashboard/project-dashboard-client";
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface ProjectDashboardPageProps {
  params: {
    id: string;
  };
}

export default async function ProjectDashboardPage({ params }: ProjectDashboardPageProps) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const project = await getProject(params.id);

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Projeto não encontrado</h1>
          <p className="text-muted-foreground">O projeto que você está procurando não existe ou você não tem permissão para vê-lo.</p>
        </div>
      </div>
    );
  }

  return <ProjectDashboardClient project={project} />;
}
