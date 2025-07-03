
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Conversa {
  id: string;
  agente_id: string | null;
  canal: string | null;
  contato_id: string | null;
  created_at: string | null;
  empresa_id: string | null;
  prioridade: string | null;
  setor: string | null;
  status: string | null;
  tags: string[] | null;
  updated_at: string | null;
  contatos?: {
    id: string;
    nome: string;
    telefone: string | null;
    email: string | null;
  } | null;
  profiles?: {
    id: string;
    nome: string;
    email: string;
  } | null;
  mensagens?: {
    id: string;
    conteudo: string;
    created_at: string | null;
    remetente_tipo: string;
    remetente_nome: string | null;
  }[];
}

interface Mensagem {
  id: string;
  conteudo: string;
  conversa_id: string | null;
  created_at: string | null;
  lida: boolean | null;
  metadata: any;
  remetente_id: string | null;
  remetente_nome: string | null;
  remetente_tipo: string;
  tipo_mensagem: string | null;
}

// URL do webhook do n8n para envio de mensagens
// IMPORTANTE: Substitua esta URL pela URL gerada pelo workflow de envio do n8n
const N8N_WEBHOOK_URL = 'https://SEU-N8N.app.n8n.cloud/webhook/whatsapp-send'; // Substitua pela URL real do n8n

