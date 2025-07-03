
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';

interface AdminData {
  empresas: any[];
  usuarios: any[];
  planos: any[];
  whatsappConnections: any[];
}

export function useSupabaseAdmin() {
  const [data, setData] = useState<AdminData>({
    empresas: [],
    usuarios: [],
    planos: [],
    whatsappConnections: []
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { isSuperAdmin, loading: roleLoading } = useUserRole();

  const loadAdminData = async () => {
    if (roleLoading || !isSuperAdmin) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Carregando dados administrativos...');

      // Carregar empresas
      const { data: empresas, error: empresasError } = await supabase
        .from('empresas')
        .select('*')
        .order('created_at', { ascending: false });

      if (empresasError) {
        console.error('Erro ao carregar empresas:', empresasError);
        throw empresasError;
      }

      // Carregar usuários com informações da empresa
      const { data: usuarios, error: usuariosError } = await supabase
        .from('profiles')
        .select(`
          *,
          empresas (nome)
        `)
        .order('created_at', { ascending: false });

      if (usuariosError) {
        console.error('Erro ao carregar usuários:', usuariosError);
        throw usuariosError;
      }

      // Carregar planos
      const { data: planos, error: planosError } = await supabase
        .from('planos')
        .select('*')
        .order('created_at', { ascending: false });

      if (planosError) {
        console.error('Erro ao carregar planos:', planosError);
        throw planosError;
      }

      // Carregar conexões WhatsApp
      const { data: whatsappConnections, error: whatsappError } = await supabase
        .from('whatsapp_connections')
        .select(`
          *,
          empresas (nome)
        `)
        .order('created_at', { ascending: false });

      if (whatsappError) {
        console.error('Erro ao carregar conexões WhatsApp:', whatsappError);
        throw whatsappError;
      }

      setData({
        empresas: empresas || [],
        usuarios: usuarios || [],
        planos: planos || [],
        whatsappConnections: whatsappConnections || []
      });

      console.log('Dados administrativos carregados com sucesso');
      console.log('Empresas:', empresas?.length);
      console.log('Usuários:', usuarios?.length);
      console.log('Planos:', planos?.length);
      console.log('Conexões WhatsApp:', whatsappConnections?.length);
    } catch (error) {
      console.error('Erro ao carregar dados administrativos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados administrativos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!roleLoading) {
      loadAdminData();
    }
  }, [isSuperAdmin, roleLoading]);

  return {
    ...data,
    loading,
    isSuperAdmin,
    loadAdminData
  };
}
