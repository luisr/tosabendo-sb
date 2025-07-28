// src/components/dashboard/sidebar.tsx
'use client';

// ... (imports mantidos) ...
import { createProjectAction } from '@/app/actions'; // Corrigido
import { useAuthContext } from '@/hooks/use-auth-context';

// ... (componente Logo mantido) ...

export function DashboardSidebar() {
  const { user } = useAuthContext();
  const router = useRouter();
  const { toast } = useToast();
  // ... (estados dos modais mantidos) ...

  const handleCreateManualProject = async (projectData: any) => {
    if (!user) return;
    
    const { error } = await createProjectAction(projectData, user.id);

    if (error) {
       toast({ title: "Erro ao Criar Projeto", description: error, variant: "destructive" });
    } else {
      toast({ title: "Projeto Criado!", description: "O novo projeto foi criado com sucesso." });
      setIsManualFormOpen(false);
      // A revalidação do path na Server Action cuida da atualização da UI
    }
  };

  // ... (outros handlers e JSX mantidos) ...
}
