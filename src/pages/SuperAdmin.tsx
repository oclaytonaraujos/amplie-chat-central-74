
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, Settings, Smartphone, BarChart3, Loader2 } from 'lucide-react';
import EmpresasTab from '@/components/admin/EmpresasTab';
import PlanosTab from '@/components/admin/PlanosTab';
import { WhatsAppTab } from '@/components/admin/WhatsAppTab';
import UsuariosTab from '@/components/admin/UsuariosTab';
import ZApiConfigTab from '@/components/admin/ZApiConfigTab';
import RelatoriosEstatisticasCard from '@/components/admin/RelatoriosEstatisticasCard';
import { useUserRole } from '@/hooks/useUserRole';
import { Layout } from '@/components/layout/Layout';
import QueueMonitoring from '@/components/admin/QueueMonitoring';

export default function SuperAdmin() {
  const { user, loading: authLoading } = useAuth();
  const { isSuperAdmin, loading: roleLoading } = useUserRole();

  console.log('SuperAdmin renderizado:', {
    user: user?.email,
    isSuperAdmin,
    authLoading,
    roleLoading
  });

  // Mostrar loading enquanto verifica permissões
  if (authLoading || roleLoading) {
    console.log('SuperAdmin - Aguardando carregamento...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Verificar se é super admin após carregamento completo
  if (!user || !isSuperAdmin) {
    console.log('SuperAdmin - Acesso negado:', { 
      hasUser: !!user, 
      userEmail: user?.email,
      isSuperAdmin 
    });
    return <Navigate to="/painel" replace />;
  }

  console.log('✅ SuperAdmin - Acesso autorizado para:', user.email);

  return (
    <Layout title="Painel Super Admin" description="Gerencie todas as empresas e configurações da plataforma">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Painel Super Admin</h1>
        
        <Tabs defaultValue="empresas" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="empresas">Empresas</TabsTrigger>
            <TabsTrigger value="usuarios">Usuários</TabsTrigger>
            <TabsTrigger value="planos">Planos</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
            <TabsTrigger value="filas">Filas</TabsTrigger>
          </TabsList>

          <TabsContent value="empresas">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Empresas</CardTitle>
                <CardDescription>
                  Gerencie todas as empresas cadastradas na plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EmpresasTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usuarios">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Usuários</CardTitle>
                <CardDescription>
                  Visualize e gerencie usuários de todas as empresas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UsuariosTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="planos">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Planos</CardTitle>
                <CardDescription>
                  Configure planos e permissões da plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PlanosTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="whatsapp">
            <Card>
              <CardHeader>
                <CardTitle>Conexões WhatsApp</CardTitle>
                <CardDescription>
                  Monitore todas as conexões WhatsApp ativas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WhatsAppTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="zapi">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Z-API</CardTitle>
                <CardDescription>
                  Gerencie as configurações Z-API de todas as empresas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ZApiConfigTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="estatisticas">
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas Gerais</CardTitle>
                <CardDescription>
                  Visualize relatórios detalhados da plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RelatoriosEstatisticasCard />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="filas">
            <QueueMonitoring />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
