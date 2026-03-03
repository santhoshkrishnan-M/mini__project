import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PiggyBank, 
  Target, 
  Briefcase, 
  History, 
  Calculator,
  Zap,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Loader2,
  TrendingUp,
  Info
} from 'lucide-react';
import { getInvestmentGuidance } from '../services/gemini';
import { InvestmentGuidance } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type InvestmentType = "SIP" | "SWP" | "FD" | "Mutual Funds";

export default function InvestmentHub({ t }: { t: any }) {
  const [activeType, setActiveType] = useState<InvestmentType>("SIP");
  const [guidance, setGuidance] = useState<InvestmentGuidance | null>(null);
  const [loading, setLoading] = useState(true);

  // Calculator states
  const [amount, setAmount] = useState(5000);
  const [tenure, setTenure] = useState(5);
  const [rate, setRate] = useState(12);

  useEffect(() => {
    const loadGuidance = async () => {
      setLoading(true);
      try {
        const res = await getInvestmentGuidance(activeType);
        setGuidance(res);
      } catch (error) {
        console.error("Error loading investment guidance:", error);
      } finally {
        setLoading(false);
      }
    };
    loadGuidance();
  }, [activeType]);

  const calculateReturns = () => {
    if (activeType === "SIP") {
      const i = (rate / 100) / 12;
      const n = tenure * 12;
      const totalValue = amount * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
      const invested = amount * n;
      return { totalValue, invested, returns: totalValue - invested };
    } else if (activeType === "FD") {
      const totalValue = amount * Math.pow(1 + (rate / 100), tenure);
      const invested = amount;
      return { totalValue, invested, returns: totalValue - invested };
    }
    return { totalValue: 0, invested: 0, returns: 0 };
  };

  const results = calculateReturns();

  const investmentCards = [
    { id: "SIP", name: "SIP", icon: <Target />, desc: "Systematic Investment Plan" },
    { id: "SWP", name: "SWP", icon: <History />, desc: "Systematic Withdrawal Plan" },
    { id: "FD", name: "FD", icon: <Lock />, desc: "Fixed Deposit" },
    { id: "Mutual Funds", name: "MF", icon: <Briefcase />, desc: "Mutual Funds" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {investmentCards.map((card) => (
          <button
            key={card.id}
            onClick={() => setActiveType(card.id as InvestmentType)}
            className={cn(
              "p-6 rounded-3xl text-left transition-all border",
              activeType === card.id 
                ? "bg-[#006A4E] text-white border-[#006A4E] shadow-lg shadow-[#006A4E]/20" 
                : "bg-white text-gray-900 border-gray-100 hover:border-[#006A4E]/30"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center mb-4",
              activeType === card.id ? "bg-white/20" : "bg-gray-100 text-[#006A4E]"
            )}>
              {card.icon}
            </div>
            <div className="font-bold text-lg">{card.name}</div>
            <div className={cn(
              "text-xs mt-1",
              activeType === card.id ? "text-white/60" : "text-gray-400"
            )}>{card.desc}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* AI Guidance */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            {loading ? (
              <div className="flex flex-col items-center py-20">
                <Loader2 className="animate-spin text-[#006A4E] mb-4" size={48} />
                <p className="text-gray-500 font-medium">{t.analyzing}</p>
              </div>
            ) : guidance ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-serif font-bold text-gray-900">{guidance.title}</h2>
                  <div className="px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">
                    {guidance.riskLevel} {t.riskLevel}
                  </div>
                </div>
                
                <p className="text-gray-600 leading-relaxed text-lg">{guidance.description}</p>

                <div className="bg-[#006A4E] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                  <Zap className="absolute -right-8 -top-8 text-white/10 w-48 h-48 rotate-12" />
                  <h3 className="text-xl font-serif font-bold mb-4 flex items-center gap-3">
                    <Zap className="text-yellow-400" />
                    {t.aiAdvice}
                  </h3>
                  <p className="text-white/80 leading-relaxed relative z-10">
                    {guidance.aiAdvice}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100">
                    <h4 className="font-bold text-blue-900 mb-2">{t.expectedReturns}</h4>
                    <p className="text-blue-700 text-sm">{guidance.expectedReturns}</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-amber-50 border border-amber-100">
                    <h4 className="font-bold text-amber-900 mb-2">{t.comparison}</h4>
                    <p className="text-amber-700 text-sm">{guidance.comparison}</p>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </div>
        </div>

        {/* Calculator Sidebar */}
        <div className="space-y-8">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-serif font-bold mb-6 flex items-center gap-3">
              <Calculator className="text-[#006A4E]" />
              {activeType} {t.calculateReturns}
            </h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-gray-500">{t.monthlyInvestment}</span>
                  <span className="text-[#006A4E]">₹{amount.toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min="500" 
                  max="100000" 
                  step="500"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full accent-[#006A4E]"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-gray-500">{t.duration}</span>
                  <span className="text-[#006A4E]">{tenure} {t.years}</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="30" 
                  value={tenure}
                  onChange={(e) => setTenure(Number(e.target.value))}
                  className="w-full accent-[#006A4E]"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-gray-500">{t.expectedReturnRate} (%)</span>
                  <span className="text-[#006A4E]">{rate}%</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="30" 
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full accent-[#006A4E]"
                />
              </div>

              <div className="pt-6 border-t border-gray-50 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">{t.investedValue}</span>
                  <span className="font-bold">₹{results.invested.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">{t.estimatedReturns}</span>
                  <span className="font-bold text-green-600">₹{results.returns.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-bold text-gray-900">Total Value</span>
                  <span className="text-2xl font-bold text-[#006A4E]">₹{results.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100">
            <h4 className="text-blue-900 font-bold flex items-center gap-2 mb-3">
              <ShieldCheck size={18} />
              {t.securePrivate}
            </h4>
            <p className="text-xs text-blue-700 leading-relaxed">
              {t.disclaimer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Lock(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
