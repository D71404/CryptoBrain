import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, TrendingUp, Calendar, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  tabId: TabKey;
}

type TabKey = 'smart-search' | 'trending-news' | 'alpha-calendar';

interface TabConfig {
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  examples: string[];
  webhook: string;
}

const TAB_CONFIG: { [key in TabKey]: TabConfig } = {
  'smart-search': {
    title: 'Smart Search',
    subtitle: 'Get AI-powered answers to any crypto question.',
    icon: Search,
    examples: [
      'What are the top 5 cryptocurrencies by market cap?',
      'Explain blockchain technology in simple terms.',
      'What is the future of DeFi?',
    ],
    webhook: 'https://example.com/smart-search-webhook',
  },
  'trending-news': {
    title: 'Trending News',
    subtitle: 'Discover the latest and hottest news in the crypto space.',
    icon: TrendingUp,
    examples: [
      'What are the latest developments in Ethereum?',
      'Any news about Bitcoin halving?',
      'What are the current trends in NFT market?',
    ],
    webhook: 'https://example.com/trending-news-webhook',
  },
  'alpha-calendar': {
    title: 'Alpha Calendar',
    subtitle: 'Stay updated with upcoming crypto events and announcements.',
    icon: Calendar,
    examples: [
      'What are the upcoming conferences in the crypto space?',
      'Any major token airdrops scheduled?',
      'What are the key dates for Bitcoin?',
    ],
    webhook: 'https://example.com/alpha-calendar-webhook',
  },
};

export const UnifiedChat: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('smart-search');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom()
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date(),
      tabId: activeTab
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const config = TAB_CONFIG[activeTab];
      const response = await fetch(config.webhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          tab: activeTab,
          timestamp: userMessage.timestamp.toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.text();
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data || 'Response received',
        sender: 'assistant',
        timestamp: new Date(),
        tabId: activeTab
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, there was an error processing your request. Please try again.',
        sender: 'assistant',
        timestamp: new Date(),
        tabId: activeTab
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleExampleClick = (example: string) => {
    setMessage(example);
  };

  const currentMessages = messages.filter(msg => msg.tabId === activeTab);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-[#0a0613] via-[#271a0d] to-[#0a0613] text-white">
      {/* Mobile-friendly tab navigation */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 p-2 min-w-max sm:min-w-0 sm:justify-center">
            {Object.entries(TAB_CONFIG).map(([key, config]) => {
              const Icon = config.icon;
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as TabKey)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 whitespace-nowrap text-sm sm:text-base ${
                    isActive
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                  }`}
                >
                  <Icon size={16} className="sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{config.title}</span>
                  <span className="sm:hidden">{config.title.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        {currentMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="crypto-card rounded-xl p-4 sm:p-6 max-w-md w-full">
              <h3 className="text-lg sm:text-xl font-semibold text-orange-400 mb-2 sm:mb-3">
                {TAB_CONFIG[activeTab].title}
              </h3>
              <p className="text-white/60 mb-4 sm:mb-6 text-sm sm:text-base">
                {TAB_CONFIG[activeTab].subtitle}
              </p>

              {/* Alpha Calendar Event Types - Mobile optimized */}
              {activeTab === 'alpha-calendar' && (
                <div className="mb-4 sm:mb-6">
                  <h4 className="text-base sm:text-lg font-bold text-orange-400 mb-3 sm:mb-4">
                    Event Types
                  </h4>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
                    {['Conferences', 'ETF Events', 'Fork Announcements', 'Token Listings', 'Airdrops', 'Staking Events'].map((type) => (
                      <Badge 
                        key={type} 
                        variant="outline" 
                        className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10 text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1"
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-left">
                <p className="text-white/50 mb-2 sm:mb-3 text-xs sm:text-sm">Try asking:</p>
                <div className="space-y-1.5 sm:space-y-2">
                  {TAB_CONFIG[activeTab].examples.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleClick(example)}
                      className="block w-full text-left px-3 py-2 sm:px-4 sm:py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-xs sm:text-sm text-white/70 hover:text-white"
                    >
                      "{example}"
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {currentMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-xs md:max-w-sm lg:max-w-md rounded-lg px-3 py-2 sm:px-4 sm:py-3 ${
                    msg.sender === 'user'
                      ? 'bg-orange-500 text-white'
                      : 'crypto-card text-white'
                  }`}
                >
                  <p className="text-sm sm:text-base whitespace-pre-wrap break-words">{msg.content}</p>
                  <p className={`text-xs mt-1 sm:mt-2 ${
                    msg.sender === 'user' ? 'text-orange-100' : 'text-white/50'
                  }`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="crypto-card rounded-lg px-3 py-2 sm:px-4 sm:py-3 max-w-xs">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-orange-500"></div>
                    <p className="text-white/70 text-sm sm:text-base">Thinking...</p>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Mobile-optimized input area */}
      <div className="border-t border-white/10 bg-black/20 backdrop-blur-sm p-3 sm:p-4">
        <div className="flex gap-2 sm:gap-3 items-end">
          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask about ${TAB_CONFIG[activeTab].title.toLowerCase()}...`}
              className="w-full bg-white/5 border-white/20 text-white placeholder-white/50 rounded-lg pr-3 py-2 sm:py-3 text-sm sm:text-base min-h-[40px] sm:min-h-[44px] focus:border-orange-500/50"
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || isLoading}
            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg min-h-[40px] sm:min-h-[44px] min-w-[40px] sm:min-w-[44px] flex items-center justify-center"
          >
            <Send size={16} className="sm:w-4 sm:h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
