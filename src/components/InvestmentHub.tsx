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

type RiskLevel = 'High' | 'Moderate' | 'Low';
type DurationLevel = 'Low' | 'Medium' | 'Long';

type FundChipProps = {
  label: string;
  isActive: boolean;
  onClick: () => void;
};

type MutualFundCardProps = {
  name: string;
  tag: string;
  ctaLabel: string;
  onViewDetails?: () => void;
};

type AMCCardProps = {
  name: string;
  url: string;
};

function CategoryChip({ label, isActive, onClick }: FundChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-full border text-sm font-medium transition-all cursor-pointer',
        isActive
          ? 'bg-[#006A4E] text-white border-[#006A4E]'
          : 'bg-white text-gray-700 border-gray-200 hover:border-[#006A4E]/40 hover:text-[#006A4E]'
      )}
    >
      {label}
    </button>
  );
}

function FundCard({ name, tag, ctaLabel, onViewDetails }: MutualFundCardProps) {
  return (
    <div className="p-5 rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 hover:border-[#006A4E]/30 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-3 mb-4">
        <h5 className="text-base font-bold text-gray-900 leading-snug">{name}</h5>
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#006A4E]/10 text-[#006A4E] whitespace-nowrap">
          {tag}
        </span>
      </div>
      <button
        onClick={onViewDetails}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#006A4E] text-white text-sm font-medium hover:bg-[#005a42] transition-colors cursor-pointer"
      >
        {ctaLabel}
        <ArrowRight size={14} />
      </button>
    </div>
  );
}

