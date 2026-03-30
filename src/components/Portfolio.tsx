import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Briefcase, 
  History, 
  Loader2,
  PieChart as PieChartIcon,
  DollarSign,
  Zap,
  MessageSquare,
  Send,
  Info
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend
} from 'recharts';
import { Language } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PortfolioProps {
  t: any;
  setLanguage: (lang: Language) => void;
  currentLanguage: Language;
}

type BudgetCategoryKey = 'income' | 'housingDebt' | 'tax' | 'insurance' | 'savingsInvestment' | 'livingExpenses';
type BudgetItem = { name: string; monthly: number };

type SavedBudget = {
  timestamp: Date;
  data: Record<BudgetCategoryKey, BudgetItem[]>;
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  savingsPercentage: number;
};

const CURRENT_BUDGET_STORAGE_KEY = 'currentBudgetData';
const SAVED_BUDGET_HISTORY_STORAGE_KEY = 'savedBudgetHistory';

const DEFAULT_BUDGET_DATA: Record<BudgetCategoryKey, BudgetItem[]> = {
  income: [
    { name: 'Salary', monthly: 85000 },
    { name: 'Freelance/Other', monthly: 5000 }
  ],
  housingDebt: [
    { name: 'Rent/EMI', monthly: 22000 },
    { name: 'Loans', monthly: 6000 }
  ],
  tax: [
    { name: 'Income Tax (Monthly Avg)', monthly: 9000 }
  ],
  insurance: [
    { name: 'Health Insurance', monthly: 2000 },
    { name: 'Life Insurance', monthly: 1500 }
  ],
  savingsInvestment: [
    { name: 'SIP', monthly: 10000 },
    { name: 'Emergency Fund', monthly: 3000 }
  ],
  livingExpenses: [
    { name: 'Groceries', monthly: 6000 },
    { name: 'Utilities', monthly: 3000 },
    { name: 'Transport', monthly: 2500 },
    { name: 'Personal/Leisure', monthly: 3500 }
  ]
};

const cloneBudgetData = (data: Record<BudgetCategoryKey, BudgetItem[]>) =>
  budgetCategoryKeys.reduce((acc, key) => {
    acc[key] = data[key].map((item) => ({ ...item }));
    return acc;
  }, {} as Record<BudgetCategoryKey, BudgetItem[]>);

const budgetCategoryKeys: BudgetCategoryKey[] = ['income', 'housingDebt', 'tax', 'insurance', 'savingsInvestment', 'livingExpenses'];

const parseSavedBudgetHistory = (rawHistory: string | null): SavedBudget[] => {
  if (!rawHistory) return [];

  try {
    const parsed = JSON.parse(rawHistory) as Array<Omit<SavedBudget, 'timestamp'> & { timestamp: string }>;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((entry) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }))
      .filter((entry) => !Number.isNaN(entry.timestamp.getTime()));
  } catch (error) {
    console.error('Error loading saved budget history from localStorage:', error);
    return [];
  }
};

type BudgetText = {
  title: string;
  description: string;
  categoryTitles: Record<BudgetCategoryKey, string>;
  categoryInfo: Record<BudgetCategoryKey, string>;
  itemNames: Record<string, string>;
  hoverInfo: string;
  withinRule: string;
  outOfRange: string;
  itemName: string;
  monthlyInput: string;
  annualValue: string;
  total: string;
  progressVsIncome: string;
  smartCalculations: string;
  totalMonthlyIncome: string;
  totalExpenses: string;
  savingsRemaining: string;
  savingsPercentage: string;
  budgetRules: string;
  ruleHousing: string;
  ruleTax: string;
  ruleInsurance: string;
  ruleSavings: string;
  ruleLiving: string;
  ok: string;
  alert: string;
  budgetAiAssistant: string;
  askPlaceholder: string;
  aiInitial: string;
  aiOnlyBudget: string;
  aiLowSavings: string;
  aiHighHousing: string;
  aiHighOutflow: string;
  aiHighLiving: string;
  aiBalanced: string;
  aiIncome: string;
  aiExpenses: string;
  aiSavings: string;
  sharesAt: string;
  noTransactions: string;
};

