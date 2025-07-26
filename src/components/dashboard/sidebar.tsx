// src/components/dashboard/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Folder,
  CheckSquare,
  FileText,
  Users,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Shield,
  LayoutDashboard,
  BrainCircuit,
  PlusCircle, // Importado
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import type { User, Project } from "@/lib/types";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react"; // Importado
import { ScrollArea } from "../ui/scroll-area";
import { ProjectForm } from "./project-form"; // Importado
import { createProject } from "@/lib/supabase/service"; // Importado
import { useToast } from "@/hooks/use-toast"; // Importado
import { useRouter } from "next/navigation"; // Importado

const Logo = () => (
    <div className="flex items-center justify-center gap-2 text-primary">
        <BrainCircuit className="h-8 w-8" />
        <span className="text-xl font-bold tracking-tight">Tô de Olho!</span>
    </div>
);

interface DashboardSidebarProps {
  user: User;
  projects: Project[];
}

export function DashboardSidebar({ user, projects }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter(); // Adicionado
  const { toast } = useToast(); // Adicionado
  const [isProjectsOpen, setIsProjectsOpen] = useState(true);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false); // Adicionado

  const handleCreateProject = async (projectData: Omit<Project, 'id' | 'manager' | 'team' | 'tasks'>) => {
    try {
      const newProject = await createProject(projectData, user.id);
      toast({
        title: "Projeto Criado!",
        description: `O projeto "${newProject.name}" foi criado com sucesso.`,
      });
      setIsProjectFormOpen(false);
      router.refresh(); // Atualiza os dados do servidor
    } catch (error) {
      toast({
        title: "Erro ao Criar Projeto",
        description: "Não foi possível criar o novo projeto.",
        variant: "destructive",
      });
    }
  };

  // ... (links mantidos como estão) ...

  return (
    <>
      <aside className="w-64 flex-shrink-0 border-r bg-card p-4 flex flex-col justify-between">
        {/* ... (Logo e menus superiores mantidos como estão) ... */}

        <ScrollArea className="flex-1 -mr-4 pr-4">
            <div className="space-y-4">
                {/* ... (mainLinks e separator mantidos como estão) ... */}

                <nav className="space-y-1 px-2">
                    <Collapsible open={isProjectsOpen} onOpenChange={setIsProjectsOpen}>
                        <div className="flex items-center justify-between p-2">
                            <CollapsibleTrigger className="w-full">
                                <div className="flex items-center justify-between hover:bg-muted rounded-md p-2 -m-2">
                                    <div className="flex items-center gap-3 text-sm font-semibold">
                                        <Folder className="w-4 h-4" />
                                        <span>Meus Projetos</span>
                                    </div>
                                    <ChevronDown className={cn("h-4 w-4 transition-transform", isProjectsOpen && "rotate-180")} />
                                </div>
                            </CollapsibleTrigger>
                            <Button variant="ghost" size="icon" className="h-6 w-6 ml-2" onClick={() => setIsProjectFormOpen(true)}>
                                <PlusCircle className="h-4 w-4" />
                            </Button>
                        </div>
                        <CollapsibleContent className="space-y-1 pt-1">
                        {projects.map((project) => (
                            <Link
                                key={project.id}
                                href={`/dashboard/projects/${project.id}`}
                                className={cn(
                                "flex items-center gap-3 pl-8 pr-2 py-1.5 rounded-md text-sm font-medium transition-colors",
                                pathname === `/dashboard/projects/${project.id}`
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <span className="truncate">{project.name}</span>
                            </Link>
                        ))}
                        </CollapsibleContent>
                    </Collapsible>
                </nav>
                
                {/* ... (resto dos menus e perfil do usuário mantidos como estão) ... */}
            </div>
        </ScrollArea>
        {/* ... (perfil do usuário mantido como está) ... */}
      </aside>

      <ProjectForm
        isOpen={isProjectFormOpen}
        onOpenChange={setIsProjectFormOpen}
        onSave={handleCreateProject}
        users={[user]} // Passa o usuário atual como opção para gerente
      />
    </>
  );
}
