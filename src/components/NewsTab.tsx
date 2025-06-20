
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FirecrawlService } from '@/services/FirecrawlService';
import { useToast } from "@/hooks/use-toast";

interface NewsItem {
  title: string;
  description: string;
  url: string;
  publishedAt?: string;
}

export const NewsTab = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedKey = FirecrawlService.getApiKey();
    console.log('Checking for saved API key:', savedKey ? 'Found' : 'Not found');
    if (savedKey) {
      setHasApiKey(true);
      fetchNews();
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

    console.log('Testing API key...');
    const isValid = await FirecrawlService.testApiKey(apiKey);
    if (isValid) {
      FirecrawlService.saveApiKey(apiKey);
      setHasApiKey(true);
      setApiKey('');
      toast({
        title: "Success",
        description: "API key saved successfully",
      });
      fetchNews();
    } else {
      toast({
        title: "Error",
        description: "Invalid API key. Please check and try again.",
        variant: "destructive",
      });
    }
  };

  const fetchNews = async () => {
    setLoading(true);
    try {
      const result = await FirecrawlService.searchNews('cryptocurrency bitcoin ethereum latest news');
      if (result.success && result.data) {
        setNews(result.data.slice(0, 10));
        toast({
          title: "Success",
          description: `Fetched ${result.data.length} news articles`,
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch news",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      toast({
        title: "Error",
        description: "Failed to fetch crypto news",
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
          <CardTitle className="text-white">Setup Firecrawl API</CardTitle>
          <CardDescription className="text-slate-300">
            Enter your Firecrawl API key to start fetching crypto news
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="password"
            placeholder="Enter your Firecrawl API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="bg-black/20 border-white/20 text-white"
          />
          <Button onClick={handleSaveApiKey} className="w-full crypto-gradient">
            Save API Key
          </Button>
          <p className="text-sm text-slate-400">
            Get your API key from{' '}
            <a href="https://firecrawl.dev" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              firecrawl.dev
            </a>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Latest Crypto News</h2>
        <Button 
          onClick={fetchNews} 
          disabled={loading}
          className="crypto-gradient"
        >
          {loading ? 'Loading...' : 'Refresh News'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {news.map((article, index) => (
          <Card key={index} className="crypto-card hover:glow-effect transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white text-sm leading-tight line-clamp-2">
                {article.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 text-xs mb-3 line-clamp-3">
                {article.description}
              </p>
              <div className="flex justify-between items-center">
                <Badge variant="secondary" className="bg-blue-600/20 text-blue-300">
                  Crypto News
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  asChild
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <a href={article.url} target="_blank" rel="noopener noreferrer">
                    Read More
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {news.length === 0 && !loading && (
        <Card className="crypto-card">
          <CardContent className="pt-6">
            <p className="text-center text-slate-300">
              No news articles found. Click "Refresh News" to fetch the latest crypto news.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
