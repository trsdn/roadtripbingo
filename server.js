const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const SQLiteStorage = require('./src/js/modules/sqliteStorage');

const PORT = process.env.PORT || 8080;
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
// Priority: ./dist (if exists), then ./src (development), then . (fallback)
let rootDir;
if (fs.existsSync('./dist')) {
  rootDir = './dist';
} else if (fs.existsSync('./src')) {
  rootDir = './src';
} else {
  rootDir = '.';
}
console.log(`Serving files from: ${rootDir}`);

// Initialize SQLite storage
const storage = new SQLiteStorage();
storage.init().catch(console.error);

// Parse request body for POST/PUT requests
function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

// Send JSON response
function sendJSON(res, data, statusCode = 200) {
  res.writeHead(statusCode, { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

// Handle CORS preflight requests
function handleCORS(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return true;
  }
  return false;
}

// API route handlers
async function handleAPIRequest(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  try {
    // Health check API
    if (pathname === '/api/health' && method === 'GET') {
      sendJSON(res, { success: true, status: 'healthy' });
      return true;
    }

    // Icons API
    if (pathname === '/api/icons') {
      if (method === 'GET') {
        const { search, category } = parsedUrl.query;
        const icons = await storage.loadIcons(search || '', category || '');
        sendJSON(res, { success: true, data: icons });
        return true;
      } else if (method === 'POST') {
        const body = await parseRequestBody(req);
        const result = await storage.saveIcon(body);
        sendJSON(res, result, 201);
        return true;
      }
    }

    // Categories API
    if (pathname === '/api/categories' && method === 'GET') {
      const categories = await storage.getCategories();
      sendJSON(res, { success: true, data: categories });
      return true;
    }

    if (pathname.startsWith('/api/icons/') && method === 'DELETE') {
      const iconId = pathname.split('/')[3];
      const result = await storage.deleteIcon(iconId);
      sendJSON(res, result);
      return true;
    }

    // Clear all icons API
    if (pathname === '/api/icons/clear' && method === 'DELETE') {
      const result = await storage.clearIcons();
      sendJSON(res, result);
      return true;
    }

    // Update icon API
    if (pathname.startsWith('/api/icons/') && method === 'PUT') {
      const iconId = pathname.split('/')[3];
      const body = await parseRequestBody(req);
      const result = await storage.updateIcon(iconId, body);
      sendJSON(res, result);
      return true;
    }

    // Settings API
    if (pathname === '/api/settings') {
      if (method === 'GET') {
        const settings = await storage.loadSettings();
        sendJSON(res, { success: true, data: settings });
        return true;
      } else if (method === 'POST' || method === 'PUT') {
        const body = await parseRequestBody(req);
        const result = await storage.saveSettings(body);
        sendJSON(res, result);
        return true;
      }
    }

    // Card generations API
    if (pathname === '/api/generations') {
      if (method === 'GET') {
        const limit = parseInt(parsedUrl.query.limit) || 50;
        const generations = await storage.loadCardGenerations(limit);
        sendJSON(res, { success: true, data: generations });
        return true;
      } else if (method === 'POST') {
        const body = await parseRequestBody(req);
        const result = await storage.saveCardGeneration(body);
        sendJSON(res, result, 201);
        return true;
      }
    }

    // Storage info API
    if (pathname === '/api/storage/info' && method === 'GET') {
      const info = await storage.getStorageInfo();
      sendJSON(res, { success: true, data: info });
      return true;
    }

    // Test reset API - only available in non-production mode
    if (pathname === '/api/test/reset' && method === 'POST') {
      if (process.env.NODE_ENV === 'production') {
        sendJSON(res, { success: false, error: 'Reset not allowed in production' }, 403);
        return true;
      }
      
      try {
        await storage.clearAllData();
        sendJSON(res, { success: true, message: 'Database reset successfully' });
        return true;
      } catch (error) {
        console.error('Error resetting database:', error);
        sendJSON(res, { success: false, error: error.message }, 500);
        return true;
      }
    }

    // Storage stats API
    if (pathname === '/api/stats' && method === 'GET') {
      const stats = await storage.getStorageInfo();
      sendJSON(res, { success: true, data: stats });
      return true;
    }

    // Optimize storage API
    if (pathname === '/api/optimize' && method === 'POST') {
      const result = await storage.optimizeStorage();
      sendJSON(res, { success: true, data: result });
      return true;
    }

    // Export data API
    if (pathname === '/api/export' && method === 'GET') {
      const data = await storage.exportData();
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="roadtripbingo-backup.json"',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify(data, null, 2));
      return true;
    }

    // Import data API
    if (pathname === '/api/import' && method === 'POST') {
      const body = await parseRequestBody(req);
      const result = await storage.importData(body);
      sendJSON(res, result);
      return true;
    }

    return false; // API route not found
  } catch (error) {
    console.error('API Error:', error);
    sendJSON(res, { 
      success: false, 
      error: error.message 
    }, 500);
    return true;
  }
}

const server = http.createServer(async (req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Handle CORS preflight requests
  if (handleCORS(req, res)) {
    return;
  }

  // Handle API requests
  if (req.url.startsWith('/api/')) {
    const handled = await handleAPIRequest(req, res);
    if (handled) return;
  }

  // Handle static file requests
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