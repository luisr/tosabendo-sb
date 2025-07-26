// src/app/dashboard/admin/admin-dashboard-client.tsx
'use client';

import { useState } from 'react';
import type { Project, User } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { summarizeAllProjects, type SummarizeAllProjectsOutput } from '@/ai/flows/summarize-all-projects';
import { BrainCircuit, Loader2 } from "lucide-react";

interface AdminDashboardClientProps {
  initialProjects: Project[];
  initialUsers: User[];
}

export function AdminDashboardClient({ initialProjects, initialUsers }: AdminDashboardClientProps) {
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SummarizeAllProjectsOutput | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const handleGenerateConsolidatedAnalysis = async () => {
    setLoadingAnalysis(true);
    setAnalysisError(null);
    setAnalysisResult(null);
    try {
      const analysis = await summarizeAllProjects({ projects: initialProjects });
      setAnalysisResult(analysis);
    } catch (e) {
      console.error(e);
      setAnalysisError("Falha ao gerar a análise consolidada. Por favor, tente novamente.");
    } finally {
      setLoadingAnalysis(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise Consolidada de Todos os Projetos</CardTitle>
        <CardDescription>
          Use IA para obter uma visão estratégica de todo o portfólio de projetos no sistema.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleGenerateConsolidatedAnalysis} disabled={loadingAnalysis}>
          {loadingAnalysis ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
          {loadingAnalysis ? 'Analisando Portfólio...' : 'Gerar Análise Global com IA'}
        </Button>

        {loadingAnalysis && (
          <div className="flex items-center justify-center p-8 border rounded-lg bg-muted/50">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">A IA está analisando os dados de todos os projetos...</p>
          </div>
        )}

        {analysisError && <p className="text-destructive text-sm">{analysisError}</p>}
        
        {analysisResult && (
          <div className="prose prose-sm max-w-none dark:prose-invert space-y-4 pt-4 border-t mt-4">
            <div>
              <h4 className="font-semibold text-foreground">Visão Geral do Portfólio</h4>
              <p>{analysisResult.overallStatus}</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Riscos entre Projetos</h4>
              <p>{analysisResult.crossProjectRisks}</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Recomendações Estratégicas</h4>
              <p>{analysisResult.strategicRecommendations}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
