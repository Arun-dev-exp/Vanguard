'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import './landing.css';

const stats = [
  { value: 4821, suffix: '+', label: 'Scams Detected', icon: 'bug_report' },
  { value: 99.87, suffix: '%', label: 'System Uptime', icon: 'monitoring' },
  { value: 12, suffix: 'ms', label: 'Avg Response', icon: 'speed' },
  { value: 50, suffix: 'M+', label: 'Transactions Scanned', icon: 'swap_horiz' },
];

const features = [
  { icon: 'radar', title: 'Live Threat Monitoring', desc: 'Real-time campaign detection powered by ML pattern matching across UPI, SMS, and phishing vectors.', color: '#adc6ff' },
  { icon: 'shield', title: 'Fraud Shield Network', desc: 'Entity graph intelligence maps connections between fraudulent UPI IDs, URLs, and phone numbers.', color: '#ffb4ab' },
  { icon: 'bolt', title: 'Instant Takedown', desc: 'One-click campaign neutralization. Block UPI endpoints and flag malicious URLs in under 30 seconds.', color: '#6cff82' },
  { icon: 'fingerprint', title: 'Policy Engine', desc: 'Custom detection rules with auto-action triggers. Fine-tune thresholds for your risk tolerance.', color: '#FF9F0A' },
  { icon: 'terminal', title: 'System Intelligence', desc: 'Full-stack observability. Monitor CPU, memory, network, and service health in real time.', color: '#c4b5fd' },
  { icon: 'lock', title: 'Zero-Trust Architecture', desc: 'End-to-end encrypted operations with role-based access control and full audit logging.', color: '#67e8f9' },
];

const timeline = [
  { time: '0ms', event: 'Threat Signal Ingested', icon: 'cell_tower' },
  { time: '12ms', event: 'ML Classification', icon: 'psychology' },
  { time: '50ms', event: 'Entity Graph Updated', icon: 'hub' },
  { time: '200ms', event: 'Alert Dispatched', icon: 'notifications_active' },
  { time: '< 30s', event: 'Takedown Executed', icon: 'gavel' },
];

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
    }, { threshold: 0.15 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`scroll-reveal ${visible ? 'revealed' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export default function LandingPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouse = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <div className="landing-root">
      {/* Cursor glow */}
      <div className="cursor-glow" style={{ left: mousePos.x - 200, top: mousePos.y - 200 }} />

      {/* ===== HERO ===== */}
      <section className="hero-section">
        <div className="hero-grid" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />

        {/* Floating particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
          }} />
        ))}

        <nav className="hero-nav">
          <div className="hero-nav-brand">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", color: '#adc6ff', fontSize: 28 }}>shield</span>
            <span className="hero-nav-title">VANGUARD</span>
          </div>
          <div className="hero-nav-links">
            <a href="#features">Features</a>
            <a href="#stats">Metrics</a>
            <a href="#how-it-works">How It Works</a>
            <Link href="/dashboard" className="hero-nav-cta">Enter Dashboard →</Link>
          </div>
        </nav>

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
              millions of transactions across India's digital payment ecosystem.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <div className="hero-actions">
              <Link href="/dashboard" className="btn-primary">
                <span className="material-symbols-outlined text-lg">rocket_launch</span>
                Launch Dashboard
              </Link>
              <a href="#features" className="btn-ghost">
                <span className="material-symbols-outlined text-lg">play_circle</span>
                See How It Works
              </a>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={400}>
            <div className="hero-trust">
              <span className="hero-trust-label">Trusted by</span>
              <div className="hero-trust-logos">
                <span className="hero-trust-item">🏦 RBI Compliant</span>
                <span className="hero-trust-divider">|</span>
                <span className="hero-trust-item">🔒 SOC 2 Type II</span>
                <span className="hero-trust-divider">|</span>
                <span className="hero-trust-item">⚡ ISO 27001</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section id="stats" className="stats-section">
        <div className="stats-grid">
          {stats.map((stat, i) => (
            <ScrollReveal key={i} delay={i * 100}>
              <div className="stat-card">
                <span className="material-symbols-outlined stat-icon" style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
                <div className="stat-value">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="features-section">
        <ScrollReveal>
          <div className="section-header">
            <span className="section-badge">CAPABILITIES</span>
            <h2 className="section-title">Everything You Need to<br /><span className="text-gradient">Fight Financial Fraud</span></h2>
            <p className="section-desc">Six integrated modules working together to detect, analyze, and neutralize fraud campaigns before they cause damage.</p>
          </div>
        </ScrollReveal>

        <div className="features-grid">
          {features.map((f, i) => (
            <ScrollReveal key={i} delay={i * 80}>
              <div className="feature-card" style={{ '--accent': f.color }}>
                <div className="feature-icon-wrap">
                  <span className="material-symbols-outlined feature-icon" style={{ fontVariationSettings: "'FILL' 1" }}>{f.icon}</span>
                </div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
                <div className="feature-shine" />
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="how-section">
        <ScrollReveal>
          <div className="section-header">
            <span className="section-badge">RESPONSE PIPELINE</span>
            <h2 className="section-title">From Signal to<br /><span className="text-gradient">Takedown in Seconds</span></h2>
          </div>
        </ScrollReveal>

        <div className="timeline-container">
          {timeline.map((item, i) => (
            <ScrollReveal key={i} delay={i * 120}>
              <div className="timeline-step">
                <div className="timeline-dot">
                  <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                </div>
                {i < timeline.length - 1 && <div className="timeline-line" />}
                <div className="timeline-time">{item.time}</div>
                <div className="timeline-event">{item.event}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="cta-section">
        <div className="cta-glow" />
        <ScrollReveal>
          <div className="cta-content">
            <h2 className="cta-title">Ready to Secure Your<br /><span className="text-gradient">Payment Ecosystem?</span></h2>
            <p className="cta-desc">Deploy Vanguard SOC and start detecting fraud in minutes. No setup complexity. Enterprise-grade from day one.</p>
            <div className="hero-actions" style={{ justifyContent: 'center' }}>
              <Link href="/dashboard" className="btn-primary btn-lg">
                <span className="material-symbols-outlined">shield</span>
                Enter Command Center
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", color: '#adc6ff' }}>shield</span>
            <span>VANGUARD SOC</span>
          </div>
          <div className="footer-copy">© 2026 Vanguard Security Operations. All rights reserved.</div>
          <div className="footer-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
