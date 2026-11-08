"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTheme, THEMES } from "../components/ThemeProvider";

const FEATURES = [
  {
    icon: "🧠",
    title: "AI Resume Analysis",
    desc: "Upload your PDF and our NLP engine extracts every skill automatically. No manual input needed.",
    color: "var(--primary)",
  },
  {
    icon: "📊",
    title: "Skill Gap Detection",
    desc: "We compare your skills against role requirements using a weighted scoring algorithm.",
    color: "var(--secondary)",
  },
  {
    icon: "🎯",
    title: "Readiness Score",
    desc: "Get a precise career readiness percentage calculated through multi-factor analysis.",
    color: "var(--accent)",
  },
  {
    icon: "🗺️",
    title: "Learning Roadmap",
    desc: "Receive a step-by-step learning plan with curated resources, timelines, and priorities.",
    color: "#34d399",
  },
  {
    icon: "💼",
    title: "Smart Job Matching",
    desc: "Discover job roles you're most ready for with skill match percentages per role.",
    color: "#f59e0b",
  },
  {
    icon: "🎤",
    title: "Mock Interviews",
    desc: "Practice role-specific questions and prepare answers before facing real interviewers.",
    color: "#f472b6",
  },
];

const STEPS = [
  { num: "01", title: "Upload Resume", desc: "Drop your PDF — we parse it instantly using NLP." },
  { num: "02", title: "Choose Target Role", desc: "Select from 8+ tech roles to compare against." },
  { num: "03", title: "Get AI Analysis", desc: "See your readiness score, matched & missing skills." },
  { num: "04", title: "Follow Your Roadmap", desc: "Execute a personalized, prioritized learning plan." },
];

const STATS = [
  { value: "95%", label: "Skill Extraction Accuracy" },
  { value: "8+", label: "Tech Roles Supported" },
  { value: "50+", label: "Skills Tracked" },
  { value: "100%", label: "Data-Driven Decisions" },
];

