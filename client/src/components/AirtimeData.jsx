import React, { useState } from 'react';
import { Smartphone, ShieldCheck, Loader2 } from 'lucide-react';

export default function AirtimeData({ walletBalance, onProcessPayment }) {
  const [activeMode, setActiveMode] = useState('airtime'); // 'airtime' or 'data'
  const [selectedOperator, setSelectedOperator] = useState('mtn');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const operators = [
    { id: 'mtn', label: 'MTN', color: '#F2C94C', glow: 'rgba(242, 201, 76, 0.2)', prefix: ['0803', '0806', '0813', '0816', '0903', '0906', '0703', '0706'] },
    { id: 'airtel', label: 'Airtel', color: '#EB5757', glow: 'rgba(235, 87, 87, 0.2)', prefix: ['0802', '0808', '0812', '0701', '0708', '0902', '0907', '0901'] },
    { id: 'glo', label: 'Glo', color: '#27AE60', glow: 'rgba(39, 174, 96, 0.2)', prefix: ['0805', '0807', '0815', '0811', '0705', '0905'] },
    { id: '9mobile', label: '9mobile', color: '#219653', glow: 'rgba(33, 150, 83, 0.2)', prefix: ['0809', '0817', '0818', '0909', '0908'] }
  ];

  const dataPlans = [
    { id: 'plan1', label: '1.5 GB - 30 Days', price: 1200, desc: 'Best for light social media' },
    { id: 'plan2', label: '3 GB - 30 Days', price: 1600, desc: 'Great for web searching & messaging' },
    { id: 'plan3', label: '5 GB - 30 Days', price: 2200, desc: 'Recommended for video streaming' },
    { id: 'plan4', label: '12 GB - 30 Days', price: 3500, desc: 'Ideal for remote work requirements' },
    { id: 'plan5', label: '25 GB - 30 Days', price: 6500, desc: 'Super saver heavy downloader bundle' },
    { id: 'plan6', label: '40 GB - 30 Days', price: 10000, desc: 'Unlimited data experience' },
  ];

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, ''); // Numeric only
    if (val.length <= 11) {
      setPhoneNumber(val);
      setErrorMessage('');
      
      // Auto-select operator by phone prefix
      if (val.length >= 4) {
        const prefix = val.substring(0, 4);
        const matchedOp = operators.find(op => op.prefix.includes(prefix));
        if (matchedOp) {
          setSelectedOperator(matchedOp.id);
        }
      }
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validations
    if (phoneNumber.length !== 11) {
      setErrorMessage('Phone number must be exactly 11 digits long.');
      return;
    }

    const txAmount = activeMode === 'airtime' ? parseFloat(amount) : selectedPlan.price;

    if (!txAmount || txAmount <= 0) {
      setErrorMessage('Please specify a valid payment amount.');
      return;
    }

    if (activeMode === 'airtime' && txAmount < 100) {
      setErrorMessage('Minimum airtime purchase is ₦100.');
      return;
    }

    if (txAmount > walletBalance) {
      setErrorMessage('Insufficient wallet balance. Please fund your wallet first.');
      return;
    }

    // Process payment simulation
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      
      const op = operators.find(o => o.id === selectedOperator);
      const title = activeMode === 'airtime' 
        ? `Airtime Top-up (${op.label} - ${phoneNumber})`
        : `Data Bundle (${selectedPlan.label} - ${op.label} - ${phoneNumber})`;
      
      const details = {
        title,
        amount: txAmount,
        type: activeMode,
        phone: phoneNumber,
        operator: op.label,
        planId: activeMode === 'data' ? selectedPlan.id : null,
        reference: `TX-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'success'
      };

      onProcessPayment(details);
      
      // Reset state
      setAmount('');
      setSelectedPlan('');
      setPhoneNumber('');
    }, 1800);
  };

  const currentOp = operators.find(o => o.id === selectedOperator) || operators[0];

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }} className="animate-slide-up">
      
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Recharge Airtime & Data</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
          Select network, select package and recharge instantly.
        </p>
      </div>

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Toggle Mode */}
        <div style={{ 
          display: 'flex', 
          background: 'rgba(0, 0, 0, 0.15)', 
          padding: '4px', 
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <button 
            type="button"
            onClick={() => { setActiveMode('airtime'); setErrorMessage(''); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              transition: 'all var(--transition-fast)',
              background: activeMode === 'airtime' ? 'var(--bg-card)' : 'transparent',
              color: activeMode === 'airtime' ? 'var(--primary-solid)' : 'var(--text-muted)',
              boxShadow: activeMode === 'airtime' ? '0 4px 6px rgba(0,0,0,0.15)' : 'none'
            }}
          >
            Airtime VTU
          </button>
          <button 
            type="button"
            onClick={() => { setActiveMode('data'); setErrorMessage(''); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              transition: 'all var(--transition-fast)',
              background: activeMode === 'data' ? 'var(--bg-card)' : 'transparent',
              color: activeMode === 'data' ? 'var(--primary-solid)' : 'var(--text-muted)',
              boxShadow: activeMode === 'data' ? '0 4px 6px rgba(0,0,0,0.15)' : 'none'
            }}
          >
            Data Bundles
          </button>
        </div>

        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Operator Badges */}
          <div className="form-group">
            <span className="form-label">
              <ShieldCheck size={16} style={{ color: 'var(--primary-solid)' }} />
              Network Provider
            </span>
            <div className="operator-grid">
              {operators.map((op) => (
                <button
                  type="button"
                  key={op.id}
                  onClick={() => setSelectedOperator(op.id)}
                  className={`operator-card ${selectedOperator === op.id ? 'active' : ''}`}
                  style={{
                    '--operator-color': op.color,
                    '--operator-glow': op.glow,
                    borderWidth: '2px'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: op.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#1f2937',
                    fontWeight: '800',
                    fontSize: '12px'
                  }}>
                    {op.label.substring(0, 2)}
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)' }}>{op.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Phone input */}
          <div className="form-group">
            <label className="form-label" htmlFor="phone-input">
              <Smartphone size={16} style={{ color: 'var(--primary-solid)' }} />
              Mobile Phone Number
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="phone-input"
                type="tel"
                placeholder="e.g., 08031234567"
                value={phoneNumber}
                onChange={handlePhoneChange}
                className="form-input"
                style={{ width: '100%', paddingLeft: '44px', fontFamily: 'monospace', letterSpacing: '0.1em' }}
                required
              />
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                📱
              </span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Selected network: <strong style={{ color: currentOp.color }}>{currentOp.label}</strong>
            </span>
          </div>

          {/* Airtime amount or Data packages picker */}
          {activeMode === 'airtime' ? (
            <div className="form-group">
              <label className="form-label" htmlFor="amount-input">
                ₦ Recharge Amount
              </label>
              <input
                id="amount-input"
                type="number"
                placeholder="Enter amount (₦100 - ₦50,000)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="100"
                max="50000"
                className="form-input"
                style={{ width: '100%' }}
                required={activeMode === 'airtime'}
              />
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label" htmlFor="plan-select">
                Select Data Package
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                {dataPlans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    style={{
                      border: '1px solid var(--border-color)',
                      background: selectedPlan.id === plan.id ? 'var(--primary-glow)' : 'rgba(255,255,255,0.01)',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderColor: selectedPlan.id === plan.id ? 'var(--primary-solid)' : 'var(--border-color)',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <div>
                      <span style={{ display: 'block', fontSize: '13px', fontWeight: '700' }}>{plan.label}</span>
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{plan.desc}</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary-solid)' }}>
                      <span style={{ fontFamily: 'var(--font-body)', marginRight: '2px' }}>₦</span>
                      <span style={{ fontFamily: 'monospace' }}>{plan.price.toLocaleString()}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Validation alert */}
          {errorMessage && (
            <div className="badge badge-error" style={{ padding: '12px', fontSize: '12px', width: '100%', textTransform: 'none', display: 'block', textAlign: 'center', borderRadius: '10px' }}>
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Pay Button */}
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={isProcessing}
            style={{ 
              width: '100%', 
              padding: '14px', 
              borderRadius: '12px', 
              marginTop: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Securing Connection & Processing...
              </>
            ) : (
              `Pay ₦${activeMode === 'airtime' ? (amount || '0') : (selectedPlan ? selectedPlan.price.toLocaleString() : '0')}`
            )}
          </button>

        </form>

      </div>
    </div>
  );
}
