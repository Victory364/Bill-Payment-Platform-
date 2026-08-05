import React, { useState, useEffect } from 'react';
import { Tv, Loader2, CheckCircle2, User, Calendar } from 'lucide-react';
import { apiGetServiceVariations, apiVerifySmartcard } from '../api.js';

export default function CableTV({ walletBalance, onProcessPayment }) {
  const [operator, setOperator] = useState('dstv');
  const [smartcardNo, setSmartcardNo] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedDetails, setVerifiedDetails] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);

  useEffect(() => {
    let active = true;
    async function fetchPlans() {
      setPlansLoading(true);
      setErrorMessage('');
      try {
        const response = await apiGetServiceVariations(operator);
        if (!active) return;
        const variations = response.content?.variations || response.content?.varations || [];
        const mappedPlans = variations.map(v => ({
          id: v.variation_code,
          label: v.name,
          price: parseFloat(v.variation_amount) || 0,
          desc: `${v.name} Bouquet`
        }));
        setPlans(mappedPlans);
      } catch (err) {
        if (!active) return;
        console.error('Failed to load packages:', err);
        setErrorMessage(`Failed to load ${operator.toUpperCase()} packages from live VTpass API. Please check your network connection.`);
        setPlans([]);
      } finally {
        if (active) setPlansLoading(false);
      }
    }
    fetchPlans();
    return () => {
      active = false;
    };
  }, [operator]);

  const handleCardChange = (e) => {
    const val = e.target.value.replace(/\D/g, ''); // Digits only
    if (val.length <= 11) {
      setSmartcardNo(val);
      setIsVerified(false);
      setVerifiedDetails(null);
      setSelectedPlan('');
      setErrorMessage('');
    }
  };

  const handleVerifyCard = async (e) => {
    e.preventDefault();
    if (smartcardNo.length < 8) {
      setErrorMessage('Smartcard/IUC number must be between 8 to 11 digits.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage('');

    try {
      const result = await apiVerifySmartcard(operator, smartcardNo);
      setIsVerifying(false);
      setIsVerified(true);
      setVerifiedDetails({
        customerName: result.customerName,
        cardNumber: smartcardNo,
        provider: operator.toUpperCase(),
        currentPlan: operator === 'dstv' ? 'DSTV Compact' : operator === 'gotv' ? 'GOTV Max' : 'StarTimes Smart',
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    } catch (err) {
      setIsVerifying(false);
      setErrorMessage(err.message || 'Failed to verify decoder smartcard. Please check the number and operator.');
    }
  };

  const handlePayTv = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedPlan) {
      setErrorMessage('Please select a TV subscription package.');
      return;
    }

    if (selectedPlan.price > walletBalance) {
      setErrorMessage('Insufficient wallet balance. Please fund your wallet.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);

      const details = {
        title: `TV Subscription (${verifiedDetails.provider} - ${selectedPlan.label})`,
        amount: selectedPlan.price,
        type: 'cable-tv',
        smartcardNo: smartcardNo,
        customerName: verifiedDetails.customerName,
        packageName: selectedPlan.label,
        variationCode: selectedPlan.id,
        operator: operator,
        reference: `TX-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'success'
      };

      onProcessPayment(details);

      // Reset
      setSmartcardNo('');
      setIsVerified(false);
      setVerifiedDetails(null);
      setSelectedPlan('');
    }, 1800);
  };

  const operatorPlans = plans;

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }} className="animate-slide-up">
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Cable TV Subscriptions</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
          Instantly renew DSTV, GOTV, or StarTimes packages for your decoder.
        </p>
      </div>

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Toggle Cable Operators */}
        <div style={{ 
          display: 'flex', 
          background: 'rgba(0, 0, 0, 0.15)', 
          padding: '4px', 
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          {['dstv', 'gotv', 'startimes'].map((op) => (
            <button
              key={op}
              type="button"
              onClick={() => { setOperator(op); setIsVerified(false); setVerifiedDetails(null); }}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '13px',
                textTransform: 'uppercase',
                transition: 'all var(--transition-fast)',
                background: operator === op ? 'var(--bg-card)' : 'transparent',
                color: operator === op ? 'var(--primary-solid)' : 'var(--text-muted)'
              }}
            >
              {op}
            </button>
          ))}
        </div>

        {/* Decoder Details Entry */}
        {!isVerified ? (
          <form onSubmit={handleVerifyCard} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div className="form-group">
              <label className="form-label" htmlFor="smartcard-input">
                <Tv size={16} style={{ color: 'var(--primary-solid)' }} />
                Smartcard / IUC / UID Number
              </label>
              <input
                id="smartcard-input"
                type="text"
                placeholder={`Enter ${operator.toUpperCase()} decoder number`}
                value={smartcardNo}
                onChange={handleCardChange}
                className="form-input"
                style={{ width: '100%', fontFamily: 'monospace', letterSpacing: '0.1em' }}
                required
              />
            </div>

            {errorMessage && (
              <div className="badge badge-error" style={{ padding: '10px', fontSize: '11px', textTransform: 'none' }}>
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={isVerifying}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Verifying Decoder Account...
                </>
              ) : (
                'Verify Decoder Smartcard'
              )}
            </button>

          </form>
        ) : (
          
          /* Package Billing Flow */
          <form onSubmit={handlePayTv} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Account Details */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)' }}>
                <CheckCircle2 size={18} />
                <span style={{ fontSize: '13px', fontWeight: '700' }}>Decoder Account Verified</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '6px', fontSize: '13px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px', marginTop: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={14} style={{ color: 'var(--text-muted)' }} />
                  <span><strong>Customer Name:</strong> {verifiedDetails.customerName}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Tv size={14} style={{ color: 'var(--text-muted)' }} />
                  <span><strong>Decoder Info:</strong> {verifiedDetails.provider} ({verifiedDetails.cardNumber})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                  <span><strong>Current Plan Status:</strong> {verifiedDetails.currentPlan} (Expires {verifiedDetails.expiryDate})</span>
                </div>
              </div>
            </div>

            {/* Select package package */}
            <div className="form-group">
              <label className="form-label" htmlFor="tv-package-select">Select Subscription Package</label>
              {plansLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', gap: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <Loader2 className="animate-spin" size={20} style={{ color: 'var(--primary-solid)' }} />
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading live packages from VTpass...</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
                  {operatorPlans.map((plan) => (
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
                      <div style={{ paddingRight: '12px', textAlign: 'left' }}>
                        <span style={{ display: 'block', fontSize: '13px', fontWeight: '700' }}>{plan.label}</span>
                        <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{plan.desc}</span>
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary-solid)', whiteSpace: 'nowrap' }}>
                        <span style={{ fontFamily: 'var(--font-body)', marginRight: '2px' }}>₦</span>
                        <span style={{ fontFamily: 'monospace' }}>{plan.price.toLocaleString()}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="badge badge-error" style={{ padding: '10px', fontSize: '11px', textTransform: 'none' }}>
                {errorMessage}
              </div>
            )}

            {/* Back & Pay Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => { setIsVerified(false); setVerifiedDetails(null); }}
                style={{ flex: 1, padding: '14px', borderRadius: '12px' }}
              >
                Change Decoder
              </button>

              <button
                type="submit"
                className="btn-primary"
                disabled={isProcessing}
                style={{ flex: 2, padding: '14px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Processing TV Bill...
                  </>
                ) : (
                  `Renew for ₦${selectedPlan ? selectedPlan.price.toLocaleString() : '0'}`
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
