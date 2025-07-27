// src/app/dashboard/reports/reports-client.tsx
'use client';

import { useState } from "react";
import type { Project } from "@/lib/types";
import { Accordion } from "@/components/ui/accordion";
import { ProjectSummaryCard } from "@/components/dashboard/project-summary-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { summarizeAllProjects, type SummarizeAllProjectsOutput } from "@/ai/flows/summarize-all-projects";
import { predictProjectRisks, type predictProjectRisksOutputSchema } from "@/ai/flows/predict-project-risks";
import { BrainCircuit, Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

type RiskAnalysis = z.infer<typeof predictProjectRisksOutputSchema>;

interface ReportsClientProps {
  projects: Project[];
  isConsolidatedView: boolean;
}

export function ReportsClient({ projects, isConsolidatedView }: ReportsClientProps) {
  const [loadingConsolidated, setLoadingConsolidated] = useState(false);
  const [consolidatedResult, setConsolidatedResult] = useState<SummarizeAllProjectsOutput | null>(null);
  const [loadingRisks, setLoadingRisks] = useState<Record<string, boolean>>({});
  const [riskResults, setRiskResults] = useState<Record<string, RiskAnalysis>>({});
  const { toast } = useToast();

  const handleGenerateConsolidatedAnalysis = async () => {
    setLoadingConsolidated(true);
    try {
      const analysis = await summarizeAllProjects({ projects });
      setConsolidatedResult(analysis);
    } catch (e) {
      toast({ title: "Erro na Análise de IA", variant: "destructive" });
    } finally {
      setLoadingConsolidated(false);
    }
  };

  const handlePredictRisks = async (project: Project) => {
    setLoadingRisks(prev => ({ ...prev, [project.id]: true }));
    try {
      const analysis = await predictProjectRisks({ project });
      setRiskResults(prev => ({ ...prev, [project.id]: analysis }));
    } catch (e) {
      toast({ title: "Erro na Análise de Riscos", variant: "destructive" });
    } finally {
      setLoadingRisks(prev => ({ ...prev, [project.id]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {isConsolidatedView && (
        <Card>
          <CardHeader>
            <CardTitle>Análise Consolidada com IA</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGenerateConsolidatedAnalysis} disabled={loadingConsolidated}>
              {loadingConsolidated ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
              Gerar Análise do Portfólio
            </Button>
            {/* ... renderização do resultado consolidado ... */}
          </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full space-y-4">
        {projects.map((project) => (
           <ProjectSummaryCard key={project.id} project={project}>
             <Card className="mt-4 border-dashed">
                <CardHeader>
                    <CardTitle className="text-lg">Análise de Riscos com IA</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => handlePredictRisks(project)} disabled={loadingRisks[project.id]}>
                         {loadingRisks[project.id] ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AlertTriangle className="mr-2 h-4 w-4" />}
                         Prever Riscos
                    </Button>
                    {/* ... renderização do resultado da análise de riscos ... */}
                </CardContent>
             </Card>
           </ProjectSummaryCard>
        ))}
      </Accordion>
    </div>
  );
}
