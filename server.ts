import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 3000;
const distPath = path.join(__dirname, "dist/spa");

// Import all route handlers directly
import { handleDemo } from "./server/routes/demo.ts";
import { handleSignup, handleLogin } from "./server/routes/auth.ts";
import {
  handleGetVideos,
  handleGetVideo,
  handleVote,
  handleGetDailyVotes,
} from "./server/routes/videos.ts";
import { handleGetBalance, handleGetTransactions } from "./server/routes/balance.ts";
import {
  handleCreateWithdrawal,
  handleGetWithdrawals,
  handleCancelWithdrawal,
  handleSimulateFeePayment,
  handleAddBankDetails,
} from "./server/routes/withdrawals.ts";
import { seedVideos } from "./server/db-postgres.ts";

// Initialize database on startup
seedVideos().catch((err) => {
  console.error("Failed to seed videos:", err);
});

function createServer() {
  const app = express();

  // Middleware
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

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
app.get("*", (req: any, res: any) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
