import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import { sendEmail } from '../utils/email.js';

const router = Router();
const resetTokens = new Map();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, referredBy } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    if (phone.length !== 11) {
      return res.status(400).json({ error: 'Phone number must be exactly 11 digits.' });
    }

    const emailLower = email.toLowerCase();
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [emailLower]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    let referredById = null;
    if (referredBy) {
      const parsedRef = parseInt(referredBy, 10);
      if (!isNaN(parsedRef)) {
        const referrerRes = await pool.query('SELECT id FROM users WHERE id = $1', [parsedRef]);
        if (referrerRes.rows.length > 0) {
          referredById = referrerRes.rows[0].id;
        }
      }
    }

    // Insert new user — starts with ₦0 balance
    const userRes = await pool.query(
      `INSERT INTO users (name, email, phone, password_hash, wallet_balance, referred_by_id) 
       VALUES ($1, $2, $3, $4, 0.00, $5) RETURNING id, name, email, phone`,
      [name, emailLower, phone, passwordHash, referredById]
    );
    const user = userRes.rows[0];

    // Default settings
    await pool.query(
      `INSERT INTO settings (user_id, transaction_limit, enable_biometrics, enable_notifications)
       VALUES ($1, 20000.00, true, true) ON CONFLICT DO NOTHING`,
      [user.id]
    );

    // Welcome notification
    await pool.query(
      `INSERT INTO notifications (user_id, title, body, time)
       VALUES ($1, $2, 'Your account is ready. Fund your wallet to start paying bills.', 'Just now')`,
      [user.id, `Welcome to PaySphere, ${name}! 🎉`]
    );

    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name, phone: user.phone },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const emailLower = email.toLowerCase();
    const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [emailLower]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email address or password.' });
    }

    const user = userRes.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email address or password.' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name, phone: user.phone },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error during login.' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const emailLower = email.toLowerCase();
    const userRes = await pool.query('SELECT id FROM users WHERE email = $1', [emailLower]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'No account found with this email address.' });
    }

    // Generate a 6-digit reset code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    resetTokens.set(emailLower, {
      code,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
    });

    console.log(`\n============================================================`);
    console.log(`🔒 PASSWORD RESET REQUESTED`);
    console.log(`   Email: ${emailLower}`);
    console.log(`   Simulated Reset Code: ${code}`);
    console.log(`============================================================\n`);

    // Prepare email templates
    const emailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 40px 20px; text-align: center; border-radius: 12px; max-width: 600px; margin: 0 auto;">
        <div style="margin-bottom: 24px;">
          <div style="background-color: #8b5cf6; width: 48px; height: 48px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 24px; box-shadow: 0 0 20px rgba(139, 92, 246, 0.4); margin: 0 auto;">P</div>
          <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 12px 0 4px 0; letter-spacing: -0.02em;">PaySphere Security</h1>
          <span style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Account Recovery</span>
        </div>
        <div style="background-color: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); padding: 32px; border-radius: 16px; text-align: left;">
          <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">Verification Code</h2>
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">We received a request to reset the password for your PaySphere account. Please use the verification code below to proceed with setting your new password. This code will expire in 15 minutes.</p>
          <div style="background-color: #1e293b; border: 1px solid #334155; padding: 16px; border-radius: 12px; text-align: center; font-size: 32px; font-weight: 800; color: #8b5cf6; letter-spacing: 6px; font-family: monospace; margin-bottom: 24px;">
            ${code}
          </div>
          <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0;">If you did not request a password reset, please ignore this email or contact support if you suspect unauthorized access to your account.</p>
        </div>
        <div style="margin-top: 24px; font-size: 11px; color: #64748b;">
          This is an automated security message. Please do not reply directly to this email.<br>
          &copy; ${new Date().getFullYear()} PaySphere. All rights reserved.
        </div>
      </div>
    `;

    const emailText = `Your PaySphere account verification code is: ${code}\n\nThis code will expire in 15 minutes.\nIf you did not request a password reset, please ignore this email.`;

    // Attempt to send email asynchronously so the client request is completed instantly
    sendEmail({
      to: emailLower,
      subject: '🔒 Reset Your PaySphere Password',
      text: emailText,
      html: emailHtml,
    }).catch((err) => {
      console.error('Background sendEmail error:', err);
    });

    return res.json({
      message: 'A verification code has been sent to your email address.',
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ error: 'Server error during forgot password.' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, password } = req.body;
    if (!email || !code || !password) {
      return res.status(400).json({ error: 'All fields (email, code, new password) are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const emailLower = email.toLowerCase();
    const tokenData = resetTokens.get(emailLower);

    if (!tokenData || tokenData.code !== code || tokenData.expiresAt < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired verification code.' });
    }

    const userRes = await pool.query('SELECT id FROM users WHERE email = $1', [emailLower]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'No account found with this email address.' });
    }
    const user = userRes.rows[0];

    const passwordHash = await bcrypt.hash(password, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, user.id]);

    // Clear reset token
    resetTokens.delete(emailLower);

    // Save security notification for user
    await pool.query(
      `INSERT INTO notifications (user_id, title, body, time)
       VALUES ($1, 'Security Alert 🔒', 'Your password was successfully updated via Forgot Password.', 'Just now')`,
      [user.id]
    );

    return res.json({ message: 'Password reset successfully!' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ error: 'Server error during password reset.' });
  }
});

export default router;
