"use client";

import { useAuthContext } from "@/hooks/use-auth-context";
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function Dashboard() {
  const { projects, loading, user } = useAuthContext();

  if (loading) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <DataTableSkeleton columnCount={4} rowCount={5} />
      </div>
    );
  }

  // Lógica de Estado Vazio Consciente do Papel do Usuário
  if (!projects || projects.length === 0) {
    const isAdmin = user?.role === 'Super Admin';
    
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-2xl font-bold tracking-tight">
            {isAdmin ? "Bem-vindo, Super Admin!" : "Você ainda não tem projetos"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isAdmin 
              ? "Comece a construir a sua organização criando o primeiro projeto." 
              : "Peça ao seu gerente para te adicionar a um projeto para começar."
            }
          </p>
          {/* O botão de criar projeto na sidebar é a ação principal, 
              mas podemos adicionar um aqui para administradores para um CTA mais claro. */}
          {isAdmin && (
             <p className="text-sm text-muted-foreground mt-2">
                Use o botão <PlusCircle className="inline-block h-4 w-4 mx-1" /> na barra lateral para começar.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Renderiza a galeria de projetos se houver projetos
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
       <div>
        <h1 className="text-2xl font-bold tracking-tight">Seus Projetos</h1>
        <p className="text-muted-foreground">Selecione um projeto na barra lateral para começar.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map(project => (
          <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
