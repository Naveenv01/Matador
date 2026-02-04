import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import { BullMQService } from './services/bullmq.service.js';
import { createQueuesRouter } from './routes/queues.routes.js';
import { createJobsRouter } from './routes/jobs.routes.js';
import { createStatsRouter } from './routes/stats.routes.js';
import { createHealthRouter } from './routes/health.routes.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const PORT = process.env.PORT || 3000;
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379');
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());

// Initialize BullMQ service
const bullmqService = new BullMQService({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
});

// Mount API routes
app.use('/api/queues', createQueuesRouter(bullmqService));
app.use('/api/jobs', createJobsRouter(bullmqService));
app.use('/api/stats', createStatsRouter(bullmqService));
app.use('/api/health', createHealthRouter({ host: REDIS_HOST, port: REDIS_PORT }));

// Serve static frontend files (built React app)
// In production (Docker), frontend is at ../dist relative to server/index.js
// In development, it's at../../dist relative to server/src/index.ts
const frontendPath = join(__dirname, '../../dist');
app.use(express.static(frontendPath));

// Serve index.html for all non-API routes (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(join(frontendPath, 'index.html'));
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Matador server running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔌 Redis: ${REDIS_HOST}:${REDIS_PORT}`);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('\n🛑 Shutting down gracefully...');
  
  server.close(async () => {
    console.log('✅ HTTP server closed');
    
    try {
      await bullmqService.close();
      console.log('✅ BullMQ connections closed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('⚠️ Force shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
