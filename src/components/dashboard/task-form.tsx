// src/components/dashboard/task-form.tsx
"use client";

import { useEffect, /* ... outros imports ... */ } from "react";
// ... (outros imports mantidos) ...
import { Separator } from "../ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// ... (tipos e interface mantidos) ...

export function TaskForm({ isOpen, onOpenChange, onSave, task, project }: TaskFormProps) {
  const { team: users, tasks: allTasks, configuration } = project;
  // ... (outros hooks e estados mantidos) ...
  
  const form = useForm<TaskFormValues>({
    // ... (configuração do formulário mantida) ...
  });

  useEffect(() => {
    if (isOpen) {
      const defaultCustomFields: Record<string, any> = {};
      // Garante que o objeto customFields tenha todas as chaves definidas
      configuration.customFieldDefinitions?.forEach(def => {
          defaultCustomFields[def.id] = task?.customFields?.[def.id] ?? '';
      });
      
      if (task) {
        // ... (lógica de reset para edição mantida) ...
        form.reset({
          // ... (outros campos) ...
          customFields: defaultCustomFields,
          // ... (outros campos) ...
        });
      } else {
        // ... (lógica de reset para criação mantida) ...
        form.reset({
          // ... (outros campos) ...
          customFields: defaultCustomFields,
          // ... (outros campos) ...
        });
      }
    }
  }, [task, form, isOpen, configuration]);

  // ... (outros useEffects e handlers mantidos) ...

  const saveTask = (data: TaskFormValues, justification: string) => {
    // ... (lógica de salvar mantida) ...
  };

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
                
                {/* Seção de Campos Personalizados Renderizada Dinamicamente */}
                {configuration.customFieldDefinitions && configuration.customFieldDefinitions.length > 0 && (
                  <div>
                    <Separator className="my-6" />
                    <div className="space-y-4">
                      <h3 className="text-md font-medium">Campos Personalizados</h3>
                      {configuration.customFieldDefinitions.map(def => (
                         <FormField
                          key={def.id}
                          control={form.control}
                          name={`customFields.${def.id}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{def.name}</FormLabel>
                              <FormControl>
                                <div>
                                  {def.type === 'text' && <Input {...field} value={field.value || ''} />}
                                  {def.type === 'number' && <Input type="number" {...field} value={field.value || ''} />}
                                  {def.type === 'date' && (
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant="outline"
                                          className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                                        >
                                          <CalendarIcon className="mr-2 h-4 w-4" />
                                          {field.value ? format(new Date(field.value), 'PPP') : <span>Escolha uma data</span>}
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0">
                                        <Calendar
                                          mode="single"
                                          selected={field.value ? new Date(field.value) : undefined}
                                          onSelect={(date) => field.onChange(date?.toISOString())}
                                          initialFocus
                                        />
                                      </PopoverContent>
                                    </Popover>
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
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