export function useAtendimentoReal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensagensConversa, setMensagensConversa] = useState<Record<string, Mensagem[]>>({});

  // Carregar conversas do Supabase
  const loadConversas = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single();

      if (!profile?.empresa_id) {
        console.error('Empresa não encontrada para o usuário');
        return;
      }

      const { data, error } = await supabase
        .from('conversas')
        .select(`
          *,
          contatos (
            id,
            nome,
            telefone,
            email
          ),
          profiles (
            id,
            nome,
            email
          )
        `)
        .eq('empresa_id', profile.empresa_id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar conversas:', error);
        toast({
          title: "Erro ao carregar conversas",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setConversas(data || []);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar mensagens de uma conversa específica
  const loadMensagensConversa = async (conversaId: string) => {
    try {
      const { data, error } = await supabase
        .from('mensagens')
        .select('*')
        .eq('conversa_id', conversaId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao carregar mensagens:', error);
        return;
      }

      setMensagensConversa(prev => ({
        ...prev,
        [conversaId]: data || []
      }));
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  // Upload de arquivo para o Supabase Storage
  const uploadArquivo = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `whatsapp-attachments/${fileName}`;

      console.log('Fazendo upload do arquivo:', file.name);

      const { data, error } = await supabase.storage
        .from('attachments')
        .upload(filePath, file);

      if (error) {
        console.error('Erro no upload:', error);
        return null;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('attachments')
        .getPublicUrl(filePath);

      console.log('Upload realizado com sucesso:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      return null;
    }
  };

  // Enviar payload para o n8n
  const enviarParaN8n = async (payload: any): Promise<boolean> => {
    try {
      console.log('Enviando payload para n8n:', payload);
      
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log('Resposta do n8n:', result);
      return true;
    } catch (error) {
      console.error('Erro ao enviar para n8n:', error);
      return false;
    }
  };

  // Enviar mensagem de texto
  const enviarMensagem = async (conversaId: string, telefone: string, conteudo: string) => {
    if (!user) return false;

    try {
      // Buscar dados do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('nome')
        .eq('id', user.id)
        .single();

      // Inserir mensagem no banco local
      const { data, error } = await supabase
        .from('mensagens')
        .insert({
          conversa_id: conversaId,
          conteudo,
          remetente_id: user.id,
          remetente_nome: profile?.nome || 'Agente',
          remetente_tipo: 'agente',
          tipo_mensagem: 'texto'
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao inserir mensagem:', error);
        return false;
      }

      // Enviar para n8n via webhook
      const payload = {
        type: 'text',
        phone: telefone.replace(/\D/g, ''), // Remove formatação
        data: {
          message: conteudo
        }
      };

      const sucesso = await enviarParaN8n(payload);
      
      if (sucesso) {
        // Recarregar mensagens para mostrar a nova mensagem
        loadMensagensConversa(conversaId);
      }

      return sucesso;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      return false;
    }
  };

  // Enviar mensagem com anexo
  const enviarMensagemComAnexo = async (
    conversaId: string, 
    telefone: string, 
    arquivo: File, 
    legenda?: string
  ) => {
    if (!user) return false;

    try {
      // Upload do arquivo
      const urlArquivo = await uploadArquivo(arquivo);
      if (!urlArquivo) {
        toast({
          title: "Erro no upload",
          description: "Não foi possível fazer upload do arquivo",
          variant: "destructive",
        });
        return false;
      }

      // Buscar dados do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('nome')
        .eq('id', user.id)
        .single();

      // Determinar tipo de mensagem
      const isImage = arquivo.type.startsWith('image/');
      const tipoMensagem = isImage ? 'imagem' : 'documento';

      // Inserir mensagem no banco local
      const { data, error } = await supabase
        .from('mensagens')
        .insert({
          conversa_id: conversaId,
          conteudo: legenda || arquivo.name,
          remetente_id: user.id,
          remetente_nome: profile?.nome || 'Agente',
          remetente_tipo: 'agente',
          tipo_mensagem: tipoMensagem,
          metadata: {
            attachment: {
              type: isImage ? 'image' : 'document',
              url: urlArquivo,
              fileName: arquivo.name,
              mimeType: arquivo.type
            }
          }
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao inserir mensagem:', error);
        return false;
      }

      // Criar payload para n8n
      let payload: any;

      if (isImage) {
        payload = {
          type: 'image',
          phone: telefone.replace(/\D/g, ''),
          data: {
            imageUrl: urlArquivo,
            caption: legenda || ''
          }
        };
      } else {
        payload = {
          type: 'document',
          phone: telefone.replace(/\D/g, ''),
          data: {
            documentUrl: urlArquivo,
            filename: arquivo.name
          }
        };
      }

      const sucesso = await enviarParaN8n(payload);
      
      if (sucesso) {
        // Recarregar mensagens para mostrar a nova mensagem
        loadMensagensConversa(conversaId);
      }

      return sucesso;
    } catch (error) {
      console.error('Erro ao enviar mensagem com anexo:', error);
      return false;
    }
  };

  // Atualizar status da conversa
  const atualizarStatusConversa = async (conversaId: string, novoStatus: string) => {
    try {
      const { error } = await supabase
        .from('conversas')
        .update({ 
          status: novoStatus,
          agente_id: user?.id 
        })
        .eq('id', conversaId);

      if (error) {
        console.error('Erro ao atualizar status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      return false;
    }
  };

  // Setup realtime subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscription para conversas
    const conversasChannel = supabase
      .channel('conversas-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversas'
        },
        (payload) => {
          console.log('Conversa atualizada:', payload);
          loadConversas();
        }
      )
      .subscribe();

    // Subscription para mensagens
    const mensagensChannel = supabase
      .channel('mensagens-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensagens'
        },
        (payload) => {
          console.log('Nova mensagem:', payload);
          const novaMensagem = payload.new as Mensagem;
          if (novaMensagem.conversa_id) {
            setMensagensConversa(prev => ({
              ...prev,
              [novaMensagem.conversa_id!]: [
                ...(prev[novaMensagem.conversa_id!] || []),
                novaMensagem
              ]
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversasChannel);
      supabase.removeChannel(mensagensChannel);
    };
  }, [user]);

  // Carregar dados iniciais
  useEffect(() => {
    if (user) {
      loadConversas();
    }
  }, [user]);

  return {
    conversas,
    loading,
    mensagensConversa,
    loadMensagensConversa,
    enviarMensagem,
    enviarMensagemComAnexo,
    atualizarStatusConversa,
    loadConversas
  };
}
