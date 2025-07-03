
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { useNavigationTracking } from "@/hooks/useNavigationTracking";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/config/queryClient";

// Páginas
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import SuperAdmin from "@/pages/SuperAdmin";
import NotFound from "@/pages/NotFound";
import Dashboard from "@/pages/Dashboard";
import Atendimento from "@/pages/Atendimento";
import ChatInterno from "@/pages/ChatInterno";
import Contatos from "@/pages/Contatos";
import Kanban from "@/pages/Kanban";
import ChatBot from "@/pages/ChatBot";
import Automations from "@/pages/Automations";
import AutomationBuilder from "@/pages/AutomationBuilder";
import Usuarios from "@/pages/Usuarios";
import Setores from "@/pages/Setores";
import GerenciarEquipe from "@/pages/GerenciarEquipe";
import MeuPerfil from "@/pages/MeuPerfil";
import PlanoFaturamento from "@/pages/PlanoFaturamento";
import FlowBuilder from "@/pages/FlowBuilder";
import Painel from "@/pages/Painel";
import ConfiguracoesGerais from "@/pages/configuracoes/ConfiguracoesGerais";
import ConfiguracoesAvancadas from "@/pages/configuracoes/ConfiguracoesAvancadas";
import PreferenciasNotificacao from "@/pages/configuracoes/PreferenciasNotificacao";
import Aparencia from "@/pages/configuracoes/Aparencia";
import Idioma from "@/pages/configuracoes/Idioma";

function AppRoutes() {
  useNavigationTracking();

  return (
    <Routes>
      {/* Página inicial */}
      <Route path="/" element={<Index />} />
      
      {/* Rota de autenticação */}
      <Route path="/auth" element={<Auth />} />
      
      {/* Rota Super Admin */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <SuperAdmin />
        </ProtectedRoute>
      } />
      
      {/* Rotas protegidas principais */}
      <Route path="/painel" element={
        <ProtectedRoute>
          <Layout title="Painel" description="Visão geral do sistema">
            <Painel />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout title="Dashboard" description="Métricas e estatísticas">
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/atendimento" element={
        <ProtectedRoute>
          <Layout title="Atendimento" description="Central de atendimento">
            <Atendimento />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/chat-interno" element={
        <ProtectedRoute>
          <Layout title="Chat Interno" description="Comunicação da equipe">
            <ChatInterno />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/contatos" element={
        <ProtectedRoute>
          <Layout title="Contatos" description="Gerenciamento de contatos">
            <Contatos />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/kanban" element={
        <ProtectedRoute>
          <Layout title="Kanban" description="Quadro de tarefas">
            <Kanban />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/chatbot" element={
        <ProtectedRoute>
          <Layout title="ChatBot" description="Automação inteligente">
            <ChatBot />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/chatbot/flow-builder/:id" element={
        <ProtectedRoute>
          <FlowBuilder />
        </ProtectedRoute>
      } />
      
      <Route path="/automations" element={
        <ProtectedRoute>
          <Layout title="Automações" description="Fluxos de automação">
            <Automations />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/automations/builder/:id" element={
        <ProtectedRoute>
          <AutomationBuilder />
        </ProtectedRoute>
      } />
      
      <Route path="/usuarios" element={
        <ProtectedRoute>
          <Layout title="Usuários" description="Gerenciamento de usuários">
            <Usuarios />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/setores" element={
        <ProtectedRoute>
          <Layout title="Setores" description="Organização por setores">
            <Setores />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/gerenciar-equipe" element={
        <ProtectedRoute>
          <Layout title="Gerenciar Equipe" description="Administração da equipe">
            <GerenciarEquipe />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/meu-perfil" element={
        <ProtectedRoute>
          <Layout title="Meu Perfil" description="Configurações pessoais">
            <MeuPerfil />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/plano-faturamento" element={
        <ProtectedRoute>
          <Layout title="Plano e Faturamento" description="Gerenciamento financeiro">
            <PlanoFaturamento />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Rotas de configuração */}
      <Route path="/configuracoes/gerais" element={
        <ProtectedRoute>
          <Layout title="Configurações Gerais" description="Configurações do sistema">
            <ConfiguracoesGerais />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/configuracoes/avancadas" element={
        <ProtectedRoute>
          <Layout title="Configurações Avançadas" description="Configurações técnicas">
            <ConfiguracoesAvancadas />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/configuracoes/notificacoes" element={
        <ProtectedRoute>
          <Layout title="Notificações" description="Preferências de notificação">
            <PreferenciasNotificacao />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/configuracoes/aparencia" element={
        <ProtectedRoute>
          <Layout title="Aparência" description="Personalização visual">
            <Aparencia />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/configuracoes/idioma" element={
        <ProtectedRoute>
          <Layout title="Idioma" description="Configurações de idioma">
            <Idioma />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
