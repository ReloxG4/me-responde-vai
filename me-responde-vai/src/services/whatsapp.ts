import axios from 'axios';
import { db } from '../config/firebase';
import { collection, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';

interface WhatsAppMessage {
  to: string;
  message: string;
  templateName?: string;
  templateData?: Record<string, string>;
}

interface WhatsAppConfig {
  apiKey: string;
  phoneNumberId: string;
  accessToken: string;
}

export class WhatsAppService {
  private config: WhatsAppConfig;
  private baseUrl = 'https://graph.facebook.com/v17.0';

  constructor(config: WhatsAppConfig) {
    this.config = config;
  }

  async sendMessage(data: WhatsAppMessage) {
    try {
      const endpoint = `${this.baseUrl}/${this.config.phoneNumberId}/messages`;
      const headers = {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json'
      };

      const payload = {
        messaging_product: 'whatsapp',
        to: data.to,
        type: 'text',
        text: { body: data.message }
      };

      const response = await axios.post(endpoint, payload, { headers });

      // Store message in Firestore
      await this.storeMessage({
        ...data,
        timestamp: new Date(),
        status: 'sent',
        messageId: response.data.messages[0].id
      });

      return response.data;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }

  async sendTemplateMessage(data: WhatsAppMessage) {
    if (!data.templateName) {
      throw new Error('Template name is required for template messages');
    }

    try {
      const endpoint = `${this.baseUrl}/${this.config.phoneNumberId}/messages`;
      const headers = {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json'
      };

      const payload = {
        messaging_product: 'whatsapp',
        to: data.to,
        type: 'template',
        template: {
          name: data.templateName,
          language: {
            code: 'pt_BR'
          },
          components: this.formatTemplateComponents(data.templateData)
        }
      };

      const response = await axios.post(endpoint, payload, { headers });

      await this.storeMessage({
        ...data,
        timestamp: new Date(),
        status: 'sent',
        messageId: response.data.messages[0].id,
        type: 'template'
      });

      return response.data;
    } catch (error) {
      console.error('Error sending WhatsApp template message:', error);
      throw error;
    }
  }

  private formatTemplateComponents(templateData?: Record<string, string>) {
    if (!templateData) return [];

    return Object.entries(templateData).map(([key, value]) => ({
      type: 'body',
      parameters: [{
        type: 'text',
        text: value
      }]
    }));
  }

  private async storeMessage(messageData: any) {
    try {
      const messagesCollection = collection(db, 'whatsapp_messages');
      await addDoc(messagesCollection, messageData);
    } catch (error) {
      console.error('Error storing message in Firestore:', error);
      throw error;
    }
  }

  async handleWebhook(payload: any) {
    try {
      const entry = payload.entry[0];
      const changes = entry.changes[0];
      const value = changes.value;

      if (value.messages) {
        const message = value.messages[0];
        await this.processIncomingMessage(message);
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
      throw error;
    }
  }

  private async processIncomingMessage(message: any) {
    try {
      const messagesCollection = collection(db, 'whatsapp_messages');
      await addDoc(messagesCollection, {
        from: message.from,
        timestamp: new Date(message.timestamp * 1000),
        type: message.type,
        content: message.text?.body || '',
        status: 'received',
        messageId: message.id
      });
    } catch (error) {
      console.error('Error processing incoming message:', error);
      throw error;
    }
  }
}