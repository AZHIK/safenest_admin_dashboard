import { io, Socket } from 'socket.io-client'
import { WebSocketEvent, WebSocketEventType } from '@/types'

export class WebSocketService {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  connect(token: string): Promise<Socket> {
    return new Promise((resolve, reject) => {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'
      
      this.socket = io(wsUrl, {
        auth: {
          token: token
        },
        transports: ['websocket'],
        upgrade: false,
        rememberUpgrade: false
      })

      this.socket.on('connect', () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
        resolve(this.socket!)
      })

      this.socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason)
        if (reason === 'io server disconnect') {
          // Server disconnected, reconnect manually
          this.reconnect(token)
        }
      })

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error)
        this.reconnectAttempts++
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(error)
        } else {
          setTimeout(() => {
            this.reconnect(token)
          }, this.reconnectDelay * this.reconnectAttempts)
        }
      })

      // Handle real-time events
      this.setupEventHandlers()
    })
  }

  private reconnect(token: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.connect(token)
      }, this.reconnectDelay * this.reconnectAttempts)
    }
  }

  private setupEventHandlers() {
    if (!this.socket) return

    // SOS Events
    this.socket.on('sos_triggered', (data: any) => {
      console.log('New SOS alert:', data)
      // Dispatch to store or callback
    })

    this.socket.on('sos_updated', (data: any) => {
      console.log('SOS updated:', data)
      // Update SOS in store
    })

    this.socket.on('location_update', (data: any) => {
      console.log('Location update:', data)
      // Update location on map
    })

    // Case Events
    this.socket.on('case_assigned', (data: any) => {
      console.log('Case assigned:', data)
      // Update case assignments
    })

    this.socket.on('case_updated', (data: any) => {
      console.log('Case updated:', data)
      // Refresh case data
    })

    // Messaging Events
    this.socket.on('message_received', (data: any) => {
      console.log('New message:', data)
      // Update messaging
    })

    // System Events
    this.socket.on('stakeholder_online', (data: any) => {
      console.log('Stakeholder online:', data)
      // Update online status
    })

    this.socket.on('stakeholder_offline', (data: any) => {
      console.log('Stakeholder offline:', data)
      // Update online status
    })

    this.socket.on('emergency_broadcast', (data: any) => {
      console.log('Emergency broadcast:', data)
      // Show emergency notification
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  // Emit events
  emit(event: string, data: any) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data)
    }
  }

  // Subscribe to specific events
  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  // Unsubscribe from events
  off(event: string, callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }

  // Join rooms for specific data
  joinRoom(room: string) {
    this.emit('join_room', { room })
  }

  leaveRoom(room: string) {
    this.emit('leave_room', { room })
  }

  // Get connection status
  isConnected(): boolean {
    return this.socket?.connected || false
  }
}

// Singleton instance
export const wsService = new WebSocketService()
