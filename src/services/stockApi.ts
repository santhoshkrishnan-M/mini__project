import { MarketData, StockNews } from "../types";

const STOCK_DATA_API_KEY = process.env.STOCK_DATA_API_KEY || "";
const BASE_URL = "https://api.stockdata.org/v1";
const NEWS_API_KEY = process.env.NEWS_API_KEY || ""; // NewsAPI key for financial news

export async function fetchMarketNews(forceRefresh = false): Promise<StockNews['data']> {
  const endpoint = forceRefresh ? '/api/market/news?force=true' : '/api/market/news';

  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`News endpoint failed: ${response.status}`);
    }

    const data = await response.json();
    return data.news || [];
  } catch (error) {
    console.error("Error fetching financial news:", error);
    return [];
  }
}

async function fetchFinancialNews(): Promise<StockNews['data']> {
  return fetchMarketNews(false);
}

export async function fetchMarketData(): Promise<MarketData> {
  try {
    // Fetch real-time market overview from backend and news in parallel
    const [overviewResponse, news] = await Promise.all([
      fetch('/api/market/overview'),
      fetchFinancialNews()
    ]);

    const overviewData = await overviewResponse.json();

    return {
      topGainers: overviewData.topGainers.slice(0, 4),
      topLosers: overviewData.topLosers.slice(0, 4),
      trending: overviewData.mostActive.slice(0, 6),
      news: news
    };
  } catch (error) {
    console.error("Error fetching market data:", error);
    
    // Try to at least fetch news if market data fails
    try {
      const news = await fetchFinancialNews();
      return {
        topGainers: [],
        topLosers: [],
        trending: [],
        news: news
      };
    } catch (newsError) {
      return {
        topGainers: [],
        topLosers: [],
        trending: [],
        news: []
      };
    }
  }
}

export async function searchStocks(query: string) {
  try {
    const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    
    // Get real-time quotes for search results
    if (data.stocks && data.stocks.length > 0) {
      const symbols = data.stocks.map((s: any) => s.symbol).join(',');
      const quotesResponse = await fetch(`/api/stocks/quotes?symbols=${symbols}`);
      const quotesData = await quotesResponse.json();
      
      return quotesData.quotes || data.stocks;
    }
    
    return [];
  } catch (error) {
    console.error("Error searching stocks:", error);
    return [];
  }
}

export async function getStockQuote(symbol: string) {
  try {
    const response = await fetch(`/api/stocks/quotes?symbols=${symbol}`);
    const data = await response.json();
    return data.quotes?.[0] || null;
  } catch (error) {
    console.error("Error fetching stock quote:", error);
    return null;
  }
}

export async function getAllStocks() {
  try {
    const response = await fetch('/api/stocks/list');
    const data = await response.json();
    return data.stocks || [];
  } catch (error) {
    console.error("Error fetching all stocks:", error);
    return [];
  }
}

// Function to get real-time quote from Kite Connect (placeholder for future implementation)
export async function getKiteQuote(symbol: string) {
  // Note: Kite Connect requires OAuth authentication flow
  // This is a placeholder that returns simulated data
  // To use real data, you need to:
  // 1. Complete OAuth flow to get access token
  // 2. Use the access token to fetch real-time quotes
  // 3. Call: https://api.kite.trade/quote?i=NSE:{symbol}
  
  console.log(`Fetching quote for: ${symbol}`);
  
  return null; // Placeholder for future implementation
}
