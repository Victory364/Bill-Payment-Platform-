import React, { useState } from 'react';
import { Bell, Eye, EyeOff, Plus, Search, Sun, Moon, Menu } from 'lucide-react';

export default function Header({ 
  walletBalance, 
  onOpenFundModal, 
  theme, 
  toggleTheme, 
  notifications = [],
  currentUser = null,
  onToggleSidebar
}) {
  // Build initials from name (e.g. "John Doe" → "JD")
  const initials = currentUser?.name
    ? currentUser.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'PS';
  const [showBalance, setShowBalance] = useState(true);
  const [showNotifPopover, setShowNotifPopover] = useState(false);

  return (
    <header 
      className="glass-panel animate-fade-in app-header"
    >
      {/* Title / Search / Menu Button */}
      <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={onToggleSidebar}
          className="mobile-menu-btn"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            cursor: 'pointer',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '10px'
          }}
          aria-label="Toggle Menu"
        >
          <Menu size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }} className="header-search-container">
          <Search size={18} style={{ color: 'var(--text-muted)', position: 'absolute', left: '12px' }} />
          <input 
            type="text" 
            placeholder="Search for bills, operators or history..." 
            style={{
              padding: '8px 16px 8px 38px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: 'rgba(0, 0, 0, 0.1)',
              color: 'var(--text-main)',
              width: '280px',
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Profile & Wallet Actions */}
      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        
        {/* Wallet Balance Display */}
        <div className="header-balance-card" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', padding: '6px 14px', borderRadius: '12px' }}>
          <div>
            <span className="header-balance-label" style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Wallet Balance</span>
            <span style={{ fontSize: '16px', fontWeight: '700' }}>
              <span style={{ fontFamily: 'var(--font-body)', marginRight: '2px' }}>₦</span>
              <span style={{ fontFamily: 'monospace' }}>
                {showBalance ? walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '••••••'}
              </span>
            </span>
          </div>
          <button 
            onClick={() => setShowBalance(!showBalance)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: '4px', borderRadius: '6px' }}
          >
            {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Quick Fund Button */}
        <button 
          onClick={onOpenFundModal}
          className="btn-primary header-fund-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '10px',
            fontSize: '13px',
          }}
        >
          <Plus size={16} />
          Fund
        </button>

        {/* Action Toggles */}
        <div className="header-actions-toggles" style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid var(--border-color)', paddingLeft: '20px' }}>
          
          {/* Light/Dark Toggle */}
          <button 
            onClick={toggleTheme}
            className="header-theme-btn"
            style={{ 
              background: 'var(--bg-card)', 
              border: '1px solid var(--border-color)', 
              color: 'var(--text-main)', 
              cursor: 'pointer', 
              width: '36px', 
              height: '36px', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              transition: 'all var(--transition-fast)'
            }}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notifications */}
          <div className="header-notif-btn-wrapper" style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowNotifPopover(!showNotifPopover)}
              style={{ 
                background: 'var(--bg-card)', 
                border: '1px solid var(--border-color)', 
                color: 'var(--text-main)', 
                cursor: 'pointer', 
                width: '36px', 
                height: '36px', 
                borderRadius: '10px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              <Bell size={18} />
              {notifications.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '8px',
                  height: '8px',
                  background: 'var(--accent)',
                  borderRadius: '50%',
                  border: '2px solid var(--bg-app)'
                }} />
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifPopover && (
              <div 
                className="glass-panel"
                style={{
                  position: 'absolute',
                  top: '48px',
                  right: 0,
                  width: '280px',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: 'var(--shadow-main)',
                  border: '1px solid var(--border-color)',
                  zIndex: 100,
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700' }}>Notifications</span>
                  {notifications.length > 0 && (
                    <span style={{ fontSize: '11px', color: 'var(--primary-solid)', cursor: 'pointer' }}>Mark all read</span>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>No new notifications</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {notifications.map((notif, index) => (
                      <div key={index} style={{ fontSize: '12px', paddingBottom: '8px', borderBottom: index < notifications.length - 1 ? '1px dashed rgba(255,255,255,0.05)' : 'none' }}>
                        <div style={{ fontWeight: '600', marginBottom: '2px' }}>{notif.title}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{notif.body}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '9px', marginTop: '4px', textAlign: 'right' }}>{notif.time}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Profile Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '8px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '700',
              fontSize: '14px',
              border: '2px solid var(--border-color)'
            }}>
              {initials}
            </div>
          </div>

        </div>

      </div>
    </header>
  );
}
