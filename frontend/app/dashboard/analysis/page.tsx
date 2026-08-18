"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from "recharts";
import api from "../../../lib/api";

interface Analysis {
  id: string;
  targetRole: string;
  readinessScore: number;
  matchedSkills: string[];
  skillGaps: string[];
  extractedSkills: string[];
  createdAt: string;
  resume?: { fileName: string };
  roadmap?: { id: string };
}

export default function AnalysisPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [selected, setSelected] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/analysis/my")
      .then(({ data }) => {
        setAnalyses(data);
        if (data.length > 0) setSelected(data[0]);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  if (!selected) return (
    <div style={S.empty}>
      <div style={S.emptyIcon}>📊</div>
      <h2 style={S.emptyTitle}>No analysis yet</h2>
      <p style={S.emptyText}>Upload your resume first to see your skill analysis.</p>
      <Link href="/dashboard/upload" style={S.emptyBtn}>Upload Resume →</Link>
    </div>
  );

  const scoreColor = selected.readinessScore >= 70 ? "#34d399" : selected.readinessScore >= 40 ? "#fbbf24" : "#f87171";

  // Radar chart data
  const radarData = [
    { skill: "Matched", value: selected.matchedSkills.length },
    { skill: "Gaps", value: selected.skillGaps.length },
    { skill: "Total", value: selected.extractedSkills.length },
    { skill: "Score", value: Math.round(selected.readinessScore / 10) },
    { skill: "Readiness", value: Math.round(selected.readinessScore / 20) },
  ];

  // Bar chart skill gap priorities
  const gapData = selected.skillGaps.slice(0, 8).map((s, i) => ({
    skill: s,
    priority: Math.max(1, 8 - i),
    fill: i < 3 ? "#f87171" : i < 5 ? "#fbbf24" : "#60a5fa",
  }));

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Skill Analysis</h1>
          <p style={S.sub}>AI-generated career readiness breakdown</p>
        </div>
        <Link href="/dashboard/upload" className="btn-premium">+ New Analysis</Link>
      </div>

      {/* Analysis selector */}
      {analyses.length > 1 && (
        <div style={S.selector}>
          {analyses.map((a) => (
            <button
              key={a.id}
              style={{ ...S.selectorBtn, ...(selected.id === a.id ? S.selectorBtnActive : {}) }}
              onClick={() => setSelected(a)}
            >
              {a.targetRole} · {a.readinessScore}%
            </button>
          ))}
        </div>
      )}

      {/* Score hero */}
      <div className="premium-card" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24, alignItems: "center" }}>
        <div style={S.scoreLeft}>
          <div style={S.scoreLabel}>Career Readiness</div>
          <div style={{ ...S.bigScore, color: scoreColor }}>{selected.readinessScore}%</div>
          <div style={{ ...S.statusBadge, background: scoreColor + "22", color: scoreColor }}>
            {selected.readinessScore >= 70 ? "🟢 Job Ready" : selected.readinessScore >= 40 ? "🟡 Progressing" : "🔴 Needs Work"}
          </div>
          <div style={S.roleTag}>Target: <strong style={{ color: "var(--text-main)" }}>{selected.targetRole}</strong></div>
          {selected.roadmap && (
            <Link href="/dashboard/roadmap" className="btn-premium" style={{ width: "fit-content", marginTop: 8 }}>View Roadmap →</Link>
          )}
        </div>

        {/* Radar */}
        <div style={S.scoreRight}>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="skill" tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
              <Radar dataKey="value" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Skills grid */}
      <div style={S.twoCol}>
        <div className="premium-card">
          <h3 style={S.cardTitle}>✅ Skills You Have (Total: {selected.extractedSkills.length})</h3>
          <div style={S.pillGrid}>
            {selected.matchedSkills.map((s) => (
              <span key={`matched-${s}`} className="green-pill-premium">{s}</span>
            ))}
            {selected.extractedSkills.filter(s => !selected.matchedSkills.includes(s)).map((s) => (
              <span key={`other-${s}`} className="neutral-pill-premium">{s}</span>
            ))}
          </div>
        </div>
        <div className="premium-card">
          <h3 style={S.cardTitle}>❌ Skills You Need ({selected.skillGaps.length})</h3>
          <div style={S.pillGrid}>
            {selected.skillGaps.map((s) => (
              <span key={s} className="red-pill-premium">{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Gap priority bar */}
      {gapData.length > 0 && (
        <div className="premium-card" style={{ marginTop: 24 }}>
          <h3 style={S.cardTitle}>Skill Gap Priority (Learn These First)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={gapData} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
              <XAxis dataKey="skill" tick={{ fill: "var(--text-muted)", fontSize: 11 }} angle={-30} textAnchor="end" />
              <YAxis hide />
              <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-main)", borderRadius: "8px" }} />
              <Bar dataKey="priority" radius={[6, 6, 0, 0]}>
                {gapData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={S.legend}>
            <span style={{ color: "#f87171", fontWeight: 600 }}>■ High Priority</span>
            <span style={{ color: "#fbbf24", fontWeight: 600 }}>■ Medium Priority</span>
            <span style={{ color: "#60a5fa", fontWeight: 600 }}>■ Low Priority</span>
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
      <p style={{ color: "var(--text-muted)" }}>Loading analysis...</p>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: { padding: "40px", maxWidth: 1100, margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 16 },
  title: { fontSize: 28, fontWeight: 800, marginBottom: 6, letterSpacing: "-0.5px" },
  sub: { color: "var(--text-muted)", fontSize: 14 },
  btn: { padding: "10px 22px", borderRadius: 10, background: "linear-gradient(135deg, var(--primary), var(--secondary))", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 14, display: "inline-block" },
  selector: { display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" },
  selectorBtn: { padding: "7px 16px", borderRadius: 999, border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", cursor: "pointer", fontSize: 13 },
  selectorBtnActive: { border: "1px solid var(--primary)", color: "var(--accent)", background: "rgba(var(--primary-rgb),0.12)" },
  scoreHero: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: 32, marginBottom: 24, alignItems: "center" },
  scoreLeft: { display: "flex", flexDirection: "column", gap: 12 },
  scoreLabel: { fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.08em", fontWeight: 500 },
  bigScore: { fontSize: 72, fontWeight: 900, lineHeight: 1 },
  statusBadge: { display: "inline-block", padding: "5px 14px", borderRadius: 999, fontSize: 13, fontWeight: 600, width: "fit-content" },
  roleTag: { color: "var(--text-muted)", fontSize: 13 },
  roadmapLink: { display: "inline-block", padding: "8px 18px", borderRadius: 10, background: "rgba(var(--primary-rgb),0.15)", color: "var(--accent)", textDecoration: "none", fontSize: 13, fontWeight: 600 },
  scoreRight: {},
  card: { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 18, padding: 28, marginBottom: 20, boxShadow: "0 8px 30px rgba(0,0,0,0.04)", backdropFilter: "blur(10px)", transition: "transform 0.3s ease, box-shadow 0.3s ease" },
  cardTitle: { fontSize: 15, fontWeight: 700, marginBottom: 16 },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 0 },
  pillGrid: { display: "flex", flexWrap: "wrap", gap: 8 },
  greenPill: { padding: "4px 12px", borderRadius: 999, background: "rgba(52,211,153,0.12)", color: "#34d399", fontSize: 12, fontWeight: 500 },
  redPill: { padding: "4px 12px", borderRadius: 999, background: "rgba(248,113,113,0.12)", color: "#f87171", fontSize: 12, fontWeight: 500 },
  grayPill: { padding: "4px 12px", borderRadius: 999, background: "var(--border)", color: "var(--text-muted)", fontSize: 12, fontWeight: 500 },
  legend: { display: "flex", gap: 20, fontSize: 12, color: "var(--text-muted)", justifyContent: "center", marginTop: 8 },
  empty: { textAlign: "center" as const, padding: "80px 24px" },
  emptyIcon: { fontSize: 64, marginBottom: 20 },
  emptyTitle: { fontSize: 22, fontWeight: 700, marginBottom: 12 },
  emptyText: { color: "var(--text-muted)", fontSize: 15, marginBottom: 28 },
  emptyBtn: { display: "inline-block", padding: "12px 28px", borderRadius: 12, background: "linear-gradient(135deg, var(--primary), var(--secondary))", color: "#fff", textDecoration: "none", fontWeight: 700 },
};
