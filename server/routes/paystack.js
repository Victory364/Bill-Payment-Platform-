import { setDefaultResultOrder } from 'dns';
setDefaultResultOrder('ipv4first');

import { Router } from 'express';
import axios from 'axios';
import pool from '../db.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

const PAYSTACK_BASE = 'https://api.paystack.co';

// POST /api/paystack/initialize
// Body: { amount (in naira), email }
router.post('/initialize', async (req, res) => {
  try {
    const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
    const { amount, email } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({ error: 'Minimum funding amount is ₦100.' });
    }
    if (!PAYSTACK_SECRET) {
      return res.status(500).json({ error: 'Paystack secret key not configured. Add PAYSTACK_SECRET_KEY to server/.env' });
    }

    const amountInKobo = Math.round(amount * 100); // Paystack uses kobo

    const response = await axios.post(
      `${PAYSTACK_BASE}/transaction/initialize`,
      {
        amount: amountInKobo,
        email: email || req.userEmail,
        metadata: {
          userId: req.userId,
          custom_fields: [
            { display_name: 'Purpose', variable_name: 'purpose', value: 'PaySphere Wallet Funding' }
          ]
        },
        callback_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/callback`,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const { authorization_url, reference, access_code } = response.data.data;

    return res.json({ authorization_url, reference, access_code, amount });
  } catch (err) {
    console.error('Paystack initialize error:', err.response?.data || err.message);
    return res.status(500).json({ error: 'Failed to initialize Paystack payment.' });
  }
});

// POST /api/paystack/verify
// Body: { reference }
router.post('/verify', async (req, res) => {
  const client = await pool.connect();
  try {
    const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
    const { reference } = req.body;
    if (!reference) {
      return res.status(400).json({ error: 'Payment reference is required.' });
    }
    if (!PAYSTACK_SECRET) {
      return res.status(500).json({ error: 'Paystack secret key not configured.' });
    }

    // Verify with Paystack API
    const response = await axios.get(
      `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
      }
    );

    const txData = response.data.data;

    if (txData.status !== 'success') {
      return res.status(400).json({ error: `Payment not successful. Status: ${txData.status}` });
    }

    // Check if this reference was already processed (idempotency guard)
    const existing = await client.query(
      'SELECT id FROM transactions WHERE reference = $1 AND user_id = $2',
      [reference, req.userId]
    );
    if (existing.rows.length > 0) {
      // Already processed — just return the current balance
      const balRes = await client.query('SELECT wallet_balance FROM users WHERE id = $1', [req.userId]);
      return res.json({
        alreadyProcessed: true,
        balance: parseFloat(balRes.rows[0]?.wallet_balance || 0),
        message: 'Payment already credited.',
      });
    }

    const amountNaira = txData.amount / 100; // Convert kobo → naira
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    await client.query('BEGIN');

    // Credit wallet
    const userRes = await client.query(
      'UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2 RETURNING wallet_balance',
      [amountNaira, req.userId]
    );

    // Record funding transaction
    const txRes = await client.query(
      `INSERT INTO transactions (user_id, title, amount, type, status, date, reference)
       VALUES ($1, $2, $3, 'funding', 'success', $4, $5) RETURNING *`,
      [req.userId, `Wallet Funding (Paystack)`, amountNaira, dateStr, reference]
    );

    // Push notification
    await client.query(
      `INSERT INTO notifications (user_id, title, body, time)
       VALUES ($1, $2, $3, $4)`,
      [
        req.userId,
        'Wallet Funded Successfully ✅',
        `₦${amountNaira.toLocaleString()} has been added to your PaySphere wallet via Paystack.`,
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ]
    );

    await client.query('COMMIT');

    const tx = txRes.rows[0];
    return res.json({
      balance: parseFloat(userRes.rows[0].wallet_balance),
      transaction: {
        id: tx.id,
        title: tx.title,
        amount: parseFloat(tx.amount),
        type: tx.type,
        status: tx.status,
        date: tx.date,
        reference: tx.reference,
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Paystack verify error:', err.response?.data || err.message);
    return res.status(500).json({ error: 'Failed to verify Paystack payment.' });
  } finally {
    client.release();
  }
});

export default router;
