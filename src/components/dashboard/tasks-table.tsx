// src/components/dashboard/tasks-table.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import type { Project, Task, BulkAction } from "@/lib/types";
// ... (outros imports mantidos) ...
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';

// ... (interface e constantes mantidas) ...

export function TasksTable({ tasks, project, canEditTasks, onTasksChange, onEditTask, onDeleteTask, onBulkAction }: TasksTableProps) {
  // ... (estados mantidos: draggedTaskId, expandedRows, selectedRows) ...

  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({});

  // Inicializa a visibilidade das colunas, incluindo as personalizadas
  useEffect(() => {
    const defaultColumns = {
      assignee: true,
      status: true,
      priority: true,
      progress: true,
      plannedHours: true,
      plannedEndDate: true,
    };
    
    const customColumns: ColumnVisibility = {};
    project.configuration.customFieldDefinitions?.forEach(def => {
      customColumns[def.id] = true; // Mostra colunas personalizadas por padrão
    });

    setColumnVisibility({ ...defaultColumns, ...customColumns });
  }, [project.configuration.customFieldDefinitions]);

  // ... (outros hooks e handlers mantidos) ...
  
  const renderTask = (task: Task, level: number = 0) => {
    // ... (lógica de renderTask mantida, com a adição abaixo) ...

    return (
      <React.Fragment key={task.id}>
        <TableRow /* ... (props da TableRow mantidas) ... */>
          {/* ... (células padrão mantidas) ... */}
          
          {/* Renderização Dinâmica das Células Personalizadas */}
          {project.configuration.customFieldDefinitions?.map(fieldDef => {
              if (!columnVisibility[fieldDef.id]) return null;
              
              let cellContent: React.ReactNode = task.customFields?.[fieldDef.id] ?? '-';
              if (fieldDef.type === 'date' && task.customFields?.[fieldDef.id]) {
                  cellContent = formatDate(task.customFields?.[fieldDef.id] as string);
              }

              return (
                <TableCell key={fieldDef.id}>
                    {cellContent}
                </TableCell>
              )
          })}

          <TableCell className='no-print'>
            {/* ... (ações da célula mantidas) ... */}
          </TableCell>
        </TableRow>
        {/* ... (renderização de sub-tarefas mantida) ... */}
      </React.Fragment>
    );
  };

  return (
    <div className="w-full">
      {selectedRows.size > 0 && canEditTasks ? (
        <TasksTableBulkActionsToolbar /* ... */ />
      ) : (
       <TasksTableToolbar /* ... */ >
           <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                        <Columns className="mr-2 h-4 w-4" />
                        Colunas
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Exibir/Ocultar Colunas</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {/* Opções de visibilidade para colunas padrão */}
                    {Object.keys({
                        assignee: true, status: true, priority: true, progress: true, 
                        plannedHours: true, plannedEndDate: true
                    }).map(key => (
                        <DropdownMenuCheckboxItem
                            key={key}
                            className="capitalize"
                            checked={columnVisibility[key]}
                            onCheckedChange={checked => setColumnVisibility(prev => ({ ...prev, [key]: !!checked }))}
                        >
                            {key.replace(/([A-Z])/g, ' $1')}
                        </DropdownMenuCheckboxItem>
                    ))}
                    {/* Opções de visibilidade para colunas personalizadas */}
                     {project.configuration.customFieldDefinitions && project.configuration.customFieldDefinitions.length > 0 && <DropdownMenuSeparator />}
                     {project.configuration.customFieldDefinitions?.map(def => (
                         <DropdownMenuCheckboxItem
                            key={def.id}
                            checked={columnVisibility[def.id]}
                            onCheckedChange={value => setColumnVisibility(prev => ({ ...prev, [def.id]: !!value }))}
                        >
                            {def.name}
                        </DropdownMenuCheckboxItem>
                     ))}
                </DropdownMenuContent>
            </DropdownMenu>
            <ViewActions /* ... */ />
          </div>
       </TasksTableToolbar>
      )}
       <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {/* ... (cabeçalhos padrão mantidos) ... */}
                
                {/* Renderização Dinâmica dos Cabeçalhos Personalizados */}
                {project.configuration.customFieldDefinitions?.map(fieldDef => (
                   columnVisibility[fieldDef.id] && <TableHead key={fieldDef.id}>{fieldDef.name}</TableHead>
                ))}
                
                <TableHead className='no-print'>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* ... (lógica do corpo da tabela mantida) ... */}
            </TableBody>
          </Table>
       </div>
    </div>
  );
}
