import React, { useState } from 'react';
import { Mail, Lock, User, Smartphone, Loader2, Sparkles, LogIn, Eye, EyeOff, KeyRound, CheckCircle2, ShieldCheck, ArrowLeft } from 'lucide-react';
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
    <div className="auth-page-wrapper animate-fade-in">
      <style>{`
        .auth-page-wrapper {
          display: flex;
          min-height: 100vh;
          width: 100vw;
          background: var(--bg-app);
          font-family: var(--font-body);
          position: relative;
          overflow: hidden;
        }

        /* Decorative Grid & Blur Orbs */
        .auth-grid-overlay {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px);
          background-size: 50px 50px;
          pointer-events: none;
          z-index: 0;
        }

        .auth-orb-1 {
          position: absolute;
          top: -20%;
          left: -10%;
          width: 50vw;
          height: 50vw;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0) 70%);
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }

        .auth-orb-2 {
          position: absolute;
          bottom: -20%;
          right: -10%;
          width: 50vw;
          height: 50vw;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(99, 102, 241, 0) 70%);
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }

        /* Left Column (Visuals) */
        .auth-visual-panel {
          flex: 1.2;
          background: linear-gradient(145deg, rgba(10, 11, 20, 0.95), rgba(7, 8, 13, 0.99));
          padding: 64px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-right: 1px solid var(--border-color);
          position: relative;
          z-index: 1;
        }

        @media (max-width: 968px) {
          .auth-visual-panel {
            display: none;
          }
        }

        .auth-visual-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-box {
          background: var(--primary);
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: 20px;
          box-shadow: var(--shadow-glow);
        }

        .logo-text {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.02em;
          background: var(--primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
        }

        .auth-visual-content {
          margin-top: auto;
          margin-bottom: auto;
          max-width: 520px;
          text-align: left;
        }

        .visual-headline {
          font-size: 38px;
          font-weight: 800;
          line-height: 1.25;
          margin: 0 0 16px 0;
          letter-spacing: -0.03em;
          color: var(--text-main);
        }

        .visual-subheadline {
          color: var(--text-muted);
          font-size: 15.5px;
          line-height: 1.6;
          margin: 0 0 32px 0;
        }

        .feature-list {
          display: flex;
          flex-direction: column;
          gap: 18px;
          margin-bottom: 40px;
        }

        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          font-size: 14.5px;
          color: var(--text-main);
          line-height: 1.4;
        }

        .feature-icon-wrapper {
          color: var(--primary-solid);
          background: var(--primary-glow);
          padding: 4px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .testimonial-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border-radius: 14px;
          padding: 24px;
          text-align: left;
        }

        .testimonial-text {
          color: var(--text-main);
          font-size: 14px;
          font-style: italic;
          line-height: 1.5;
          margin: 0 0 12px 0;
        }

        .testimonial-author {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .author-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary-solid), var(--secondary));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
          color: white;
        }

        /* Right Column (Form) */
        .auth-form-panel {
          flex: 0.8;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 64px 48px;
          position: relative;
          z-index: 1;
        }

        @media (max-width: 968px) {
          .auth-form-panel {
            flex: 1;
            padding: 24px 16px;
          }
        }

        .form-container {
          width: 100%;
          max-width: 400px;
        }

        .mobile-logo-header {
          display: none;
          align-items: center;
          gap: 10px;
          margin-bottom: 32px;
        }

        @media (max-width: 968px) {
          .mobile-logo-header {
            display: flex;
          }
        }

        .form-header {
          margin-bottom: 28px;
          text-align: left;
        }

        .form-title {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin: 0 0 8px 0;
          color: var(--text-main);
        }

        .form-subtitle {
          color: var(--text-muted);
          font-size: 14px;
          line-height: 1.5;
          margin: 0;
        }

        /* Form input spacing and refinements */
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group-custom {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-wrapper-custom {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon-custom {
          position: absolute;
          left: 14px;
          color: var(--text-muted);
          pointer-events: none;
        }

        .auth-input {
          width: 100%;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--border-color);
          color: var(--text-main);
          border-radius: 12px;
          padding: 14px 16px 14px 42px;
          font-size: 15px;
          font-family: var(--font-body);
          transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
        }

        .auth-input:focus {
          border-color: var(--primary-solid);
          box-shadow: 0 0 0 3px var(--primary-glow);
          outline: none;
        }

        .password-input {
          padding-right: 44px;
        }

        .pw-toggle-btn {
          position: absolute;
          right: 14px;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pw-toggle-btn:hover {
          color: var(--text-main);
        }

        .auth-action-link-btn {
          background: none;
          border: none;
          color: var(--primary-solid);
          font-weight: 700;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
        }

        .auth-action-link-btn:hover {
          color: var(--primary-light);
        }

        .submit-btn-custom {
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 15px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: var(--primary-glow) 0px 8px 16px;
          transition: transform var(--transition-fast), box-shadow var(--transition-fast);
        }

        .submit-btn-custom:hover {
          transform: translateY(-1.5px);
          box-shadow: var(--primary-glow) 0px 12px 24px, 0 0 0 2px var(--primary-solid);
        }

        .submit-btn-custom:active {
          transform: translateY(0);
        }

        .secure-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 8px;
        }
      `}</style>

      <div className="auth-grid-overlay" />
      <div className="auth-orb-1" />
      <div className="auth-orb-2" />

      {/* Visual panel (left) */}
      <div className="auth-visual-panel">
        <div className="auth-visual-logo">
          <div className="logo-box">P</div>
          <div style={{ textAlign: 'left' }}>
            <h1 className="logo-text">PaySphere</h1>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Utility & Finance</span>
          </div>
        </div>

        <div className="auth-visual-content">
          <h2 className="visual-headline">Simplifying utility payments, one transaction at a time.</h2>
          <p className="visual-subheadline">Access a secure, premium portal built to handle airtime vending, data bundles, electricity bills, and secure fund routing seamlessly.</p>
          
          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <strong style={{ display: 'block', color: 'var(--text-main)' }}>Automated Settlement</strong>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Instant dispatch of cable, data, airtime and electricity tokens.</span>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <strong style={{ display: 'block', color: 'var(--text-main)' }}>Bank-Grade Security</strong>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Secured by PCI-DSS certified systems and AES-256 local database encryption.</span>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <strong style={{ display: 'block', color: 'var(--text-main)' }}>Enterprise Auditing</strong>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Track expenses, view history, and generate printable PDF transaction receipts.</span>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <p className="testimonial-text">
              "PaySphere has completely transformed how our business handles monthly electricity utility bills and data bundle allocations. The service is fast, automated, and extremely reliable."
            </p>
            <div className="testimonial-author">
              <div className="author-avatar">KO</div>
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '700', margin: 0, color: 'var(--text-main)' }}>Kelechi O.</h4>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Operations Director</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={14} style={{ color: 'var(--success)' }} /> Protected by PaySphere security protocols.
        </div>
      </div>

      {/* Form panel (right) */}
      <div className="auth-form-panel">
        <div className="form-container">
          
          {/* Mobile Logo Header */}
          <div className="mobile-logo-header">
            <div className="logo-box">P</div>
            <div style={{ textAlign: 'left' }}>
              <h1 className="logo-text" style={{ fontSize: '18px' }}>PaySphere</h1>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Utility Portal</span>
            </div>
          </div>

          <div className="form-header animate-slide-up">
            <h2 className="form-title">
              {view === 'login' && 'Welcome back'}
              {view === 'register' && 'Create account'}
              {view === 'forgot-password' && 'Reset password'}
              {view === 'reset-password' && 'Enter new password'}
            </h2>
            <p className="form-subtitle">
              {view === 'login' && 'Enter your credentials to manage your utility wallet.'}
              {view === 'register' && 'Register today to initialize your digital payment wallet.'}
              {view === 'forgot-password' && 'Enter your email to receive a secure recovery code.'}
              {view === 'reset-password' && 'Choose a strong security password for your account.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form animate-slide-up">
            {view === 'register' && (
              <div className="form-group-custom">
                <label className="form-label" htmlFor="register-name">Full Name</label>
                <div className="input-wrapper-custom">
                  <User size={16} className="input-icon-custom" />
                  <input 
                    id="register-name" 
                    type="text" 
                    placeholder="e.g. John Doe" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="auth-input" 
                    required 
                  />
                </div>
              </div>
            )}

            {(view === 'login' || view === 'register' || view === 'forgot-password') && (
              <div className="form-group-custom">
                <label className="form-label" htmlFor="auth-email">Email Address</label>
                <div className="input-wrapper-custom">
                  <Mail size={16} className="input-icon-custom" />
                  <input 
                    id="auth-email" 
                    type="email" 
                    placeholder="e.g. johndoe@example.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value.toLowerCase())} 
                    className="auth-input" 
                    required 
                  />
                </div>
              </div>
            )}

            {view === 'register' && (
              <div className="form-group-custom">
                <label className="form-label" htmlFor="register-phone">Phone Number</label>
                <div className="input-wrapper-custom">
                  <Smartphone size={16} className="input-icon-custom" />
                  <input 
                    id="register-phone" 
                    type="tel" 
                    placeholder="e.g. 08031234567" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} 
                    className="auth-input" 
                    maxLength={11} 
                    required 
                  />
                </div>
              </div>
            )}

            {view === 'reset-password' && (
              <div className="form-group-custom">
                <label className="form-label" htmlFor="reset-code">Verification Code</label>
                <div className="input-wrapper-custom">
                  <KeyRound size={16} className="input-icon-custom" />
                  <input 
                    id="reset-code" 
                    type="text" 
                    placeholder="e.g. 123456" 
                    value={resetCode} 
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))} 
                    className="auth-input" 
                    maxLength={6} 
                    required 
                  />
                </div>
              </div>
            )}

            {(view === 'login' || view === 'register' || view === 'reset-password') && (
              <div className="form-group-custom">
                <label className="form-label" htmlFor="auth-password">
                  {view === 'reset-password' ? 'New Password' : 'Password'}
                </label>
                <div className="input-wrapper-custom">
                  <Lock size={16} className="input-icon-custom" />
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="auth-input password-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="pw-toggle-btn"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {(view === 'register' || view === 'reset-password') && (
              <div className="form-group-custom">
                <label className="form-label" htmlFor="register-confirm-password">Confirm Password</label>
                <div className="input-wrapper-custom">
                  <Lock size={16} className="input-icon-custom" />
                  <input
                    id="register-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="auth-input password-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="pw-toggle-btn"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {view === 'login' && (
              <div style={{ textAlign: 'right', marginTop: '-10px' }}>
                <button 
                  type="button" 
                  onClick={() => switchView('forgot-password')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'color var(--transition-fast)', padding: 0 }}
                  onMouseEnter={(e) => e.target.style.color = 'var(--primary-light)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {errorMessage && (
              <div className="badge badge-error animate-fade-in" style={{ padding: '12px 14px', fontSize: '12px', textTransform: 'none', borderRadius: '10px', width: '100%', display: 'block', textAlign: 'left', lineHeight: '140%' }}>
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="badge badge-success animate-fade-in" style={{ padding: '12px 14px', fontSize: '12px', textTransform: 'none', borderRadius: '10px', width: '100%', display: 'block', textAlign: 'left', lineHeight: '140%' }}>
                {successMessage}
              </div>
            )}

            <button type="submit" className="submit-btn-custom" disabled={isProcessing}>
              {isProcessing ? (
                <Loader2 className="animate-spin" size={18} />
              ) : view === 'login' ? (
                <><LogIn size={18} /> Login to Wallet</>
              ) : view === 'register' ? (
                <><Sparkles size={18} /> Initialize Account</>
              ) : view === 'forgot-password' ? (
                <><KeyRound size={18} /> Generate Code</>
              ) : (
                <><Sparkles size={18} /> Update Password</>
              )}
            </button>
          </form>

          <div style={{ marginTop: '28px', fontSize: '14px', textAlign: 'center' }}>
            {view === 'login' && (
              <>
                <span style={{ color: 'var(--text-muted)' }}>Don't have an account? </span>
                <button onClick={() => switchView('register')} className="auth-action-link-btn">
                  Register here
                </button>
              </>
            )}
            {view === 'register' && (
              <>
                <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
                <button onClick={() => switchView('login')} className="auth-action-link-btn">
                  Login here
                </button>
              </>
            )}
            {(view === 'forgot-password' || view === 'reset-password') && (
              <button onClick={() => switchView('login')} className="auth-action-link-btn" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <ArrowLeft size={14} /> Back to Login
              </button>
            )}
          </div>

          {onBackToLanding && (
            <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '20px', textAlign: 'center' }}>
              <button 
                type="button"
                onClick={onBackToLanding}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                onMouseEnter={(e) => e.target.style.color = 'var(--text-main)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
              >
                ← Return to Landing Page
              </button>
            </div>
          )}

          <div className="secure-badge">
            <ShieldCheck size={14} style={{ color: 'var(--success)' }} />
            Secured by AES-256 & Paystack Inline SDK
          </div>

        </div>
      </div>
    </div>
  );
}
