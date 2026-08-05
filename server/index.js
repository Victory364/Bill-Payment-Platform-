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
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173'],
  credentials: true,
}));
app.use(express.json());

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
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 PaySphere API running on http://localhost:${PORT}`);
  });
});
