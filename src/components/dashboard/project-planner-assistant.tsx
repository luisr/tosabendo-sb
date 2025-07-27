// src/components/dashboard/project-planner-assistant.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BrainCircuit, Loader2, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  initialProjectInputSchema,
  projectPlannerFlow,
  type projectPlanSchema
} from '@/ai/flows/generate-project-plan';
import type { z } from 'zod';

type InitialProjectInput = z.infer<typeof initialProjectInputSchema>;
type ProjectPlan = z.infer<typeof projectPlanSchema>;

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface ProjectPlannerAssistantProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onPlanGenerated: (plan: ProjectPlan) => void;
  initialData: InitialProjectInput;
}

export function ProjectPlannerAssistant({
  isOpen,
  onOpenChange,
  onPlanGenerated,
  initialData,
}: ProjectPlannerAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Inicia a conversa quando o modal abre com os dados iniciais
    if (isOpen && messages.length === 0) {
      const initialPrompt = `
        Inicie a entrevista para o meu novo projeto. Aqui estão os detalhes iniciais:
        - Nome do Projeto: ${initialData.name}
        - Objetivo Principal: ${initialData.objective}
        - Prazo Final: ${initialData.deadline}
        ${initialData.budget ? `- Orçamento: ${initialData.budget}` : ''}
        ${initialData.teamContext ? `- Contexto da Equipe: ${initialData.teamContext}` : ''}
      `;
      setMessages([{ role: 'user', content: initialPrompt }]);
      handleSendMessage(initialPrompt);
    }
  }, [isOpen]);

  useEffect(() => {
    // Rola para a última mensagem
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (isLoading) return;
    setIsLoading(true);

    const newMessages: Message[] = [...messages, { role: 'user', content }];
    if (messages.length > 0) { // Não mostra o prompt inicial na UI
        setMessages(newMessages);
    }
    
    setInput('');

    try {
      const historyForFlow = newMessages.map(msg => ({
          [msg.role]: msg.content
      }));

      const response = await projectPlannerFlow({ history: historyForFlow });

      if ('question' in response) {
        // É uma pergunta da entrevista
        setMessages(prev => [...prev, { role: 'model', content: response.question }]);
      } else {
        // É o plano final
        setMessages(prev => [...prev, { role: 'model', content: response.introduction }]);
        onPlanGenerated(response);
        onOpenChange(false); // Fecha o modal
      }
    } catch (error) {
      console.error('Error calling AI flow:', error);
      toast({
        title: 'Erro na IA',
        description: 'Não foi possível se comunicar com o assistente. Tente novamente.',
        variant: 'destructive',
      });
      setMessages(prev => [...prev, { role: 'model', content: 'Desculpe, ocorreu um erro.' }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      handleSendMessage(input);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Assistente de Planejamento de Projeto</DialogTitle>
          <DialogDescription>
            Responda às perguntas para que a IA possa gerar um plano de projeto detalhado.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6" ref={scrollAreaRef as any}>
            <div className="space-y-6 pr-4">
                {messages.slice(1).map((message, index) => ( // Pula o prompt inicial
                    <div key={index} className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                        {message.role === 'model' && (
                            <Avatar>
                                <AvatarFallback><BrainCircuit /></AvatarFallback>
                            </Avatar>
                        )}
                        <div className={`p-3 rounded-lg max-w-[80%] ${message.role === 'model' ? 'bg-muted' : 'bg-primary text-primary-foreground'}`}>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                         {message.role === 'user' && (
                            <Avatar>
                                <AvatarFallback><User /></AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                ))}
                {isLoading && messages.length > 0 && (
                    <div className="flex items-start gap-4">
                        <Avatar>
                            <AvatarFallback><BrainCircuit /></AvatarFallback>
                        </Avatar>
                        <div className="p-3 rounded-lg bg-muted">
                            <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                    </div>
                )}
            </div>
        </ScrollArea>
        
        <DialogFooter>
            <form onSubmit={handleFormSubmit} className="w-full flex gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Responda aqui..."
                    disabled={isLoading}
                    autoFocus
                />
                <Button type="submit" disabled={isLoading}>
                    Enviar
                </Button>
            </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
