// src/components/dashboard/view-actions.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Maximize, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import screenfull from 'screenfull';

interface ViewActionsProps {
  contentRef: React.RefObject<HTMLElement>;
}

export function ViewActions({ contentRef }: ViewActionsProps) {
  const { toast } = useToast();

  const handleFullscreen = () => {
    if (screenfull.isEnabled && contentRef.current) {
      screenfull.toggle(contentRef.current);
    } else {
      toast({
        title: "Modo de Tela Inteira não suportado",
        description: "Seu navegador ou ambiente atual não suporta esta funcionalidade.",
        variant: "destructive",
      });
    }
  };
  
  const handlePrint = () => {
    // Usa a API de impressão do navegador para imprimir o conteúdo da ref
    window.print();
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleFullscreen}>
        <Maximize className="mr-2 h-4 w-4" />
        Tela Inteira
      </Button>
      <Button variant="outline" size="sm" onClick={handlePrint}>
        <Printer className="mr-2 h-4 w-4" />
        Imprimir / Salvar PDF
      </Button>
    </div>
  );
}
