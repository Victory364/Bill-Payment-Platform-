import React, { useState } from 'react';
import { Zap, Loader2, CheckCircle2, User, MapPin } from 'lucide-react';
import { apiVerifyMeter } from '../api.js';
export default function Electricity({ walletBalance, onProcessPayment }) {
  const [selectedDisCo, setSelectedDisCo] = useState('ikedc');
  const [meterType, setMeterType] = useState('prepaid');
  const [meterNumber, setMeterNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedDetails, setVerifiedDetails] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const discos = [
    { id: 'ikedc', label: 'Ikeja Electric (IKEDC)', location: 'Lagos' },
    { id: 'ekedc', label: 'Eko Electric (EKEDC)', location: 'Lagos' },
    { id: 'aedc', label: 'Abuja Electric (AEDC)', location: 'Abuja' },
    { id: 'phed', label: 'Port Harcourt (PHED)', location: 'Rivers' },
    { id: 'ibedc', label: 'Ibadan Electric (IBEDC)', location: 'Oyo' },
    { id: 'kedco', label: 'Kano Electric (KEDCO)', location: 'Kano' }
  ];

  const handleMeterNumberChange = (e) => {
    const val = e.target.value.replace(/\D/g, ''); // Digits only
    if (val.length <= 13) {
      setMeterNumber(val);
      setIsVerified(false);
      setVerifiedDetails(null);
      setErrorMessage('');
    }
  };

  const handleVerifyMeter = async (e) => {
    e.preventDefault();
    if (meterNumber.length < 10) {
      setErrorMessage('Meter number must be between 10 to 13 digits.');
      return;
    }
    
    setIsVerifying(true);
    setErrorMessage('');

    try {
      const result = await apiVerifyMeter(selectedDisCo, meterNumber, meterType);
      setIsVerifying(false);
      setIsVerified(true);
      
      setVerifiedDetails({
        customerName: result.customerName,
        address: result.address,
        meterNo: meterNumber,
        discoName: discos.find(d => d.id === selectedDisCo).label,
        outstandingBill: meterType === 'postpaid' ? Math.floor(4500 + Math.random() * 8500) : 0
      });

      // If postpaid, autofill amount with outstanding bill
      if (meterType === 'postpaid') {
        setAmount((4500 + Math.floor(Math.random() * 8500)).toString());
      }
    } catch (err) {
      setIsVerifying(false);
      setErrorMessage(err.message || 'Failed to verify meter. Please check the meter number and DisCo operator.');
    }
  };

  const handlePayBill = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const txAmount = parseFloat(amount);
    if (!txAmount || txAmount <= 0) {
      setErrorMessage('Please specify a valid payment amount.');
      return;
    }

    if (txAmount < 500) {
      setErrorMessage('Minimum electricity payment is ₦500.');
      return;
    }

    if (txAmount > walletBalance) {
      setErrorMessage('Insufficient wallet balance. Please fund your wallet.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);

      // Generate a mock 20-digit token for prepaid users
      const token = meterType === 'prepaid'
        ? Array.from({ length: 4 }, () => Math.floor(1000 + Math.random() * 9000)).join('-')
        : null;

      const details = {
        title: `Electricity Payment (${verifiedDetails.discoName})`,
        amount: txAmount,
        type: 'electricity',
        meterNumber: meterNumber,
        customerName: verifiedDetails.customerName,
        address: verifiedDetails.address,
        meterType: meterType,
        token: token,
        reference: `TX-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'success'
      };

      onProcessPayment(details);

      // Reset
      setMeterNumber('');
      setAmount('');
      setIsVerified(false);
      setVerifiedDetails(null);
    }, 1800);
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }} className="animate-slide-up">
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Electricity Bill Payment</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
          Select distribution company (DisCo), verify meter, and buy utility tokens.
        </p>
      </div>

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Toggle Meter Type */}
        <div style={{ 
          display: 'flex', 
          background: 'rgba(0, 0, 0, 0.15)', 
          padding: '4px', 
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <button 
            type="button"
            onClick={() => { setMeterType('prepaid'); setIsVerified(false); setVerifiedDetails(null); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              transition: 'all var(--transition-fast)',
              background: meterType === 'prepaid' ? 'var(--bg-card)' : 'transparent',
              color: meterType === 'prepaid' ? 'var(--primary-solid)' : 'var(--text-muted)'
            }}
          >
            Prepaid (Token Code)
          </button>
          <button 
            type="button"
            onClick={() => { setMeterType('postpaid'); setIsVerified(false); setVerifiedDetails(null); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              transition: 'all var(--transition-fast)',
              background: meterType === 'postpaid' ? 'var(--bg-card)' : 'transparent',
              color: meterType === 'postpaid' ? 'var(--primary-solid)' : 'var(--text-muted)'
            }}
          >
            Postpaid (Monthly Invoices)
          </button>
        </div>

        {/* Input & Verification Panel */}
        {!isVerified ? (
          <form onSubmit={handleVerifyMeter} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* DisCo Selector */}
            <div className="form-group">
              <label className="form-label" htmlFor="disco-select">Select DisCo Operator</label>
              <select 
                id="disco-select"
                className="form-select" 
                value={selectedDisCo} 
                onChange={(e) => setSelectedDisCo(e.target.value)}
                style={{ width: '100%' }}
              >
                {discos.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label} - {d.location}
                  </option>
                ))}
              </select>
            </div>

            {/* Meter Number */}
            <div className="form-group">
              <label className="form-label" htmlFor="meter-input">
                <Zap size={16} style={{ color: 'var(--primary-solid)' }} />
                Meter Account Number
              </label>
              <input
                id="meter-input"
                type="text"
                placeholder="Enter 10-13 digit meter number"
                value={meterNumber}
                onChange={handleMeterNumberChange}
                className="form-input"
                style={{ width: '100%', fontFamily: 'monospace', letterSpacing: '0.05em' }}
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
                  Verifying Meter Account details...
                </>
              ) : (
                'Verify Meter Account'
              )}
            </button>

          </form>
        ) : (
          
          /* Verified Billing Form */
          <form onSubmit={handlePayBill} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Verified details panel */}
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
                <span style={{ fontSize: '13px', fontWeight: '700' }}>Account Verified</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '6px', fontSize: '13px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px', marginTop: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={14} style={{ color: 'var(--text-muted)' }} />
                  <span><strong>Owner:</strong> {verifiedDetails.customerName}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
                  <span><strong>Address:</strong> {verifiedDetails.address}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}><strong>DisCo:</strong></span> {verifiedDetails.discoName}
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}><strong>Meter No:</strong></span> <span style={{ fontFamily: 'monospace' }}>{verifiedDetails.meterNo}</span>
                </div>
                {meterType === 'postpaid' && (
                  <div style={{ color: 'var(--warning)', fontWeight: '600' }}>
                    Outstanding Invoice Bill: ₦{verifiedDetails.outstandingBill.toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            {/* Billing input */}
            <div className="form-group">
              <label className="form-label" htmlFor="amount-input">
                ₦ Payment Amount
              </label>
              <input
                id="amount-input"
                type="number"
                placeholder="Enter amount to pay (min ₦500)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="500"
                className="form-input"
                style={{ width: '100%' }}
                required
              />
            </div>

            {errorMessage && (
              <div className="badge badge-error" style={{ padding: '10px', fontSize: '11px', textTransform: 'none' }}>
                {errorMessage}
              </div>
            )}

            {/* Back & Pay buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                type="button"
                className="btn-secondary"
                onClick={() => { setIsVerified(false); setVerifiedDetails(null); }}
                style={{ flex: 1, padding: '14px', borderRadius: '12px' }}
              >
                Change Meter
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
                    Processing Payment...
                  </>
                ) : (
                  `Pay ₦${parseFloat(amount || 0).toLocaleString()}`
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
