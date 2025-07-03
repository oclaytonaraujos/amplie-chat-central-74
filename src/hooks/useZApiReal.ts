
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ZApiConfig {
  id: string;
  instance_id: string;
  token: string;
  webhook_url: string | null;
  ativo: boolean | null;
}

interface QRCodeResponse {
  value: boolean;
  message: string;
  qrcode?: string;
}

interface StatusResponse {
  value: boolean;
  message: string;
  status?: string;
}

export function useZApiReal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [config, setConfig] = useState<ZApiConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [conectando, setConectando] = useState(false);

  // Carregar configuração Z-API
  const loadConfig = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single();

      if (!profile?.empresa_id) return;

      const { data, error } = await supabase
        .from('zapi_config')
        .select('*')
        .eq('empresa_id', profile.empresa_id)
        .eq('ativo', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar config Z-API:', error);
        return;
      }

      setConfig(data);
    } catch (error) {
      console.error('Erro ao carregar config:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fazer chamada para API Z-API
  const callZApiEndpoint = async (endpoint: string, method: 'GET' | 'POST' = 'GET', body?: any) => {
    if (!config) {
      throw new Error('Configuração Z-API não encontrada');
    }

    const url = `https://api.z-api.io/instances/${config.instance_id}/${endpoint}`;
    const headers = {
      'Client-Token': config.token,
      'Content-Type': 'application/json'
    };

    console.log(`Chamando Z-API: ${method} ${url}`);

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      throw new Error(`Erro na API Z-API: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  };

  // Obter QR Code para conexão
  const obterQRCode = async (): Promise<QRCodeResponse> => {
    try {
      setConectando(true);
      const response = await callZApiEndpoint('qr-code', 'GET');
      console.log('QR Code response:', response);
      return response;
    } catch (error) {
      console.error('Erro ao obter QR Code:', error);
      toast({
        title: "Erro ao obter QR Code",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive",
      });
      throw error;
    } finally {
      setConectando(false);
    }
  };

  // Verificar status da conexão
  const verificarStatus = async (): Promise<StatusResponse> => {
    try {
      const response = await callZApiEndpoint('status', 'GET');
      console.log('Status response:', response);
      return response;
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      throw error;
    }
  };

  // Enviar mensagem via WhatsApp
  const enviarMensagem = async (telefone: string, mensagem: string) => {
    try {
      const body = {
        phone: telefone,
        message: mensagem
      };

      const response = await callZApiEndpoint('send-text', 'POST', body);
      console.log('Mensagem enviada:', response);

      if (response.value) {
        toast({
          title: "Mensagem enviada",
          description: "Mensagem enviada via WhatsApp com sucesso!",
        });
        return true;
      } else {
        throw new Error(response.message || 'Falha ao enviar mensagem');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro ao enviar mensagem",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive",
      });
      return false;
    }
  };

  // Configurar webhook
  const configurarWebhook = async () => {
    if (!config) return false;

    try {
      const webhookUrl = `https://obtpghqvrygzcukdaiej.supabase.co/functions/v1/whatsapp-webhook`;
      
      const body = {
        url: webhookUrl,
        enabled: true,
        webhookByEvents: false
      };

      const response = await callZApiEndpoint('webhook', 'POST', body);
      console.log('Webhook configurado:', response);

      if (response.value) {
        // Atualizar URL do webhook no banco
        await supabase
          .from('zapi_config')
          .update({ webhook_url: webhookUrl })
          .eq('id', config.id);

        toast({
          title: "Webhook configurado",
          description: "Webhook configurado com sucesso!",
        });
        return true;
      } else {
        throw new Error(response.message || 'Falha ao configurar webhook');
      }
    } catch (error) {
      console.error('Erro ao configurar webhook:', error);
      toast({
        title: "Erro ao configurar webhook",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      loadConfig();
    }
  }, [user]);

  return {
    config,
    loading,
    conectando,
    obterQRCode,
    verificarStatus,
    enviarMensagem,
    configurarWebhook,
    loadConfig
  };
}
