const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const SQLiteStorage = require('./src/js/modules/sqliteStorage');
const ServerAIService = require('./src/js/modules/serverAIService');

// Load environment variables
require('dotenv').config();

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

// Initialize SQLite storage and AI service
const storage = new SQLiteStorage();
const aiService = new ServerAIService();
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

    // Apply smart defaults for multi-hit exclusion API
    if (pathname === '/api/icons/smart-defaults' && method === 'POST') {
      const result = await storage.applySmartMultiHitDefaults();
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

    // Icon Sets API
    if (pathname === '/api/icon-sets') {
      if (method === 'GET') {
        const sets = await storage.getIconSets();
        sendJSON(res, { success: true, data: sets });
        return true;
      } else if (method === 'POST') {
        const body = await parseRequestBody(req);
        const result = await storage.createIconSet(body);
        sendJSON(res, result, 201);
        return true;
      }
    }

    // Individual icon set operations
    if (pathname.startsWith('/api/icon-sets/')) {
      const pathParts = pathname.split('/');
      const setId = pathParts[3];
      
      if (method === 'GET') {
        // Get icons in a specific set
        const icons = await storage.getIconsInSet(setId);
        sendJSON(res, { success: true, data: icons });
        return true;
      } else if (method === 'PUT') {
        // Update icon set
        const body = await parseRequestBody(req);
        const result = await storage.updateIconSet(setId, body);
        sendJSON(res, result);
        return true;
      } else if (method === 'DELETE') {
        // Delete icon set
        const result = await storage.deleteIconSet(setId);
        sendJSON(res, result);
        return true;
      }
    }

    // Icon set membership API
    if (pathname.startsWith('/api/icon-sets/') && pathname.includes('/icons/')) {
      const pathParts = pathname.split('/');
      const setId = pathParts[3];
      const iconId = pathParts[5];
      
      if (method === 'POST') {
        // Add icon to set
        const result = await storage.addIconToSet(iconId, setId);
        sendJSON(res, result);
        return true;
      } else if (method === 'DELETE') {
        // Remove icon from set
        const result = await storage.removeIconFromSet(iconId, setId);
        sendJSON(res, result);
        return true;
      }
    }

    // Icon translations API
    if (pathname.startsWith('/api/icons/') && pathname.includes('/translations')) {
      const pathParts = pathname.split('/');
      const iconId = pathParts[3];
      
      if (method === 'GET') {
        // Get translations for an icon
        const translations = await storage.getIconTranslations(iconId);
        sendJSON(res, { success: true, data: translations });
        return true;
      } else if (method === 'POST') {
        // Save translation for an icon
        const body = await parseRequestBody(req);
        const { languageCode, translatedName } = body;
        const result = await storage.saveIconTranslation(iconId, languageCode, translatedName);
        sendJSON(res, result);
        return true;
      }
    }

    // Delete specific translation
    if (pathname.startsWith('/api/icons/') && pathname.includes('/translations/')) {
      const pathParts = pathname.split('/');
      const iconId = pathParts[3];
      const languageCode = pathParts[5];
      
      if (method === 'DELETE') {
        const result = await storage.deleteIconTranslation(iconId, languageCode);
        sendJSON(res, result);
        return true;
      }
    }

    // Get sets containing a specific icon
    if (pathname.startsWith('/api/icons/') && pathname.endsWith('/sets')) {
      const pathParts = pathname.split('/');
      const iconId = pathParts[3];
      
      if (method === 'GET') {
        const sets = await storage.getSetsContainingIcon(iconId);
        sendJSON(res, { success: true, data: sets });
        return true;
      }
    }

    // Migration API - migrate existing icons to default set
    if (pathname === '/api/migrate/icons' && method === 'POST') {
      const result = await storage.migrateExistingIconsToDefaultSet();
      sendJSON(res, result);
      return true;
    }

    // AI API endpoints
    if (pathname === '/api/ai/status' && method === 'GET') {
      const status = aiService.getStatus();
      sendJSON(res, { success: true, data: status });
      return true;
    }

    if (pathname === '/api/ai/analyze-icon' && method === 'POST') {
      if (!aiService.isConfigured()) {
        sendJSON(res, { success: false, error: 'OpenAI API key not configured' }, 400);
        return true;
      }
      
      const body = await parseRequestBody(req);
      const icon = await storage.db.prepare('SELECT * FROM icons WHERE id = ?').get(body.iconId);
      
      if (!icon) {
        sendJSON(res, { success: false, error: 'Icon not found' }, 404);
        return true;
      }

      try {
        const analysis = await aiService.analyzeIcon(icon, body.model);
        
        // Store analysis in database
        await storage.db.prepare(`
          INSERT OR REPLACE INTO ai_analysis (
            icon_id, category_suggestion, tags_suggestion, difficulty_suggestion,
            name_suggestion, name_suggestion_de, description_suggestion, confidence_score,
            ai_model, analysis_date
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          analysis.icon_id,
          analysis.category_suggestion,
          analysis.tags_suggestion,
          analysis.difficulty_suggestion,
          analysis.name_suggestion,
          analysis.name_suggestion_de,
          analysis.description_suggestion,
          analysis.confidence_score,
          analysis.ai_model,
          analysis.analysis_date
        );
        
        await storage.trackAIUsage({ operation: 'analyze_icon', model: analysis.ai_model });
        sendJSON(res, { success: true, data: analysis });
      } catch (error) {
        console.error('AI analysis error:', error);
        sendJSON(res, { success: false, error: error.message }, 500);
      }
      return true;
    }

    if (pathname === '/api/ai/analyze-batch' && method === 'POST') {
      if (!aiService.isConfigured()) {
        sendJSON(res, { success: false, error: 'OpenAI API key not configured' }, 400);
        return true;
      }
      
      const body = await parseRequestBody(req);
      const icons = [];
      
      for (const iconId of body.iconIds) {
        const icon = await storage.db.prepare('SELECT * FROM icons WHERE id = ?').get(iconId);
        if (icon) icons.push(icon);
      }
      
      if (icons.length === 0) {
        sendJSON(res, { success: false, error: 'No valid icons found' }, 400);
        return true;
      }

      try {
        const results = await aiService.analyzeBatch(icons, body.model);
        
        // Store successful analyses in database
        for (const result of results) {
          if (result.success) {
            await storage.db.prepare(`
              INSERT OR REPLACE INTO ai_analysis (
                icon_id, category_suggestion, tags_suggestion, difficulty_suggestion,
                name_suggestion, name_suggestion_de, description_suggestion, confidence_score,
                ai_model, analysis_date
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
              result.data.icon_id,
              result.data.category_suggestion,
              result.data.tags_suggestion,
              result.data.difficulty_suggestion,
              result.data.name_suggestion,
              result.data.name_suggestion_de,
              result.data.description_suggestion,
              result.data.confidence_score,
              result.data.ai_model,
              result.data.analysis_date
            );
            
            await storage.trackAIUsage({ operation: 'analyze_icon', model: result.data.ai_model });
          }
        }
        
        sendJSON(res, { success: true, data: results });
      } catch (error) {
        console.error('AI batch analysis error:', error);
        sendJSON(res, { success: false, error: error.message }, 500);
      }
      return true;
    }

    if (pathname === '/api/ai/detect-duplicates' && method === 'POST') {
      if (!aiService.isConfigured()) {
        sendJSON(res, { success: false, error: 'OpenAI API key not configured' }, 400);
        return true;
      }
      
      const body = await parseRequestBody(req);
      const icons = await storage.db.prepare('SELECT id, name, category, tags FROM icons').all();
      
      if (icons.length === 0) {
        sendJSON(res, { success: false, error: 'No icons found' }, 400);
        return true;
      }

      try {
        const result = await aiService.detectDuplicates(icons, body.sensitivity, body.model);
        await storage.trackAIUsage({ operation: 'detect_duplicates', model: result.ai_model });
        sendJSON(res, { success: true, data: result });
      } catch (error) {
        console.error('AI duplicate detection error:', error);
        sendJSON(res, { success: false, error: error.message }, 500);
      }
      return true;
    }

    if (pathname === '/api/ai/content-suggestions' && method === 'GET') {
      if (!aiService.isConfigured()) {
        sendJSON(res, { success: false, error: 'OpenAI API key not configured' }, 400);
        return true;
      }
      
      const { targetSet, model } = parsedUrl.query;
      const icons = await storage.db.prepare('SELECT * FROM icons').all();

      try {
        const result = await aiService.suggestMissingContent(icons, targetSet, model);
        await storage.trackAIUsage({ operation: 'suggest_content', model: result.ai_model });
        sendJSON(res, { success: true, data: result });
      } catch (error) {
        console.error('AI content suggestions error:', error);
        sendJSON(res, { success: false, error: error.message }, 500);
      }
      return true;
    }

    if (pathname === '/api/ai/generate-set' && method === 'POST') {
      if (!aiService.isConfigured()) {
        sendJSON(res, { success: false, error: 'OpenAI API key not configured' }, 400);
        return true;
      }
      
      const body = await parseRequestBody(req);
      
      try {
        const result = await aiService.generateSmartSet(body, body.model);
        await storage.trackAIUsage({ operation: 'generate_set', model: result.ai_model });
        sendJSON(res, { success: true, data: result });
      } catch (error) {
        console.error('AI set generation error:', error);
        sendJSON(res, { success: false, error: error.message }, 500);
      }
      return true;
    }

    if (pathname === '/api/ai/preferences') {
      if (method === 'GET') {
        const preferences = await storage.getAIPreferences();
        sendJSON(res, { success: true, data: preferences });
        return true;
      }
      if (method === 'PUT') {
        const body = await parseRequestBody(req);
        const result = await storage.updateAIPreferences(body);
        sendJSON(res, result);
        return true;
      }
    }

    if (pathname === '/api/ai/cache' && method === 'POST') {
      const body = await parseRequestBody(req);
      const result = await storage.cacheAIResult(body);
      sendJSON(res, result);
      return true;
    }

    if (pathname.startsWith('/api/ai/cache/') && method === 'GET') {
      const cacheKey = decodeURIComponent(pathname.split('/')[4]);
      const result = await storage.getAICachedResult(cacheKey);
      sendJSON(res, result);
      return true;
    }

    if (pathname === '/api/ai/usage' && method === 'POST') {
      const body = await parseRequestBody(req);
      const result = await storage.trackAIUsage(body);
      sendJSON(res, result);
      return true;
    }

    if (pathname === '/api/ai/usage/check' && method === 'GET') {
      const result = await storage.checkAIUsageLimits();
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