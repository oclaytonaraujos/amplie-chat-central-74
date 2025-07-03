
export interface ZApiConfig {
  instanceId: string;
  token: string;
  serverUrl?: string;
}

export interface ZApiMessage {
  phone: string;
  message: string;
  messageId?: string;
  delayMessage?: number;
}

export interface ZApiWebhookMessage {
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

export interface ZApiStatus {
  connected: boolean;
  instanceStatus: string;
  lastCheck: Date | null;
}

export interface ProcessedMessage {
  id: string;
  phone: string;
  fromMe: boolean;
  timestamp: Date;
  senderName: string;
  senderPhoto?: string;
  type: 'text' | 'image' | 'document' | 'audio' | 'video';
  content: string;
  attachment?: {
    type: 'image' | 'document' | 'audio' | 'video';
    url: string;
    fileName?: string;
    mimeType?: string;
  };
}
