// src/components/dashboard/project-settings-modal.tsx
"use client";

import React, { useState, useEffect } from "react";
import type { ProjectConfiguration, StatusDefinition, CustomKpiDefinition, CustomChartDefinition, CustomFieldDefinition, AlertRule, TeamMember, User, ProjectRole } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";
// ... (outras importações mantidas) ...
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ... (constantes e tipos mantidos como estão) ...

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  projectConfiguration: ProjectConfiguration;
  team: TeamMember[];
  allUsers: User[];
  onSave: (newConfig: ProjectConfiguration, newTeam: TeamMember[]) => void;
}

export function ProjectSettingsModal({
  isOpen,
  onOpenChange,
  projectConfiguration,
  team,
  allUsers,
  onSave,
}: ProjectSettingsModalProps) {
  // ... (estados para statuses, kpis, etc., mantidos como estão) ...
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);

  useEffect(() => {
    if (isOpen) {
      // ... (lógica de reset de estado mantida) ...
      setCustomFields(JSON.parse(JSON.stringify(projectConfiguration.customFieldDefinitions || [])));
    }
  }, [isOpen, projectConfiguration, team]);

  const handleSave = () => {
    const newConfig = { ...projectConfiguration, statuses, visibleKpis, customKpis, customCharts, customFieldDefinitions: customFields, alertRules };
    onSave(newConfig, currentTeam);
    onOpenChange(false);
  };

  // Funções para campos personalizados
  const handleAddCustomField = () => {
    setCustomFields(prev => [
      ...prev,
      { id: `cfield-${Date.now()}`, name: 'Novo Campo', type: 'text' }
    ]);
  };

  const handleRemoveCustomField = (id: string) => {
    setCustomFields(prev => prev.filter(field => field.id !== id));
  };

  const handleCustomFieldChange = (id: string, field: keyof CustomFieldDefinition, value: any) => {
    setCustomFields(prev => 
      prev.map(f => (f.id === id ? { ...f, [field]: value } : f))
    );
  };
  
  // ... (todas as outras funções de handle mantidas como estão) ...

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh]">
        <DialogHeader>
          <DialogTitle>Configurações do Projeto</DialogTitle>
          <DialogDescription>
            Personalize os status, colunas, KPIs e outras visualizações do seu projeto.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="general" className="flex-grow overflow-hidden flex flex-col">
          <TabsList>
            <TabsTrigger value="general">Geral</TabsTrigger>
            {/* ... (outras abas) ... */}
          </TabsList>
          
          <div className="flex-grow overflow-y-auto pr-4 pt-4 space-y-6">
            <TabsContent value="general" className="mt-0 space-y-6">
               {/* Nova Seção de Campos Personalizados */}
               <div className="space-y-4 p-4 border rounded-lg">
                  <h4 className="font-semibold text-lg">Campos Personalizados</h4>
                  <p className="text-sm text-muted-foreground">
                    Adicione campos extras para as tarefas deste projeto, como "Sprint" ou "Custo Real".
                  </p>
                   <div className="space-y-3">
                      {customFields.map((field) => (
                        <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 p-2 border rounded-md">
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
                              </SelectContent>
                          </Select>
                           <Button variant="ghost" size="icon" onClick={() => handleRemoveCustomField(field.id)} className="justify-self-end text-muted-foreground hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                          </Button>
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
                <div className="space-y-4 p-4 border rounded-lg">
                     <h4 className="font-semibold text-lg">Status das Tarefas</h4>
                     {/* ... (código dos status) ... */}
                </div>
            </TabsContent>

            {/* ... (outras TabsContent) ... */}
          </div>
        </Tabs>
        <DialogFooter className="mt-auto pt-4 border-t">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar Configurações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
