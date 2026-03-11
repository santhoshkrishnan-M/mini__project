import { MarketData, StockNews } from "../types";

const STOCK_DATA_API_KEY = "H10BAGzRcsW5xQbE9hcjfR3492bawn1taTJTGjVS";
const BASE_URL = "https://api.stockdata.org/v1";
const NEWS_API_KEY = "b917c0fff04f450cbc6abf75dfc72e59"; // Free NewsAPI key for financial news

// Fetch financial news from NewsAPI
async function fetchFinancialNews(): Promise<StockNews['data']> {
  try {
    // Fetch from multiple sources for comprehensive coverage
    const queries = [
      'stock market OR shares OR NSE OR BSE OR sensex OR nifty',
      'stocks AND (India OR BSE OR NSE)',
      'stock market news India'
    ];

    const newsPromises = queries.map(async (query) => {
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${NEWS_API_KEY}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`NewsAPI request failed: ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      return data.articles || [];
    });

    const allNewsArrays = await Promise.all(newsPromises);
    const allNews = allNewsArrays.flat();

    // Remove duplicates based on title and format for our interface
    const uniqueNews = Array.from(
      new Map(
        allNews.map((article: any) => [
          article.title,
          {
            uuid: article.url,
            title: article.title,
            description: article.description || article.content || '',
            snippet: article.description?.substring(0, 150) || '',
            url: article.url,
            image_url: article.urlToImage || '',
            language: 'en',
            published_at: article.publishedAt,
            source: article.source?.name || 'Unknown',
            relevance_score: null,
            entities: [],
            similar: []
          }
        ])
      ).values()
    );

    // Sort by date (newest first) and return top 20
    return uniqueNews
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      .slice(0, 20);
  } catch (error) {
    console.error("Error fetching financial news:", error);
    
    // Fallback to StockData.org API if NewsAPI fails
    try {
      const newsResponse = await fetch(`${BASE_URL}/news?api_token=${STOCK_DATA_API_KEY}`);
      const newsData: StockNews = await newsResponse.json();
      return newsData.data || [];
    } catch (fallbackError) {
      console.error("Fallback news fetch also failed:", fallbackError);
      return [];
    }
  }
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
