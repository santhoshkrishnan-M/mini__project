import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb, 
  BarChart3, 
  Search, 
  Loader2,
  ChevronRight,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Wallet,
  Plus,
  Minus,
  Briefcase,
  History,
  Info,
  ExternalLink,
  Lock,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { StockAnalysis, UserPortfolio, PortfolioItem } from '../types';
import { getStockMarketAnalysis } from '../services/gemini';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StockAssistantProps {
  onBack: () => void;
  t: any;
}

const INITIAL_PORTFOLIO: UserPortfolio = {
  balance: 10000,
  items: []
};

export default function StockAssistant({ onBack, t }: StockAssistantProps) {
  const [analysis, setAnalysis] = useState<StockAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<UserPortfolio>(() => {
    const saved = localStorage.getItem('finora_portfolio');
    return saved ? JSON.parse(saved) : INITIAL_PORTFOLIO;
  });
  const [activeTab, setActiveTab] = useState<'market' | 'portfolio'>('market');
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    localStorage.setItem('finora_portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const result = await getStockMarketAnalysis();
        setAnalysis(result);
      } catch (err: any) {
        console.error('Error fetching stock analysis:', err);
        setError(err.message || t.failedToLoadAISuggestion);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, []);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleBuy = (stock: { symbol: string, stock: string, currentPrice: number }) => {
    const cost = stock.currentPrice;
    if (portfolio.balance < cost) {
      showNotification(t.insufficientBalance, "error");
      return;
    }

    setPortfolio(prev => {
      const existingItem = prev.items.find(item => item.symbol === stock.symbol);
      let newItems;
      if (existingItem) {
        newItems = prev.items.map(item => 
          item.symbol === stock.symbol 
            ? { 
                ...item, 
                quantity: item.quantity + 1, 
                avgPrice: (item.avgPrice * item.quantity + stock.currentPrice) / (item.quantity + 1) 
              }
            : item
        );
      } else {
        newItems = [...prev.items, {
          symbol: stock.symbol,
          name: stock.stock,
          quantity: 1,
          avgPrice: stock.currentPrice,
          currentPrice: stock.currentPrice
        }];
      }

      return {
        balance: prev.balance - cost,
        items: newItems
      };
    });
    showNotification(`${t.successfullyBought} 1 ${t.shareOf} ${stock.symbol}`, "success");
  };

  const handleSell = (symbol: string, price: number) => {
    const existingItem = portfolio.items.find(item => item.symbol === symbol);
    if (!existingItem || existingItem.quantity <= 0) {
      showNotification(t.noSharesOwned, "error");
      return;
    }

    setPortfolio(prev => {
      const newItems = prev.items.map(item => 
        item.symbol === symbol 
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ).filter(item => item.quantity > 0);

      return {
        balance: prev.balance + price,
        items: newItems
      };
    });
    showNotification(`${t.successfullySold} 1 ${t.shareOf} ${symbol}`, "success");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center">
        <div className="relative">
          <Loader2 className="animate-spin text-[#006A4E]" size={64} />
          <div className="absolute inset-0 flex items-center justify-center">
            <BarChart3 size={24} className="text-[#006A4E]" />
          </div>
        </div>
        <h2 className="text-2xl font-serif font-bold mt-8 mb-2">{t.analyzing}</h2>
        <p className="text-gray-500">{t.thinking}</p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="text-center py-20">
        <div className="bg-red-50 p-8 rounded-3xl border border-red-100 inline-block max-w-md">
          <AlertTriangle className="text-red-500 mx-auto mb-4" size={48} />
          <h3 className="text-xl font-bold text-red-700 mb-2">{t.analysisError}</h3>
          <p className="text-red-600 mb-6">{error || t.failedToLoadAISuggestion}</p>
          <button 
            onClick={onBack} 
            className="bg-red-600 text-white px-6 py-2 rounded-full font-bold hover:bg-red-700 transition-colors"
          >
            {t.goBack}
          </button>
        </div>
      </div>
    );
  }

  const portfolioValue = portfolio.items.reduce((acc, item) => acc + (item.quantity * item.currentPrice), 0);
  const totalWealth = portfolio.balance + portfolioValue;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-20"
    >
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              "fixed top-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-lg font-bold text-white",
              notification.type === 'success' ? "bg-green-600" : "bg-red-600"
            )}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-serif font-bold">{t.aiAdvice}</h1>
        </div>
        <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-2xl">
          <button 
            onClick={() => setActiveTab('market')}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-bold transition-all",
              activeTab === 'market' ? "bg-white shadow-sm text-[#006A4E]" : "text-gray-500 hover:text-gray-700"
            )}
          >
            {t.marketOverview}
          </button>
          <button 
            onClick={() => setActiveTab('portfolio')}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-bold transition-all",
              activeTab === 'portfolio' ? "bg-white shadow-sm text-[#006A4E]" : "text-gray-500 hover:text-gray-700"
            )}
          >
            {t.portfolioHoldings}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2 text-gray-400">
            <Wallet size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">{t.cashBalance}</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">₹{portfolio.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2 text-gray-400">
            <Briefcase size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">{t.investedValue}</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">₹{portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-[#006A4E] p-6 rounded-3xl shadow-sm text-white">
          <div className="flex items-center gap-3 mb-2 text-white/60">
            <TrendingUp size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">{t.totalWealth}</span>
          </div>
          <div className="text-2xl font-bold">₹{totalWealth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
      </div>

      {activeTab === 'market' ? (
        <div className="space-y-8">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-serif font-bold mb-4 flex items-center gap-3">
              <Search className="indian-accent" />
              {t.marketOverview}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {analysis.marketSummary}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-xl font-serif font-bold flex items-center gap-2">
                <TrendingUp className="indian-accent" />
                {t.topGainers}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analysis.topOpportunities.map((opportunity, i) => (
                  <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-bold">{opportunity.symbol}</h4>
                          <span className="text-xs text-gray-400">{opportunity.stock}</span>
                        </div>
                        <div className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1",
                          opportunity.trend === "Bullish" ? "bg-green-100 text-green-700" : 
                          opportunity.trend === "Bearish" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
                        )}>
                          {opportunity.trend}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">₹{opportunity.currentPrice.toFixed(2)}</div>
                        <div className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold inline-block",
                          opportunity.risk === "Low" ? "bg-green-500 text-white" : 
                          opportunity.risk === "Medium" ? "bg-yellow-500 text-white" : "bg-red-500 text-white"
                        )}>
                          {opportunity.risk} {t.riskLevel}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-6 line-clamp-3 flex-grow">{opportunity.reason}</p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
                        <span>Strategy: {opportunity.strategy}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => handleBuy(opportunity)}
                          className="flex items-center justify-center gap-2 bg-[#006A4E] text-white py-2.5 rounded-xl font-bold text-sm hover:bg-[#005a42] transition-colors"
                        >
                          <Plus size={16} />
                          {t.buy}
                        </button>
                        <button 
                          onClick={() => handleSell(opportunity.symbol, opportunity.currentPrice)}
                          className="flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2.5 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors"
                        >
                          <Minus size={16} />
                          {t.sell}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h4 className="font-bold flex items-center gap-2 mb-4 text-gray-800">
                  <BarChart3 size={20} className="text-blue-500" />
                  {t.marketSentiment}
                </h4>
                <ul className="space-y-3">
                  {analysis.stocksToWatch.map((stock, i) => (
                    <li key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-sm font-bold">{stock}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-red-50 rounded-3xl p-6 border border-red-100">
                <h4 className="text-red-700 font-bold flex items-center gap-2 mb-4">
                  <AlertTriangle size={20} />
                  {t.riskLevel}
                </h4>
                <ul className="space-y-3">
                  {analysis.riskAlerts.map((alert, i) => (
                    <li key={i} className="text-sm text-red-600 flex gap-2">
                      <span className="mt-1 font-bold">•</span>
                      <span>{alert}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100">
                <h4 className="text-amber-700 font-bold flex items-center gap-2 mb-4">
                  <Lightbulb size={20} />
                  {t.aiAdvice}
                </h4>
                <ul className="space-y-3">
                  {analysis.smartMoneyTips.map((tip, i) => (
                    <li key={i} className="text-sm text-amber-700 flex gap-2">
                      <ShieldCheck size={16} className="shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-xl font-serif font-bold">{t.portfolioHoldings}</h3>
              <div className="text-sm text-gray-400 font-bold">{portfolio.items.length} {t.positions}</div>
            </div>
            {portfolio.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      <th className="px-6 py-4">Stock</th>
                      <th className="px-6 py-4 text-right">Qty</th>
                      <th className="px-6 py-4 text-right">{t.avgPrice}</th>
                      <th className="px-6 py-4 text-right">{t.currentPrice}</th>
                      <th className="px-6 py-4 text-right">{t.pnl}</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {portfolio.items.map((item, i) => {
                      const pnl = (item.currentPrice - item.avgPrice) * item.quantity;
                      const pnlPercent = ((item.currentPrice - item.avgPrice) / item.avgPrice) * 100;
                      return (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900">{item.symbol}</div>
                            <div className="text-xs text-gray-400">{item.name}</div>
                          </td>
                          <td className="px-6 py-4 text-right font-medium">{item.quantity}</td>
                          <td className="px-6 py-4 text-right font-medium">₹{item.avgPrice.toFixed(2)}</td>
                          <td className="px-6 py-4 text-right font-medium">₹{item.currentPrice.toFixed(2)}</td>
                          <td className="px-6 py-4 text-right">
                            <div className={cn(
                              "font-bold flex flex-col items-end",
                              pnl >= 0 ? "text-green-600" : "text-red-600"
                            )}>
                              <div className="flex items-center gap-1">
                                {pnl >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                ₹{Math.abs(pnl).toFixed(2)}
                              </div>
                              <div className="text-[10px]">{pnlPercent.toFixed(2)}%</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => handleSell(item.symbol, item.currentPrice)}
                              className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
                            >
                              {t.sell} 1
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-20 text-center">
                <Briefcase size={48} className="text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-medium">{t.heroDesc}</p>
              </div>
            )}
          </div>

          <div className="bg-blue-50 rounded-3xl p-8 border border-blue-100 flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center text-white shrink-0">
              <Zap size={32} />
            </div>
            <div className="flex-grow text-center md:text-left">
              <h4 className="text-xl font-bold text-blue-900 mb-1">{t.securePrivate}</h4>
              <p className="text-blue-700 text-sm">{t.disclaimer}</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
