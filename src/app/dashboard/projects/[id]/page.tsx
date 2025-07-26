// src/app/dashboard/projects/[id]/page.tsx
'use client';

import type { Project } from "@/lib/types";
import { notFound } from "next/navigation";
import { ProjectDashboardClient } from "@/components/dashboard/project-dashboard-client";
import { useEffect, useState } from "react";
import { getProject } from "@/lib/supabase/service"; // CORREÇÃO: Importar do serviço do Supabase
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectDashboardPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      const fetchProject = async () => {
        setLoading(true);
        try {
            const fetchedProject = await getProject(params.id);
            console.log("Fetched project from Supabase:", fetchedProject);
            setProject(fetchedProject);
        } catch (error) {
            console.error("Failed to fetch project:", error);
            setProject(null); // Define como nulo em caso de erro para acionar o notFound()
        }
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

  // O fallback para initialProject não é mais estritamente necessário 
  // com a verificação de !project acima, mas é uma boa prática mantê-lo.
  return (
    <ProjectDashboardClient initialProject={project} />
  );
}
