import { apiClient } from './api-client'

export interface ConversationParticipant {
  id: string
  user_id?: string
  operator_user_id?: string
  role: string
  joined_at: string
  last_read_at?: string
}

export interface Conversation {
  id: string
  conversation_type: string
  title?: string
  is_encrypted: boolean
  encryption_type: string
  last_message_at?: string
  created_at: string
  participants: ConversationParticipant[]
}

export interface Message {
  id: string
  conversation_id: string
  sender_id?: string
  sender_operator_id?: string
  encrypted_content: string
  encryption_metadata: string
  content_type: string
  status: string
  sent_at?: string
  delivered_at?: string
  is_edited: boolean
  is_deleted: boolean
  server_created_at: string
  client_created_at?: string
}

export interface MessageCreateRequest {
  conversation_id: string
  encrypted_content: string
  encryption_metadata: string
  content_type?: string
  reply_to_message_id?: string
  attachment_encrypted?: boolean
  attachment_storage_path?: string
  attachment_metadata_encrypted?: string
  client_created_at: string
  offline_sequence?: number
}

export interface ConversationCreateRequest {
  conversation_type?: string
  participant_ids?: string[]
  title?: string
  support_center_id?: string
}

export class MessagingService {
  // Get all conversations
  async listConversations(skip: number = 0, limit: number = 20): Promise<Conversation[]> {
    const response = await apiClient.get<Conversation[]>('/api/v1/operator/messaging/conversations', { skip, limit })
    return response.data
  }

  // Get my conversations
  async listMyConversations(skip: number = 0, limit: number = 20): Promise<Conversation[]> {
    const response = await apiClient.get<Conversation[]>('/api/v1/operator/messaging/my-conversations', { skip, limit })
    return response.data
  }

  // Get a single conversation by ID
  async getConversation(conversationId: string): Promise<Conversation> {
    const response = await apiClient.get<Conversation>(`/api/v1/operator/messaging/conversations/${conversationId}`)
    return response.data
  }

  // Create a new conversation
  async createConversation(data: ConversationCreateRequest): Promise<Conversation> {
    const response = await apiClient.post<Conversation>('/api/v1/operator/messaging/conversations', data)
    return response.data
  }

  // Join a conversation
  async joinConversation(conversationId: string): Promise<void> {
    await apiClient.post(`/api/v1/operator/messaging/conversations/${conversationId}/join`)
  }

  // Leave a conversation
  async leaveConversation(conversationId: string): Promise<void> {
    await apiClient.post(`/api/v1/operator/messaging/conversations/${conversationId}/leave`)
  }

  // Get messages in a conversation
  async getMessages(conversationId: string, skip: number = 0, limit: number = 50): Promise<Message[]> {
    const response = await apiClient.get<Message[]>(`/api/v1/operator/messaging/conversations/${conversationId}/messages`, { skip, limit })
    return response.data
  }

  // Send a message
  async sendMessage(data: MessageCreateRequest): Promise<Message> {
    const response = await apiClient.post<Message>('/api/v1/operator/messaging/send', data)
    return response.data
  }

  // Mark conversation as read
  async markAsRead(conversationId: string): Promise<void> {
    await apiClient.post(`/api/v1/operator/messaging/conversations/${conversationId}/read`)
  }
}

export const messagingService = new MessagingService()
