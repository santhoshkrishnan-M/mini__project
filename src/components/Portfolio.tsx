import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Briefcase, 
  History, 
  ArrowUpRight, 
  ArrowDownRight,
  Loader2,
  PieChart as PieChartIcon,
  DollarSign,
  Zap
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Portfolio({ t }: { t: any }) {
  const [data, setData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        const [pRes, tRes] = await Promise.all([
          fetch("/api/portfolio"),
          fetch("/api/transactions")
        ]);
        const pData = await pRes.json();
        const tData = await tRes.json();
        setData(pData);
        setTransactions(tData);
      } catch (error) {
        console.error("Error loading portfolio:", error);
      } finally {
        setLoading(false);
      }
    };
    loadPortfolio();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center">
        <Loader2 className="animate-spin text-[#006A4E] mb-4" size={48} />
        <h2 className="text-xl font-serif font-bold">{t.analyzing}</h2>
      </div>
    );
  }

  const portfolioValue = data?.items.reduce((acc: number, item: any) => acc + (item.quantity * item.avgPrice), 0) || 0;
  const totalWealth = (data?.balance || 0) + portfolioValue;

  const COLORS = ['#006A4E', '#F27D26', '#FFD700', '#3b82f6', '#8b5cf6', '#ec4899'];

  const chartData = data?.items.map((item: any) => ({
    name: item.symbol,
    value: item.quantity * item.avgPrice
  })) || [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2 text-gray-400">
            <Wallet size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">{t.cashBalance}</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">₹{data?.balance.toLocaleString()}</div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2 text-gray-400">
            <Briefcase size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">{t.investedValue}</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">₹{portfolioValue.toLocaleString()}</div>
        </div>
        <div className="bg-[#006A4E] p-6 rounded-3xl shadow-sm text-white">
          <div className="flex items-center gap-3 mb-2 text-white/60">
            <TrendingUp size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">{t.totalWealth}</span>
          </div>
          <div className="text-2xl font-bold">₹{totalWealth.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-xl font-serif font-bold">{t.portfolioHoldings}</h3>
              <div className="text-sm text-gray-400 font-bold">{data?.items.length} Positions</div>
            </div>
            {data?.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      <th className="px-6 py-4">Stock</th>
                      <th className="px-6 py-4 text-right">Quantity</th>
                      <th className="px-6 py-4 text-right">{t.avgPrice}</th>
                      <th className="px-6 py-4 text-right">Total Value</th>
                      <th className="px-6 py-4 text-right">P&L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.items.map((item: any, i: number) => {
                      const value = item.quantity * item.avgPrice;
                      return (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900">{item.symbol}</div>
                            <div className="text-xs text-gray-400">{item.name}</div>
                          </td>
                          <td className="px-6 py-4 text-right font-medium">{item.quantity}</td>
                          <td className="px-6 py-4 text-right font-medium">₹{item.avgPrice.toFixed(2)}</td>
                          <td className="px-6 py-4 text-right font-bold">₹{value.toFixed(2)}</td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-green-600 font-bold text-xs flex items-center justify-end gap-1">
                              <ArrowUpRight size={12} />
                              --
                            </span>
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

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50">
              <h3 className="text-xl font-serif font-bold flex items-center gap-2">
                <History size={20} className="text-[#006A4E]" />
                {t.transactionHistory}
              </h3>
            </div>
            <div className="divide-y divide-gray-50">
              {transactions.slice(0, 5).map((t_item, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-bold",
                      t_item.type === "BUY" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {t_item.type[0]}
                    </div>
                    <div>
                      <div className="font-bold">{t_item.symbol}</div>
                      <div className="text-xs text-gray-400">{new Date(t_item.timestamp).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">₹{(t_item.quantity * t_item.price).toFixed(2)}</div>
                    <div className="text-xs text-gray-400">{t_item.quantity} shares @ ₹{t_item.price.toFixed(2)}</div>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className="p-8 text-center text-gray-400 text-sm">No transactions yet.</div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold flex items-center gap-2 mb-6">
              <PieChartIcon size={20} className="text-[#006A4E]" />
              {t.assetAllocation}
            </h3>
            <div className="h-64 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      formatter={(value: number) => `₹${value.toFixed(2)}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-300 text-sm font-medium">
                  No data to display
                </div>
              )}
            </div>
            <div className="mt-4 space-y-2">
              {chartData.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-gray-500">{item.name}</span>
                  </div>
                  <span className="font-bold">₹{item.value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#006A4E] rounded-3xl p-6 shadow-lg text-white">
            <h3 className="text-lg font-serif font-bold mb-4 flex items-center gap-2">
              <Zap className="text-yellow-400" size={20} />
              {t.aiAdvice}
            </h3>
            <p className="text-sm text-white/80 leading-relaxed">
              {t.heroDesc}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
