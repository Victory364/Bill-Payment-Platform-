import React, { useState } from 'react';
import { 
  Smartphone, Zap, Tv, ShieldCheck, Wallet, ArrowRight, 
  Sun, Moon, Mail, MapPin, Menu, X, Check 
} from 'lucide-react';

export default function LandingPage({ onGetStarted, theme, toggleTheme }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div style={containerStyle}>
      {/* Decorative Blur Orbs */}
      <div style={orb1Style} />
      <div style={orb2Style} />

      {/* Header / Navbar */}
      <header style={headerStyle} className="glass-panel">
        <div style={navContainerStyle}>
          {/* Logo */}
          <div style={logoContainerStyle}>
            <div style={logoBadgeStyle}>P</div>
            <span style={logoTextStyle}>PaySphere</span>
          </div>

          {/* Desktop Nav Links */}
          <nav style={desktopNavStyle}>
            <a href="#features" style={navLinkStyle}>Features</a>
            <a href="#how-it-works" style={navLinkStyle}>How It Works</a>
            <a href="#security" style={navLinkStyle}>Security</a>
            <a href="#contact" style={navLinkStyle}>Contact</a>
          </nav>

          {/* Action Buttons */}
          <div style={navActionsStyle}>
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              style={iconButtonStyle}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Login Button */}
            <button 
              onClick={onGetStarted} 
              className="btn-primary" 
              style={loginBtnStyle}
            >
              Get Started <ArrowRight size={16} style={{ marginLeft: '4px' }} />
            </button>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              style={menuToggleStyle}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div style={mobileMenuOverlayStyle} className="glass-panel animate-slide-up">
            <nav style={mobileNavStyle}>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} style={mobileNavLinkStyle}>Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} style={mobileNavLinkStyle}>How It Works</a>
              <a href="#security" onClick={() => setMobileMenuOpen(false)} style={mobileNavLinkStyle}>Security</a>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} style={mobileNavLinkStyle}>Contact</a>
              <button 
                onClick={() => { setMobileMenuOpen(false); onGetStarted(); }} 
                className="btn-primary" 
                style={mobileLoginBtnStyle}
              >
                Get Started
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section style={heroSectionStyle} className="animate-fade-in">
        <div style={heroContentStyle}>
          <div style={badgeContainerStyle}>
            <span style={badgeStyle}>⚡ Instant Utility Payments</span>
          </div>
          <h1 style={heroHeadingStyle}>
            The Smart Way to Pay <br />
            <span style={gradientTextStyle}>Utility Bills & Services</span>
          </h1>
          <p style={heroSubheadingStyle}>
            Fund your wallet securely with Paystack and experience automated, instant recharge for airtime, data bundles, electricity meters, and cable TV subscriptions.
          </p>
          <div style={heroCtaContainerStyle}>
            <button onClick={onGetStarted} className="btn-primary" style={heroCtaPrimaryStyle}>
              Open Free Account <ArrowRight size={18} style={{ marginLeft: '6px' }} />
            </button>
            <a href="#features" style={heroCtaSecondaryStyle}>
              Explore Features
            </a>
          </div>
        </div>

        {/* Hero Graphic / Dashboard Mockup */}
        <div style={heroGraphicContainerStyle} className="animate-scale-in">
          <div className="glass-card" style={mockDashboardStyle}>
            <div style={mockHeaderStyle}>
              <div style={mockDotsStyle}>
                <span style={{ ...mockDotStyle, background: '#ef4444' }} />
                <span style={{ ...mockDotStyle, background: '#f59e0b' }} />
                <span style={{ ...mockDotStyle, background: '#10b981' }} />
              </div>
              <span style={mockTitleStyle}>PaySphere Portal</span>
            </div>
            <div style={mockBodyStyle}>
              <div className="glass-panel" style={mockCardStyle}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Wallet Balance</span>
                <h3 style={{ fontSize: '24px', margin: '4px 0 0', fontWeight: '800' }}>₦50,000.00</h3>
              </div>
              <div style={mockGridStyle}>
                <div style={mockGridItemStyle}>
                  <Smartphone size={20} style={{ color: 'var(--primary-solid)' }} />
                  <span style={mockItemLabelStyle}>Airtime & Data</span>
                </div>
                <div style={mockGridItemStyle}>
                  <Zap size={20} style={{ color: 'var(--success)' }} />
                  <span style={mockItemLabelStyle}>Electricity</span>
                </div>
                <div style={mockGridItemStyle}>
                  <Tv size={20} style={{ color: 'var(--secondary)' }} />
                  <span style={mockItemLabelStyle}>Cable TV</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <h2 style={sectionHeadingStyle}>Everything you need in one portal</h2>
          <p style={sectionSubheadingStyle}>Explore our robust billing services designed for speed and reliability.</p>
        </div>

        <div style={featuresGridStyle}>
          {/* Feature 1 */}
          <div className="glass-card" style={featureCardStyle}>
            <div style={{ ...featureIconContainerStyle, background: 'rgba(168, 85, 247, 0.1)' }}>
              <Smartphone size={24} style={{ color: 'var(--primary-solid)' }} />
            </div>
            <h3 style={featureTitleStyle}>Airtime & Data Top-up</h3>
            <p style={featureDescriptionStyle}>
              Instant top-up for MTN, Airtel, Glo, and 9mobile. Say goodbye to scratch cards and delay.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-card" style={featureCardStyle}>
            <div style={{ ...featureIconContainerStyle, background: 'rgba(16, 185, 129, 0.1)' }}>
              <Zap size={24} style={{ color: 'var(--success)' }} />
            </div>
            <h3 style={featureTitleStyle}>Electricity Bills</h3>
            <p style={featureDescriptionStyle}>
              Generate postpaid and prepaid meter recharge tokens instantly. Receipts are auto-saved to your profile.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-card" style={featureCardStyle}>
            <div style={{ ...featureIconContainerStyle, background: 'rgba(99, 102, 241, 0.1)' }}>
              <Tv size={24} style={{ color: 'var(--secondary)' }} />
            </div>
            <h3 style={featureTitleStyle}>Cable TV Subscription</h3>
            <p style={featureDescriptionStyle}>
              Renew DSTV, GOTV, and StarTimes subscriptions in seconds. Automated smartcard confirmation.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="glass-card" style={featureCardStyle}>
            <div style={{ ...featureIconContainerStyle, background: 'rgba(244, 63, 94, 0.1)' }}>
              <Wallet size={24} style={{ color: 'var(--accent)' }} />
            </div>
            <h3 style={featureTitleStyle}>Wallet Funding</h3>
            <p style={featureDescriptionStyle}>
              Instantly fund your utility wallet via Paystack secure checkout with cards, USSD, or direct bank transfer.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" style={{ ...sectionStyle, background: 'rgba(255, 255, 255, 0.01)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={sectionHeaderStyle}>
          <h2 style={sectionHeadingStyle}>Three easy steps to start</h2>
          <p style={sectionSubheadingStyle}>Follow these steps to pay bills automatically and track payments.</p>
        </div>

        <div style={stepsContainerStyle}>
          {/* Step 1 */}
          <div style={stepCardStyle}>
            <div style={stepBadgeStyle}>1</div>
            <h3 style={stepTitleStyle}>Create Account</h3>
            <p style={stepDescriptionStyle}>Register with your basic details and configure a secure transaction PIN.</p>
          </div>

          {/* Step 2 */}
          <div style={stepCardStyle}>
            <div style={stepBadgeStyle}>2</div>
            <h3 style={stepTitleStyle}>Fund Wallet</h3>
            <p style={stepDescriptionStyle}>Top up your utility account using any secure payment method on Paystack.</p>
          </div>

          {/* Step 3 */}
          <div style={stepCardStyle}>
            <div style={stepBadgeStyle}>3</div>
            <h3 style={stepTitleStyle}>Pay & Get Receipt</h3>
            <p style={stepDescriptionStyle}>Select your service, fill in billing info, authorize payment, and print your token receipt.</p>
          </div>
        </div>
      </section>

      {/* Security Info */}
      <section id="security" style={sectionStyle}>
        <div style={securityGridStyle}>
          <div style={securityContentStyle}>
            <div style={{ ...featureIconContainerStyle, background: 'rgba(168, 85, 247, 0.1)', marginBottom: '16px' }}>
              <ShieldCheck size={32} style={{ color: 'var(--primary-solid)' }} />
            </div>
            <h2 style={{ fontSize: '32px', fontWeight: '800', lineHeight: '1.2', marginBottom: '16px' }}>
              Bank-grade security keeping your funds safe
            </h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px', fontSize: '15px' }}>
              Your transactions are secure from end-to-end. We enforce multiple layers of security to guarantee zero payment disputes.
            </p>
            
            <div style={securityChecksStyle}>
              <div style={checkRowStyle}>
                <div style={checkBadgeStyle}><Check size={14} style={{ color: '#00c853' }} /></div>
                <span>SSL Encryption for all network requests.</span>
              </div>
              <div style={checkRowStyle}>
                <div style={checkBadgeStyle}><Check size={14} style={{ color: '#00c853' }} /></div>
                <span>Secured payment tokenization via Paystack.</span>
              </div>
              <div style={checkRowStyle}>
                <div style={checkBadgeStyle}><Check size={14} style={{ color: '#00c853' }} /></div>
                <span>4-digit transaction security PIN to prevent unauthorized recharges.</span>
              </div>
            </div>
          </div>

          {/* Paystack Integration Callout */}
          <div className="glass-card" style={paystackCardStyle}>
            <div style={paystackCardInnerStyle}>
              <span style={{ fontSize: '11px', color: '#00c853', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Secure Checkout Partner</span>
              <h3 style={{ fontSize: '22px', margin: '8px 0 12px', fontWeight: '800' }}>Powered by Paystack</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '20px' }}>
                We do not store your payment card details. All transactions are securely routed through Paystack, a licensed PCI-DSS compliant payment gateway.
              </p>
              <div style={paystackBadgeStyle}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#00c853' }}>Verified Paystack Merchant Integration</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer / Contact */}
      <footer id="contact" style={footerStyle}>
        <div style={footerGridStyle}>
          <div style={footerBrandColumnStyle}>
            <div style={logoContainerStyle}>
              <div style={logoBadgeStyle}>P</div>
              <span style={{ ...logoTextStyle, fontSize: '20px' }}>PaySphere</span>
            </div>
            <p style={footerBrandDescStyle}>
              Quick, automated, and secure bill payment services. Built with speed in mind.
            </p>
          </div>

          <div style={footerContactColumnStyle}>
            <h4 style={footerColumnHeadingStyle}>Contact Support</h4>
            <div style={footerContactInfoStyle}>
              <div style={contactRowStyle}>
                <Mail size={16} style={{ color: 'var(--primary-solid)', flexShrink: 0 }} />
                <a href="mailto:support@paysphere.com" style={footerLinkStyle}>support@paysphere.com</a>
              </div>
              <div style={contactRowStyle}>
                <MapPin size={16} style={{ color: 'var(--primary-solid)', flexShrink: 0 }} />
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>12, Herbert Macaulay Way, Yaba, Lagos, Nigeria.</span>
              </div>
            </div>
          </div>

          <div style={footerComplianceColumnStyle}>
            <h4 style={footerColumnHeadingStyle}>Compliance & Legal</h4>
            <span style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: '1.4', display: 'block' }}>
              PaySphere is a product platform registered under local payment portal guidelines. All payment processing integrations are verified and tested in sandboxed systems.
            </span>
          </div>
        </div>

        <div style={footerBottomStyle}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} PaySphere Bills. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}

