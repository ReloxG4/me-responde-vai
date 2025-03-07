import axios from 'axios';
import { db } from '../config/firebase';
import { collection, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';

interface InstagramConfig {
  accessToken: string;
  pageId: string;
}

interface InstagramMessage {
  userId: string;
  message: string;
  mediaUrl?: string;
  timestamp?: Date;
  status?: 'sent' | 'received';
  messageId?: string;
}

interface WebhookPayload {
  entry: Array<{
    messaging?: Array<{
      sender: { id: string };
      timestamp: number;
      message: {
        text?: string;
        mid: string;
        attachments?: Array<{
          payload: { url: string };
        }>;
      };
    }>;
  }>;
}

export class InstagramService {
  private config: InstagramConfig;
  private baseUrl = 'https://graph.facebook.com/v17.0';

  constructor(config: InstagramConfig) {
    this.config = config;
  }

  async sendDirectMessage(data: InstagramMessage) {
    try {
      const endpoint = `${this.baseUrl}/${this.config.pageId}/messages`;
      const headers = {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json'
      };

      const payload = {
        recipient: { id: data.userId },
        message: { text: data.message }
      };

      if (data.mediaUrl) {
        payload.message = {
          attachment: {
            type: 'image',
            payload: {
              url: data.mediaUrl,
              is_reusable: true
            }
          }
        };
      }

      const response = await axios.post(endpoint, payload, { headers });

      await this.storeMessage({
        ...data,
        timestamp: new Date(),
        status: 'sent',
        messageId: response.data.message_id
      });

      return response.data;
    } catch (error) {
      console.error('Error sending Instagram message:', error);
      throw error;
    }
  }

  async handleWebhook(payload: WebhookPayload) {
    try {
      const entry = payload.entry[0];
      if (!entry) {
        throw new Error('Invalid webhook payload: missing entry');
      }
      if (entry.messaging && entry.messaging.length > 0) {
        const message = entry.messaging[0];
        await this.processIncomingMessage(message);
      }
    } catch (error) {
      console.error('Error processing Instagram webhook:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  private async processIncomingMessage(message: WebhookPayload['entry'][0]['messaging'][0]) {
    try {
      if (!message.sender?.id || !message.message?.mid) {
        throw new Error('Invalid message format: missing required fields');
      }

      const messagesCollection = collection(db, 'instagram_messages');
      await addDoc(messagesCollection, {
        from: message.sender.id,
        timestamp: new Date(message.timestamp),
        content: message.message.text || '',
        mediaUrl: message.message.attachments?.[0]?.payload?.url,
        status: 'received',
        messageId: message.message.mid
      });
    } catch (error) {
      console.error('Error processing incoming Instagram message:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  private async storeMessage(messageData: any) {
    try {
      const messagesCollection = collection(db, 'instagram_messages');
      await addDoc(messagesCollection, messageData);
    } catch (error) {
      console.error('Error storing Instagram message:', error);
      throw error;
    }
  }

  async getInsights() {
    try {
      const endpoint = `${this.baseUrl}/${this.config.pageId}/insights`;
      const headers = {
        'Authorization': `Bearer ${this.config.accessToken}`
      };

      const response = await axios.get(endpoint, { headers });
      return response.data;
    } catch (error) {
      console.error('Error fetching Instagram insights:', error);
      throw error;
    }
  }

  async getComments(mediaId: string) {
    try {
      const endpoint = `${this.baseUrl}/${mediaId}/comments`;
      const headers = {
        'Authorization': `Bearer ${this.config.accessToken}`
      };

      const response = await axios.get(endpoint, { headers });
      return response.data;
    } catch (error) {
      console.error('Error fetching Instagram comments:', error);
      throw error;
    }
  }

  async replyToComment(commentId: string, message: string) {
    try {
      const endpoint = `${this.baseUrl}/${commentId}/replies`;
      const headers = {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json'
      };

      const payload = {
        message
      };

      const response = await axios.post(endpoint, payload, { headers });
      return response.data;
    } catch (error) {
      console.error('Error replying to Instagram comment:', error);
      throw error;
    }
  }
}