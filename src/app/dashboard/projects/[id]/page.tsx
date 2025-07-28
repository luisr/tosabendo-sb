// src/app/dashboard/projects/[id]/page.tsx
import { getProject } from "@/lib/supabase/service";
import { ProjectDashboardClient } from "@/components/dashboard/project-dashboard-client";
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Project } from "@/lib/types";

interface ProjectDashboardPageProps {
  params: {
    id: string;
  };
}

export default async function ProjectDashboardPage({ params }: ProjectDashboardPageProps) {
  console.log(`INFO: Buscando projeto com ID da URL: ${params.id}`);

  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.log("INFO: Usuário não autenticado, redirecionando para login.");
    return redirect('/login');
  }

  const project = await getProject(params.id);

  console.log(`DEBUG: Resultado da busca por projeto (${params.id}):`, project ? 'Projeto encontrado' : 'Projeto NÃO encontrado');

  if (!project) {
    console.log(`INFO: Projeto com ID ${params.id} não encontrado.`);
    return redirect('/dashboard');
  }

  console.log("INFO: Projeto encontrado, renderizando ProjectDashboardClient.");

  // Stringify the project data before passing to the client component
  const serializedProject = JSON.stringify(project);

  return (
    <ProjectDashboardClient initialProject={serializedProject} />
  );
}