// ── CSS-in-JS Styles for LandingPage ───────────────────────────

const containerStyle = {
  width: '100%',
  minHeight: '100vh',
  background: 'var(--bg-app)',
  color: 'var(--text-main)',
  position: 'relative',
  overflowX: 'hidden',
  display: 'flex',
  flexDirection: 'column',
};

const orb1Style = {
  position: 'absolute',
  top: '-150px',
  left: '-150px',
  width: '500px',
  height: '500px',
  background: 'var(--primary-glow)',
  filter: 'blur(150px)',
  borderRadius: '50%',
  zIndex: 0,
  pointerEvents: 'none',
};

const orb2Style = {
  position: 'absolute',
  top: '40%',
  right: '-150px',
  width: '600px',
  height: '600px',
  background: 'rgba(99, 102, 241, 0.12)',
  filter: 'blur(180px)',
  borderRadius: '50%',
  zIndex: 0,
  pointerEvents: 'none',
};

const headerStyle = {
  position: 'sticky',
  top: 0,
  zIndex: 50,
  width: '100%',
  padding: '16px 24px',
};

const navContainerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const logoContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};

const logoBadgeStyle = {
  background: 'var(--primary)',
  width: '36px',
  height: '36px',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontWeight: '800',
  fontSize: '18px',
  boxShadow: 'var(--shadow-glow)',
};

