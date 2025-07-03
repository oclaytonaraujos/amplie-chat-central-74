
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ZApiConfig {
  id: string;
  instance_id: string;
  token: string;
  webhook_url?: string;
  ativo: boolean;
}

interface ZApiResponse {
  value: boolean;
  message?: string;
  status?: string;
  qrcode?: string;
}

export function useOptimizedZApi() {
  const [config, setConfig] = useState<ZApiConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [conectando, setConectando] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Carregar configuração Z-API do usuário
  const loadConfig = useCallback(async () => {
    if (!user) {
      setConfig(null);
      setLoading(false);
      return;
    }

    try {
      // Buscar o perfil do usuário para pegar a empresa_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
        setLoading(false);
        return;
      }

      // Buscar configuração Z-API da empresa
      const { data: zapiConfig, error: configError } = await supabase
        .from('zapi_config')
        .select('*')
        .eq('empresa_id', profile.empresa_id)
        .eq('ativo', true)
        .single();

      if (configError && configError.code !== 'PGRST116') {
        console.error('Erro ao buscar configuração Z-API:', configError);
        setLoading(false);
        return;
      }

      setConfig(zapiConfig || null);
    } catch (error) {
      console.error('Erro ao carregar configuração Z-API:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Fazer requisição para a Z-API
  const makeZApiRequest = useCallback(async (endpoint: string, method: 'GET' | 'POST' = 'GET', body?: any): Promise<ZApiResponse> => {
    if (!config) {
      throw new Error('Configuração Z-API não encontrada');
    }

    const url = `https://api.z-api.io/instances/${config.instance_id}/token/${config.token}/${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Client-Token': config.token,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro na requisição Z-API:', error);
      throw error;
    }
  }, [config]);

  // Verificar status da conexão
  const verificarStatus = useCallback(async (): Promise<ZApiResponse> => {
    try {
      return await makeZApiRequest('status');
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      return { value: false, message: 'Erro ao verificar status' };
    }
  }, [makeZApiRequest]);

  // Obter QR Code
  const obterQRCode = useCallback(async (): Promise<ZApiResponse> => {
    try {
      setConectando(true);
      return await makeZApiRequest('qr-code');
    } catch (error) {
      console.error('Erro ao obter QR Code:', error);
      return { value: false, message: 'Erro ao obter QR Code' };
    } finally {
      setConectando(false);
    }
  }, [makeZApiRequest]);

  // Configurar webhook
  const configurarWebhook = useCallback(async (): Promise<boolean> => {
    if (!config?.webhook_url) {
      toast({
        title: "Erro",
        description: "URL do webhook não configurada",
        variant: "destructive",
      });
      return false;
    }

    try {
      const response = await makeZApiRequest('webhook', 'POST', {
        url: config.webhook_url,
        enabled: true,
        webhookByEvents: false
      });

      return response.value;
    } catch (error) {
      console.error('Erro ao configurar webhook:', error);
      toast({
        title: "Erro",
        description: "Erro ao configurar webhook",
        variant: "destructive",
      });
      return false;
    }
  }, [config, makeZApiRequest, toast]);

  // Enviar mensagem
  const enviarMensagem = useCallback(async (numero: string, mensagem: string): Promise<boolean> => {
    try {
      const response = await makeZApiRequest('send-messages', 'POST', {
        phone: numero,
        message: mensagem
      });

      return response.value;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      return false;
    }
  }, [makeZApiRequest]);

  return {
    config,
    loading,
    conectando,
    verificarStatus,
    obterQRCode,
    configurarWebhook,
    enviarMensagem,
    reloadConfig: loadConfig
  };
}
