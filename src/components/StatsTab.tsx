
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CoinGeckoService } from '@/services/CoinGeckoService';
import { useToast } from "@/hooks/use-toast";

interface CryptoCoin {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
  market_cap_rank: number;
  image: string;
}

export const StatsTab = () => {
  const [coins, setCoins] = useState<CryptoCoin[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCryptoStats();
  }, []);

  const fetchCryptoStats = async () => {
    setLoading(true);
    try {
      const result = await CoinGeckoService.getTopCoins();
      if (result.success && result.data) {
        setCoins(result.data);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch crypto stats",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching crypto stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch cryptocurrency statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(price);
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    }
    return `$${marketCap.toFixed(0)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Top Cryptocurrencies</h2>
        <Button 
          onClick={fetchCryptoStats} 
          disabled={loading}
          className="crypto-gradient"
        >
          {loading ? 'Loading...' : 'Refresh Stats'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {coins.map((coin) => (
          <Card key={coin.id} className="crypto-card hover:glow-effect transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <img src={coin.image} alt={coin.name} className="w-8 h-8" />
                  <div>
                    <CardTitle className="text-white text-lg">{coin.name}</CardTitle>
                    <p className="text-slate-400 text-sm uppercase">{coin.symbol}</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-blue-400 text-blue-300">
                  #{coin.market_cap_rank}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">Price</span>
                  <span className="text-white font-bold">
                    {formatPrice(coin.current_price)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">Market Cap</span>
                  <span className="text-white font-medium">
                    {formatMarketCap(coin.market_cap)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">24h Change</span>
                  <Badge 
                    variant={coin.price_change_percentage_24h >= 0 ? "default" : "destructive"}
                    className={coin.price_change_percentage_24h >= 0 ? "bg-green-600" : ""}
                  >
                    {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                    {coin.price_change_percentage_24h.toFixed(2)}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {coins.length === 0 && !loading && (
        <Card className="crypto-card">
          <CardContent className="pt-6">
            <p className="text-center text-slate-300">
              No cryptocurrency data available. Click "Refresh Stats" to fetch the latest data.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
