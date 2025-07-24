// src/app/dashboard/projects/[id]/page.tsx
'use client';

import type { Project } from "@/lib/types";
import { notFound } from "next/navigation";
import { ProjectDashboardClient } from "@/components/dashboard/project-dashboard-client";
import { useEffect, useState } from "react";
import { getProject } from "@/lib/supabase/service"; // Assuming getProject is here
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectDashboardPage({ params }: { params: { id:string } }) {
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
    <ProjectDashboardClient project={project} />
  );
}