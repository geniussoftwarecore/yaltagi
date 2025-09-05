import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: Date;
  type: 'user' | 'system';
}

interface ChatProps {
  roomId: string;
}

export function Chat({ roomId }: ChatProps) {
  const { t } = useTranslation();
  const { username } = useAppStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Connect to WebSocket for chat
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const websocket = new WebSocket(wsUrl);
    
    websocket.onopen = () => {
      setWs(websocket);
      // Join chat room
      websocket.send(JSON.stringify({
        type: 'join-chat',
        roomId,
        username
      }));
    };
    
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'chat-message') {
        const message: ChatMessage = {
          id: Date.now().toString(),
          sender: data.sender,
          message: data.message,
          timestamp: new Date(data.timestamp),
          type: 'user'
        };
        setMessages(prev => [...prev, message]);
      }
    };
    
    return () => {
      websocket.close();
    };
  }, [roomId, username]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !ws) return;

    const message = {
      type: 'chat-message',
      roomId,
      sender: username,
      message: newMessage.trim(),
      timestamp: new Date().toISOString()
    };

    ws.send(JSON.stringify(message));
    setNewMessage('');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>{t('chat.noMessages')}</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="font-medium">{message.sender}</span>
                <span>{formatTime(message.timestamp)}</span>
              </div>
              <div className={`p-3 rounded-2xl max-w-[85%] ${
                message.sender === username
                  ? 'bg-primary-blue text-white ml-auto'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <p className="text-sm leading-relaxed break-words">
                  {message.message}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={sendMessage} className="flex space-x-2 rtl:space-x-reverse">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t('chat.placeholder')}
            className="flex-1"
            maxLength={500}
          />
          <Button
            type="submit"
            variant="primary"
            size="icon"
            disabled={!newMessage.trim()}
            className="w-12 h-12"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}