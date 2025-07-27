// src/components/dashboard/tasks-table.tsx
"use client";

import React, { /* ... */ } from 'react';
import type { Project, Task, BulkAction } from "@/lib/types";
// ... (outros imports mantidos) ...
import { calculateFormula } from '@/lib/utils/formula'; // Importa nosso motor de cálculo
import { Badge } from '@/components/ui/badge'; // Importa Badge

// ... (interface e constantes mantidas) ...

export function TasksTable({ /* ... (props mantidas) ... */ }: TasksTableProps) {
  // ... (estados e hooks mantidos) ...
  
  const renderTask = (task: Task, level: number = 0) => {
    // ... (lógica de renderTask mantida) ...

    return (
      <React.Fragment key={task.id}>
        <TableRow /* ... (props da TableRow mantidas) ... */>
          {/* ... (células padrão mantidas) ... */}
          
          {/* Renderização Dinâmica das Células Personalizadas */}
          {project.configuration.customFieldDefinitions?.map(fieldDef => {
              if (!columnVisibility[fieldDef.id]) return null;
              
              let cellContent: React.ReactNode;

              if (fieldDef.type === 'formula' && fieldDef.formula) {
                  const result = calculateFormula(fieldDef.formula, task);
                  cellContent = (
                    <Badge variant="outline" className="font-mono">
                        {result !== null ? result.toFixed(2) : 'N/A'}
                    </Badge>
                  );
              } else if (fieldDef.type === 'date' && task.customFields?.[fieldDef.id]) {
                  cellContent = formatDate(task.customFields?.[fieldDef.id] as string);
              } else {
                  cellContent = task.customFields?.[fieldDef.id] ?? '-';
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
      {/* ... (Toolbar e Header da tabela mantidos) ... */}
       <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {/* ... (cabeçalhos padrão mantidos) ... */}
                
                {/* Renderização Dinâmica dos Cabeçalhos Personalizados */}
                {project.configuration.customFieldDefinitions?.map(fieldDef => (
                   columnVisibility[fieldDef.id] && (
                     <TableHead key={fieldDef.id}>
                       {fieldDef.name}
                       {fieldDef.type === 'formula' && <span className="text-xs text-muted-foreground ml-1">(ƒ)</span>}
                     </TableHead>
                   )
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
