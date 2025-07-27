// src/components/dashboard/project-dashboard-client.tsx
'use client';

import { useState, useMemo, useEffect, useCallback, ChangeEvent } from "react";
// ... (outros imports mantidos) ...
import { useAuthContext } from '@/hooks/use-auth-context';
import { formatCurrency } from '@/lib/utils/currency';
import { AnimatedList } from '@/components/ui/animated-list'; // Importado

// ... (funções de utilidade e constantes mantidas) ...

export function ProjectDashboardClient({ initialProject }: { initialProject: Project }) {
  // ... (estados e hooks mantidos) ...

  const allKpis = useMemo(() => {
    // ... (lógica de cálculo de KPIs mantida) ...
  }, [project]);

  if (!isClient) {
    // Retorna um esqueleto de carregamento mais específico
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
  
  return (
    <>
      <div className="flex flex-col h-full bg-background">
        <ProjectHeader 
          project={project}
          activeAlerts={activeAlerts}
          canEditProject={canEditProject}
          canEditTasks={canEditTasks}
          onNewTaskClick={handleCreateTask}
          // ... (outras props mantidas) ...
        />
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">
          {/* KPIs agora envolvidos com o componente de animação */}
          <AnimatedList className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {allKpis.map((kpi) => (
                <KpiCard key={kpi.id} title={kpi.title} value={kpi.value} icon={kpi.icon} color={kpi.color as any} />
            ))}
          </AnimatedList>
          
          <Tabs defaultValue="tabela">
            {/* ... (resto do conteúdo das abas mantido) ... */}
          </Tabs>
        </div>
      </div>
      {/* ... (Modais mantidos) ... */}
    </>
  );
}
