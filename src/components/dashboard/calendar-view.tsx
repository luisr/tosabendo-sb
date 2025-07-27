// src/components/dashboard/calendar-view.tsx
"use client";

import React, { useState, useMemo, useRef } from 'react';
import type { Project, Task } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format, startOfDay, isSameDay, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ViewActions } from './view-actions';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  project: Project;
  onEditTask: (task: Task) => void;
}

export function CalendarView({ project, onEditTask }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const printableRef = useRef<HTMLDivElement>(null);
  
  const statusColorMap = useMemo(() => {
    // ... (lógica mantida) ...
  }, [project.configuration.statuses]);

  // Organiza as tarefas por dia de início para renderização
  const tasksByStartDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    project.tasks.forEach(task => {
        const startDateKey = format(startOfDay(new Date(task.plannedStartDate)), 'yyyy-MM-dd');
        const tasksOnDay = map.get(startDateKey) || [];
        map.set(startDateKey, [...tasksOnDay, task]);
    });
    return map;
  }, [project.tasks]);

  const DayContent = (props: { date: Date }) => {
    const dayKey = format(props.date, 'yyyy-MM-dd');
    const tasksStartingToday = tasksByStartDate.get(dayKey) || [];

    return (
      <div className="relative w-full h-full flex flex-col items-start p-1">
        <span className={cn("absolute top-1 right-1 text-xs", isSameDay(props.date, new Date()) && "text-primary font-bold")}>
          {props.date.getDate()}
        </span>
        <div className="mt-4 space-y-0.5 w-full overflow-hidden">
          {tasksStartingToday.map(task => {
            const duration = Math.max(1, new Date(task.plannedEndDate).getTime() - new Date(task.plannedStartDate).getTime()) / (1000 * 3600 * 24) + 1;
            return (
              <TooltipProvider key={task.id} delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className="text-xs px-1.5 py-0.5 rounded-sm text-white truncate cursor-pointer" 
                      style={{ 
                          backgroundColor: statusColorMap[task.status] || '#808080', 
                          width: `calc(${duration * 100}% - 2px)` 
                      }}
                      onClick={() => onEditTask(task)}
                    >
                      {task.name}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-bold">{task.name}</p>
                    <p>Status: {task.status}</p>
                    <p>Responsável: {task.assignee.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </div>
    );
  };
  
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between no-print">
         <div>
            <CardTitle>Calendário do Projeto</CardTitle>
            <CardDescription>
                Cronograma visual das tarefas. Passe o mouse para detalhes e clique para editar.
            </CardDescription>
         </div>
         <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="font-semibold text-center w-32">{format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</span>
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight className="h-4 w-4" /></Button>
            <ViewActions contentRef={printableRef} />
         </div>
      </CardHeader>
      <CardContent className="printable" ref={printableRef}>
        <div className="printable-content">
          <Calendar
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            mode="single" // Mantemos single para a navegação, a visualização é customizada
            className="p-0"
            locale={ptBR}
            classNames={{
              day: 'h-24 w-full border align-top',
              head_cell: 'w-full',
              day_hidden: 'invisible'
            }}
            components={{ DayContent: DayContent }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
