/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, 
  TrendingUp, 
  ShieldAlert, 
  BookOpen, 
  MessageSquare, 
  User, 
  ChevronRight,
  ArrowLeft,
  Loader2,
  IndianRupee,
  AlertCircle,
  CheckCircle2,
  PieChart as PieChartIcon,
  LayoutDashboard,
  Search,
  Briefcase,
  PiggyBank,
  Menu,
  X,
  Zap,
  Bell,
  Languages,
  Globe
} from 'lucide-react';
import { UserProfile, FinancialAdvice, Language, RiskTolerance } from './types';
import { getFinancialAdvice, chatWithFinora } from './services/gemini';
import { TRANSLATIONS } from './constants';
import Dashboard from './components/Dashboard';
import MarketExplorer from './components/MarketExplorer';
import Portfolio from './components/Portfolio';
import InvestmentHub from './components/InvestmentHub';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type AppStep = 'welcome' | 'profile' | 'loading' | 'main';
type MainTab = 'dashboard' | 'market' | 'portfolio' | 'investments';

export default function App() {
  const [step, setStep] = useState<AppStep>('welcome');
  const [activeTab, setActiveTab] = useState<MainTab>('dashboard');
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('finora_language');
    return saved ? (saved as Language) : Language.ENGLISH;
  });
  const t = TRANSLATIONS[language];
  
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('finora_profile');
    return saved ? JSON.parse(saved) : {
      age: 30,
      monthlyIncome: 50000,
      monthlyExpenses: 30000,
      currentSavings: 100000,
      existingInvestments: 50000,
      debt: 0,
      dependents: 2,
      financialGoals: 'Build long-term wealth and save for retirement',
      riskTolerance: RiskTolerance.MEDIUM,
      language: Language.ENGLISH,
    };
  });

  const [advice, setAdvice] = useState<FinancialAdvice | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model'; parts: { text: string }[] }[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('finora_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('finora_language', language);
  }, [language]);

  const handleStart = () => {
    setStep('profile');
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStep('loading');
    try {
      console.log('Fetching financial advice with profile:', profile);
      const result = await getFinancialAdvice({ ...profile, language });
      console.log('Received advice:', result);
      setAdvice(result);
      setStep('main');
    } catch (error) {
      console.error('Error getting advice:', error);
      // If quota exceeded, provide default advice and continue
      if (error instanceof Error && (error.message.includes('quota') || error.message.includes('429'))) {
        setAdvice(getDefaultAdvice(profile));
        setError(t.aiQuotaExceeded);
        setStep('main');
      } else {
        setError(t.failedToGenerateAdvice);
        setStep('profile');
      }
    }
  };

  const handleSkipAI = () => {
    setAdvice(getDefaultAdvice(profile));
    setError(null);
    setStep('main');
  };

  const getDefaultAdvice = (profile: UserProfile) => {
    const monthlySavings = profile.monthlyIncome - profile.monthlyExpenses;
    const emergencyFund = profile.monthlyExpenses * 6;
    const suggestedSIP = Math.floor(monthlySavings * 0.3);
    
    return {
      healthScore: 65,
      recommendedMonthlySavings: monthlySavings,
      suggestedSIPAmount: suggestedSIP,
      emergencyFundTarget: emergencyFund,
      budgetPlan: {
        necessities: profile.monthlyExpenses,
        wants: Math.floor(monthlySavings * 0.3),
        savings: Math.floor(monthlySavings * 0.7)
      },
      investmentSuggestions: [
        'Consider starting a SIP in index funds',
        'Build emergency fund covering 6 months expenses',
        'Diversify across equity, debt, and gold',
        'Review and rebalance portfolio quarterly'
      ],
      retirementReadiness: 'Start investing early for long-term wealth',
      riskWarnings: profile.debt > 0 ? ['Pay off high-interest debt first'] : ['Avoid taking unnecessary debt'],
      fraudAwarenessTips: [
        'Never share OTP or bank passwords',
        'Verify investment schemes with SEBI',
        'Beware of guaranteed return promises'
      ],
      keyAdvice: `With ₹${monthlySavings.toLocaleString('en-IN')} monthly savings, focus on building emergency fund and systematic investing.`,
      nextBestAction: 'Start with emergency fund, then begin SIP investments'
    };
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim() || isChatLoading) return;

    const userMessage = currentInput;
    setCurrentInput('');
    setChatMessages(prev => [...prev, { role: 'user', parts: [{ text: userMessage }] }]);
    setIsChatLoading(true);

    try {
      const response = await chatWithFinora({ ...profile, language }, userMessage, chatMessages);
      setChatMessages(prev => [...prev, { role: 'model', parts: [{ text: response || 'I am sorry, I could not process that.' }] }]);
    } catch (error) {
      console.error('Chat error:', error);
      // Provide fallback response on quota error
      const fallbackMsg = 'AI chat is temporarily unavailable due to quota limits. However, you can still use Market Explorer, Portfolio, and other core features!';
      setChatMessages(prev => [...prev, { role: 'model', parts: [{ text: fallbackMsg }] }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const navItems = [
    { id: 'dashboard', label: t.marketOverview, icon: <LayoutDashboard size={20} /> },
    { id: 'market', label: t.marketSentiment, icon: <Search size={20} /> },
    { id: 'portfolio', label: t.portfolioHoldings, icon: <Briefcase size={20} /> },
    { id: 'investments', label: t.investmentPlanning, icon: <PiggyBank size={20} /> },
  ];

  const languageDisplayNames: Record<Language, string> = {
    [Language.ENGLISH]: "English",
    [Language.HINDI]: "हिन्दी (Hindi)",
    [Language.TAMIL]: "தமிழ் (Tamil)",
    [Language.TELUGU]: "తెలుగు (Telugu)",
    [Language.KANNADA]: "ಕನ್ನಡ (Kannada)",
    [Language.MALAYALAM]: "മലയാളം (Malayalam)",
    [Language.MARATHI]: "मराठी (Marathi)",
    [Language.BENGALI]: "বাংলা (Bengali)",
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {step === 'main' && (
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#006A4E] rounded-xl flex items-center justify-center text-white shadow-lg">
              <TrendingUp size={24} />
            </div>
            <span className="text-2xl font-serif font-bold tracking-tight text-[#006A4E]">FINORA</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {step === 'main' && (
            <>
              <div className="hidden md:flex items-center gap-1 p-1 bg-gray-100 rounded-2xl">
                {navItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as MainTab)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                      activeTab === item.id ? "bg-white shadow-sm text-[#006A4E]" : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
              <button className="p-2 text-gray-400 hover:text-[#006A4E] relative">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button>
            </>
          )}
          
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 rounded-2xl transition-all text-sm font-bold text-gray-700 shadow-sm border border-gray-100 hover:border-[#006A4E]/30">
              <Globe size={18} className="text-[#006A4E]" />
              <span className="hidden sm:inline">{languageDisplayNames[language]}</span>
              <span className="sm:hidden">{language}</span>
              <ChevronRight size={16} className="rotate-90 text-gray-400" />
            </button>
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-3xl shadow-2xl border border-gray-100 py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 max-h-96 overflow-y-auto">
              <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 mb-2">
                {t.preferredLanguage || 'Select Language'}
              </div>
              {Object.values(Language).map(lang => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang as Language)}
                  className={cn(
                    "w-full text-left px-4 py-3 text-sm font-medium hover:bg-gray-50 transition-all flex items-center justify-between group/item",
                    language === lang ? "text-[#006A4E] bg-green-50 font-bold" : "text-gray-700"
                  )}
                >
                  <span>{languageDisplayNames[lang]}</span>
                  {language === lang && (
                    <CheckCircle2 size={16} className="text-[#006A4E]" />
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {step === 'main' && (
            <button 
              onClick={() => setStep('profile')}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <User size={20} />
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && step === 'main' && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-white z-50 shadow-2xl p-6 lg:hidden"
            >
              <div className="flex items-center gap-2 mb-10">
                <div className="w-8 h-8 bg-[#006A4E] rounded-lg flex items-center justify-center text-white">
                  <TrendingUp size={20} />
                </div>
                <span className="text-xl font-serif font-bold text-[#006A4E]">FINORA</span>
              </div>
              <div className="space-y-2">
                {navItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id as MainTab); setIsSidebarOpen(false); }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                      activeTab === item.id ? "bg-[#006A4E] text-white shadow-lg shadow-[#006A4E]/20" : "text-gray-500 hover:bg-gray-50"
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-grow max-w-7xl mx-auto px-6 py-8 w-full">
        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <motion.div 
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center text-center py-20"
            >
              <div className="inline-block px-4 py-1.5 bg-[#006A4E]/10 rounded-full text-[#006A4E] text-sm font-bold mb-6">
                {t.poweredBy}
              </div>
              <h1 className="text-6xl font-serif font-bold mb-6 leading-tight max-w-3xl text-gray-900">
                {t.heroTitle}
              </h1>
              <p className="text-xl text-gray-500 mb-10 max-w-2xl">
                {t.heroDesc}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 w-full max-w-4xl">
                {[
                  { icon: <Zap />, title: t.aiTradingAssistant, desc: t.aiAdvice },
                  { icon: <TrendingUp />, title: t.marketOverview, desc: t.marketSentiment },
                  { icon: <ShieldAlert />, title: t.securePrivate, desc: t.disclaimer }
                ].map((feature, i) => (
                  <div key={i} className="p-8 rounded-[32px] bg-white border border-gray-100 shadow-sm text-left hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 text-[#006A4E]">
                      {feature.icon}
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-gray-900">{feature.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={handleStart}
                className="px-10 py-4 bg-[#006A4E] text-white rounded-2xl font-bold text-lg shadow-xl shadow-[#006A4E]/20 hover:scale-105 transition-all flex items-center gap-2"
              >
                {t.getStarted}
                <ChevronRight size={20} />
              </button>
            </motion.div>
          )}

          {step === 'profile' && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto"
            >
              <button 
                onClick={() => setStep('welcome')}
                className="flex items-center gap-2 text-gray-500 hover:text-black mb-8 transition-colors"
              >
                <ArrowLeft size={18} />
                <span>Back</span>
              </button>

              <div className="bg-white rounded-[40px] p-10 shadow-xl border border-gray-100">
                <h2 className="text-3xl font-serif font-bold mb-2">{t.yourFinancialProfile}</h2>
                <p className="text-gray-500 mb-8">{t.helpFinoraUnderstand}</p>

                <form onSubmit={handleSubmitProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">{t.age}</label>
                      <input 
                        type="number" 
                        value={profile.age}
                        onChange={e => setProfile({...profile, age: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-[#006A4E] outline-none transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">{t.monthlyIncome}</label>
                      <input 
                        type="number" 
                        value={profile.monthlyIncome}
                        onChange={e => setProfile({...profile, monthlyIncome: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-[#006A4E] outline-none transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">{t.monthlyExpenses}</label>
                      <input 
                        type="number" 
                        value={profile.monthlyExpenses}
                        onChange={e => setProfile({...profile, monthlyExpenses: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-[#006A4E] outline-none transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">{t.currentSavings}</label>
                      <input 
                        type="number" 
                        value={profile.currentSavings}
                        onChange={e => setProfile({...profile, currentSavings: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-[#006A4E] outline-none transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">{t.debt}</label>
                      <input 
                        type="number" 
                        value={profile.debt}
                        onChange={e => setProfile({...profile, debt: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-[#006A4E] outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">{t.riskTolerance}</label>
                      <select 
                        value={profile.riskTolerance}
                        onChange={e => setProfile({...profile, riskTolerance: e.target.value as RiskTolerance})}
                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-[#006A4E] outline-none transition-all font-bold"
                      >
                        {Object.values(RiskTolerance).map(rt => (
                          <option key={rt} value={rt}>{rt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">{t.financialGoals}</label>
                    <textarea 
                      value={profile.financialGoals}
                      onChange={e => setProfile({...profile, financialGoals: e.target.value})}
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-[#006A4E] outline-none transition-all h-24 resize-none"
                    />
                  </div>

                  {error && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                      <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-amber-900 mb-1">Notice</p>
                        <p className="text-sm text-amber-700">{error}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button 
                      type="submit"
                      className="flex-1 bg-[#006A4E] text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-[#006A4E]/20 hover:bg-[#005a42] transition-all flex items-center justify-center gap-2"
                    >
                      <span>{t.analyzeContinue}</span>
                      <ChevronRight size={20} />
                    </button>
                    <button 
                      type="button"
                      onClick={handleSkipAI}
                      className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-2xl font-bold text-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                    >
                      <span>{t.skipAIAnalysis}</span>
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {step === 'loading' && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-40 text-center"
            >
              <div className="relative">
                <Loader2 className="animate-spin text-[#006A4E]" size={64} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <TrendingUp size={24} className="text-[#006A4E]" />
                </div>
              </div>
              <h2 className="text-2xl font-serif font-bold mt-8 mb-2">Analyzing Your Profile</h2>
              <p className="text-gray-500">Generating personalized insights with Gemini 2.0 Flash...</p>
            </motion.div>
          )}

          {step === 'main' && (
            <motion.div 
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {activeTab === 'dashboard' && <Dashboard t={t} setLanguage={setLanguage} currentLanguage={language} />}
              {activeTab === 'market' && <MarketExplorer t={t} setLanguage={setLanguage} currentLanguage={language} />}
              {activeTab === 'portfolio' && <Portfolio t={t} setLanguage={setLanguage} currentLanguage={language} />}
              {activeTab === 'investments' && <InvestmentHub t={t} setLanguage={setLanguage} currentLanguage={language} />}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Chat Toggle */}
      {step === 'main' && (
        <button 
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-[#006A4E] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-40"
        >
          <MessageSquare size={28} />
        </button>
      )}

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
                    <h3 className="font-bold">Finora AI</h3>
                    <p className="text-xs text-white/60">Your Intelligent Financial Mentor</p>
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
                      {t.askAnything}
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
                    <span>{t.thinking.toUpperCase()}</span>
                  </div>
                )}
              </div>

              <div className="p-4 bg-white border-t">
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={currentInput}
                    onChange={e => setCurrentInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    placeholder={t.askFinora}
                    className="flex-1 px-4 py-3 rounded-xl bg-gray-100 border-transparent focus:bg-white focus:border-[#006A4E] outline-none transition-all text-sm font-medium"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={isChatLoading || !currentInput.trim()}
                    className="w-12 h-12 bg-[#006A4E] text-white rounded-xl flex items-center justify-center hover:bg-[#005a42] transition-colors disabled:opacity-50"
                  >
                    <TrendingUp size={20} className="rotate-90" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#006A4E] rounded-lg flex items-center justify-center text-white">
              <TrendingUp size={18} />
            </div>
            <span className="text-xl font-serif font-bold text-[#006A4E]">FINORA</span>
          </div>
          <div className="flex gap-8 text-sm font-bold text-gray-400">
            <a href="#" className="hover:text-[#006A4E]">Privacy</a>
            <a href="#" className="hover:text-[#006A4E]">Terms</a>
            <a href="#" className="hover:text-[#006A4E]">Security</a>
            <a href="#" className="hover:text-[#006A4E]">Support</a>
          </div>
          <p className="text-xs text-gray-400 font-medium">
            © 2026 FINORA. Powered by Gemini 2.0 Flash.
          </p>
        </div>
      </footer>
    </div>
  );
}
