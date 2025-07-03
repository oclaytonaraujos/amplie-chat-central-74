
import { useState, useEffect } from 'react';

interface WhatsAppConnection {
  id: string;
  name: string;
  phone: string;
  status: 'connected' | 'disconnected' | 'pending' | 'waiting_approval';
  qrCode?: string;
  lastActivity?: Date;
  isActive: boolean;
  needsProviderApproval: boolean;
}

export function useWhatsAppConnections() {
  const [connections, setConnections] = useState<WhatsAppConnection[]>([]);
  const [hasConnectedWhatsApp, setHasConnectedWhatsApp] = useState(false);

  useEffect(() => {
    // Carregar conexões do localStorage
    const savedConnections = localStorage.getItem('whatsapp-connections');
    if (savedConnections) {
      try {
        const parsedConnections = JSON.parse(savedConnections);
        setConnections(parsedConnections);
        
        // Verificar se há pelo menos uma conexão ativa
        const hasActive = parsedConnections.some((conn: WhatsAppConnection) => 
          conn.status === 'connected' || conn.status === 'pending'
        );
        setHasConnectedWhatsApp(hasActive);
      } catch (error) {
        console.error('Erro ao carregar conexões WhatsApp:', error);
      }
    }

    // Escutar mudanças no localStorage
    const handleStorageChange = () => {
      const updatedConnections = localStorage.getItem('whatsapp-connections');
      if (updatedConnections) {
        try {
          const parsedConnections = JSON.parse(updatedConnections);
          setConnections(parsedConnections);
          
          const hasActive = parsedConnections.some((conn: WhatsAppConnection) => 
            conn.status === 'connected' || conn.status === 'pending'
          );
          setHasConnectedWhatsApp(hasActive);
        } catch (error) {
          console.error('Erro ao atualizar conexões WhatsApp:', error);
        }
      } else {
        setConnections([]);
        setHasConnectedWhatsApp(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Polling para mudanças internas (mesmo tab)
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return {
    connections,
    hasConnectedWhatsApp,
    connectedConnections: connections.filter(conn => conn.status === 'connected'),
  };
}
