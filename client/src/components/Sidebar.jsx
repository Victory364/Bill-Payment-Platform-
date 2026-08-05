import React from 'react';
import { 
  LayoutDashboard, 
  Smartphone, 
  Zap, 
  Tv, 
  History, 
  BarChart3, 
  Settings, 
  CreditCard,
  LogOut,
  X
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onLogout, isOpen, onClose }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'airtime-data', label: 'Airtime & Data', icon: Smartphone },
    { id: 'electricity', label: 'Electricity', icon: Zap },
    { id: 'cable-tv', label: 'Cable TV', icon: Tv },
    { id: 'history', label: 'Transaction History', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside 
      className={`glass-panel app-sidebar ${isOpen ? 'open' : ''}`}
    >
      <div>
        {/* Brand Logo & Close Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', padding: '0 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: 'var(--primary)',
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '800',
              fontSize: '20px',
              boxShadow: 'var(--shadow-glow)'
            }}>
              P
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: '800', margin: 0, letterSpacing: '-0.02em', background: 'var(--primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                PaySphere
              </h1>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>Bill Payments & Utility</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="sidebar-close-btn"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              borderRadius: '8px'
            }}
            aria-label="Close Sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Menu Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: isActive ? 'var(--primary-glow)' : 'transparent',
                  color: isActive ? 'var(--primary-solid)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: isActive ? '600' : '500',
                  fontSize: '14px',
                  transition: 'all var(--transition-fast)',
                  textAlign: 'left',
                  borderLeft: isActive ? '3px solid var(--primary-solid)' : '3px solid transparent',
                }}
                className={!isActive ? 'sidebar-item-hover' : ''}
              >
                <Icon size={18} style={{ color: isActive ? 'var(--primary-solid)' : 'inherit' }} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div>
        <div style={{ 
          padding: '16px', 
          borderRadius: '16px', 
          background: 'rgba(255, 255, 255, 0.03)', 
          border: '1px solid var(--border-color)',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={16} style={{ color: 'var(--primary-solid)' }} />
            <span style={{ fontSize: '12px', fontWeight: '600' }}>Tiers Limits</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '65%', background: 'var(--primary)' }} />
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Level 2 Verified • 65% limit used</span>
        </div>

        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            width: '100%',
            padding: '12px 16px',
            borderRadius: '12px',
            border: 'none',
            background: 'transparent',
            color: 'var(--accent)',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'all var(--transition-fast)',
            textAlign: 'left',
          }}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

      <style>{`
        .sidebar-item-hover:hover {
          background: rgba(255, 255, 255, 0.04) !important;
          color: var(--text-main) !important;
          padding-left: 20px !important;
        }
        :root.light .sidebar-item-hover:hover {
          background: rgba(0, 0, 0, 0.03) !important;
        }
      `}</style>
    </aside>
  );
}
