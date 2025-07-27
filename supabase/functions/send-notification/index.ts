// supabase/functions/send-notification/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";

// Definição dos tipos de dados que esperamos receber do gatilho
interface NotificationPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: {
    id: string;
    user_id: string;
    message: string;
    link_to?: string;
  };
}

serve(async (req) => {
  try {
    const payload: NotificationPayload = await req.json();
    console.log("Webhook recebido:", payload);

    // 1. Inicializa o cliente Supabase com a chave de serviço para buscar dados privados.
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 2. Busca o perfil do usuário para obter o número do WhatsApp e a preferência de notificação.
    const { data: userProfile, error: userError } = await supabaseAdmin
      .from("users")
      .select("whatsapp_number, whatsapp_notifications_enabled")
      .eq("id", payload.record.user_id)
      .single();

    if (userError) {
      throw new Error(`Erro ao buscar perfil do usuário: ${userError.message}`);
    }

    // 3. Verifica se o usuário habilitou as notificações e se tem um número de telefone.
    if (userProfile && userProfile.whatsapp_notifications_enabled && userProfile.whatsapp_number) {
      const recipientNumber = userProfile.whatsapp_number;
      const messageBody = payload.record.message;

      console.log(`Enviando mensagem para ${recipientNumber}: "${messageBody}"`);

      // =================================================================
      //          ** PONTO DE INTEGRAÇÃO DA API DO WHATSAPP **
      // =================================================================
      // Substitua este bloco de código pela chamada de API do seu provedor de WhatsApp (ex: Twilio, Meta, etc.).
      
      // Exemplo com um placeholder:
      const whatsappApiUrl = "https://api.seuprovedor.com/v1/messages";
      const authToken = Deno.env.get("WHATSAPP_API_TOKEN"); // Guarde seu token de API como um segredo no Supabase

      /*
      const response = await fetch(whatsappApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          to: recipientNumber,
          from: "whatsapp_number_da_sua_empresa",
          text: messageBody,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Falha ao enviar mensagem via WhatsApp: ${response.status} ${errorBody}`);
      }

      console.log("Mensagem enviada com sucesso via WhatsApp!");
      */
      // =================================================================

      return new Response(JSON.stringify({ message: "Notificação processada e enviada." }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      console.log(`Usuário ${payload.record.user_id} não tem notificações do WhatsApp habilitadas ou não tem número.`);
      return new Response(JSON.stringify({ message: "Notificação ignorada (preferências do usuário)." }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }
  } catch (error) {
    console.error("Erro na Edge Function:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
