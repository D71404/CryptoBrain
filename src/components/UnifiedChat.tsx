
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { User, Bot, Newspaper, BarChart3, BrainCog, Search } from 'lucide-react';
import { PromptInputBox } from "@/components/ui/ai-prompt-box";

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  section?: 'news' | 'stats' | 'knowledge' | 'smart-search';
}

const SECTION_CONFIG = {
  news: {
    icon: Newspaper,
    title: 'News',
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-400',
    examples: [
      "What's the latest Bitcoin news?",
      "Show me recent Ethereum updates",
      "Any news about DeFi protocols?",
      "Latest crypto market headlines"
    ]
  },
  stats: {
    icon: BarChart3,
    title: 'Stats',
    color: 'bg-green-500',
    hoverColor: 'hover:bg-green-600',
    borderColor: 'border-green-500',
    textColor: 'text-green-400',
    examples: [
      "Show Bitcoin price chart",
      "What's the market cap of Ethereum?",
      "Compare top 10 cryptocurrencies",
      "Show trading volume for today"
    ]
  },
  knowledge: {
    icon: BrainCog,
    title: 'Knowledge',
    color: 'bg-purple-500',
    hoverColor: 'hover:bg-purple-600',
    borderColor: 'border-purple-500',
    textColor: 'text-purple-400',
    examples: [
      "What is DeFi and how does it work?",
      "Explain Bitcoin's consensus mechanism",
      "What are the risks of yield farming?",
      "How do smart contracts work on Ethereum?"
    ]
  },
  'smart-search': {
    icon: Search,
    title: 'Smart Search',
    color: 'bg-orange-500',
    hoverColor: 'hover:bg-orange-600',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-400',
    examples: [
      "Search for Uniswap documentation",
      "Find information about Solana staking",
      "Look up Chainlink price feeds",
      "Search for NFT marketplace guides"
    ]
  }
};

export const UnifiedChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<keyof typeof SECTION_CONFIG>('knowledge');
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message: string, files?: File[]) => {
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question",
        variant: "destructive",
      });
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      isUser: true,
      timestamp: new Date(),
      section: activeSection,
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      setTimeout(() => {
        const sectionConfig = SECTION_CONFIG[activeSection];
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `This is a ${sectionConfig.title} response. Once the APIs are integrated, this will provide real ${sectionConfig.title.toLowerCase()} information about your query: "${userMessage.content}"`,
          isUser: false,
          timestamp: new Date(),
          section: activeSection,
        };
        setMessages(prev => [...prev, botMessage]);
        setLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Error asking question:', error);
      toast({
        title: "Error",
        description: "Failed to get answer",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    handleSendMessage(example);
  };

  const activeSectionConfig = SECTION_CONFIG[activeSection];

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-orange-400 bg-clip-text text-transparent">
          CryptoHub AI
        </h1>
        <p className="text-gray-300 text-lg">Your intelligent crypto companion</p>
      </div>
      
      {/* Chat Messages Area */}
      <Card className="flex-1 flex flex-col bg-gray-900/50 backdrop-blur-sm border-gray-700">
        <CardHeader className="pb-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <activeSectionConfig.icon className={`w-6 h-6 ${activeSectionConfig.textColor}`} />
              <div>
                <CardTitle className="text-white text-xl">
                  {activeSectionConfig.title} Assistant
                </CardTitle>
                <CardDescription className="text-gray-400">
                  AI-powered {activeSectionConfig.title.toLowerCase()} insights
                </CardDescription>
              </div>
            </div>
            
            {/* Section Navigation Buttons */}
            <div className="flex gap-2">
              {Object.entries(SECTION_CONFIG).map(([key, config]) => {
                const IconComponent = config.icon;
                const isActive = activeSection === key;
                
                return (
                  <Button
                    key={key}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className={`${isActive 
                      ? `${config.color} ${config.hoverColor} text-white` 
                      : `border-gray-600 text-gray-300 hover:bg-gray-700 hover:${config.textColor.replace('text-', 'border-')}`
                    } transition-all duration-300`}
                    onClick={() => setActiveSection(key as keyof typeof SECTION_CONFIG)}
                  >
                    <IconComponent className="w-4 h-4" />
                  </Button>
                );
              })}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-6">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <div className="mb-6">
                    <activeSectionConfig.icon className={`mx-auto mb-4 h-12 w-12 ${activeSectionConfig.textColor}`} />
                    <p className="text-gray-300 text-lg mb-2">
                      Welcome to {activeSectionConfig.title} Assistant
                    </p>
                    <p className="text-gray-500">
                      Ask questions about {activeSectionConfig.title.toLowerCase()} to get started
                    </p>
                  </div>
                  
                  {/* Enhanced Example Questions */}
                  <div className="grid gap-3 max-w-2xl mx-auto">
                    <h3 className="text-sm font-medium text-gray-400 mb-3">Try these examples:</h3>
                    {activeSectionConfig.examples.map((example, index) => (
                      <button
                        key={index}
                        onClick={() => handleExampleClick(example)}
                        className={`text-left p-4 rounded-xl border ${activeSectionConfig.borderColor}/20 
                          bg-gray-800/50 hover:bg-gray-700/50 ${activeSectionConfig.textColor} 
                          hover:${activeSectionConfig.borderColor}/40 transition-all duration-200 
                          hover:scale-[1.02] group`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${activeSectionConfig.color} opacity-60 group-hover:opacity-100`} />
                          <span className="text-gray-200 group-hover:text-white">{example}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-4 max-w-[80%] ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      message.isUser ? 'bg-blue-600' : 'bg-gray-700'
                    }`}>
                      {message.isUser ? 
                        <User className="w-5 h-5 text-white" /> : 
                        <Bot className="w-5 h-5 text-white" />
                      }
                    </div>
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.isUser 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-800 text-gray-100 border border-gray-700'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-60 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex gap-4 justify-start">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Enhanced Prompt Input Box */}
      <div className="w-full">
        <PromptInputBox
          onSend={handleSendMessage}
          isLoading={loading}
          placeholder={`Ask anything about ${activeSectionConfig.title.toLowerCase()}...`}
          activeSection={activeSection}
        />
      </div>
    </div>
  );
};
