import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Zap, 
  Tv, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  CreditCard,
  DollarSign,
  Gift,
  Copy,
  Check
} from 'lucide-react';
import { apiGetReferrals } from '../api.js';

export default function Dashboard({ 
  walletBalance, 
  transactions, 
  currentUser,
  setActiveTab,
  onOpenFundModal,
  onViewReceipt 
}) {
  const [referralStats, setReferralStats] = useState({ referralCount: 0, rewardedCount: 0 });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchStats = async () => {
      try {
        const data = await apiGetReferrals();
        if (active) {
          setReferralStats(data);
        }
      } catch (err) {
        console.error('Error fetching referral stats:', err);
      }
    };
    fetchStats();
    return () => { active = false; };
  }, [currentUser]);

  const referralLink = `${import.meta.env.VITE_FRONTEND_URL || window.location.origin}?ref=${currentUser?.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Calculate analytics
  const totalSpent = transactions
    .filter(t => t.type !== 'funding' && t.status === 'success')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFunded = transactions
    .filter(t => t.type === 'funding' && t.status === 'success')
    .reduce((sum, t) => sum + t.amount, 0);

  const recentTransactions = transactions.slice(0, 4);

  const quickActions = [
    { id: 'airtime-data', label: 'Buy Airtime', desc: 'Instant top-up', icon: Smartphone, color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.15)' },
    { id: 'airtime-data', label: 'Buy Data', desc: 'Internet bundles', icon: Smartphone, color: '#ec4899', glow: 'rgba(236, 72, 153, 0.15)' },
    { id: 'electricity', label: 'Pay Electricity', desc: 'Utility tokens', icon: Zap, color: '#eab308', glow: 'rgba(234, 179, 8, 0.15)' },
    { id: 'cable-tv', label: 'TV Subscription', desc: 'Cable channels', icon: Tv, color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.15)' },
  ];

  // SVG Custom Chart Data
  // Let's draw an SVG path representing transaction history trends
  // We'll map the last 7 transactions amounts to visual heights
  const chartHeight = 120;
  const chartWidth = 500;
  const chartPoints = transactions
    .filter(t => t.status === 'success')
    .slice(0, 7)
    .reverse();
  
  const maxVal = Math.max(...chartPoints.map(p => p.amount), 5000);
  const pointsString = chartPoints.map((p, i) => {
    const x = (i * (chartWidth / (Math.max(chartPoints.length - 1, 1))));
    const y = chartHeight - (p.amount / maxVal) * (chartHeight - 20) - 10;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Welcome Banner */}
      <div className="dashboard-welcome-banner">
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', margin: 0, letterSpacing: '-0.02em' }}>
            Hello, {currentUser?.name || 'there'} 👋
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Manage your utilities, pay bills and track your spending patterns.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }} className="welcome-buttons">
          <button 
            className="btn-secondary" 
            onClick={() => setActiveTab('history')}
            style={{ padding: '10px 20px', borderRadius: '12px', fontSize: '14px' }}
          >
            View History
          </button>
          <button 
            className="btn-primary" 
            onClick={onOpenFundModal}
            style={{ padding: '10px 20px', borderRadius: '12px', fontSize: '14px' }}
          >
            Add Money
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        
        {/* Wallet Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '4px solid var(--primary-solid)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600' }}>Wallet Balance</span>
            <div style={{ background: 'var(--primary-glow)', padding: '6px', borderRadius: '8px', color: 'var(--primary-solid)' }}>
              <CreditCard size={18} />
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '28px', fontWeight: '800', margin: 0 }}>
              <span style={{ fontFamily: 'var(--font-body)', marginRight: '2px' }}>₦</span>
              <span style={{ fontFamily: 'monospace' }}>{walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
              <TrendingUp size={12} /> Live Wallet
            </span>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '4px solid var(--accent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600' }}>Total Bill Payments</span>
            <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '6px', borderRadius: '8px', color: 'var(--accent)' }}>
              <ArrowUpRight size={18} />
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '28px', fontWeight: '800', margin: 0 }}>
              <span style={{ fontFamily: 'var(--font-body)', marginRight: '2px' }}>₦</span>
              <span style={{ fontFamily: 'monospace' }}>{totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
              This month's utility spending
            </span>
          </div>
        </div>

        {/* Funding Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '4px solid var(--success)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600' }}>Total Funded Balance</span>
            <div style={{ background: 'var(--success-glow)', padding: '6px', borderRadius: '8px', color: 'var(--success)' }}>
              <ArrowDownLeft size={18} />
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '28px', fontWeight: '800', margin: 0 }}>
              <span style={{ fontFamily: 'var(--font-body)', marginRight: '2px' }}>₦</span>
              <span style={{ fontFamily: 'monospace' }}>{totalFunded.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
              Lifetime account inflows
            </span>
          </div>
        </div>

      </div>

      {/* Main Dashboard Section */}
      <div className="dashboard-grid">
        
        {/* Left Section: Quick Actions & Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Quick actions Panel */}
          <div className="glass-card">
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Quick Utility Portal</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '16px' }}>
              {quickActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <div 
                    key={idx}
                    onClick={() => setActiveTab(action.id)}
                    style={{
                      border: '1px solid var(--border-color)',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '12px',
                      padding: '16px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                    }}
                    className="action-card-hover"
                  >
                    <div style={{ 
                      background: action.glow, 
                      color: action.color, 
                      width: '36px', 
                      height: '36px', 
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '12px'
                    }}>
                      <Icon size={20} />
                    </div>
                    <span style={{ display: 'block', fontSize: '13px', fontWeight: '700' }}>{action.label}</span>
                    <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{action.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SVG Spending Curve */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Billing Analytics Overview</h3>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Trend line of recent billing transactions</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '4px 10px', fontSize: '11px', fontWeight: '600' }}>
                <div style={{ width: '8px', height: '8px', background: 'var(--primary-solid)', borderRadius: '50%' }} />
                Billing Amount
              </div>
            </div>

            <div style={{ width: '100%', overflowX: 'auto', padding: '10px 0' }}>
              {chartPoints.length > 1 ? (
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: '100%' }}>
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary-solid)" stopOpacity="0.4"/>
                      <stop offset="100%" stopColor="var(--primary-solid)" stopOpacity="0.0"/>
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="0" y1="30" x2={chartWidth} y2="30" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="5 5" />
                  <line x1="0" y1="60" x2={chartWidth} y2="60" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="5 5" />
                  <line x1="0" y1="90" x2={chartWidth} y2="90" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="5 5" />

                  {/* Gradient Area */}
                  <path 
                    d={`M 0,${chartHeight} L ${pointsString} L ${chartWidth},${chartHeight} Z`} 
                    fill="url(#chartGrad)" 
                  />

                  {/* Trend Line */}
                  <path 
                    d={`M ${pointsString}`} 
                    fill="none" 
                    stroke="var(--primary-solid)" 
                    strokeWidth="3" 
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Nodes */}
                  {chartPoints.map((p, i) => {
                    const x = (i * (chartWidth / (chartPoints.length - 1)));
                    const y = chartHeight - (p.amount / maxVal) * (chartHeight - 20) - 10;
                    return (
                      <g key={i}>
                        <circle cx={x} cy={y} r="5" fill="var(--bg-app)" stroke="var(--primary-solid)" strokeWidth="3" />
                        <text x={x} y={y - 12} fontSize="9" fill="var(--text-main)" fontWeight="600" textAnchor="middle">
                          ₦{p.amount}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              ) : (
                <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Complete payments to populate the spending trend line.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Section: Recent Bills Panel & Referrals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Recent Bills</h3>
              <button 
                onClick={() => setActiveTab('history')}
                style={{ background: 'none', border: 'none', color: 'var(--primary-solid)', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
              >
                See All
              </button>
            </div>

            {recentTransactions.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  ∅
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>No transactions recorded yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {recentTransactions.map((tx) => (
                  <div 
                    key={tx.id}
                    onClick={() => onViewReceipt(tx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                    className="tx-item-hover"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: tx.type === 'funding' ? 'var(--success-glow)' : 'rgba(255, 255, 255, 0.03)',
                        color: tx.type === 'funding' ? 'var(--success)' : 'var(--text-main)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {tx.type === 'funding' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <span style={{ display: 'block', fontSize: '13px', fontWeight: '600' }}>
                          {tx.title}
                        </span>
                        <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {tx.date} • {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ 
                        display: 'block', 
                        fontSize: '13px', 
                        fontWeight: '700', 
                        color: tx.type === 'funding' ? 'var(--success)' : 'var(--text-main)'
                      }}>
                        {tx.type === 'funding' ? '+' : '-'}
                        <span style={{ fontFamily: 'var(--font-body)', marginRight: '2px' }}>₦</span>
                        <span style={{ fontFamily: 'monospace' }}>{tx.amount.toLocaleString()}</span>
                      </span>
                      <span className={`badge ${tx.status === 'success' ? 'badge-success' : tx.status === 'pending' ? 'badge-warning' : 'badge-error'}`} style={{ fontSize: '8px', padding: '2px 6px', marginTop: '4px' }}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Referral Card */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--glass-bg-accent, rgba(139, 92, 246, 0.03))', border: '1px solid var(--primary-glow)' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ background: 'var(--primary-glow)', padding: '10px', borderRadius: '12px', color: 'var(--primary-solid)', display: 'flex' }}>
                <Gift size={20} />
              </div>
              <div style={{ textAlign: 'left', flex: 1 }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>Invite & Earn ₦100</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px', lineHeight: '140%' }}>
                  Invite friends to register with your link. When they make their first bill purchase, they get <strong style={{ color: 'var(--text-main)' }}>₦100</strong> credited to their wallet!
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <input 
                type="text" 
                readOnly 
                value={referralLink} 
                className="form-input" 
                style={{ flex: 1, fontSize: '12.5px', background: 'rgba(0,0,0,0.2)', textOverflow: 'ellipsis', fontFamily: 'monospace' }}
              />
              <button 
                onClick={handleCopyLink} 
                className="btn-primary" 
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px', fontSize: '13px', whiteSpace: 'nowrap' }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '4px' }}>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Friends Registered</span>
                <strong style={{ display: 'block', fontSize: '18px', marginTop: '2px', fontFamily: 'monospace' }}>{referralStats.referralCount}</strong>
              </div>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Qualified Purchases</span>
                <strong style={{ display: 'block', fontSize: '18px', marginTop: '2px', fontFamily: 'monospace', color: 'var(--success)' }}>{referralStats.rewardedCount}</strong>
              </div>
            </div>
          </div>

      </div>
    </div>

    <style>{`
        .action-card-hover:hover {
          background: rgba(255, 255, 255, 0.05) !important;
          border-color: var(--primary-light) !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(139,92,246,0.1);
        }
        .tx-item-hover:hover {
          background: rgba(255, 255, 255, 0.05) !important;
          transform: scale(1.01);
        }
      `}</style>

    </div>
  );
}
