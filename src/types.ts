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
