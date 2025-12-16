const fs = require('fs');
const path = require('path');

// Simple build script for React frontend
const buildDir = path.join(__dirname, 'dist', 'spa');

// Create build directory
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Copy index.html
const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TubeTools</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
    <script>
      // Simple React app inline
      const { createElement } = React;
      const { useState, useEffect } = React;
      
      function App() {
        const [balance, setBalance] = useState(1000);
        const [videos, setVideos] = useState([]);
        const [loading, setLoading] = useState(true);
        
        useEffect(() => {
          // Load videos
          fetch('/videos')
            .then(res => res.json())
            .then(data => {
              setVideos(data);
              setLoading(false);
            })
            .catch(err => console.error('Failed to load videos:', err));
        }, []);
        
        const handleVote = (videoId) => {
          fetch(\`/videos/\${videoId}/vote\`, { method: 'POST' })
            .then(res => res.json())
            .then(data => {
              setBalance(data.new_balance);
              alert(\`Vote recorded! Earned \$\${data.reward}\`);
            })
            .catch(err => console.error('Vote failed:', err));
        };
        
        if (loading) {
          return createElement('div', { className: 'p-8 text-center' }, 'Loading...');
        }
        
        return createElement('div', { className: 'min-h-screen bg-gray-100' },
          createElement('header', { className: 'bg-blue-600 text-white p-4' },
            createElement('div', { className: 'container mx-auto flex justify-between' },
              createElement('h1', { className: 'text-2xl font-bold' }, 'TubeTools'),
              createElement('div', {}, \`Balance: \$\${balance}\`)
            )
          ),
          createElement('main', { className: 'container mx-auto p-8' },
            createElement('h2', { className: 'text-xl font-semibold mb-6' }, 'Watch & Earn'),
            createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' },
              videos.map(video => 
                createElement('div', { key: video.id, className: 'bg-white rounded-lg shadow-md overflow-hidden' },
                  createElement('img', { 
                    src: video.thumbnail, 
                    alt: video.title,
                    className: 'w-full h-48 object-cover'
                  }),
                  createElement('div', { className: 'p-4' },
                    createElement('h3', { className: 'font-semibold text-lg mb-2' }, video.title),
                    createElement('p', { className: 'text-gray-600 mb-4' }, \`Reward: \$\${video.reward_min}-\$\${video.reward_max}\`),
                    createElement('button', {
                      onClick: () => handleVote(video.id),
                      className: 'bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full'
                    }, 'Vote & Earn')
                  )
                )
              )
            )
          )
        );
      }
      
      // Load React from CDN and render
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/react@18/umd/react.development.js';
      script.onload = () => {
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(React.createElement(App));
      };
      document.head.appendChild(script);
      
      // Load ReactDOM
      const domScript = document.createElement('script');
      domScript.src = 'https://unpkg.com/react-dom@18/umd/react-dom.development.js';
      document.head.appendChild(domScript);
    </script>
  </body>
</html>`;

fs.writeFileSync(path.join(buildDir, 'index.html'), indexHtml);

console.log('Frontend built successfully!');
