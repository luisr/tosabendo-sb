// src/components/dashboard/project-dashboard-client.tsx
'use client';
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo, useEffect } from "react";
import { useAuthContext } from '@/hooks/use-auth-context';
import { formatCurrency } from '@/lib/utils/currency';
import { AnimatedList } from '@/components/ui/animated-list';
import { CheckSquare, TrendingUp, TrendingDown, Calendar, Percent } from "lucide-react";
import { Project } from "@/lib/types";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ProjectHeader } from "@/components/dashboard/project-header";
import { GanttChart } from "@/components/dashboard/gantt-chart";

export function ProjectDashboardClient({ initialProject }: { initialProject: string | null }) {
  const [hasMounted, setHasMounted] = useState(false);
  const [project, setProject] = useState<Project | null>(null); // Initialize project state as null
  const { user } = useAuthContext();

  useEffect(() => {
    setHasMounted(true);
    console.log("CLIENT: initialProject (serialized) on mount:", initialProject);
    if (initialProject) {
      try {
        const parsedProject: Project = JSON.parse(initialProject);
        setProject(parsedProject); // Set project state after parsing
        console.log("CLIENT: Parsed project on mount:", parsedProject);
      } catch (error) {
        console.error("CLIENT: Error parsing initialProject:", error);
        // Handle parsing error, maybe set project to null or show an error message
        setProject(null);
      }
    }
  }, [initialProject]); // Depend on initialProject

  useEffect(() => {
    console.log("CLIENT: project state changed:", project);
  }, [project]);

  const allKpis = useMemo(() => {
    if (!project) {
      return [];
    }

    const totalTasks = project.tasks?.length || 0;
    const completedTasks = project.tasks?.filter(task => task.status === 'Concluída').length || 0;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const totalPlannedBudget = parseFloat(project.planned_budget?.toString() || '0');
    const totalActualCost = parseFloat(project.actual_cost?.toString() || '0');
    const budgetVariance = totalPlannedBudget - totalActualCost;

    const plannedEndDate = project.planned_end_date ? new Date(project.planned_end_date) : null;
    const today = new Date();

    let daysUntilDeadline = null;
    if (plannedEndDate) {
        const timeDiff = plannedEndDate.getTime() - today.getTime();
        daysUntilDeadline = Math.ceil(timeDiff / (1000 * 3600 * 24));
    }

    const overallProgress = project.progress ?? 0;

    const kpis = [
      {
        id: 'completionRate',
        title: 'Taxa de Conclusão',
        value: `${completionRate.toFixed(0)}%`,
        icon: CheckSquare,
        color: completionRate > 75 ? 'text-green-500' : completionRate > 50 ? 'text-yellow-500' : 'text-red-500'
      },
      {
        id: 'budgetVariance',
        title: 'Variação de Orçamento',
        value: formatCurrency(budgetVariance, 'BRL'),
        icon: budgetVariance >= 0 ? TrendingUp : TrendingDown,
        color: budgetVariance >= 0 ? 'text-green-500' : 'text-red-500'
      },
      {
        id: 'daysUntilDeadline',
        title: 'Dias para o Prazo Final',
        value: daysUntilDeadline !== null ? `${daysUntilDeadline} dias` : 'N/A',
        icon: Calendar,
        color: daysUntilDeadline === null ? 'text-muted-foreground' : daysUntilDeadline >= 0 ? 'text-green-500' : 'text-red-500'
      },
       {
        id: 'overallProgress',
        title: 'Progresso Geral',
        value: `${overallProgress.toFixed(0)}%`,
        icon: Percent,
        color: overallProgress > 75 ? 'text-green-500' : overallProgress > 50 ? 'text-yellow-500' : 'text-red-500'
      }
    ];

    return kpis;
  }, [project]);

  if (!hasMounted) {
    return (
        <div className="flex flex-col h-full bg-background p-4 sm:p-6 md:p-8 space-y-6">
            <Skeleton className="h-12 w-1/2" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
        </div>
    );
  }

  if (!project) {
    return <div>Project not found.</div>;
  }

  return (
    <div className="flex flex-col h-full bg-background p-4 sm:p-6 md:p-8 space-y-6">
      {/* Pass an empty array for activeAlerts as a temporary fix */}
      <ProjectHeader 
        project={project} 
        activeAlerts={[]} 
        canEditProject={false} // Replace with actual logic
        canEditTasks={false} // Replace with actual logic
        onNewTaskClick={() => {}} // Replace with actual function
        onEditProjectClick={() => {}} // Replace with actual function
        onImport={() => {}} // Replace with actual function
        onExport={() => {}} // Replace with actual function
        onSettingsClick={() => {}} // Replace with actual function
        onGalleryClick={() => {}} // Replace with actual function
      />

      <section>
        <h2 className="text-2xl font-bold mb-4">Visão Geral do Projeto</h2>
        <AnimatedList>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {allKpis.map(kpi => (
              <KpiCard key={kpi.id} {...kpi} />
            ))}
          </div>
        </AnimatedList>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Cronograma (Gráfico de Gantt)</h2>
        <div className="bg-card p-4 rounded-lg shadow">
          {project.tasks && project.tasks.length > 0 ? (
            <GanttChart tasks={project.tasks} />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhuma tarefa encontrada para este projeto.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
