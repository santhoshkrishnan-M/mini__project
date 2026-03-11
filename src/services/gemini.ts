import { GoogleGenAI } from "@google/genai";
import { 
  UserProfile, 
  FinancialAdvice, 
  FinancialAdviceSchema, 
  Language, 
  StockNews, 
  StockAnalysis, 
  StockAnalysisSchema,
  TradeSuggestion,
  TradeSuggestionSchema,
  InvestmentGuidance,
  InvestmentGuidanceSchema
} from "../types";

const getAI = () => new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY
});
const MODEL_NAME = "gemini-2.5-flash";

const STOCK_DATA_API_URL = "https://api.stockdata.org/v1/news?api_token=H10BAGzRcsW5xQbE9hcjfR3492bawn1taTJTGjVS";

export async function getStockMarketAnalysis(): Promise<StockAnalysis> {
  const ai = getAI();
  const model = MODEL_NAME;

  // Fetch real-time news
  const newsResponse = await fetch(STOCK_DATA_API_URL);
  if (!newsResponse.ok) {
    throw new Error(`StockData API error: ${newsResponse.statusText}`);
  }
  const newsData: StockNews = await newsResponse.json();

  const newsItems = newsData?.data || [];
  const newsContext = newsItems.length > 0 
    ? JSON.stringify(newsItems.slice(0, 10))
    : "No recent news available. Provide general market sentiment based on your knowledge.";

  const prompt = `
    You are a Personal AI Stock Market Assistant.
    Analyze the following real-time stock market news and provide structured advice.
    
    News Data:
    ${newsContext}

    Workflow:
    Step 1 — Market Scan: Identify trending companies and highlight major events.
    Step 2 — Quick Analysis: For each stock, provide ticker symbol, estimated current price in USD, trend, risk level, and reason.
    Step 3 — Strategy: Suggest Buy, Watch, Sell, or Long-term hold.
    Step 4 — Money Strategy: Help user save money, avoid emotional trading, and invest systematically.

    Investment Principles:
    - Never recommend risky moves without warning.
    - Encourage diversification.
    - Suggest SIP / phased investing.
    - Focus on long-term growth.

    Tone:
    - Friendly, intelligent, mentor-like.
    - Behave like Warren Buffett for long-term, a quant for risk, and a mentor for teaching.
    - Explain everything in simple English.
    - Do not use emojis.
    - Ensure the 'symbol' is a valid stock ticker (e.g., AAPL, TSLA, NVDA).
    - Ensure 'currentPrice' is a realistic number based on the news context.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: StockAnalysisSchema,
      systemInstruction: "You are a Personal AI Stock Market Assistant. You help individual investors make smart, safe decisions. You explain complex concepts in simple English. You never use emojis.",
    },
  });

  return JSON.parse(response.text || "{}") as StockAnalysis;
}

export async function getFinancialAdvice(profile: UserProfile): Promise<FinancialAdvice> {
  const ai = getAI();
  const model = MODEL_NAME;

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
  const model = MODEL_NAME;

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

export async function getMarketExplanation(marketData: any): Promise<string> {
  const ai = getAI();
  const model = MODEL_NAME;

  const prompt = `
    Explain the current market movements based on this data:
    ${JSON.stringify(marketData)}
    
    Provide a simple, clear explanation for a beginner investor. 
    Focus on WHY things are moving and what it means for the average person.
    Do not use emojis.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      systemInstruction: "You are a financial analyst who explains market trends in simple English.",
    },
  });

  return response.text || "Market is stable today.";
}

export async function getTradeSuggestion(symbol: string, price: number, news: any[]): Promise<TradeSuggestion> {
  const ai = getAI();
  const model = MODEL_NAME;

  const prompt = `
    Analyze the stock ${symbol} currently priced at $${price}.
    Recent news: ${JSON.stringify(news)}
    
    Decide if the user should Buy, Sell, or Hold.
    Provide confidence level (0-1), reasoning, risk level, and suggested target/stop-loss.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: TradeSuggestionSchema,
      systemInstruction: "You are a professional trading assistant. You provide data-driven buy/sell/hold suggestions.",
    },
  });

  return JSON.parse(response.text || "{}") as TradeSuggestion;
}

export async function getInvestmentGuidance(type: "SIP" | "SWP" | "FD" | "Mutual Funds"): Promise<InvestmentGuidance> {
  const ai = getAI();
  const model = MODEL_NAME;

  const prompt = `
    Provide comprehensive guidance for ${type} investments in the Indian context.
    Include description, expected returns, risk level, AI advice, and a comparison with other options.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: InvestmentGuidanceSchema,
      systemInstruction: "You are an expert investment advisor specializing in Indian financial instruments.",
    },
  });

  return JSON.parse(response.text || "{}") as InvestmentGuidance;
}
