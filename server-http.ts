import "dotenv/config";
import { createServer as createHttpServer } from "http";
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = process.env.PORT || 3000;

// Simple HTTP server without Express
const server = createHttpServer((req, res) => {
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

  if (url === '/balance' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ balance: 1000, currency: 'USD' }));
    return;
  }

  if (url === '/daily-votes' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ votes_left: 5, max_votes: 10 }));
    return;
  }

  if (url === '/transactions' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([
      { id: 1, amount: 25, type: 'vote', created_at: new Date().toISOString() },
      { id: 2, amount: 30, type: 'vote', created_at: new Date().toISOString() }
    ]));
    return;
  }

  // Serve static files or fallback to index.html
  const distPath = path.join(__dirname, 'dist/spa');
  const filePath = path.join(distPath, url === '/' ? 'index.html' : url);
  
  // For any non-API route, serve index.html (React Router)
  if (!url.startsWith('/api/') && method === 'GET') {
    const indexPath = path.join(distPath, 'index.html');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<!-- TubeTools App -->\n<h1>TubeTools is running!</h1>\n<p>Frontend build not available in this minimal server</p>');
    return;
  }

  // 404 for API routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'API endpoint not found' }));
});

server.listen(port, () => {
  console.log(`HTTP server running on port ${port}`);
});