const logoTextStyle = {
  fontSize: '18px',
  fontWeight: '800',
  letterSpacing: '-0.02em',
  background: 'var(--primary)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

const desktopNavStyle = {
  display: 'flex',
  gap: '24px',
};

const navLinkStyle = {
  color: 'var(--text-muted)',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'color var(--transition-fast)',
  cursor: 'pointer',
};

const navActionsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
};

const iconButtonStyle = {
  background: 'none',
  border: 'none',
  color: 'var(--text-main)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px',
  borderRadius: '8px',
  transition: 'background-color var(--transition-fast)',
};

const loginBtnStyle = {
  padding: '8px 16px',
  borderRadius: '10px',
  fontSize: '13px',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
};

const menuToggleStyle = {
  background: 'none',
  border: 'none',
  color: 'var(--text-main)',
  cursor: 'pointer',
  padding: '4px',
  display: 'none',
};

const mobileMenuOverlayStyle = {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  borderBottom: '1px solid var(--border-color)',
};

const mobileNavStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const mobileNavLinkStyle = {
  color: 'var(--text-main)',
  textDecoration: 'none',
  fontSize: '16px',
  fontWeight: '600',
  padding: '8px 0',
  borderBottom: '1px solid var(--border-color)',
};

const mobileLoginBtnStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '10px',
  textAlign: 'center',
  fontSize: '14px',
};

const heroSectionStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '80px 24px',
  display: 'grid',
  gridTemplateColumns: '1.1fr 0.9fr',
  gap: '48px',
  alignItems: 'center',
  position: 'relative',
  zIndex: 1,
};

const heroContentStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  textAlign: 'left',
};

const badgeContainerStyle = {
  marginBottom: '16px',
};

const badgeStyle = {
  background: 'var(--primary-glow)',
  color: 'var(--primary-solid)',
  padding: '6px 12px',
  borderRadius: '99px',
  fontSize: '12px',
  fontWeight: '700',
  letterSpacing: '0.03em',
};

const heroHeadingStyle = {
  fontSize: '48px',
  fontWeight: '800',
  lineHeight: '1.15',
  marginBottom: '20px',
  letterSpacing: '-0.03em',
};

const gradientTextStyle = {
  background: 'var(--primary)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

const heroSubheadingStyle = {
  fontSize: '16px',
  color: 'var(--text-muted)',
  lineHeight: '1.6',
  marginBottom: '32px',
  maxWidth: '520px',
};

const heroCtaContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  width: '100%',
};

const heroCtaPrimaryStyle = {
  padding: '14px 28px',
  borderRadius: '12px',
  fontSize: '15px',
  display: 'flex',
  alignItems: 'center',
  fontWeight: '700',
};

const heroCtaSecondaryStyle = {
  color: 'var(--text-main)',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '600',
  transition: 'opacity var(--transition-fast)',
  cursor: 'pointer',
};

const heroGraphicContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const mockDashboardStyle = {
  width: '100%',
  maxWidth: '380px',
  padding: '16px',
  borderRadius: '16px',
  boxShadow: 'var(--shadow-main)',
};

const mockHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  borderBottom: '1px solid var(--border-color)',
  paddingBottom: '12px',
  marginBottom: '16px',
};

const mockDotsStyle = {
  display: 'flex',
  gap: '6px',
};

const mockDotStyle = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
};

