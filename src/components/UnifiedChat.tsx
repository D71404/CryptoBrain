import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Bot, TrendingUp, Twitter, Calendar, Filter } from 'lucide-react';
import { PromptInputBox } from "@/components/ui/ai-prompt-box";

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  tab?: 'insights' | 'social-pulse' | 'alpha-calendar';
  filter?: string;
}

const TAB_CONFIG = {
  insights: {
    icon: TrendingUp,
    title: 'Insights',
    subtitle: 'News, Knowledge, Stats',
    webhook: 'https://shanzacass.app.n8n.cloud/webhook-test/8a8dcc89-9452-4e89-a5c6-9e10e73dab43',
    examples: ["What's the latest Bitcoin news?", "Explain DeFi mechanisms", "Show me Ethereum price stats", "Recent crypto market analysis"]
  },
  'social-pulse': {
    icon: Twitter,
    title: 'Social Pulse',
    subtitle: 'Top crypto tweets',
    webhook: '', // Will be provided by user
    examples: ["Top Bitcoin tweets today", "What's trending in crypto Twitter?", "Show viral crypto content", "Latest crypto influencer takes"]
  },
  'alpha-calendar': {
    icon: Calendar,
    title: 'Alpha Calendar',
    subtitle: 'Upcoming crypto events',
    webhook: '', // Will be provided by user
    examples: ["Upcoming Bitcoin conferences", "Show me ETF events", "Any fork announcements?", "Token listings this week"]
  }
};

const CALENDAR_FILTERS = [
  { value: 'all', label: 'All Events' },
  { value: 'conference', label: 'Conference' },
  { value: 'burn', label: 'Burn' },
  { value: 'etf', label: 'ETF' },
  { value: 'fork', label: 'Fork' },
  { value: 'listings', label: 'Listings' }
];

