// src/app/dashboard/projects/[id]/page.tsx
'use client';

import type { Project } from "@/lib/types";
import { notFound } from "next/navigation";
import { ProjectDashboardClient } from "@/components/dashboard/project-dashboard-client";
import { useEffect, useState } from "react";
import { getProject } from "@/lib/data"; // Changed import path
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectDashboardPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      const fetchProject = async () => {
        setLoading(true);
        const fetchedProject = await getProject(params.id);
        console.log("Fetched project:", fetchedProject); // Added logging
        setProject(fetchedProject);
        setLoading(false);
      };
      fetchProject();
    }
  }, [params.id]);

  if (loading) {
    return <Skeleton className="w-full h-[400px]" />;
  }

  if (!project) {
    notFound();
  }

  return (
    <ProjectDashboardClient initialProject={project ?? {
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
  );
}