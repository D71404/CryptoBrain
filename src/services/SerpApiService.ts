
interface SerpSearchResult {
  title: string;
  snippet: string;
  link: string;
  source?: string;
}

export class SerpApiService {
  private static API_KEY_STORAGE_KEY = 'serpapi_key';

  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
    console.log('SerpAPI key saved successfully');
  }

  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
  }

  static async testApiKey(apiKey: string): Promise<boolean> {
    try {
      console.log('Testing SerpAPI key');
      const response = await fetch(`https://serpapi.com/search.json?engine=google&q=test&api_key=${apiKey}&num=1`);
      return response.ok;
    } catch (error) {
      console.error('Error testing SerpAPI key:', error);
      return false;
    }
  }

  static async search(query: string): Promise<{ success: boolean; error?: string; data?: SerpSearchResult[] }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'API key not found' };
    }

    try {
      console.log('Making search request to SerpAPI');
      const cryptoQuery = `${query} cryptocurrency crypto bitcoin ethereum blockchain`;
      
      const response = await fetch(
        `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(cryptoQuery)}&api_key=${apiKey}&num=10`
      );

      if (!response.ok) {
        return { 
          success: false, 
          error: `SerpAPI request failed with status ${response.status}` 
        };
      }

      const data = await response.json();
      console.log('SerpAPI search successful');

      const results: SerpSearchResult[] = data.organic_results?.map((item: any) => ({
        title: item.title || 'No title',
        snippet: item.snippet || 'No description available',
        link: item.link,
        source: item.displayed_link || new URL(item.link).hostname
      })) || [];

      return { 
        success: true,
        data: results 
      };
    } catch (error) {
      console.error('Error during SerpAPI search:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to connect to SerpAPI' 
      };
    }
  }
}
