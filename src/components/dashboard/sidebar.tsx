// src/components/dashboard/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Folder, PlusCircle, /* ... outros ícones ... */ } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { DropdownMenu, /* ... */ } from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import type { User, Project, Task } from "@/lib/types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { ProjectForm } from "./project-form";
import { createProject, createTask } from "@/lib/supabase/service"; // createTask importado
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { ProjectPlannerAssistant } from "./project-planner-assistant";
import type { ProjectPlan, projectTaskSchema } from "@/ai/flows/generate-project-plan";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { addDays, parseISO } from 'date-fns'; // date-fns importado

// ... (componente Logo e interface DashboardSidebarProps mantidos) ...

export function DashboardSidebar({ user, projects }: DashboardSidebarProps) {
  const router = useRouter();
  const { toast } = useToast();
  // ... (outros estados mantidos) ...
  const [isProcessingPlan, setIsProcessingPlan] = useState(false); // Estado para o processamento do plano

  // ... (handleLaunchAssistant e handleCreateManualProject mantidos) ...

  const handlePlanGenerated = async (plan: ProjectPlan) => {
    setIsProcessingPlan(true);
    toast({ title: "Processando Plano da IA...", description: "Estamos criando o projeto e as tarefas. Isso pode levar um momento." });

    try {
      // Passo 1: Criar o projeto principal
      const newProject = await createProject({
        name: initialAssistantData.name,
        description: plan.introduction,
        plannedStartDate: new Date().toISOString(),
        plannedEndDate: initialAssistantData.deadline,
        plannedBudget: Number(initialAssistantData.budget) || 0,
      }, user.id);

      // Mapa para rastrear IDs temporários da IA vs. IDs reais do Supabase
      const taskIdMap = new Map<string, string>();
      let currentDate = new Date();

      // Passo 2: Iterar e criar cada tarefa
      for (const aiTask of plan.tasks) {
        // Lógica para calcular datas
        const durationDays = parseInt(aiTask.duration.split(' ')[0], 10) || 1;
        const startDate = currentDate;
        const endDate = addDays(startDate, durationDays);

        // Resolve as dependências usando nosso mapa
        const realDependencies = (aiTask.dependencies ?? []).map(depId => taskIdMap.get(depId)).filter(Boolean) as string[];

        const taskData: Omit<Task, 'id' | 'subTasks' | 'changeHistory'> = {
          projectId: newProject.id,
          name: aiTask.name,
          assignee: user, // Atribui ao usuário atual por padrão
          status: 'A Fazer', // Status inicial padrão
          priority: 'Média',
          progress: 0,
          plannedStartDate: startDate.toISOString(),
          plannedEndDate: endDate.toISOString(),
          plannedHours: durationDays * 8, // Converte dias em horas (assumindo 8h/dia)
          actualHours: 0,
          dependencies: realDependencies,
          isCritical: false,
        };

        const newTaskId = await createTask(taskData);
        taskIdMap.set(aiTask.id, newTaskId); // Mapeia o ID da IA para o ID real

        // Atualiza a data de início para a próxima tarefa
        currentDate = addDays(endDate, 1);
      }
      
      toast({
        title: "Sucesso!",
        description: `O projeto "${newProject.name}" e suas ${plan.tasks.length} tarefas foram criados.`,
      });
      
      router.refresh();
      setIsAssistantOpen(false);

    } catch (error) {
      console.error("Erro ao processar o plano da IA:", error);
      toast({
        title: "Erro ao Criar Projeto",
        description: "Não foi possível salvar o projeto e as tarefas geradas pela IA.",
        variant: "destructive",
      });
    } finally {
        setIsProcessingPlan(false);
    }
  };


  return (
    <>
      <aside className="w-64 flex-shrink-0 border-r bg-card p-4 flex flex-col justify-between">
        {/* ... (código da sidebar mantido, incluindo o AlertDialog) ... */}
      </aside>

      {/* ... (modais ProjectForm mantidos) ... */}

      {/* Modal do Assistente de IA */}
      {initialAssistantData && (
        <ProjectPlannerAssistant
          isOpen={isAssistantOpen}
          onOpenChange={setIsAssistantOpen}
          onPlanGenerated={handlePlanGenerated}
          initialData={initialAssistantData}
        />
      )}
    </>
  );
}
