import React, { useState } from 'react';
import { 
  Sparkles, ArrowRight, Shield, Zap, Smartphone, Tv, CreditCard, 
  ChevronDown, Check, Users, ShieldAlert, Award, Star, BookOpen, 
  MessageSquare, Sun, Moon, CheckCircle2, ShieldCheck, Wallet, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';

export default function LandingPage({ onGetStarted, onSignIn, theme, toggleTheme }) {
  const [activeFaq, setActiveFaq] = useState(null);

  const stats = [
    { value: '100K+', label: 'Active Users' },
    { value: '₦2.5B+', label: 'Volume Processed' },
    { value: '99.9%', label: 'Gateway Uptime' },
    { value: '4.8/5', label: 'App Rating' }
  ];

  const features = [
    {
      icon: Smartphone,
      title: 'Airtime & Data Refills',
      desc: 'Top up your mobile devices instantly across MTN, Airtel, Glo, and 9mobile networks. Select custom bundles directly.'
    },
    {
      icon: Zap,
      title: 'Prepaid & Postpaid Electricity',
      desc: 'Buy prepaid electricity tokens or pay postpaid utility bills for EKEDC, IKEDC, AEDC, IBEDC, PHED, and more in seconds.'
    },
    {
      icon: Tv,
      title: 'Cable TV Subscriptions',
      desc: 'Renew DSTV, GOTV, and StarTimes packages. Real-time smartcard verification ensures you credit the correct user name.'
    },
    {
      icon: CreditCard,
      title: 'Instant Wallet Funding',
      desc: 'Fund your wallet using cards or bank transfer securely via the Paystack gateway. Enjoy immediate credit.'
    },
    {
      icon: Shield,
      title: 'Advanced Limit Protections',
      desc: 'Set custom daily limits on your account. Withdrawals or utility recharges exceeding limits trigger secure transaction PIN gates.'
    },
    {
      icon: Sparkles,
      title: 'Sleek Dashboard Analytics',
      desc: 'Monitor your monthly spendings, utility distribution, and balance growth with intuitive visual charts.'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Create Account',
      desc: 'Sign up in less than a minute. Secure your profile using a password and transaction authorization PIN.'
    },
    {
      number: '02',
      title: 'Fund Wallet',
      desc: 'Fund your wallet with Paystack. Select from quick-deposit amounts or specify a custom volume.'
    },
    {
      number: '03',
      title: 'Pay Bills Instantly',
      desc: 'Select a utility, verify the account name/number instantly, and complete your payment with a single click.'
    }
  ];

  const tiers = [
    {
      name: 'Level 1 Verification',
      limit: '₦10,000 / day',
      desc: 'Basic limits for new signups. No security PIN checks required below the threshold.',
      features: ['Basic Airtime & Data refills', 'Demo Mode transactions', 'Basic account profile setup'],
      popular: false
    },
    {
      name: 'Level 2 Verification',
      limit: '₦50,000 / day',
      desc: 'Increased transaction capabilities for regular utility payers. Highly secure.',
      features: ['Full access to all utility categories', 'Auto-verify Smartcards & Meters', 'Secure PIN gates for transfers', 'Email alerts & Push notifications'],
      popular: true
    },
    {
      name: 'Level 3 Verification',
      limit: 'Unlimited',
      desc: 'Maximum capabilities for corporate utilities. Authorized limit adjustments.',
      features: ['Unlimited daily limit option', 'Prepaid token exports (PDF/CSV)', 'Custom dashboard analytics', 'Priority merchant support desk'],
      popular: false
    }
  ];

  const faqs = [
    {
      q: 'How fast are utility recharges processed?',
      a: 'Recharges are near-instantaneous. As soon as your transaction is confirmed on the server, the airtime is credited or your prepaid electricity token is generated immediately in real time.'
    },
    {
      q: 'Is my wallet balance funding secure?',
      a: 'Absolutely. Wallet deposits are handled by the PCI-DSS compliant Paystack gateway. We never store your card details or bank account passwords on our servers.'
    },
    {
      q: 'How does the transaction PIN protection work?',
      a: 'For added security, any bill payment or funding transaction that exceeds your configured daily limit in Settings will prompt you to enter your secret 4-digit PIN. This prevents unauthorized usage of your wallet funds.'
    },
    {
      q: 'What is Demo Mode vs Live Mode?',
      a: 'PaySphere detects whether live API integration keys are available. If no keys are provided in the environment, the system runs in Demo Mode, which simulates full gateway completions (e.g. meter lookups and token generation) without charging real currency.'
    },
    {
      q: 'Can I download transaction receipts?',
      a: 'Yes, every successful utility payment logs a digital receipt. You can download it directly as a formatted text file or trigger your browser\'s save-to-PDF print layout to save a hardcopy invoice.'
    }
  ];

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="landing-wrapper">
      {/* Navigation Header */}
      <header className="landing-header glass-panel">
        <div className="landing-nav-container">
          <div className="landing-logo">
            <div className="logo-icon">P</div>
            <div>
              <h2 className="logo-text">PaySphere</h2>
              <span className="logo-subtitle">Utility Hub</span>
            </div>
          </div>

          <nav className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#tiers">Tiers</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#faq">FAQ</a>
          </nav>

          <div className="landing-nav-actions">
            <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle Theme">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={onSignIn} className="landing-btn-login">Sign In</button>
            <button onClick={onGetStarted} className="btn-primary landing-btn-cta">Get Started</button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-tag">
              <Sparkles size={14} className="glowing-icon" /> <span>Next-Gen Bill Payments</span>
            </div>
            <h1 className="hero-title">
              Simplify Your Utilities, <br />
              <span className="text-gradient">Secure Your Wallet</span>
            </h1>
            <p className="hero-description">
              PaySphere is the ultimate utility platform. Fund your wallet, verify meters and smartcards instantly, and recharge airtime, data, cable TV, and electricity with bulletproof safety.
            </p>
            <div className="hero-ctas">
              <button onClick={onGetStarted} className="btn-primary hero-btn-primary">
                Get Started Now <ArrowRight size={16} />
              </button>
              <button onClick={onSignIn} className="hero-btn-secondary">
                Secure Login
              </button>
            </div>

            {/* Stats Counter */}
            <div className="hero-stats">
              {stats.map((stat, idx) => (
                <div key={idx} className="stat-box">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Visual Mockup */}
          <div className="hero-visual">
            <div className="mockup-container glass-panel">
              {/* Mockup Header */}
              <div className="mock-header">
                <div className="mock-dots">
                  <span style={{ background: '#ef4444' }}></span>
                  <span style={{ background: '#f59e0b' }}></span>
                  <span style={{ background: '#10b981' }}></span>
                </div>
                <div className="mock-address">paysphere.app/dashboard</div>
              </div>

              {/* Mockup Layout */}
              <div className="mock-body">
                {/* Mock Card */}
                <div className="mock-card">
                  <div className="mock-card-top">
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="mock-label">WALLET BALANCE</span>
                      <span className="mock-val">₦124,500.00</span>
                    </div>
                    <div className="mock-chip">
                      <Wallet size={20} style={{ color: 'var(--primary-light)' }} />
                    </div>
                  </div>
                  <div className="mock-card-bottom">
                    <div>
                      <span className="mock-label">VERIFICATION</span>
                      <span className="mock-subval">Level 2 (Active)</span>
                    </div>
                    <div>
                      <span className="mock-label">DAILY LIMIT</span>
                      <span className="mock-subval">₦50,000 / day</span>
                    </div>
                  </div>
                </div>

                {/* Dashboard grid mock elements */}
                <div className="mock-grid">
                  <div className="mock-grid-box glass-panel">
                    <div className="mock-grid-box-header">
                      <Zap size={14} style={{ color: 'var(--primary-solid)' }} />
                      <span>Electricity Prepaid</span>
                    </div>
                    <div className="mock-badge-success">Success</div>
                    <div className="mock-details">Recharge: IKEDC Prepaid</div>
                    <div className="mock-token">TOKEN: 4812-9014-2578-8314</div>
                  </div>

                  <div className="mock-grid-box glass-panel">
                    <div className="mock-grid-box-header">
                      <Smartphone size={14} style={{ color: 'var(--secondary)' }} />
                      <span>Airtime Top-Up</span>
                    </div>
                    <div className="mock-badge-success">Success</div>
                    <div className="mock-details">MTN NGN 2,500</div>
                    <div className="mock-number">0803 123 4567</div>
                  </div>
                </div>

                {/* Mock Transaction Line */}
                <div className="mock-tx-header">
                  <span>Recent Utility Transactions</span>
                  <span>View All</span>
                </div>
                
                <div className="mock-tx-list">
                  <div className="mock-tx-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="mock-tx-icon-wrapper in"><ArrowUpRight size={14} /></div>
                      <div>
                        <div className="mock-tx-title">Wallet Funded via Paystack</div>
                        <div className="mock-tx-date">Today • 12:45 PM</div>
                      </div>
                    </div>
                    <div className="mock-tx-amt success">+₦20,000.00</div>
                  </div>

                  <div className="mock-tx-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="mock-tx-icon-wrapper out"><ArrowDownLeft size={14} /></div>
                      <div>
                        <div className="mock-tx-title">DSTV Premium Subscription</div>
                        <div className="mock-tx-date">Yesterday • 4:10 PM</div>
                      </div>
                    </div>
                    <div className="mock-tx-amt">-₦24,500.00</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="hero-glow-back"></div>
          </div>
        </div>
      </section>

      {/* Trust & Badges */}
      <section className="badges-section">
        <div className="badges-container">
          <div className="badges-grid">
            <div className="badge-item">
              <ShieldCheck size={28} className="badge-icon" />
              <div>
                <h3>AES-256 Vault</h3>
                <p>Pin verification guards unauthorized operations.</p>
              </div>
            </div>
            <div className="badge-item">
              <Award size={28} className="badge-icon" />
              <div>
                <h3>Paystack Certified</h3>
                <p>Deposit inline scripts and webhook-secured endpoints.</p>
              </div>
            </div>
            <div className="badge-item">
              <Users size={28} className="badge-icon" />
              <div>
                <h3>ClubKonnect Integration</h3>
                <p>Live verification of customer smartcards and utility meters.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <span className="section-subtitle">Features</span>
          <h2 className="section-title">Designed for Fast & Secure Utility Recharges</h2>
          <p className="section-description">
            Experience an elegant platform that eliminates payment errors. Verify, fund, and transaction with total confidence.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="feature-card glass-card">
                <div className="feature-icon-box">
                  <Icon size={22} style={{ color: 'white' }} />
                </div>
                <h3 className="feature-card-title">{feat.title}</h3>
                <p className="feature-card-desc">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Verification Tiers Section */}
      <section id="tiers" className="tiers-section">
        <div className="section-header">
          <span className="section-subtitle">Limits Tiers</span>
          <h2 className="section-title">Account Verification Levels</h2>
          <p className="section-description">
            Customize your security limits. Easily upgrade tiers to align with your transaction volume requirements.
          </p>
        </div>

        <div className="tiers-grid">
          {tiers.map((tier, idx) => (
            <div key={idx} className={`tier-card glass-panel ${tier.popular ? 'tier-card-popular' : ''}`}>
              {tier.popular && <div className="popular-badge">Most Popular</div>}
              <h3 className="tier-name">{tier.name}</h3>
              <div className="tier-limit">{tier.limit}</div>
              <p className="tier-desc">{tier.desc}</p>
              <div className="tier-divider"></div>
              <ul className="tier-features">
                {tier.features.map((feature, fIdx) => (
                  <li key={fIdx}>
                    <Check size={14} className="tier-check-icon" /> <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button onClick={onGetStarted} className={`tier-btn ${tier.popular ? 'btn-primary' : 'tier-btn-secondary'}`}>
                Select Tier
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline Section: How it Works */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="section-header">
          <span className="section-subtitle">Workflow</span>
          <h2 className="section-title">Get Started in 3 Simple Steps</h2>
          <p className="section-description">
            Setting up your utility panel is incredibly easy. Follow our verified payment path.
          </p>
        </div>

        <div className="timeline-container">
          {steps.map((step, idx) => (
            <div key={idx} className="timeline-step">
              <div className="step-num-box">
                <span className="step-number">{step.number}</span>
              </div>
              <div className="step-content glass-card">
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="landing-testimonial-section">
        <div className="testimonial-container glass-panel">
          <div className="testimonial-grid">
            <div className="testimonial-avatar-side">
              <div className="avatar-huge">V</div>
              <div className="avatar-quote-icon">“</div>
            </div>
            <div className="testimonial-content-side">
              <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="var(--warning)" color="var(--warning)" />
                ))}
              </div>
              <p className="testimonial-large-text">
                "We designed PaySphere to be the most fluid, secure utility application. By combining the immediate checkout verification of Paystack with local, encrypted transaction daily limits, our users get the fastest recharges possible without compromising their financial balance security."
              </p>
              <div className="testimonial-metadata">
                <h3>Victory</h3>
                <p>Founder & Operations Director, PaySphere</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="faq-section">
        <div className="section-header">
          <span className="section-subtitle">FAQ</span>
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-description">
            Find immediate answers to common questions about wallet management and bill limits.
          </p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, idx) => (
            <div key={idx} className={`faq-item glass-panel ${activeFaq === idx ? 'faq-active' : ''}`}>
              <button onClick={() => toggleFaq(idx)} className="faq-question">
                <span>{faq.q}</span>
                <ChevronDown size={18} className="faq-arrow-icon" />
              </button>
              <div className="faq-answer">
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-banner-section">
        <div className="cta-banner-container glass-panel">
          <h2 className="cta-banner-title">Ready to Take Control of Your Utilities?</h2>
          <p className="cta-banner-desc">
            Sign up today and experience instant token delivery, smartcard validations, and automatic daily transaction limits.
          </p>
          <button onClick={onGetStarted} className="btn-primary cta-banner-btn">
            Get Started Free <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Landing Page Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="landing-logo">
                <div className="logo-icon">P</div>
                <h2 className="logo-text">PaySphere</h2>
              </div>
              <p className="footer-tagline">
                Premium utility payments and secure digital wallet management.
              </p>
            </div>
            <div className="footer-links-grid">
              <div>
                <h4>Explore</h4>
                <a href="#features">Features</a>
                <a href="#tiers">Verification Tiers</a>
                <a href="#how-it-works">How It Works</a>
                <a href="#faq">FAQ</a>
              </div>
              <div>
                <h4>Security</h4>
                <span>SSL Encryption</span>
                <span>PCI-DSS Paystack</span>
                <span>PIN Lockout</span>
              </div>
              <div>
                <h4>Developer</h4>
                <a href="https://github.com/Victory364/Bill-Payment-Platform-" target="_blank" rel="noreferrer">
                  GitHub Repository
                </a>
                <span>API Integration docs</span>
              </div>
            </div>
          </div>

          <div className="footer-divider"></div>

          <div className="footer-bottom">
            <span>© 2026 PaySphere. All rights reserved. Designed by Victory.</span>
            <div style={{ display: 'flex', gap: '16px' }}>
              <span className="footer-terms">Privacy Policy</span>
              <span className="footer-terms">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
