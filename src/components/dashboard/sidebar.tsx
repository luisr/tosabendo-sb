// src/components/dashboard/sidebar.tsx
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Folder, CheckSquare, Users, LogOut, User as UserIcon,
  ChevronDown, Shield, LayoutDashboard, BrainCircuit, PlusCircle, Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { User, Project } from "@/lib/types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState, useTransition } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProjectForm } from "./project-form";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { ProjectPlannerAssistant } from "./project-planner-assistant";
import { AlertDialog, AlertDialogContent, AlertDialogTrigger, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useAuthContext } from "@/hooks/use-auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { createProjectAction } from "@/app/actions";
import { Loader2 } from "lucide-react";

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon: Icon, label }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Button asChild variant={isActive ? "secondary" : "ghost"} className="w-full justify-start">
      <Link href={href}><Icon className="mr-2 h-4 w-4" />{label}</Link>
    </Button>
  );
};

export function DashboardSidebar() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, projects, loading: authLoading, refreshProjects } = useAuthContext();
  
  const [isManualFormOpen, setIsManualFormOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(true);
  const [isPending, startTransition] = useTransition();

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleManualProjectCreate = (formData: FormData) => {
    startTransition(async () => {
      const result = await createProjectAction(formData);
      if (result.error) {
        toast({ variant: "destructive", title: "Erro ao criar projeto", description: result.error });
      } else {
        toast({ title: "Projeto criado com sucesso!", description: result.success });
        setIsManualFormOpen(false);
        refreshProjects(); // Idealmente, isso deveria re-validar e buscar os projetos
      }
    });
  };

  if (authLoading || !user) {
    return (
        <aside className="w-64 flex-shrink-0 border-r bg-card p-4 flex flex-col justify-between">
            <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2 mb-6"><Skeleton className="h-8 w-8" /><Skeleton className="h-6 w-24" /></div>
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" /><Separator />
                <Skeleton className="h-8 w-full" />
            </div>
            <div className="pt-4 border-t"><Skeleton className="h-12 w-full" /></div>
        </aside>
    );
  }

  const isAdmin = user.role === 'Admin';

  return (
    <>
      <aside className="w-64 flex-shrink-0 border-r bg-card p-4 flex flex-col justify-between">
        <ScrollArea className="flex-1 -mr-4 pr-4">
            <div className="flex items-center gap-2 mb-6">
              <BrainCircuit className="h-8 w-8 text-primary" /><h1 className="text-lg font-semibold">Project Sphere</h1>
            </div>
            <nav className="flex flex-col gap-1">
              <NavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
              <NavItem href="/dashboard/tasks" icon={CheckSquare} label="Minhas Tarefas" />
              <Separator className="my-3" />
              <Collapsible open={isProjectsOpen} onOpenChange={setIsProjectsOpen}>
                  <div className="flex items-center justify-between pr-2">
                      <CollapsibleTrigger asChild><Button variant="ghost" size="sm" className="w-full justify-start px-2 text-sm font-semibold"><Folder className="mr-2 h-4 w-4" />Projetos<ChevronDown className={cn("ml-auto h-4 w-4 transition-transform", isProjectsOpen && "rotate-180")} /></Button></CollapsibleTrigger>
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0"><PlusCircle className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent>
                              <DropdownMenuItem onSelect={() => setIsAssistantOpen(true)}>Planejar com IA</DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => setIsManualFormOpen(true)}>Criar Manualmente</DropdownMenuItem>
                          </DropdownMenuContent>
                      </DropdownMenu>
                  </div>
                  <CollapsibleContent className="py-1 pl-6">
                      <div className="flex flex-col gap-1">
                        {projects.map((project) => (<NavItem key={project.id} href={`/dashboard/projects/${project.id}`} icon={Folder} label={project.name} />))}
                      </div>
                  </CollapsibleContent>
              </Collapsible>
              {isAdmin && (
                <>
                  <Separator className="my-3" /><div className="px-2 text-sm font-semibold flex items-center"><Shield className="mr-2 h-4 w-4" />Admin</div>
                  <div className="flex flex-col gap-1 pl-6 pt-1">
                    <NavItem href="/dashboard/admin/users" icon={Users} label="Gerenciar Usuários" />
                    <NavItem href="/dashboard/admin/settings" icon={Settings} label="Configurações" />
                  </div>
                </>
              )}
            </nav>
        </ScrollArea>
        <div className="pt-4 border-t">
            <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" className="w-full justify-start text-left h-auto px-2 py-2"><div className="flex items-center gap-3"><Avatar><AvatarImage src={user.avatar} alt={user.name} /><AvatarFallback>{user.name.charAt(0)}</AvatarFallback></Avatar><div className="flex flex-col items-start overflow-hidden"><p className="text-sm font-semibold text-foreground truncate">{user.name}</p><p className="text-xs text-muted-foreground truncate">{user.email}</p></div></div></Button></DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal"><div className="flex flex-col space-y-1"><p className="text-sm font-medium leading-none">{user.name}</p><p className="text-xs leading-none text-muted-foreground">{user.email}</p></div></DropdownMenuLabel><DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href="/dashboard/profile"><UserIcon className="mr-2 h-4 w-4" /><span>Editar Perfil</span></Link></DropdownMenuItem><DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" /><span>Sair</span></DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </aside>
      
      <Dialog open={isManualFormOpen} onOpenChange={setIsManualFormOpen}>
        <DialogContent>
            <DialogHeader><DialogTitle>Criar Novo Projeto</DialogTitle></DialogHeader>
            <form action={handleManualProjectCreate}>
                <ProjectForm />
                 <DialogFooter className="mt-6">
                    <DialogClose asChild><Button type="button" variant="ghost">Cancelar</Button></DialogClose>
                    <Button type="submit" disabled={isPending}>{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Criar Projeto</Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isAssistantOpen} onOpenChange={setIsAssistantOpen}>
          <AlertDialogContent className="max-w-3xl h-[80vh]">
            <AlertDialogTitle>Assistente de Planejamento de Projeto</AlertDialogTitle>
            <ProjectPlannerAssistant onPlanGenerated={() => {}} />
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