export default function HomePage() {
  const { theme, setTheme, isLightNav, isLightBg } = useTheme();
  const [scrollY, setScrollY] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const [isLocalAdmin, setIsLocalAdmin] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Read auth state from localStorage on the client after hydration
    const token = localStorage.getItem('cf_token');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAuthenticated(!!token);
    try {
      const userStr = localStorage.getItem('cf_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserName(user?.name ?? "");
        setIsLocalAdmin(user?.role === 'ADMIN');
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={styles.root}>
      {/* Animated background */}
      <div style={styles.bg}>
        <div style={{ ...styles.orb, top: "5%", left: "5%", background: "radial-gradient(circle, var(--primary)55, transparent 70%)" }} />
        <div style={{ ...styles.orb, top: "40%", right: "5%", background: "radial-gradient(circle, var(--secondary)55, transparent 70%)", width: 500, height: 500 }} />
        <div style={{ ...styles.orb, bottom: "10%", left: "30%", background: "radial-gradient(circle, var(--accent)44, transparent 70%)", width: 400, height: 400 }} />
        <div style={styles.grid} />
      </div>

      {/* NAVBAR */}
      <nav style={{ ...styles.nav, background: 'var(--nav-bg)', boxShadow: scrollY > 10 ? '0 10px 30px rgba(0,0,0,0.15)' : '0 4px 20px rgba(0,0,0,0.03)', borderBottom: '1px solid var(--border)', transition: 'all 0.3s ease' }}>
        <div style={styles.navInner}>
          <Link href="/" className="logo-container" style={styles.logo}>
            <img src={isLightNav ? "/logo-light.png" : "/logo.png"} alt="CareerForge AI" style={{ height: '70px', width: 'auto', display: 'flex' }} />
          </Link>
          <div style={styles.navLinks}>
            <a href="#features" className="nav-link">Features</a>
            <a href="#how" className="nav-link">How It Works</a>
            <a href="#stats" className="nav-link">Stats</a>
          </div>
          <div style={styles.navCtas}>
            {isLocalAdmin && (
              <select 
                value={theme} 
                onChange={(e) => setTheme(e.target.value as keyof typeof THEMES)}
                className="theme-select"
              >
                {Object.keys(THEMES).map((t) => (
                  <option key={t} value={t} style={{ background: 'var(--bg)', color: 'var(--text-main)' }}>
                    {t} Theme
                  </option>
                ))}
              </select>
            )}
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ color: 'var(--nav-text, var(--text-main))', fontSize: 14, fontWeight: 600 }}>
                  Hi, {userName.split(' ')[0]} 👋
                </span>
                <Link href="/dashboard" className="btn-premium">Dashboard →</Link>
              </div>
            ) : (
              <>
                <Link href="/auth" className="login-link">Log In</Link>
                <Link href="/auth" className="btn-premium">Get Started →</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={styles.hero} ref={heroRef}>
        <div style={{ ...styles.badge, transform: `translateY(${scrollY * -0.05}px)` }}>
          🚀 AI-Powered Career Intelligence Platform
        </div>
        <h1 style={{ ...styles.heroTitle, transform: `translateY(${scrollY * -0.1}px)` }}>
          Build Your Career
          <br />
          <span style={styles.gradient}>With AI Intelligence</span>
        </h1>
        <p style={{ ...styles.heroSub, transform: `translateY(${scrollY * -0.08}px)` }}>
          Upload your resume. Analyze your skills. Get a personalized roadmap to your dream role.
          <br />
          <strong style={{ color: "var(--text-main)" }}>No guesswork. Pure data.</strong>
        </p>
        <div style={styles.heroCtaRow}>
          <Link href={isAuthenticated ? "/dashboard/upload" : "/auth"} style={styles.primaryBtn}>
            Analyze My Resume 🚀
          </Link>
          <Link href={isAuthenticated ? "/dashboard" : "/auth"} style={styles.ghostBtn}>
            View Dashboard →
          </Link>
        </div>
        <div style={styles.heroHint}>
          Free to use · No credit card required · Results in seconds
        </div>

        {/* Mock dashboard preview */}
        <div style={styles.dashPreview}>
          <div style={styles.dashCard}>
            <div style={styles.dashCardLabel}>Readiness Score</div>
            <div style={styles.dashCardValue}>72%</div>
            <div style={styles.progressBar}><div style={{ ...styles.progressFill, width: "72%" }} /></div>
          </div>
          <div style={styles.dashCard}>
            <div style={styles.dashCardLabel}>Skills Matched</div>
            <div style={{ ...styles.dashCardValue, color: "#34d399" }}>8 / 12</div>
            <div style={styles.pillRow}>
              {["React", "Node.js", "TypeScript", "Docker"].map(s => (
                <span key={s} style={styles.pill}>{s}</span>
              ))}
            </div>
          </div>
          <div style={styles.dashCard}>
            <div style={styles.dashCardLabel}>Skill Gaps</div>
            <div style={{ ...styles.dashCardValue, color: "#f87171" }}>4 Skills</div>
            <div style={styles.pillRow}>
              {["Kubernetes", "Redis", "AWS", "CI/CD"].map(s => (
                <span key={s} style={{ ...styles.pill, background: "rgba(248,113,113,0.15)", color: "#f87171" }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section id="stats" style={styles.statsSection}>
        {STATS.map((s) => (
          <div key={s.label} style={styles.statCard}>
            <div style={styles.statValue}>{s.value}</div>
            <div style={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* FEATURES */}
      <section id="features" style={styles.section}>
        <div style={styles.sectionTag}>✨ Core Features</div>
        <h2 style={styles.sectionTitle}>Everything You Need to Get Hired</h2>
        <p style={styles.sectionSub}>
          A complete AI-driven toolkit that turns your resume into an actionable career strategy.
        </p>
        <div style={styles.featuresGrid}>
          {FEATURES.map((f) => (
            <div
              key={f.title}
              style={styles.featureCard}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-8px)";
                (e.currentTarget as HTMLDivElement).style.borderColor = f.color + "66";
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 20px 40px ${f.color}22`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              }}
            >
              <div style={{ ...styles.featureIcon, background: f.color + "22", color: f.color }}>
                {f.icon}
              </div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={styles.section}>
        <div style={styles.sectionTag}>⚙️ Process</div>
        <h2 style={styles.sectionTitle}>How CareerForge AI Works</h2>
        <div style={styles.stepsGrid}>
          {STEPS.map((step, i) => (
            <div key={step.num} style={styles.stepCard}>
              <div style={styles.stepNum}>{step.num}</div>
              {i < STEPS.length - 1 && <div style={styles.stepLine} />}
              <h3 style={styles.stepTitle}>{step.title}</h3>
              <p style={styles.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaGlow} />
        <h2 style={styles.ctaTitle}>
          Ready to Know Your Career Readiness?
        </h2>
        <p style={styles.ctaSub}>
          Join thousands of developers who turned career confusion into data-driven action.
        </p>
        <Link href={isAuthenticated ? "/dashboard" : "/auth"} style={styles.ctaBtn}>
          {isAuthenticated ? "Go to Dashboard →" : "Start Free Analysis →"}
        </Link>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <Link href="/" style={styles.footerLogo}>
          <img src={isLightBg ? "/logo-light.png" : "/logo.png"} alt="CareerForge AI" style={{ height: '70px', opacity: 0.8 }} />
        </Link>
        <span style={styles.footerText}>
          Built with ❤️ by <a href="https://github.com/Deepak-tech06" style={{ color: 'var(--secondary)', textDecoration: 'none' }}>Deepak</a>
        </span>
      </footer>
    </div>
  );
}

/* ─── STYLES ─────────────────────────────────────────────── */
const styles: Record<string, React.CSSProperties> = {
  root: { minHeight: "100vh", background: "var(--bg)", color: "var(--text-main)", fontFamily: "'Inter', sans-serif", overflowX: "hidden" },
  bg: { position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 },
  orb: { position: "absolute", width: 600, height: 600, borderRadius: "50%", filter: "blur(80px)", animation: "pulse 8s ease-in-out infinite" },
  grid: {
    position: "absolute", inset: 0,
    backgroundImage: "linear-gradient(rgba(var(--primary-rgb),0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--primary-rgb),0.04) 1px, transparent 1px)",
    backgroundSize: "60px 60px",
  },
  nav: { position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)", background: "var(--nav-bg, var(--bg-card))" },
  navInner: { maxWidth: 1200, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo: { fontSize: 20, fontWeight: 800, color: "var(--nav-text, var(--text-main))", display: "flex", alignItems: "center", gap: 8 },
  logoIcon: { fontSize: 22 },
  navLinks: { display: "flex", gap: 32 },
  navLink: { color: "var(--nav-text-sub, var(--text-sub))", textDecoration: "none", fontSize: 14, transition: "color 0.2s" },
  navCtas: { display: "flex", gap: 12, alignItems: "center" },
  loginLink: { color: "var(--nav-text-sub, var(--text-sub))", textDecoration: "none", fontSize: 14 },
  navBtn: { padding: "8px 20px", borderRadius: 8, background: "linear-gradient(135deg, var(--primary), var(--secondary))", color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 600 },
  hero: { position: "relative", zIndex: 1, textAlign: "center", padding: "100px 24px 60px", maxWidth: 1100, margin: "0 auto" },
  badge: { display: "inline-block", padding: "6px 16px", borderRadius: 999, background: "rgba(var(--primary-rgb),0.15)", border: "1px solid var(--border)", color: "var(--accent)", fontSize: 13, fontWeight: 500, marginBottom: 28 },
  heroTitle: { fontSize: "clamp(48px,7vw,88px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-2px", margin: "0 0 24px" },
  gradient: { background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 50%, var(--accent) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  heroSub: { fontSize: 18, color: "var(--text-muted)", maxWidth: 580, margin: "0 auto 36px", lineHeight: 1.7 },
  heroCtaRow: { display: "flex", gap: 16, justifyContent: "center", marginBottom: 20, flexWrap: "wrap" },
  primaryBtn: { padding: "14px 32px", borderRadius: 12, background: "linear-gradient(135deg, var(--primary), var(--secondary))", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 16, boxShadow: "0 0 30px rgba(var(--primary-rgb),0.4)", display: "inline-block" },
  ghostBtn: { padding: "14px 32px", borderRadius: 12, border: "1px solid var(--border)", color: "var(--text-main)", textDecoration: "none", fontWeight: 600, fontSize: 16, display: "inline-block", backdropFilter: "blur(10px)" },
  heroHint: { color: "var(--text-muted)", fontSize: 13, marginBottom: 60 },
  dashPreview: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, maxWidth: 900, margin: "0 auto" },
  dashCard: { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, textAlign: "left", backdropFilter: "blur(20px)" },
  dashCardLabel: { fontSize: 12, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" },
  dashCardValue: { fontSize: 32, fontWeight: 800, color: "var(--primary)", marginBottom: 12 },
  progressBar: { height: 6, background: "var(--border)", borderRadius: 999 },
  progressFill: { height: "100%", background: "linear-gradient(90deg, var(--primary), var(--secondary))", borderRadius: 999 },
  pillRow: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 },
  pill: { padding: "3px 10px", borderRadius: 999, background: "rgba(var(--primary-rgb),0.15)", color: "var(--accent)", fontSize: 11, fontWeight: 600 },
  statsSection: { position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 1, background: "var(--bg-card)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", maxWidth: "100%" },
  statCard: { padding: "40px 24px", textAlign: "center", background: "var(--bg)" },
  statValue: { fontSize: 42, fontWeight: 900, background: "linear-gradient(135deg, var(--primary), var(--secondary))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  statLabel: { fontSize: 13, color: "var(--text-muted)", marginTop: 6 },
  section: { position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "100px 24px" },
  sectionTag: { display: "inline-block", padding: "5px 14px", borderRadius: 999, background: "rgba(var(--primary-rgb),0.12)", color: "var(--accent)", fontSize: 13, fontWeight: 500, marginBottom: 20 },
  sectionTitle: { fontSize: "clamp(32px,4vw,52px)", fontWeight: 800, marginBottom: 16, letterSpacing: "-1px" },
  sectionSub: { color: "var(--text-muted)", fontSize: 16, maxWidth: 520, marginBottom: 60, lineHeight: 1.7 },
  featuresGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px,1fr))", gap: 20 },
  featureCard: { padding: 28, borderRadius: 20, background: "var(--bg-card)", border: "1px solid var(--border)", transition: "all 0.3s ease", cursor: "default" },
  featureIcon: { width: 52, height: 52, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 16 },
  featureTitle: { fontSize: 17, fontWeight: 700, marginBottom: 8 },
  featureDesc: { fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 },
  stepsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 32, position: "relative" },
  stepCard: { position: "relative", textAlign: "center", padding: "32px 24px", borderRadius: 20, background: "var(--bg-card)", border: "1px solid var(--border)" },
  stepNum: { fontSize: 48, fontWeight: 900, background: "linear-gradient(135deg, var(--primary), var(--secondary))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 16, lineHeight: 1 },
  stepLine: { display: "none" },
  stepTitle: { fontSize: 18, fontWeight: 700, marginBottom: 10 },
  stepDesc: { fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 },
  ctaSection: { position: "relative", zIndex: 1, textAlign: "center", padding: "100px 24px", overflow: "hidden" },
  ctaGlow: { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 300, background: "radial-gradient(ellipse, rgba(var(--primary-rgb),0.2), transparent 70%)", filter: "blur(40px)", pointerEvents: "none" },
  ctaTitle: { fontSize: "clamp(32px,4vw,52px)", fontWeight: 900, marginBottom: 20, letterSpacing: "-1px" },
  ctaSub: { color: "var(--text-muted)", fontSize: 16, maxWidth: 480, margin: "0 auto 36px", lineHeight: 1.7 },
  ctaBtn: { display: "inline-block", padding: "16px 40px", borderRadius: 14, background: "linear-gradient(135deg, var(--primary), var(--secondary))", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 18, boxShadow: "0 0 40px rgba(var(--primary-rgb),0.4)" },
  footer: { borderTop: "1px solid var(--border)", padding: "32px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1200, margin: "0 auto", flexWrap: "wrap", gap: 12 },
  footerLogo: { fontWeight: 800, fontSize: 16 },
  footerText: { color: "var(--text-muted)", fontSize: 13 },
};