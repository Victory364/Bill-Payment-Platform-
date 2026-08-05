import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AirtimeData from './components/AirtimeData';
import Electricity from './components/Electricity';
import CableTV from './components/CableTV';
import History from './components/History';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import Auth from './components/Auth';
import { X, Loader2, Wallet, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  getToken, clearToken,
  apiGetBalance, apiPaystackInitialize, apiPaystackVerify,
  apiGetTransactions, apiCreateTransaction,
  apiGetSettings, apiUpdateSettings,
  apiGetNotifications, apiPushNotification,
} from './api.js';

export default function App() {
  // ── Auth State ───────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('paysphere_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  // ── App Data State ────────────────────────────────────────────
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [userSettings, setUserSettings] = useState({
    profileName: '', profileEmail: '', profilePhone: '',
    transactionLimit: 20000, enableBiometrics: true, enableNotifications: true,
  });
  const [notifications, setNotifications] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  // ── Modal Control ─────────────────────────────────────────────
  const [activeReceiptTx, setActiveReceiptTx] = useState(null);
  const [showFundModal, setShowFundModal] = useState(false);
  const [pendingTxDetails, setPendingTxDetails] = useState(null);
  const [pinCode, setPinCode] = useState('');
  const [pinError, setPinError] = useState('');
  const [isPinVerifying, setIsPinVerifying] = useState(false);

  // ── Theme ─────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // ── Load user data from API when logged in ────────────────────
  const loadUserData = useCallback(async () => {
    if (!currentUser || !getToken()) return;
    setDataLoading(true);
    try {
      const [balanceData, txData, settingsData, notifData] = await Promise.all([
        apiGetBalance(),
        apiGetTransactions(),
        apiGetSettings(),
        apiGetNotifications(),
      ]);
      setWalletBalance(balanceData.balance);
      setTransactions(txData);
      setUserSettings(settingsData);
      setNotifications(notifData);
    } catch (err) {
      console.error('Failed to load user data:', err);
      // If token is invalid/expired, log out
      if (err.message?.includes('Invalid') || err.message?.includes('expired')) {
        handleLogout();
      }
    } finally {
      setDataLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('paysphere_current_user', JSON.stringify(currentUser));
      loadUserData();
    } else {
      localStorage.removeItem('paysphere_current_user');
    }
  }, [currentUser]);

  // ── Notifications helper ──────────────────────────────────────
  const pushNotification = async (title, body) => {
    if (!userSettings.enableNotifications) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    try {
      const newNotif = await apiPushNotification(title, body, time);
      setNotifications(prev => [newNotif, ...prev.slice(0, 4)]);
    } catch {
      // Notification failures are non-critical
    }
  };

  // ── Logout ────────────────────────────────────────────────────
  const handleLogout = () => {
    if (window.confirm('Do you want to log out of your session?')) {
      clearToken();
      setCurrentUser(null);
      setActiveTab('dashboard');
      setWalletBalance(0);
      setTransactions([]);
    }
  };

  // ── Reset sandbox data ────────────────────────────────────────
  const handleResetApp = async () => {
    if (window.confirm('Reset sandbox data? This will reload all data from the server.')) {
      await loadUserData();
      setActiveTab('dashboard');
      setActiveReceiptTx(null);
      setShowFundModal(false);
      setPendingTxDetails(null);
    }
  };

  // ── Process payment (with PIN guard) ─────────────────────────
  const handleProcessPayment = (details) => {
    if (details.amount > userSettings.transactionLimit) {
      setPendingTxDetails(details);
      setPinCode('');
      setPinError('');
      return;
    }
    executeFinalTransaction(details);
  };

  const executeFinalTransaction = async (details) => {
    try {
      const result = await apiCreateTransaction(details);
      setWalletBalance(result.balance);
      setTransactions(prev => [result.transaction, ...prev]);
      pushNotification('Bill Paid Successfully', `Paid ₦${details.amount.toLocaleString()} for ${details.title}`);
      setActiveReceiptTx(result.transaction);
    } catch (err) {
      alert(`Payment failed: ${err.message}`);
    }
  };

  // ── PIN verification ──────────────────────────────────────────
  const handleVerifyPinSubmit = (e) => {
    e.preventDefault();
    setPinError('');
    setIsPinVerifying(true);
    setTimeout(() => {
      setIsPinVerifying(false);
      if (pinCode.length === 4) {
        const tx = { ...pendingTxDetails };
        setPendingTxDetails(null);
        executeFinalTransaction(tx);
      } else {
        setPinError('Invalid 4-digit transaction PIN. Please try again.');
      }
    }, 1200);
  };

  // ── Wallet funding (Paystack verify callback) ─────────────────
  const handleFundingSuccess = async (reference) => {
    try {
      const result = await apiPaystackVerify(reference);
      setWalletBalance(result.balance);
      if (result.transaction) {
        setTransactions(prev => [result.transaction, ...prev]);
        pushNotification('Wallet Funded ✅', `₦${result.transaction.amount.toLocaleString()} added via Paystack`);
        setShowFundModal(false);
        setActiveReceiptTx(result.transaction);
      } else {
        // Already processed
        setWalletBalance(result.balance);
        setShowFundModal(false);
      }
    } catch (err) {
      alert(`Funding verification failed: ${err.message}`);
    }
  };

  // ── Settings update ───────────────────────────────────────────
  const handleUpdateSettings = async (newSettings) => {
    try {
      await apiUpdateSettings(newSettings);
      setUserSettings(prev => ({ ...prev, ...newSettings }));
    } catch (err) {
      console.error('Settings update failed:', err);
    }
  };

  // ── Render views ──────────────────────────────────────────────
  const renderActiveView = () => {
    if (dataLoading) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
          <Loader2 className="animate-spin" size={32} style={{ color: 'var(--primary-solid)' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading your data...</span>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            walletBalance={walletBalance}
            transactions={transactions}
            currentUser={currentUser}
            setActiveTab={setActiveTab}
            onOpenFundModal={() => setShowFundModal(true)}
            onViewReceipt={setActiveReceiptTx}
          />
        );
      case 'airtime-data':
        return <AirtimeData walletBalance={walletBalance} onProcessPayment={handleProcessPayment} />;
      case 'electricity':
        return <Electricity walletBalance={walletBalance} onProcessPayment={handleProcessPayment} />;
      case 'cable-tv':
        return <CableTV walletBalance={walletBalance} onProcessPayment={handleProcessPayment} />;
      case 'history':
        return <History transactions={transactions} onViewReceipt={setActiveReceiptTx} />;
      case 'analytics':
        return <Analytics transactions={transactions} />;
      case 'settings':
        return (
          <Settings
            userSettings={userSettings}
            updateSettings={handleUpdateSettings}
            onResetApp={handleResetApp}
            theme={theme}
            toggleTheme={toggleTheme}
          />
        );
      default:
        return <div>View not found</div>;
    }
  };

  // ── Receipt Utilities ─────────────────────────────────────────
  const handleDownloadReceipt = (tx) => {
    if (!tx) return;
    let text = `=========================================\n`;
    text += `            PAYSPHERE BILLS\n`;
    text += `        UTILITY RECHARGE RECEIPT\n`;
    text += `=========================================\n`;
    text += `Reference:   ${tx.reference}\n`;
    text += `Date:        ${tx.date}\n`;
    text += `Description: ${tx.title}\n`;
    if (tx.phone) text += `Phone:       ${tx.phone}\n`;
    if (tx.meterNumber) text += `Meter No:    ${tx.meterNumber}\n`;
    if (tx.smartcardNo) text += `Smartcard:   ${tx.smartcardNo}\n`;
    if (tx.customerName) text += `Customer:    ${tx.customerName}\n`;
    if (tx.address) text += `Address:     ${tx.address}\n`;
    if (tx.token) {
      text += `-----------------------------------------\n`;
      text += `RECHARGE TOKEN: ${tx.token}\n`;
    }
    text += `-----------------------------------------\n`;
    text += `TOTAL AMOUNT: ₦${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}\n`;
    text += `=========================================\n`;
    text += `     Thank you for using PaySphere!\n`;
    text += `=========================================\n`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `paysphere-receipt-${tx.reference}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReceipt = (tx) => {
    if (!tx) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${tx.reference}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1f2937; line-height: 1.5; }
            .receipt-paper { max-width: 380px; margin: 0 auto; border: 1px solid #e5e7eb; padding: 24px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
            .receipt-header { text-align: center; border-bottom: 1px dashed #d1d5db; padding-bottom: 16px; margin-bottom: 20px; }
            .receipt-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px; }
            .receipt-row span { color: #6b7280; }
            .receipt-row strong { color: #111827; }
            .receipt-total { border-top: 1px dashed #d1d5db; border-bottom: 1px dashed #d1d5db; padding: 14px 0; margin-top: 20px; display: flex; justify-content: space-between; font-weight: bold; font-size: 15px; }
            .receipt-token { margin-top: 16px; padding: 12px; border: 1px dashed #8b5cf6; text-align: center; background: #faf5ff; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="receipt-paper">
            <div class="receipt-header">
              <h3 style="margin: 0; font-size: 18px; font-weight: 800; letter-spacing: 0.05em; color: #7c3aed;">PAYSPHERE</h3>
              <p style="margin: 4px 0 0 0; font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em;">Utility Recharge Receipt</p>
            </div>
            <div class="receipt-row"><span>Reference</span><strong>${tx.reference}</strong></div>
            <div class="receipt-row"><span>Date</span><strong>${tx.date}</strong></div>
            <div class="receipt-row"><span>Description</span><strong>${tx.title}</strong></div>
            ${tx.phone ? `<div class="receipt-row"><span>Phone</span><strong>${tx.phone}</strong></div>` : ''}
            ${tx.meterNumber ? `<div class="receipt-row"><span>Meter No</span><strong>${tx.meterNumber}</strong></div>` : ''}
            ${tx.smartcardNo ? `<div class="receipt-row"><span>Decoder Smartcard</span><strong>${tx.smartcardNo}</strong></div>` : ''}
            ${tx.customerName ? `<div class="receipt-row"><span>Customer Name</span><strong>${tx.customerName}</strong></div>` : ''}
            ${tx.address ? `<div class="receipt-row"><span>Address</span><strong style="text-align: right; max-width: 60%; font-size: 11px;">${tx.address}</strong></div>` : ''}
            
            ${tx.token ? `
              <div class="receipt-token">
                <span style="font-size: 9px; font-weight: 700; color: #7c3aed; text-transform: uppercase; display: block;">Meter Recharge Token</span>
                <strong style="font-size: 16px; display: block; margin-top: 6px; letter-spacing: 0.05em; font-family: monospace;">${tx.token}</strong>
              </div>
            ` : ''}

            <div class="receipt-total">
              <span>TOTAL AMOUNT</span>
              <strong style="color: #7c3aed;">₦${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
            </div>
            <div style="text-align: center; margin-top: 24px; font-size: 11px; color: #9ca3af;">
              Thank you for using PaySphere!
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // ── Auth gate ─────────────────────────────────────────────────
  if (!currentUser) {
    return <Auth onLoginSuccess={(user, token) => {
      localStorage.setItem('paysphere_token', token);
      setCurrentUser(user);
    }} />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app)', color: 'var(--text-main)' }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header
          walletBalance={walletBalance}
          onOpenFundModal={() => setShowFundModal(true)}
          theme={theme}
          toggleTheme={toggleTheme}
          notifications={notifications}
          currentUser={currentUser}
        />
        <main style={{ padding: '32px', marginLeft: '280px', flex: 1, overflowY: 'auto' }}>
          {renderActiveView()}
        </main>
      </div>

      {/* MODAL 1: Digital Receipt */}
      {activeReceiptTx && (
        <div style={modalOverlayStyle}>
          <div className="glass-panel animate-scale-in" style={{ ...modalContentStyle, width: '400px', padding: '0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '14px', fontWeight: '700' }}>Billing Receipt</span>
              <button onClick={() => setActiveReceiptTx(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div className="receipt-paper">
                <div className="receipt-header">
                  <h3 style={{ fontSize: '15px', color: '#1f2937', fontWeight: '800' }}>PAYSPHERE BILLS</h3>
                  <p style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px' }}>UTILITY RECHARGE RECEIPT</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="receipt-row"><span>Reference:</span><strong>{activeReceiptTx.reference}</strong></div>
                  <div className="receipt-row"><span>Date:</span><span>{activeReceiptTx.date}</span></div>
                  <div className="receipt-row"><span>Description:</span><span>{activeReceiptTx.title}</span></div>
                  {activeReceiptTx.phone && <div className="receipt-row"><span>Phone:</span><span>{activeReceiptTx.phone}</span></div>}
                  {activeReceiptTx.meterNumber && <div className="receipt-row"><span>Meter No:</span><span>{activeReceiptTx.meterNumber}</span></div>}
                  {activeReceiptTx.smartcardNo && <div className="receipt-row"><span>Decoder Smartcard:</span><span>{activeReceiptTx.smartcardNo}</span></div>}
                  {activeReceiptTx.customerName && <div className="receipt-row"><span>Customer:</span><span>{activeReceiptTx.customerName}</span></div>}
                  {activeReceiptTx.address && <div className="receipt-row"><span>Address:</span><span style={{ fontSize: '11px', textAlign: 'right', maxWidth: '60%' }}>{activeReceiptTx.address}</span></div>}

                  {activeReceiptTx.token && (
                    <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(139, 92, 246, 0.05)', border: '1px dashed var(--primary-solid)', borderRadius: '8px', color: '#1f2937', textAlign: 'center' }}>
                      <span style={{ display: 'block', fontSize: '9px', fontWeight: '700', color: 'var(--primary-solid)', textTransform: 'uppercase' }}>Meter Recharge Token</span>
                      <strong style={{ fontSize: '15px', display: 'block', letterSpacing: '0.05em', marginTop: '4px', fontFamily: 'monospace' }}>
                        {activeReceiptTx.token}
                      </strong>
                    </div>
                  )}

                  <div className="receipt-total">
                    <span>TOTAL AMOUNT:</span>
                    <span>₦{activeReceiptTx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '9px', color: '#9ca3af', borderTop: '1px dashed #d1d5db', paddingTop: '12px' }}>
                  Thank you for using PaySphere!
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '24px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => handlePrintReceipt(activeReceiptTx)} className="btn-primary" style={{ flex: 1, padding: '12px', borderRadius: '10px', fontSize: '13px' }}>
                    Print / Save PDF
                  </button>
                  <button onClick={() => handleDownloadReceipt(activeReceiptTx)} className="btn-primary" style={{ flex: 1, padding: '12px', borderRadius: '10px', fontSize: '13px', background: 'var(--primary-glow)', color: 'var(--primary-solid)', border: '1px solid var(--primary-solid)' }}>
                    Download Receipt
                  </button>
                </div>
                <button onClick={() => setActiveReceiptTx(null)} className="btn-secondary" style={{ width: '100%', padding: '12px', borderRadius: '10px', fontSize: '13px' }}>
                  Close Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Fund Wallet */}
      {showFundModal && (
        <div style={modalOverlayStyle}>
          <FundModalContent
            onClose={() => setShowFundModal(false)}
            onSuccess={handleFundingSuccess}
            userEmail={currentUser?.email || ''}
          />
        </div>
      )}

      {/* MODAL 3: PIN Verification */}
      {pendingTxDetails && (
        <div style={modalOverlayStyle}>
          <div className="glass-panel animate-scale-in" style={{ ...modalContentStyle, width: '400px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center', padding: '10px' }}>
              <div style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                <KeyRound size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Enter Security PIN</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '6px', lineHeight: '140%' }}>
                  This payment of <strong style={{ color: 'var(--text-main)' }}>₦{pendingTxDetails.amount.toLocaleString()}</strong> exceeds your transaction limit. Enter your 4-digit PIN to authorize.
                </p>
              </div>

              <form onSubmit={handleVerifyPinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  value={pinCode}
                  onChange={(e) => { setPinCode(e.target.value.replace(/\D/g, '')); setPinError(''); }}
                  className="form-input"
                  style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '0.4em', width: '150px', margin: '0 auto', fontFamily: 'monospace' }}
                  required
                  autoFocus
                />
                {pinError && <span style={{ fontSize: '11px', color: 'var(--error)' }}>{pinError}</span>}
                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button type="button" className="btn-secondary" onClick={() => setPendingTxDetails(null)} style={{ flex: 1, padding: '12px', borderRadius: '10px' }}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={isPinVerifying || pinCode.length !== 4} style={{ flex: 1, padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    {isPinVerifying ? <Loader2 className="animate-spin" size={16} /> : 'Authorize'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Paystack Fund Modal ───────────────────────────────────────
function FundModalContent({ onClose, onSuccess, userEmail }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stage, setStage] = useState('enter'); // 'enter' | 'processing' | 'verifying'

  const QUICK_AMOUNTS = [1000, 2000, 5000, 10000, 20000, 50000];

  const handlePay = async (e) => {
    e?.preventDefault();
    setError('');
    const amt = parseFloat(amount);
    if (!amt || amt < 100) {
      setError('Minimum funding amount is ₦100.');
      return;
    }

    setLoading(true);
    setStage('processing');
    try {
      const { reference, access_code } = await apiPaystackInitialize(amt, userEmail);

      // Open Paystack popup
      const PaystackPop = window.PaystackPop;
      if (!PaystackPop) {
        throw new Error('Paystack SDK not loaded. Check your internet connection.');
      }

      const handler = PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email: userEmail,
        amount: Math.round(amt * 100), // kobo
        ref: reference,
        currency: 'NGN',
        label: 'PaySphere Wallet Funding',
        callback: (response) => {
          // Must be a regular function (Paystack v1 rejects async callbacks)
          setStage('verifying');
          onSuccess(response.reference).catch(err => {
            setError(err.message);
            setLoading(false);
            setStage('enter');
          });
        },
        onClose: () => {
          setLoading(false);
          setStage('enter');
        },
      });
      handler.openIframe();
    } catch (err) {
      setError(err.message);
      setLoading(false);
      setStage('enter');
    }
  };

  return (
    <div className="glass-panel animate-scale-in" style={{ ...modalContentStyle, width: '440px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'var(--primary-glow)', borderRadius: '10px', padding: '8px', display: 'flex' }}>
            <Wallet size={18} style={{ color: 'var(--primary-solid)' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: '800', margin: 0 }}>Fund Wallet</h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>Secured by Paystack</p>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
          <X size={18} />
        </button>
      </div>

      {stage === 'verifying' ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <Loader2 className="animate-spin" size={40} style={{ color: 'var(--primary-solid)', margin: '0 auto 16px' }} />
          <p style={{ fontWeight: '700', fontSize: '15px' }}>Confirming your payment…</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '6px' }}>Please wait while we credit your wallet.</p>
        </div>
      ) : (
        <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Quick amount buttons */}
          <div>
            <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Select</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {QUICK_AMOUNTS.map(qa => (
                <button
                  key={qa}
                  type="button"
                  onClick={() => setAmount(String(qa))}
                  style={{
                    padding: '10px 6px',
                    borderRadius: '10px',
                    border: `1px solid ${amount === String(qa) ? 'var(--primary-solid)' : 'var(--border-color)'}`,
                    background: amount === String(qa) ? 'var(--primary-glow)' : 'rgba(255,255,255,0.02)',
                    color: amount === String(qa) ? 'var(--primary-solid)' : 'var(--text-main)',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  ₦{qa.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Custom amount input */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="paystack-amount">Or Enter Amount (₦)</label>
            <input
              id="paystack-amount"
              type="number"
              placeholder="e.g. 15000"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="form-input"
              min="100"
              style={{ fontSize: '18px', fontWeight: '700', textAlign: 'center', letterSpacing: '0.03em' }}
              required
            />
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px' }}>
              <AlertCircle size={14} style={{ color: '#ef4444', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: '#ef4444' }}>{error}</span>
            </div>
          )}

          {/* Paystack brand badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', background: 'rgba(0,200,83,0.05)', border: '1px solid rgba(0,200,83,0.15)', borderRadius: '8px' }}>
            <CheckCircle2 size={12} style={{ color: '#00c853' }} />
            <span style={{ fontSize: '11px', color: '#00c853', fontWeight: '600' }}>SSL Secured · Powered by Paystack</span>
          </div>

          <button
            type="submit"
            id="paystack-pay-btn"
            className="btn-primary"
            disabled={loading || !amount}
            style={{ width: '100%', padding: '15px', borderRadius: '12px', fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {loading
              ? <><Loader2 className="animate-spin" size={18} /> Opening Paystack…</>
              : `Pay ₦${parseFloat(amount || 0).toLocaleString()}`
            }
          </button>
        </form>
      )}
    </div>
  );
}

const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
  background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)',
  zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const modalContentStyle = {
  borderRadius: '20px', border: '1px solid var(--glass-border)',
  padding: '24px', boxShadow: 'var(--shadow-main)',
  maxHeight: '90vh', overflowY: 'auto', background: 'var(--glass-bg)',
};
