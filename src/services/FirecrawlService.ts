
interface SearchResult {
  title: string;
  description: string;
  url: string;
  publishedAt?: string;
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

  static async searchNews(query: string): Promise<{ success: boolean; error?: string; data?: SearchResult[] }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'API key not found' };
    }

    try {
      console.log('Making search request to Firecrawl API');
      const response = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          limit: 20
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
      console.log('Firecrawl search successful:', data);

      // Transform the response to match our SearchResult interface
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
      console.error('Error during Firecrawl search:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to connect to Firecrawl API' 
      };
    }
  }
}
