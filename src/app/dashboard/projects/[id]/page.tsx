// src/app/dashboard/projects/[id]/page.tsx
import { notFound } from "next/navigation";
import { ProjectDashboardClient } from "@/components/dashboard/project-dashboard-client";
import { getProject } from "@/lib/supabase/service";
import { Shell } from "@/components/ui/shell";

export default async function ProjectDashboardPage({ params }: { params: { id: string } }) {
  
  const project = await getProject(params.id);

  if (!project) {
    notFound();
  }

  return (
    <Shell>
      <ProjectDashboardClient initialProject={project} />
    </Shell>
  );
}
