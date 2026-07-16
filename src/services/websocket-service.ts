export type WsMessageHandler = (data: any) => void;

export interface WsEventMap {
  new_message: WsMessageHandler;
  typing: WsMessageHandler;
  message_status: WsMessageHandler;
  subscribed: WsMessageHandler;
  sos_update: WsMessageHandler;
  location_update: WsMessageHandler;
  error: WsMessageHandler;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private token: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private handlers: Partial<Record<keyof WsEventMap, WsMessageHandler[]>> = {};
  private subscribedConversations = new Set<string>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private manualDisconnect = false;

  connect(token: string): Promise<void> {
    this.token = token;
    this.reconnectAttempts = 0;
    this.manualDisconnect = false;
    return this._connect();
  }

  private _connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const wsBaseUrl = apiUrl.replace(/^http/, 'ws');
      const wsUrl = `${wsBaseUrl}/api/v1/operator/messaging/ws/chat?token=${this.token}`;

      try {
        this.ws = new WebSocket(wsUrl);
      } catch (e) {
        reject(e);
        return;
      }

      this.ws.onopen = () => {
        console.log('[WS] Connected');
        this.reconnectAttempts = 0;
        this._startHeartbeat();

        // Re-subscribe to any previously subscribed conversations
        for (const convId of Array.from(this.subscribedConversations)) {
          this._send('subscribe_conversation', { conversation_id: convId });
        }

        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this._dispatch(message.type, message);
        } catch (e) {
          console.error('[WS] Parse error:', e);
        }
      };

      this.ws.onclose = (event) => {
        console.log('[WS] Disconnected:', event.reason);
        this._stopHeartbeat();
        this.ws = null;

        if (!this.manualDisconnect && this.token && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const baseDelay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
          const jitter = Math.random() * 1000;
          const delay = Math.min(baseDelay + jitter, 30000);
          console.log(`[WS] Reconnecting in ${Math.round(delay)}ms (attempt ${this.reconnectAttempts})`);
          this.reconnectTimer = setTimeout(() => this._connect(), delay);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WS] Error:', error);
      };
    });
  }

  private _startHeartbeat() {
    this._stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      this._send('ping', { timestamp: new Date().toISOString() });
    }, 30000);
  }

  private _stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private _send(type: string, data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    }
  }

  private _dispatch(type: string, message: any) {
    const key = this._mapEventType(type);
    if (key && this.handlers[key]) {
      for (const handler of this.handlers[key]!) {
        handler(message.data || message);
      }
    }
  }

  private _mapEventType(type: string): keyof WsEventMap | null {
    const map: Record<string, keyof WsEventMap> = {
      'new_message': 'new_message',
      'typing': 'typing',
      'message_status': 'message_status',
      'subscribed': 'subscribed',
      'sos_update': 'sos_update',
      'location_update': 'location_update',
      'error': 'error',
    };
    return map[type] || null;
  }

  on<K extends keyof WsEventMap>(event: K, handler: WsEventMap[K]) {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    this.handlers[event]!.push(handler);
  }

  off<K extends keyof WsEventMap>(event: K, handler?: WsMessageHandler) {
    if (!this.handlers[event]) return;
    if (handler) {
      this.handlers[event] = this.handlers[event]!.filter(h => h !== handler);
    } else {
      delete this.handlers[event];
    }
  }

  subscribeToConversation(conversationId: string) {
    this.subscribedConversations.add(conversationId);
    this._send('subscribe_conversation', { conversation_id: conversationId });
  }

  unsubscribeFromConversation(conversationId: string) {
    this.subscribedConversations.delete(conversationId);
    this._send('unsubscribe_conversation', { conversation_id: conversationId });
  }

  sendTypingIndicator(conversationId: string, isTyping: boolean) {
    this._send('typing', {
      conversation_id: conversationId,
      is_typing: isTyping,
    });
  }

  sendMessageStatus(conversationId: string, messageId: string, status: string) {
    this._send('message_status', {
      conversation_id: conversationId,
      message_id: messageId,
      status,
    });
  }

  disconnect() {
    this.manualDisconnect = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this._stopHeartbeat();
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.subscribedConversations.clear();
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const wsService = new WebSocketService();
