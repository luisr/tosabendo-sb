// src/components/dashboard/project-settings-modal.tsx
"use client";

import React, { useState, useEffect } from "react";
// ... (outras importações mantidas) ...

// ... (constantes e tipos mantidos como estão) ...

// ... (interface ProjectSettingsModalProps mantida) ...

export function ProjectSettingsModal({
  // ... (props mantidas) ...
}: ProjectSettingsModalProps) {
  // ... (estados e hooks mantidos como estão) ...

  const handleCustomFieldChange = (id: string, field: keyof CustomFieldDefinition, value: any) => {
    setCustomFields(prev => 
      prev.map(f => {
        if (f.id === id) {
          const newField = { ...f, [field]: value };
          // Se o tipo mudar para algo que não seja fórmula, limpa a fórmula
          if (field === 'type' && value !== 'formula') {
            delete newField.formula;
          }
          return newField;
        }
        return f;
      })
    );
  };
  
  // ... (todas as outras funções de handle mantidas como estão) ...

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh]">
        {/* ... (DialogHeader e Tabs mantidos) ... */}
          
          <div className="flex-grow overflow-y-auto pr-4 pt-4 space-y-6">
            <TabsContent value="general" className="mt-0 space-y-6">
               <div className="space-y-4 p-4 border rounded-lg">
                  <h4 className="font-semibold text-lg">Campos Personalizados</h4>
                  {/* ... (descrição mantida) ... */}
                   <div className="space-y-3">
                      {customFields.map((field) => (
                        <div key={field.id} className="p-2 border rounded-md space-y-2">
                          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2">
                            <Input
                              placeholder="Nome do Campo"
                              value={field.name}
                              onChange={(e) => handleCustomFieldChange(field.id, 'name', e.target.value)}
                              className="col-span-2"
                            />
                            <Select value={field.type} onValueChange={(v) => handleCustomFieldChange(field.id, 'type', v)}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="text">Texto</SelectItem>
                                  <SelectItem value="number">Número</SelectItem>
                                  <SelectItem value="date">Data</SelectItem>
                                  <SelectItem value="formula">Fórmula</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveCustomField(field.id)} className="justify-self-end text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          {/* Campo de Fórmula Condicional */}
                          {field.type === 'formula' && (
                            <div className="px-1 pt-2">
                               <Input
                                placeholder="Ex: {plannedHours} * 50"
                                value={field.formula || ''}
                                onChange={(e) => handleCustomFieldChange(field.id, 'formula', e.target.value)}
                                className="font-mono text-sm"
                               />
                               <p className="text-xs text-muted-foreground mt-1">
                                 Use chaves {} para referenciar outros campos. Ex: {`{plannedHours}`}, {`{actualHours}`}.
                               </p>
                            </div>
                          )}
                        </div>
                      ))}
                   </div>
                   <Button variant="outline" size="sm" onClick={handleAddCustomField}>
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Campo Personalizado
                   </Button>
                </div>
                
                <Separator />

                {/* Seção de Status das Tarefas (mantida como está) */}
            </TabsContent>

            {/* ... (outras TabsContent) ... */}
          </div>
        {/* ... (DialogFooter mantido) ... */}
      </DialogContent>
    </Dialog>
  );
}
