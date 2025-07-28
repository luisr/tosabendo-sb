// src/components/dashboard/project-dashboard-client.tsx
'use client';

import { useState, useMemo, useEffect, useCallback } from "react";
import type { Project, Task, User, ProjectRole } from "@/lib/types";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ProjectHeader } from "@/components/dashboard/project-header";
import { TasksTable } from "@/components/dashboard/tasks-table";
import { GanttChart } from "@/components/dashboard/gantt-chart";
import { KanbanView } from "@/components/dashboard/KanbanView";
import { CalendarView } from "@/components/dashboard/calendar-view";
import { AiAnalysisTab } from "@/components/dashboard/ai-analysis-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthContext } from '@/hooks/use-auth-context';
import { AnimatedList } from '@/components/ui/animated-list';
import { Skeleton } from "../ui/skeleton";

// ... (outras importações e funções de utilidade mantidas) ...

export function ProjectDashboardClient({ initialProject }: { initialProject: Project }) {
  const [project, setProject] = useState<Project>(initialProject);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(initialProject.tasks);
  const { user } = useAuthContext();

  // Lógica de Permissões
  const currentUserRole = useMemo(() => {
    if (!user || !project?.team) return null;
    return project.team.find(m => m.user.id === user.id)?.role ?? null;
  }, [project?.team, user]);
  const canEditProject = currentUserRole === 'Manager';
  const canEditTasks = currentUserRole === 'Manager' || currentUserRole === 'Editor';

  // ... (lógica de KPIs e outros handlers mantidos) ...

  const handleTaskUpdate = (updatedTasks: Task[]) => {
    setProject(prev => prev ? { ...prev, tasks: updatedTasks } : null);
    // TODO: Adicionar chamada para salvar no backend
  };

  const handleTaskStatusChange = (taskId: string, newStatus: string) => {
    const updatedTasks = project.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
    handleTaskUpdate(updatedTasks);
  };
  
  // ... (outros handlers) ...

  if (!project) {
    return <Skeleton className="h-screen w-full" />;
  }

  return (
    <div className="flex flex-col h-full bg-background p-4 sm:p-6 md:p-8 space-y-6">
      <ProjectHeader 
        project={project} 
        activeAlerts={[]} 
        canEditProject={canEditProject}
        canEditTasks={canEditTasks}
        // ... (outras props) ...
      />
      
      <AnimatedList className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* ... (renderização dos KPIs) ... */}
      </AnimatedList>
      
      <Tabs defaultValue="tabela" className="flex-grow flex flex-col">
        <TabsList>
          <TabsTrigger value="tabela">Tabela</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="gantt">Gantt</TabsTrigger>
          <TabsTrigger value="calendario">Calendário</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios IA</TabsTrigger>
        </TabsList>
        
        <div className="flex-grow mt-4">
          <TabsContent value="tabela">
            <TasksTable 
              tasks={filteredTasks} 
              project={project}
              canEditTasks={canEditTasks}
              onTasksChange={handleTaskUpdate}
              // ... (outras props) ...
            />
          </TabsContent>
          <TabsContent value="kanban">
            <KanbanView project={project} onTaskStatusChange={handleTaskStatusChange} />
          </TabsContent>
          <TabsContent value="gantt">
            <GanttChart project={project} onSaveBaseline={() => {}} onDeleteBaseline={() => {}} />
          </TabsContent>
          <TabsContent value="calendario">
            <CalendarView project={project} onEditTask={() => {}} />
          </TabsContent>
          <TabsContent value="relatorios">
            <AiAnalysisTab project={project} onCriticalPathAnalyzed={() => {}} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
