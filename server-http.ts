import "dotenv/config";
import { createServer as createHttpServer } from "http";
import { fileURLToPath } from 'url';
import path from 'path';
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = process.env.PORT || 3000;

// Database connection
const sql = neon(process.env.DATABASE_URL || '');

// Check if DATABASE_URL is configured
if (!process.env.DATABASE_URL) {
  console.log('WARNING: DATABASE_URL not configured, using mock data');
}

// Initialize database tables
async function initializeDatabase() {
  if (!process.env.DATABASE_URL) {
    console.log('Skipping database initialization - no DATABASE_URL configured');
    return;
  }
  
  try {
    console.log('Initializing database tables...');
    
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        balance DECIMAL(10,2) DEFAULT 0.00,
        last_vote_reset TIMESTAMP DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create videos table
    await sql`
      CREATE TABLE IF NOT EXISTS videos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        youtube_id VARCHAR(50) UNIQUE NOT NULL,
        thumbnail VARCHAR(500),
        reward_min DECIMAL(10,2) NOT NULL,
        reward_max DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create votes table
    await sql`
      CREATE TABLE IF NOT EXISTS votes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
        reward DECIMAL(10,2) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, video_id, DATE(timestamp))
      )
    `;

    // Create transactions table
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        type VARCHAR(50) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create bank details table
    await sql`
      CREATE TABLE IF NOT EXISTS bank_details (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        bank_name VARCHAR(255) NOT NULL,
        account_number VARCHAR(255) NOT NULL,
        account_holder VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Insert sample videos if empty
    const videoCount = await sql`SELECT COUNT(*) as count FROM videos`;
    if (videoCount[0].count === 0) {
      await sql`
        INSERT INTO videos (title, youtube_id, thumbnail, reward_min, reward_max) VALUES
        ('Sample Video 1', 'abc123', 'https://img.youtube.com/vi/abc123/maxresdefault.jpg', 10.00, 50.00),
        ('Sample Video 2', 'def456', 'https://img.youtube.com/vi/def456/maxresdefault.jpg', 15.00, 75.00),
        ('Sample Video 3', 'ghi789', 'https://img.youtube.com/vi/ghi789/maxresdefault.jpg', 20.00, 100.00)
        ON CONFLICT (youtube_id) DO NOTHING
      `;
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}

// Simple HTTP server without Express
const server = createHttpServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = req.url || '/';
  const method = req.method || 'GET';

  // Simple routing
  if (url === '/ping' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'pong' }));
    return;
  }

  if (url === '/demo' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Hello from HTTP server' }));
    return;
  }

  if (url === '/videos' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([
      { id: 1, title: "Sample Video 1", youtube_id: "abc123", thumbnail: "https://img.youtube.com/vi/abc123/maxresdefault.jpg", reward_min: 10, reward_max: 50 },
      { id: 2, title: "Sample Video 2", youtube_id: "def456", thumbnail: "https://img.youtube.com/vi/def456/maxresdefault.jpg", reward_min: 15, reward_max: 75 }
    ]));
    return;
  }

  if (url.startsWith('/videos/') && method === 'GET') {
    const id = parseInt(url.split('/')[2]);
    if (!isNaN(id)) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        id: id, 
        title: `Sample Video ${id}`, 
        youtube_id: `video${id}`, 
        thumbnail: `https://img.youtube.com/vi/video${id}/maxresdefault.jpg`, 
        reward_min: 10, 
        reward_max: 50 
      }));
      return;
    }
  }

  if (url.startsWith('/videos/') && url.endsWith('/vote') && method === 'POST') {
    const id = parseInt(url.split('/')[2]);
    if (!isNaN(id)) {
      const reward = Math.floor(Math.random() * 40) + 10;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Vote recorded', reward: reward, new_balance: 1000 + reward }));
      return;
    }
  }

  if (url === '/auth/signup' && method === 'POST') {
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'User created successfully' }));
    return;
  }

  if (url === '/auth/login' && method === 'POST') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ token: 'mock-token', user: { email: 'test@example.com', name: 'Test User' } }));
    return;
  }

  if (url === '/videos' && method === 'GET') {
    try {
      if (!process.env.DATABASE_URL) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'DATABASE_URL not configured' }));
        return;
      }
      
      const videos = await sql`
        SELECT id, title, description, url, thumbnail, reward_min, reward_max, duration, created_at 
        FROM videos 
        ORDER BY created_at DESC
      `;
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(videos));
    } catch (error) {
      console.error('Videos fetch error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to fetch videos' }));
    }
    return;
  }

  if (url === '/balance' && method === 'GET') {
    try {
      if (!process.env.DATABASE_URL) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ balance: 0, currency: 'USD' }));
        return;
      }
      
      // Mock user ID for now - should come from JWT token
      const userId = '5448ea88-76f1-48ab-95e7-6f3e8e292cc0';
      
      const user = await sql`
        SELECT balance 
        FROM users 
        WHERE id = ${userId}
      `;
      
      const balance = user[0]?.balance || 0;
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ balance, currency: 'USD' }));
    } catch (error) {
      console.error('Balance fetch error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to fetch balance' }));
    }
    return;
  }

  if (url === '/daily-votes' && method === 'GET') {
    try {
      if (!process.env.DATABASE_URL) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ votes_left: 10, max_votes: 10 }));
        return;
      }
      
      // Mock user ID for now - should come from JWT token
      const userId = '5448ea88-76f1-48ab-95e7-6f3e8e292cc0';
      
      // Check if user voted today
      const today = new Date().toISOString().split('T')[0];
      const votesToday = await sql`
        SELECT COUNT(*) as count 
        FROM votes 
        WHERE user_id = ${userId} 
        AND DATE(created_at) = ${today}
      `;
      
      const votesCount = parseInt(votesToday[0]?.count || '0');
      const maxVotes = 10;
      const votesLeft = Math.max(0, maxVotes - votesCount);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ votes_left: votesLeft, max_votes: maxVotes }));
    } catch (error) {
      console.error('Daily votes fetch error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to fetch daily votes' }));
    }
    return;
  }

  if (url === '/transactions' && method === 'GET') {
    try {
      if (!process.env.DATABASE_URL) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify([]));
        return;
      }
      
      // Mock user ID for now - should come from JWT token
      const userId = '5448ea88-76f1-48ab-95e7-6f3e8e292cc0';
      
      const transactions = await sql`
        SELECT id, amount, type, description, created_at 
        FROM transactions 
        WHERE user_id = ${userId} 
        ORDER BY created_at DESC 
        LIMIT 50
      `;
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(transactions));
    } catch (error) {
      console.error('Transactions fetch error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to fetch transactions' }));
    }
    return;
  }

  // Vote endpoint
  if (url === '/vote' && method === 'POST') {
    try {
      if (!process.env.DATABASE_URL) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'DATABASE_URL not configured' }));
        return;
      }
      
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', async () => {
        try {
          const { video_id, vote_type } = JSON.parse(body);
          
          if (!video_id || !vote_type) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'video_id and vote_type are required' }));
            return;
          }
          
          // Mock user ID for now - should come from JWT token
          const userId = '5448ea88-76f1-48ab-95e7-6f3e8e292cc0';
          
          // Check if user already voted for this video today
          const today = new Date().toISOString().split('T')[0];
          const existingVote = await sql`
            SELECT id 
            FROM votes 
            WHERE user_id = ${userId} 
            AND video_id = ${video_id} 
            AND DATE(created_at) = ${today}
          `;
          
          if (existingVote.length > 0) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'You have already voted for this video today' }));
            return;
          }
          
          // Get video reward range
          const video = await sql`
            SELECT reward_min, reward_max 
            FROM videos 
            WHERE id = ${video_id}
          `;
          
          if (video.length === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Video not found' }));
            return;
          }
          
          // Calculate random reward
          const rewardMin = parseFloat(video[0].reward_min);
          const rewardMax = parseFloat(video[0].reward_max);
          const reward = Math.random() * (rewardMax - rewardMin) + rewardMin;
          
          // Create vote record
          const voteId = crypto.randomUUID();
          await sql`
            INSERT INTO votes (id, user_id, video_id, vote_type, reward_amount, created_at)
            VALUES (${voteId}, ${userId}, ${video_id}, ${vote_type}, ${reward}, CURRENT_TIMESTAMP)
          `;
          
          // Create transaction record
          const transactionId = crypto.randomUUID();
          await sql`
            INSERT INTO transactions (id, user_id, type, amount, description, status, created_at)
            VALUES (${transactionId}, ${userId}, 'credit', ${reward}, 'Video vote reward - ' + ${video_id}, 'completed', CURRENT_TIMESTAMP)
          `;
          
          // Update user balance
          await sql`
            UPDATE users 
            SET balance = balance + ${reward}
            WHERE id = ${userId}
          `;
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: true, 
            reward: parseFloat(reward.toFixed(2)),
            message: 'Vote recorded successfully'
          }));
          
        } catch (parseError) {
          console.error('Vote processing error:', parseError);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid request data' }));
        }
      });
      
    } catch (error) {
      console.error('Vote endpoint error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to process vote' }));
    }
    return;
  }

  // Create database tables endpoint
  if (url === '/api/setup-database' && method === 'POST') {
    try {
      if (!process.env.DATABASE_URL) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'DATABASE_URL not configured' }));
        return;
      }
      
      await initializeDatabase();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Database tables created successfully' }));
    } catch (error) {
      console.error('Database setup error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to create database tables', details: error.message }));
    }
    return;
  }

  // Serve static files or fallback to index.html
  const distPath = path.join(__dirname, 'dist/spa');
  
  // For any non-API route, serve index.html (React Router)
  if (!url.startsWith('/api/') && method === 'GET') {
    const indexPath = path.join(distPath, 'index.html');
    
    // Try to serve static file first
    const filePath = path.join(distPath, url === '/' ? 'index.html' : url);
    
    // Simple file serving for built frontend
    if (url === '/' || url.includes('.')) {
      try {
        const fs = await import('fs');
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const ext = path.extname(filePath);
        const contentType = ext === '.js' ? 'text/javascript' : 
                           ext === '.css' ? 'text/css' : 
                           'text/html';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(fileContent);
        return;
      } catch (error) {
        // File not found, serve index.html for SPA routing
      }
    }
    
    // Serve index.html for SPA routing
    try {
      const fs = await import('fs');
      const indexContent = fs.readFileSync(indexPath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(indexContent);
      return;
    } catch (error) {
      // If no build exists, serve basic HTML
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`<!DOCTYPE html>
<html>
<head>
    <title>TubeTools</title>
</head>
<body>
    <div id="root">
        <h1>TubeTools App</h1>
        <p>Frontend build not available. Please run: npm run build:client</p>
        <p><a href="/ping">Test API</a></p>
    </div>
</body>
</html>`);
      return;
    }
  }

  // 404 for API routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'API endpoint not found' }));
});

server.listen(port, async () => {
  console.log(`HTTP server running on port ${port}`);
  // Initialize database tables
  await initializeDatabase();
});
