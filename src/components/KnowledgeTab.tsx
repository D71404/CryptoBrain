
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export const KnowledgeTab = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const { toast } = useToast();

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('gemini_api_key', apiKey);
    setHasApiKey(true);
    setApiKey('');
    toast({
      title: "Success",
      description: "Gemini API key saved successfully",
    });
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Placeholder for Gemini API integration
      // This would be replaced with actual Gemini API call
      setTimeout(() => {
        setAnswer("This is a placeholder response. Once you provide your Gemini API key and integrate the API, this will return AI-powered answers about cryptocurrency topics.");
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Crypto Knowledge Assistant</h2>
      
      <Card className="crypto-card">
        <CardHeader>
          <CardTitle className="text-white">Ask a Question</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Ask anything about cryptocurrency, blockchain, DeFi, or trading..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="bg-black/20 border-white/20 text-white min-h-[100px]"
          />
          <Button 
            onClick={handleAskQuestion} 
            disabled={loading || !question.trim()}
            className="w-full crypto-gradient"
          >
            {loading ? 'Thinking...' : 'Ask Question'}
          </Button>
        </CardContent>
      </Card>

      {answer && (
        <Card className="crypto-card">
          <CardHeader>
            <CardTitle className="text-white">Answer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-200 whitespace-pre-wrap">{answer}</p>
          </CardContent>
        </Card>
      )}

      <Card className="crypto-card">
        <CardHeader>
          <CardTitle className="text-white">Example Questions</CardTitle>
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
                className="text-left justify-start border-white/20 text-slate-300 hover:bg-white/10"
                onClick={() => setQuestion(example)}
              >
                {example}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
