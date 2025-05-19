const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon'
};

// Determine root directory for serving files
const rootDir = fs.existsSync('./dist') ? './dist' : '.';
console.log(`Serving files from: ${rootDir}`);

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Handle root URL
  let filePath = req.url === '/' ? path.join(rootDir, 'index.html') : path.join(rootDir, req.url);
  
  // Get the file extension
  const extname = path.extname(filePath);
  const contentType = mimeTypes[extname] || 'application/octet-stream';
  
  // Read and serve the file
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // File not found - for SPAs, serve index.html for client-side routing
        if (rootDir === './dist') {
          fs.readFile(path.join(rootDir, 'index.html'), (err, indexContent) => {
            if (err) {
              res.writeHead(404);
              res.end('404 Not Found');
            } else {
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end(indexContent, 'utf-8');
            }
          });
        } else {
          // If not using dist, send 404
          res.writeHead(404);
          res.end('404 Not Found');
        }
      } else {
        // Server error
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      // Success - serve the file
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Press Ctrl+C to stop the server`);
}); 