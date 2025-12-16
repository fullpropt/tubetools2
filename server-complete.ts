import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { createServer } from "./server/index";

const port = process.env.PORT || 3000;
const distPath = path.join(__dirname, "dist/spa");

// Initialize database on startup
seedVideos().catch((err) => {
  console.error("Failed to seed videos:", err);
});

function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Disable compression to avoid stream reading issues
  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  // Example API routes
  app.get(["/ping", "/api/ping"], (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get(["/demo", "/api/demo"], handleDemo);

  // Auth routes
  app.post(["/auth/signup", "/api/auth/signup"], handleSignup);
  app.post(["/auth/login", "/api/auth/login"], handleLogin);

  // Video routes
  app.get(["/videos", "/api/videos"], handleGetVideos);
  app.get(["/videos/:id", "/api/videos/:id"], handleGetVideo);
  app.post(["/videos/:id/vote", "/api/videos/:id/vote"], handleVote);
  app.get(["/daily-votes", "/api/daily-votes"], handleGetDailyVotes);

  // Balance and transaction routes
  app.get(["/balance", "/api/balance"], handleGetBalance);
  app.get(["/transactions", "/api/transactions"], handleGetTransactions);

  // Withdrawal routes
  app.post(["/withdrawals", "/api/withdrawals"], handleCreateWithdrawal);
  app.get(["/withdrawals", "/api/withdrawals"], handleGetWithdrawals);
  app.post(["/withdrawals/bank-details", "/api/withdrawals/bank-details"], handleAddBankDetails);
  app.post(["/withdrawals/cancel", "/api/withdrawals/cancel"], handleCancelWithdrawal);
  app.post(["/withdrawals/simulate-fee-payment", "/api/withdrawals/simulate-fee-payment"], handleSimulateFeePayment);

  return app;
}

const app = createServer();

// Serve static files
app.use(express.static(distPath));

// Handle React Router
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});