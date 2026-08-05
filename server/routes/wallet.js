import { Router } from 'express';
import pool from '../db.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// GET /api/wallet/balance
router.get('/balance', async (req, res) => {
  try {
    const userRes = await pool.query('SELECT wallet_balance FROM users WHERE id = $1', [req.userId]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found.' });
    return res.json({ balance: parseFloat(userRes.rows[0].wallet_balance) });
  } catch (err) {
    console.error('Wallet balance error:', err);
    return res.status(500).json({ error: 'Failed to retrieve wallet balance.' });
  }
});

// POST /api/wallet/fund
router.post('/fund', async (req, res) => {
  const client = await pool.connect();
  try {
    const { amount, method } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid funding amount.' });
    }

    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const reference = `TX-${Math.floor(100000 + Math.random() * 900000)}`;

    await client.query('BEGIN');

    // Update wallet balance
    const userRes = await client.query(
      `UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2 RETURNING wallet_balance`,
      [amount, req.userId]
    );

    // Create funding transaction
    const txRes = await client.query(
      `INSERT INTO transactions (user_id, title, amount, type, status, date, reference)
       VALUES ($1, $2, $3, 'funding', 'success', $4, $5) RETURNING *`,
      [req.userId, `Wallet Funding (${method || 'Bank Transfer'})`, amount, date, reference]
    );

    await client.query('COMMIT');

    return res.json({
      balance: parseFloat(userRes.rows[0].wallet_balance),
      transaction: formatTx(txRes.rows[0]),
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Wallet fund error:', err);
    return res.status(500).json({ error: 'Failed to fund wallet.' });
  } finally {
    client.release();
  }
});

function formatTx(tx) {
  return {
    id: tx.id,
    title: tx.title,
    amount: parseFloat(tx.amount),
    type: tx.type,
    status: tx.status,
    date: tx.date,
    reference: tx.reference,
    phone: tx.phone,
    operator: tx.operator,
    meterNumber: tx.meter_number,
    customerName: tx.customer_name,
    address: tx.address,
    meterType: tx.meter_type,
    token: tx.token,
    smartcardNo: tx.smartcard_no,
    packageName: tx.package_name,
  };
}

export default router;
