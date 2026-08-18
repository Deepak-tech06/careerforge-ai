"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "../../lib/api";
import { getUser } from "../../lib/auth";

interface Analysis {
  id: string;
  targetRole: string;
  readinessScore: number;
  matchedSkills: string[];
  skillGaps: string[];
  createdAt: string;
  resume?: { fileName: string };
}

export default function DashboardPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    api.get("/analysis/my")
      .then(({ data }) => setAnalyses(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const latest = analyses[0];

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Welcome back, {user?.name?.split(" ")[0] ?? "there"} 👋</h1>
          <p style={S.subtitle}>Here&apos;s your career readiness overview</p>
        </div>
        <Link href="/dashboard/upload" className="btn-premium">
          + Analyze Resume
        </Link>
      </div>

      {/* Stats row */}
      {latest ? (
        <>
          <div style={S.statsRow}>
            <StatCard label="Readiness Score" value={`${latest.readinessScore}%`} sub={latest.targetRole} color="var(--primary)" />
            <StatCard label="Skills Matched" value={`${latest.matchedSkills.length}`} sub="out of required" color="#34d399" />
            <StatCard label="Skill Gaps" value={`${latest.skillGaps.length}`} sub="to bridge" color="#f87171" />
            <StatCard label="Analyses Run" value={`${analyses.length}`} sub="total" color="var(--secondary)" />
          </div>

          {/* Score bar */}
          <div className="premium-card">
            <div style={S.cardHeader}>
              <h2 style={S.cardTitle}>Career Readiness Score</h2>
              <span style={{ ...S.scoreBadge, background: latest.readinessScore >= 70 ? "rgba(52,211,153,0.15)" : latest.readinessScore >= 40 ? "rgba(251,191,36,0.15)" : "rgba(248,113,113,0.15)", color: latest.readinessScore >= 70 ? "#34d399" : latest.readinessScore >= 40 ? "#fbbf24" : "#f87171" }}>
                {latest.readinessScore >= 70 ? "Job Ready" : latest.readinessScore >= 40 ? "Getting There" : "Needs Work"}
              </span>
            </div>
            <div style={S.bigScore}>{latest.readinessScore}%</div>
            <div style={S.scoreBarBg}>
              <div style={{ ...S.scoreBarFill, width: `${latest.readinessScore}%`, background: latest.readinessScore >= 70 ? "linear-gradient(90deg,#34d399,#10b981)" : latest.readinessScore >= 40 ? "linear-gradient(90deg,#fbbf24,#f59e0b)" : "linear-gradient(90deg,#f87171,#ef4444)" }} />
            </div>
            <p style={S.cardSub}>For <strong style={{ color: "var(--text-main)" }}>{latest.targetRole}</strong> · Last analyzed {new Date(latest.createdAt).toLocaleDateString()}</p>
          </div>

          {/* Skills split */}
          <div style={S.twoCol}>
            <div className="premium-card">
              <h3 style={S.cardTitle}>✅ Matched Skills</h3>
              <div style={S.pillGrid}>
                {latest.matchedSkills.map((s) => (
                  <span key={s} className="green-pill-premium">{s}</span>
                ))}
              </div>
            </div>
            <div className="premium-card">
              <h3 style={S.cardTitle}>❌ Skill Gaps</h3>
              <div style={S.pillGrid}>
                {latest.skillGaps.map((s) => (
                  <span key={s} className="red-pill-premium">{s}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="premium-card">
            <h3 style={S.cardTitle}>Quick Actions</h3>
            <div style={S.quickActions}>
              <Link href="/dashboard/roadmap" className="premium-action-btn">🗺️ View Learning Roadmap</Link>
              <Link href="/dashboard/jobs" className="premium-action-btn">💼 Explore Job Matches</Link>
              <Link href="/dashboard/interview" className="premium-action-btn">🎤 Practice Interviews</Link>
              <Link href="/dashboard/upload" className="premium-action-btn">📄 Upload New Resume</Link>
            </div>
          </div>
        </>
      ) : loading ? (
        <div style={S.empty}>
          <div style={S.emptyIcon}>⏳</div>
          <p style={S.emptyText}>Loading your data...</p>
        </div>
      ) : (
        <div style={S.empty}>
          <div style={S.emptyIcon}>🚀</div>
          <h2 style={S.emptyTitle}>No analysis yet</h2>
          <p style={S.emptyText}>Upload your resume to get your career readiness score and personalized roadmap.</p>
          <Link href="/dashboard/upload" className="btn-premium">Upload Resume →</Link>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="premium-stat-card" style={{ borderColor: color + "33" }}>
      <div style={{ ...S.statValue, color }}>{value}</div>
      <div style={S.statLabel}>{label}</div>
      <div style={S.statSub}>{sub}</div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: { padding: "40px 40px", maxWidth: 1100, margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 36, flexWrap: "wrap", gap: 16 },
  title: { fontSize: 28, fontWeight: 800, marginBottom: 6, letterSpacing: "-0.5px" },
  subtitle: { color: "var(--text-muted)", fontSize: 14 },
  analyzeBtn: { padding: "10px 22px", borderRadius: 10, background: "linear-gradient(135deg, var(--primary), var(--secondary))", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 14 },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 16, marginBottom: 24 },
  statCard: { padding: 24, borderRadius: 16, background: "var(--bg-card)", border: "1px solid", textAlign: "center" as const },
  statValue: { fontSize: 36, fontWeight: 900 },
  statLabel: { fontSize: 12, color: "var(--text-muted)", marginTop: 4, fontWeight: 500 },
  statSub: { fontSize: 11, color: "var(--text-sub)", marginTop: 2 },
  card: { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 18, padding: 28, marginBottom: 20, boxShadow: "0 8px 30px rgba(0,0,0,0.04)", backdropFilter: "blur(10px)", transition: "transform 0.3s ease, box-shadow 0.3s ease" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: 700, marginBottom: 16 },
  cardSub: { fontSize: 13, color: "var(--text-muted)", marginTop: 12 },
  scoreBadge: { padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600 },
  bigScore: { fontSize: 64, fontWeight: 900, background: "linear-gradient(135deg, var(--primary), var(--secondary))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1, marginBottom: 16 },
  scoreBarBg: { height: 10, background: "var(--border)", borderRadius: 999, overflow: "hidden" },
  scoreBarFill: { height: "100%", borderRadius: 999, transition: "width 1s ease" },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 },
  pillGrid: { display: "flex", flexWrap: "wrap", gap: 8 },
  greenPill: { padding: "4px 12px", borderRadius: 999, background: "rgba(52,211,153,0.12)", color: "#34d399", fontSize: 12, fontWeight: 500 },
  redPill: { padding: "4px 12px", borderRadius: 999, background: "rgba(248,113,113,0.12)", color: "#f87171", fontSize: 12, fontWeight: 500 },
  quickActions: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 12 },
  actionBtn: { padding: "12px 16px", borderRadius: 12, border: "1px solid var(--border)", color: "var(--text-sub)", textDecoration: "none", fontSize: 13, fontWeight: 600, textAlign: "center" as const, display: "block", transition: "all 0.2s" },
  empty: { textAlign: "center" as const, padding: "80px 24px" },
  emptyIcon: { fontSize: 64, marginBottom: 20 },
  emptyTitle: { fontSize: 22, fontWeight: 700, marginBottom: 12 },
  emptyText: { color: "var(--text-muted)", fontSize: 15, marginBottom: 28 },
  emptyBtn: { display: "inline-block", padding: "12px 28px", borderRadius: 12, background: "linear-gradient(135deg, var(--primary), var(--secondary))", color: "#fff", textDecoration: "none", fontWeight: 700 },
};
