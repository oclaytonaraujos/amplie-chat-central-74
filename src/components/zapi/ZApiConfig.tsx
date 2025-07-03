
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Wifi, WifiOff } from 'lucide-react';
import { useZApi } from '@/hooks/useZApi';
import { useToast } from '@/hooks/use-toast';

export function ZApiConfig() {
  const [instanceId, setInstanceId] = useState('');
  const [token, setToken] = useState('');
  const [serverUrl, setServerUrl] = useState('https://api.z-api.io');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const { status, isConfigured, configure, checkStatus, disconnect } = useZApi();
  const { toast } = useToast();

  // Carregar dados salvos
  useEffect(() => {
    const savedConfig = localStorage.getItem('zapi-config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setInstanceId(config.instanceId || '');
        setToken(config.token || '');
        setServerUrl(config.serverUrl || 'https://api.z-api.io');
      } catch (error) {
        console.error('Erro ao carregar configuração:', error);
      }
    }

    const savedWebhook = localStorage.getItem('zapi-webhook');
    if (savedWebhook) {
      setWebhookUrl(savedWebhook);
    }
  }, []);

  const handleConnect = async () => {
    if (!instanceId || !token) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o ID da Instância e o Token",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    
    try {
      configure({
        instanceId,
        token,
        serverUrl,
      });

      toast({
        title: "Z-API configurada",
        description: "Integração configurada com sucesso",
      });
    } catch (error) {
      console.error('Erro ao conectar:', error);
      toast({
        title: "Erro na conexão",
        description: "Não foi possível conectar com a Z-API",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCheckStatus = async () => {
    setIsCheckingStatus(true);
    await checkStatus();
    setIsCheckingStatus(false);
  };

  const handleConfigureWebhook = () => {
    if (webhookUrl) {
      localStorage.setItem('zapi-webhook', webhookUrl);
      toast({
        title: "Webhook configurado",
        description: "URL do webhook foi salva. Configure-a também na Z-API.",
      });
    }
  };

  const getStatusIcon = () => {
    if (status.connected) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    return <XCircle className="w-4 h-4 text-red-600" />;
  };

  const getConnectionBadge = () => {
    if (!isConfigured) {
      return <Badge variant="secondary">Não configurado</Badge>;
    }
    
    if (status.connected) {
      return <Badge className="bg-green-100 text-green-800">Conectado</Badge>;
    }
    
    return <Badge variant="destructive">Offline</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Wifi className="w-5 h-5" />
                <span>Configuração Z-API</span>
              </CardTitle>
              <CardDescription>
                Configure sua instância Z-API para envio e recebimento de mensagens WhatsApp
              </CardDescription>
            </div>
            {getConnectionBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="instanceId">ID da Instância</Label>
              <Input
                id="instanceId"
                placeholder="Seu ID da instância Z-API"
                value={instanceId}
                onChange={(e) => setInstanceId(e.target.value)}
                disabled={isConfigured}
              />
            </div>
            <div>
              <Label htmlFor="token">Token</Label>
              <Input
                id="token"
                type="password"
                placeholder="Seu token Z-API"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                disabled={isConfigured}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="serverUrl">URL do Servidor (opcional)</Label>
            <Input
              id="serverUrl"
              placeholder="https://api.z-api.io"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              disabled={isConfigured}
            />
          </div>

          <div className="flex space-x-3">
            {!isConfigured ? (
              <Button 
                onClick={handleConnect} 
                disabled={isConnecting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  'Conectar Z-API'
                )}
              </Button>
            ) : (
              <>
                <Button 
                  onClick={handleCheckStatus} 
                  disabled={isCheckingStatus}
                  variant="outline"
                >
                  {isCheckingStatus ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    'Verificar Status'
                  )}
                </Button>
                <Button 
                  onClick={disconnect}
                  variant="destructive"
                >
                  Desconectar
                </Button>
              </>
            )}
          </div>

          {isConfigured && (
            <Alert>
              <div className="flex items-center space-x-2">
                {getStatusIcon()}
                <AlertDescription>
                  <strong>Status:</strong> {status.instanceStatus}
                  {status.lastCheck && (
                    <span className="text-sm text-gray-500 ml-2">
                      (verificado em {status.lastCheck.toLocaleTimeString()})
                    </span>
                  )}
                </AlertDescription>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      {isConfigured && (
        <Card>
          <CardHeader>
            <CardTitle>Configuração de Webhook</CardTitle>
            <CardDescription>
              Configure o webhook para receber mensagens em tempo real
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="webhookUrl">URL do Webhook</Label>
              <Input
                id="webhookUrl"
                placeholder="https://sua-aplicacao.com/webhook/zapi"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
            </div>
            <Button onClick={handleConfigureWebhook} disabled={!webhookUrl}>
              Salvar Webhook
            </Button>
            <Alert>
              <AlertDescription>
                <strong>Importante:</strong> Após salvar aqui, configure esta mesma URL no painel da Z-API 
                para que as mensagens sejam recebidas automaticamente.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
