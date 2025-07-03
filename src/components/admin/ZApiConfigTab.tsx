
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Settings, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ZApiConfig {
  id: string;
  empresa_id: string;
  instance_id: string;
  token: string;
  webhook_url: string | null;
  ativo: boolean;
  created_at: string;
  empresas?: {
    nome: string;
    email: string;
  };
}

export default function ZApiConfigTab() {
  const [configs, setConfigs] = useState<ZApiConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ZApiConfig | null>(null);
  const [formData, setFormData] = useState({
    empresa_id: '',
    instance_id: '',
    token: '',
    webhook_url: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('zapi_config')
        .select(`
          *,
          empresas (nome, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Erro ao buscar configurações Z-API:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações Z-API",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingConfig) {
        const { error } = await supabase
          .from('zapi_config')
          .update(formData)
          .eq('id', editingConfig.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Configuração Z-API atualizada com sucesso",
        });
      } else {
        const { error } = await supabase
          .from('zapi_config')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Configuração Z-API criada com sucesso",
        });
      }

      setIsDialogOpen(false);
      setEditingConfig(null);
      setFormData({
        empresa_id: '',
        instance_id: '',
        token: '',
        webhook_url: '',
      });
      fetchConfigs();
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configuração Z-API",
        variant: "destructive",
      });
    }
  };

  const toggleConfigStatus = async (config: ZApiConfig) => {
    try {
      const { error } = await supabase
        .from('zapi_config')
        .update({ ativo: !config.ativo })
        .eq('id', config.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Configuração ${config.ativo ? 'desativada' : 'ativada'} com sucesso`,
      });

      fetchConfigs();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status da configuração",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (config: ZApiConfig) => {
    setEditingConfig(config);
    setFormData({
      empresa_id: config.empresa_id,
      instance_id: config.instance_id,
      token: config.token,
      webhook_url: config.webhook_url || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (config: ZApiConfig) => {
    if (!confirm('Tem certeza que deseja excluir esta configuração?')) return;

    try {
      const { error } = await supabase
        .from('zapi_config')
        .delete()
        .eq('id', config.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configuração Z-API excluída com sucesso",
      });

      fetchConfigs();
    } catch (error) {
      console.error('Erro ao excluir configuração:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir configuração Z-API",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center">Carregando configurações Z-API...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Configurações Z-API</h3>
          <p className="text-sm text-gray-600">Gerencie as configurações Z-API de todas as empresas</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingConfig(null);
              setFormData({
                empresa_id: '',
                instance_id: '',
                token: '',
                webhook_url: '',
              });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Configuração
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingConfig ? 'Editar Configuração Z-API' : 'Nova Configuração Z-API'}
              </DialogTitle>
              <DialogDescription>
                Configure uma nova instância Z-API para uma empresa
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="instance_id">Instance ID</Label>
                <Input
                  id="instance_id"
                  value={formData.instance_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, instance_id: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="token">Token</Label>
                <Input
                  id="token"
                  type="password"
                  value={formData.token}
                  onChange={(e) => setFormData(prev => ({ ...prev, token: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="webhook_url">Webhook URL</Label>
                <Input
                  id="webhook_url"
                  value={formData.webhook_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, webhook_url: e.target.value }))}
                  placeholder="https://seu-webhook.com/whatsapp"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingConfig ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {configs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Smartphone className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma configuração Z-API</h3>
            <p className="text-gray-500 mb-4">Crie uma configuração Z-API para começar</p>
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Instance ID</TableHead>
                <TableHead>Webhook URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Criação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs.map((config) => (
                <TableRow key={config.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{config.empresas?.nome || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{config.empresas?.email || 'N/A'}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{config.instance_id}</TableCell>
                  <TableCell>
                    {config.webhook_url ? (
                      <span className="text-sm text-green-600">Configurado</span>
                    ) : (
                      <span className="text-sm text-gray-400">Não configurado</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={config.ativo ? "default" : "secondary"}>
                      {config.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(config.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(config)}
                        title="Editar configuração"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Switch
                        checked={config.ativo}
                        onCheckedChange={() => toggleConfigStatus(config)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(config)}
                        className="text-red-600 hover:text-red-700"
                        title="Excluir configuração"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
