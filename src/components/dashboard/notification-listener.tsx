// src/components/dashboard/notification-listener.tsx
'use client';

import { useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/hooks/use-auth-context';
import { BellRing } from 'lucide-react';

export function NotificationListener() {
  const { toast } = useToast();
  const { user } = useAuthContext();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('realtime-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Nova notificação recebida:', payload);
          toast({
            title: "Nova Notificação",
            description: (payload.new as any)?.message || "Você tem uma nova atualização.",
            action: <BellRing className="h-5 w-5 text-blue-500" />,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase, toast]);

  return null; // Este componente não renderiza nada
}
