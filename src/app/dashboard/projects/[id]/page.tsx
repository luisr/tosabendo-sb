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
  // Awaiting params is not strictly necessary here as per Next.js docs for route params,
  // but adding await to be explicit based on the warning.
  const projectId = await params.id;
  console.log(`INFO: Buscando projeto com ID da URL: ${projectId}`);

  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.log("INFO: Usuário não autenticado, redirecionando para login.");
    return redirect('/login');
  }

  // Pass the awaited projectId to getProject
  const project = await getProject(projectId);

  console.log(`DEBUG: Resultado da busca por projeto (${projectId}):`, project ? 'Projeto encontrado' : 'Projeto NÃO encontrado');

  if (!project) {
    console.log(`INFO: Projeto com ID ${projectId} não encontrado.`);
    return redirect('/dashboard');
  }

  console.log("INFO: Projeto encontrado, renderizando ProjectDashboardClient.");

  // Stringify the project data before passing to the client component
  const serializedProject = JSON.stringify(project);

  return (
    <ProjectDashboardClient initialProject={serializedProject} />
  );
}
