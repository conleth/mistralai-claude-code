/**
 * @security-rat/backend
 * Fastify API server
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';

const server = Fastify({
  logger: true,
});

// Register plugins
await server.register(cors, {
  origin: true,
});

// Health check endpoint
server.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// API routes (to be implemented)
server.get('/api/v1/questionnaire', async () => {
  return { message: 'Questionnaire endpoint - TODO' };
});

server.post('/api/v1/shortlist', async () => {
  return { message: 'Shortlist generation endpoint - TODO' };
});

// Start server
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`Server running at http://localhost:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
