// src/components/dashboard/KanbanView.tsx
"use client";

import { useMemo } from 'react';
import type { Project, Task, StatusDefinition } from "@/lib/types";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useMobile } from '@/hooks/use-mobile';

// ... (componente KanbanTaskCard mantido como está) ...

const KanbanColumn = ({ status, tasks }: { status: StatusDefinition, tasks: Task[] }) => {
    const { setNodeRef } = useSortable({ id: status.name }); // As colunas agora são "sortable"
    const taskIds = useMemo(() => tasks.map(t => t.id), [tasks]);
    
    return (
        <div ref={setNodeRef} className="flex-shrink-0 w-full md:w-72 h-full">
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
                        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
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
    const isMobile = useMobile();
    const sensors = useSensors(/* ... */);

    const tasksByStatus = useMemo(() => {
        // ... (lógica mantida) ...
    }, [project.tasks, project.configuration.statuses]);
    
    const columnIds = useMemo(() => project.configuration.statuses.map(s => s.name), [project.configuration.statuses]);

    const findContainer = (id: string) => {
        if (columnIds.includes(id)) {
            return id;
        }
        for (const [statusName, tasks] of tasksByStatus.entries()) {
            if (tasks.some(t => t.id === id)) {
                return statusName;
            }
        }
        return null;
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!active || !over) return;
        
        const activeContainer = findContainer(active.id as string);
        const overContainer = findContainer(over.id as string);

        if (activeContainer && overContainer && activeContainer !== overContainer) {
            onTaskStatusChange(active.id as string, overContainer);
        }
    };

    const strategy = isMobile ? verticalListSortingStrategy : undefined;

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={columnIds} strategy={strategy}>
                {isMobile ? (
                    <div className="grid grid-cols-1 gap-6 p-1">
                        {project.configuration.statuses.map(status => (
                            <KanbanColumn key={status.name} status={status} tasks={tasksByStatus.get(status.name) || []} />
                        ))}
                    </div>
                ) : (
                    <ScrollArea className="w-full whitespace-nowrap">
                        <div className="flex gap-6 p-1 h-[calc(100vh-18rem)]">
                            {project.configuration.statuses.map(status => (
                                <KanbanColumn key={status.name} status={status} tasks={tasksByStatus.get(status.name) || []} />
                            ))}
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                )}
            </SortableContext>
        </DndContext>
    );
}
