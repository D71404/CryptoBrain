
interface SearchResult {
  title: string;
  description: string;
  url: string;
  publishedAt?: string;
}

interface StatsResult {
  coinName: string;
  price: string;
  marketCap: string;
  change24h: string;
  rank: string;
  url: string;
}

export class FirecrawlService {
  private static API_KEY_STORAGE_KEY = 'firecrawl_api_key';

  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
    console.log('Firecrawl API key saved successfully');
  }

  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
  }

  static async testApiKey(apiKey: string): Promise<boolean> {
    try {
      console.log('Testing Firecrawl API key');
      const response = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'test',
          limit: 1
        }),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error testing Firecrawl API key:', error);
      return false;
    }
  }

  static async searchNews(query: string = 'cryptocurrency bitcoin ethereum latest news'): Promise<{ success: boolean; error?: string; data?: SearchResult[] }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'API key not found' };
    }

    try {
      console.log('Making news search request to Firecrawl API');
      const searchQuery = `${query} site:coindesk.com OR site:cointelegraph.com OR site:decrypt.co OR site:coinbase.com OR site:binance.com`;
      
      const response = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          limit: 15
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Firecrawl API error:', errorData);
        return { 
          success: false, 
          error: errorData.error || `API request failed with status ${response.status}` 
        };
      }

      const data = await response.json();
      console.log('Firecrawl news search successful:', data);

      const results: SearchResult[] = data.data?.map((item: any) => ({
        title: item.title || item.metadata?.title || 'No title',
        description: item.description || item.metadata?.description || item.content?.substring(0, 200) || 'No description available',
        url: item.url,
        publishedAt: item.metadata?.publishedTime || item.metadata?.date
      })) || [];

      return { 
        success: true,
        data: results 
      };
    } catch (error) {
      console.error('Error during Firecrawl news search:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to connect to Firecrawl API' 
      };
    }
  }

  static async searchStats(query: string = 'cryptocurrency market cap price bitcoin ethereum'): Promise<{ success: boolean; error?: string; data?: StatsResult[] }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'API key not found' };
    }

    try {
      console.log('Making stats search request to Firecrawl API');
      const searchQuery = `${query} site:coinmarketcap.com OR site:coingecko.com`;
      
      const response = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          limit: 10
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.error || `API request failed with status ${response.status}` 
        };
      }

      const data = await response.json();
      console.log('Firecrawl stats search successful:', data);

      const results: StatsResult[] = data.data?.map((item: any) => ({
        coinName: item.title?.split(' ')[0] || 'Unknown',
        price: 'Check source',
        marketCap: 'Check source', 
        change24h: 'Check source',
        rank: 'Check source',
        url: item.url
      })) || [];

      return { 
        success: true,
        data: results 
      };
    } catch (error) {
      console.error('Error during Firecrawl stats search:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to connect to Firecrawl API' 
      };
    }
  }
}
