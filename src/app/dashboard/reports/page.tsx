// src/app/dashboard/reports/page.tsx
import { getProjectsAction } from '@/app/actions';
import { getProject } from '@/lib/supabase/service';
import type { Project } from "@/lib/types";
import { ReportsClient } from './reports-client';
import { redirect } from 'next/navigation';

interface ReportsPageProps {
  searchParams: {
    projectId?: string;
  };
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  
  const { projectId } = searchParams;
  let projects: Project[] = [];
  let isConsolidatedView = true;
  let pageTitle = "Relatórios Consolidados";
  let pageDescription = "Acompanhe o desempenho de todos os seus projetos.";

  if (projectId) {
    // Visão de projeto único
    const project = await getProject(projectId);
    if (!project) {
      return redirect('/dashboard/reports'); // ou notFound()
    }
    projects = [project];
    isConsolidatedView = false;
    pageTitle = `Relatório: ${project.name}`;
    pageDescription = "Acompanhe o desempenho detalhado deste projeto.";
  } else {
    // Visão consolidada
    projects = await getProjectsAction();
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{pageTitle}</h1>
        <p className="text-muted-foreground">{pageDescription}</p>
      </div>

      <ReportsClient projects={projects} isConsolidatedView={isConsolidatedView} />
    </div>
  );
}
