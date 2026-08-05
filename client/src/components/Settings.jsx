import React, { useState } from 'react';
import { User, Bell, Shield, RotateCcw, Check, CheckCircle2 } from 'lucide-react';

export default function Settings({ 
  userSettings, 
  updateSettings, 
  onResetApp,
  theme,
  toggleTheme 
}) {
  const [profileName, setProfileName] = useState(userSettings.profileName || 'John Doe');
  const [profileEmail, setProfileEmail] = useState(userSettings.profileEmail || 'johndoe@example.com');
  const [profilePhone, setProfilePhone] = useState(userSettings.profilePhone || '08031234567');
  const [txnLimit, setTxnLimit] = useState(userSettings.transactionLimit || 20000);
  const [biometrics, setBiometrics] = useState(userSettings.enableBiometrics ?? true);
  const [notifications, setNotifications] = useState(userSettings.enableNotifications ?? true);
  
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmitProfile = (e) => {
    e.preventDefault();
    updateSettings({
      profileName,
      profileEmail,
      profilePhone,
      transactionLimit: parseFloat(txnLimit),
      enableBiometrics: biometrics,
      enableNotifications: notifications
    });
    
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }} className="animate-slide-up">
      
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Platform Configuration</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
          Configure safety parameters, profile information and interface preferences.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Profile Settings */}
        <div className="glass-card">
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
            <User size={18} style={{ color: 'var(--primary-solid)' }} />
            Profile Management
          </h3>

          <form onSubmit={handleSubmitProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="name-input">Full Name</label>
                <input 
                  id="name-input"
                  type="text" 
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="form-input" 
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="phone-input">Phone Number</label>
                <input 
                  id="phone-input"
                  type="tel" 
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="form-input" 
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="email-input">Email Address</label>
              <input 
                id="email-input"
                type="email" 
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                className="form-input" 
                required
              />
            </div>

            {/* Security controls */}
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginTop: '16px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <Shield size={18} style={{ color: 'var(--primary-solid)' }} />
              Security & Preferences
            </h3>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="limit-input">Single Transaction Limit (₦)</label>
              <input 
                id="limit-input"
                type="number" 
                value={txnLimit}
                onChange={(e) => setTxnLimit(e.target.value)}
                className="form-input" 
                min="1000"
                required
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Transactions higher than this limit will require security confirmation PIN.
              </span>
            </div>

            {/* Toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
              
              {/* Biometrics */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ textAlign: 'left' }}>
                  <span style={{ display: 'block', fontSize: '13px', fontWeight: '600' }}>Enable 2FA Verification</span>
                  <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>Simulate fingerprint/face verification check for invoices.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={biometrics}
                  onChange={(e) => setBiometrics(e.target.checked)}
                  style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--primary-solid)' }}
                />
              </div>

              {/* Push notifications */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ textAlign: 'left' }}>
                  <span style={{ display: 'block', fontSize: '13px', fontWeight: '600' }}>Instant Push Alerts</span>
                  <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>Receive in-app popovers for billing operations.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--primary-solid)' }}
                />
              </div>

              {/* Theme Settings inline */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ textAlign: 'left' }}>
                  <span style={{ display: 'block', fontSize: '13px', fontWeight: '600' }}>Dark Mode Experience</span>
                  <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>Toggle default background color schemas.</span>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="btn-secondary"
                  style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px' }}
                >
                  {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </button>
              </div>

            </div>

            {saveSuccess && (
              <div className="badge badge-success" style={{ padding: '12px', fontSize: '12px', textTransform: 'none', width: '100%', justifyContent: 'center', gap: '8px', borderRadius: '10px' }}>
                <CheckCircle2 size={16} /> Configuration saved successfully.
              </div>
            )}

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', borderRadius: '12px', marginTop: '10px' }}>
              Save Configuration
            </button>

          </form>
        </div>

        {/* Reset Platform */}
        <div className="glass-card" style={{ border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', alignItems: 'center', textAlign: 'left' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--error)' }}>Developer Sandbox Clean Reset</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Restore wallet balance to ₦50,000, clear customized settings and rebuild logs.
              </p>
            </div>
            <button 
              onClick={onResetApp}
              className="btn-secondary"
              style={{ 
                borderColor: 'var(--error)', 
                color: 'var(--error)', 
                background: 'rgba(239, 68, 68, 0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '10px',
                fontSize: '13px'
              }}
            >
              <RotateCcw size={16} />
              Reset App
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
