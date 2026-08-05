import React from 'react';
import { BarChart, Wallet, PieChart, Info, ShieldAlert, Sparkles, TrendingDown } from 'lucide-react';

export default function Analytics({ transactions }) {
  // Extract payments
  const payments = transactions.filter(t => t.type !== 'funding' && t.status === 'success');
  const totalSpend = payments.reduce((sum, t) => sum + t.amount, 0);

  // Group by category
  const categories = {
    airtime: { label: 'Airtime VTU', count: 0, amount: 0, color: '#8b5cf6' },
    data: { label: 'Data Bundles', count: 0, amount: 0, color: '#ec4899' },
    electricity: { label: 'Electricity Bills', count: 0, amount: 0, color: '#eab308' },
    'cable-tv': { label: 'Cable TV Subs', count: 0, amount: 0, color: '#3b82f6' }
  };

  payments.forEach((t) => {
    if (categories[t.type]) {
      categories[t.type].count += 1;
      categories[t.type].amount += t.amount;
    }
  });

  const catArray = Object.keys(categories).map((key) => ({
    key,
    ...categories[key],
    percentage: totalSpend > 0 ? (categories[key].amount / totalSpend) * 100 : 0
  }));

  // Calculations for custom insights
  const maxCategory = catArray.reduce((max, c) => c.amount > max.amount ? c : max, { amount: 0, label: 'None' });
  
  // Generate financial tips
  const getInsights = () => {
    if (totalSpend === 0) {
      return [
        { icon: Info, color: 'var(--primary-solid)', text: 'No transaction history available yet. Complete bill payments to receive spending analysis tips.' }
      ];
    }

    const tips = [];
    if (categories['cable-tv'].amount > 20000) {
      tips.push({
        icon: Sparkles,
        color: '#3b82f6',
        text: `You spent ₦${categories['cable-tv'].amount.toLocaleString()} on TV subscriptions. Downgrading decoder plans during busy months could save you up to ₦100,000 this year.`
      });
    }

    if (categories.airtime.amount > 5000) {
      tips.push({
        icon: TrendingDown,
        color: '#8b5cf6',
        text: 'Airtime VTU consumption is high. Purchasing monthly data/voice bundle alternatives is typically 20% cheaper than direct VTU top-ups.'
      });
    }

    if (categories.electricity.amount > 15000) {
      tips.push({
        icon: ShieldAlert,
        color: '#eab308',
        text: 'Electricity usage spikes noted. Setting up timers for high-load appliances like water heaters can reduce billing tariffs by 15%.'
      });
    }

    if (tips.length === 0) {
      tips.push({
        icon: Sparkles,
        color: 'var(--success)',
        text: 'Good budget control! Your utility billing distribution is well balanced across all categories.'
      });
    }

    return tips;
  };

  // Build SVG Pie Donut Chart calculations
  let accumulatedPercent = 0;
  const donutRadius = 50;
  const donutCircumference = 2 * Math.PI * donutRadius;

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Title */}
      <div style={{ textAlign: 'left' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Spending Analytics</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
          Visual insights of your utility expenditures and smart saving advice.
        </p>
      </div>

      <div className="dashboard-grid">
        
        {/* Left Section: Donut Pie & Legend */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <PieChart size={18} style={{ color: 'var(--primary-solid)' }} />
            Category Distribution
          </h3>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '48px', padding: '16px 0' }}>
            
            {/* SVG Donut */}
            {totalSpend > 0 ? (
              <div style={{ position: 'relative', width: '180px', height: '180px' }}>
                <svg viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                  <circle cx="60" cy="60" r={donutRadius} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
                  {catArray.map((cat, idx) => {
                    if (cat.percentage === 0) return null;
                    const strokeDash = (cat.percentage / 100) * donutCircumference;
                    const strokeOffset = donutCircumference - (accumulatedPercent / 100) * donutCircumference;
                    accumulatedPercent += cat.percentage;

                    return (
                      <circle
                        key={idx}
                        cx="60"
                        cy="60"
                        r={donutRadius}
                        fill="none"
                        stroke={cat.color}
                        strokeWidth="12"
                        strokeDasharray={`${strokeDash} ${donutCircumference}`}
                        strokeDashoffset={strokeOffset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                      />
                    );
                  })}
                </svg>
                {/* Center Balance Label */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center'
                }}>
                  <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Spent</span>
                  <span style={{ fontSize: '16px', fontWeight: '800', fontFamily: 'monospace' }}>
                    ₦{totalSpend.toLocaleString()}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ width: '180px', height: '180px', borderRadius: '50%', border: '4px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                No Spend Data
              </div>
            )}

            {/* Legend info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, minWidth: '200px' }}>
              {catArray.map((cat, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: cat.color }} />
                    <span style={{ fontSize: '13px', fontWeight: '600' }}>{cat.label}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'block', fontSize: '13px', fontWeight: '700', fontFamily: 'monospace' }}>
                      ₦{cat.amount.toLocaleString()}
                    </span>
                    <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {cat.percentage.toFixed(1)}% • {cat.count} bills
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Right Section: Smart Savings & Projections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Smart Advisor panel */}
          <div className="glass-card" style={{ flex: 1 }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              💡 PaySphere Savings Advisor
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {getInsights().map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '14px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    alignItems: 'flex-start',
                    textAlign: 'left'
                  }}>
                    <div style={{
                      background: 'rgba(255,255,255,0.03)',
                      color: item.color,
                      padding: '6px',
                      borderRadius: '8px',
                      display: 'flex',
                      flexShrink: 0
                    }}>
                      <Icon size={16} />
                    </div>
                    <p style={{ fontSize: '12px', lineHeight: '140%', color: 'var(--text-main)' }}>
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Metrics Projection */}
          <div className="glass-card" style={{ background: 'var(--primary-glow)', borderColor: 'var(--primary-solid)', borderLeftWidth: '4px' }}>
            <h4 style={{ fontSize: '14px', color: 'var(--primary-light)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Future Projections
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'left' }}>
              Based on your billing frequencies, your estimated utility expenditure for the next 90 days is 
            </p>
            <h3 style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'monospace', marginTop: '10px', textAlign: 'left' }}>
              ₦{(totalSpend * 3).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </h3>
          </div>

        </div>

      </div>

    </div>
  );
}
