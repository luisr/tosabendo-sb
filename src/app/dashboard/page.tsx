"use client";


import { Project } from "@/lib/types";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { getProjects, getUsers } from "@/lib/data"; // Changed import path
import { User } from "../../lib/types";
import { ProjectGalleryModal } from "@/components/dashboard/project-gallery-modal";
import { ProjectDashboardClient } from "@/components/dashboard/project-dashboard-client";

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast()

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [fetchedProjects, fetchedUsers] = await Promise.all([
        getProjects(),
        getUsers()
      ]);
      setProjects(fetchedProjects);
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Failed to fetch data:", JSON.stringify(error, null, 2));
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível buscar os projetos e usuários do sistema.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAllData();
  }, [toast]);

  const handleCreateProject = async (projectData: Omit<Project, 'id' | 'kpis' | 'actualCost' | 'configuration' | 'tasks' | 'team'> & { managerId: string }) => {
    const manager = users.find(u => u.id === projectData.managerId);
    if (!manager) {
      toast({ title: "Gerente não encontrado", variant: "destructive" });
      return;
    }

    //TODO: save to supabase
    const newProject: Project = {
      id: crypto.randomUUID(),
      ...projectData,
      manager: manager,
      kpis: {},
      actualCost: 0,
      configuration: {
        statuses: [],
        visibleKpis: {},
        customKpis: [],
        customCharts: [],
        customFieldDefinitions: [],
        alertRules: [],
      },
      tasks: [],
      team: []
    }

    setProjects(prev => [newProject, ...prev])
  }

  return (
    <ProjectDashboardClient initialProject={{
      actualCost: 0,
      configuration: {
        statuses: [],
        visibleKpis: {},
        customKpis: [],
        customCharts: [],
        customFieldDefinitions: [],
        alertRules: [],
      },
      description: '',
      id: '',
      name: '',
      manager: {
        id: '',
        name: '',
        avatar: '',
        email: '',
        password: '',
        mustChangePassword: false,
        phone: '',
        role: 'Admin', // Global/default role
        status: 'active',
      },
      team: [],
      plannedStartDate: '',
      plannedEndDate: '',
      actualStartDate: '',
      actualEndDate: '',
      plannedBudget: 0,
      tasks: [],
      kpis: {},
      baselineSavedAt: '',
      criticalPath: [''],
    }} />
  )
}