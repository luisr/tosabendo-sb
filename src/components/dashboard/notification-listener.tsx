// src/components/dashboard/notification-listener.tsx
'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/hooks/use-auth-context';
import { BellRing } from 'lucide-react';

export function NotificationListener() {
  const { toast } = useToast();
  const user = useAuthContext();
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;

    // Se inscreve no canal de notificações do Supabase para a tabela 'notifications'.
    // A RLS que criamos garante que o usuário só receberá eventos para as suas próprias notificações.
    const channel = supabase
      .channel(`realtime:notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`, // Filtro adicional por segurança
        },
        (payload) => {
          console.log('Nova notificação recebida:', payload.new);
          // Usa o toast para exibir a notificação na tela.
          toast({
            title: "Nova Notificação",
            description: payload.new.message,
            action: (
              <a href={payload.new.link_to ?? '#'}>
                <BellRing className="h-5 w-5" />
              </a>
            ),
          });
        }
      )
      .subscribe();

    // Limpa a inscrição quando o componente é desmontado.
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase, toast]);

  // Este componente não renderiza nada na tela, ele apenas "ouve" os eventos.
  return null;
}
