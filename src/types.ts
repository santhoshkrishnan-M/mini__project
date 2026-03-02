import { Type } from "@google/genai";

export enum Language {
  ENGLISH = "English",
  HINDI = "Hindi",
  TAMIL = "Tamil",
  TELUGU = "Telugu",
  KANNADA = "Kannada",
  MALAYALAM = "Malayalam",
  MARATHI = "Marathi",
  BENGALI = "Bengali",
}

export enum RiskTolerance {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
}

export interface UserProfile {
  age: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  currentSavings: number;
  existingInvestments: number;
  debt: number;
  dependents: number;
  financialGoals: string;
  riskTolerance: RiskTolerance;
  language: Language;
}

export interface FinancialAdvice {
  healthScore: number;
  recommendedMonthlySavings: number;
  suggestedSIPAmount: number;
  emergencyFundTarget: number;
  budgetPlan: {
    necessities: number;
    wants: number;
    savings: number;
  };
  investmentSuggestions: string[];
  retirementReadiness: string;
  riskWarnings: string[];
  fraudAwarenessTips: string[];
  keyAdvice: string;
  nextBestAction: string;
}

export const FinancialAdviceSchema = {
  type: Type.OBJECT,
  properties: {
    healthScore: { type: Type.NUMBER, description: "A score from 0-100 representing financial health." },
    recommendedMonthlySavings: { type: Type.NUMBER },
    suggestedSIPAmount: { type: Type.NUMBER },
    emergencyFundTarget: { type: Type.NUMBER },
    budgetPlan: {
      type: Type.OBJECT,
      properties: {
        necessities: { type: Type.NUMBER },
        wants: { type: Type.NUMBER },
        savings: { type: Type.NUMBER },
      },
      required: ["necessities", "wants", "savings"],
    },
    investmentSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
    retirementReadiness: { type: Type.STRING },
    riskWarnings: { type: Type.ARRAY, items: { type: Type.STRING } },
    fraudAwarenessTips: { type: Type.ARRAY, items: { type: Type.STRING } },
    keyAdvice: { type: Type.STRING },
    nextBestAction: { type: Type.STRING },
  },
  required: [
    "healthScore",
    "recommendedMonthlySavings",
    "suggestedSIPAmount",
    "emergencyFundTarget",
    "budgetPlan",
    "investmentSuggestions",
    "retirementReadiness",
    "riskWarnings",
    "fraudAwarenessTips",
    "keyAdvice",
    "nextBestAction",
  ],
};

export interface StockNews {
  data: Array<{
    uuid: string;
    title: string;
    description: string;
    snippet: string;
    url: string;
    image_url: string;
    language: string;
    published_at: string;
    source: string;
    relevance_score: number | null;
    entities: Array<{
      symbol: string;
      name: string;
      exchange: string;
      exchange_long: string;
      country: string;
      type: string;
      industry: string;
      match_score: number;
      sentiment_score: number;
      highlights: Array<{
        highlight: string;
        sentiment: number;
        highlighted_in: string;
      }>;
    }>;
    similar: Array<any>;
  }>;
}

export interface StockAnalysis {
  marketSummary: string;
  topOpportunities: Array<{
    stock: string;
    symbol: string;
    currentPrice: number;
    trend: "Bullish" | "Bearish" | "Neutral";
    risk: "Low" | "Medium" | "High";
    reason: string;
    action: string;
    strategy: "Buy" | "Watch" | "Sell" | "Long-term hold";
  }>;
  stocksToWatch: string[];
  riskAlerts: string[];
  smartMoneyTips: string[];
}

export interface PortfolioItem {
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
}

export interface UserPortfolio {
  balance: number;
  items: PortfolioItem[];
}

export const StockAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    marketSummary: { type: Type.STRING },
    topOpportunities: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          stock: { type: Type.STRING },
          symbol: { type: Type.STRING, description: "Stock ticker symbol (e.g., TSLA, AAPL)" },
          currentPrice: { type: Type.NUMBER, description: "Estimated current market price in USD" },
          trend: { type: Type.STRING, enum: ["Bullish", "Bearish", "Neutral"] },
          risk: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
          reason: { type: Type.STRING },
          action: { type: Type.STRING },
          strategy: { type: Type.STRING, enum: ["Buy", "Watch", "Sell", "Long-term hold"] },
        },
        required: ["stock", "symbol", "currentPrice", "trend", "risk", "reason", "action", "strategy"],
      },
    },
    stocksToWatch: { type: Type.ARRAY, items: { type: Type.STRING } },
    riskAlerts: { type: Type.ARRAY, items: { type: Type.STRING } },
    smartMoneyTips: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["marketSummary", "topOpportunities", "stocksToWatch", "riskAlerts", "smartMoneyTips"],
};
