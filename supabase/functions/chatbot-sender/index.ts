
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createLogger } from '../_shared/logger.ts'
import { validateApiKey } from '../_shared/validation.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SendMessagePayload {
  type: 'text' | 'image' | 'document' | 'audio' | 'video' | 'button' | 'list';
  phone: string;
  data: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Get correlation ID from header or generate new one
  const correlationId = req.headers.get('X-Correlation-ID') || crypto.randomUUID();
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const logger = createLogger(supabase, correlationId, 'chatbot-sender');

  try {
    const payload: SendMessagePayload = await req.json();
    
    await logger.info('Sender processing message', payload.phone, undefined, {
      messageType: payload.type,
      hasData: !!payload.data
    });

    // Validate Z-API configuration
    const ZAPI_URL = Deno.env.get('ZAPI_URL') || 'https://api.z-api.io';
    const ZAPI_TOKEN = Deno.env.get('ZAPI_TOKEN');
    const ZAPI_INSTANCE = Deno.env.get('ZAPI_INSTANCE');

    const tokenValidation = validateApiKey(ZAPI_TOKEN, 'Z-API Token');
    if (!tokenValidation.success) {
      await logger.error('Z-API Token validation failed', payload.phone, undefined, {
        errors: tokenValidation.errors
      });
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Z-API Token not configured',
        correlationId 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const instanceValidation = validateApiKey(ZAPI_INSTANCE, 'Z-API Instance');
    if (!instanceValidation.success) {
      await logger.error('Z-API Instance validation failed', payload.phone, undefined, {
        errors: instanceValidation.errors
      });
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Z-API Instance not configured',
        correlationId 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    let endpoint = '';
    let body: Record<string, any> = {};

    // Message type routing with enhanced validation
    switch (payload.type) {
      case 'text':
        if (!payload.data.message || typeof payload.data.message !== 'string') {
          await logger.error('Invalid text message payload', payload.phone, undefined, { payload });
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Message text is required',
            correlationId 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          });
        }
        endpoint = '/send-text';
        body = {
          phone: payload.phone,
          message: payload.data.message
        };
        break;

      case 'image':
        if (!payload.data.image) {
          await logger.error('Invalid image message payload', payload.phone, undefined, { payload });
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Image URL is required',
            correlationId 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          });
        }
        endpoint = '/send-image';
        body = {
          phone: payload.phone,
          image: payload.data.image,
          caption: payload.data.caption || ''
        };
        break;

      case 'document':
        if (!payload.data.document) {
          await logger.error('Invalid document message payload', payload.phone, undefined, { payload });
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Document URL is required',
            correlationId 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          });
        }
        endpoint = '/send-document';
        body = {
          phone: payload.phone,
          document: payload.data.document,
          filename: payload.data.filename || 'document'
        };
        break;

      case 'audio':
        if (!payload.data.audio) {
          await logger.error('Invalid audio message payload', payload.phone, undefined, { payload });
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Audio URL is required',
            correlationId 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          });
        }
        endpoint = '/send-audio';
        body = {
          phone: payload.phone,
          audio: payload.data.audio
        };
        break;

      case 'video':
        if (!payload.data.video) {
          await logger.error('Invalid video message payload', payload.phone, undefined, { payload });
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Video URL is required',
            correlationId 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          });
        }
        endpoint = '/send-video';
        body = {
          phone: payload.phone,
          video: payload.data.video,
          caption: payload.data.caption || ''
        };
        break;

      case 'button':
        if (!payload.data.message || !payload.data.buttons) {
          await logger.error('Invalid button message payload', payload.phone, undefined, { payload });
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Message and buttons are required',
            correlationId 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          });
        }
        endpoint = '/send-button-list';
        body = {
          phone: payload.phone,
          message: payload.data.message,
          buttonList: payload.data.buttons
        };
        break;

      case 'list':
        if (!payload.data.message || !payload.data.sections) {
          await logger.error('Invalid list message payload', payload.phone, undefined, { payload });
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Message and sections are required',
            correlationId 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          });
        }
        endpoint = '/send-list';
        body = {
          phone: payload.phone,
          message: payload.data.message,
          buttonText: payload.data.buttonText || 'Menu',
          sections: payload.data.sections
        };
        break;

      default:
        await logger.error('Unsupported message type', payload.phone, undefined, { messageType: payload.type });
        return new Response(JSON.stringify({ 
          success: false, 
          error: `Unsupported message type: ${payload.type}`,
          correlationId 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
    }

    // Make request to Z-API
    const zapiUrl = `${ZAPI_URL}/instances/${ZAPI_INSTANCE}/token/${ZAPI_TOKEN}${endpoint}`;
    
    await logger.debug('Sending to Z-API', payload.phone, undefined, {
      endpoint,
      zapiUrl: zapiUrl.replace(ZAPI_TOKEN, '[REDACTED]'),
      bodyKeys: Object.keys(body)
    });

    const startTime = Date.now();
    const response = await fetch(zapiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    const responseTime = Date.now() - startTime;
    const responseData = await response.json();

    if (!response.ok) {
      await logger.error('Z-API request failed', payload.phone, undefined, {
        status: response.status,
        responseTime,
        error: responseData,
        endpoint
      });
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Z-API error: ${response.status} - ${JSON.stringify(responseData)}`,
        correlationId 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    await logger.info('Message sent successfully', payload.phone, undefined, {
      messageType: payload.type,
      responseTime,
      zapiMessageId: responseData.messageId,
      endpoint
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Message sent successfully',
      type: payload.type,
      phone: payload.phone,
      responseTime,
      zapiResponse: responseData,
      correlationId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    await logger.error('Sender error', undefined, undefined, {
      error: error.message,
      stack: error.stack
    });
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      correlationId 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})
