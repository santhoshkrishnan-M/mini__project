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
  Info,
  MessageSquare,
  X,
  Send,
  User
} from 'lucide-react';
import { getInvestmentGuidance, chatWithFinora } from '../services/gemini';
import { InvestmentGuidance, Language, UserProfile } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type InvestmentType = "SIP" | "SWP" | "FD" | "Mutual Funds";

interface InvestmentHubProps {
  t: any;
  setLanguage: (lang: Language) => void;
  currentLanguage: Language;
}

export default function InvestmentHub({ t, setLanguage, currentLanguage }: InvestmentHubProps) {
  const [activeType, setActiveType] = useState<InvestmentType>("SIP");
  const [guidance, setGuidance] = useState<InvestmentGuidance | null>(null);
  const [loading, setLoading] = useState(true);

  // Calculator states
  const [amount, setAmount] = useState(5000);
  const [tenure, setTenure] = useState(5);
  const [rate, setRate] = useState(12);

  // Chat states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model'; parts: { text: string }[] }[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Get profile from localStorage
  const profile: UserProfile = (() => {
    const saved = localStorage.getItem('finora_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, language: currentLanguage };
    }
    return {
      age: 30,
      monthlyIncome: 50000,
      monthlyExpenses: 30000,
      currentSavings: 100000,
      existingInvestments: 50000,
      debt: 0,
      dependents: 2,
      financialGoals: 'Build long-term wealth and save for retirement',
      riskTolerance: 'Medium' as any,
      language: currentLanguage,
    };
  })();

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

  const handleSendMessage = async () => {
    if (!currentInput.trim() || isChatLoading) return;
    
    const userMessage = currentInput.trim();
    setCurrentInput('');
    
    const newMessages = [
      ...chatMessages,
      { role: 'user' as const, parts: [{ text: userMessage }] }
    ];
    setChatMessages(newMessages);
    setIsChatLoading(true);

    try {
      const response = await chatWithFinora(profile, userMessage, chatMessages);
      setChatMessages([
        ...newMessages,
        { role: 'model' as const, parts: [{ text: response }] }
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages([
        ...newMessages,
        { role: 'model' as const, parts: [{ text: 'Sorry, I encountered an error. Please try again.' }] }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

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
    } else if (activeType === "SWP") {
      const i = (rate / 100) / 12;
      const n = tenure * 12;
      const totalValue = amount * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
      const invested = amount * n;
      return { totalValue, invested, returns: totalValue - invested };
    } else if (activeType === "Mutual Funds") {
      const i = (rate / 100) / 12;
      const n = tenure * 12;
      const totalValue = amount * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
      const invested = amount * n;
      return { totalValue, invested, returns: totalValue - invested };
    }
    return { totalValue: 0, invested: 0, returns: 0 };
  };

  const results = calculateReturns();

  const investmentCards = [
    { id: "SIP", name: "SIP", icon: <Target />, desc: t.sipDesc },
    { id: "SWP", name: "SWP", icon: <History />, desc: t.swpDesc },
    { id: "FD", name: "FD", icon: <Lock />, desc: t.fdDesc },
    { id: "Mutual Funds", name: "MF", icon: <Briefcase />, desc: t.mfDesc },
  ];

  // Investment Strategies for each type
  const investmentStrategies: Record<InvestmentType, {
    statement: string;
    strategies: string[];
  }> = {
    "SIP": {
      statement: t.sipStatement,
      strategies: [
        t.sipStrategy1,
        t.sipStrategy2,
        t.sipStrategy3,
        t.sipStrategy4,
        t.sipStrategy5,
        t.sipStrategy6
      ]
    },
    "SWP": {
      statement: t.swpStatement,
      strategies: [
        t.swpStrategy1,
        t.swpStrategy2,
        t.swpStrategy3,
        t.swpStrategy4,
        t.swpStrategy5,
        t.swpStrategy6
      ]
    },
    "FD": {
      statement: t.fdStatement,
      strategies: [
        t.fdStrategy1,
        t.fdStrategy2,
        t.fdStrategy3,
        t.fdStrategy4,
        t.fdStrategy5,
        t.fdStrategy6
      ]
    },
    "Mutual Funds": {
      statement: t.mfStatement,
      strategies: [
        t.mfStrategy1,
        t.mfStrategy2,
        t.mfStrategy3,
        t.mfStrategy4,
        t.mfStrategy5,
        t.mfStrategy6
      ]
    }
  };

  const currentStrategy = investmentStrategies[activeType];

  // Calculate Personalized Investment Plan
  const monthlySavings = profile.monthlyIncome - profile.monthlyExpenses;
  const emergencyFundNeeded = profile.monthlyExpenses * 6;
  const hasEmergencyFund = profile.currentSavings >= emergencyFundNeeded;
  
  const personalizedPlan = {
    recommendedMonthlyInvestment: Math.floor(monthlySavings * 0.3),
    emergencyFundStatus: hasEmergencyFund ? 'Complete' : 'Build First',
    emergencyFundGap: hasEmergencyFund ? 0 : emergencyFundNeeded - profile.currentSavings,
    investmentAllocation: {
      sip: Math.floor(monthlySavings * 0.20),
      fd: Math.floor(monthlySavings * 0.05),
      mutualFunds: Math.floor(monthlySavings * 0.05),
    }
  };

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

      {/* Investment Strategy Section */}
      <motion.div
        key={activeType}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 shadow-sm border border-blue-100"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="text-white" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">
              {t.smartStrategy?.replace('{type}', activeType) || `Smart ${activeType} Investment Strategy`}
            </h3>
            <p className="text-gray-700 text-base leading-relaxed">
              {currentStrategy.statement}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="text-blue-600" size={20} />
            {t.effectiveStrategies}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentStrategy.strategies.map((strategy, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-transparent hover:from-blue-100 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed font-medium">
                  {strategy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Personalized Investment Plan */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-serif font-bold text-gray-900">{t.personalizedInvestmentPlan}</h2>
                <p className="text-gray-500 mt-2">{t.basedOnProfile}</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-[#006A4E] flex items-center justify-center">
                <User className="text-white" size={32} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                <div className="text-sm text-green-700 font-bold mb-2">{t.monthlySavingsAvailable}</div>
                <div className="text-3xl font-bold text-green-900">₹{monthlySavings.toLocaleString()}</div>
                <div className="text-xs text-green-600 mt-1">{t.incomeMinusExpenses}</div>
              </div>
              
              <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                <div className="text-sm text-blue-700 font-bold mb-2">{t.recommendedMonthly}</div>
                <div className="text-3xl font-bold text-blue-900">₹{personalizedPlan.recommendedMonthlyInvestment.toLocaleString()}</div>
                <div className="text-xs text-blue-600 mt-1">{t.percentOfSavings}</div>
              </div>

              <div className={cn(
                "p-5 rounded-2xl border",
                hasEmergencyFund 
                  ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200" 
                  : "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200"
              )}>
                <div className={cn(
                  "text-sm font-bold mb-2",
                  hasEmergencyFund ? "text-green-700" : "text-amber-700"
                )}>{t.emergencyFundStatus}</div>
                <div className={cn(
                  "text-2xl font-bold",
                  hasEmergencyFund ? "text-green-900" : "text-amber-900"
                )}>{hasEmergencyFund ? t.complete : t.buildFirst}</div>
                <div className={cn(
                  "text-xs mt-1",
                  hasEmergencyFund ? "text-green-600" : "text-amber-600"
                )}>
                  {hasEmergencyFund ? t.fullyFunded : t.needAmount?.replace('{amount}', personalizedPlan.emergencyFundGap.toLocaleString())}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#006A4E] to-[#005a42] rounded-3xl p-8 text-white shadow-xl">
              <h3 className="text-2xl font-serif font-bold mb-4 flex items-center gap-3">
                <Zap className="text-yellow-400" size={28} />
                {t.efficientAllocation}
              </h3>
              <p className="text-white/90 mb-6 leading-relaxed">
                {t.maximizeWealth}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <Target className="text-yellow-400" size={24} />
                    <div className="text-sm font-bold">{t.sipEquity}</div>
                  </div>
                  <div className="text-3xl font-bold mb-1">₹{personalizedPlan.investmentAllocation.sip.toLocaleString()}</div>
                  <div className="text-xs text-white/70">{t.longTermWealth}</div>
                  <div className="mt-3 text-xs bg-white/10 rounded-lg px-3 py-2">
                    {t.expectedText?.replace('{rate}', '12-15%')}
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <ShieldCheck className="text-yellow-400" size={24} />
                    <div className="text-sm font-bold">{t.fixedDeposit}</div>
                  </div>
                  <div className="text-3xl font-bold mb-1">₹{personalizedPlan.investmentAllocation.fd.toLocaleString()}</div>
                  <div className="text-xs text-white/70">{t.stableReturns}</div>
                  <div className="mt-3 text-xs bg-white/10 rounded-lg px-3 py-2">
                    {t.expectedText?.replace('{rate}', '6-8%')}
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <Briefcase className="text-yellow-400" size={24} />
                    <div className="text-sm font-bold">{t.mutualFunds}</div>
                  </div>
                  <div className="text-3xl font-bold mb-1">₹{personalizedPlan.investmentAllocation.mutualFunds.toLocaleString()}</div>
                  <div className="text-xs text-white/70">{t.balancedGrowth}</div>
                  <div className="mt-3 text-xs bg-white/10 rounded-lg px-3 py-2">
                    {t.expectedText?.replace('{rate}', '10-12%')}
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="flex items-start gap-3">
                  <Info className="text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
                  <div className="text-xs text-white/90 leading-relaxed">
                    <strong>{t.proTip}</strong> {hasEmergencyFund 
                      ? t.proTipEmergency
                      : t.proTipNoEmergency}
                  </div>
                </div>
              </div>
            </div>
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
                  <span className="text-sm font-bold text-gray-900">{t.totalValue}</span>
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

      {/* AI Investment Assistant Chat Button */}
      <button 
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-[#006A4E] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-40"
        title={t.chatWithInvestmentAssistant || "Chat with Investment Assistant"}
      >
        <MessageSquare size={28} />
      </button>

      {/* Chat Interface */}
      <AnimatePresence>
        {isChatOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChatOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="p-6 border-b flex justify-between items-center bg-[#006A4E] text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Zap size={20} className="text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-bold">{t.investmentAssistant || 'Investment Assistant'}</h3>
                    <p className="text-xs text-white/60">{t.yourInvestmentAdvisor || 'Your Investment Advisor'}</p>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                {chatMessages.length === 0 && (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 text-[#006A4E]">
                      <MessageSquare size={32} />
                    </div>
                    <p className="text-gray-500 text-sm px-10 font-medium">
                      {t.askAboutInvestments || 'Ask me anything about investments, SIP, mutual funds, or financial planning!'}
                    </p>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={cn(
                    "flex flex-col max-w-[85%] space-y-1",
                    msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}>
                    <div className={cn(
                      "px-4 py-3 rounded-2xl text-sm leading-relaxed font-medium",
                      msg.role === 'user' 
                        ? "bg-[#006A4E] text-white rounded-tr-none shadow-sm" 
                        : "bg-white text-gray-800 rounded-tl-none shadow-sm border border-gray-100"
                    )}>
                      {msg.parts[0].text}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex items-center gap-2 text-gray-400 text-xs font-bold">
                    <Loader2 size={12} className="animate-spin" />
                    <span>{t.thinking?.toUpperCase() || 'THINKING...'}</span>
                  </div>
                )}
              </div>

              <div className="p-4 bg-white border-t">
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={t.askAboutInvestmentsInput || 'Ask about investments...'}
                    className="flex-1 px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#006A4E]/20 focus:border-[#006A4E] transition-all"
                    disabled={isChatLoading}
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!currentInput.trim() || isChatLoading}
                    className="px-6 py-3 bg-[#006A4E] text-white rounded-2xl hover:bg-[#005a42] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
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
