// Packages
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
// Database
import connectDB from './config/dbConfig.js';
connectDB();
// Middleware
import { errorHandler } from './middlewares/errorMiddleware.js';

// Routes
// Auth
import authRoutes from './routes/authRoutes.js';
// Admin
import adminRoutes from './routes/adminRoutes.js';
// History
import historyRoutes from './routes/historyRoutes.js';
// 2FA
import twoFARoutes from './routes/twoFARoutes.js';

// App
const app = express();
// Use
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());
app.use(compression());

// Routes
// Auth
app.use('/api/v1/auth', authRoutes);
// Admin
app.use('/api/v1/admin', adminRoutes);
// History
app.use('/api/v1/history', historyRoutes);
// Auth
app.use('/api/v1/code', twoFARoutes);

// Error Handler
app.use(errorHandler);

export default app;
