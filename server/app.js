// server/app.js
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import repoRoutes from './routes/repo.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/repo', repoRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.send('Groot Backend API is running');
});

export default app;