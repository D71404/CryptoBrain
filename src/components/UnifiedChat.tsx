
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Send, User, Bot, Newspaper, BarChart3, Brain, Search } from 'lucide-react';

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
    color: 'bg-orange-600',
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
    color: 'bg-amber-600',
    examples: [
      "Show Bitcoin price chart",
      "What's the market cap of Ethereum?",
      "Compare top 10 cryptocurrencies",
      "Show trading volume for today"
    ]
  },
  knowledge: {
    icon: Brain,
    title: 'Knowledge',
    color: 'bg-yellow-600',
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
    color: 'bg-orange-700',
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
  const [currentQuestion, setCurrentQuestion] = useState('');
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

  const handleSendMessage = async () => {
    if (!currentQuestion.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question",
        variant: "destructive",
      });
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: currentQuestion,
      isUser: true,
      timestamp: new Date(),
      section: activeSection,
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentQuestion('');
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleExampleClick = (example: string) => {
    setCurrentQuestion(example);
  };

  const activeSectionConfig = SECTION_CONFIG[activeSection];

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] space-y-4 max-w-4xl mx-auto">
      {/* Header with Section Navigation */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
          CryptoHub Chat
        </h1>
        
        {/* Section Navigation Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.entries(SECTION_CONFIG).map(([key, config]) => {
            const IconComponent = config.icon;
            const isActive = activeSection === key;
            
            return (
              <Button
                key={key}
                variant={isActive ? "default" : "outline"}
                className={`${isActive ? config.color : 'border-orange-500/20 text-orange-300 hover:bg-orange-500/10'} transition-all duration-300`}
                onClick={() => setActiveSection(key as keyof typeof SECTION_CONFIG)}
              >
                <IconComponent className="w-4 h-4 mr-2" />
                {config.title}
              </Button>
            );
          })}
        </div>
      </div>
      
      {/* Chat Messages Area */}
      <Card className="crypto-card flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <activeSectionConfig.icon className="w-5 h-5" />
            {activeSectionConfig.title} Chat
          </CardTitle>
          <CardDescription className="text-orange-300">
            Ask questions about {activeSectionConfig.title.toLowerCase()} and get AI-powered responses
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-orange-300/70 py-8">
                  <Bot className="mx-auto mb-2 h-8 w-8" />
                  <p>Start a conversation about {activeSectionConfig.title.toLowerCase()}!</p>
                </div>
              )}
              
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[80%] ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.isUser ? 'bg-orange-600' : 'bg-amber-600'
                    }`}>
                      {message.isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                    </div>
                    <div className={`rounded-lg px-4 py-2 ${
                      message.isUser 
                        ? 'bg-orange-600 text-white' 
                        : 'bg-orange-900/50 text-orange-100'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-orange-900/50 text-orange-100 rounded-lg px-4 py-2">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
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

      {/* Example Questions */}
      <Card className="crypto-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm">Example {activeSectionConfig.title} Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            {activeSectionConfig.examples.map((example, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-left justify-start border-orange-500/20 text-orange-300 hover:bg-orange-500/10 h-auto py-2 px-3"
                onClick={() => handleExampleClick(example)}
              >
                {example}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Input */}
      <Card className="crypto-card">
        <CardContent className="pt-4">
          <div className="flex gap-2">
            <Input
              placeholder={`Ask anything about ${activeSectionConfig.title.toLowerCase()}...`}
              value={currentQuestion}
              onChange={(e) => setCurrentQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-black/20 border-orange-500/20 text-white flex-1 placeholder:text-orange-300/50"
              disabled={loading}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={loading || !currentQuestion.trim()}
              className="crypto-gradient px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
