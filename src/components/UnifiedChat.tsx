
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Bot, TrendingUp, Calendar } from 'lucide-react';
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import ClassicLoader from "@/components/ui/loader";

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  tab?: 'insights' | 'alpha-calendar';
  filter?: string;
}

const TAB_CONFIG = {
  insights: {
    icon: TrendingUp,
    title: 'Insights',
    subtitle: 'News, Knowledge, Stats',
    webhook: 'https://n8n.srv904629.hstgr.cloud/webhook/8a8dcc89-9452-4e89-a5c6-9e10e73dab43',
    examples: ["What's the latest Bitcoin news?", "Explain DeFi mechanisms", "Show me Ethereum price stats", "Recent crypto market analysis"]
  },
  'alpha-calendar': {
    icon: Calendar,
    title: 'Alpha Calendar',
    subtitle: 'Upcoming crypto events',
    webhook: 'https://n8n.srv904629.hstgr.cloud/webhook/4cf02cac-1783-4183-9969-1871f10a97ae',
    examples: ["Upcoming Bitcoin conferences", "Show me ETF events", "Any fork announcements?", "Token listings this week"]
  }
};


const EVENT_TYPES = [
  'Conference',
  'Burn',
  'ETF',
  'Fork',
  'Listings'
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
      const payload = {
        message: messageData.message,
        tab: activeTab,
        filter: activeTab === 'alpha-calendar' ? calendarFilter : undefined,
        timestamp: messageData.timestamp,
        files: messageData.files?.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type
        })) || []
      };

      console.log('Sending to webhook:', payload);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
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
        console.log('Webhook response data:', webhookResponse.data);
        
        if (!webhookResponse.data || webhookResponse.data.trim() === '') {
          botContent = 'The service responded but returned no data. The webhook may need to be configured to return results.';
        } else {
          try {
            const parsedResponse = JSON.parse(webhookResponse.data);
            botContent = parsedResponse.output || parsedResponse.message || parsedResponse.result || 'Webhook responded but without expected output format.';
          } catch (parseError) {
            // If it's not JSON, treat as plain text
            botContent = webhookResponse.data;
          }
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
    <div className="flex flex-col h-[75vh] sm:h-[70vh] space-y-3 sm:space-y-4 max-w-4xl mx-auto px-2 sm:px-4 w-full">
      {/* Header */}
      <div className="text-center space-y-1 sm:space-y-2 py-1 sm:py-2">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 via-orange-500 to-amber-400 bg-clip-text text-white">
          CryptoHub AI
        </h1>
        <p className="text-gray-300 text-xs sm:text-sm">Your intelligent crypto companion</p>
      </div>

      {/* Modern Tabs */}
      <Tabs value={activeTab} onValueChange={value => setActiveTab(value as keyof typeof TAB_CONFIG)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 border border-gray-700 h-auto">
          {Object.entries(TAB_CONFIG).map(([key, config]) => {
            const IconComponent = config.icon;
            return (
              <TabsTrigger 
                key={key} 
                value={key} 
                className="flex flex-col items-center gap-1 p-2 sm:p-3 text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-700 min-h-[50px] sm:min-h-[60px] text-center"
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <IconComponent className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <div className="font-medium text-xs sm:text-sm">{config.title}</div>
                </div>
                <div className="text-xs opacity-70 leading-tight hidden sm:block">{config.subtitle}</div>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.entries(TAB_CONFIG).map(([key, config]) => (
          <TabsContent key={key} value={key} className="mt-4">
            <Card className="flex-1 flex flex-col bg-gray-900/50 backdrop-blur-sm border-gray-700 w-full h-full">
              <CardHeader className="pb-2 sm:pb-3 border-b border-gray-700 px-3 sm:px-6 py-3 sm:py-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <config.icon className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 flex-shrink-0" />
                    <div>
                      <CardTitle className="text-white text-base sm:text-lg">{config.title}</CardTitle>
                      <CardDescription className="text-gray-400 text-xs sm:text-sm">
                        {config.subtitle}
                      </CardDescription>
                    </div>
                  </div>
                  
                  {/* Alpha Calendar Event Types */}
                  {key === 'alpha-calendar' && (
                    <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
                      <div className="text-xs sm:text-sm font-semibold text-orange-400">Event Types</div>
                      <div className="flex flex-wrap gap-1 justify-start sm:justify-end">
                        {EVENT_TYPES.map(type => (
                          <span key={type} className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded text-xs">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-2 sm:p-4 min-h-0">
                <ScrollArea className="flex-1 pr-1 sm:pr-2 mb-3 sm:mb-4">
                  <div className="space-y-2 sm:space-y-3 px-1">
                    {messages.filter(msg => msg.tab === key).map(message => (
                      <div key={message.id} className={`flex w-full ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%] ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-lg ${message.isUser ? 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-orange-500/25' : 'bg-gradient-to-br from-gray-600 to-gray-800 shadow-gray-500/25'}`}>
                            {message.isUser ? <User className="w-3 h-3 sm:w-4 sm:h-4 text-white drop-shadow-sm" /> : <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white drop-shadow-sm" />}
                          </div>
                          <div className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-3 ${message.isUser ? 'bg-blue-600 text-white max-w-full' : 'bg-gray-800 text-gray-100 border border-gray-700 max-w-full'}`}>
                            <div className="text-xs sm:text-sm leading-relaxed">
                              {message.isUser ? (
                                <div className="whitespace-pre-wrap break-words">{message.content}</div>
                              ) : (
                                <div className="space-y-2">
                                  {message.content.replace(/\*\*/g, '') // Remove bold markers
                                    .replace(/\*/g, '') // Remove asterisks
                                    .split('\n').map((line, index) => {
                                      // Check if line contains links
                                      const linkRegex = /(https?:\/\/[^\s]+)/g;
                                      if (linkRegex.test(line)) {
                                        const parts = line.split(linkRegex);
                                        return (
                                          <div key={index} className="break-words">
                                            {parts.map((part, partIndex) => {
                                              if (linkRegex.test(part)) {
                                                return (
                                                  <a 
                                                    key={partIndex} 
                                                    href={part} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="text-orange-400 hover:text-orange-300 underline break-all inline-block"
                                                  >
                                                    {part}
                                                  </a>
                                                );
                                              }
                                              return <span key={partIndex} className="break-words">{part}</span>;
                                            })}
                                          </div>
                                        );
                                      }
                                      return line ? <div key={index} className="break-words">{line}</div> : <div key={index} className="h-2" />;
                                    })}
                                </div>
                              )}
                            </div>
                            <div className="text-xs opacity-60 mt-2 flex flex-wrap items-center gap-2">
                              <span>{message.timestamp.toLocaleTimeString()}</span>
                              {message.filter && message.filter !== 'all' && (
                                <span className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded text-xs">
                                  {message.filter}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {loading && activeTab === key && (
                      <div className="flex gap-2 sm:gap-4 justify-start">
                        <div className="flex gap-2 sm:gap-4">
                          <div className="flex-shrink-0 w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-gray-700 flex items-center justify-center">
                            <Bot className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                          </div>
                          <div className="bg-gray-800 border border-gray-700 rounded-2xl px-3 py-2 sm:px-4 sm:py-3">
                            <div className="flex items-center gap-3">
                              <ClassicLoader />
                              <span className="text-gray-300 text-xs sm:text-sm">Loading...</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                {/* Prompt Input Box moved inside card */}
                <div className="pt-2 sm:pt-3 border-t border-gray-700">
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