const BUDGET_TEXTS: Record<Language, BudgetText> = {
  [Language.ENGLISH]: {
    title: 'Budget Planning',
    description: 'You need a budget to check if you are on the right track to savings and investments. A budget will also keep a tab on your daily spending habits.',
    categoryTitles: {
      income: 'Income',
      housingDebt: 'Housing & Debt',
      tax: 'Tax',
      insurance: 'Insurance',
      savingsInvestment: 'Savings & Investment',
      livingExpenses: 'Living Expenses'
    },
    categoryInfo: {
      income: 'All your regular monthly income sources.',
      housingDebt: 'Keep housing and debt obligations under control.',
      tax: 'Track average monthly tax outflow.',
      insurance: 'Adequate protection should not be ignored.',
      savingsInvestment: 'Build wealth through disciplined monthly saving.',
      livingExpenses: 'Control daily lifestyle spending.'
    },
    itemNames: {
      'Salary': 'Salary',
      'Freelance/Other': 'Freelance/Other',
      'Rent/EMI': 'Rent/EMI',
      'Loans': 'Loans',
      'Income Tax (Monthly Avg)': 'Income Tax (Monthly Avg)',
      'Health Insurance': 'Health Insurance',
      'Life Insurance': 'Life Insurance',
      'SIP': 'SIP',
      'Emergency Fund': 'Emergency Fund',
      'Groceries': 'Groceries',
      'Utilities': 'Utilities',
      'Transport': 'Transport',
      'Personal/Leisure': 'Personal/Leisure'
    },
    hoverInfo: 'Hover for more information',
    withinRule: 'Within Rule',
    outOfRange: 'Out of Range',
    itemName: 'Item Name',
    monthlyInput: 'Monthly Input (₹)',
    annualValue: 'Annual Value (₹)',
    total: 'TOTAL',
    progressVsIncome: 'Progress vs Income',
    smartCalculations: 'Smart Calculations',
    totalMonthlyIncome: 'Total Monthly Income',
    totalExpenses: 'Total Expenses',
    savingsRemaining: 'Savings Remaining',
    savingsPercentage: 'Savings Percentage',
    budgetRules: 'Budget Rules',
    ruleHousing: 'Housing <= 30%',
    ruleTax: 'Tax <= 30%',
    ruleInsurance: 'Insurance >= 4%',
    ruleSavings: 'Savings >= 15%',
    ruleLiving: 'Living <= 21%',
    ok: 'OK',
    alert: 'ALERT',
    budgetAiAssistant: 'Budget AI Assistant',
    askPlaceholder: 'Ask: Am I overspending?',
    aiInitial: 'I can help with budget planning. Ask things like: "Am I overspending?", "How can I save more?", or "Is my budget balanced?"',
    aiOnlyBudget: 'I only answer budget-related questions. Please ask about savings, expenses, housing, tax, insurance, or budget balance.',
    aiLowSavings: 'Savings are below 15%. Increase SIP or reduce discretionary spending.',
    aiHighHousing: 'Housing and debt are above 30%. Consider lowering EMI/rent burden if possible.',
    aiHighOutflow: 'Your outflow is above income. Reduce high-spend categories immediately.',
    aiHighLiving: 'Living expenses are above 21%. Track and trim daily non-essential costs.',
    aiBalanced: 'Your budget looks balanced. Continue this discipline and increase savings gradually.',
    aiIncome: 'Income',
    aiExpenses: 'Expenses',
    aiSavings: 'Savings',
    sharesAt: 'shares @',
    noTransactions: 'No transactions yet.'
  },
  [Language.HINDI]: {
    title: 'बजट प्लानिंग',
    description: 'बचत और निवेश के सही रास्ते पर हैं या नहीं, यह जांचने के लिए बजट जरूरी है। बजट आपके रोज़ाना खर्चों पर भी नज़र रखता है।',
    categoryTitles: {
      income: 'आय',
      housingDebt: 'हाउसिंग और कर्ज',
      tax: 'कर',
      insurance: 'बीमा',
      savingsInvestment: 'बचत और निवेश',
      livingExpenses: 'जीवन-यापन खर्च'
    },
    categoryInfo: {
      income: 'आपकी सभी नियमित मासिक आय।',
      housingDebt: 'हाउसिंग और कर्ज भुगतान को नियंत्रण में रखें।',
      tax: 'मासिक औसत कर भुगतान ट्रैक करें।',
      insurance: 'पर्याप्त सुरक्षा को नज़रअंदाज़ न करें।',
      savingsInvestment: 'अनुशासित बचत से धन निर्माण करें।',
      livingExpenses: 'दैनिक लाइफस्टाइल खर्च नियंत्रित रखें।'
    },
    itemNames: {
      'Salary': 'वेतन',
      'Freelance/Other': 'फ्रीलांस/अन्य',
      'Rent/EMI': 'किराया/ईएमआई',
      'Loans': 'ऋण',
      'Income Tax (Monthly Avg)': 'आयकर (मासिक औसत)',
      'Health Insurance': 'स्वास्थ्य बीमा',
      'Life Insurance': 'जीवन बीमा',
      'SIP': 'एसआईपी',
      'Emergency Fund': 'आपातकालीन निधि',
      'Groceries': 'किराना',
      'Utilities': 'यूटिलिटी बिल',
      'Transport': 'यातायात',
      'Personal/Leisure': 'व्यक्तिगत/मनोरंजन'
    },
    hoverInfo: 'अधिक जानकारी के लिए होवर करें',
    withinRule: 'नियम के भीतर',
    outOfRange: 'सीमा से बाहर',
    itemName: 'आइटम नाम',
    monthlyInput: 'मासिक इनपुट (₹)',
    annualValue: 'वार्षिक मूल्य (₹)',
    total: 'कुल',
    progressVsIncome: 'आय के मुकाबले प्रगति',
    smartCalculations: 'स्मार्ट कैलकुलेशन',
    totalMonthlyIncome: 'कुल मासिक आय',
    totalExpenses: 'कुल खर्च',
    savingsRemaining: 'शेष बचत',
    savingsPercentage: 'बचत प्रतिशत',
    budgetRules: 'बजट नियम',
    ruleHousing: 'हाउसिंग <= 30%',
    ruleTax: 'कर <= 30%',
    ruleInsurance: 'बीमा >= 4%',
    ruleSavings: 'बचत >= 15%',
    ruleLiving: 'जीवन-यापन <= 21%',
    ok: 'ठीक',
    alert: 'चेतावनी',
    budgetAiAssistant: 'बजट एआई सहायक',
    askPlaceholder: 'पूछें: क्या मैं ज़्यादा खर्च कर रहा/रही हूँ?',
    aiInitial: 'मैं बजट प्लानिंग में मदद कर सकता हूँ। जैसे पूछें: "क्या मैं ज़्यादा खर्च कर रहा/रही हूँ?", "मैं और बचत कैसे करूँ?", "क्या मेरा बजट संतुलित है?"',
    aiOnlyBudget: 'मैं केवल बजट से जुड़े सवालों का जवाब देता हूँ। कृपया बचत, खर्च, हाउसिंग, कर, बीमा या बजट संतुलन के बारे में पूछें।',
    aiLowSavings: 'आपकी बचत 15% से कम है। SIP बढ़ाएं या गैर-ज़रूरी खर्च कम करें।',
    aiHighHousing: 'हाउसिंग और कर्ज 30% से अधिक है। संभव हो तो EMI/किराया कम करने पर विचार करें।',
    aiHighOutflow: 'आपका कुल खर्च आय से अधिक है। उच्च खर्च वाली श्रेणियों को तुरंत कम करें।',
    aiHighLiving: 'जीवन-यापन खर्च 21% से अधिक है। दैनिक गैर-ज़रूरी खर्च ट्रैक और कम करें।',
    aiBalanced: 'आपका बजट संतुलित दिख रहा है। इसी अनुशासन को बनाए रखें और धीरे-धीरे बचत बढ़ाएं।',
    aiIncome: 'आय',
    aiExpenses: 'खर्च',
    aiSavings: 'बचत',
    sharesAt: 'शेयर @',
    noTransactions: 'अभी तक कोई लेन-देन नहीं।'
  },
  [Language.TAMIL]: {
    ...({} as BudgetText),
    title: 'பட்ஜெட் திட்டமிடல்',
    description: 'நீங்கள் சேமிப்பு மற்றும் முதலீட்டில் சரியான பாதையில் உள்ளீர்களா என்பதை பார்க்க பட்ஜெட் அவசியம். இது உங்கள் தினசரி செலவுகளையும் கண்காணிக்க உதவும்.',
    categoryTitles: { income: 'வருமானம்', housingDebt: 'வீடு மற்றும் கடன்', tax: 'வரி', insurance: 'காப்பீடு', savingsInvestment: 'சேமிப்பு மற்றும் முதலீடு', livingExpenses: 'வாழ்க்கை செலவுகள்' },
    categoryInfo: { income: 'உங்கள் மாதாந்திர வருமான ஆதாரங்கள்.', housingDebt: 'வீடு/கடன் செலவுகளை கட்டுப்படுத்துங்கள்.', tax: 'மாதாந்திர சராசரி வரியை கண்காணிக்கவும்.', insurance: 'போதுமான பாதுகாப்பு அவசியம்.', savingsInvestment: 'ஒழுங்கான சேமிப்பால் செல்வம் கட்டுங்கள்.', livingExpenses: 'தினசரி வாழ்க்கை செலவுகளை கட்டுப்படுத்துங்கள்.' },
    itemNames: { 'Salary': 'சம்பளம்', 'Freelance/Other': 'ஃப்ரீலான்ஸ்/மற்றவை', 'Rent/EMI': 'வாடகை/EMI', 'Loans': 'கடன்கள்', 'Income Tax (Monthly Avg)': 'வருமானவரி (மாத சராசரி)', 'Health Insurance': 'சுகாதார காப்பீடு', 'Life Insurance': 'உயிர் காப்பீடு', 'SIP': 'SIP', 'Emergency Fund': 'அவசர நிதி', 'Groceries': 'மளிகை', 'Utilities': 'பயன்பாட்டு கட்டணங்கள்', 'Transport': 'போக்குவரத்து', 'Personal/Leisure': 'தனிப்பட்ட/ஓய்வு' },
    hoverInfo: 'மேலும் தகவலுக்கு ஹோவர் செய்யவும்', withinRule: 'விதிக்குள்', outOfRange: 'வரம்புக்கு வெளியே', itemName: 'உருப்படி பெயர்', monthlyInput: 'மாத உள்ளீடு (₹)', annualValue: 'ஆண்டு மதிப்பு (₹)', total: 'மொத்தம்', progressVsIncome: 'வருமானத்துடன் ஒப்பிடும் முன்னேற்றம்', smartCalculations: 'ஸ்மார்ட் கணக்கீடுகள்', totalMonthlyIncome: 'மொத்த மாத வருமானம்', totalExpenses: 'மொத்த செலவுகள்', savingsRemaining: 'மீதமுள்ள சேமிப்பு', savingsPercentage: 'சேமிப்பு சதவீதம்', budgetRules: 'பட்ஜெட் விதிகள்', ruleHousing: 'வீடு <= 30%', ruleTax: 'வரி <= 30%', ruleInsurance: 'காப்பீடு >= 4%', ruleSavings: 'சேமிப்பு >= 15%', ruleLiving: 'வாழ்க்கை <= 21%', ok: 'சரி', alert: 'எச்சரிக்கை', budgetAiAssistant: 'பட்ஜெட் AI உதவியாளர்', askPlaceholder: 'கேளுங்கள்: நான் அதிகம் செலவு செய்கிறேனா?', aiInitial: 'நான் பட்ஜெட் திட்டமிடலில் உதவுவேன். "நான் அதிகம் செலவு செய்கிறேனா?", "மேலும் எப்படி சேமிப்பது?", "என் பட்ஜெட் சமநிலையா?" என்று கேளுங்கள்.', aiOnlyBudget: 'நான் பட்ஜெட்டுக்கு సంబంధించిన கேள்விகளுக்கு மட்டும் பதில் தருவேன். சேமிப்பு, செலவு, வீடு, வரி, காப்பீடு அல்லது சமநிலை பற்றி கேளுங்கள்.', aiLowSavings: 'உங்கள் சேமிப்பு 15% க்குக் குறைவாக உள்ளது. SIP ஐ அதிகரிக்கவும் அல்லது தேவையற்ற செலவுகளை குறைக்கவும்.', aiHighHousing: 'வீடு மற்றும் கடன் செலவு 30% ஐ கடந்துள்ளது. EMI/வாடகையை குறைக்கும் வழிகளை பாருங்கள்.', aiHighOutflow: 'உங்கள் மொத்த செலவு வருமானத்தை மீறுகிறது. அதிக செலவுடைய பிரிவுகளை குறைக்கவும்.', aiHighLiving: 'வாழ்க்கை செலவுகள் 21% ஐ கடந்துள்ளது. தினசரி தேவையற்ற செலவுகளை குறைக்கவும்.', aiBalanced: 'உங்கள் பட்ஜெட் சமநிலையில் உள்ளது. இதே ஒழுக்கத்தை தொடருங்கள்.', aiIncome: 'வருமானம்', aiExpenses: 'செலவுகள்', aiSavings: 'சேமிப்பு', sharesAt: 'ஷேர்கள் @', noTransactions: 'இன்னும் பரிவர்த்தனைகள் இல்லை.'
  },
  [Language.TELUGU]: {
    ...({} as BudgetText),
    title: 'బడ్జెట్ ప్లానింగ్',
    description: 'సేవింగ్స్ మరియు ఇన్వెస్ట్మెంట్స్‌లో మీరు సరైన మార్గంలో ఉన్నారా తెలుసుకోవడానికి బడ్జెట్ అవసరం. ఇది మీ రోజువారీ ఖర్చులను కూడా నియంత్రిస్తుంది.',
    categoryTitles: { income: 'ఆదాయం', housingDebt: 'హౌసింగ్ & అప్పులు', tax: 'పన్ను', insurance: 'బీమా', savingsInvestment: 'సేవింగ్స్ & ఇన్వెస్ట్మెంట్', livingExpenses: 'జీవన ఖర్చులు' },
    categoryInfo: { income: 'మీ నెలవారీ ఆదాయ వనరులు.', housingDebt: 'ఇల్లు/అప్పుల ఖర్చులను నియంత్రించండి.', tax: 'నెలవారీ సగటు పన్నును ట్రాక్ చేయండి.', insurance: 'తగిన రక్షణ అవసరం.', savingsInvestment: 'క్రమమైన సేవింగ్స్‌తో సంపద నిర్మించండి.', livingExpenses: 'రోజువారీ జీవన ఖర్చులను నియంత్రించండి.' },
    itemNames: { 'Salary': 'జీతం', 'Freelance/Other': 'ఫ్రీలాన్స్/ఇతర', 'Rent/EMI': 'ఇంటి అద్దె/EMI', 'Loans': 'రుణాలు', 'Income Tax (Monthly Avg)': 'ఇన్కమ్ ట్యాక్స్ (నెలసగటు)', 'Health Insurance': 'హెల్త్ ఇన్సూరెన్స్', 'Life Insurance': 'లైఫ్ ఇన్సూరెన్స్', 'SIP': 'SIP', 'Emergency Fund': 'ఎమర్జెన్సీ ఫండ్', 'Groceries': 'కిరాణా', 'Utilities': 'యుటిలిటీస్', 'Transport': 'రవాణా', 'Personal/Leisure': 'వ్యక్తిగత/వినోదం' },
    hoverInfo: 'మరింత సమాచారం కోసం హోవర్ చేయండి', withinRule: 'నిబంధనలో ఉంది', outOfRange: 'పరిమితి దాటింది', itemName: 'అంశం పేరు', monthlyInput: 'నెలవారీ ఇన్పుట్ (₹)', annualValue: 'వార్షిక విలువ (₹)', total: 'మొత్తం', progressVsIncome: 'ఆదాయంతో పోల్చితే పురోగతి', smartCalculations: 'స్మార్ట్ లెక్కలు', totalMonthlyIncome: 'మొత్తం నెలవారీ ఆదాయం', totalExpenses: 'మొత్తం ఖర్చులు', savingsRemaining: 'మిగిలిన సేవింగ్స్', savingsPercentage: 'సేవింగ్స్ శాతం', budgetRules: 'బడ్జెట్ నియమాలు', ruleHousing: 'హౌసింగ్ <= 30%', ruleTax: 'పన్ను <= 30%', ruleInsurance: 'బీమా >= 4%', ruleSavings: 'సేవింగ్స్ >= 15%', ruleLiving: 'లివింగ్ <= 21%', ok: 'సరే', alert: 'అలర్ట్', budgetAiAssistant: 'బడ్జెట్ AI అసిస్టెంట్', askPlaceholder: 'అడగండి: నేను ఎక్కువ ఖర్చు చేస్తున్నానా?', aiInitial: 'బడ్జెట్ ప్లానింగ్‌లో నేను సహాయం చేస్తాను. "నేను ఎక్కువ ఖర్చు చేస్తున్నానా?", "ఇంకా ఎలా సేవ్ చేయాలి?", "నా బడ్జెట్ బ్యాలెన్స్‌లో ఉందా?" అని అడగండి.', aiOnlyBudget: 'నేను బడ్జెట్‌కు సంబంధించిన ప్రశ్నలకు మాత్రమే సమాధానం ఇస్తాను. సేవింగ్స్, ఖర్చులు, హౌసింగ్, పన్ను, బీమా లేదా బడ్జెట్ సమతుల్యం గురించి అడగండి.', aiLowSavings: 'మీ సేవింగ్స్ 15% కంటే తక్కువగా ఉన్నాయి. SIP పెంచండి లేదా అవసరం లేని ఖర్చులను తగ్గించండి.', aiHighHousing: 'హౌసింగ్ మరియు అప్పులు 30% పైగా ఉన్నాయి. EMI/అద్దె భారం తగ్గించే మార్గాలు చూడండి.', aiHighOutflow: 'మీ ఖర్చు ఆదాయాన్ని మించింది. అధిక ఖర్చు విభాగాలను వెంటనే తగ్గించండి.', aiHighLiving: 'జీవన ఖర్చులు 21% పైగా ఉన్నాయి. రోజువారీ అవసరం లేని ఖర్చులను తగ్గించండి.', aiBalanced: 'మీ బడ్జెట్ సంతులితంగా ఉంది. ఇదే క్రమశిక్షణ కొనసాగించండి.', aiIncome: 'ఆదాయం', aiExpenses: 'ఖర్చులు', aiSavings: 'సేవింగ్స్', sharesAt: 'షేర్లు @', noTransactions: 'ఇంకా లావాదేవీలు లేవు.'
  },
  [Language.KANNADA]: {
    ...({} as BudgetText),
    title: 'ಬಜೆಟ್ ಯೋಜನೆ',
    description: 'ಉಳಿತಾಯ ಮತ್ತು ಹೂಡಿಕೆಯಲ್ಲಿ ನೀವು ಸರಿಯಾದ ದಾರಿಯಲ್ಲಿ ಇದ್ದೀರಾ ಎಂದು ಪರಿಶೀಲಿಸಲು ಬಜೆಟ್ ಅಗತ್ಯ. ಇದು ನಿಮ್ಮ ದೈನಂದಿನ ಖರ್ಚಿನ ಮೇಲೂ ಗಮನ ಇಡುತ್ತದೆ.',
    categoryTitles: { income: 'ಆದಾಯ', housingDebt: 'ವಸತಿ ಮತ್ತು ಸಾಲ', tax: 'ತೆರಿಗೆ', insurance: 'ವಿಮೆ', savingsInvestment: 'ಉಳಿತಾಯ ಮತ್ತು ಹೂಡಿಕೆ', livingExpenses: 'ಜೀವನ ವೆಚ್ಚ' },
    categoryInfo: { income: 'ನಿಮ್ಮ ತಿಂಗಳಾದಾಯ ಮೂಲಗಳು.', housingDebt: 'ವಸತಿ/ಸಾಲ ವೆಚ್ಚವನ್ನು ನಿಯಂತ್ರಿಸಿ.', tax: 'ತಿಂಗಳ ಸರಾಸರಿ ತೆರಿಗೆಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.', insurance: 'ತಕ್ಕ ರಕ್ಷಣೆಯನ್ನು ನಿರ್ಲಕ್ಷಿಸಬೇಡಿ.', savingsInvestment: 'ನಿಯಮಿತ ಉಳಿತಾಯದಿಂದ ಸಂಪತ್ತು ನಿರ್ಮಿಸಿ.', livingExpenses: 'ದೈನಂದಿನ ವೆಚ್ಚಗಳನ್ನು ನಿಯಂತ್ರಿಸಿ.' },
    itemNames: { 'Salary': 'ವೇತನ', 'Freelance/Other': 'ಫ್ರೀಲಾನ್ಸ್/ಇತರೆ', 'Rent/EMI': 'ಭಾಡಿ/EMI', 'Loans': 'ಸಾಲಗಳು', 'Income Tax (Monthly Avg)': 'ಆದಾಯ ತೆರಿಗೆ (ತಿಂಗಳ ಸರಾಸರಿ)', 'Health Insurance': 'ಆರೋಗ್ಯ ವಿಮೆ', 'Life Insurance': 'ಜೀವ ವಿಮೆ', 'SIP': 'SIP', 'Emergency Fund': 'ತುರ್ತು ನಿಧಿ', 'Groceries': 'ದಿನಸಿ', 'Utilities': 'ಯೂಟಿಲಿಟಿಗಳು', 'Transport': 'ಸಾರಿಗೆ', 'Personal/Leisure': 'ವೈಯಕ್ತಿಕ/ಮನರಂಜನೆ' },
    hoverInfo: 'ಹೆಚ್ಚಿನ ಮಾಹಿತಿಗಾಗಿ ಹೋವರ್ ಮಾಡಿ', withinRule: 'ನಿಯಮದೊಳಗೆ', outOfRange: 'ಮಿತಿಗೆ ಹೊರಗೆ', itemName: 'ಐಟಂ ಹೆಸರು', monthlyInput: 'ಮಾಸಿಕ ಇನ್‌ಪುಟ್ (₹)', annualValue: 'ವಾರ್ಷಿಕ ಮೌಲ್ಯ (₹)', total: 'ಒಟ್ಟು', progressVsIncome: 'ಆದಾಯದ ವಿರುದ್ಧ ಪ್ರಗತಿ', smartCalculations: 'ಸ್ಮಾರ್ಟ್ ಲೆಕ್ಕಾಚಾರಗಳು', totalMonthlyIncome: 'ಒಟ್ಟು ಮಾಸಿಕ ಆದಾಯ', totalExpenses: 'ಒಟ್ಟು ವೆಚ್ಚ', savingsRemaining: 'ಉಳಿದ ಉಳಿತಾಯ', savingsPercentage: 'ಉಳಿತಾಯ ಶೇಕಡಾವಾರು', budgetRules: 'ಬಜೆಟ್ ನಿಯಮಗಳು', ruleHousing: 'ವಸತಿ <= 30%', ruleTax: 'ತೆರಿಗೆ <= 30%', ruleInsurance: 'ವಿಮೆ >= 4%', ruleSavings: 'ಉಳಿತಾಯ >= 15%', ruleLiving: 'ಜೀವನ <= 21%', ok: 'ಸರಿ', alert: 'ಎಚ್ಚರಿಕೆ', budgetAiAssistant: 'ಬಜೆಟ್ AI ಸಹಾಯಕ', askPlaceholder: 'ಕೆಳಿ: ನಾನು ಹೆಚ್ಚು ಖರ್ಚು ಮಾಡುತ್ತಿದ್ದೀನಾ?', aiInitial: 'ನಾನು ಬಜೆಟ್ ಯೋಜನೆಗೆ ಸಹಾಯ ಮಾಡುತ್ತೇನೆ. "ನಾನು ಹೆಚ್ಚು ಖರ್ಚು ಮಾಡುತ್ತಿದ್ದೀನಾ?", "ಇನ್ನಷ್ಟು ಹೇಗೆ ಉಳಿಸಿಕೊಳ್ಳಲಿ?", "ನನ್ನ ಬಜೆಟ್ ಸಮತೋಲನದಲ್ಲಿದೆಯೆ?" ಎಂದು ಕೇಳಿ.', aiOnlyBudget: 'ನಾನು ಬಜೆಟ್ ಸಂಬಂಧಿತ ಪ್ರಶ್ನೆಗಳಿಗೆ ಮಾತ್ರ ಉತ್ತರಿಸುತ್ತೇನೆ. ಉಳಿತಾಯ, ವೆಚ್ಚ, ವಸತಿ, ತೆರಿಗೆ, ವಿಮೆ ಅಥವಾ ಬಜೆಟ್ ಸಮತೋಲನ ಬಗ್ಗೆ ಕೇಳಿ.', aiLowSavings: 'ನಿಮ್ಮ ಉಳಿತಾಯ 15% ಕ್ಕಿಂತ ಕಡಿಮೆ. SIP ಹೆಚ್ಚಿಸಿ ಅಥವಾ ಅವಶ್ಯಕವಲ್ಲದ ವೆಚ್ಚ ಕಡಿಮೆ ಮಾಡಿ.', aiHighHousing: 'ವಸತಿ ಮತ್ತು ಸಾಲ 30% ಕ್ಕಿಂತ ಹೆಚ್ಚು. EMI/ಭಾಡಿ ಭಾರ ಕಡಿಮೆ ಮಾಡುವುದನ್ನು ಪರಿಗಣಿಸಿ.', aiHighOutflow: 'ನಿಮ್ಮ ಹೊರಹರಿವು ಆದಾಯಕ್ಕಿಂತ ಹೆಚ್ಚು. ಹೆಚ್ಚಿನ ವೆಚ್ಚ ವಿಭಾಗಗಳನ್ನು ತಕ್ಷಣ ಕಡಿಮೆ ಮಾಡಿ.', aiHighLiving: 'ಜೀವನ ವೆಚ್ಚ 21% ಮೀರಿದೆ. ದಿನನಿತ್ಯದ ಅಗತ್ಯವಲ್ಲದ ವೆಚ್ಚಗಳನ್ನು ಕಡಿಮೆ ಮಾಡಿ.', aiBalanced: 'ನಿಮ್ಮ ಬಜೆಟ್ ಸಮತೋಲನದಲ್ಲಿದೆ. ಇದೇ ಕ್ರಮ ಮುಂದುವರಿಸಿ.', aiIncome: 'ಆದಾಯ', aiExpenses: 'ವೆಚ್ಚ', aiSavings: 'ಉಳಿತಾಯ', sharesAt: 'ಷೇರುಗಳು @', noTransactions: 'ಇನ್ನೂ ವ್ಯವಹಾರಗಳಿಲ್ಲ.'
  },
  [Language.MALAYALAM]: {
    ...({} as BudgetText),
    title: 'ബജറ്റ് പ്ലാനിംഗ്',
    description: 'സേവിംഗ്സിലും നിക്ഷേപത്തിലും നിങ്ങൾ ശരിയായ വഴിയിലാണോ എന്ന് പരിശോധിക്കാൻ ബജറ്റ് ആവശ്യമാണ്. ഇത് നിങ്ങളുടെ ദിവസേനയുടെ ചിലവുകളും നിയന്ത്രിക്കും.',
    categoryTitles: { income: 'വരുമാനം', housingDebt: 'വീട് & കടം', tax: 'നികുതി', insurance: 'ഇൻഷുറൻസ്', savingsInvestment: 'സേവിംഗ് & നിക്ഷേപം', livingExpenses: 'ജീവിതച്ചെലവുകൾ' },
    categoryInfo: { income: 'നിങ്ങളുടെ മാസവരുമാന ഉറവിടങ്ങൾ.', housingDebt: 'വീട്/കടം ചെലവ് നിയന്ത്രണത്തിൽ വയ്ക്കുക.', tax: 'മാസത്തിലെ ശരാശരി നികുതി ട്രാക്ക് ചെയ്യുക.', insurance: 'മതിയായ സംരക്ഷണം നിർബന്ധമാണ്.', savingsInvestment: 'ക്രമമായ സേവിംഗ് വഴി സമ്പത്ത് സൃഷ്ടിക്കുക.', livingExpenses: 'ദൈനംദിന ചെലവ് നിയന്ത്രിക്കുക.' },
    itemNames: { 'Salary': 'ശമ്പളം', 'Freelance/Other': 'ഫ്രീലാൻസ്/മറ്റ്', 'Rent/EMI': 'വാടക/EMI', 'Loans': 'കടങ്ങൾ', 'Income Tax (Monthly Avg)': 'ഇൻകം ടാക്സ് (മാസ ശരാശരി)', 'Health Insurance': 'ആരോഗ്യ ഇൻഷുറൻസ്', 'Life Insurance': 'ലൈഫ് ഇൻഷുറൻസ്', 'SIP': 'SIP', 'Emergency Fund': 'അടിയന്തര നിധി', 'Groceries': 'പലചരക്ക്', 'Utilities': 'യൂട്ടിലിറ്റികൾ', 'Transport': 'ഗതാഗതം', 'Personal/Leisure': 'സ്വകാര്യം/വിനോദം' },
    hoverInfo: 'കൂടുതൽ വിവരങ്ങൾക്ക് ഹോവർ ചെയ്യുക', withinRule: 'നിയമത്തിനുള്ളിൽ', outOfRange: 'പരിധിക്ക് പുറത്താണ്', itemName: 'ഇനം പേര്', monthlyInput: 'മാസാന്ത ഇൻപുട്ട് (₹)', annualValue: 'വാർഷിക മൂല്യം (₹)', total: 'ആകെ', progressVsIncome: 'വരുമാനത്തോട് താരതമ്യ പ്രോഗ്രസ്', smartCalculations: 'സ്മാർട്ട് കണക്കുകൾ', totalMonthlyIncome: 'ആകെ മാസ വരുമാനം', totalExpenses: 'ആകെ ചെലവ്', savingsRemaining: 'ശേഷിക്കുന്ന സേവിംഗ്', savingsPercentage: 'സേവിംഗ് ശതമാനം', budgetRules: 'ബജറ്റ് നിയമങ്ങൾ', ruleHousing: 'വീട് <= 30%', ruleTax: 'നികുതി <= 30%', ruleInsurance: 'ഇൻഷുറൻസ് >= 4%', ruleSavings: 'സേവിംഗ് >= 15%', ruleLiving: 'ജീവിതച്ചെലവ് <= 21%', ok: 'ശരി', alert: 'അലർട്ട്', budgetAiAssistant: 'ബജറ്റ് AI അസിസ്റ്റന്റ്', askPlaceholder: 'ചോദിക്കുക: ഞാൻ അധികം ചെലവഴിക്കുന്നുണ്ടോ?', aiInitial: 'ബജറ്റ് പ്ലാനിംഗിൽ ഞാൻ സഹായിക്കും. "ഞാൻ അധികം ചെലവഴിക്കുന്നുണ്ടോ?", "കൂടുതൽ എങ്ങനെ സേവ് ചെയ്യാം?", "എന്റെ ബജറ്റ് ബാലൻസ്ഡ് ആണോ?" എന്ന് ചോദിക്കാം.', aiOnlyBudget: 'ഞാൻ ബജറ്റ് സംബന്ധമായ ചോദ്യങ്ങൾക്ക് മാത്രം മറുപടി നൽകും. സേവിംഗ്സ്, ചെലവ്, വീട്, നികുതി, ഇൻഷുറൻസ്, ബജറ്റ് ബാലൻസ് എന്നിവയെക്കുറിച്ച് ചോദിക്കുക.', aiLowSavings: 'നിങ്ങളുടെ സേവിംഗ് 15% ന് താഴെയാണ്. SIP കൂട്ടുകയോ അനാവശ്യ ചെലവുകൾ കുറക്കുകയോ ചെയ്യുക.', aiHighHousing: 'വീട്/കടം ചെലവ് 30% ക്ക് മുകളിലാണ്. EMI/വാടക ഭാരം കുറയ്ക്കാനുള്ള മാർഗങ്ങൾ പരിഗണിക്കുക.', aiHighOutflow: 'നിങ്ങളുടെ ചെലവ് വരുമാനത്തെ കവിയുന്നു. ഉയർന്ന ചെലവുള്ള വിഭാഗങ്ങൾ ഉടൻ കുറയ്ക്കുക.', aiHighLiving: 'ജീവിതച്ചെലവ് 21% ക്ക് മുകളിലാണ്. ദിവസേന അനാവശ്യ ചിലവുകൾ കുറയ്ക്കുക.', aiBalanced: 'നിങ്ങളുടെ ബജറ്റ് ബാലൻസ്ഡ് ആണ്. ഇതേ ശീലം തുടരുക.', aiIncome: 'വരുമാനം', aiExpenses: 'ചെലവ്', aiSavings: 'സേവിംഗ്', sharesAt: 'ഷെയറുകൾ @', noTransactions: 'ഇതുവരെ ഇടപാടുകൾ ഇല്ല.'
  },
  [Language.MARATHI]: {
    ...({} as BudgetText),
    title: 'बजेट नियोजन',
    description: 'बचत आणि गुंतवणुकीसाठी तुम्ही योग्य मार्गावर आहात का हे तपासण्यासाठी बजेट आवश्यक आहे. बजेट तुमच्या दैनंदिन खर्चावरही नियंत्रण ठेवते.',
    categoryTitles: { income: 'उत्पन्न', housingDebt: 'घर आणि कर्ज', tax: 'कर', insurance: 'विमा', savingsInvestment: 'बचत आणि गुंतवणूक', livingExpenses: 'जीवनावश्यक खर्च' },
    categoryInfo: { income: 'तुमचे मासिक उत्पन्न स्रोत.', housingDebt: 'घर/कर्ज खर्च नियंत्रणात ठेवा.', tax: 'मासिक सरासरी कर ट्रॅक करा.', insurance: 'पुरेसे संरक्षण आवश्यक आहे.', savingsInvestment: 'नियमित बचतीने संपत्ती तयार करा.', livingExpenses: 'दैनंदिन खर्च नियंत्रित ठेवा.' },
    itemNames: { 'Salary': 'पगार', 'Freelance/Other': 'फ्रीलान्स/इतर', 'Rent/EMI': 'भाडे/EMI', 'Loans': 'कर्जे', 'Income Tax (Monthly Avg)': 'आयकर (मासिक सरासरी)', 'Health Insurance': 'आरोग्य विमा', 'Life Insurance': 'जीवन विमा', 'SIP': 'SIP', 'Emergency Fund': 'आपत्कालीन निधी', 'Groceries': 'किराणा', 'Utilities': 'युटिलिटी खर्च', 'Transport': 'वाहतूक', 'Personal/Leisure': 'वैयक्तिक/मनोरंजन' },
    hoverInfo: 'अधिक माहितीसाठी होवर करा', withinRule: 'नियमात', outOfRange: 'मर्यादेबाहेर', itemName: 'घटक नाव', monthlyInput: 'मासिक इनपुट (₹)', annualValue: 'वार्षिक मूल्य (₹)', total: 'एकूण', progressVsIncome: 'उत्पन्नाच्या तुलनेत प्रगती', smartCalculations: 'स्मार्ट गणना', totalMonthlyIncome: 'एकूण मासिक उत्पन्न', totalExpenses: 'एकूण खर्च', savingsRemaining: 'उरलेली बचत', savingsPercentage: 'बचत टक्केवारी', budgetRules: 'बजेट नियम', ruleHousing: 'घर <= 30%', ruleTax: 'कर <= 30%', ruleInsurance: 'विमा >= 4%', ruleSavings: 'बचत >= 15%', ruleLiving: 'जीवनावश्यक <= 21%', ok: 'ठीक', alert: 'इशारा', budgetAiAssistant: 'बजेट AI सहाय्यक', askPlaceholder: 'विचारा: मी जास्त खर्च करतोय का?', aiInitial: 'मी बजेट नियोजनात मदत करू शकतो. "मी जास्त खर्च करतोय का?", "मी अधिक बचत कशी करू?", "माझे बजेट संतुलित आहे का?" असे विचारा.', aiOnlyBudget: 'मी फक्त बजेट संबंधित प्रश्नांना उत्तर देतो. बचत, खर्च, घर, कर, विमा किंवा बजेट संतुलनाबद्दल विचारा.', aiLowSavings: 'तुमची बचत 15% पेक्षा कमी आहे. SIP वाढवा किंवा अनावश्यक खर्च कमी करा.', aiHighHousing: 'घर आणि कर्ज खर्च 30% पेक्षा जास्त आहे. EMI/भाडे कमी करण्याचा विचार करा.', aiHighOutflow: 'तुमचा खर्च उत्पन्नापेक्षा जास्त आहे. जास्त खर्चाच्या श्रेणी त्वरित कमी करा.', aiHighLiving: 'जीवनावश्यक खर्च 21% पेक्षा जास्त आहे. दैनंदिन अनावश्यक खर्च कमी करा.', aiBalanced: 'तुमचे बजेट संतुलित आहे. हीच शिस्त कायम ठेवा.', aiIncome: 'उत्पन्न', aiExpenses: 'खर्च', aiSavings: 'बचत', sharesAt: 'शेअर्स @', noTransactions: 'अजून व्यवहार नाहीत.'
  },
  [Language.BENGALI]: {
    ...({} as BudgetText),
    title: 'বাজেট পরিকল্পনা',
    description: 'সেভিংস এবং ইনভেস্টমেন্টে আপনি সঠিক পথে আছেন কি না দেখতে বাজেট জরুরি। বাজেট আপনার দৈনন্দিন খরচও নিয়ন্ত্রণে রাখতে সাহায্য করে।',
    categoryTitles: { income: 'আয়', housingDebt: 'হাউজিং ও ঋণ', tax: 'কর', insurance: 'বীমা', savingsInvestment: 'সঞ্চয় ও বিনিয়োগ', livingExpenses: 'জীবনযাত্রার খরচ' },
    categoryInfo: { income: 'আপনার মাসিক আয়ের উৎসগুলো।', housingDebt: 'বাড়ি/ঋণের খরচ নিয়ন্ত্রণে রাখুন।', tax: 'মাসিক গড় কর ট্র্যাক করুন।', insurance: 'যথেষ্ট সুরক্ষা জরুরি।', savingsInvestment: 'নিয়মিত সঞ্চয়ে সম্পদ গড়ুন।', livingExpenses: 'দৈনন্দিন খরচ নিয়ন্ত্রণ করুন।' },
    itemNames: { 'Salary': 'বেতন', 'Freelance/Other': 'ফ্রিল্যান্স/অন্যান্য', 'Rent/EMI': 'ভাড়া/EMI', 'Loans': 'ঋণ', 'Income Tax (Monthly Avg)': 'আয়কর (মাসিক গড়)', 'Health Insurance': 'স্বাস্থ্য বীমা', 'Life Insurance': 'জীবন বীমা', 'SIP': 'SIP', 'Emergency Fund': 'জরুরি তহবিল', 'Groceries': 'মুদিখানা', 'Utilities': 'ইউটিলিটি', 'Transport': 'যাতায়াত', 'Personal/Leisure': 'ব্যক্তিগত/বিনোদন' },
    hoverInfo: 'আরও তথ্যের জন্য হোভার করুন', withinRule: 'নিয়মের মধ্যে', outOfRange: 'সীমার বাইরে', itemName: 'আইটেম নাম', monthlyInput: 'মাসিক ইনপুট (₹)', annualValue: 'বার্ষিক মূল্য (₹)', total: 'মোট', progressVsIncome: 'আয়ের তুলনায় অগ্রগতি', smartCalculations: 'স্মার্ট হিসাব', totalMonthlyIncome: 'মোট মাসিক আয়', totalExpenses: 'মোট খরচ', savingsRemaining: 'অবশিষ্ট সঞ্চয়', savingsPercentage: 'সঞ্চয়ের শতাংশ', budgetRules: 'বাজেট নিয়ম', ruleHousing: 'হাউজিং <= 30%', ruleTax: 'কর <= 30%', ruleInsurance: 'বীমা >= 4%', ruleSavings: 'সঞ্চয় >= 15%', ruleLiving: 'জীবনযাত্রা <= 21%', ok: 'ঠিক', alert: 'সতর্কতা', budgetAiAssistant: 'বাজেট AI সহকারী', askPlaceholder: 'জিজ্ঞাসা করুন: আমি কি বেশি খরচ করছি?', aiInitial: 'আমি বাজেট পরিকল্পনায় সাহায্য করতে পারি। জিজ্ঞাসা করুন: "আমি কি বেশি খরচ করছি?", "কীভাবে আরও সঞ্চয় করব?", "আমার বাজেট কি ভারসাম্যপূর্ণ?"', aiOnlyBudget: 'আমি শুধু বাজেট সম্পর্কিত প্রশ্নের উত্তর দিই। সঞ্চয়, খরচ, হাউজিং, কর, বীমা বা বাজেট ভারসাম্য নিয়ে জিজ্ঞাসা করুন।', aiLowSavings: 'আপনার সঞ্চয় 15% এর নিচে। SIP বাড়ান বা অপ্রয়োজনীয় খরচ কমান।', aiHighHousing: 'হাউজিং ও ঋণের খরচ 30% এর বেশি। EMI/ভাড়ার চাপ কমানোর কথা ভাবুন।', aiHighOutflow: 'আপনার মোট খরচ আয়ের চেয়ে বেশি। বেশি খরচের বিভাগগুলো দ্রুত কমান।', aiHighLiving: 'জীবনযাত্রার খরচ 21% এর বেশি। দৈনন্দিন অপ্রয়োজনীয় খরচ কমান।', aiBalanced: 'আপনার বাজেট ভারসাম্যপূর্ণ দেখাচ্ছে। এই অভ্যাস বজায় রাখুন।', aiIncome: 'আয়', aiExpenses: 'খরচ', aiSavings: 'সঞ্চয়', sharesAt: 'শেয়ার @', noTransactions: 'এখনও কোনো লেনদেন নেই।'
  }
};

