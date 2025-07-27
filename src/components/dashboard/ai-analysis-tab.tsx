// src/components/dashboard/ai-analysis-tab.tsx
"use client";

import { useState, useRef } from "react";
import type { Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { summarizeProjectStatus } from "@/ai/flows/summarize-project-status";
import { predictProjectRisks } from "@/ai/flows/predict-project-risks";
import { generateLessonsLearned } from "@/ai/flows/generate-lessons-learned";
import { analyzeCriticalPath } from "@/ai/flows/analyze-critical-path";
import { generateStrategicAnalysis, type strategicAnalysisSchema } from "@/ai/flows/generate-strategic-analysis";
import { Loader2, Sparkles, AlertTriangle, GraduationCap, Network, Briefcase } from "lucide-react";
import { ViewActions } from "./view-actions";
import { Separator } from "../ui/separator";
import { MarkdownRenderer } from '../ui/markdown-renderer'; // Importado
import type { z } from "zod";

type StrategicAnalysis = z.infer<typeof strategicAnalysisSchema>;

const LoadingState = () => (
    <div className="flex items-center justify-center p-8 border rounded-lg bg-muted/50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Analisando dados e gerando insights...</p>
    </div>
);

export function AiAnalysisTab({ project, onCriticalPathAnalyzed }: AiAnalysisTabProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<{ [key: string]: any }>({});
  const [error, setError] = useState<string | null>(null);
  const printableRef = useRef<HTMLDivElement>(null);

  // ... (todos os handlers mantidos como estão, ex: handleSummarize, handleStrategicAnalysis, etc.) ...
  
  return (
    <Card>
      <CardHeader>
        {/* ... (cabeçalho mantido) ... */}
      </CardHeader>
      <CardContent className="space-y-6 printable" ref={printableRef}>
        <div className="printable-content space-y-6">
          {error && <p className="text-destructive text-sm text-center">{error}</p>}

          {/* Análise Estratégica */}
          {/* ... (botão e lógica mantidos) ... */}
          {loading === "strategic" ? <LoadingState /> : results.strategic && (
            <div className="grid md:grid-cols-3 gap-4">
              <MarkdownRenderer content={`### Vantagens Competitivas
${results.strategic.competitiveAdvantages}`} />
              <MarkdownRenderer content={`### Mitigação de Riscos
${results.strategic.riskMitigation}`} />
              <MarkdownRenderer content={`### Recomendações Estratégicas
${results.strategic.strategicRecommendations}`} />
            </div>
          )}

          <Separator className="my-4 no-print" />

          {/* Resumo do Status */}
          {/* ... (botão e lógica mantidos) ... */}
          {loading === "summary" ? <LoadingState /> : results.summary && (
            <div className="grid md:grid-cols-2 gap-4">
              <MarkdownRenderer content={`### Sumário da IA
${results.summary.summary}`} />
              <MarkdownRenderer content={`### Recomendações da IA
${results.summary.recommendations}`} />
            </div>
          )}

          {/* ... (outras seções de análise, como Riscos e Lições Aprendidas, também devem ser atualizadas para usar MarkdownRenderer) ... */}
        </div>
      </CardContent>
    </Card>
  );
}
