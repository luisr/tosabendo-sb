// src/app/dashboard/tasks/page.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Task, Project } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { format } from 'date-fns';
import { getProjectsAction } from '@/app/actions'; // Corrigido
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { PRIORITY_CLASSES } from '@/lib/constants';
import { formatDate } from '@/lib/utils/date';

interface AggregatedTask extends Task {
  projectName: string;
  projectId: string;
}

export default function AllTasksPage() {
  const [allTasks, setAllTasks] = useState<AggregatedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    async function fetchAllTasks() {
      setLoading(true);
      try {
        const projects = await getProjectsAction(); // Corrigido
        const aggregatedTasks: AggregatedTask[] = projects.flatMap(project =>
          (project.tasks ?? []).map(task => ({
            ...task,
            projectName: project.name,
            projectId: project.id,
          }))
        );
        setAllTasks(aggregatedTasks);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
        toast({
          title: "Erro ao carregar tarefas",
          description: "Não foi possível buscar as tarefas de todos os projetos.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchAllTasks();
  }, [toast]);

  const filteredTasks = useMemo(() => {
    return allTasks
      .filter(task =>
        task.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(task =>
        statusFilter === 'all' ? true : task.status === statusFilter
      );
  }, [allTasks, searchTerm, statusFilter]);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(allTasks.map(task => task.status));
    return ['all', ...Array.from(statuses)];
  }, [allTasks]);


  if (loading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Todas as Tarefas</CardTitle>
        <CardDescription>Visualize e filtre tarefas de todos os seus projetos em um só lugar.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome da tarefa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar por status..." />
            </SelectTrigger>
            <SelectContent>
              {uniqueStatuses.map(status => (
                <SelectItem key={status} value={status} className="capitalize">
                  {status === 'all' ? 'Todos os Status' : status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarefa</TableHead>
                <TableHead>Projeto</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Prazo Final</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.length > 0 ? (
                filteredTasks.map(task => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">
                        <Link href={`/dashboard/projects/${task.projectId}`} className="hover:underline">
                            {task.name}
                        </Link>
                    </TableCell>
                    <TableCell>{task.projectName}</TableCell>
                    <TableCell>{task.assignee?.name ?? 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{task.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className={PRIORITY_CLASSES[task.priority ?? 'Média']}>
                        {task.priority ?? 'Média'}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(task.plannedEndDate)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nenhuma tarefa encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