const getBudgetText = (language: Language): BudgetText => BUDGET_TEXTS[language] || BUDGET_TEXTS[Language.ENGLISH];

const budgetUiByLanguage: Record<Language, {
  saveBudget: string;
  resetBudget: string;
  viewHistory: string;
  hideHistory: string;
  savedBudgetHistory: string;
  noSavedBudgets: string;
  saved: string;
  expensesBreakdown: string;
  summary: string;
  confirmReset: string;
  resetDone: string;
  saveDone: string;
}> = {
  [Language.ENGLISH]: {
    saveBudget: 'Save Budget',
    resetBudget: 'Reset Budget',
    viewHistory: 'View History',
    hideHistory: 'Hide History',
    savedBudgetHistory: 'Saved Budget History',
    noSavedBudgets: 'No saved budgets yet. Click "Save Budget" to save your current budget plan.',
    saved: 'Saved',
    expensesBreakdown: 'Expenses Breakdown',
    summary: 'Summary',
    confirmReset: 'Are you sure you want to reset the budget to default values? This action cannot be undone.',
    resetDone: 'Budget has been reset to default values.',
    saveDone: 'Budget saved successfully! You can view it in the history section.'
  },
  [Language.HINDI]: {
    saveBudget: 'बजट सेव करें',
    resetBudget: 'बजट रीसेट करें',
    viewHistory: 'इतिहास देखें',
    hideHistory: 'इतिहास छुपाएं',
    savedBudgetHistory: 'सेव किया गया बजट इतिहास',
    noSavedBudgets: 'अभी तक कोई बजट सेव नहीं किया गया। अपना वर्तमान बजट सेव करने के लिए "बजट सेव करें" पर क्लिक करें।',
    saved: 'सहेजा गया',
    expensesBreakdown: 'खर्च विवरण',
    summary: 'सारांश',
    confirmReset: 'क्या आप वाकई बजट को डिफ़ॉल्ट मानों पर रीसेट करना चाहते हैं? यह कार्रवाई वापस नहीं की जा सकती।',
    resetDone: 'बजट डिफ़ॉल्ट मानों पर रीसेट कर दिया गया है।',
    saveDone: 'बजट सफलतापूर्वक सेव हो गया! आप इसे इतिहास सेक्शन में देख सकते हैं।'
  },
  [Language.TAMIL]: {
    saveBudget: 'பட்ஜெட்டை சேமிக்கவும்',
    resetBudget: 'பட்ஜெட்டை ரீசெட் செய்யவும்',
    viewHistory: 'வரலாற்றைப் பார்க்கவும்',
    hideHistory: 'வரலாற்றை மறைக்கவும்',
    savedBudgetHistory: 'சேமிக்கப்பட்ட பட்ஜெட் வரலாறு',
    noSavedBudgets: 'இன்னும் எந்த பட்ஜெட்டும் சேமிக்கப்படவில்லை. உங்கள் தற்போதைய பட்ஜெட்டை சேமிக்க "பட்ஜெட்டை சேமிக்கவும்" என்பதைக் கிளிக் செய்யவும்.',
    saved: 'சேமிக்கப்பட்டது',
    expensesBreakdown: 'செலவுத் தொகுப்பு',
    summary: 'சுருக்கம்',
    confirmReset: 'நீங்கள் உண்மையாகவே பட்ஜெட்டை இயல்புநிலை மதிப்புகளுக்கு மீட்டமைக்க விரும்புகிறீர்களா? இந்த செயலையை மாற்ற முடியாது.',
    resetDone: 'பட்ஜெட் இயல்புநிலை மதிப்புகளுக்கு மீட்டமைக்கப்பட்டது.',
    saveDone: 'பட்ஜெட் வெற்றிகரமாக சேமிக்கப்பட்டது! அதை வரலாறு பிரிவில் பார்க்கலாம்.'
  },
  [Language.TELUGU]: {
    saveBudget: 'బడ్జెట్ సేవ్ చేయండి',
    resetBudget: 'బడ్జెట్ రీసెట్ చేయండి',
    viewHistory: 'చరిత్ర చూడండి',
    hideHistory: 'చరిత్ర దాచండి',
    savedBudgetHistory: 'సేవ్ చేసిన బడ్జెట్ చరిత్ర',
    noSavedBudgets: 'ఇప్పటివరకు ఎలాంటి బడ్జెట్ సేవ్ కాలేదు. ప్రస్తుత బడ్జెట్‌ను సేవ్ చేయడానికి "బడ్జెట్ సేవ్ చేయండి" పై క్లిక్ చేయండి.',
    saved: 'సేవ్ చేయబడింది',
    expensesBreakdown: 'ఖర్చుల వివరణ',
    summary: 'సారాంశం',
    confirmReset: 'బడ్జెట్‌ను డిఫాల్ట్ విలువలకు రీసెట్ చేయాలని ఖచ్చితంగా కోరుకుంటున్నారా? ఈ చర్యను తిరిగి మార్చలేరు.',
    resetDone: 'బడ్జెట్ డిఫాల్ట్ విలువలకు రీసెట్ చేయబడింది.',
    saveDone: 'బడ్జెట్ విజయవంతంగా సేవ్ అయ్యింది! దీనిని చరిత్ర విభాగంలో చూడవచ్చు.'
  },
  [Language.KANNADA]: {
    saveBudget: 'ಬಜೆಟ್ ಉಳಿಸಿ',
    resetBudget: 'ಬಜೆಟ್ ಮರುಹೊಂದಿಸಿ',
    viewHistory: 'ಇತಿಹಾಸ ನೋಡಿ',
    hideHistory: 'ಇತಿಹಾಸ ಮರೆಮಾಡಿ',
    savedBudgetHistory: 'ಉಳಿಸಿದ ಬಜೆಟ್ ಇತಿಹಾಸ',
    noSavedBudgets: 'ಇನ್ನೂ ಯಾವುದೇ ಬಜೆಟ್ ಉಳಿಸಲಾಗಿಲ್ಲ. ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಬಜೆಟ್ ಉಳಿಸಲು "ಬಜೆಟ್ ಉಳಿಸಿ" ಕ್ಲಿಕ್ ಮಾಡಿ.',
    saved: 'ಉಳಿಸಲಾಗಿದೆ',
    expensesBreakdown: 'ವೆಚ್ಚ ವಿವರ',
    summary: 'ಸಾರಾಂಶ',
    confirmReset: 'ನೀವು ಬಜೆಟ್ ಅನ್ನು ಡೀಫಾಲ್ಟ್ ಮೌಲ್ಯಗಳಿಗೆ ಮರುಹೊಂದಿಸಲು ಖಚಿತವೇ? ಈ ಕ್ರಿಯೆಯನ್ನು ಹಿಂತಿರುಗಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ.',
    resetDone: 'ಬಜೆಟ್ ಡೀಫಾಲ್ಟ್ ಮೌಲ್ಯಗಳಿಗೆ ಮರುಹೊಂದಿಸಲಾಗಿದೆ.',
    saveDone: 'ಬಜೆಟ್ ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ! ಇತಿಹಾಸ ವಿಭಾಗದಲ್ಲಿ ನೋಡಬಹುದು.'
  },
  [Language.MALAYALAM]: {
    saveBudget: 'ബജറ്റ് സേവ് ചെയ്യുക',
    resetBudget: 'ബജറ്റ് റീസെറ്റ് ചെയ്യുക',
    viewHistory: 'ഹിസ്റ്ററി കാണുക',
    hideHistory: 'ഹിസ്റ്ററി മറയ്ക്കുക',
    savedBudgetHistory: 'സേവ് ചെയ്ത ബജറ്റ് ഹിസ്റ്ററി',
    noSavedBudgets: 'ഇതുവരെ ബജറ്റ് സേവ് ചെയ്തിട്ടില്ല. നിലവിലെ ബജറ്റ് സേവ് ചെയ്യാൻ "ബജറ്റ് സേവ് ചെയ്യുക" ക്ലിക്കുചെയ്യുക.',
    saved: 'സേവ് ചെയ്തു',
    expensesBreakdown: 'ചെലവ് വിഭജനം',
    summary: 'സംഗ്രഹം',
    confirmReset: 'ബജറ്റ് ഡീഫോൾട്ട് മൂല്യങ്ങളിലേക്ക് റീസെറ്റ് ചെയ്യണോ? ഈ നടപടി തിരിച്ചെടുക്കാൻ കഴിയില്ല.',
    resetDone: 'ബജറ്റ് ഡീഫോൾട്ട് മൂല്യങ്ങളിലേക്ക് റീസെറ്റ് ചെയ്തു.',
    saveDone: 'ബജറ്റ് വിജയകരമായി സേവ് ചെയ്തു! ഹിസ്റ്ററി സെക്ഷനിൽ കാണാം.'
  },
  [Language.MARATHI]: {
    saveBudget: 'बजेट जतन करा',
    resetBudget: 'बजेट रीसेट करा',
    viewHistory: 'इतिहास पहा',
    hideHistory: 'इतिहास लपवा',
    savedBudgetHistory: 'जतन केलेला बजेट इतिहास',
    noSavedBudgets: 'अजून कोणतेही बजेट जतन झालेले नाही. वर्तमान बजेट जतन करण्यासाठी "बजेट जतन करा" क्लिक करा.',
    saved: 'जतन केले',
    expensesBreakdown: 'खर्च तपशील',
    summary: 'सारांश',
    confirmReset: 'तुम्ही बजेट डीफॉल्ट मूल्यांवर रीसेट करू इच्छिता का? ही क्रिया पूर्ववत करता येणार नाही.',
    resetDone: 'बजेट डीफॉल्ट मूल्यांवर रीसेट केले गेले आहे.',
    saveDone: 'बजेट यशस्वीरित्या जतन झाले! तुम्ही ते इतिहास विभागात पाहू शकता.'
  },
  [Language.BENGALI]: {
    saveBudget: 'বাজেট সেভ করুন',
    resetBudget: 'বাজেট রিসেট করুন',
    viewHistory: 'ইতিহাস দেখুন',
    hideHistory: 'ইতিহাস লুকান',
    savedBudgetHistory: 'সেভ করা বাজেট ইতিহাস',
    noSavedBudgets: 'এখনও কোনো বাজেট সেভ করা হয়নি। বর্তমান বাজেট সেভ করতে "বাজেট সেভ করুন"-এ ক্লিক করুন।',
    saved: 'সেভ করা',
    expensesBreakdown: 'খরচের বিবরণ',
    summary: 'সারাংশ',
    confirmReset: 'আপনি কি বাজেটকে ডিফল্ট মানে রিসেট করতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।',
    resetDone: 'বাজেট ডিফল্ট মানে রিসেট করা হয়েছে।',
    saveDone: 'বাজেট সফলভাবে সেভ হয়েছে! আপনি এটি ইতিহাস বিভাগে দেখতে পারবেন।'
  }
};

