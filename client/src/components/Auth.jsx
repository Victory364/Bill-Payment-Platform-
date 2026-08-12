import React, { useState } from 'react';
import { Mail, Lock, User, Smartphone, Loader2, Sparkles, LogIn, Eye, EyeOff, KeyRound } from 'lucide-react';
import { apiLogin, apiRegister, apiForgotPassword, apiResetPassword } from '../api.js';

export default function Auth({ onLoginSuccess, onBackToLanding }) {
  const [view, setView] = useState('login'); // 'login' | 'register' | 'forgot-password' | 'reset-password'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetCode, setResetCode] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (view === 'login') {
      // ── LOGIN ──────────────────────────────────────────────
      setIsProcessing(true);
      try {
        const { token, user } = await apiLogin(email, password);
        onLoginSuccess(user, token);
      } catch (err) {
        setErrorMessage(err.message || 'Invalid email address or password.');
      } finally {
        setIsProcessing(false);
      }

    } else if (view === 'register') {
      // ── REGISTER ───────────────────────────────────────────
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }
      if (phone.length !== 11) {
        setErrorMessage('Phone number must be exactly 11 digits.');
        return;
      }

      setIsProcessing(true);
      try {
        const referredBy = sessionStorage.getItem('paysphere_referred_by');
        await apiRegister(name, email, phone, password, referredBy);
        sessionStorage.removeItem('paysphere_referred_by');
        setSuccessMessage('Account created successfully! Switching to Login...');
        setName('');
        setPhone('');
        setTimeout(() => {
          setView('login');
          setSuccessMessage('');
          setPassword('');
        }, 1800);
      } catch (err) {
        setErrorMessage(err.message || 'Registration failed. Please try again.');
      } finally {
        setIsProcessing(false);
      }

    } else if (view === 'forgot-password') {
      // ── FORGOT PASSWORD ────────────────────────────────────
      setIsProcessing(true);
      try {
        const res = await apiForgotPassword(email);
        setSuccessMessage(`Simulated reset code generated: ${res.code}. Moving to password reset...`);
        setResetCode(res.code);
        setTimeout(() => {
          setView('reset-password');
          setSuccessMessage('');
          setPassword('');
          setConfirmPassword('');
        }, 2200);
      } catch (err) {
        setErrorMessage(err.message || 'Failed to request password reset.');
      } finally {
        setIsProcessing(false);
      }

    } else if (view === 'reset-password') {
      // ── RESET PASSWORD ─────────────────────────────────────
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }

      setIsProcessing(true);
      try {
        await apiResetPassword(email, resetCode, password);
        setSuccessMessage('Password reset successfully! Switching to login...');
        setTimeout(() => {
          setView('login');
          setSuccessMessage('');
          setPassword('');
          setConfirmPassword('');
          setResetCode('');
        }, 1800);
      } catch (err) {
        setErrorMessage(err.message || 'Failed to reset password. Please check the code.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const switchView = (newView) => {
    setView(newView);
    setErrorMessage('');
    setSuccessMessage('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'var(--bg-app)',
      position: 'relative',
      overflow: 'hidden'
    }} className="animate-fade-in">

      {/* Decorative Blur Orbs */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'var(--primary-glow)', filter: 'blur(120px)', borderRadius: '50%', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'rgba(99, 102, 241, 0.15)', filter: 'blur(120px)', borderRadius: '50%', zIndex: 0 }} />

      {/* Main Card */}
      <div className="glass-card animate-scale-in" style={{ width: '100%', maxWidth: '440px', padding: '40px 32px', zIndex: 1, textAlign: 'center', position: 'relative' }}>

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '32px' }}>
          <div style={{ background: 'var(--primary)', width: '44px', height: '44px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '22px', boxShadow: 'var(--shadow-glow)' }}>
            P
          </div>
          <div style={{ textAlign: 'left' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '800', margin: 0, letterSpacing: '-0.02em', background: 'var(--primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              PaySphere
            </h1>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>Utility & Finance Portal</span>
          </div>
        </div>

        <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px' }}>
          {view === 'login' && 'Welcome Back'}
          {view === 'register' && 'Create Account'}
          {view === 'forgot-password' && 'Reset Password'}
          {view === 'reset-password' && 'Enter New Password'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>
          {view === 'login' && 'Enter credentials to access your utility wallet'}
          {view === 'register' && 'Get standard ₦50,000 credit when you register'}
          {view === 'forgot-password' && 'Enter your email address to receive a security verification code.'}
          {view === 'reset-password' && 'Enter the 6-digit verification code and your new password.'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {view === 'register' && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="register-name">
                <User size={14} style={{ color: 'var(--primary-solid)' }} /> Full Name
              </label>
              <input id="register-name" type="text" placeholder="e.g. John Doe" value={name} onChange={(e) => setName(e.target.value)} className="form-input" required />
            </div>
          )}

          {(view === 'login' || view === 'register' || view === 'forgot-password') && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="auth-email">
                <Mail size={14} style={{ color: 'var(--primary-solid)' }} /> Email Address
              </label>
              <input id="auth-email" type="email" placeholder="e.g. johndoe@example.com" value={email} onChange={(e) => setEmail(e.target.value.toLowerCase())} className="form-input" required />
            </div>
          )}

          {view === 'register' && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="register-phone">
                <Smartphone size={14} style={{ color: 'var(--primary-solid)' }} /> Phone Number
              </label>
              <input id="register-phone" type="tel" placeholder="e.g. 08031234567" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} className="form-input" maxLength={11} required />
            </div>
          )}

          {view === 'reset-password' && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="reset-code">
                <KeyRound size={14} style={{ color: 'var(--primary-solid)' }} /> Verification Code
              </label>
              <input id="reset-code" type="text" placeholder="e.g. 123456" value={resetCode} onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))} className="form-input" maxLength={6} required />
            </div>
          )}

          {(view === 'login' || view === 'register' || view === 'reset-password') && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="auth-password">
                <Lock size={14} style={{ color: 'var(--primary-solid)' }} /> {view === 'reset-password' ? 'New Password' : 'Password'}
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', paddingRight: '44px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                    borderRadius: '6px',
                    transition: 'color var(--transition-fast)'
                  }}
                  className="password-toggle-btn"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          {(view === 'register' || view === 'reset-password') && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="register-confirm-password">
                <Lock size={14} style={{ color: 'var(--primary-solid)' }} /> Confirm Password
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  id="register-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', paddingRight: '44px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                    borderRadius: '6px',
                    transition: 'color var(--transition-fast)'
                  }}
                  className="password-toggle-btn"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          {view === 'login' && (
            <div style={{ textAlign: 'right', marginTop: '-8px' }}>
              <button 
                type="button" 
                onClick={() => switchView('forgot-password')}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', transition: 'color var(--transition-fast)', padding: 0 }}
                onMouseEnter={(e) => e.target.style.color = 'var(--primary-light)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
              >
                Forgot Password?
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="badge badge-error" style={{ padding: '10px', fontSize: '11px', textTransform: 'none', borderRadius: '8px' }}>
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="badge badge-success" style={{ padding: '10px', fontSize: '11px', textTransform: 'none', borderRadius: '8px' }}>
              {successMessage}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={isProcessing} style={{ padding: '14px', borderRadius: '12px', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {isProcessing ? (
              <Loader2 className="animate-spin" size={16} />
            ) : view === 'login' ? (
              <><LogIn size={16} /> Login to Account</>
            ) : view === 'register' ? (
              <><Sparkles size={16} /> Register & Get ₦50k</>
            ) : view === 'forgot-password' ? (
              <><Sparkles size={16} /> Send Reset Code</>
            ) : (
              <><Sparkles size={16} /> Reset Password</>
            )}
          </button>
        </form>

        <div style={{ marginTop: '24px', fontSize: '13px' }}>
          {view === 'login' && (
            <>
              <span style={{ color: 'var(--text-muted)' }}>Don't have an account? </span>
              <button onClick={() => switchView('register')}
                style={{ background: 'none', border: 'none', color: 'var(--primary-solid)', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}>
                Register now
              </button>
            </>
          )}
          {view === 'register' && (
            <>
              <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
              <button onClick={() => switchView('login')}
                style={{ background: 'none', border: 'none', color: 'var(--primary-solid)', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}>
                Login here
              </button>
            </>
          )}
          {(view === 'forgot-password' || view === 'reset-password') && (
            <button onClick={() => switchView('login')}
              style={{ background: 'none', border: 'none', color: 'var(--primary-solid)', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}>
              Back to Login
            </button>
          )}
        </div>

        {onBackToLanding && (
          <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <button 
              type="button"
              onClick={onBackToLanding}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
            >
              ← Back to Home Page
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
