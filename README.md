# FINORA - AI-Powered Intelligent Investing Platform

A complete stock market platform integrated with **Gemini 2.0 Flash**, providing real-time data, AI trading assistance, portfolio tracking, and personalized investment guidance.

## ✨ Features

- 🤖 **AI Stock Assistant** - Get intelligent trading insights powered by Gemini AI
- 📊 **Real-time Market Data** - Live stock prices and market trends
- 💼 **Portfolio Management** - Track your investments and performance
- 🎯 **Investment Hub** - Curated investment opportunities
- 📈 **Market Explorer** - Comprehensive market analysis tools
- 💬 **Interactive Chat** - Natural language queries about stocks and markets

## 🚀 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite
- **Backend**: Express.js, Node.js
- **AI**: Google Gemini 2.0 Flash API
- **Market Data**: Kite Connect API
- **UI Components**: Lucide React, Recharts, Motion

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Gemini API key ([Get it here](https://aistudio.google.com/app/apikey))
- Kite Connect API credentials ([Sign up here](https://kite.trade/))

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mini__project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and add your API keys:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   KITE_API_KEY=your_kite_api_key_here
   KITE_API_SECRET=your_kite_api_secret_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173`

## 📦 Build for Production

```bash
npm run build
npm run preview
```

## 🧹 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run clean` - Clean build artifacts
- `npm run lint` - Type check with TypeScript

## ⚠️ Security Notes

- **Never commit your `.env` file** - It contains sensitive API keys
- The `.env.example` file is a template - replace placeholder values with real credentials
- Keep your API keys secret and rotate them regularly

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Note:** This project uses the Gemini AI API and Kite Connect API. Make sure you comply with their respective terms of service and usage policies.