export default function Portfolio({ t, setLanguage, currentLanguage }: PortfolioProps) {
  const [data, setData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const budgetText = getBudgetText(currentLanguage);
  const budgetUi = budgetUiByLanguage[currentLanguage] || budgetUiByLanguage[Language.ENGLISH];

  // Initialize budgetData from localStorage or use default values
  const [budgetData, setBudgetData] = useState<Record<BudgetCategoryKey, BudgetItem[]>>(() => {
    try {
      const savedBudget = localStorage.getItem(CURRENT_BUDGET_STORAGE_KEY);
      if (savedBudget) {
        return JSON.parse(savedBudget);
      }
    } catch (error) {
      console.error('Error loading saved budget from localStorage:', error);
    }

    return cloneBudgetData(DEFAULT_BUDGET_DATA);
  });

  // Persist budgetData to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CURRENT_BUDGET_STORAGE_KEY, JSON.stringify(budgetData));
  }, [budgetData]);

  const [budgetChatMessages, setBudgetChatMessages] = useState<Array<{ role: 'user' | 'ai'; text: string }>>(() => [
    {
      role: 'ai',
      text: getBudgetText(currentLanguage).aiInitial
    }
  ]);
  const [budgetInput, setBudgetInput] = useState('');
  const [showHistoryComparison, setShowHistoryComparison] = useState(false);

  const [savedBudgetHistory, setSavedBudgetHistory] = useState<SavedBudget[]>(() => {
    return parseSavedBudgetHistory(localStorage.getItem(SAVED_BUDGET_HISTORY_STORAGE_KEY));
  });

  useEffect(() => {
    localStorage.setItem(SAVED_BUDGET_HISTORY_STORAGE_KEY, JSON.stringify(savedBudgetHistory));
  }, [savedBudgetHistory]);

  // Previous month's budget data
  const [previousMonthBudget] = useState<Record<BudgetCategoryKey, BudgetItem[]>>({
    income: [
      { name: 'Salary', monthly: 80000 },
      { name: 'Freelance/Other', monthly: 3000 }
    ],
    housingDebt: [
      { name: 'Rent/EMI', monthly: 20000 },
      { name: 'Loans', monthly: 5000 }
    ],
    tax: [
      { name: 'Income Tax (Monthly Avg)', monthly: 8000 }
    ],
    insurance: [
      { name: 'Health Insurance', monthly: 2000 },
      { name: 'Life Insurance', monthly: 1500 }
    ],
    savingsInvestment: [
      { name: 'SIP', monthly: 9000 },
      { name: 'Emergency Fund', monthly: 2500 }
    ],
    livingExpenses: [
      { name: 'Groceries', monthly: 5500 },
      { name: 'Utilities', monthly: 2800 },
      { name: 'Transport', monthly: 2200 },
      { name: 'Personal/Leisure', monthly: 3200 }
    ]
  });

  useEffect(() => {
    setBudgetChatMessages([{ role: 'ai', text: getBudgetText(currentLanguage).aiInitial }]);
    setBudgetInput('');
  }, [currentLanguage]);

  // Single load on component mount - NO AUTO REFRESH
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
    // Empty dependency array ensures this runs ONLY once on mount
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

  const budgetCategoryOrder: BudgetCategoryKey[] = budgetCategoryKeys;

  const budgetCategoryMeta: Record<BudgetCategoryKey, { title: string; info: string; ruleType?: 'max' | 'min'; ruleValue?: number }> = {
    income: { title: budgetText.categoryTitles.income, info: budgetText.categoryInfo.income },
    housingDebt: { title: budgetText.categoryTitles.housingDebt, info: budgetText.categoryInfo.housingDebt, ruleType: 'max', ruleValue: 30 },
    tax: { title: budgetText.categoryTitles.tax, info: budgetText.categoryInfo.tax, ruleType: 'max', ruleValue: 30 },
    insurance: { title: budgetText.categoryTitles.insurance, info: budgetText.categoryInfo.insurance, ruleType: 'min', ruleValue: 4 },
    savingsInvestment: { title: budgetText.categoryTitles.savingsInvestment, info: budgetText.categoryInfo.savingsInvestment, ruleType: 'min', ruleValue: 15 },
    livingExpenses: { title: budgetText.categoryTitles.livingExpenses, info: budgetText.categoryInfo.livingExpenses, ruleType: 'max', ruleValue: 21 }
  };

  const updateBudgetValue = (category: BudgetCategoryKey, index: number, value: string) => {
    const parsed = Number(value);
    const monthly = Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
    setBudgetData((prev) => ({
      ...prev,
      [category]: prev[category].map((item, i) => (i === index ? { ...item, monthly } : item))
    }));
  };

  const categoryTotals = budgetCategoryOrder.reduce((acc, key) => {
    acc[key] = budgetData[key].reduce((sum, item) => sum + item.monthly, 0);
    return acc;
  }, {} as Record<BudgetCategoryKey, number>);

  const totalMonthlyIncome = categoryTotals.income;
  const housingTotal = categoryTotals.housingDebt;
  const taxTotal = categoryTotals.tax;
  const insuranceTotal = categoryTotals.insurance;
  const savingsTotal = categoryTotals.savingsInvestment;
  const livingTotal = categoryTotals.livingExpenses;

  const totalExpenses = housingTotal + taxTotal + insuranceTotal + livingTotal;
  const savingsRemaining = totalMonthlyIncome - (totalExpenses + savingsTotal);
  const savingsPercentage = totalMonthlyIncome > 0 ? (savingsTotal / totalMonthlyIncome) * 100 : 0;

  const getPercentOfIncome = (value: number) => (totalMonthlyIncome > 0 ? (value / totalMonthlyIncome) * 100 : 0);

  const ruleChecks = [
    { key: 'housingDebt' as BudgetCategoryKey, label: budgetText.ruleHousing, type: 'max' as const, limit: 30, value: getPercentOfIncome(housingTotal) },
    { key: 'tax' as BudgetCategoryKey, label: budgetText.ruleTax, type: 'max' as const, limit: 30, value: getPercentOfIncome(taxTotal) },
    { key: 'insurance' as BudgetCategoryKey, label: budgetText.ruleInsurance, type: 'min' as const, limit: 4, value: getPercentOfIncome(insuranceTotal) },
    { key: 'savingsInvestment' as BudgetCategoryKey, label: budgetText.ruleSavings, type: 'min' as const, limit: 15, value: savingsPercentage },
    { key: 'livingExpenses' as BudgetCategoryKey, label: budgetText.ruleLiving, type: 'max' as const, limit: 21, value: getPercentOfIncome(livingTotal) }
  ].map((rule) => ({
    ...rule,
    passed: rule.type === 'max' ? rule.value <= rule.limit : rule.value >= rule.limit
  }));

  const categoryRuleStatus: Partial<Record<BudgetCategoryKey, boolean>> = ruleChecks.reduce((acc, rule) => {
    acc[rule.key] = rule.passed;
    return acc;
  }, {} as Partial<Record<BudgetCategoryKey, boolean>>);

  const generateBudgetResponse = (query: string) => {
    const isBudgetQuery = /budget|save|saving|expense|spend|overspend|housing|emi|debt|tax|insurance|balanced|invest/i.test(query);
    if (!isBudgetQuery) {
      return budgetText.aiOnlyBudget;
    }

    const suggestions: string[] = [];
    if (savingsPercentage < 15) suggestions.push(budgetText.aiLowSavings);
    if (getPercentOfIncome(housingTotal) > 30) suggestions.push(budgetText.aiHighHousing);
    if (totalExpenses + savingsTotal > totalMonthlyIncome) suggestions.push(budgetText.aiHighOutflow);
    if (getPercentOfIncome(livingTotal) > 21) suggestions.push(budgetText.aiHighLiving);
    if (suggestions.length === 0) suggestions.push(budgetText.aiBalanced);

    return [
      `${budgetText.aiIncome}: Rs ${totalMonthlyIncome.toLocaleString()} | ${budgetText.aiExpenses}: Rs ${totalExpenses.toLocaleString()} | ${budgetText.aiSavings}: ${savingsPercentage.toFixed(1)}%`,
      ...suggestions
    ].join(' ');
  };

  const sendBudgetMessage = () => {
    const userText = budgetInput.trim();
    if (!userText) return;
    const aiText = generateBudgetResponse(userText);
    setBudgetChatMessages((prev) => [
      ...prev,
      { role: 'user', text: userText },
      { role: 'ai', text: aiText }
    ]);
    setBudgetInput('');
  };

  const saveBudgetPlan = () => {
    const newSavedBudget: SavedBudget = {
      timestamp: new Date(),
      data: cloneBudgetData(budgetData),
      totalIncome: totalMonthlyIncome,
      totalExpenses: totalExpenses,
      totalSavings: savingsTotal,
      savingsPercentage: savingsPercentage
    };
    setSavedBudgetHistory((prev) => [newSavedBudget, ...prev]);
    alert(budgetUi.saveDone);
  };

  const resetBudgetPlan = () => {
    if (window.confirm(budgetUi.confirmReset)) {
      setBudgetData(cloneBudgetData(DEFAULT_BUDGET_DATA));
      localStorage.removeItem(CURRENT_BUDGET_STORAGE_KEY);
      alert(budgetUi.resetDone);
    }
  };

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-serif font-bold">{budgetText.title}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {budgetText.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={saveBudgetPlan}
                  className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <DollarSign size={16} />
                  {budgetUi.saveBudget}
                </button>
                <button
                  onClick={resetBudgetPlan}
                  className="px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-bold hover:bg-orange-700 transition-colors flex items-center gap-2"
                >
                  <Zap size={16} />
                  {budgetUi.resetBudget}
                </button>
                <button
                  onClick={() => setShowHistoryComparison(!showHistoryComparison)}
                  className="px-4 py-2 rounded-xl bg-[#006A4E] text-white text-sm font-bold hover:bg-[#005a42] transition-colors flex items-center gap-2"
                >
                  <History size={16} />
                  {showHistoryComparison ? budgetUi.hideHistory : budgetUi.viewHistory}
                </button>
              </div>
            </div>
            <div className="p-6 space-y-8">
              {!showHistoryComparison ? (
                <>
                  {/* Current Month Budget */}
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                  {budgetCategoryOrder.map((categoryKey) => {
                    const category = budgetCategoryMeta[categoryKey];
                    const total = categoryTotals[categoryKey];
                    const percent = getPercentOfIncome(total);
                    const hasRule = typeof category.ruleValue === 'number' && !!category.ruleType;
                    const isWithinRule = hasRule ? (categoryRuleStatus[categoryKey] ?? true) : true;

                    return (
                      <div
                        key={categoryKey}
                        className={cn(
                          'rounded-2xl border overflow-hidden',
                          hasRule && !isWithinRule ? 'border-red-200 bg-red-50/30' : 'border-gray-100 bg-white'
                        )}
                      >
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-gray-900">{category.title}</h4>
                            <span
                              className="text-gray-400"
                              title={`${budgetText.hoverInfo}: ${category.info}`}
                            >
                              <Info size={14} />
                            </span>
                          </div>
                          {hasRule && (
                            <div className={cn('text-xs font-bold', isWithinRule ? 'text-green-600' : 'text-red-600')}>
                              {isWithinRule ? budgetText.withinRule : budgetText.outOfRange}
                            </div>
                          )}
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[520px]">
                            <thead>
                              <tr className="bg-gray-50 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                <th className="px-5 py-3">{budgetText.itemName}</th>
                                <th className="px-5 py-3 text-right">{budgetText.monthlyInput}</th>
                                <th className="px-5 py-3 text-right">{budgetText.annualValue}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {budgetData[categoryKey].map((item, index) => (
                                <tr key={`${categoryKey}-${index}`}>
                                  <td className="px-5 py-3 text-sm font-medium text-gray-700">{budgetText.itemNames[item.name] || item.name}</td>
                                  <td className="px-5 py-3 text-right">
                                    <input
                                      type="number"
                                      min="0"
                                      value={item.monthly}
                                      onChange={(e) => updateBudgetValue(categoryKey, index, e.target.value)}
                                      className="w-32 text-right rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E]/20 focus:border-[#006A4E]"
                                    />
                                  </td>
                                  <td className="px-5 py-3 text-right text-sm font-bold text-gray-900">₹{(item.monthly * 12).toLocaleString()}</td>
                                </tr>
                              ))}
                              <tr className="bg-gray-50">
                                <td className="px-5 py-3 font-bold text-gray-900">{budgetText.total}</td>
                                <td className="px-5 py-3 text-right font-bold text-[#006A4E]">₹{total.toLocaleString()}</td>
                                <td className="px-5 py-3 text-right font-bold text-[#006A4E]">₹{(total * 12).toLocaleString()}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <div className="px-5 pb-4 pt-3">
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="text-gray-500">{budgetText.progressVsIncome}</span>
                            <span className={cn('font-bold', hasRule && !isWithinRule ? 'text-red-600' : 'text-[#006A4E]')}>
                              {percent.toFixed(1)}%
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className={cn('h-full rounded-full transition-all', hasRule && !isWithinRule ? 'bg-red-500' : 'bg-[#006A4E]')}
                              style={{ width: `${Math.min(percent, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-6">
                  <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-[#006A4E] to-[#005a42] text-white p-5">
                    <h4 className="text-base font-bold mb-4 flex items-center gap-2">
                      <DollarSign size={18} className="text-yellow-400" />
                      {budgetText.smartCalculations}
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-white/70">{budgetText.totalMonthlyIncome}</span><span className="font-bold">₹{totalMonthlyIncome.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-white/70">{budgetText.totalExpenses}</span><span className="font-bold">₹{totalExpenses.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-white/70">{budgetText.savingsRemaining}</span><span className={cn('font-bold', savingsRemaining < 0 ? 'text-red-200' : 'text-green-200')}>₹{savingsRemaining.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-white/70">{budgetText.savingsPercentage}</span><span className="font-bold">{savingsPercentage.toFixed(1)}%</span></div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-white p-5">
                    <h4 className="text-base font-bold text-gray-900 mb-4">{budgetText.budgetRules}</h4>
                    <div className="space-y-3">
                      {ruleChecks.map((rule) => (
                        <div key={rule.label} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{rule.label}</span>
                          <span className={cn('font-bold', rule.passed ? 'text-green-600' : 'text-red-600')}>
                            {rule.passed ? budgetText.ok : budgetText.alert} {rule.value.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                      <MessageSquare size={16} className="text-[#006A4E]" />
                      <h4 className="font-bold text-gray-900">{budgetText.budgetAiAssistant}</h4>
                    </div>

                    <div className="h-64 overflow-y-auto p-4 space-y-3 bg-gray-50">
                      {budgetChatMessages.map((message, index) => (
                        <div key={index} className={cn('max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed', message.role === 'user' ? 'ml-auto bg-[#006A4E] text-white rounded-tr-none' : 'mr-auto bg-white text-gray-800 border border-gray-100 rounded-tl-none')}>
                          {message.text}
                        </div>
                      ))}
                    </div>

                    <div className="p-3 border-t border-gray-100 flex items-center gap-2">
                      <input
                        value={budgetInput}
                        onChange={(e) => setBudgetInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendBudgetMessage()}
                        placeholder={budgetText.askPlaceholder}
                        className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E]/20 focus:border-[#006A4E]"
                      />
                      <button
                        onClick={sendBudgetMessage}
                        className="px-3 py-2 rounded-xl bg-[#006A4E] text-white hover:bg-[#005a42] transition-colors"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
                  </>
                ) : (
                  <>
                  {/* Saved Budget History */}
                  <div className="space-y-6">
                    <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <History size={20} className="text-[#006A4E]" />
                      {budgetUi.savedBudgetHistory}
                    </h4>
                    
                    {savedBudgetHistory.length === 0 ? (
                      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-8 text-center">
                        <p className="text-gray-500">{budgetUi.noSavedBudgets}</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {savedBudgetHistory.map((savedBudget, index) => (
                          <div key={index} className="rounded-2xl border border-gray-100 bg-white p-5 space-y-4">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                              <h5 className="font-bold text-gray-900">
                                {savedBudget.timestamp.toLocaleDateString()} {savedBudget.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </h5>
                              <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{budgetUi.saved}</span>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                                <h6 className="font-bold text-gray-900 mb-2 text-sm">{budgetText.totalMonthlyIncome}</h6>
                                <div className="space-y-1 text-xs">
                                  {savedBudget.data.income.map((item) => (
                                    <div key={item.name} className="flex justify-between"><span>{budgetText.itemNames[item.name] || item.name}</span><span className="font-bold">₹{item.monthly.toLocaleString()}</span></div>
                                  ))}
                                  <div className="border-t border-blue-200 pt-1 flex justify-between"><span className="font-bold">{budgetText.total}</span><span className="font-bold text-[#006A4E]">₹{savedBudget.totalIncome.toLocaleString()}</span></div>
                                </div>
                              </div>

                              <div className="rounded-xl border border-orange-100 bg-orange-50 p-4">
                                <h6 className="font-bold text-gray-900 mb-2 text-sm">{budgetUi.expensesBreakdown}</h6>
                                <div className="space-y-1 text-xs">
                                  <div className="flex justify-between"><span>{budgetText.categoryTitles.housingDebt}</span><span className="font-bold">₹{(savedBudget.data.housingDebt.reduce((sum, i) => sum + i.monthly, 0)).toLocaleString()}</span></div>
                                  <div className="flex justify-between"><span>{budgetText.categoryTitles.tax}</span><span className="font-bold">₹{(savedBudget.data.tax.reduce((sum, i) => sum + i.monthly, 0)).toLocaleString()}</span></div>
                                  <div className="flex justify-between"><span>{budgetText.categoryTitles.insurance}</span><span className="font-bold">₹{(savedBudget.data.insurance.reduce((sum, i) => sum + i.monthly, 0)).toLocaleString()}</span></div>
                                  <div className="flex justify-between"><span>{budgetText.categoryTitles.livingExpenses}</span><span className="font-bold">₹{(savedBudget.data.livingExpenses.reduce((sum, i) => sum + i.monthly, 0)).toLocaleString()}</span></div>
                                  <div className="border-t border-orange-200 pt-1 flex justify-between"><span className="font-bold">{budgetText.total}</span><span className="font-bold text-red-600">₹{savedBudget.totalExpenses.toLocaleString()}</span></div>
                                </div>
                              </div>

                              <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                                <h6 className="font-bold text-gray-900 mb-2 text-sm">{budgetText.categoryTitles.savingsInvestment}</h6>
                                <div className="space-y-1 text-xs">
                                  {savedBudget.data.savingsInvestment.map((item) => (
                                    <div key={item.name} className="flex justify-between"><span>{budgetText.itemNames[item.name] || item.name}</span><span className="font-bold">₹{item.monthly.toLocaleString()}</span></div>
                                  ))}
                                  <div className="border-t border-green-200 pt-1 flex justify-between"><span className="font-bold">{budgetText.total}</span><span className="font-bold text-green-600">₹{savedBudget.totalSavings.toLocaleString()}</span></div>
                                </div>
                              </div>

                              <div className="rounded-xl border border-purple-100 bg-purple-50 p-4">
                                <h6 className="font-bold text-gray-900 mb-2 text-sm">{budgetUi.summary}</h6>
                                <div className="space-y-1 text-xs">
                                  <div className="flex justify-between"><span>{budgetText.totalMonthlyIncome}</span><span className="font-bold">₹{savedBudget.totalIncome.toLocaleString()}</span></div>
                                  <div className="flex justify-between"><span>{budgetText.totalExpenses}</span><span className="font-bold">₹{savedBudget.totalExpenses.toLocaleString()}</span></div>
                                  <div className="flex justify-between"><span>{budgetText.aiSavings}</span><span className="font-bold">₹{savedBudget.totalSavings.toLocaleString()}</span></div>
                                  <div className="border-t border-purple-200 pt-1 flex justify-between"><span className="font-bold">{budgetText.savingsRemaining}</span><span className="font-bold text-[#006A4E]">₹{(savedBudget.totalIncome - savedBudget.totalExpenses - savedBudget.totalSavings).toLocaleString()}</span></div>
                                  <div className="flex justify-between"><span>{budgetText.savingsPercentage}</span><span className="font-bold">{savedBudget.savingsPercentage.toFixed(1)}%</span></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  </>
                )}
            </div>
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
                    <div className="text-xs text-gray-400">{t_item.quantity} {budgetText.sharesAt} ₹{t_item.price.toFixed(2)}</div>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className="p-8 text-center text-gray-400 text-sm">{budgetText.noTransactions}</div>
              )}
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
