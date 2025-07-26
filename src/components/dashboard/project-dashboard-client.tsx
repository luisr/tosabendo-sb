// src/components/dashboard/project-dashboard-client.tsx
'use client';

import { useState, useMemo, useEffect, useCallback, ChangeEvent } from "react";
import type { Project, Task, User, CustomFieldDefinition, ProjectConfiguration, Attachment, ProjectRole, ActiveAlert, TeamMember } from "@/lib/types";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ProjectHeader } from "@/components/dashboard/project-header";
import { TasksTable } from "@/components/dashboard/tasks-table";
import { CheckCircle, Clock, DollarSign, ListTodo, BarChart, AlertTriangle, Target, BrainCircuit, PieChart, GanttChartSquare, Layers, Route, ClipboardList, Trello, Calendar, Network } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { TaskFilters } from "@/components/dashboard/task-filters";
import { TaskForm } from "@/components/dashboard/task-form";
import { AiAnalysisTab } from "./ai-analysis-tab";
import { ChartsTab } from "./charts-tab";
import { GanttChart } from "./gantt-chart";
import { RoadmapView } from "./roadmap-view";
import { BacklogView } from "./backlog-view";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";
import { ImportTasksModal, Mapping, TaskField } from "./import-tasks-modal";
import { ProjectSettingsModal } from "./project-settings-modal";
import { ProjectGalleryModal } from "./project-gallery-modal";
import { KanbanView } from "./KanbanView";
import type { LucideIcon } from "lucide-react";
import { CalendarView } from "./calendar-view";
import { ProjectForm } from "./project-form";
import { getAllUsers, updateProject, getProject, createTask, updateTask, deleteTask } from "@/lib/supabase/service";
import { checkAlerts } from "@/lib/alert-checker";
import { useAuthContext } from '@/hooks/use-auth-context'; // Corrigido
import { formatCurrency } from '@/lib/utils/currency';

// Funções de utilidade mantidas
const nestTasks = (tasks: Task[] = []): Task[] => { /* ... */ };
const calculateTotalProgress = (tasks: Task[]): number => { /* ... */ };

const iconMap: Record<string, LucideIcon> = {
    BarChart, Clock, DollarSign, ListTodo, Target, AlertTriangle, CheckCircle
};

export function ProjectDashboardClient({ initialProject }: { initialProject: Project }) {
  const [project, setProject] = useState<Project>(initialProject);
  const [activeAlerts, setActiveAlerts] = useState<ActiveAlert[]>([]);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  
  const nestedTasks = useMemo(() => nestTasks(project?.tasks), [project?.tasks]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(nestedTasks);

  const allAttachments = useMemo(() => project?.tasks.flatMap(task => task.attachments || [])??[], [project?.tasks]);

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const currentUser = useAuthContext(); // Corrigido: Usa o novo contexto

  const fetchProjectData = useCallback(async () => { /* ... */ }, [project?.id, toast]);

  // Simplificado: Lógica de permissões agora depende do currentUser do contexto
  const currentUserRole = useMemo(() => {
    if (!currentUser || !project?.team) return null;
    const member = project.team.find(m => m.user.id === currentUser.id);
    return member ? member.role : null;
  }, [project?.team, currentUser]);

  const canEditProject = currentUserRole === 'Manager';
  const canEditTasks = currentUserRole === 'Manager' || currentUserRole === 'Editor';

  // Busca todos os usuários uma vez para preencher modais
  useEffect(() => {
    getAllUsers().then(setAllUsers);
  }, []);

  useEffect(() => { setIsClient(true); }, []);
  useEffect(() => { setFilteredTasks(nestedTasks); }, [nestedTasks]);
  useEffect(() => { setProject(initialProject); }, [initialProject]);
  useEffect(() => {
    if (project) {
        setActiveAlerts(checkAlerts(project));
    }
  }, [project]);
  
  const updateProjectAndPersist = useCallback(async (updatedProject: Project) => { /* ... */ }, [toast, fetchProjectData]);
  const handleProjectUpdate = (updatedProjectData: Omit<Project, 'id'>) => { /* ... */ };
  const handleConfigUpdate = (newConfig: ProjectConfiguration, newTeam?: TeamMember[]) => { /* ... */ };
  const handleSaveBaseline = () => { /* ... */ };
  const handleDeleteBaseline = () => { /* ... */ };
  
  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'changeHistory' | 'isCritical'>) => { /* ... */ };
  const handleTaskStatusChange = useCallback(async (taskId: string, newStatus: string) => { /* ... */ }, [project?.tasks, fetchProjectData, toast]);
  
  const handleEditTask = (task: Task) => { setEditingTask(task); setIsTaskFormOpen(true); };
  const handleCreateTask = () => { setEditingTask(null); setIsTaskFormOpen(true); };
  const handleDeleteTask = async (taskId: string) => { /* ... */ };
  const handleBulkAction = async (action: 'delete' | 'duplicate' | 'move', taskIds: Set<string>, newParentId?: string | null) => { /* ... */ };
  
  const handleExportTasks = () => { /* ... */ };
  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => { /* ... */ };
  const handleImportConfirm = (mapping: Mapping) => { /* ... */ };
  const handleCriticalPathAnalyzed = (criticalPathIds: string[]) => { /* ... */ };

  const allKpis = useMemo(() => { /* ... */ }, [project]);

  if (!isClient) {
    return <div className="flex items-center justify-center h-screen"><p>Carregando dashboard...</p></div>; 
  }
  
  return (
    <>
      <div className="flex flex-col h-full bg-background">
        <ProjectHeader 
          project={project}
          activeAlerts={activeAlerts}
          canEditProject={canEditProject}
          canEditTasks={canEditTasks}
          onNewTaskClick={handleCreateTask}
          onEditProjectClick={() => setIsProjectFormOpen(true)}
          onImport={handleFileSelect}
          onExport={handleExportTasks}
          onSettingsClick={() => setIsSettingsOpen(true)}
          onGalleryClick={() => setIsGalleryOpen(true)}
        />
        {/* Resto do JSX */}
      </div>
      {/* Modais */}
    </>
  );
}
