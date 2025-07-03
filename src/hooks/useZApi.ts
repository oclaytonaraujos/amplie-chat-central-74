
import { useState, useCallback, useEffect } from 'react';
import { ZApiService, ZApiConfig } from '@/services/zapi';
import { useToast } from '@/hooks/use-toast';

interface ZApiStatus {
  connected: boolean;
  instanceStatus: string;
  lastCheck: Date | null;
}

interface UseZApiReturn {
  zapi: ZApiService | null;
  status: ZApiStatus;
  isConfigured: boolean;
  configure: (config: ZApiConfig) => void;
  sendMessage: (phone: string, message: string) => Promise<boolean>;
  sendMenuMessage: (phone: string, message: string, options: string[]) => Promise<boolean>;
  sendImageMessage: (phone: string, imageUrl: string, caption?: string) => Promise<boolean>;
  sendDocumentMessage: (phone: string, documentUrl: string, fileName: string) => Promise<boolean>;
  sendAudioMessage: (phone: string, audioUrl: string) => Promise<boolean>;
  checkStatus: () => Promise<void>;
  disconnect: () => void;
}

export function useZApi(): UseZApiReturn {
  const [zapi, setZapi] = useState<ZApiService | null>(null);
  const [status, setStatus] = useState<ZApiStatus>({
    connected: false,
    instanceStatus: 'disconnected',
    lastCheck: null,
  });
  const [isConfigured, setIsConfigured] = useState(false);
  const { toast } = useToast();

  // Carregar configuração salva
  useEffect(() => {
    const savedConfig = localStorage.getItem('zapi-config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        configure(config);
      } catch (error) {
        console.error('Erro ao carregar configuração Z-API:', error);
      }
    }
  }, []);

  const configure = useCallback((config: ZApiConfig) => {
    console.log('Configurando Z-API:', config);
    
    const zapiService = new ZApiService(config);
    setZapi(zapiService);
    setIsConfigured(true);
    
    // Salvar configuração
    localStorage.setItem('zapi-config', JSON.stringify(config));
    
    // Verificar status inicial
    checkStatusInternal(zapiService);
  }, []);

  const checkStatusInternal = async (service: ZApiService) => {
    try {
      const statusResponse = await service.getInstanceStatus();
      console.log('Status Z-API:', statusResponse);
      
      setStatus({
        connected: statusResponse.connected || false,
        instanceStatus: statusResponse.status || 'unknown',
        lastCheck: new Date(),
      });
    } catch (error) {
      console.error('Erro ao verificar status Z-API:', error);
      setStatus(prev => ({
        ...prev,
        connected: false,
        instanceStatus: 'error',
        lastCheck: new Date(),
      }));
    }
  };

  const checkStatus = useCallback(async () => {
    if (!zapi) return;
    await checkStatusInternal(zapi);
  }, [zapi]);

  const sendMessage = useCallback(async (phone: string, message: string): Promise<boolean> => {
    if (!zapi) {
      toast({
        title: "Z-API não configurada",
        description: "Configure a integração Z-API primeiro",
        variant: "destructive",
      });
      return false;
    }

    try {
      await zapi.sendTextMessage(phone, message);
      return true;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar a mensagem via Z-API",
        variant: "destructive",
      });
      return false;
    }
  }, [zapi, toast]);

  const sendMenuMessage = useCallback(async (phone: string, message: string, options: string[]): Promise<boolean> => {
    if (!zapi) {
      toast({
        title: "Z-API não configurada",
        description: "Configure a integração Z-API primeiro",
        variant: "destructive",
      });
      return false;
    }

    try {
      await zapi.sendMenuMessage(phone, message, options);
      return true;
    } catch (error) {
      console.error('Erro ao enviar menu:', error);
      toast({
        title: "Erro ao enviar menu",
        description: "Não foi possível enviar o menu via Z-API",
        variant: "destructive",
      });
      return false;
    }
  }, [zapi, toast]);

  const sendImageMessage = useCallback(async (phone: string, imageUrl: string, caption?: string): Promise<boolean> => {
    if (!zapi) {
      toast({
        title: "Z-API não configurada",
        description: "Configure a integração Z-API primeiro",
        variant: "destructive",
      });
      return false;
    }

    try {
      await zapi.sendImageMessage(phone, imageUrl, caption);
      return true;
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
      toast({
        title: "Erro ao enviar imagem",
        description: "Não foi possível enviar a imagem via Z-API",
        variant: "destructive",
      });
      return false;
    }
  }, [zapi, toast]);

  const sendDocumentMessage = useCallback(async (phone: string, documentUrl: string, fileName: string): Promise<boolean> => {
    if (!zapi) {
      toast({
        title: "Z-API não configurada",
        description: "Configure a integração Z-API primeiro",
        variant: "destructive",
      });
      return false;
    }

    try {
      await zapi.sendDocumentMessage(phone, documentUrl, fileName);
      return true;
    } catch (error) {
      console.error('Erro ao enviar documento:', error);
      toast({
        title: "Erro ao enviar documento",
        description: "Não foi possível enviar o documento via Z-API",
        variant: "destructive",
      });
      return false;
    }
  }, [zapi, toast]);

  const sendAudioMessage = useCallback(async (phone: string, audioUrl: string): Promise<boolean> => {
    if (!zapi) {
      toast({
        title: "Z-API não configurada",
        description: "Configure a integração Z-API primeiro",
        variant: "destructive",
      });
      return false;
    }

    try {
      await zapi.sendAudioMessage(phone, audioUrl);
      return true;
    } catch (error) {
      console.error('Erro ao enviar áudio:', error);
      toast({
        title: "Erro ao enviar áudio",
        description: "Não foi possível enviar o áudio via Z-API",
        variant: "destructive",
      });
      return false;
    }
  }, [zapi, toast]);

  const disconnect = useCallback(() => {
    setZapi(null);
    setIsConfigured(false);
    setStatus({
      connected: false,
      instanceStatus: 'disconnected',
      lastCheck: null,
    });
    localStorage.removeItem('zapi-config');
    
    toast({
      title: "Z-API desconectada",
      description: "A integração foi desconectada com sucesso",
    });
  }, [toast]);

  return {
    zapi,
    status,
    isConfigured,
    configure,
    sendMessage,
    sendMenuMessage,
    sendImageMessage,
    sendDocumentMessage,
    sendAudioMessage,
    checkStatus,
    disconnect,
  };
}
