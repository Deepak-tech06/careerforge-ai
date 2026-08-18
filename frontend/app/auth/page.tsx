"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";
import { setAuth } from "../../lib/auth";
import Link from "next/link";
import { useTheme } from "../../components/ThemeProvider";

export default function AuthPage() {
  const router = useRouter();
  const { isLightBg } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (localStorage.getItem('cf_token')) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = async () => {
    setError("");
    if (!isLogin && form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };

      const { data } = await api.post(endpoint, payload);
      setAuth(data.token, data.user);
      router.push("/dashboard");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string | string[] } } };
      const msg = axiosErr.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : (msg || "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.root}>
      <div style={S.bg} />
      <div style={S.orb1} />
      <div style={S.orb2} />

      {/* LEFT PANEL */}
      <div style={S.left}>
        <div style={S.leftContent}>
          <div style={S.brand}>
            <Link href="/" style={{ display: 'flex', justifyContent: 'center' }}>
              <img src={isLightBg ? "/logo-light.png" : "/logo.png"} alt="CareerForge AI" style={{ height: '75px' }} />
            </Link>
          </div>
          <h1 style={S.leftTitle}>
            Turn Your Resume
            <br />
            <span style={S.grad}>Into a Career Plan</span>
          </h1>
          <p style={S.leftSub}>
            AI-powered analysis that tells you exactly what skills you need,
            what you already have, and the fastest path to your dream role.
          </p>

          <div style={S.bullets}>
            {[
              "📄 Resume parsed in seconds",
              "📊 Weighted readiness score",
              "🗺️ Step-by-step learning roadmap",
              "💼 Role-specific skill matching",
            ].map((b) => (
              <div key={b} style={S.bullet}>{b}</div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — FORM */}
      <div style={S.right}>
        <div style={S.card}>
          <div style={S.cardAccent} />
          <h2 style={S.cardTitle}>
            {isLogin ? "Welcome Back 👋" : "Create Account 🚀"}
          </h2>
          <p style={S.cardSub}>
            {isLogin ? "Sign in to your CareerForge account" : "Start your career intelligence journey"}
          </p>

          {error && <div style={S.errorBox}>⚠ {error}</div>}

          {!isLogin && (
            <div style={S.field}>
              <label style={S.label}>Full Name</label>
              <input
                style={S.input}
                placeholder="John Smith"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>
          )}

          <div style={S.field}>
            <label style={S.label}>Email Address</label>
            <input
              style={S.input}
              type="email"
              placeholder="john@example.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </div>

          <div style={S.field}>
            <label style={S.label}>Password</label>
            <div style={S.inputWrap}>
              <input
                style={S.inputInner}
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <span style={S.eye} onClick={() => setShowPw((v) => !v)}>
                {showPw ? "🙈" : "👁"}
              </span>
            </div>
          </div>

          {!isLogin && (
            <div style={S.field}>
              <label style={S.label}>Confirm Password</label>
              <input
                style={S.input}
                type="password"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={(e) => set("confirmPassword", e.target.value)}
              />
            </div>
          )}

          <button
            style={{ ...S.btn, opacity: loading ? 0.7 : 1 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Please wait..." : isLogin ? "Sign In →" : "Create Account →"}
          </button>

          <p style={S.switchText}>
            {isLogin ? "New here?" : "Already have an account?"}{" "}
            <span style={S.switchLink} onClick={() => { setIsLogin(!isLogin); setError(""); }}>
              {isLogin ? "Create an account" : "Sign in"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  root: { display: "grid", gridTemplateColumns: "1.1fr 0.9fr", minHeight: "100vh", background: "var(--bg)", color: "var(--text-main)", fontFamily: "'Inter', sans-serif", position: "relative", overflow: "hidden" },
  bg: { position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(var(--primary-rgb),0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--primary-rgb),0.04) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" },
  orb1: { position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, var(--primary)33, transparent 70%)", top: 0, left: 0, filter: "blur(60px)", pointerEvents: "none" },
  orb2: { position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, var(--secondary)33, transparent 70%)", bottom: 0, right: 0, filter: "blur(60px)", pointerEvents: "none" },
  left: { position: "relative", zIndex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 60px 60px 80px", background: "rgba(255,255,255,0.01)" },
  leftContent: { maxWidth: 480 },
  brand: { fontSize: 16, fontWeight: 800, color: "var(--accent)", marginBottom: 40, letterSpacing: "0.02em" },
  leftTitle: { fontSize: "clamp(36px,4vw,52px)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-1.5px", marginBottom: 20 },
  grad: { background: "linear-gradient(135deg, var(--primary), var(--secondary))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  leftSub: { color: "var(--text-muted)", fontSize: 15, lineHeight: 1.7, marginBottom: 36 },
  bullets: { display: "flex", flexDirection: "column", gap: 12 },
  bullet: { fontSize: 14, color: "var(--text-sub)", display: "flex", alignItems: "center", gap: 8 },
  right: { position: "relative", zIndex: 1, display: "flex", justifyContent: "center", alignItems: "center", padding: 40, background: "var(--bg-card)", borderLeft: "1px solid var(--border)" },
  card: { width: "100%", maxWidth: 400, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 24, padding: 36, backdropFilter: "blur(20px)" },
  cardAccent: { height: 3, background: "linear-gradient(90deg, var(--primary), var(--secondary), var(--accent))", borderRadius: 999, marginBottom: 28 },
  cardTitle: { fontSize: 24, fontWeight: 800, marginBottom: 6 },
  cardSub: { fontSize: 13, color: "var(--text-muted)", marginBottom: 24 },
  errorBox: { padding: "10px 14px", borderRadius: 10, background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", fontSize: 13, marginBottom: 18 },
  field: { marginBottom: 16 },
  label: { display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 6, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" as const },
  input: { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text-main)", fontSize: 14, outline: "none", boxSizing: "border-box" as const },
  inputWrap: { position: "relative" },
  inputInner: { width: "100%", padding: "11px 42px 11px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text-main)", fontSize: 14, outline: "none", boxSizing: "border-box" as const },
  eye: { position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", cursor: "pointer", fontSize: 16 },
  btn: { width: "100%", marginTop: 8, padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, var(--primary), var(--secondary))", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", boxShadow: "0 0 20px rgba(var(--primary-rgb),0.35)", transition: "opacity 0.2s" },
  switchText: { textAlign: "center" as const, fontSize: 13, color: "var(--text-muted)", marginTop: 20 },
  switchLink: { color: "var(--accent)", cursor: "pointer", fontWeight: 600 },
};