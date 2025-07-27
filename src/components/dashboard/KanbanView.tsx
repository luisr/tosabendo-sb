// src/components/dashboard/KanbanView.tsx
"use client";

import { useMemo } from 'react';
import type { Project, Task, StatusDefinition } from "@/lib/types";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useMobile } from '@/hooks/use-mobile'; // Importa o hook

// ... (componente KanbanTaskCard mantido como está) ...

const KanbanColumn = ({ status, tasks }: { status: StatusDefinition, tasks: Task[] }) => {
    const taskIds = useMemo(() => tasks.map(t => t.id), [tasks]);
    
    return (
        // A coluna agora não encolhe em telas grandes e ocupa a largura total em telas pequenas
        <div className="flex-shrink-0 w-full md:w-72 h-full">
            <Card className="bg-muted/50 h-full flex flex-col">
                <CardHeader className="p-4 border-b">
                    <CardTitle className="text-base flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }} />
                        {status.name}
                        <Badge variant="secondary" className="ml-auto">{tasks.length}</Badge>
                    </CardTitle>
                </CardHeader>
                <ScrollArea className="flex-grow">
                    <CardContent className="p-2 h-full">
                        <SortableContext items={taskIds} strategy={rectSortingStrategy}>
                            {tasks.map(task => (
                                <KanbanTaskCard key={task.id} task={task} />
                            ))}
                        </SortableContext>
                    </CardContent>
                </ScrollArea>
            </Card>
        </div>
    );
};

export function KanbanView({ project, onTaskStatusChange }: KanbanViewProps) {
    const isMobile = useMobile(); // Hook para detectar se é mobile

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor)
    );

    const tasksByStatus = useMemo(() => {
        // ... (lógica mantida) ...
    }, [project.tasks, project.configuration.statuses]);
    
    const findContainer = (id: string) => {
        // ... (lógica mantida) ...
    }

    const handleDragEnd = (event: DragEndEvent) => {
        // ... (lógica mantida) ...
    };

    if (isMobile) {
        // Renderização para Mobile: Um grid vertical que rola a página inteira
        return (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 gap-6 p-1">
                    {project.configuration.statuses.map(status => (
                        <KanbanColumn
                            key={status.name}
                            status={status}
                            tasks={tasksByStatus.get(status.name) || []}
                        />
                    ))}
                </div>
            </DndContext>
        );
    }

    // Renderização para Desktop: Colunas horizontais com scroll
    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-6 p-1 h-[calc(100vh-18rem)]">
                    {project.configuration.statuses.map(status => (
                        <KanbanColumn
                            key={status.name}
                            status={status}
                            tasks={tasksByStatus.get(status.name) || []}
                        />
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </DndContext>
    );
}
