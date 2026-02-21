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
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  Legend
} from 'recharts';
import { UserProfile, FinancialAdvice, Language, RiskTolerance } from './types';
import { getFinancialAdvice, chatWithFinora } from './services/gemini';
import { TRANSLATIONS } from './constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [step, setStep] = useState<'welcome' | 'profile' | 'loading' | 'dashboard'>('welcome');
  const [language, setLanguage] = useState<Language>(Language.ENGLISH);
  const t = TRANSLATIONS[language];
  const [profile, setProfile] = useState<UserProfile>({
    age: 30,
    monthlyIncome: 50000,
    monthlyExpenses: 30000,
    currentSavings: 100000,
    existingInvestments: 50000,
    debt: 0,
    dependents: 2,
    financialGoals: 'Buy a house in 10 years, save for children education',
    riskTolerance: RiskTolerance.MEDIUM,
    language: Language.ENGLISH,
  });
  const [advice, setAdvice] = useState<FinancialAdvice | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model'; parts: { text: string }[] }[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleStart = () => {
    setStep('profile');
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');
    try {
      const result = await getFinancialAdvice({ ...profile, language });
      setAdvice(result);
      setStep('dashboard');
    } catch (error) {
      console.error('Error getting advice:', error);
      setStep('profile');
    }
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
    } finally {
      setIsChatLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#006A4E] rounded-xl flex items-center justify-center text-white shadow-lg">
            <TrendingUp size={24} />
          </div>
          <span className="text-2xl font-serif font-bold tracking-tight indian-accent">{t.appName}</span>
        </div>
        
        {step === 'dashboard' && (
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setStep('profile')}
              className="p-2 hover:bg-black/5 rounded-full transition-colors"
            >
              <User size={20} />
            </button>
            <div className="h-6 w-px bg-black/10" />
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
            >
              {Object.values(Language).map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <motion.div 
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center text-center py-20"
            >
              <div className="inline-block px-4 py-1.5 bg-[#006A4E]/10 rounded-full text-[#006A4E] text-sm font-semibold mb-6">
                {t.tagline}
              </div>
              <h1 className="text-6xl font-serif font-bold mb-6 leading-tight max-w-3xl">
                {t.heroTitle.split('native language')[0]}<span className="indian-accent">{language === Language.ENGLISH ? 'native language' : ''}</span>{t.heroTitle.split('native language')[1] || ''}
                {language !== Language.ENGLISH && t.heroTitle}
              </h1>
              <p className="text-xl text-gray-600 mb-10 max-w-2xl">
                {t.heroDesc}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 w-full max-w-4xl">
                {[
                  { icon: <Wallet />, title: t.smartBudgeting, desc: t.smartBudgetingDesc },
                  { icon: <TrendingUp />, title: t.safeInvesting, desc: t.safeInvestingDesc },
                  { icon: <ShieldAlert />, title: t.fraudProtection, desc: t.fraudProtectionDesc }
                ].map((feature, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm text-left">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4 text-[#006A4E]">
                      {feature.icon}
                    </div>
                    <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center gap-4">
                <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">{t.selectLanguage}</p>
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                  {Object.values(Language).map(lang => (
                    <button
                      key={lang}
                      onClick={() => { setLanguage(lang); handleStart(); }}
                      className={cn(
                        "px-6 py-2.5 rounded-full border transition-all font-medium",
                        language === lang 
                          ? "bg-[#006A4E] text-white border-[#006A4E] shadow-md" 
                          : "bg-white text-gray-600 border-gray-200 hover:border-[#006A4E]/30"
                      )}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
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
                <span>{t.back}</span>
              </button>

              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                <h2 className="text-3xl font-serif font-bold mb-2">{t.profileTitle}</h2>
                <p className="text-gray-500 mb-8">{t.profileDesc}</p>

                <form onSubmit={handleSubmitProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">{t.age}</label>
                      <input 
                        type="number" 
                        value={profile.age}
                        onChange={e => setProfile({...profile, age: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#006A4E] focus:ring-1 focus:ring-[#006A4E] outline-none transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">{t.monthlyIncome}</label>
                      <input 
                        type="number" 
                        value={profile.monthlyIncome}
                        onChange={e => setProfile({...profile, monthlyIncome: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#006A4E] focus:ring-1 focus:ring-[#006A4E] outline-none transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">{t.monthlyExpenses}</label>
                      <input 
                        type="number" 
                        value={profile.monthlyExpenses}
                        onChange={e => setProfile({...profile, monthlyExpenses: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#006A4E] focus:ring-1 focus:ring-[#006A4E] outline-none transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">{t.currentSavings}</label>
                      <input 
                        type="number" 
                        value={profile.currentSavings}
                        onChange={e => setProfile({...profile, currentSavings: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#006A4E] focus:ring-1 focus:ring-[#006A4E] outline-none transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">{t.debt}</label>
                      <input 
                        type="number" 
                        value={profile.debt}
                        onChange={e => setProfile({...profile, debt: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#006A4E] focus:ring-1 focus:ring-[#006A4E] outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">{t.riskTolerance}</label>
                      <select 
                        value={profile.riskTolerance}
                        onChange={e => setProfile({...profile, riskTolerance: e.target.value as RiskTolerance})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#006A4E] focus:ring-1 focus:ring-[#006A4E] outline-none transition-all"
                      >
                        {Object.values(RiskTolerance).map(rt => (
                          <option key={rt} value={rt}>{rt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">{t.financialGoals}</label>
                    <textarea 
                      value={profile.financialGoals}
                      onChange={e => setProfile({...profile, financialGoals: e.target.value})}
                      placeholder={t.goalsPlaceholder}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#006A4E] focus:ring-1 focus:ring-[#006A4E] outline-none transition-all h-24 resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-[#006A4E] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-[#005a42] transition-all flex items-center justify-center gap-2"
                  >
                    <span>{t.getPlan}</span>
                    <ChevronRight size={20} />
                  </button>
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
              <h2 className="text-2xl font-serif font-bold mt-8 mb-2">{t.analyzing}</h2>
              <p className="text-gray-500">{t.creatingPlan} {language}.</p>
            </motion.div>
          )}

          {step === 'dashboard' && advice && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Header Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
                  <span className="text-gray-400 text-sm font-semibold uppercase tracking-wider">{t.healthScore}</span>
                  <div className="flex items-end gap-2 mt-2">
                    <span className={cn(
                      "text-5xl font-serif font-bold",
                      advice.healthScore > 70 ? "text-green-600" : advice.healthScore > 40 ? "text-yellow-600" : "text-red-600"
                    )}>{advice.healthScore}</span>
                    <span className="text-gray-400 mb-2">/ 100</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full mt-4 overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full",
                        advice.healthScore > 70 ? "bg-green-500" : advice.healthScore > 40 ? "bg-yellow-500" : "bg-red-500"
                      )}
                      style={{ width: `${advice.healthScore}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                  <span className="text-gray-400 text-sm font-semibold uppercase tracking-wider">{t.emergencyFund}</span>
                  <div className="text-3xl font-bold mt-2">{formatCurrency(advice.emergencyFundTarget)}</div>
                  <p className="text-xs text-gray-500 mt-2">{t.emergencyFundDesc}</p>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                  <span className="text-gray-400 text-sm font-semibold uppercase tracking-wider">{t.suggestedSIP}</span>
                  <div className="text-3xl font-bold mt-2 text-[#006A4E]">{formatCurrency(advice.suggestedSIPAmount)}</div>
                  <p className="text-xs text-gray-500 mt-2">{t.suggestedSIPDesc}</p>
                </div>

                <div className="bg-[#006A4E] p-6 rounded-3xl shadow-lg text-white">
                  <span className="text-white/60 text-sm font-semibold uppercase tracking-wider">{t.nextAction}</span>
                  <p className="mt-2 font-medium leading-tight">{advice.nextBestAction}</p>
                  <button className="mt-4 text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1">
                    <span>{t.takeAction}</span>
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Budget Plan */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-serif font-bold flex items-center gap-2">
                      <PieChartIcon className="indian-accent" />
                      {t.budgetPlanTitle}
                    </h3>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#006A4E]" />
                        <span className="text-xs text-gray-500">{t.savings}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#F27D26]" />
                        <span className="text-xs text-gray-500">{t.necessities}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#FFD700]" />
                        <span className="text-xs text-gray-500">{t.wants}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: t.necessities, value: advice.budgetPlan.necessities },
                              { name: t.wants, value: advice.budgetPlan.wants },
                              { name: t.savings, value: advice.budgetPlan.savings },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            <Cell fill="#F27D26" />
                            <Cell fill="#FFD700" />
                            <Cell fill="#006A4E" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-semibold">{t.necessities}</span>
                          <span className="text-sm font-bold">{formatCurrency(advice.budgetPlan.necessities)}</span>
                        </div>
                        <p className="text-xs text-gray-500">{t.necessitiesDesc}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-semibold">{t.wants}</span>
                          <span className="text-sm font-bold">{formatCurrency(advice.budgetPlan.wants)}</span>
                        </div>
                        <p className="text-xs text-gray-500">{t.wantsDesc}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-semibold">{t.savings}</span>
                          <span className="text-sm font-bold text-[#006A4E]">{formatCurrency(advice.budgetPlan.savings)}</span>
                        </div>
                        <p className="text-xs text-gray-500">{t.savingsDesc}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk & Fraud */}
                <div className="space-y-6">
                  <div className="bg-red-50 rounded-3xl p-6 border border-red-100">
                    <h4 className="text-red-700 font-bold flex items-center gap-2 mb-4">
                      <AlertCircle size={20} />
                      {t.riskWarnings}
                    </h4>
                    <ul className="space-y-3">
                      {advice.riskWarnings.map((warning, i) => (
                        <li key={i} className="text-sm text-red-600 flex gap-2">
                          <span className="mt-1">•</span>
                          <span>{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100">
                    <h4 className="text-blue-700 font-bold flex items-center gap-2 mb-4">
                      <ShieldAlert size={20} />
                      {t.fraudAwareness}
                    </h4>
                    <ul className="space-y-3">
                      {advice.fraudAwarenessTips.map((tip, i) => (
                        <li key={i} className="text-sm text-blue-600 flex gap-2">
                          <span className="mt-1">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Investment Suggestions */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                  <h3 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
                    <TrendingUp className="indian-accent" />
                    {t.investmentStrategy}
                  </h3>
                  <div className="space-y-4">
                    {advice.investmentSuggestions.map((suggestion, i) => (
                      <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                        <div className="w-8 h-8 rounded-full bg-[#006A4E]/10 flex items-center justify-center text-[#006A4E] shrink-0 font-bold">
                          {i + 1}
                        </div>
                        <p className="text-gray-700 leading-relaxed">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Advice & Retirement */}
                <div className="space-y-8">
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-2xl font-serif font-bold mb-4 flex items-center gap-2">
                      <BookOpen className="indian-accent" />
                      {t.mentorAdvice}
                    </h3>
                    <p className="text-gray-700 leading-relaxed italic">
                      "{advice.keyAdvice}"
                    </p>
                  </div>

                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-serif font-bold mb-2">{t.retirementReadiness}</h3>
                    <p className="text-gray-600">{advice.retirementReadiness}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Chat Toggle */}
      {step === 'dashboard' && (
        <button 
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-[#006A4E] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-40"
        >
          <MessageSquare size={28} />
        </button>
      )}

      {/* Chat Interface */}
      <AnimatePresence>
        {isChatOpen && (step === 'dashboard' || step === 'profile') && (
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
              <div className="p-6 border-bottom flex justify-between items-center bg-[#006A4E] text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold">{t.chatTitle}</h3>
                    <p className="text-xs text-white/60">{t.chatSubtitle}</p>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                  <ChevronRight size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                {chatMessages.length === 0 && (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 text-[#006A4E]">
                      <MessageSquare size={32} />
                    </div>
                    <p className="text-gray-500 text-sm px-10">
                      {t.chatIntro} {language}.
                    </p>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={cn(
                    "flex flex-col max-w-[85%] space-y-1",
                    msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}>
                    <div className={cn(
                      "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                      msg.role === 'user' 
                        ? "bg-[#006A4E] text-white rounded-tr-none shadow-sm" 
                        : "bg-white text-gray-800 rounded-tl-none shadow-sm border border-gray-100"
                    )}>
                      {msg.parts[0].text}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <Loader2 size={12} className="animate-spin" />
                    <span>{t.thinking}</span>
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
                    placeholder={t.chatPlaceholder}
                    className="flex-1 px-4 py-3 rounded-xl bg-gray-100 border-transparent focus:bg-white focus:border-[#006A4E] focus:ring-0 outline-none transition-all text-sm"
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
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-gray-200 mt-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#006A4E] rounded-lg flex items-center justify-center text-white">
                <TrendingUp size={18} />
              </div>
              <span className="text-xl font-serif font-bold tracking-tight indian-accent">{t.appName}</span>
            </div>
            <p className="text-gray-500 max-w-sm mb-6">
              {t.footerDesc}
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-[#006A4E] cursor-pointer transition-colors">
                <IndianRupee size={20} />
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-[#006A4E] cursor-pointer transition-colors">
                <ShieldAlert size={20} />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">{t.resources}</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="hover:text-[#006A4E] cursor-pointer">{t.literacyHub}</li>
              <li className="hover:text-[#006A4E] cursor-pointer">{t.sipCalc}</li>
              <li className="hover:text-[#006A4E] cursor-pointer">{t.taxPlanning}</li>
              <li className="hover:text-[#006A4E] cursor-pointer">{t.fraudAwareness}</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">{t.legal}</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="hover:text-[#006A4E] cursor-pointer">{t.privacy}</li>
              <li className="hover:text-[#006A4E] cursor-pointer">{t.terms}</li>
              <li className="hover:text-[#006A4E] cursor-pointer">{t.disclaimer}</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400">
            {t.copyright}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <CheckCircle2 size={14} className="text-green-500" />
            <span>{t.securePrivate}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
