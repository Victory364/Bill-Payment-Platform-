import { Router } from 'express';
import pool from '../db.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// GET /api/settings
router.get('/', async (req, res) => {
  try {
    const userRes = await pool.query('SELECT name, email, phone FROM users WHERE id = $1', [req.userId]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found.' });

    const user = userRes.rows[0];
    const settingsRes = await pool.query('SELECT * FROM settings WHERE user_id = $1', [req.userId]);
    const settings = settingsRes.rows[0] || {};

    return res.json({
      profileName: user.name,
      profileEmail: user.email,
      profilePhone: user.phone,
      transactionLimit: settings.transaction_limit ? parseFloat(settings.transaction_limit) : 20000,
      enableBiometrics: settings.enable_biometrics ?? true,
      enableNotifications: settings.enable_notifications ?? true,
    });
  } catch (err) {
    console.error('Get settings error:', err);
    return res.status(500).json({ error: 'Failed to retrieve settings.' });
  }
});

// PUT /api/settings
router.put('/', async (req, res) => {
  try {
    const {
      profileName,
      profilePhone,
      transactionLimit,
      enableBiometrics,
      enableNotifications,
    } = req.body;

    // Update user profile name and phone
    if (profileName || profilePhone) {
      await pool.query(
        `UPDATE users SET 
          name = COALESCE($1, name),
          phone = COALESCE($2, phone)
         WHERE id = $3`,
        [profileName || null, profilePhone || null, req.userId]
      );
    }

    // Upsert settings row
    await pool.query(
      `INSERT INTO settings (user_id, transaction_limit, enable_biometrics, enable_notifications)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) DO UPDATE SET
         transaction_limit = EXCLUDED.transaction_limit,
         enable_biometrics = EXCLUDED.enable_biometrics,
         enable_notifications = EXCLUDED.enable_notifications,
         updated_at = CURRENT_TIMESTAMP`,
      [
        req.userId,
        transactionLimit ?? 20000.00,
        enableBiometrics ?? true,
        enableNotifications ?? true,
      ]
    );

    const updatedUserRes = await pool.query('SELECT name, email, phone FROM users WHERE id = $1', [req.userId]);
    const updatedUser = updatedUserRes.rows[0];

    return res.json({
      profileName: updatedUser.name,
      profileEmail: updatedUser.email,
      profilePhone: updatedUser.phone,
    });
  } catch (err) {
    console.error('Update settings error:', err);
    return res.status(500).json({ error: 'Failed to update settings.' });
  }
});

export default router;