const investmentUiTextByLanguage: Record<Language, {
  exploreMutualFunds: string;
  fundCategories: string;
  availableFundProviders: string;
  selectCategoryToViewProviders: string;
  topFundHouses: string;
  filterByRisk: string;
  filterByDuration: string;
  bestMultiCapFunds: string;
  noFundsMatchFilters: string;
  viewDetails: string;
  riskHigh: string;
  riskModerate: string;
  riskLow: string;
  durationLow: string;
  durationMedium: string;
  durationLong: string;
}> = {
  [Language.ENGLISH]: {
    exploreMutualFunds: 'Explore Mutual Funds',
    fundCategories: 'Fund Categories',
    availableFundProviders: 'Available Fund Providers',
    selectCategoryToViewProviders: 'Select a category to view fund providers',
    topFundHouses: 'Top Fund Houses',
    filterByRisk: 'Filter by Risk',
    filterByDuration: 'Filter by Duration',
    bestMultiCapFunds: 'Best Multi Cap Mutual Funds',
    noFundsMatchFilters: 'No funds match the selected category, risk, and duration filters.',
    viewDetails: 'View Details',
    riskHigh: 'High',
    riskModerate: 'Moderate',
    riskLow: 'Low',
    durationLow: 'Low',
    durationMedium: 'Medium',
    durationLong: 'Long'
  },
  [Language.HINDI]: {
    exploreMutualFunds: 'म्यूचुअल फंड खोजें',
    fundCategories: 'फंड श्रेणियां',
    availableFundProviders: 'उपलब्ध फंड प्रदाता',
    selectCategoryToViewProviders: 'फंड प्रदाता देखने के लिए एक श्रेणी चुनें',
    topFundHouses: 'शीर्ष फंड हाउस',
    filterByRisk: 'जोखिम के अनुसार फ़िल्टर करें',
    filterByDuration: 'अवधि के अनुसार फ़िल्टर करें',
    bestMultiCapFunds: 'सर्वश्रेष्ठ मल्टी कैप म्यूचुअल फंड',
    noFundsMatchFilters: 'चयनित श्रेणी, जोखिम और अवधि से कोई फंड मेल नहीं खाता।',
    viewDetails: 'विवरण देखें',
    riskHigh: 'उच्च',
    riskModerate: 'मध्यम',
    riskLow: 'कम',
    durationLow: 'कम',
    durationMedium: 'मध्यम',
    durationLong: 'लंबी'
  },
  [Language.TAMIL]: {
    exploreMutualFunds: 'மியூச்சுவல் ஃபண்டுகளை ஆராயுங்கள்',
    fundCategories: 'ஃபண்ட் வகைகள்',
    availableFundProviders: 'கிடைக்கும் ஃபண்ட் வழங்குநர்கள்',
    selectCategoryToViewProviders: 'ஃபண்ட் வழங்குநர்களைப் பார்க்க ஒரு வகையைத் தேர்வு செய்யவும்',
    topFundHouses: 'சிறந்த ஃபண்ட் ஹவுச்கள்',
    filterByRisk: 'அபாயத்தின் அடிப்படையில் வடிகட்டு',
    filterByDuration: 'கால அளவின் அடிப்படையில் வடிகட்டு',
    bestMultiCapFunds: 'சிறந்த மல்டி கேப் மியூச்சுவல் ஃபண்டுகள்',
    noFundsMatchFilters: 'தேர்ந்தெடுக்கப்பட்ட வகை, அபாயம், கால அளவுக்கு பொருந்தும் ஃபண்டுகள் இல்லை.',
    viewDetails: 'விவரங்களைப் பார்க்கவும்',
    riskHigh: 'உயர்',
    riskModerate: 'மிதமான',
    riskLow: 'குறைவு',
    durationLow: 'குறைவு',
    durationMedium: 'மிதமான',
    durationLong: 'நீண்ட'
  },
  [Language.TELUGU]: {
    exploreMutualFunds: 'మ్యూచువల్ ఫండ్స్ అన్వేషించండి',
    fundCategories: 'ఫండ్ కేటగిరీలు',
    availableFundProviders: 'అందుబాటులో ఉన్న ఫండ్ ప్రొవైడర్లు',
    selectCategoryToViewProviders: 'ఫండ్ ప్రొవైడర్లను చూడటానికి ఒక కేటగిరీని ఎంచుకోండి',
    topFundHouses: 'టాప్ ఫండ్ హౌసెస్',
    filterByRisk: 'రిస్క్ ఆధారంగా ఫిల్టర్',
    filterByDuration: 'వ్యవధి ఆధారంగా ఫిల్టర్',
    bestMultiCapFunds: 'ఉత్తమ మల్టీ క్యాప్ మ్యూచువల్ ఫండ్స్',
    noFundsMatchFilters: 'ఎంచుకున్న కేటగిరీ, రిస్క్, వ్యవధికి సరిపడే ఫండ్లు లేవు.',
    viewDetails: 'వివరాలు చూడండి',
    riskHigh: 'అధిక',
    riskModerate: 'మధ్యస్థ',
    riskLow: 'తక్కువ',
    durationLow: 'తక్కువ',
    durationMedium: 'మధ్యస్థ',
    durationLong: 'పొడవైన'
  },
  [Language.KANNADA]: {
    exploreMutualFunds: 'ಮ್ಯೂಚುಯಲ್ ಫಂಡ್‌ಗಳನ್ನು ಅನ್ವೇಷಿಸಿ',
    fundCategories: 'ಫಂಡ್ ವರ್ಗಗಳು',
    availableFundProviders: 'ಲಭ್ಯವಿರುವ ಫಂಡ್ ಪೂರೈಕೆದಾರರು',
    selectCategoryToViewProviders: 'ಫಂಡ್ ಪೂರೈಕೆದಾರರನ್ನು ನೋಡಲು ಒಂದು ವರ್ಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    topFundHouses: 'ಟಾಪ್ ಫಂಡ್ ಹೌಸ್‌ಗಳು',
    filterByRisk: 'ಅಪಾಯ ಆಧಾರಿತ ಫಿಲ್ಟರ್',
    filterByDuration: 'ಅವಧಿ ಆಧಾರಿತ ಫಿಲ್ಟರ್',
    bestMultiCapFunds: 'ಅತ್ಯುತ್ತಮ ಮಲ್ಟಿ ಕ್ಯಾಪ್ ಮ್ಯೂಚುಯಲ್ ಫಂಡ್‌ಗಳು',
    noFundsMatchFilters: 'ಆಯ್ಕೆ ಮಾಡಿದ ವರ್ಗ, ಅಪಾಯ ಮತ್ತು ಅವಧಿಗೆ ಹೊಂದುವ ಫಂಡ್‌ಗಳು ಇಲ್ಲ.',
    viewDetails: 'ವಿವರಗಳನ್ನು ನೋಡಿ',
    riskHigh: 'ಹೆಚ್ಚು',
    riskModerate: 'ಮಧ್ಯಮ',
    riskLow: 'ಕಡಿಮೆ',
    durationLow: 'ಕಡಿಮೆ',
    durationMedium: 'ಮಧ್ಯಮ',
    durationLong: 'ದೀರ್ಘ'
  },
  [Language.MALAYALAM]: {
    exploreMutualFunds: 'മ്യൂച്വൽ ഫണ്ടുകൾ പരിശോധിക്കുക',
    fundCategories: 'ഫണ്ട് വിഭാഗങ്ങൾ',
    availableFundProviders: 'ലഭ്യമായ ഫണ്ട് പ്രൊവൈഡർമാർ',
    selectCategoryToViewProviders: 'ഫണ്ട് പ്രൊവൈഡർമാർ കാണാൻ ഒരു വിഭാഗം തിരഞ്ഞെടുക്കുക',
    topFundHouses: 'മികച്ച ഫണ്ട് ഹൗസുകൾ',
    filterByRisk: 'റിസ്ക് അനുസരിച്ച് ഫിൽറ്റർ ചെയ്യുക',
    filterByDuration: 'ദൈർഘ്യം അനുസരിച്ച് ഫിൽറ്റർ ചെയ്യുക',
    bestMultiCapFunds: 'മികച്ച മൾട്ടി ക്യാപ് മ്യൂച്വൽ ഫണ്ടുകൾ',
    noFundsMatchFilters: 'തിരഞ്ഞെടുത്ത വിഭാഗം, റിസ്ക്, ദൈർഘ്യം എന്നിവയ്ക്ക് യോജിക്കുന്ന ഫണ്ടുകൾ ഇല്ല.',
    viewDetails: 'വിശദാംശങ്ങൾ കാണുക',
    riskHigh: 'ഉയർന്ന',
    riskModerate: 'മിതമായ',
    riskLow: 'കുറഞ്ഞ',
    durationLow: 'കുറഞ്ഞ',
    durationMedium: 'മിതമായ',
    durationLong: 'ദൈർഘ്യമേറിയ'
  },
  [Language.MARATHI]: {
    exploreMutualFunds: 'म्युच्युअल फंड्स एक्सप्लोर करा',
    fundCategories: 'फंड श्रेणी',
    availableFundProviders: 'उपलब्ध फंड प्रदाते',
    selectCategoryToViewProviders: 'फंड प्रदाते पाहण्यासाठी एक श्रेणी निवडा',
    topFundHouses: 'टॉप फंड हाउसेस',
    filterByRisk: 'जोखीमानुसार फिल्टर',
    filterByDuration: 'कालावधीनुसार फिल्टर',
    bestMultiCapFunds: 'सर्वोत्तम मल्टी कॅप म्युच्युअल फंड्स',
    noFundsMatchFilters: 'निवडलेल्या श्रेणी, जोखीम आणि कालावधीसाठी फंड उपलब्ध नाहीत.',
    viewDetails: 'तपशील पहा',
    riskHigh: 'उच्च',
    riskModerate: 'मध्यम',
    riskLow: 'कमी',
    durationLow: 'कमी',
    durationMedium: 'मध्यम',
    durationLong: 'दीर्घ'
  },
  [Language.BENGALI]: {
    exploreMutualFunds: 'মিউচুয়াল ফান্ড এক্সপ্লোর করুন',
    fundCategories: 'ফান্ড ক্যাটাগরি',
    availableFundProviders: 'উপলব্ধ ফান্ড প্রোভাইডার',
    selectCategoryToViewProviders: 'ফান্ড প্রোভাইডার দেখতে একটি ক্যাটাগরি নির্বাচন করুন',
    topFundHouses: 'শীর্ষ ফান্ড হাউস',
    filterByRisk: 'ঝুঁকি অনুযায়ী ফিল্টার',
    filterByDuration: 'মেয়াদ অনুযায়ী ফিল্টার',
    bestMultiCapFunds: 'সেরা মাল্টি ক্যাপ মিউচুয়াল ফান্ড',
    noFundsMatchFilters: 'নির্বাচিত ক্যাটাগরি, ঝুঁকি এবং মেয়াদের সাথে মেলে এমন ফান্ড নেই।',
    viewDetails: 'বিস্তারিত দেখুন',
    riskHigh: 'উচ্চ',
    riskModerate: 'মাঝারি',
    riskLow: 'কম',
    durationLow: 'কম',
    durationMedium: 'মাঝারি',
    durationLong: 'দীর্ঘ'
  }
};

