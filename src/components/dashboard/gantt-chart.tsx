// src/components/dashboard/gantt-chart.tsx
"use client"

import React, { useMemo, useRef, useState, useEffect } from 'react';
import type { Project, Task } from '@/lib/types';
// ... (outros imports mantidos) ...
import { Target, Diamond } from 'lucide-react'; // Importado Diamond
import { useMobile } from '@/hooks/use-mobile'; // Importado

// ... (tipos e funções auxiliares mantidas) ...

export function GanttChart({ project, onSaveBaseline, onDeleteBaseline }: GanttChartProps) {
  const printableRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<ZoomLevel>('day');
  const isMobile = useMobile();

  // ... (useMemo para tasks, taskMap, etc., mantido) ...

  // Ajusta o zoom padrão para mobile
  useEffect(() => {
    if (isMobile) {
        setZoom('month');
    }
  }, [isMobile]);

  // ... (useMemo para timeHeader, todayIndex, etc., mantido) ...

  // Se for mobile, renderiza uma versão simplificada
  if (isMobile) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Cronograma do Projeto</CardTitle>
                <CardDescription>Lista de tarefas e seus prazos.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {tasks.map(task => (
                        <div key={task.id} className="p-3 border rounded-lg" style={{ marginLeft: `${task.level * 1.5}rem`}}>
                            <div className="flex justify-between items-center">
                                <span className="font-semibold">{task.name}</span>
                                {task.isMilestone && <Target className="h-4 w-4 text-primary" />}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                                <span>{format(new Date(task.plannedStartDate), 'dd/MM/yy')}</span>
                                <span> → </span>
                                <span>{format(new Date(task.plannedEndDate), 'dd/MM/yy')}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2.5 mt-2">
                                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${task.progress || 0}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
  }

  // Renderização completa para Desktop
  return (
    <Card>
      {/* ... (CardHeader com ações mantido) ... */}
      <CardContent className="overflow-x-auto printable" ref={printableRef}>
        <div className="relative inline-block min-w-full text-sm printable-content">
            {/* ... (grid e headers da timeline mantidos) ... */}

            {/* Lista de Tarefas e Barras */}
            {tasks.map((task, rowIndex) => {
              // ... (cálculos de coordenadas mantidos) ...

              // Lógica para renderizar a barra da tarefa OU um marco
              const TaskBarOrMilestone = () => {
                if (task.isMilestone) {
                    return (
                         <TooltipProvider delayDuration={100}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="absolute top-1/2 -translate-y-1/2 z-20" style={{ left: `${barStart * cellWidth + (cellWidth / 2) - 10}px` }}>
                                        <Diamond className="h-5 w-5 text-primary" fill="currentColor" />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="font-bold">{task.name} (Marco)</p>
                                    <p>Data: {format(new Date(task.plannedEndDate), 'dd/MM/yyyy')}</p>
                                </TooltipContent>
                            </Tooltip>
                         </TooltipProvider>
                    );
                }
                
                return (
                    <TooltipProvider delayDuration={100}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div
                                    className={cn( "absolute h-6 rounded-md flex items-center justify-center text-white text-xs overflow-hidden z-10 self-center top-1/2 -translate-y-1/2", /* ... */)}
                                    style={{ /* ... */ }}
                                >
                                    {/* Barra de progresso interna */}
                                    <div className="absolute left-0 top-0 h-full bg-black/20" style={{ width: `${task.progress || 0}%`}}></div>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                {/* ... (conteúdo do tooltip mantido) ... */}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
              };

              return (
                <React.Fragment key={task.id}>
                    {/* Task Name */}
                    <div className="sticky left-0 z-20 flex items-center p-2 ..." style={{ /* ... */ }}>
                      {task.name}
                    </div>
                    
                    <div className='relative h-full' style={{ /* ... */ }}>
                      {/* ... (Baseline Bar mantida) ... */}
                      <TaskBarOrMilestone />
                    </div>
                </React.Fragment>
              );
            })}

            {/* Dependency Lines Overlay */}
            {/* ... (lógica de linhas de dependência mantida) ... */}
        </div>
      </CardContent>
    </Card>
  );
}
