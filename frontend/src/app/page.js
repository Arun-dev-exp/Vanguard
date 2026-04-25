'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import './landing.css';

/* ======= DATA ======= */
const stats = [
  { value: 4821, suffix: '+', label: 'Scams Detected', icon: 'bug_report' },
  { value: 99.87, suffix: '%', label: 'System Uptime', icon: 'monitoring' },
  { value: 12, suffix: 'ms', label: 'Avg Response', icon: 'speed' },
  { value: 50, suffix: 'M+', label: 'Transactions Scanned', icon: 'swap_horiz' },
];

const features = [
  { icon: 'radar', title: 'Live Threat Monitoring', desc: 'Real-time campaign detection powered by ML pattern matching across UPI, SMS, and phishing vectors.', color: '#adc6ff', size: 'large' },
  { icon: 'shield', title: 'Fraud Shield Network', desc: 'Entity graph intelligence maps connections between fraudulent UPI IDs, URLs, and phone numbers.', color: '#ffb4ab', size: 'normal' },
  { icon: 'bolt', title: 'Instant Takedown', desc: 'One-click campaign neutralization. Block UPI endpoints and flag malicious URLs in under 30 seconds.', color: '#6cff82', size: 'normal' },
  { icon: 'fingerprint', title: 'Policy Engine', desc: 'Custom detection rules with auto-action triggers. Fine-tune thresholds for your risk tolerance.', color: '#FF9F0A', size: 'normal' },
  { icon: 'terminal', title: 'System Intelligence', desc: 'Full-stack observability. Monitor CPU, memory, network, and service health in real time.', color: '#c4b5fd', size: 'normal' },
  { icon: 'lock', title: 'Zero-Trust Architecture', desc: 'End-to-end encrypted operations with role-based access control and full audit logging.', color: '#67e8f9', size: 'large' },
];

const timeline = [
  { time: '0ms', event: 'Threat Signal Ingested', icon: 'cell_tower', desc: 'Raw signals captured from UPI, SMS gateways, and web crawlers' },
  { time: '12ms', event: 'ML Classification', icon: 'psychology', desc: 'Multi-model ensemble classifies threat type and severity' },
  { time: '50ms', event: 'Entity Graph Updated', icon: 'hub', desc: 'Fraud network connections mapped and scored automatically' },
  { time: '200ms', event: 'Alert Dispatched', icon: 'notifications_active', desc: 'Priority-routed alerts to SOC analysts with full context' },
  { time: '<30s', event: 'Takedown Executed', icon: 'gavel', desc: 'Automated takedown via UPI provider APIs and URL blocklists' },
];

const terminalLines = [
  { type: 'comment', text: '# Vanguard SOC — Live Threat Pipeline' },
  { type: 'prompt', text: '$ vanguard scan --mode realtime' },
  { type: 'output', text: '⚡ Initializing ML pipeline...' },
  { type: 'output', text: '✓ 3 classification models loaded (12ms)' },
  { type: 'output', text: '✓ Entity graph connected (847K nodes)' },
  { type: 'output', text: '✓ UPI endpoint monitor active' },
  { type: 'alert', text: '⚠ THREAT DETECTED: Phishing campaign' },
  { type: 'alert', text: '  → UPI ID: fraud@upi linked to 23 reports' },
  { type: 'success', text: '✓ Auto-takedown initiated (confidence: 99.2%)' },
  { type: 'success', text: '✓ 847 potential victims protected' },
];

/* ======= COMPONENTS ======= */

