
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Empresa {
  id: string;
  nome: string;
  email: string;
  plano_id: string;
  limite_usuarios: number;
  limite_armazenamento_gb: number;
  limite_contatos: number;
}

interface Plano {
  id: string;
  nome: string;
}

interface EditarEmpresaDialogProps {
  empresa: Empresa;
  onEmpresaUpdated: () => void;
}

export default function EditarEmpresaDialog({ empresa, onEmpresaUpdated }: EditarEmpresaDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [formData, setFormData] = useState({
    nome: empresa.nome,
    email: empresa.email,
    plano_id: empresa.plano_id || '',
    limite_usuarios: empresa.limite_usuarios || 10,
    limite_armazenamento_gb: empresa.limite_armazenamento_gb || 5,
    limite_contatos: empresa.limite_contatos || 1000
  });
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchPlanos();
      setFormData({
        nome: empresa.nome,
        email: empresa.email,
        plano_id: empresa.plano_id || '',
        limite_usuarios: empresa.limite_usuarios || 10,
        limite_armazenamento_gb: empresa.limite_armazenamento_gb || 5,
        limite_contatos: empresa.limite_contatos || 1000
      });
    }
  }, [open, empresa]);

  const fetchPlanos = async () => {
    const { data } = await supabase.from('planos').select('id, nome').eq('ativo', true);
    setPlanos(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('empresas')
        .update(formData)
        .eq('id', empresa.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Empresa atualizada com sucesso",
      });

      setOpen(false);
      onEmpresaUpdated();
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar empresa",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Empresa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="plano">Plano</Label>
            <Select
              value={formData.plano_id}
              onValueChange={(value) => setFormData({ ...formData, plano_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um plano" />
              </SelectTrigger>
              <SelectContent>
                {planos.map((plano) => (
                  <SelectItem key={plano.id} value={plano.id}>
                    {plano.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="limite_usuarios">Usuários</Label>
              <Input
                id="limite_usuarios"
                type="number"
                value={formData.limite_usuarios}
                onChange={(e) => setFormData({ ...formData, limite_usuarios: parseInt(e.target.value) })}
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="limite_armazenamento_gb">Armazenamento (GB)</Label>
              <Input
                id="limite_armazenamento_gb"
                type="number"
                value={formData.limite_armazenamento_gb}
                onChange={(e) => setFormData({ ...formData, limite_armazenamento_gb: parseInt(e.target.value) })}
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="limite_contatos">Contatos</Label>
              <Input
                id="limite_contatos"
                type="number"
                value={formData.limite_contatos}
                onChange={(e) => setFormData({ ...formData, limite_contatos: parseInt(e.target.value) })}
                min="1"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