const mockTitleStyle = {
  fontSize: '11px',
  color: 'var(--text-muted)',
  fontWeight: '600',
};

const mockBodyStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
};

const mockCardStyle = {
  padding: '14px',
  borderRadius: '12px',
  border: '1px solid var(--border-color)',
};

const mockGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '10px',
};

const mockGridItemStyle = {
  background: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid var(--border-color)',
  borderRadius: '10px',
  padding: '12px 6px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '6px',
};

const mockItemLabelStyle = {
  fontSize: '9px',
  color: 'var(--text-muted)',
  fontWeight: '600',
  textAlign: 'center',
};

const sectionStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '80px 24px',
  position: 'relative',
  zIndex: 1,
};

const sectionHeaderStyle = {
  textAlign: 'center',
  marginBottom: '48px',
};

const sectionHeadingStyle = {
  fontSize: '32px',
  fontWeight: '800',
  marginBottom: '12px',
};

const sectionSubheadingStyle = {
  color: 'var(--text-muted)',
  fontSize: '15px',
  maxWidth: '600px',
  margin: '0 auto',
};

const featuresGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '24px',
};

const featureCardStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  padding: '32px 24px',
};

const featureIconContainerStyle = {
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '20px',
};

const featureTitleStyle = {
  fontSize: '18px',
  fontWeight: '700',
  marginBottom: '10px',
};

const featureDescriptionStyle = {
  color: 'var(--text-muted)',
  fontSize: '13px',
  lineHeight: '1.5',
};

const stepsContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '32px',
};

const stepCardStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  padding: '20px',
};

const stepBadgeStyle = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  background: 'var(--primary)',
  color: 'white',
  fontWeight: '800',
  fontSize: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '16px',
  boxShadow: 'var(--shadow-glow)',
};

const stepTitleStyle = {
  fontSize: '16px',
  fontWeight: '700',
  marginBottom: '8px',
};

const stepDescriptionStyle = {
  color: 'var(--text-muted)',
  fontSize: '13px',
  lineHeight: '1.5',
  maxWidth: '240px',
};

const securityGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1.1fr 0.9fr',
  gap: '48px',
  alignItems: 'center',
};

const securityContentStyle = {
  textAlign: 'left',
};

const securityChecksStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
};

const checkRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  fontSize: '14px',
};

const checkBadgeStyle = {
  width: '22px',
  height: '22px',
  borderRadius: '50%',
  background: 'rgba(0, 200, 83, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const paystackCardStyle = {
  background: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid var(--border-color)',
  borderRadius: '20px',
  padding: '36px',
};

const paystackCardInnerStyle = {
  textAlign: 'left',
};

const paystackBadgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '6px 12px',
  background: 'rgba(0, 200, 83, 0.08)',
  border: '1px solid rgba(0, 200, 83, 0.2)',
  borderRadius: '8px',
};

const footerStyle = {
  background: 'rgba(5, 6, 10, 0.8)',
  borderTop: '1px solid var(--border-color)',
  padding: '64px 24px 24px',
  marginTop: 'auto',
  zIndex: 1,
};

const footerGridStyle = {
  maxWidth: '1200px',
  margin: '0 auto 48px',
  display: 'grid',
  gridTemplateColumns: '1.2fr 1fr 1fr',
  gap: '48px',
};

const footerBrandColumnStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '16px',
  textAlign: 'left',
};

const footerBrandDescStyle = {
  fontSize: '13px',
  color: 'var(--text-muted)',
  lineHeight: '1.5',
  maxWidth: '280px',
};

const footerContactColumnStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  textAlign: 'left',
};

const footerColumnHeadingStyle = {
  fontSize: '14px',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '20px',
  color: 'var(--text-main)',
};

const footerContactInfoStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const contactRowStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '10px',
};

const footerLinkStyle = {
  color: 'var(--text-muted)',
  textDecoration: 'none',
  fontSize: '13px',
  transition: 'color var(--transition-fast)',
};

const footerComplianceColumnStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  textAlign: 'left',
};

const footerBottomStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  paddingTop: '24px',
  borderTop: '1px solid var(--border-color)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};