function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.radius = Math.random() * 1.5 + 0.5;
        this.opacity = Math.random() * 0.5 + 0.1;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        ctx.fillStyle = isDark ? `rgba(173, 198, 255, ${this.opacity})` : `rgba(44, 95, 204, ${this.opacity * 0.6})`;
        ctx.fill();
      }
    }

    const count = Math.min(80, Math.floor(canvas.width * canvas.height / 15000));
    for (let i = 0; i < count; i++) particles.push(new Particle());

    const maxDist = 150;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const isDarkLine = document.documentElement.getAttribute('data-theme') === 'dark';
            ctx.strokeStyle = isDarkLine ? `rgba(173, 198, 255, ${0.06 * (1 - dist / maxDist)})` : `rgba(44, 95, 204, ${0.04 * (1 - dist / maxDist)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animationId = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-canvas" />;
}

function AnimatedCounter({ target, suffix, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const startTime = performance.now();
        const animate = (now) => {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Number((eased * target).toFixed(target % 1 !== 0 ? 2 : 0)));
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

function ScrollReveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`scroll-reveal ${visible ? 'revealed' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function TerminalMockup() {
  const [visibleLines, setVisibleLines] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let line = 0;
        const interval = setInterval(() => {
          line++;
          setVisibleLines(line);
          if (line >= terminalLines.length) clearInterval(interval);
        }, 400);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="terminal-mockup">
      <div className="terminal-header">
        <div className="terminal-dots">
          <span className="terminal-dot terminal-dot-red" />
          <span className="terminal-dot terminal-dot-yellow" />
          <span className="terminal-dot terminal-dot-green" />
        </div>
        <span className="terminal-title">vanguard-soc — threat-pipeline</span>
        <div style={{ width: 52 }} />
      </div>
      <div className="terminal-body">
        {terminalLines.slice(0, visibleLines).map((line, i) => (
          <div key={i} className={`terminal-line terminal-line-${line.type}`}>
            {line.text}
          </div>
        ))}
        {visibleLines < terminalLines.length && (
          <span className="terminal-cursor">▌</span>
        )}
      </div>
    </div>
  );
}

function FeatureCard({ feature, index }) {
  const cardRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  }, []);

  return (
    <ScrollReveal delay={index * 100}>
      <div
        ref={cardRef}
        className={`feature-card ${feature.size === 'large' ? 'feature-card-large' : ''}`}
        style={{ '--accent': feature.color }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="feature-card-glow" />
        <div className="feature-icon-wrap">
          <span className="material-symbols-outlined feature-icon" style={{ fontVariationSettings: "'FILL' 1" }}>{feature.icon}</span>
        </div>
        <h3 className="feature-title">{feature.title}</h3>
        <p className="feature-desc">{feature.desc}</p>
        <div className="feature-card-border" />
      </div>
    </ScrollReveal>
  );
}

function StickyNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`sticky-nav ${scrolled ? 'sticky-nav-scrolled' : ''}`}>
      <div className="nav-inner">
        <Link href="/" className="nav-brand">
          <div className="nav-logo-icon">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", color: isDark ? '#adc6ff' : '#2c5fcc', fontSize: 22 }}>shield</span>
          </div>
          <span className="nav-logo-text">VANGUARD</span>
        </Link>

        <div className={`nav-links ${mobileOpen ? 'nav-links-open' : ''}`}>
          <a href="#features" onClick={() => setMobileOpen(false)}>Features</a>
          <a href="#stats" onClick={() => setMobileOpen(false)}>Metrics</a>
          <a href="#how-it-works" onClick={() => setMobileOpen(false)}>How It Works</a>
          <a href="#security" onClick={() => setMobileOpen(false)}>Security</a>
          <button onClick={toggleTheme} className="theme-toggle-btn" title={isDark ? 'Switch to light mode' : 'Switch to dark mode'} aria-label="Toggle theme">
            <span className="material-symbols-outlined animate-theme-spin" key={theme} style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          <Link href="/dashboard" className="nav-cta" onClick={() => setMobileOpen(false)}>
            Enter Dashboard
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
          </Link>
        </div>

        <button className="nav-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
        </button>
      </div>
    </nav>
  );
}

