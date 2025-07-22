import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';

import iconRoutes from './routes/icons.js';
import iconSetRoutes from './routes/iconSets.js';
import settingsRoutes from './routes/settings.js';
import generationsRoutes from './routes/generations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info'
  }
});

// Register plugins
await fastify.register(cors, {
  origin: true,
  credentials: true
});

// Serve static files from dist folder
await fastify.register(fastifyStatic, {
  root: path.join(__dirname, '../dist'),
  prefix: '/'
});

// Health check
fastify.get('/api/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Register routes
await fastify.register(iconRoutes, { prefix: '/api/icons' });
await fastify.register(iconSetRoutes, { prefix: '/api/icon-sets' });
await fastify.register(settingsRoutes, { prefix: '/api/settings' });
await fastify.register(generationsRoutes, { prefix: '/api/generations' });

// SPA fallback - serve index.html for all non-API routes
fastify.setNotFoundHandler(async (request, reply) => {
  // If it's an API request, return 404
  if (request.url.startsWith('/api/')) {
    return reply.code(404).send({
      message: `Route ${request.method}:${request.url} not found`,
      error: 'Not Found',
      statusCode: 404
    });
  }
  
  // For all other routes, serve the SPA
  return reply.sendFile('index.html');
});

// Graceful shutdown
const closeGracefully = async (signal) => {
  console.log(`Received signal to terminate: ${signal}`);
  
  await fastify.close();
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', closeGracefully);
process.on('SIGTERM', closeGracefully);

// Start server
const start = async () => {
  try {
    const port = process.env.PORT || 8080;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Server listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();