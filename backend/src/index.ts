import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import compression from 'compression';
import { createConnection } from 'typeorm';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

// Routes
import authRoutes from './routes/auth';
import logRoutes from './routes/logs';
import analyticsRoutes from './routes/analytics';
import goalRoutes from './routes/goals';
import communityRoutes from './routes/community';
import coursesRoutes from './routes/courses';
import adminRoutes from './routes/admin';

// Middleware
import { errorHandler } from './middleware/errorHandler';

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Validate required environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set in the .env file.');
  process.exit(1); // Exit the process if required variables are missing
}

// Supabase client
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Middleware
app.use(compression());
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://learntrack.vercel.app',
    'http://20.246.104.185',
  ],
  credentials: true,
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/community', communityRoutes);
app.use('/api', coursesRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use(errorHandler);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start the server
const startServer = async () => {
  try {
    // Start the Express server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();