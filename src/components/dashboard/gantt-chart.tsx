import React, { useState, useEffect } from 'react';
import { ViewMode, Gantt } from 'gantt-task-react';
import "gantt-task-react/dist/index.css";
import { Task } from "@/lib/types";
import { formatTimeToViewMode } from "@/lib/utils/date";
import { Target, Diamond } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

// ... (tipos e funções auxiliares mantidas) ...

export function GanttChart({ tasks }: { tasks: Task[] }) {
  const [view, setView] = useState<ViewMode>(ViewMode.Day);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) {
      setView(ViewMode.Week);
    } else {
      setView(ViewMode.Month);
    }
  }, [isMobile]);

  const ganttTasks = tasks
    .filter(task => {
      console.log("GanttChart: Filtering task:", task);
      return task.startDate && task.endDate;
    })
    .map(task => {
      console.log("GanttChart: Mapping task:", task);
      const startDate = new Date(task.startDate);
      const endDate = new Date(task.endDate);
      console.log("GanttChart: Created dates: ", { startDate, endDate });

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error(`GanttChart: Task with ID ${task.id} has invalid date values: startDate=${task.startDate}, endDate=${task.endDate}`);
        return null; 
      }

      const ganttTask = {
        id: task.id,
        name: task.name,
        start: startDate, 
        end: endDate,     
        progress: task.progress,
        type: task.type,
        ...(task.dependencies && {
          dependencies: Array.isArray(task.dependencies)
            ? task.dependencies 
            : typeof task.dependencies === 'string'
              ? task.dependencies.split(',').map(dep => dep.trim())
              : undefined 
        }),
      };
      console.log("GanttChart: Created ganttTask:", ganttTask);
      return ganttTask;
    })
    .filter(task => {
      console.log("GanttChart: Filtering out task:", task);
      return task != null;
    }) as any; 

  console.log("GanttChart: Final ganttTasks array BEFORE passing to Gantt component:", ganttTasks);
  ganttTasks.forEach((task, index) => {
      console.log(`GanttChart: Task ${index} - start property:`, task ? task.start : 'Task is null or undefined');
  });

  // Check if ganttTasks is empty before rendering Gantt
  if (ganttTasks.length === 0) {
    console.log("GanttChart: ganttTasks array is empty. Not rendering Gantt.");
    return (
      <div className="overflow-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhuma tarefa com datas válidas para exibir no gráfico de Gantt.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      <Gantt
        tasks={ganttTasks}
        viewMode={view}
        onDateChange={(task, children) => { /* Handle date change */ }}
        onProgressChange={(task, children) => { /* Handle progress change */ }}
        onDoubleClick={(task) => { /* Handle double click */ }}
        onClick={(task) => { /* Handle click */ }}
        onDelete={(task) => { /* Handle delete */ }}
        listCellWidth={isMobile ? "155px" : "250px"}
        columnWidth={isMobile ? 30 : undefined}
        rowHeight={isMobile ? 40 : undefined}
        headerHeight={isMobile ? 50 : undefined}
        ganttHeight={isMobile ? 200 : undefined}
      />
    </div>
  );
}
