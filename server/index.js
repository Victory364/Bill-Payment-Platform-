import { setDefaultResultOrder } from 'dns';
setDefaultResultOrder('ipv4first'); // Fix EAI_AGAIN DNS issue on Windows

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDb } from './db.js';

import authRoutes from './routes/auth.js';
import walletRoutes from './routes/wallet.js';
import transactionRoutes from './routes/transactions.js';
import settingsRoutes from './routes/settings.js';
import notificationRoutes from './routes/notifications.js';
import paystackRoutes from './routes/paystack.js';
import vtpassRoutes from './routes/vtpass.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Request logger middleware to print all incoming traffic to the terminal
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`📡 [${new Date().toLocaleTimeString()}] Incoming: ${req.method} ${req.originalUrl}`);
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`➔ [${new Date().toLocaleTimeString()}] Response: ${req.method} ${req.originalUrl} | Status: ${res.statusCode} | ${duration}ms`);
  });
  next();
});

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/paystack', paystackRoutes);
app.use('/api/vtpass', vtpassRoutes);

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'PaySphere API running ✅' }));

// ── 404 catch-all ────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found.' }));

// ── Start ─────────────────────────────────────────────────────
initDb();

const server = app.listen(PORT, () => {
  console.log(`🚀 PaySphere API running on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('🔴 Server error event:', err);
});

server.on('close', () => {
  console.log('🔴 Server close event emitted');
});

server.on('listening', () => {
  console.log('🟢 Server listening event emitted');
});

export default app;
