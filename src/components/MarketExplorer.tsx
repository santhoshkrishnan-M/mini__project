import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Loader2,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  X,
  ShieldCheck,
  AlertTriangle,
  Info
} from 'lucide-react';
import { searchStocks } from '../services/stockApi';
import { getTradeSuggestion } from '../services/gemini';
import { TradeSuggestion } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function MarketExplorer({ t }: { t: any }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedStock, setSelectedStock] = useState<any | null>(null);
  const [suggestion, setSuggestion] = useState<TradeSuggestion | null>(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length > 1) {
        setSearching(true);
        const res = await searchStocks(query);
        setResults(res);
        setSearching(false);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelectStock = async (stock: any) => {
    setSelectedStock(stock);
    setLoadingSuggestion(true);
    try {
      const sugg = await getTradeSuggestion(stock.symbol, stock.price, []);
      setSuggestion(sugg);
    } catch (error) {
      console.error("Error getting trade suggestion:", error);
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const handleTrade = async (type: "BUY" | "SELL") => {
    if (!selectedStock) return;
    
    try {
      const response = await fetch("/api/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: selectedStock.symbol,
          name: selectedStock.name,
          type,
          quantity: 1,
          price: selectedStock.price
        })
      });
      
      if (response.ok) {
        alert(`Successfully ${type === "BUY" ? "bought" : "sold"} 1 share of ${selectedStock.symbol}`);
        setSelectedStock(null);
      } else {
        const err = await response.json();
        alert(err.error || "Trade failed");
      }
    } catch (error) {
      console.error("Trade error:", error);
      alert("An error occurred during the trade.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="relative max-w-2xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text"
          placeholder={t.searchStocks}
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E]/20 transition-all"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {searching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Loader2 className="animate-spin text-[#006A4E]" size={20} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {results.map((stock, i) => (
            <motion.div 
              key={stock.symbol}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleSelectStock(stock)}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 cursor-pointer hover:border-[#006A4E]/30 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#006A4E] transition-colors">{stock.symbol}</h3>
                  <p className="text-sm text-gray-400">{stock.name}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">${stock.price.toFixed(2)}</div>
                  <div className="text-xs text-green-600 font-bold flex items-center justify-end gap-1">
                    <ArrowUpRight size={12} />
                    +1.2%
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
                <span className="text-xs font-bold text-gray-400 uppercase">{t.viewDetails}</span>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-[#006A4E] transition-colors" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Stock Detail Modal */}
      <AnimatePresence>
        {selectedStock && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#006A4E] flex items-center justify-center text-white font-bold text-xl">
                    {selectedStock.symbol[0]}
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif font-bold">{selectedStock.name}</h2>
                    <p className="text-gray-400 font-bold tracking-widest uppercase text-xs">{selectedStock.symbol}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedStock(null)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-8 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Price & Chart Placeholder */}
                  <div className="space-y-6">
                    <div className="flex items-baseline gap-4">
                      <span className="text-5xl font-bold">${selectedStock.price.toFixed(2)}</span>
                      <span className="text-green-600 font-bold flex items-center gap-1">
                        <ArrowUpRight size={20} />
                        +1.24%
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 rounded-3xl h-64 flex items-center justify-center border border-gray-100 relative overflow-hidden">
                      <BarChart3 size={48} className="text-gray-200" />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-50/80 to-transparent" />
                      <span className="absolute bottom-4 text-xs font-bold text-gray-400 uppercase tracking-widest">{t.liveChartPlaceholder}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                        <div className="text-xs text-gray-400 font-bold uppercase mb-1">Day High</div>
                        <div className="font-bold">${(selectedStock.price * 1.02).toFixed(2)}</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                        <div className="text-xs text-gray-400 font-bold uppercase mb-1">Day Low</div>
                        <div className="font-bold">${(selectedStock.price * 0.98).toFixed(2)}</div>
                      </div>
                    </div>
                  </div>

                  {/* AI Trading Assistant */}
                  <div className="space-y-6">
                    <div className="bg-[#006A4E] rounded-3xl p-6 shadow-lg text-white">
                      <h3 className="text-lg font-serif font-bold mb-4 flex items-center gap-2">
                        <Zap className="text-yellow-400" size={20} />
                        {t.aiTradingAssistant}
                      </h3>
                      
                      {loadingSuggestion ? (
                        <div className="flex flex-col items-center py-8">
                          <Loader2 className="animate-spin mb-2" size={32} />
                          <p className="text-sm text-white/60">{t.thinking}</p>
                        </div>
                      ) : suggestion ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-white/60">{t.recommendation}</span>
                            <span className={cn(
                              "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                              suggestion.action === "Buy" ? "bg-green-500" : 
                              suggestion.action === "Sell" ? "bg-red-500" : "bg-amber-500"
                            )}>
                              {suggestion.action === "Buy" ? t.buy : suggestion.action === "Sell" ? t.sell : t.hold}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed text-white/90">
                            {suggestion.reasoning}
                          </p>
                          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                            <div>
                              <div className="text-[10px] text-white/40 uppercase font-bold mb-1">{t.riskLevel}</div>
                              <div className="text-sm font-bold">{suggestion.riskLevel}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-white/40 uppercase font-bold mb-1">{t.confidence}</div>
                              <div className="text-sm font-bold">{(suggestion.confidence * 100).toFixed(0)}%</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-white/60">{t.failedToLoadAISuggestion}</p>
                      )}
                    </div>

                    <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100">
                      <h4 className="text-amber-700 font-bold flex items-center gap-2 mb-3">
                        <Info size={18} />
                        {t.beforeYouTrade}
                      </h4>
                      <p className="text-xs text-amber-700/80 leading-relaxed">
                        {t.disclaimer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-gray-50 border-t border-gray-100 flex gap-4">
                <button 
                  onClick={() => handleTrade("BUY")}
                  className="flex-grow bg-[#006A4E] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#005a42] transition-all shadow-lg shadow-[#006A4E]/20"
                >
                  {t.buy} {selectedStock.symbol}
                </button>
                <button 
                  onClick={() => handleTrade("SELL")}
                  className="flex-grow bg-white text-red-600 border-2 border-red-100 py-4 rounded-2xl font-bold text-lg hover:bg-red-50 transition-all"
                >
                  {t.sell} {selectedStock.symbol}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