/* ======= MAIN PAGE ======= */
export default function LandingPage() {
  return (
    <div className="landing-root">
      <StickyNav />

      {/* ===== HERO ===== */}
      <section className="hero-section">
        <ParticleCanvas />
        <div className="hero-grid" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />

        <div className="hero-content">
          <ScrollReveal>
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              <span>NEXT-GEN FRAUD INTELLIGENCE PLATFORM</span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <h1 className="hero-title">
              <span className="hero-title-line">Defend Financial</span>
              <span className="hero-title-line hero-title-gradient">Infrastructure</span>
              <span className="hero-title-line">In Real Time</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <p className="hero-subtitle">
              Vanguard SOC empowers security teams with AI-driven threat detection,
              instant campaign takedowns, and full-stack fraud intelligence — protecting
              millions of transactions across India&apos;s digital payment ecosystem.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <div className="hero-actions">
              <Link href="/dashboard" className="btn-primary">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>rocket_launch</span>
                Launch Dashboard
                <span className="btn-shine" />
              </Link>
              <a href="#how-it-works" className="btn-ghost">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>play_circle</span>
                See How It Works
              </a>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={400}>
            <div className="hero-trust">
              <div className="hero-trust-logos">
                <div className="trust-badge">
                  <span className="material-symbols-outlined trust-badge-icon" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  <span>RBI Compliant</span>
                </div>
                <div className="trust-badge">
                  <span className="material-symbols-outlined trust-badge-icon" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                  <span>SOC 2 Type II</span>
                </div>
                <div className="trust-badge">
                  <span className="material-symbols-outlined trust-badge-icon" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                  <span>ISO 27001</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        <div className="hero-scroll-indicator">
          <span className="material-symbols-outlined">expand_more</span>
        </div>
      </section>

      {/* ===== SOCIAL PROOF MARQUEE ===== */}
      <section className="marquee-section">
        <div className="marquee-track">
          {[...Array(2)].map((_, setIndex) => (
            <div key={setIndex} className="marquee-set">
              {['National Payments Corporation', 'Reserve Bank of India', 'State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Paytm', 'PhonePe', 'Google Pay India'].map((name, i) => (
                <div key={i} className="marquee-item">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: 20 }}>account_balance</span>
                  <span>{name}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section id="stats" className="stats-section">
        <div className="stats-grid">
          {stats.map((stat, i) => (
            <ScrollReveal key={i} delay={i * 100}>
              <div className="stat-card">
                <div className="stat-icon-wrap">
                  <span className="material-symbols-outlined stat-icon" style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
                </div>
                <div className="stat-value">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-bar" />
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ===== FEATURES BENTO ===== */}
      <section id="features" className="features-section">
        <ScrollReveal>
          <div className="section-header">
            <span className="section-badge">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>auto_awesome</span>
              CAPABILITIES
            </span>
            <h2 className="section-title">Everything You Need to<br /><span className="text-gradient">Fight Financial Fraud</span></h2>
            <p className="section-desc">Six integrated modules working in concert to detect, analyze, and neutralize fraud campaigns before they cause damage.</p>
          </div>
        </ScrollReveal>

        <div className="features-bento">
          {features.map((f, i) => (
            <FeatureCard key={i} feature={f} index={i} />
          ))}
        </div>
      </section>

      {/* ===== TERMINAL SHOWCASE ===== */}
      <section className="terminal-section">
        <ScrollReveal>
          <div className="section-header">
            <span className="section-badge">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>terminal</span>
              LIVE DEMO
            </span>
            <h2 className="section-title">See Vanguard<br /><span className="text-gradient">In Action</span></h2>
            <p className="section-desc">Watch a real-time fraud detection and takedown sequence. From signal ingestion to automated neutralization.</p>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={200}>
          <TerminalMockup />
        </ScrollReveal>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="how-section">
        <ScrollReveal>
          <div className="section-header">
            <span className="section-badge">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>timeline</span>
              RESPONSE PIPELINE
            </span>
            <h2 className="section-title">From Signal to<br /><span className="text-gradient">Takedown in Seconds</span></h2>
          </div>
        </ScrollReveal>

        <div className="timeline-container">
          <div className="timeline-line-bg" />
          {timeline.map((item, i) => (
            <ScrollReveal key={i} delay={i * 150}>
              <div className="timeline-step">
                <div className="timeline-number">{String(i + 1).padStart(2, '0')}</div>
                <div className="timeline-dot">
                  <span className="material-symbols-outlined" style={{ fontSize: 22, fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                </div>
                <div className="timeline-info">
                  <div className="timeline-time">{item.time}</div>
                  <div className="timeline-event">{item.event}</div>
                  <div className="timeline-desc">{item.desc}</div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ===== SECURITY SECTION ===== */}
      <section id="security" className="security-section">
        <ScrollReveal>
          <div className="section-header">
            <span className="section-badge">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>security</span>
              TRUST & SECURITY
            </span>
            <h2 className="section-title">Enterprise-Grade<br /><span className="text-gradient">Security Built In</span></h2>
          </div>
        </ScrollReveal>

        <div className="security-grid">
          {[
            { icon: 'encrypted', title: 'End-to-End Encryption', desc: 'AES-256 encryption at rest, TLS 1.3 in transit. Zero plaintext data exposure.' },
            { icon: 'admin_panel_settings', title: 'RBAC & Audit Logs', desc: 'Granular role-based access with immutable audit trails for every action.' },
            { icon: 'cloud_done', title: '99.99% SLA', desc: 'Multi-region redundancy with automatic failover. Zero-downtime deployments.' },
            { icon: 'gpp_good', title: 'Compliance Ready', desc: 'Pre-certified for RBI, PCI-DSS, SOC 2, and ISO 27001 frameworks.' },
          ].map((item, i) => (
            <ScrollReveal key={i} delay={i * 100}>
              <div className="security-card">
                <span className="material-symbols-outlined security-icon" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="cta-section">
        <div className="cta-bg-effects">
          <div className="cta-orb cta-orb-1" />
          <div className="cta-orb cta-orb-2" />
        </div>
        <ScrollReveal>
          <div className="cta-content">
            <div className="cta-badge">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>rocket</span>
              GET STARTED TODAY
            </div>
            <h2 className="cta-title">Ready to Secure Your<br /><span className="text-gradient">Payment Ecosystem?</span></h2>
            <p className="cta-desc">Deploy Vanguard SOC and start detecting fraud in minutes. No setup complexity. Enterprise-grade from day one.</p>
            <div className="cta-actions">
              <Link href="/dashboard" className="btn-primary btn-lg">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>shield</span>
                Enter Command Center
                <span className="btn-shine" />
              </Link>
              <a href="mailto:security@vanguard.io" className="btn-outline">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>mail</span>
                Contact Sales
              </a>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-grid">
            <div className="footer-col footer-col-brand">
              <div className="footer-brand">
                <div className="nav-logo-icon">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", color: '#adc6ff', fontSize: 20 }}>shield</span>
                </div>
                <span className="footer-brand-text">VANGUARD</span>
              </div>
              <p className="footer-brand-desc">
                Next-generation fraud intelligence platform protecting India&apos;s digital payment ecosystem.
              </p>
              <div className="footer-social">
                <a href="#" aria-label="Twitter"><span className="material-symbols-outlined">public</span></a>
                <a href="#" aria-label="GitHub"><span className="material-symbols-outlined">code</span></a>
                <a href="#" aria-label="Email"><span className="material-symbols-outlined">mail</span></a>
              </div>
            </div>

            <div className="footer-col">
              <h4 className="footer-col-title">Platform</h4>
              <a href="#features">Features</a>
              <a href="#security">Security</a>
              <a href="#stats">Metrics</a>
              <a href="#how-it-works">How It Works</a>
            </div>

            <div className="footer-col">
              <h4 className="footer-col-title">Resources</h4>
              <a href="#">Documentation</a>
              <a href="#">API Reference</a>
              <a href="#">Status Page</a>
              <a href="#">Changelog</a>
            </div>

            <div className="footer-col">
              <h4 className="footer-col-title">Company</h4>
              <a href="#">About Us</a>
              <a href="#">Careers</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-copy">© 2026 Vanguard Security Operations. All rights reserved.</div>
            <div className="footer-bottom-links">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
