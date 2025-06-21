import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SerpApiService } from '@/services/SerpApiService';
import { useToast } from "@/hooks/use-toast";

interface SearchResult {
  title: string;
  snippet: string;
  link: string;
  source?: string;
}

export const SmartSearchTab = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    const savedKey = SerpApiService.getApiKey();
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

    const isValid = await SerpApiService.testApiKey(apiKey);
    if (isValid) {
      SerpApiService.saveApiKey(apiKey);
      setHasApiKey(true);
      setApiKey('');
      toast({
        title: "Success",
        description: "SerpAPI key saved successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Invalid API key. Please check and try again.",
        variant: "destructive",
      });
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Error",
        description: "Please enter a search query",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await SerpApiService.search(query);
      if (result.success && result.data) {
        setResults(result.data);
        toast({
          title: "Success",
          description: `Found ${result.data.length} search results`,
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to perform search",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error searching:', error);
      toast({
        title: "Error",
        description: "Failed to perform search",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!hasApiKey) {
    return (
      <Card className="crypto-card">
        <CardHeader>
          <CardTitle className="text-white">Setup SerpAPI</CardTitle>
          <CardDescription className="text-slate-300">
            Enter your SerpAPI key to enable smart search functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="password"
            placeholder="Enter your SerpAPI key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="bg-black/20 border-white/20 text-white"
          />
          <Button onClick={handleSaveApiKey} className="w-full crypto-gradient">
            Save API Key
          </Button>
          <p className="text-sm text-slate-400">
            Get your API key from{' '}
            <a href="https://serpapi.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              serpapi.com
            </a>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Smart Crypto Search</h2>
      
      <Card className="crypto-card">
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search for crypto trends, news, or analysis..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-black/20 border-white/20 text-white"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button 
              onClick={handleSearch} 
              disabled={loading || !query.trim()}
              className="crypto-gradient px-8"
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {results.map((result, index) => (
          <Card key={index} className="crypto-card hover:glow-effect transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-white text-lg leading-tight">
                  {result.title}
                </CardTitle>
                {result.source && (
                  <Badge variant="secondary" className="bg-purple-600/20 text-purple-300 ml-2">
                    {result.source}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 text-sm mb-3">{result.snippet}</p>
              <Button 
                variant="outline" 
                size="sm"
                asChild
                className="border-white/20 text-white hover:bg-white/10"
              >
                <a href={result.link} target="_blank" rel="noopener noreferrer">
                  Read Full Article
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {results.length === 0 && !loading && (
        <Card className="crypto-card">
          <CardContent className="pt-6">
            <p className="text-center text-slate-300">
              Enter a search query to find crypto-related information, trends, and analysis.
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="crypto-card">
        <CardHeader>
          <CardTitle className="text-white">Popular Searches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {[
              "Bitcoin price prediction 2024",
              "Ethereum staking rewards",
              "DeFi yield farming strategies",
              "NFT market trends",
              "Crypto regulations update",
              "Altcoin investment tips"
            ].map((example, index) => (
              <Button
                key={index}
                variant="outline"
                className="text-left justify-start border-white/20 text-slate-300 hover:bg-white/10"
                onClick={() => setQuery(example)}
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
