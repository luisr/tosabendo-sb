// src/components/dashboard/sidebar.tsx
'use client';

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
  PlusCircle,
  Settings, // Importado
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
import { useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { ProjectForm } from "./project-form";
import { createProject, createTask } from "@/lib/supabase/service";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { ProjectPlannerAssistant } from "./project-planner-assistant";
import type { ProjectPlan } from "@/ai/flows/generate-project-plan";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuthContext } from "@/hooks/use-auth-context";
import { Skeleton } from "../ui/skeleton";

// ... (componente Logo mantido) ...

export function DashboardSidebar() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, projects, loading, refreshProjects } = useAuthContext();
  
  // ... (estados dos modais) ...
  
  const mainLinks = [ { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard } ];
  const analysisLinks = [
      { href: "/dashboard/tasks", label: "Todas as Tarefas", icon: CheckSquare },
      { href: "/dashboard/reports", label: "Relatórios", icon: FileText },
  ];
  const managementLinks = [ { href: "/dashboard/users", label: "Usuários", icon: Users } ];
  const adminLinks = [
      { href: "/dashboard/admin", label: "Painel Admin", icon: Shield },
      { href: "/dashboard/admin/settings", label: "Configurações", icon: Settings },
  ];

  const canCreateProjects = user?.role === 'Super Admin' || user?.role === 'Admin';
  const isAdmin = user?.role === 'Admin' || user?.role === 'Super Admin';
  const isSuperAdmin = user?.role === 'Super Admin';

  if (loading || !user) {
    // ... (esqueleto de carregamento mantido) ...
  }

  return (
    <>
      <aside className="w-64 flex-shrink-0 border-r bg-card p-4 flex flex-col justify-between">
        <ScrollArea className="flex-1 -mr-4 pr-4">
            <div className="space-y-4">
                {/* ... (Logo e menus) ... */}

                {isAdmin && (
                    <>
                        <Separator />
                        <nav className="space-y-1 px-2">
                            <h2 className="px-2 mb-2 text-xs font-semibold text-muted-foreground tracking-wider uppercase">Sistema</h2>
                            {adminLinks.map((link) => (
                                // Apenas Super Admins veem o painel de admin consolidado
                                (isSuperAdmin || link.href !== "/dashboard/admin") && (
                                    <Link key={link.label} href={link.href} className={cn(
                                        "flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium transition-colors",
                                        usePathname().startsWith(link.href) ? "bg-primary/10 text-primary" : "hover:bg-muted"
                                    )}>
                                        <link.icon className="w-4 h-4" />
                                        <span>{link.label}</span>
                                    </Link>
                                )
                            ))}
                        </nav>
                    </>
                )}
            </div>
        </ScrollArea>
        {/* ... (perfil do usuário e modais) ... */}
      </aside>
    </>
  );
}
