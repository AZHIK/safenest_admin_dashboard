'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MessageSquare, Search, Send, Phone, Shield, Lock, MoreHorizontal, Paperclip } from 'lucide-react'

const mockConversations = [
  { id: 1, name: 'Sarah Johnson', role: 'Survivor', lastMessage: 'Thank you for your help today', time: '10:30 AM', unread: 2, status: 'online', encrypted: true },
  { id: 2, name: 'Officer Martinez', role: 'Police', lastMessage: 'Case #2341 has been updated', time: '9:45 AM', unread: 0, status: 'offline', encrypted: true },
  { id: 3, name: 'Dr. Emily Chen', role: 'Counselor', lastMessage: 'Session notes attached', time: 'Yesterday', unread: 1, status: 'online', encrypted: true },
  { id: 4, name: 'Support Center A', role: 'Organization', lastMessage: 'Shelter availability confirmed', time: 'Yesterday', unread: 0, status: 'online', encrypted: true },
  { id: 5, name: 'Legal Aid Services', role: 'Legal', lastMessage: 'Documents ready for review', time: 'Jan 14', unread: 0, status: 'offline', encrypted: true },
]

const mockMessages = [
  { id: 1, sender: 'me', content: 'Hello Sarah, how are you feeling today?', time: '10:25 AM' },
  { id: 2, sender: 'them', content: 'I\'m doing better, thank you for checking in', time: '10:28 AM' },
  { id: 3, sender: 'me', content: 'That\'s great to hear. Is there anything you need assistance with?', time: '10:29 AM' },
  { id: 4, sender: 'them', content: 'Thank you for your help today', time: '10:30 AM' },
]

export default function MessagesPage() {
  return (
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
            <span className="text-sm text-safe-600 font-medium">All conversations are encrypted</span>
          </div>
        </div>

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
                    {mockConversations.map((conv) => (
                      <div key={conv.id} className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                        <div className="flex items-start space-x-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-emergency-100 rounded-full flex items-center justify-center">
                              <span className="text-emergency-600 font-semibold">{conv.name.charAt(0)}</span>
                            </div>
                            {conv.status === 'online' && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-safe-500 rounded-full border-2 border-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900 truncate">{conv.name}</h4>
                              <span className="text-xs text-gray-500">{conv.time}</span>
                            </div>
                            <p className="text-xs text-gray-500">{conv.role}</p>
                            <p className="text-sm text-gray-600 truncate mt-1">{conv.lastMessage}</p>
                          </div>
                          {conv.unread > 0 && (
                            <Badge className="bg-emergency-600 text-white">{conv.unread}</Badge>
                          )}
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
            {/* Chat Header */}
            <CardHeader className="border-b pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-emergency-100 rounded-full flex items-center justify-center">
                      <span className="text-emergency-600 font-semibold">S</span>
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-safe-500 rounded-full border-2 border-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Sarah Johnson</h3>
                    <p className="text-sm text-gray-500">Survivor • Online</p>
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
              <div className="text-center">
                <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Today</span>
              </div>
              {mockMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-4 py-2 rounded-lg ${
                    msg.sender === 'me' 
                      ? 'bg-emergency-600 text-white rounded-br-none' 
                      : 'bg-gray-100 text-gray-900 rounded-bl-none'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                    <span className={`text-xs ${msg.sender === 'me' ? 'text-emergency-100' : 'text-gray-500'} block mt-1`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>

            {/* Input Area */}
            <CardContent className="border-t pt-4">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input placeholder="Type a message..." className="flex-1" />
                <Button className="bg-emergency-600 hover:bg-emergency-700">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">Messages are end-to-end encrypted</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
