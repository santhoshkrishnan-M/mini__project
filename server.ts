import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("finora.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS portfolio (
    symbol TEXT PRIMARY KEY,
    name TEXT,
    quantity REAL,
    avgPrice REAL
  );
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT,
    type TEXT,
    quantity REAL,
    price REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS user_balance (
    id INTEGER PRIMARY KEY,
    balance REAL
  );
`);

// Set initial balance if not exists
const balanceRow = db.prepare("SELECT balance FROM user_balance WHERE id = 1").get();
if (!balanceRow) {
  db.prepare("INSERT INTO user_balance (id, balance) VALUES (1, 100000)").run();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/portfolio", (req, res) => {
    const items = db.prepare("SELECT * FROM portfolio").all();
    const balanceRow = db.prepare("SELECT balance FROM user_balance WHERE id = 1").get() as { balance: number };
    res.json({ items, balance: balanceRow.balance });
  });

  app.post("/api/trade", (req, res) => {
    const { symbol, name, type, quantity, price } = req.body;
    const balanceRow = db.prepare("SELECT balance FROM user_balance WHERE id = 1").get() as { balance: number };
    const totalCost = quantity * price;

    if (type === "BUY") {
      if (balanceRow.balance < totalCost) {
        return res.status(400).json({ error: "Insufficient balance" });
      }

      // Update balance
      db.prepare("UPDATE user_balance SET balance = balance - ? WHERE id = 1").run(totalCost);

      // Update portfolio
      const existing = db.prepare("SELECT * FROM portfolio WHERE symbol = ?").get() as any;
      if (existing) {
        const newQty = existing.quantity + quantity;
        const newAvg = (existing.avgPrice * existing.quantity + totalCost) / newQty;
        db.prepare("UPDATE portfolio SET quantity = ?, avgPrice = ? WHERE symbol = ?").run(newQty, newAvg, symbol);
      } else {
        db.prepare("INSERT INTO portfolio (symbol, name, quantity, avgPrice) VALUES (?, ?, ?, ?)").run(symbol, name, quantity, price);
      }
    } else if (type === "SELL") {
      const existing = db.prepare("SELECT * FROM portfolio WHERE symbol = ?").get() as any;
      if (!existing || existing.quantity < quantity) {
        return res.status(400).json({ error: "Insufficient shares" });
      }

      // Update balance
      db.prepare("UPDATE user_balance SET balance = balance + ? WHERE id = 1").run(totalCost);

      // Update portfolio
      const newQty = existing.quantity - quantity;
      if (newQty === 0) {
        db.prepare("DELETE FROM portfolio WHERE symbol = ?").run(symbol);
      } else {
        db.prepare("UPDATE portfolio SET quantity = ? WHERE symbol = ?").run(newQty, symbol);
      }
    }

    // Record transaction
    db.prepare("INSERT INTO transactions (symbol, type, quantity, price) VALUES (?, ?, ?, ?)").run(symbol, type, quantity, price);

    res.json({ success: true });
  });

  app.get("/api/transactions", (req, res) => {
    const transactions = db.prepare("SELECT * FROM transactions ORDER BY timestamp DESC").all();
    res.json(transactions);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
