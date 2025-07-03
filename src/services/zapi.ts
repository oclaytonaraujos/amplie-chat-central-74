
interface ZApiConfig {
  instanceId: string;
  token: string;
  serverUrl?: string;
}

interface ZApiMessage {
  phone: string;
  message: string;
  messageId?: string;
  delayMessage?: number;
}

interface ZApiMessageOptions {
  type: 'text' | 'image' | 'document' | 'audio' | 'video';
  url?: string;
  caption?: string;
  fileName?: string;
}

interface ZApiWebhookMessage {
  messageId: string;
  phone: string;
  fromMe: boolean;
  momment: number;
  status: string;
  chatName: string;
  senderPhoto: string;
  senderName: string;
  participantPhone?: string;
  photo?: string;
  broadcast?: boolean;
  type: 'ReceivedCallback' | 'MessageStatusCallback';
  text?: {
    message: string;
  };
  image?: {
    mimeType: string;
    imageUrl: string;
    caption?: string;
  };
  audio?: {
    audioUrl: string;
    mimeType: string;
  };
  document?: {
    documentUrl: string;
    mimeType: string;
    title: string;
    pageCount?: number;
  };
  video?: {
    videoUrl: string;
    mimeType: string;
    caption?: string;
  };
  contact?: {
    displayName: string;
    vcard: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
}

class ZApiService {
  private config: ZApiConfig;
  private baseUrl: string;

  constructor(config: ZApiConfig) {
    this.config = config;
    this.baseUrl = config.serverUrl || 'https://api.z-api.io';
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Client-Token': this.config.token,
    };
  }

  private getUrl(endpoint: string) {
    return `${this.baseUrl}/instances/${this.config.instanceId}/${endpoint}`;
  }

  // Enviar mensagem de texto
  async sendTextMessage(phone: string, message: string, options?: { delayMessage?: number }): Promise<any> {
    console.log('Enviando mensagem via Z-API:', { phone, message });
    
    try {
      const response = await fetch(this.getUrl('token/send-text'), {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          phone: phone.replace(/\D/g, ''), // Remove formatação
          message,
          delayMessage: options?.delayMessage || 0,
        }),
      });

      const data = await response.json();
      console.log('Resposta Z-API:', data);
      return data;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  // Enviar mensagem com opções (menu)
  async sendMenuMessage(phone: string, message: string, options: string[]): Promise<any> {
    console.log('Enviando menu via Z-API:', { phone, message, options });
    
    // A Z-API não tem menu nativo, então enviamos como texto formatado
    const menuText = `${message}\n\n${options.map((option, index) => `${index + 1}. ${option}`).join('\n')}`;
    
    return this.sendTextMessage(phone, menuText);
  }

  // Enviar imagem
  async sendImageMessage(phone: string, imageUrl: string, caption?: string): Promise<any> {
    console.log('Enviando imagem via Z-API:', { phone, imageUrl, caption });
    
    try {
      const response = await fetch(this.getUrl('token/send-image'), {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          phone: phone.replace(/\D/g, ''),
          image: imageUrl,
          caption: caption || '',
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
      throw error;
    }
  }

  // Enviar documento
  async sendDocumentMessage(phone: string, documentUrl: string, fileName: string): Promise<any> {
    console.log('Enviando documento via Z-API:', { phone, documentUrl, fileName });
    
    try {
      const response = await fetch(this.getUrl('token/send-document-url'), {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          phone: phone.replace(/\D/g, ''),
          document: documentUrl,
          fileName,
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('Erro ao enviar documento:', error);
      throw error;
    }
  }

  // Enviar áudio
  async sendAudioMessage(phone: string, audioUrl: string): Promise<any> {
    console.log('Enviando áudio via Z-API:', { phone, audioUrl });
    
    try {
      const response = await fetch(this.getUrl('token/send-audio'), {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          phone: phone.replace(/\D/g, ''),
          audio: audioUrl,
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('Erro ao enviar áudio:', error);
      throw error;
    }
  }

  // Verificar status da instância
  async getInstanceStatus(): Promise<any> {
    try {
      const response = await fetch(this.getUrl('token/status'), {
        method: 'GET',
        headers: this.getHeaders(),
      });

      return await response.json();
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      throw error;
    }
  }

  // Configurar webhook
  async setWebhook(webhookUrl: string): Promise<any> {
    console.log('Configurando webhook Z-API:', webhookUrl);
    
    try {
      const response = await fetch(this.getUrl('token/webhook'), {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          url: webhookUrl,
          enabled: true,
          webhookByEvents: false,
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('Erro ao configurar webhook:', error);
      throw error;
    }
  }

  // Processar mensagem recebida do webhook
  processWebhookMessage(webhookData: ZApiWebhookMessage) {
    console.log('Processando mensagem do webhook:', webhookData);
    
    const processedMessage = {
      id: webhookData.messageId,
      phone: webhookData.phone,
      fromMe: webhookData.fromMe,
      timestamp: new Date(webhookData.momment * 1000),
      senderName: webhookData.senderName || webhookData.chatName,
      senderPhoto: webhookData.senderPhoto,
      type: 'text' as 'text' | 'image' | 'document' | 'audio' | 'video',
      content: '',
      attachment: null as any,
    };

    // Processar diferentes tipos de mensagem
    if (webhookData.text) {
      processedMessage.type = 'text';
      processedMessage.content = webhookData.text.message;
    } else if (webhookData.image) {
      processedMessage.type = 'image';
      processedMessage.content = webhookData.image.caption || '';
      processedMessage.attachment = {
        type: 'image',
        url: webhookData.image.imageUrl,
        mimeType: webhookData.image.mimeType,
      };
    } else if (webhookData.document) {
      processedMessage.type = 'document';
      processedMessage.content = webhookData.document.title;
      processedMessage.attachment = {
        type: 'document',
        url: webhookData.document.documentUrl,
        fileName: webhookData.document.title,
        mimeType: webhookData.document.mimeType,
      };
    } else if (webhookData.audio) {
      processedMessage.type = 'audio';
      processedMessage.attachment = {
        type: 'audio',
        url: webhookData.audio.audioUrl,
        mimeType: webhookData.audio.mimeType,
      };
    } else if (webhookData.video) {
      processedMessage.type = 'video';
      processedMessage.content = webhookData.video.caption || '';
      processedMessage.attachment = {
        type: 'video',
        url: webhookData.video.videoUrl,
        mimeType: webhookData.video.mimeType,
      };
    }

    return processedMessage;
  }
}

export { ZApiService, type ZApiConfig, type ZApiWebhookMessage };
