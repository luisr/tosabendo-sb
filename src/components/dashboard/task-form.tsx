// src/components/dashboard/task-form.tsx
"use client";

// ... (outros imports mantidos) ...
import { calculateFormula } from '@/lib/utils/formula'; // Importa nosso motor de cálculo

// ... (tipos e interface mantidos) ...

export function TaskForm({ isOpen, onOpenChange, onSave, task, project }: TaskFormProps) {
  // ... (estados e hooks mantidos) ...
  
  const form = useForm<TaskFormValues>({
    // ... (configuração do formulário mantida) ...
  });

  const watchedValues = form.watch(); // Observa todas as mudanças nos campos do formulário

  // ... (useEffect e handlers mantidos) ...

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh]">
          {/* ... (DialogHeader mantido) ... */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
             <ScrollArea className="h-[65vh] pr-6">
              <div className="space-y-6">
                {/* ... (campos padrão do formulário mantidos) ... */}
                
                {configuration.customFieldDefinitions && configuration.customFieldDefinitions.length > 0 && (
                  <div>
                    <Separator className="my-6" />
                    <div className="space-y-4">
                      <h3 className="text-md font-medium">Campos Personalizados</h3>
                      {configuration.customFieldDefinitions.map(def => {
                        // Se for um campo de fórmula, calcula o valor em tempo real
                        if (def.type === 'formula' && def.formula) {
                          const calculatedValue = calculateFormula(def.formula, watchedValues as Task);
                          return (
                            <div key={def.id}>
                              <Label>{def.name}</Label>
                              <Input
                                value={calculatedValue !== null ? calculatedValue.toFixed(2) : 'Erro na fórmula'}
                                disabled
                                className="mt-2 bg-muted/50"
                              />
                            </div>
                          );
                        }
                        
                        // Renderização para outros tipos de campos personalizados (mantida)
                        return (
                           <FormField
                              key={def.id}
                              control={form.control}
                              name={`customFields.${def.id}`}
                              render={({ field }) => (
                                // ... (lógica de renderização para text, number, date mantida) ...
                              )}
                            />
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ... (seções de anexos e histórico mantidas) ... */}
              </div>
             </ScrollArea>
             {/* ... (DialogFooter mantido) ... */}
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      {/* ... (AlertDialog de Justificativa mantido) ... */}
    </>
  );
}
