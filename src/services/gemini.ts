import { GoogleGenAI } from "@google/genai";
import { UserProfile, FinancialAdvice, FinancialAdviceSchema, Language } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getFinancialAdvice(profile: UserProfile): Promise<FinancialAdvice> {
  const ai = getAI();
  const model = "gemini-3.1-pro-preview";

  const prompt = `
    Analyze the following financial profile for an Indian user and provide structured advice in ${profile.language}.
    Use Indian currency (INR) and financial practices (like SIP, PPF, FD, Gold).
    
    User Profile:
    - Age: ${profile.age}
    - Monthly Income: ₹${profile.monthlyIncome}
    - Monthly Expenses: ₹${profile.monthlyExpenses}
    - Current Savings: ₹${profile.currentSavings}
    - Existing Investments: ₹${profile.existingInvestments}
    - Debt/Loans: ₹${profile.debt}
    - Dependents: ${profile.dependents}
    - Goals: ${profile.financialGoals}
    - Risk Tolerance: ${profile.riskTolerance}

    Requirements:
    1. Respond in ${profile.language}.
    2. Use simple, non-jargon language suitable for common Indian households.
    3. Do not use any emojis.
    4. Provide a health score (0-100).
    5. Suggest a budget plan (50/30/20 rule or similar).
    6. Calculate emergency fund (typically 6 months of expenses).
    7. Suggest SIP amounts based on goals and risk.
    8. Include fraud awareness tips relevant to India (e.g., UPI scams, fake investment apps).
    9. Warn about high debt if applicable.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: FinancialAdviceSchema,
      systemInstruction: "You are FINORA, a trusted vernacular financial mentor for India. You provide clear, practical, and safe financial advice. You never use emojis. You focus on long-term discipline and fraud prevention.",
    },
  });

  return JSON.parse(response.text || "{}") as FinancialAdvice;
}

export async function chatWithFinora(profile: UserProfile, message: string, history: { role: "user" | "model"; parts: { text: string }[] }[]) {
  const ai = getAI();
  const model = "gemini-3.1-pro-preview";

  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction: `
        You are FINORA, a trusted financial mentor for India.
        The user's profile is: ${JSON.stringify(profile)}.
        Always respond in ${profile.language}.
        Do not use emojis.
        Keep advice simple, practical, and culturally relevant to India.
        Focus on safety, long-term wealth, and avoiding scams.
        If the user asks for illegal advice or high-risk speculation, politely decline and explain why it is risky.
      `,
    },
    history,
  });

  const result = await chat.sendMessage({ message });
  return result.text;
}
