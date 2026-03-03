import { MarketData, StockNews } from "../types";

const STOCK_DATA_API_KEY = "H10BAGzRcsW5xQbE9hcjfR3492bawn1taTJTGjVS";
const BASE_URL = "https://api.stockdata.org/v1";

export async function fetchMarketData(): Promise<MarketData> {
  try {
    const newsResponse = await fetch(`${BASE_URL}/news?api_token=${STOCK_DATA_API_KEY}`);
    const newsData: StockNews = await newsResponse.json();

    // Mocking gainers/losers as the free news API might not provide them
    // In a real app, you'd use a dedicated quotes/market endpoint
    const mockStocks = [
      { symbol: "AAPL", name: "Apple Inc.", price: 185.92 },
      { symbol: "TSLA", name: "Tesla, Inc.", price: 193.57 },
      { symbol: "NVDA", name: "NVIDIA Corp.", price: 726.13 },
      { symbol: "MSFT", name: "Microsoft Corp.", price: 404.06 },
      { symbol: "GOOGL", name: "Alphabet Inc.", price: 143.96 },
      { symbol: "AMZN", name: "Amazon.com, Inc.", price: 169.51 },
      { symbol: "META", name: "Meta Platforms", price: 473.32 },
      { symbol: "NFLX", name: "Netflix, Inc.", price: 591.15 },
    ];

    const generateChange = () => {
      const change = (Math.random() * 10 - 5);
      const changePercent = change / 100;
      return { change, changePercent: changePercent * 100 };
    };

    const stocksWithChanges = mockStocks.map(s => ({
      ...s,
      ...generateChange()
    }));

    return {
      topGainers: [...stocksWithChanges].sort((a, b) => b.changePercent - a.changePercent).slice(0, 4),
      topLosers: [...stocksWithChanges].sort((a, b) => a.changePercent - b.changePercent).slice(0, 4),
      trending: stocksWithChanges.slice(0, 4),
      news: newsData.data || []
    };
  } catch (error) {
    console.error("Error fetching market data:", error);
    return {
      topGainers: [],
      topLosers: [],
      trending: [],
      news: []
    };
  }
}

export async function searchStocks(query: string) {
  // Mock search
  const allStocks = [
    { symbol: "AAPL", name: "Apple Inc.", price: 185.92 },
    { symbol: "TSLA", name: "Tesla, Inc.", price: 193.57 },
    { symbol: "NVDA", name: "NVIDIA Corp.", price: 726.13 },
    { symbol: "MSFT", name: "Microsoft Corp.", price: 404.06 },
    { symbol: "RELIANCE", name: "Reliance Industries", price: 2950.00 },
    { symbol: "TCS", name: "Tata Consultancy Services", price: 4100.00 },
    { symbol: "HDFCBANK", name: "HDFC Bank", price: 1450.00 },
    { symbol: "INFY", name: "Infosys", price: 1650.00 },
  ];

  return allStocks.filter(s => 
    s.symbol.toLowerCase().includes(query.toLowerCase()) || 
    s.name.toLowerCase().includes(query.toLowerCase())
  );
}
