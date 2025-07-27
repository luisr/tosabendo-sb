// src/components/dashboard/tasks-table.tsx
"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
// ... (outros imports mantidos) ...
import { TasksTableToolbar } from './tasks-table-toolbar';
import { ViewActions } from './view-actions'; // Importado

// ... (interface e constantes mantidas) ...

export function TasksTable({ /* ... (props mantidas) ... */ }: TasksTableProps) {
  // ... (estados mantidos) ...
  const printableRef = useRef<HTMLDivElement>(null); // Ref para o conteúdo a ser impresso/maximizado

  // ... (hooks e handlers mantidos) ...

  return (
    <div className="w-full">
      {selectedRows.size > 0 && canEditTasks ? (
        <TasksTableBulkActionsToolbar /* ... */ />
      ) : (
       <TasksTableToolbar onExpandAll={expandAll} onCollapseAll={collapseAll}>
           <div className="flex items-center gap-2">
            {/* ... (Dropdown de Colunas mantido) ... */}
            <ViewActions contentRef={printableRef} />
          </div>
       </TasksTableToolbar>
      )}
       <div className="overflow-x-auto printable" ref={printableRef}>
          {/* Adicionando um ID para estilos de impressão */}
          <style>
            {`
              @media print {
                .no-print { display: none !important; }
                .printable { overflow: visible !important; height: auto !important; }
                .printable-content { /* Estilos para o conteúdo impresso */ }
              }
            `}
          </style>
          <div className="printable-content">
            <Table>
              {/* ... (conteúdo da tabela mantido) ... */}
            </Table>
          </div>
       </div>
    </div>
  );
}
