import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import { RequestHandler } from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 3000;
const distPath = path.join(__dirname, "dist/spa");

// Inline demo handler
const handleDemo: RequestHandler = (req, res) => {
  res.status(200).json({ message: "Hello from Express server" });
};

// Inline auth handlers
const handleSignup: RequestHandler = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    // Simplified signup logic
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Signup failed" });
  }
};

const handleLogin: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Simplified login logic
    res.json({ token: "mock-token", user: { email, name: "Test User" } });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};

// Inline video handlers
const handleGetVideos: RequestHandler = async (req, res) => {
  try {
    // Mock videos data
    const videos = [
      {
        id: 1,
        title: "Sample Video 1",
        youtube_id: "abc123",
        thumbnail: "https://img.youtube.com/vi/abc123/maxresdefault.jpg",
        reward_min: 10,
        reward_max: 50
      },
      {
        id: 2,
        title: "Sample Video 2", 
        youtube_id: "def456",
        thumbnail: "https://img.youtube.com/vi/def456/maxresdefault.jpg",
        reward_min: 15,
        reward_max: 75
      }
    ];
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: "Failed to get videos" });
  }
};

const handleGetVideo: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    // Mock video data
    const video = {
      id: parseInt(id),
      title: `Sample Video ${id}`,
      youtube_id: `video${id}`,
      thumbnail: `https://img.youtube.com/vi/video${id}/maxresdefault.jpg`,
      reward_min: 10,
      reward_max: 50
    };
    res.json(video);
  } catch (error) {
    res.status(500).json({ error: "Failed to get video" });
  }
};

const handleVote: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    // Mock vote logic
    const reward = Math.floor(Math.random() * 40) + 10; // 10-50
    res.json({ 
      message: "Vote recorded",
      reward: reward,
      new_balance: 1000 + reward
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to vote" });
  }
};

const handleGetDailyVotes: RequestHandler = async (req, res) => {
  try {
    // Mock daily votes
    res.json({ votes_left: 5, max_votes: 10 });
  } catch (error) {
    res.status(500).json({ error: "Failed to get daily votes" });
  }
};

// Inline balance handlers
const handleGetBalance: RequestHandler = async (req, res) => {
  try {
    // Mock balance
    res.json({ balance: 1000, currency: "USD" });
  } catch (error) {
    res.status(500).json({ error: "Failed to get balance" });
  }
};

const handleGetTransactions: RequestHandler = async (req, res) => {
  try {
    // Mock transactions
    const transactions = [
      { id: 1, amount: 25, type: "vote", created_at: new Date().toISOString() },
      { id: 2, amount: 30, type: "vote", created_at: new Date().toISOString() }
    ];
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: "Failed to get transactions" });
  }
};

// Inline withdrawal handlers
const handleCreateWithdrawal: RequestHandler = async (req, res) => {
  try {
    const { amount, method } = req.body;
    // Mock withdrawal creation
    res.status(201).json({ 
      id: 1, 
      amount, 
      method, 
      status: "pending",
      created_at: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create withdrawal" });
  }
};

const handleGetWithdrawals: RequestHandler = async (req, res) => {
  try {
    // Mock withdrawals
    const withdrawals = [
      { id: 1, amount: 100, method: "paypal", status: "pending", created_at: new Date().toISOString() }
    ];
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ error: "Failed to get withdrawals" });
  }
};

const handleCancelWithdrawal: RequestHandler = async (req, res) => {
  try {
    const { id } = req.body;
    // Mock cancellation
    res.json({ message: "Withdrawal cancelled" });
  } catch (error) {
    res.status(500).json({ error: "Failed to cancel withdrawal" });
  }
};

const handleSimulateFeePayment: RequestHandler = async (req, res) => {
  try {
    const { id } = req.body;
    // Mock fee payment
    res.json({ message: "Fee paid", status: "completed" });
  } catch (error) {
    res.status(500).json({ error: "Failed to pay fee" });
  }
};

const handleAddBankDetails: RequestHandler = async (req, res) => {
  try {
    const { bank_name } = req.body;
    // Mock bank details addition
    res.json({ message: "Bank details added" });
  } catch (error) {
    res.status(500).json({ error: "Failed to add bank details" });
  }
};

// Mock seedVideos function
const seedVideos = async () => {
  console.log("Videos seeded (mock)");
};

function createServer() {
  const app = express();

  // Middleware
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Example API routes
  app.get(["/ping", "/api/ping"], (_req: any, res: any) => {
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

// Initialize database on startup
seedVideos().catch((err) => {
  console.error("Failed to seed videos:", err);
});

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