export const UnifiedChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<keyof typeof TAB_CONFIG>('insights');
  const [calendarFilter, setCalendarFilter] = useState('all');
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendToWebhook = async (messageData: any) => {
    const tabConfig = TAB_CONFIG[activeTab];
    const webhookUrl = tabConfig.webhook;

    if (!webhookUrl) {
      throw new Error(`Webhook not configured for ${tabConfig.title}`);
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: messageData.message,
          tab: activeTab,
          filter: activeTab === 'alpha-calendar' ? calendarFilter : undefined,
          timestamp: messageData.timestamp,
          files: messageData.files?.map(file => ({
            name: file.name,
            size: file.size,
            type: file.type
          })) || []
        })
      });

      if (response.ok) {
        console.log('Message sent to webhook successfully');
        const responseData = await response.text();
        return {
          success: true,
          data: responseData
        };
      } else {
        console.error('Failed to send message to webhook:', response.status);
        return {
          success: false,
          error: `Webhook returned status ${response.status}`
        };
      }
    } catch (error) {
      console.error('Error sending message to webhook:', error);
      return {
        success: false,
        error: 'Failed to connect to webhook'
      };
    }
  };

  const handleSendMessage = async (message: string, files?: File[]) => {
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question",
        variant: "destructive"
      });
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      isUser: true,
      timestamp: new Date(),
      tab: activeTab,
      filter: activeTab === 'alpha-calendar' ? calendarFilter : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const webhookResponse = await sendToWebhook({
        message: message,
        timestamp: new Date().toISOString(),
        files: files || []
      });

      let botContent = '';
      if (webhookResponse.success) {
        try {
          const parsedResponse = JSON.parse(webhookResponse.data);
          botContent = parsedResponse.output || 'Webhook responded successfully but with no output content.';
        } catch (parseError) {
          botContent = webhookResponse.data || 'Webhook responded successfully but with no content.';
        }
      } else {
        const tabConfig = TAB_CONFIG[activeTab];
        botContent = `${tabConfig.title} service is not available. ${webhookResponse.error}`;
      }

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: botContent,
        isUser: false,
        timestamp: new Date(),
        tab: activeTab,
        filter: activeTab === 'alpha-calendar' ? calendarFilter : undefined
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `Error occurred while processing your request. Please try again.`,
        isUser: false,
        timestamp: new Date(),
        tab: activeTab
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    handleSendMessage(example);
  };

  const activeTabConfig = TAB_CONFIG[activeTab];

  return (
    <div className="flex flex-col h-[70vh] space-y-4 max-w-4xl mx-auto px-4">
      {/* Header */}
      <div className="text-center space-y-2 py-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-orange-500 to-amber-400 bg-clip-text text-transparent">
          CryptoHub AI
        </h1>
        <p className="text-gray-300 text-sm">Your intelligent crypto companion</p>
      </div>
      
      {/* Modern Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as keyof typeof TAB_CONFIG)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 border border-gray-700 h-auto">
          {Object.entries(TAB_CONFIG).map(([key, config]) => {
            const IconComponent = config.icon;
            return (
              <TabsTrigger 
                key={key} 
                value={key}
                className="flex flex-col items-center gap-1 p-3 text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-700 min-h-[60px] text-center"
              >
                <div className="flex items-center gap-2">
                  <IconComponent className="w-4 h-4 flex-shrink-0" />
                  <div className="font-medium text-sm">{config.title}</div>
                </div>
                <div className="text-xs opacity-70 leading-tight">{config.subtitle}</div>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.entries(TAB_CONFIG).map(([key, config]) => (
          <TabsContent key={key} value={key} className="mt-4">
            <Card className="flex-1 flex flex-col bg-gray-900/50 backdrop-blur-sm border-gray-700 w-full h-[55vh]">
              <CardHeader className="pb-3 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <config.icon className="w-5 h-5 text-orange-400" />
                    <div>
                      <CardTitle className="text-white text-lg">{config.title}</CardTitle>
                      <CardDescription className="text-gray-400 text-sm">
                        {config.subtitle}
                      </CardDescription>
                    </div>
                  </div>
                  
                  {/* Alpha Calendar Filter */}
                  {key === 'alpha-calendar' && (
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-400" />
                      <Select value={calendarFilter} onValueChange={setCalendarFilter}>
                        <SelectTrigger className="w-32 bg-gray-800 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {CALENDAR_FILTERS.map((filter) => (
                            <SelectItem key={filter.value} value={filter.value} className="text-white hover:bg-gray-700">
                              {filter.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-4 space-y-4">
                <ScrollArea className="flex-1 pr-3">
                  <div className="space-y-4">
                    {messages.filter(msg => msg.tab === key).map(message => (
                      <div key={message.id} className={`flex gap-4 ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-4 max-w-[80%] ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                            message.isUser ? 'bg-blue-600' : 'bg-gray-700'
                          }`}>
                            {message.isUser ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                          </div>
                          <div className={`rounded-2xl px-4 py-3 max-w-full ${
                            message.isUser 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-800 text-gray-100 border border-gray-700'
                          }`}>
                            <div className="text-sm leading-relaxed break-words overflow-wrap-anywhere">
                              {message.isUser ? (
                                <p className="whitespace-pre-wrap">{message.content}</p>
                              ) : (
                                <div className="prose prose-sm prose-invert max-w-none">
                                  {message.content.split('\n').map((line, index) => {
                                    // Check if line contains links
                                    const linkRegex = /(https?:\/\/[^\s]+)/g;
                                    if (linkRegex.test(line)) {
                                      const parts = line.split(linkRegex);
                                      return (
                                        <p key={index} className="mb-2 last:mb-0">
                                          {parts.map((part, partIndex) => {
                                            if (linkRegex.test(part)) {
                                              return (
                                                <a
                                                  key={partIndex}
                                                  href={part}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-orange-400 hover:text-orange-300 underline break-all"
                                                >
                                                  {part}
                                                </a>
                                              );
                                            }
                                            return part;
                                          })}
                                        </p>
                                      );
                                    }
                                    return line ? <p key={index} className="mb-2 last:mb-0">{line}</p> : <br key={index} />;
                                  })}
                                </div>
                              )}
                            </div>
                            <p className="text-xs opacity-60 mt-2">
                              {message.timestamp.toLocaleTimeString()}
                              {message.filter && message.filter !== 'all' && (
                                <span className="ml-2 px-1 py-0.5 bg-orange-500/20 text-orange-300 rounded text-xs">
                                  {message.filter}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {loading && activeTab === key && (
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
                
                {/* Prompt Input Box moved inside card */}
                <div className="pt-2 border-t border-gray-700">
                  <PromptInputBox 
                    onSend={handleSendMessage} 
                    isLoading={loading} 
                    placeholder={`Ask about ${activeTabConfig.title.toLowerCase()}...`} 
                    activeSection="knowledge"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

    </div>
  );
};
