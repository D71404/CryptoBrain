
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GeminiService } from '@/services/GeminiService';
import { useToast } from "@/hooks/use-toast";
import { Send, User, Bot } from 'lucide-react';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export const KnowledgeTab = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const savedKey = GeminiService.getApiKey();
    if (savedKey) {
      setHasApiKey(true);
    }
  }, []);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }

    const isValid = await GeminiService.testApiKey(apiKey);
    if (isValid) {
      GeminiService.saveApiKey(apiKey);
      setHasApiKey(true);
      setApiKey('');
      toast({
        title: "Success",
        description: "Gemini API key saved successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Invalid API key. Please check and try again.",
        variant: "destructive",
      });
    }
  };

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
    };

    setMessages(prev => [...prev, userMessage]);
    const questionToAsk = currentQuestion;
    setCurrentQuestion('');
    setLoading(true);

    try {
      const result = await GeminiService.askQuestion(questionToAsk);
      
      if (result.success && result.data) {
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: result.data,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to get answer",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error asking question:', error);
      toast({
        title: "Error",
        description: "Failed to get answer",
        variant: "destructive",
      });
    } finally {
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

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setHasApiKey(true);
    }
  }, []);

  if (!hasApiKey) {
    return (
      <Card className="crypto-card">
        <CardHeader>
          <CardTitle className="text-white">Setup Google Gemini API</CardTitle>
          <CardDescription className="text-slate-300">
            Enter your Google Gemini API key to start asking crypto questions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="password"
            placeholder="Enter your Gemini API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="bg-black/20 border-white/20 text-white"
          />
          <Button onClick={handleSaveApiKey} className="w-full crypto-gradient">
            Save API Key
          </Button>
          <p className="text-sm text-slate-400">
            Get your API key from{' '}
            <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              Google AI Studio
            </a>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] space-y-4">
      <h2 className="text-2xl font-bold text-white">Crypto Knowledge Assistant</h2>
      
      {/* Chat Messages Area */}
      <Card className="crypto-card flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg">Chat</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-slate-400 py-8">
                  <Bot className="mx-auto mb-2 h-8 w-8" />
                  <p>Start a conversation by asking about cryptocurrency, blockchain, or DeFi!</p>
                </div>
              )}
              
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[80%] ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.isUser ? 'bg-blue-600' : 'bg-slate-600'
                    }`}>
                      {message.isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                    </div>
                    <div className={`rounded-lg px-4 py-2 ${
                      message.isUser 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-700 text-slate-200'
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
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-slate-700 text-slate-200 rounded-lg px-4 py-2">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
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
          <CardTitle className="text-white text-sm">Example Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            {[
              "What is DeFi and how does it work?",
              "Explain Bitcoin's consensus mechanism",
              "What are the risks of yield farming?",
              "How do smart contracts work on Ethereum?",
            ].map((example, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-left justify-start border-white/20 text-slate-300 hover:bg-white/10 h-auto py-2 px-3"
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
              placeholder="Ask anything about cryptocurrency, blockchain, DeFi, or trading..."
              value={currentQuestion}
              onChange={(e) => setCurrentQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-black/20 border-white/20 text-white flex-1"
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
