import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { User, Bot, Newspaper, BarChart3, BrainCog, Search } from 'lucide-react';
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { FirecrawlService } from '@/services/FirecrawlService';
import { GeminiService } from '@/services/GeminiService';
import { SerpApiService } from '@/services/SerpApiService';
import { MovingBorder } from '@/components/ui/moving-border';

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
    color: 'bg-orange-500',
    hoverColor: 'hover:bg-orange-600',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-400',
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
    color: 'bg-amber-500',
    hoverColor: 'hover:bg-amber-600',
    borderColor: 'border-amber-500',
    textColor: 'text-amber-400',
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
      let response: { success: boolean; error?: string; data?: any } = { success: false };
      
      switch (activeSection) {
        case 'news':
          response = await FirecrawlService.searchNews(message);
          break;
        case 'stats':
          response = await FirecrawlService.searchStats(message);
          break;
        case 'knowledge':
          response = await GeminiService.askQuestion(message);
          break;
        case 'smart-search':
          response = await SerpApiService.search(message);
          break;
      }

      if (response.success) {
        let botContent = '';
        
        if (activeSection === 'knowledge') {
          botContent = response.data || 'No response generated';
        } else if (activeSection === 'news') {
          const articles = response.data?.slice(0, 5) || [];
          botContent = articles.length > 0 
            ? `Found ${articles.length} recent crypto news articles:\n\n${articles.map((article: any, i: number) => 
                `${i + 1}. ${article.title}\n${article.description}\nSource: ${article.url}\n`
              ).join('\n')}`
            : 'No news articles found for your query.';
        } else if (activeSection === 'stats') {
          const stats = response.data || [];
          botContent = stats.length > 0
            ? `Found crypto market data:\n\n${stats.map((stat: any, i: number) => 
                `${i + 1}. ${stat.coinName}\nSource: ${stat.url}\n`
              ).join('\n')}`
            : 'No crypto stats found for your query.';
        } else if (activeSection === 'smart-search') {
          const results = response.data?.slice(0, 5) || [];
          botContent = results.length > 0
            ? `Found ${results.length} crypto-related search results:\n\n${results.map((result: any, i: number) => 
                `${i + 1}. ${result.title}\n${result.snippet}\nSource: ${result.link}\n`
              ).join('\n')}`
            : 'No search results found for your query.';
        }

        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: botContent,
          isUser: false,
          timestamp: new Date(),
          section: activeSection,
        };
        
        setMessages(prev => [...prev, botMessage]);
      } else {
        // Check if API key is missing
        const sectionConfig = SECTION_CONFIG[activeSection];
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `${sectionConfig.title} service is not configured. Please set up your API key in the ${sectionConfig.title} tab to use this feature.`,
          isUser: false,
          timestamp: new Date(),
          section: activeSection,
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      const sectionConfig = SECTION_CONFIG[activeSection];
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `Error occurred while processing your ${sectionConfig.title.toLowerCase()} request. Please try again.`,
        isUser: false,
        timestamp: new Date(),
        section: activeSection,
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    handleSendMessage(example);
  };

  const activeSectionConfig = SECTION_CONFIG[activeSection];

  return (
    <div className="flex flex-col h-[50vh] space-y-1 max-w-2xl mx-auto px-2">
      {/* Smaller Header */}
      <div className="text-center space-y-0.5 py-0.5">
        <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 via-orange-500 to-amber-400 bg-clip-text text-transparent">
          CryptoHub AI
        </h1>
        <p className="text-gray-300 text-xs">Your intelligent crypto companion</p>
      </div>
      
      {/* Chat Box with Moving Border */}
      <div className="flex-1 relative">
        <MovingBorder
          borderRadius="1.5rem"
          containerClassName="w-full h-full"
          borderClassName="h-16 w-16 opacity-[0.6] bg-[radial-gradient(var(--orange-500)_30%,var(--amber-500)_70%,transparent_90%)]"
          duration={3000}
        >
          <Card className="w-full h-full bg-gray-900/70 backdrop-blur-sm border-none">
            <CardHeader className="pb-1 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <activeSectionConfig.icon className={`w-3 h-3 ${activeSectionConfig.textColor}`} />
                  <div>
                    <CardTitle className="text-white text-sm">
                      {activeSectionConfig.title} Assistant
                    </CardTitle>
                    <CardDescription className="text-gray-400 text-xs">
                      AI-powered {activeSectionConfig.title.toLowerCase()} insights
                    </CardDescription>
                  </div>
                </div>
                
                {/* Section Navigation Buttons */}
                <div className="flex gap-0.5">
                  {Object.entries(SECTION_CONFIG).map(([key, config]) => {
                    const IconComponent = config.icon;
                    const isActive = activeSection === key;
                    
                    return (
                      <Button
                        key={key}
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        className={`h-6 w-6 p-0 ${isActive 
                          ? `${config.color} ${config.hoverColor} text-white` 
                          : `border-gray-600 text-gray-300 hover:bg-gray-700 hover:${config.textColor.replace('text-', 'border-')}`
                        } transition-all duration-300`}
                        onClick={() => setActiveSection(key as keyof typeof SECTION_CONFIG)}
                      >
                        <IconComponent className="w-2.5 h-2.5" />
                      </Button>
                    );
                  })}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-2">
              <ScrollArea className="flex-1 pr-2">
                <div className="space-y-2">
                  {messages.length === 0 && (
                    <div className="text-center py-2">
                      <div className="mb-2">
                        <activeSectionConfig.icon className={`mx-auto mb-1 h-6 w-6 ${activeSectionConfig.textColor}`} />
                        <p className="text-gray-300 text-xs mb-1">
                          Welcome to {activeSectionConfig.title} Assistant
                        </p>
                        <p className="text-gray-500 text-xs">
                          Ask questions about {activeSectionConfig.title.toLowerCase()} to get started
                        </p>
                      </div>
                      
                      {/* Compact Example Questions */}
                      <div className="grid gap-1 max-w-2xl mx-auto">
                        <h3 className="text-xs font-semibold text-gray-300 mb-1 flex items-center justify-center gap-1">
                          <span className="text-sm">💡</span>
                          Try these example questions:
                        </h3>
                        <div className="grid md:grid-cols-2 gap-1">
                          {activeSectionConfig.examples.map((example, index) => (
                            <button
                              key={index}
                              onClick={() => handleExampleClick(example)}
                              className={`group relative text-left p-2 rounded-md border transition-all duration-300 
                                bg-gradient-to-br from-gray-800/80 to-gray-900/80 
                                hover:from-gray-700/80 hover:to-gray-800/80
                                ${activeSectionConfig.borderColor}/30 hover:${activeSectionConfig.borderColor}/60
                                hover:scale-[1.01] hover:shadow-md
                                backdrop-blur-sm`}
                            >
                              <div className="flex items-start gap-1">
                                <div className={`flex-shrink-0 w-4 h-4 rounded ${activeSectionConfig.color}/20 
                                  border ${activeSectionConfig.borderColor}/40 flex items-center justify-center
                                  group-hover:${activeSectionConfig.color}/30 group-hover:scale-110 transition-all duration-300`}>
                                  <activeSectionConfig.icon className={`w-2 h-2 ${activeSectionConfig.textColor} group-hover:scale-110 transition-transform`} />
                                </div>
                                <div className="flex-1">
                                  <p className="text-gray-200 group-hover:text-white font-medium leading-relaxed transition-colors text-xs">
                                    {example}
                                  </p>
                                  <div className={`mt-0.5 text-xs ${activeSectionConfig.textColor} opacity-70 group-hover:opacity-100 transition-opacity`}>
                                    Click to try →
                                  </div>
                                </div>
                              </div>
                              <div className={`absolute inset-0 rounded-md bg-gradient-to-r ${activeSectionConfig.color}/5 
                                opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
                            </button>
                          ))}
                        </div>
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
                            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
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
        </MovingBorder>
      </div>

      {/* Enhanced Prompt Input Box */}
      <div className="w-full mx-auto">
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
