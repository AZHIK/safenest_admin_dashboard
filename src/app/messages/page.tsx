'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { PermissionGuard } from '@/components/auth/permission-guard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  MessageSquare, Search, Send, Phone, Shield, Lock,
  MoreHorizontal, Paperclip, Loader2, Check, CheckCheck, Clock, AlertCircle
} from 'lucide-react'
import { messagingService, Conversation, Message } from '@/services/messaging-service'
import { wsService } from '@/services/websocket-service'
import { useAuthStore } from '@/store/auth-store'
import { decryptData } from '@/lib/decryption'

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [messageInput, setMessageInput] = useState('')
  const [wsConnected, setWsConnected] = useState(false)
  const [typingUserId, setTypingUserId] = useState<string | null>(null)
  const [decryptedCache, setDecryptedCache] = useState<Record<string, string>>({})
  const [messagesError, setMessagesError] = useState<string | null>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const token = useAuthStore((s) => s.token)
  const currentOperatorId = useAuthStore((s) => s.stakeholder?.id)
  const selectedConvRef = useRef<Conversation | null>(null)
  const wsConnectedRef = useRef(false)

  // Keep refs in sync with state
  useEffect(() => { selectedConvRef.current = selectedConversation }, [selectedConversation])
  useEffect(() => { wsConnectedRef.current = wsConnected }, [wsConnected])

  const decryptMessage = useCallback(async (msg: Message): Promise<string> => {
    if (!msg.encrypted_content || !msg.encryption_metadata || msg.encryption_metadata === '{}') {
      return msg.encrypted_content
    }
    const cacheKey = msg.id
    if (decryptedCache[cacheKey]) return decryptedCache[cacheKey]
    try {
      const encryptedBytes = Uint8Array.from(atob(msg.encrypted_content), c => c.charCodeAt(0))
      const decryptedBuffer = await decryptData(encryptedBytes, msg.encryption_metadata)
      const decoder = new TextDecoder()
      const plaintext = decoder.decode(decryptedBuffer)
      setDecryptedCache(prev => ({ ...prev, [cacheKey]: plaintext }))
      return plaintext
    } catch {
      return msg.encrypted_content
    }
  }, [decryptedCache])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Connect WebSocket
  useEffect(() => {
    if (!token) return

    wsService.connect(token)
      .then(() => {
        setWsConnected(true)
        const conv = selectedConvRef.current
        if (conv) {
          wsService.subscribeToConversation(conv.id)
        }
      })
      .catch(() => setWsConnected(false))

    return () => {
      wsService.disconnect()
    }
  }, [token])

  // WebSocket event handlers - use refs to avoid stale closures
  useEffect(() => {
    const handleNewMessage = (data: any) => {
      const conv = selectedConvRef.current
      if (conv && data.conversation_id === conv.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message_id)) return prev
          const newMsg: Message = {
            id: data.message_id,
            conversation_id: data.conversation_id,
            sender_id: data.sender_id || null,
            sender_operator_id: data.sender_operator_id || (data.is_operator_sender ? data.sender_id : undefined),
            encrypted_content: data.encrypted_content || '',
            encryption_metadata: data.encryption_metadata || '{}',
            content_type: data.content_type || 'text',
            status: data.status || 'sent',
            sent_at: data.sent_at || new Date().toISOString(),
            delivered_at: data.delivered_at || null,
            is_edited: false,
            is_deleted: false,
            server_created_at: data.server_created_at || data.sent_at || new Date().toISOString(),
          }
          return [...prev, newMsg]
        })
        setTimeout(scrollToBottom, 100)
      }
      loadConversations()
    }

    const handleTyping = (data: any) => {
      const conv = selectedConvRef.current
      if (conv && data.conversation_id === conv.id) {
        if (data.is_typing) {
          setTypingUserId(data.user_id)
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
          typingTimeoutRef.current = setTimeout(() => setTypingUserId(null), 3000)
        } else {
          setTypingUserId(null)
        }
      }
    }

    const handleMessageStatus = (data: any) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === data.message_id ? { ...m, status: data.status } : m
        )
      )
    }

    wsService.on('new_message', handleNewMessage)
    wsService.on('typing', handleTyping)
    wsService.on('message_status', handleMessageStatus)

    return () => {
      wsService.off('new_message', handleNewMessage)
      wsService.off('typing', handleTyping)
      wsService.off('message_status', handleMessageStatus)
    }
  }, [scrollToBottom])

  // Subscribe/unsubscribe when conversation changes
  useEffect(() => {
    if (wsConnected && selectedConversation) {
      wsService.subscribeToConversation(selectedConversation.id)
    }
    return () => {
      if (selectedConversation) {
        wsService.unsubscribeFromConversation(selectedConversation.id)
      }
    }
  }, [selectedConversation, wsConnected])

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      const data = await messagingService.listMyConversations()
      // Deduplicate by id client-side
      const seen = new Set<string>()
      const deduped = data.filter(c => {
        if (seen.has(c.id)) return false
        seen.add(c.id)
        return true
      })
      setConversations(deduped)
    } catch (error) {
      console.error('Failed to load conversations:', error)
    }
  }, [])

  useEffect(() => {
    async function init() {
      try {
        setLoading(true)
        await loadConversations()
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [loadConversations])

  // Load messages when a conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      setMessagesError(null)
      const loadMessages = async () => {
        try {
          const data = await messagingService.getMessages(selectedConversation.id)
          setMessages(data)
          await messagingService.markAsRead(selectedConversation.id)
          for (const msg of data) {
            decryptMessage(msg)
          }
        } catch (error: any) {
          console.error('Failed to load messages:', error)
          setMessagesError(error?.message || 'Failed to load messages')
        }
      }
      loadMessages()
    }
  }, [selectedConversation, decryptMessage])

  // Poll for new messages as a fallback when WS is not connected
  useEffect(() => {
    if (!selectedConversation) return

    const interval = setInterval(async () => {
      if (wsConnectedRef.current) return
      try {
        const data = await messagingService.getMessages(selectedConversation.id)
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id))
          const newOnes = data.filter((m) => !existingIds.has(m.id))
          if (newOnes.length === 0) return prev
          return [...prev, ...newOnes]
        })
      } catch {
        // ignore polling errors
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [selectedConversation])

  // Send a message
  const handleSendMessage = async () => {
    if (!selectedConversation || !messageInput.trim()) return

    const tempId = `temp-${Date.now()}`
    const optimistic: Message = {
      id: tempId,
      conversation_id: selectedConversation.id,
      sender_operator_id: currentOperatorId || 'me',
      encrypted_content: messageInput,
      encryption_metadata: '{}',
      content_type: 'text',
      status: 'pending',
      server_created_at: new Date().toISOString(),
      is_edited: false,
      is_deleted: false,
    }

    setMessages((prev) => [...prev, optimistic])
    setSending(true)
    const text = messageInput
    setMessageInput('')

    try {
      const sent = await messagingService.sendMessage({
        conversation_id: selectedConversation.id,
        encrypted_content: text,
        encryption_metadata: '{}',
        content_type: 'text',
        client_created_at: new Date().toISOString(),
      })

      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? sent : m))
      )
      await loadConversations()
    } catch (error) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...m, status: 'failed' as const } : m
        )
      )
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Check className="h-3 w-3" />
      case 'delivered': return <CheckCheck className="h-3 w-3" />
      case 'read': return <CheckCheck className="h-3 w-3 text-blue-400" />
      case 'pending': return <Clock className="h-3 w-3" />
      case 'failed': return <span className="text-red-400 text-xs">Failed</span>
      default: return null
    }
  }

  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  return (
    <PermissionGuard permission="messages.view">
    <DashboardLayout>
      <div className="space-y-6 h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-emergency-100 rounded-lg">
              <MessageSquare className="h-8 w-8 text-emergency-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Secure Messages</h1>
              <p className="text-gray-500">End-to-end encrypted communication</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-safe-600" />
            <span className="text-sm text-safe-600 font-medium">
              {wsConnected ? 'Connected' : 'Connecting...'}
            </span>
            {wsConnected && (
              <span className="h-2 w-2 rounded-full bg-green-500" />
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-emergency-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Conversations List */}
            <Card className="lg:col-span-1 flex flex-col h-full">
              <CardHeader className="pb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="Search conversations..." className="pl-10" />
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-0">
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="w-full grid grid-cols-3 rounded-none">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="unread">Unread</TabsTrigger>
                    <TabsTrigger value="archived">Archived</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all" className="m-0">
                    <div className="divide-y">
                      {conversations.map((conv) => (
                        <div
                          key={conv.id}
                          onClick={() => setSelectedConversation(conv)}
                          className={`p-4 cursor-pointer transition-colors ${
                            selectedConversation?.id === conv.id
                              ? 'bg-gray-50'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-emergency-100 rounded-full flex items-center justify-center">
                              <span className="text-emergency-600 font-semibold">
                                {(conv.title || 'C').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-900 truncate">
                                  {conv.title || `Conversation ${conv.id.slice(0, 8)}`}
                                </h4>
                                {conv.last_message_at && (
                                  <span className="text-xs text-gray-500">
                                    {formatTime(conv.last_message_at)}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 capitalize">
                                {conv.conversation_type.replace('_', ' ')}
                              </p>
                              <p className="text-xs text-gray-400 truncate mt-1">
                                {conv.participants?.length || 0} participant{(conv.participants?.length || 0) !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Chat Area */}
            <Card className="lg:col-span-2 flex flex-col h-full">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <CardHeader className="border-b pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-emergency-100 rounded-full flex items-center justify-center">
                          <span className="text-emergency-600 font-semibold">
                            {(selectedConversation.title || 'C').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {selectedConversation.title || `Conversation ${selectedConversation.id.slice(0, 8)}`}
                          </h3>
                          <p className="text-sm text-gray-500 capitalize">
                            {selectedConversation.conversation_type.replace('_', ' ')}
                            {typingUserId && (
                              <span className="ml-2 text-emergency-600 italic text-xs">
                                typing...
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Lock className="h-4 w-4 text-safe-600" />
                        <span className="text-xs text-safe-600">Encrypted</span>
                        <Button variant="ghost" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <CardContent className="flex-1 overflow-y-auto py-4 space-y-4">
                    {messagesError ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <AlertCircle className="h-12 w-12 mb-4 text-red-400" />
                        <h3 className="text-lg font-medium">Failed to load messages</h3>
                        <p className="text-sm">{messagesError}</p>
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => {
                            setMessagesError(null)
                            setMessages([])
                            if (selectedConversation) {
                              messagingService.getMessages(selectedConversation.id)
                                .then(data => setMessages(data))
                                .catch(e => setMessagesError(e?.message || 'Retry failed'))
                            }
                          }}
                        >
                          Retry
                        </Button>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <MessageSquare className="h-12 w-12 mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium">No messages yet</h3>
                        <p className="text-sm">Send a message to start the conversation</p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <MessageBubble
                          key={msg.id}
                          msg={msg}
                          decryptedCache={decryptedCache}
                          onDecrypt={decryptMessage}
                          formatTime={formatTime}
                          getStatusIcon={getStatusIcon}
                        />
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </CardContent>

                  {/* Input Area */}
                  <CardContent className="border-t pt-4">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Input
                        placeholder="Type a message..."
                        className="flex-1"
                        value={messageInput}
                        onChange={(e) => {
                          setMessageInput(e.target.value)
                          if (selectedConversation) {
                            wsService.sendTypingIndicator(
                              selectedConversation.id,
                              e.target.value.length > 0
                            )
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                      />
                      <Button
                        className="bg-emergency-600 hover:bg-emergency-700"
                        onClick={handleSendMessage}
                        disabled={sending || !messageInput.trim()}
                      >
                        {sending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-center">
                      Messages are end-to-end encrypted
                    </p>
                  </CardContent>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <MessageSquare className="h-16 w-16 mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium">Select a conversation</h3>
                  <p className="text-sm">Choose a conversation from the list to start messaging</p>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
    </PermissionGuard>
  )
}

function MessageBubble({ msg, decryptedCache, onDecrypt, formatTime, getStatusIcon }: {
  msg: Message
  decryptedCache: Record<string, string>
  onDecrypt: (msg: Message) => Promise<string>
  formatTime: (dateStr: string) => string
  getStatusIcon: (status: string) => React.ReactNode
}) {
  const [displayText, setDisplayText] = useState(msg.encrypted_content)

  useEffect(() => {
    if (decryptedCache[msg.id]) {
      setDisplayText(decryptedCache[msg.id])
    } else if (msg.encrypted_content && msg.encryption_metadata && msg.encryption_metadata !== '{}') {
      onDecrypt(msg).then(plaintext => {
        setDisplayText(plaintext)
      })
    }
  }, [msg.id, msg.encrypted_content, msg.encryption_metadata, decryptedCache, onDecrypt])

  return (
    <div
      className={`flex ${msg.sender_operator_id ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[70%] px-4 py-2 rounded-lg ${
          msg.sender_operator_id
            ? 'bg-emergency-600 text-white rounded-br-none'
            : 'bg-gray-100 text-gray-900 rounded-bl-none'
        }`}
      >
        <p className="text-sm">{displayText}</p>
        <div className={`flex items-center justify-end space-x-1 mt-1 ${
          msg.sender_operator_id ? 'text-emergency-100' : 'text-gray-500'
        }`}>
          <span className="text-xs">
            {formatTime(msg.server_created_at)}
          </span>
          {msg.sender_operator_id && (
            <span className="inline-flex">
              {getStatusIcon(msg.status)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
