
interface CoinData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
  market_cap_rank: number;
  image: string;
}

export class CoinGeckoService {
  private static BASE_URL = 'https://api.coingecko.com/api/v3';

  static async getTopCoins(limit: number = 20): Promise<{ success: boolean; error?: string; data?: CoinData[] }> {
    try {
      console.log('Fetching top cryptocurrencies from CoinGecko');
      const response = await fetch(
        `${this.BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h`
      );

      if (!response.ok) {
        console.error('CoinGecko API error:', response.status);
        return { 
          success: false, 
          error: `Failed to fetch data from CoinGecko (Status: ${response.status})` 
        };
      }

      const data = await response.json();
      console.log('CoinGecko data fetched successfully');

      return { 
        success: true,
        data: data 
      };
    } catch (error) {
      console.error('Error fetching from CoinGecko:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to connect to CoinGecko API' 
      };
    }
  }

  static async getCoinDetails(coinId: string): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      console.log(`Fetching details for coin: ${coinId}`);
      const response = await fetch(
        `${this.BASE_URL}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`
      );

      if (!response.ok) {
        return { 
          success: false, 
          error: `Failed to fetch coin details (Status: ${response.status})` 
        };
      }

      const data = await response.json();
      return { 
        success: true,
        data: data 
      };
    } catch (error) {
      console.error('Error fetching coin details:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch coin details' 
      };
    }
  }
}
