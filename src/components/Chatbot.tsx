'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { getUserIdentifier, getSessionId } from '@/lib/user-utils';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Helper function to format inline markdown
const formatInlineMarkdown = (text: string) => {
  if (!text) return text;
  
  // Handle links [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-ocean-600 hover:text-ocean-700 underline">$1</a>');
  
  // Handle code `code`
  text = text.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>');
  
  // Handle bold **text**
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>');
  
  // Handle italic *text* (but not **text**)
  text = text.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em class="italic">$1</em>');
  
  return <span dangerouslySetInnerHTML={{ __html: text }} />;
};

export default function Chatbot() {
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I\'m your AI career assistant powered by Gemini AI. I can help you with:\n\n• Resume writing tips\n• Career development advice\n• Job search strategies\n• Interview preparation\n• Skill assessment\n\nWhat would you like to know?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => getSessionId());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Listen to auth state changes
  useEffect(() => {
    if (!auth) {
      // Firebase not configured, use demo mode
      setUser({ uid: 'demo-user', email: 'demo@example.com' });
      return;
    }
    
    const unsubscribe = auth.onAuthStateChanged((user: any) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Load chat history when component mounts or user changes
  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user]);

  const loadChatHistory = async () => {
    const userId = getUserIdentifier(user);
    if (!userId) return;
    
    try {
      const response = await fetch(`/api/chat?userId=${encodeURIComponent(userId)}&sessionId=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.messages && data.messages.length > 0) {
          // Convert timestamp strings to Date objects
          const messagesWithDates = data.messages.map((message: any) => ({
            ...message,
            timestamp: new Date(message.timestamp)
          }));
          setMessages(messagesWithDates);
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const saveMessage = async (message: Message) => {
    const userId = getUserIdentifier(user);
    if (!userId) return;
    
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          sessionId,
          message
        })
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  // Build a compact recent history payload to provide context to the AI
  const MAX_HISTORY_ITEMS = 100;
  const buildCompactHistory = (items: Message[]) => {
    return items
      .slice(-MAX_HISTORY_ITEMS)
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        text: (m.text || '').slice(0, 800000),
        ts: new Date(m.timestamp).toISOString()
      }));
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    await saveMessage(userMessage);
    setInputValue('');
    setIsTyping(true);

    // Call Gemini AI API
    try {
      // Include compact recent history for context
      const historyPayload = buildCompactHistory([...(messages || []), userMessage]);

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputValue, // Send the user's question directly
          isChat: true,
          history: historyPayload
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API failed with status ${response.status}`);
      }

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.result?.description || data.rawGeminiResponse || 'Sorry, I had trouble processing that.',
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      await saveMessage(botMessage);

    } catch (error) {
      console.error('AI API error:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I\'m having trouble connecting to the AI right now. Please try again later.',
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      await saveMessage(errorMessage);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-ocean-600 to-ocean-700 text-white shadow-2xl hover:shadow-ocean-500/50 transition-all duration-300 z-50 group"
      >
        {isOpen ? (
          <X className="w-7 h-7 transition-transform duration-300" />
        ) : (
          <MessageCircle className="w-7 h-7 transition-transform duration-300" />
        )}
        
        {/* Pulse ring */}
        {!isOpen && (
          <div className="absolute inset-0 rounded-full bg-ocean-400 opacity-75"></div>
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-96 h-[500px] shadow-2xl border-0 bg-white/95 backdrop-blur-md z-50">
          <CardContent className="p-0 h-full flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-ocean-600 to-ocean-700 text-white p-4 rounded-t-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Career Assistant</h3>
                  <p className="text-sm text-blue-100">Online • Ready to help</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-indicator">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-ocean-600 text-white rounded-br-md'
                        : 'bg-gray-100 text-gray-800 rounded-bl-md'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">
                      {message.text.split('\n').map((line, index) => {
                        // Handle headers
                        if (line.trim().startsWith('#')) {
                          const level = line.match(/^#+/)?.[0].length || 1;
                          const text = line.replace(/^#+\s*/, '');
                          const HeaderTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements;
                          return (
                            <HeaderTag key={index} className={`font-bold text-gray-800 mt-2 mb-1 ${
                              level === 1 ? 'text-lg' : level === 2 ? 'text-base' : 'text-sm'
                            }`}>
                              {text}
                            </HeaderTag>
                          );
                        }
                        
                        // Handle numbered lists
                        if (line.trim().match(/^\d+\./)) {
                          const text = line.replace(/^\d+\.\s*/, '');
                          return (
                            <div key={index} className="flex items-start mt-1">
                              <span className="text-ocean-600 mr-2 font-medium">
                                {line.match(/^\d+/)?.[0]}.
                              </span>
                              <span className="flex-1">{formatInlineMarkdown(text)}</span>
                            </div>
                          );
                        }
                        
                        // Handle bullet points (including inline bullets like "Example:*")
                        if (line.includes('*') && !line.includes('**')) {
                          // Check if it's a bullet point at start or inline
                          const bulletMatch = line.match(/^(\s*)\*(\s+)/);
                          const inlineBulletMatch = line.match(/(\w+):\*(\s+)/);
                          
                          if (bulletMatch) {
                            // Standard bullet point at start
                            const text = line.replace(/^\s*\*\s*/, '');
                            return (
                              <div key={index} className="flex items-start mt-1">
                                <span className="text-ocean-600 mr-2">•</span>
                                <span className="flex-1">{formatInlineMarkdown(text)}</span>
                              </div>
                            );
                          } else if (inlineBulletMatch) {
                            // Inline bullet like "Example:* text"
                            const parts = line.split(/:\*(\s+)/);
                            const prefix = parts[0];
                            const text = parts.slice(2).join('');
                            return (
                              <div key={index} className="flex items-start mt-1">
                                <span className="text-ocean-600 mr-2">{prefix}:</span>
                                <span className="text-ocean-600 mr-2">•</span>
                                <span className="flex-1">{formatInlineMarkdown(text)}</span>
                              </div>
                            );
                          }
                        }
                        
                        // Handle blockquotes
                        if (line.trim().startsWith('>')) {
                          return (
                            <div key={index} className="border-l-4 border-ocean-300 pl-3 mt-1 italic text-gray-600">
                              {formatInlineMarkdown(line.replace(/^>\s*/, ''))}
                            </div>
                          );
                        }
                        
                        // Regular text with inline formatting
                        return (
                          <div key={index} className="mt-1">
                            {formatInlineMarkdown(line)}
                          </div>
                        );
                      })}
                    </div>
                                            <p className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-ocean-100' : 'text-gray-500'
                        }`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-bl-md p-3">
                    <div className="flex items-center space-x-1">
                      <Loader2 className="w-4 h-4" />
                      <span className="text-sm">AI is typing...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 border-gray-300 focus:border-ocean-500 focus:ring-ocean-500"
                  disabled={isTyping}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  size="sm"
                  className="bg-ocean-600 hover:bg-ocean-700 text-white px-3"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Ask me anything about career advice, resume tips, or job search strategies!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