function AMCCard({ name, url }: AMCCardProps) {
  return (
    <button
      onClick={() => window.open(url, '_blank')}
      className="w-full text-left p-5 rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 hover:border-[#006A4E]/30 hover:shadow-sm transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-[#006A4E]/10 text-[#006A4E] flex items-center justify-center flex-shrink-0">
          <Briefcase size={20} />
        </div>
        <ArrowRight className="text-gray-400" size={18} />
      </div>
      <h5 className="text-base font-bold text-gray-900 leading-snug">{name}</h5>
    </button>
  );
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFundCategory, setSelectedFundCategory] = useState<string>('Multi Cap');
  const [selectedRisk, setSelectedRisk] = useState<RiskLevel>('Moderate');
  const [selectedDuration, setSelectedDuration] = useState<DurationLevel>('Medium');
  const investmentUiText = investmentUiTextByLanguage[currentLanguage] || investmentUiTextByLanguage[Language.ENGLISH];

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
    { id: "SIP", name: "SIP", icon: <Target />, desc: t.sipDesc || "Systematic Investment Plan" },
    { id: "SWP", name: "SWP", icon: <History />, desc: t.swpDesc || "Systematic Withdrawal Plan" },
    { id: "FD", name: "FD", icon: <Lock />, desc: t.fdDesc || "Fixed Deposit" },
    { id: "Mutual Funds", name: "MF", icon: <Briefcase />, desc: t.mfDesc || "Mutual Funds" },
  ];

  // Investment Strategies for each type
  const investmentStrategies: Record<InvestmentType, {
    statement: string;
    strategies: string[];
  }> = {
    "SIP": {
      statement: t.sipStatement || "Systematic Investment Plans (SIP) help you build wealth through disciplined, regular investing. Start small, stay consistent, and let compounding work its magic over time.",
      strategies: [
        t.sipStrategy1 || "Start with an amount you can comfortably invest every month (₹500-₹5,000)",
        t.sipStrategy2 || "Choose a fixed date each month for automatic deduction",
        t.sipStrategy3 || "Continue SIP for minimum 5-7 years for optimal returns",
        t.sipStrategy4 || "Increase SIP amount by 10-15% annually as income grows",
        t.sipStrategy5 || "Diversify across 3-4 equity mutual funds for balanced growth",
        t.sipStrategy6 || "Don't stop SIP during market downturns - buy more units at lower prices"
      ]
    },
    "SWP": {
      statement: t.swpStatement || "Systematic Withdrawal Plans (SWP) provide regular income from your investments while keeping your capital invested and growing. Perfect for retirees or those seeking passive income.",
      strategies: [
        t.swpStrategy1 || "Withdraw only 6-8% annually to preserve capital long-term",
        t.swpStrategy2 || "Set up monthly withdrawals to replace salary income",
        t.swpStrategy3 || "Keep emergency fund separate - don't rely solely on SWP",
        t.swpStrategy4 || "Choose balanced or debt funds for stable SWP income",
        t.swpStrategy5 || "Review and adjust withdrawal amount annually based on returns",
        t.swpStrategy6 || "Maintain at least 50% capital invested for continued growth"
      ]
    },
    "FD": {
      statement: t.fdStatement || "Fixed Deposits offer guaranteed returns with zero market risk. Ideal for conservative investors seeking safety and predictable income for short to medium term goals.",
      strategies: [
        t.fdStrategy1 || "Ladder FDs across multiple maturity dates (3, 6, 12 months)",
        t.fdStrategy2 || "Compare interest rates across 3-4 banks before investing",
        t.fdStrategy3 || "Consider tax-saving FDs (5 years lock-in) for Section 80C benefits",
        t.fdStrategy4 || "Avoid breaking FDs early - significant penalty on interest",
        t.fdStrategy5 || "Senior citizens get 0.5-1% higher interest rates",
        t.fdStrategy6 || "Keep FDs in joint names for easier succession and higher coverage"
      ]
    },
    "Mutual Funds": {
      statement: t.mfStatement || "Mutual Funds pool money from multiple investors to invest in diversified portfolios. Professional fund management makes it ideal for beginners seeking market-linked returns.",
      strategies: [
        t.mfStrategy1 || "Start with large-cap equity funds for lower volatility",
        t.mfStrategy2 || "Allocate 60% equity, 40% debt based on risk tolerance",
        t.mfStrategy3 || "Review portfolio quarterly - rebalance if needed",
        t.mfStrategy4 || "Choose direct funds to save 1-1.5% in commission fees",
        t.mfStrategy5 || "Stay invested for minimum 3 years to benefit from tax efficiency",
        t.mfStrategy6 || "Use index funds for low-cost, diversified market exposure"
      ]
    }
  };

  const currentStrategy = investmentStrategies[activeType];

  const sipCompaniesText: Record<Language, { title: string; descriptions: Record<string, string> }> = {
    [Language.ENGLISH]: {
      title: 'Top SIP Mutual Fund Companies',
      descriptions: {
        hdfc: 'One of India\'s leading asset management companies.',
        icici: 'A trusted AMC offering diversified SIP investment options.',
        sbi: 'A popular fund house backed by India\'s largest bank.',
        nippon: 'Known for broad fund choices across risk profiles.',
        kotak: 'Offers SIP plans for long-term wealth creation goals.',
        axis: 'Provides investor-friendly funds with SIP flexibility.',
        aditya: 'A well-known AMC with equity, debt, and hybrid SIP funds.'
      }
    },
    [Language.HINDI]: {
      title: 'शीर्ष एसआईपी म्यूचुअल फंड कंपनियां',
      descriptions: {
        hdfc: 'भारत की अग्रणी एसेट मैनेजमेंट कंपनियों में से एक।',
        icici: 'विविध एसआईपी विकल्प देने वाली विश्वसनीय एएमसी।',
        sbi: 'भारत के सबसे बड़े बैंक से जुड़ा लोकप्रिय फंड हाउस।',
        nippon: 'विभिन्न जोखिम प्रोफाइल के लिए व्यापक फंड विकल्प।',
        kotak: 'दीर्घकालिक धन सृजन के लिए एसआईपी योजनाएं प्रदान करता है।',
        axis: 'लचीले एसआईपी विकल्पों के साथ निवेशक-अनुकूल फंड।',
        aditya: 'इक्विटी, डेट और हाइब्रिड एसआईपी फंड देने वाली प्रसिद्ध एएमसी।'
      }
    },
    [Language.TAMIL]: {
      title: 'சிறந்த SIP மியூச்சுவல் ஃபண்ட் நிறுவனங்கள்',
      descriptions: {
        hdfc: 'இந்தியாவின் முன்னணி சொத்து மேலாண்மை நிறுவனங்களில் ஒன்று.',
        icici: 'பல்வேறு SIP தேர்வுகளை வழங்கும் நம்பகமான AMC.',
        sbi: 'இந்தியாவின் மிகப்பெரிய வங்கியுடன் இணைந்த பிரபல நிதி நிறுவனம்.',
        nippon: 'பல்வேறு அபாய நிலைகளுக்கு ஏற்ற பரந்த நிதி தேர்வுகள்.',
        kotak: 'நீண்டகால செல்வ உருவாக்கத்திற்கான SIP திட்டங்களை வழங்குகிறது.',
        axis: 'நெகிழ்வான SIP தேர்வுகளுடன் முதலீட்டாளர் நட்பு நிதிகள்.',
        aditya: 'இக்விட்டி, கடன், ஹைபிரிட் SIP நிதிகளுடன் அறியப்பட்ட AMC.'
      }
    },
    [Language.TELUGU]: {
      title: 'అగ్ర SIP మ్యూచువల్ ఫండ్ కంపెనీలు',
      descriptions: {
        hdfc: 'భారతదేశంలోని ప్రముఖ ఆస్తి నిర్వహణ సంస్థల్లో ఒకటి.',
        icici: 'వివిధ SIP ఎంపికలు అందించే విశ్వసనీయ AMC.',
        sbi: 'భారతదేశపు అతిపెద్ద బ్యాంక్ మద్దతు ఉన్న ప్రసిద్ధ ఫండ్ హౌస్.',
        nippon: 'వివిధ రిస్క్ ప్రొఫైళ్లకు విస్తృత ఫండ్ ఎంపికలు అందిస్తుంది.',
        kotak: 'దీర్ఘకాల సంపద సృష్టికి SIP ప్రణాళికలు అందిస్తుంది.',
        axis: 'SIP సౌలభ్యంతో పెట్టుబడిదారులకు అనుకూల ఫండ్లు.',
        aditya: 'ఈక్విటీ, డెట్, హైబ్రిడ్ SIP ఫండ్లతో ప్రసిద్ధ AMC.'
      }
    },
    [Language.KANNADA]: {
      title: 'ಅಗ್ರ SIP ಮ್ಯೂಚುವಲ್ ಫಂಡ್ ಕಂಪನಿಗಳು',
      descriptions: {
        hdfc: 'ಭಾರತದ ಪ್ರಮುಖ ಆಸ್ತಿ ನಿರ್ವಹಣಾ ಕಂಪನಿಗಳಲ್ಲಿ ಒಂದು.',
        icici: 'ವೈವಿಧ್ಯಮಯ SIP ಆಯ್ಕೆಗಳನ್ನು ನೀಡುವ ವಿಶ್ವಾಸಾರ್ಹ AMC.',
        sbi: 'ಭಾರತದ ಅತಿ ದೊಡ್ಡ ಬ್ಯಾಂಕ್ ಬೆಂಬಲಿತ ಜನಪ್ರಿಯ ಫಂಡ್ ಹೌಸ್.',
        nippon: 'ವಿಭಿನ್ನ ಅಪಾಯ ಪ್ರೊಫೈಲ್‌ಗಳಿಗೆ ವಿಶಾಲ ಫಂಡ್ ಆಯ್ಕೆಗಳು.',
        kotak: 'ದೀರ್ಘಕಾಲಿಕ ಸಂಪತ್ತು ನಿರ್ಮಾಣಕ್ಕೆ SIP ಯೋಜನೆಗಳನ್ನು ಒದಗಿಸುತ್ತದೆ.',
        axis: 'SIP ಲಚೀಲತೆಯೊಂದಿಗೆ ಹೂಡಿಕೆದಾರ ಸ್ನೇಹಿ ಫಂಡ್ಗಳು.',
        aditya: 'ಈಕ್ವಿಟಿ, ಡೆಟ್ ಮತ್ತು ಹೈಬ್ರಿಡ್ SIP ಫಂಡ್ಗಳಿರುವ ಪ್ರಸಿದ್ಧ AMC.'
      }
    },
    [Language.MALAYALAM]: {
      title: 'മികച്ച SIP മ്യൂച്വൽ ഫണ്ട് കമ്പനികൾ',
      descriptions: {
        hdfc: 'ഇന്ത്യയിലെ മുൻനിര ആസറ്റ് മാനേജ്മെന്റ് കമ്പനികളിൽ ഒന്ന്.',
        icici: 'വൈവിധ്യമാർന്ന SIP ഓപ്ഷനുകൾ നൽകുന്ന വിശ്വസനീയ AMC.',
        sbi: 'ഇന്ത്യയിലെ ഏറ്റവും വലിയ ബാങ്കിന്റെ പിന്തുണയുള്ള ജനപ്രിയ ഫണ്ട് ഹൗസ്.',
        nippon: 'വിവിധ റിസ്ക് പ്രൊഫൈലുകൾക്ക് അനുയോജ്യമായ വിശാല ഫണ്ട് ഓപ്ഷനുകൾ.',
        kotak: 'ദീർഘകാല സമ്പത്ത് സൃഷ്ടിക്കായി SIP പദ്ധതികൾ നൽകുന്നു.',
        axis: 'SIP സൗകര്യത്തോടെ നിക്ഷേപക സൗഹൃദ ഫണ്ടുകൾ നൽകുന്നു.',
        aditya: 'ഇക്വിറ്റി, ഡെറ്റ്, ഹൈബ്രിഡ് SIP ഫണ്ടുകളുള്ള പ്രശസ്ത AMC.'
      }
    },
    [Language.MARATHI]: {
      title: 'शीर्ष SIP म्युच्युअल फंड कंपन्या',
      descriptions: {
        hdfc: 'भारतातील अग्रगण्य अॅसेट मॅनेजमेंट कंपन्यांपैकी एक.',
        icici: 'विविध SIP पर्याय देणारी विश्वासार्ह AMC.',
        sbi: 'भारताच्या सर्वात मोठ्या बँकेच्या पाठबळासह लोकप्रिय फंड हाऊस.',
        nippon: 'विविध जोखीम प्रोफाइलसाठी व्यापक फंड पर्याय उपलब्ध.',
        kotak: 'दीर्घकालीन संपत्ती निर्मितीसाठी SIP योजना उपलब्ध करून देते.',
        axis: 'SIP लवचिकतेसह गुंतवणूकदार-अनुकूल फंड उपलब्ध.',
        aditya: 'इक्विटी, डेट आणि हायब्रिड SIP फंड देणारी प्रसिद्ध AMC.'
      }
    },
    [Language.BENGALI]: {
      title: 'শীর্ষ SIP মিউচুয়াল ফান্ড কোম্পানি',
      descriptions: {
        hdfc: 'ভারতের অন্যতম শীর্ষস্থানীয় অ্যাসেট ম্যানেজমেন্ট কোম্পানি।',
        icici: 'বিভিন্ন SIP বিকল্প প্রদানকারী নির্ভরযোগ্য AMC।',
        sbi: 'ভারতের বৃহত্তম ব্যাংকের সমর্থনপুষ্ট জনপ্রিয় ফান্ড হাউস।',
        nippon: 'বিভিন্ন ঝুঁকি প্রোফাইলের জন্য বিস্তৃত ফান্ড বিকল্প।',
        kotak: 'দীর্ঘমেয়াদি সম্পদ গঠনের জন্য SIP পরিকল্পনা দেয়।',
        axis: 'SIP নমনীয়তার সাথে বিনিয়োগকারী-বান্ধব ফান্ড।',
        aditya: 'ইকুইটি, ডেট এবং হাইব্রিড SIP ফান্ডসহ সুপরিচিত AMC।'
      }
    }
  };

  const localizedSipCompaniesText = sipCompaniesText[currentLanguage] || sipCompaniesText[Language.ENGLISH];

  const sipCompanies = [
    {
      key: 'hdfc',
      name: 'HDFC Mutual Fund',
      description: localizedSipCompaniesText.descriptions.hdfc,
      url: 'https://www.hdfcfund.com'
    },
    {
      key: 'icici',
      name: 'ICICI Prudential Mutual Fund',
      description: localizedSipCompaniesText.descriptions.icici,
      url: 'https://www.icicipruamc.com'
    },
    {
      key: 'sbi',
      name: 'SBI Mutual Fund',
      description: localizedSipCompaniesText.descriptions.sbi,
      url: 'https://www.sbimf.com'
    },
    {
      key: 'nippon',
      name: 'Nippon India Mutual Fund',
      description: localizedSipCompaniesText.descriptions.nippon,
      url: 'https://mf.nipponindiaim.com'
    },
    {
      key: 'kotak',
      name: 'Kotak Mutual Fund',
      description: localizedSipCompaniesText.descriptions.kotak,
      url: 'https://www.kotakmf.com'
    },
    {
      key: 'axis',
      name: 'Axis Mutual Fund',
      description: localizedSipCompaniesText.descriptions.axis,
      url: 'https://www.axismf.com'
    },
    {
      key: 'aditya',
      name: 'Aditya Birla Sun Life Mutual Fund',
      description: localizedSipCompaniesText.descriptions.aditya,
      url: 'https://mutualfund.adityabirlacapital.com'
    }
  ];

  const openSipCompanyWebsite = (url: string) => {
    window.open(url, '_blank');
  };

  const fundCategoryGroups = {
    Debt: [
      'Debt',
      'Banking and PSU',
      'Floater',
      'Gilt with 10 year Constant Duration',
      'Long Duration',
      'Medium to Long Duration',
      'Money Market',
      'Overnight',
      'Short Duration',
      'Target Maturity',
      'Corporate Bond',
      'Low Duration',
      'Medium Duration',
      'Dynamic Bond',
      'Gilt',
      'Credit Risk',
      'Liquid',
      'Ultra Short Duration'
    ],
    Commodities: ['Gold', 'Silver'],
    Hybrid: [
      'Balanced Hybrid',
      'Dynamic Asset Allocation',
      'Equity Savings',
      'Multi Asset Allocation',
      'Aggressive Hybrid',
      'Conservative Hybrid',
      'Arbitrage'
    ],
    Equity: [
      'Multi Cap',
      'Flexi Cap',
      'International',
      'Large & MidCap',
      'Thematic',
      'Large Cap',
      'Mid Cap',
      'Small Cap',
      'ELSS',
      'Dividend Yield',
      'Sectoral',
      'Contra',
      'Value Oriented'
    ],
    Others: ['Infrastructure', 'PSU', 'Energy', 'Consumption', 'Banking', 'Technology']
  };

  const fundCategoryMap: Record<string, string[]> = {
    'Debt': ['SBI Mutual Fund', 'HDFC Mutual Fund', 'ICICI Prudential Mutual Fund'],
    'Banking and PSU': ['Aditya Birla Sun Life Mutual Fund', 'Nippon India Mutual Fund'],
    'Floater': ['HDFC Mutual Fund', 'Axis Mutual Fund'],
    'Gilt with 10 year Constant Duration': ['ICICI Prudential Mutual Fund'],
    'Large & MidCap': ['SBI Mutual Fund', 'Kotak Mahindra Mutual Fund', 'Axis Mutual Fund'],
    'Multi Cap': ['Quant Mutual Fund', 'Nippon India Mutual Fund'],
    'Flexi Cap': ['Parag Parikh Mutual Fund', 'UTI Mutual Fund'],
    'Small Cap': ['SBI Mutual Fund', 'Nippon India Mutual Fund']
  };

  const fundLinks: Record<string, string> = {
    'SBI Mutual Fund': 'https://www.sbimf.com',
    'HDFC Mutual Fund': 'https://www.hdfcfund.com',
    'ICICI Prudential Mutual Fund': 'https://www.icicipruamc.com',
    'Axis Mutual Fund': 'https://www.axismf.com',
    'Nippon India Mutual Fund': 'https://mf.nipponindiaim.com',
    'Kotak Mahindra Mutual Fund': 'https://www.kotakmf.com',
    'Aditya Birla Sun Life Mutual Fund': 'https://mutualfund.adityabirlacapital.com',
    'UTI Mutual Fund': 'https://www.utimf.com',
    'Quant Mutual Fund': 'https://www.quantmutual.com',
    'Parag Parikh Mutual Fund': 'https://amc.ppfas.com'
  };

  const topFundHouses = [
    { name: 'SBI Mutual Fund', url: 'https://www.sbimf.com' },
    { name: 'HDFC Mutual Fund', url: 'https://www.hdfcfund.com' },
    { name: 'ICICI Prudential Mutual Fund', url: 'https://www.icicipruamc.com' },
    { name: 'Axis Mutual Fund', url: 'https://www.axismf.com' },
    { name: 'Nippon India Mutual Fund', url: 'https://mf.nipponindiaim.com' },
    { name: 'Kotak Mahindra Mutual Fund', url: 'https://www.kotakmf.com' },
    { name: 'Aditya Birla Sun Life Mutual Fund', url: 'https://mutualfund.adityabirlacapital.com' },
    { name: 'UTI Mutual Fund', url: 'https://www.utimf.com' }
  ];

  const recommendedFunds = [
    { name: 'Quant Active Fund', tag: 'High Return', risk: 'High' as RiskLevel, duration: 'Long' as DurationLevel, categories: ['Multi Cap', 'Flexi Cap'] },
    { name: 'Nippon India Multi Cap Fund', tag: 'Growth Focus', risk: 'High' as RiskLevel, duration: 'Long' as DurationLevel, categories: ['Multi Cap'] },
    { name: 'Kotak Multi Cap Fund', tag: 'Stable', risk: 'Moderate' as RiskLevel, duration: 'Medium' as DurationLevel, categories: ['Multi Cap', 'Large & MidCap'] },
    { name: 'ICICI Prudential Multi Cap Fund', tag: 'Balanced', risk: 'Moderate' as RiskLevel, duration: 'Medium' as DurationLevel, categories: ['Multi Cap', 'Value Oriented'] },
    { name: 'Axis Multi Cap Fund', tag: 'Consistent', risk: 'Low' as RiskLevel, duration: 'Low' as DurationLevel, categories: ['Multi Cap', 'Large Cap'] }
  ];

  const visibleRecommendedFunds = recommendedFunds.filter((fund) => {
    const categoryMatch = fund.categories.includes(selectedFundCategory);
    const riskMatch = fund.risk === selectedRisk;
    const durationMatch = fund.duration === selectedDuration;
    return categoryMatch && riskMatch && durationMatch;
  });

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
              {currentStrategy.statement || "Investment guidance is available for this plan type."}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="text-blue-600" size={20} />
            {t.effectiveStrategies || "Effective Investment Strategies"}
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

      {activeType === 'SIP' && (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <div className="mb-6">
            <h3 className="text-2xl font-serif font-bold text-gray-900">{localizedSipCompaniesText.title}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {sipCompanies.map((company) => (
              <button
                key={company.name}
                onClick={() => openSipCompanyWebsite(company.url)}
                className="w-full text-left p-5 rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 hover:border-[#006A4E]/30 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#006A4E]/10 text-[#006A4E] flex items-center justify-center flex-shrink-0">
                    <PiggyBank size={20} />
                  </div>
                  <ArrowRight className="text-gray-400" size={18} />
                </div>

                <h4 className="text-base font-bold text-gray-900 mb-1 leading-snug">{company.name}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{company.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeType === 'Mutual Funds' && (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-8">
          <div>
            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">{investmentUiText.exploreMutualFunds}</h3>
          </div>

          <div>
            <h4 className="text-xl font-serif font-bold text-gray-900 mb-4">{investmentUiText.fundCategories}</h4>
            <div className="space-y-4">
              {Object.entries(fundCategoryGroups).map(([groupName, categories]) => (
                <div key={groupName}>
                  <h5 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">{groupName}</h5>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <CategoryChip
                        key={category}
                        label={category}
                        isActive={selectedFundCategory === category}
                        onClick={() => {
                          setSelectedFundCategory(category);
                          setSelectedCategory(category);
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xl font-serif font-bold text-gray-900 mb-4">{investmentUiText.availableFundProviders}</h4>
            {selectedCategory && fundCategoryMap[selectedCategory]?.length ? (
              <motion.div
                key={selectedCategory}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
              >
                {fundCategoryMap[selectedCategory].map((fund, index) => (
                  <button
                    key={`${fund}-${index}`}
                    onClick={() => {
                      const url = fundLinks[fund];
                      if (url) window.open(url, '_blank');
                    }}
                    className="w-full text-left p-5 rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 hover:border-[#006A4E]/30 hover:shadow-sm transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[#006A4E]/10 text-[#006A4E] flex items-center justify-center flex-shrink-0">
                        <Briefcase size={20} />
                      </div>
                      <ArrowRight className="text-gray-400" size={18} />
                    </div>
                    <h5 className="text-base font-bold text-gray-900 leading-snug">{fund}</h5>
                  </button>
                ))}
              </motion.div>
            ) : (
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 text-sm text-gray-600">
                {investmentUiText.selectCategoryToViewProviders}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-xl font-serif font-bold text-gray-900 mb-4">{investmentUiText.topFundHouses}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {topFundHouses.map((amc) => (
                <AMCCard key={amc.name} name={amc.name} url={amc.url} />
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xl font-serif font-bold text-gray-900 mb-4">{investmentUiText.filterByRisk}</h4>
            <div className="flex flex-wrap gap-2">
              {([
                { value: 'High' as RiskLevel, label: investmentUiText.riskHigh },
                { value: 'Moderate' as RiskLevel, label: investmentUiText.riskModerate },
                { value: 'Low' as RiskLevel, label: investmentUiText.riskLow }
              ]).map((risk) => (
                <CategoryChip
                  key={risk.value}
                  label={risk.label}
                  isActive={selectedRisk === risk.value}
                  onClick={() => setSelectedRisk(risk.value)}
                />
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xl font-serif font-bold text-gray-900 mb-4">{investmentUiText.filterByDuration}</h4>
            <div className="flex flex-wrap gap-2">
              {([
                { value: 'Low' as DurationLevel, label: investmentUiText.durationLow },
                { value: 'Medium' as DurationLevel, label: investmentUiText.durationMedium },
                { value: 'Long' as DurationLevel, label: investmentUiText.durationLong }
              ]).map((duration) => (
                <CategoryChip
                  key={duration.value}
                  label={duration.label}
                  isActive={selectedDuration === duration.value}
                  onClick={() => setSelectedDuration(duration.value)}
                />
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xl font-serif font-bold text-gray-900 mb-4">{investmentUiText.bestMultiCapFunds}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {visibleRecommendedFunds.length > 0 ? (
                visibleRecommendedFunds.map((fund) => (
                  <FundCard
                    key={fund.name}
                    name={fund.name}
                    tag={fund.tag}
                    ctaLabel={investmentUiText.viewDetails}
                    onViewDetails={() => window.open('https://www.google.com/search?q=' + encodeURIComponent(fund.name + ' mutual fund'), '_blank')}
                  />
                ))
              ) : (
                <div className="sm:col-span-2 xl:col-span-3 rounded-2xl border border-gray-100 bg-gray-50 p-5 text-sm text-gray-600">
                  {investmentUiText.noFundsMatchFilters}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
