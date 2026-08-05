import { Router } from 'express';
import pool from '../db.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// GET /api/notifications — Last 5 notifications for user
router.get('/', async (req, res) => {
  try {
    const notifRes = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5',
      [req.userId]
    );
    return res.json(notifRes.rows.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      time: n.time,
    })));
  } catch (err) {
    console.error('Get notifications error:', err);
    return res.status(500).json({ error: 'Failed to retrieve notifications.' });
  }
});

// POST /api/notifications — Add a new notification
router.post('/', async (req, res) => {
  try {
    const { title, body, time } = req.body;
    if (!title || !body) {
      return res.status(400).json({ error: 'title and body are required.' });
    }

    const timeStr = time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const notifRes = await pool.query(
      'INSERT INTO notifications (user_id, title, body, time) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.userId, title, body, timeStr]
    );

    const n = notifRes.rows[0];
    return res.status(201).json({
      id: n.id,
      title: n.title,
      body: n.body,
      time: n.time,
    });
  } catch (err) {
    console.error('Create notification error:', err);
    return res.status(500).json({ error: 'Failed to create notification.' });
  }
});

// DELETE /api/notifications — Clear all notifications for user
router.delete('/', async (req, res) => {
  try {
    await pool.query('DELETE FROM notifications WHERE user_id = $1', [req.userId]);
    return res.json({ message: 'All notifications cleared.' });
  } catch (err) {
    console.error('Delete notifications error:', err);
    return res.status(500).json({ error: 'Failed to clear notifications.' });
  }
});

export default router;
