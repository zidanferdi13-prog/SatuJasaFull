import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Database } from './config/database';
import { errorHandler } from './shared/middleware/auth.middleware';
import routes from './routes';
import { initializeWorker } from './shared/services/notification.service';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve public files (invoices)
app.use('/public', express.static('public'));

// All API routes
app.use('/api/v1', routes);

// Error handler
app.use(errorHandler);

const startServer = async () => {
  try {
    await Database.connect();
    console.log('✓ Database connected');

    // Initialize WhatsApp worker (runs in background)
    initializeWorker();
    console.log('✓ WhatsApp worker initialized');

    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`  API: http://localhost:${PORT}/api/v1`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
