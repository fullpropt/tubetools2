import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 3000;
const distPath = path.join(__dirname, "dist/spa");

const app = express();

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Simple routes without parameters
app.get("/ping", (req, res) => {
  res.json({ message: "pong" });
});

app.get("/demo", (req, res) => {
  res.json({ message: "Hello from Express server" });
});

app.post("/auth/signup", (req, res) => {
  res.status(201).json({ message: "User created successfully" });
});

app.post("/auth/login", (req, res) => {
  res.json({ token: "mock-token", user: { email: "test@example.com", name: "Test User" } });
});

app.get("/videos", (req, res) => {
  res.json([
    { id: 1, title: "Sample Video 1", youtube_id: "abc123", thumbnail: "https://img.youtube.com/vi/abc123/maxresdefault.jpg", reward_min: 10, reward_max: 50 },
    { id: 2, title: "Sample Video 2", youtube_id: "def456", thumbnail: "https://img.youtube.com/vi/def456/maxresdefault.jpg", reward_min: 15, reward_max: 75 }
  ]);
});

// Routes with parameters - using regex instead
app.get(/^\/videos\/(\d+)$/, (req, res) => {
  const id = req.params[0];
  res.json({ id: parseInt(id), title: `Sample Video ${id}`, youtube_id: `video${id}`, thumbnail: `https://img.youtube.com/vi/video${id}/maxresdefault.jpg`, reward_min: 10, reward_max: 50 });
});

app.post(/^\/videos\/(\d+)\/vote$/, (req, res) => {
  const id = req.params[0];
  const reward = Math.floor(Math.random() * 40) + 10;
  res.json({ message: "Vote recorded", reward: reward, new_balance: 1000 + reward });
});

app.get("/daily-votes", (req, res) => {
  res.json({ votes_left: 5, max_votes: 10 });
});

app.get("/balance", (req, res) => {
  res.json({ balance: 1000, currency: "USD" });
});

app.get("/transactions", (req, res) => {
  res.json([
    { id: 1, amount: 25, type: "vote", created_at: new Date().toISOString() },
    { id: 2, amount: 30, type: "vote", created_at: new Date().toISOString() }
  ]);
});

app.post("/withdrawals", (req, res) => {
  res.status(201).json({ id: 1, amount: 100, method: "paypal", status: "pending", created_at: new Date().toISOString() });
});

app.get("/withdrawals", (req, res) => {
  res.json([{ id: 1, amount: 100, method: "paypal", status: "pending", created_at: new Date().toISOString() }]);
});

app.post("/withdrawals/bank-details", (req, res) => {
  res.json({ message: "Bank details added" });
});

app.post("/withdrawals/cancel", (req, res) => {
  res.json({ message: "Withdrawal cancelled" });
});

app.post("/withdrawals/simulate-fee-payment", (req, res) => {
  res.json({ message: "Fee paid", status: "completed" });
});

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
