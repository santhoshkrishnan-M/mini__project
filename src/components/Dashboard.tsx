import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Search, 
  Loader2,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Newspaper,
  LayoutDashboard,
  PieChart as PieChartIcon,
  Languages
} from 'lucide-react';
import { MarketData, Language } from '../types';
import { fetchMarketData } from '../services/stockApi';
import { getMarketExplanation } from '../services/gemini';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DashboardProps {
  t: any;
  setLanguage: (lang: Language) => void;
  currentLanguage: Language;
}

export default function Dashboard({ t, setLanguage, currentLanguage }: DashboardProps) {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [explanation, setExplanation] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchMarketData();
        setMarketData(data);
        try {
          const expl = await getMarketExplanation(data);
          setExplanation(expl);
        } catch (aiError) {
          console.error("AI explanation error:", aiError);
          // Provide default explanation on quota error
          setExplanation("Market data is showing mixed signals today. Review the top gainers and losers below for insights. Focus on diversified investments and long-term strategies.");
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center">
        <Loader2 className="animate-spin text-[#006A4E] mb-4" size={48} />
        <h2 className="text-xl font-serif font-bold">{t.analyzing}</h2>
        <p className="text-gray-500">{t.heroDesc}</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Language Selection Quick Access */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-[#006A4E]/10 rounded-xl text-[#006A4E]">
            <Languages size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{t.preferredLanguage}</h3>
            <p className="text-xs text-gray-500">{t.chooseLanguage}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
          {Object.values(Language).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                currentLanguage === lang 
                  ? "bg-[#006A4E] text-white border-[#006A4E] shadow-md shadow-[#006A4E]/20" 
                  : "bg-gray-50 text-gray-600 border-gray-100 hover:bg-white hover:border-[#006A4E] hover:text-[#006A4E]"
              )}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Market Overview */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                <LayoutDashboard className="text-[#006A4E]" />
                {t.marketOverview}
              </h2>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold">
                <Zap size={14} />
                {t.live}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {marketData?.trending.map((stock, i) => (
                <div key={i} className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-gray-900">{stock.symbol}</span>
                    <span className={cn(
                      "text-xs font-bold flex items-center gap-1",
                      stock.change >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {stock.change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {stock.changePercent.toFixed(2)}%
                    </span>
                  </div>
                  <div className="text-lg font-bold">₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <div className="text-xs text-gray-400 mt-1">{stock.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-[#006A4E] rounded-3xl p-8 shadow-lg text-white">
            <h3 className="text-xl font-serif font-bold mb-4 flex items-center gap-3">
              <Zap className="text-yellow-400" />
              {t.aiTradingAssistant}
            </h3>
            <p className="text-white/80 leading-relaxed">
              {explanation}
            </p>
          </div>

          {/* Market Trends */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h4 className="font-bold text-green-700 flex items-center gap-2 mb-4">
                <TrendingUp size={20} />
                {t.topGainers}
              </h4>
              <div className="space-y-4">
                {marketData?.topGainers.map((stock, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div>
                      <div className="font-bold">{stock.symbol}</div>
                      <div className="text-xs text-gray-400">{stock.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      <div className="text-xs text-green-600 font-bold">+{stock.changePercent.toFixed(2)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h4 className="font-bold text-red-700 flex items-center gap-2 mb-4">
                <TrendingDown size={20} />
                {t.topLosers}
              </h4>
              <div className="space-y-4">
                {marketData?.topLosers.map((stock, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div>
                      <div className="font-bold">{stock.symbol}</div>
                      <div className="text-xs text-gray-400">{stock.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      <div className="text-xs text-red-600 font-bold">{stock.changePercent.toFixed(2)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: News & Quick Stats */}
        <div className="space-y-8">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <Newspaper size={20} className="text-blue-500" />
              {t.latestNews}
            </h3>
            <div className="space-y-4">
              {marketData?.news && marketData.news.length > 0 ? (
                marketData.news.slice(0, 8).map((item, i) => {
                  const publishedDate = new Date(item.published_at);
                  const now = new Date();
                  const diffInHours = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60));
                  const timeAgo = diffInHours < 1 
                    ? t.justNow || 'Just now'
                    : diffInHours < 24 
                      ? (t.hoursAgo || '{hours}h ago').replace('{hours}', diffInHours.toString())
                      : (t.daysAgo || '{days}d ago').replace('{days}', Math.floor(diffInHours / 24).toString());

                  return (
                    <a 
                      key={i} 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block group border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                    >
                      <div className="flex items-start gap-3">
                        {item.image_url && (
                          <img 
                            src={item.image_url} 
                            alt={item.title}
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-blue-600">{item.source}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-400">{timeAgo}</span>
                          </div>
                          <h4 className="text-sm font-bold group-hover:text-[#006A4E] transition-colors line-clamp-2 mb-1">
                            {item.title}
                          </h4>
                          {item.snippet && (
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {item.snippet}
                            </p>
                          )}
                        </div>
                      </div>
                    </a>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Newspaper size={32} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">{t.noNewsAvailable || 'No news available at the moment'}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100">
            <h3 className="text-amber-700 font-bold flex items-center gap-2 mb-4">
              <PieChartIcon size={20} />
              {t.quickAnalytics}
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-amber-600">{t.marketSentiment}</span>
                <span className="font-bold text-amber-900">{t.bullish}</span>
              </div>
              <div className="w-full bg-amber-200 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-600 h-full w-[70%]" />
              </div>
              <p className="text-xs text-amber-700/70">
                {t.heroDesc}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
