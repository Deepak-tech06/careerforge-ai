"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "../../../lib/api";

interface Resource {
  name: string;
  url: string;
  type: "Free" | "Paid";
}

interface RoadmapStep {
  step: number;
  skill: string;
  title: string;
  priority: "high" | "medium" | "low";
  duration: string;
  description: string;
  completed: boolean;
  resources?: Resource[];
}

interface AnalysisWithRoadmap {
  id: string;
  targetRole: string;
  readinessScore: number;
  roadmap?: { id: string; steps: RoadmapStep[] };
}

const PRIORITY_COLOR = { high: "#f87171", medium: "#fbbf24", low: "#60a5fa" };

export default function RoadmapPage() {
  const [analysis, setAnalysis] = useState<AnalysisWithRoadmap | null>(null);
  const [steps, setSteps] = useState<RoadmapStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [w, setW] = useState(800);

  useEffect(() => {
    const handleResize = () => setW(Math.min(window.innerWidth - 80, 1000));
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    api.get("/analysis/my")
      .then(({ data }) => {
        const latest = data.find((a: AnalysisWithRoadmap) => a.roadmap) || data[0];
        if (latest) {
          setAnalysis(latest);
          setSteps(latest.roadmap?.steps || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleStep = (i: number) => {
    setSteps((prev) => prev.map((s, idx) => idx === i ? { ...s, completed: !s.completed } : s));
  };

  const completedCount = steps.filter((s) => s.completed).length;
  const progressPct = steps.length ? Math.round((completedCount / steps.length) * 100) : 0;

  if (loading) return <div style={{ padding: 40, color: "var(--text-muted)" }}>Loading roadmap...</div>;

  if (!analysis || !steps.length) return (
    <div style={S.empty}>
      <div style={S.emptyIcon}>🗺️</div>
      <h2 style={S.emptyTitle}>No roadmap yet</h2>
      <p style={S.emptyText}>Run an analysis first to generate your personalized learning roadmap.</p>
      <Link href="/dashboard/upload" className="btn-premium">Upload & Analyze →</Link>
    </div>
  );


  const centerX = w / 2;
  const amp = w * 0.25;
  const segmentHeight = Math.max(280, w * 0.35);
  const totalHeight = steps.length * segmentHeight;
  const roadStrokeOuter = Math.max(20, w * 0.05);
  const roadStrokeInner = Math.max(14, w * 0.035);
  
  let pathData = `M ${centerX} 0 `;
  for (let i = 0; i < steps.length; i++) {
    const cpY = (i * segmentHeight) + segmentHeight / 2;
    const endY = (i + 1) * segmentHeight;
    if (i % 2 === 0) {
      pathData += `Q ${centerX + 2 * amp} ${cpY}, ${centerX} ${endY} `;
    } else {
      pathData += `Q ${centerX - 2 * amp} ${cpY}, ${centerX} ${endY} `;
    }
  }
  pathData += `L ${centerX} ${totalHeight + 100}`;

  const WAVY_COLORS = ["#00c6ff", "#0072ff", "#ff007f", "#ff7f00", "#ffcc00", "#00e676", "#b100ff"];

  const getIcon = (skill: string) => {
    const s = skill.toLowerCase();
    if (s.includes('react') || s.includes('next')) return '⚛️';
    if (s.includes('js') || s.includes('javascript') || s.includes('type')) return '💛';
    if (s.includes('node') || s.includes('express') || s.includes('back')) return '🟢';
    if (s.includes('python') || s.includes('data')) return '🐍';
    if (s.includes('db') || s.includes('sql') || s.includes('mongo') || s.includes('postgre')) return '🗄️';
    if (s.includes('cloud') || s.includes('aws') || s.includes('docker') || s.includes('kuber')) return '☁️';
    if (s.includes('css') || s.includes('html') || s.includes('front')) return '🎨';
    if (s.includes('git')) return '📦';
    if (s.includes('java') || s.includes('spring')) return '☕';
    if (s.includes('machine') || s.includes('ml') || s.includes('deep')) return '🤖';
    return '🚀';
  };

  return (
    <div style={{ ...S.page, maxWidth: 1200 }}>
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Learning Roadmap</h1>
          <p style={S.sub}>Your personalized path to {analysis.targetRole}</p>
        </div>
        <div style={S.scoreBadge}>{analysis.readinessScore}% Ready</div>
      </div>

      {/* Progress tracker */}
      <div className="premium-card" style={{ marginBottom: 32 }}>
        <div style={S.progressHeader}>
          <span style={S.progressLabel}>Overall Progress</span>
          <span style={S.progressPct}>{completedCount} / {steps.length} completed · {progressPct}%</span>
        </div>
        <div style={S.progressBg}>
          <div style={{ ...S.progressFill, width: `${progressPct}%` }} />
        </div>
        <div style={S.priorityLegend}>
          {(["high", "medium", "low"] as const).map((p) => (
            <span key={p} style={{ color: PRIORITY_COLOR[p], fontSize: 12, fontWeight: 600 }}>
              ■ {p.charAt(0).toUpperCase() + p.slice(1)} Priority
            </span>
          ))}
        </div>
      </div>

      {/* Map Steps */}
      <div className="premium-card" style={{ padding: '60px 0', marginTop: 20, overflow: 'hidden', width: '100%' }}>
        <div style={{ position: 'relative', width: w, height: totalHeight + 100, margin: '0 auto' }}>
          {/* SVG Road */}
          <svg width={w} height={totalHeight + 100} style={{ position: 'absolute', top: 0, left: 0 }}>
            {/* Outer shadow/border */}
            <path d={pathData} stroke="#111" strokeWidth={roadStrokeOuter} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            {/* Main road body */}
            <path d={pathData} stroke="#2a2a35" strokeWidth={roadStrokeInner} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            {/* Dashed line */}
            <path d={pathData} stroke="#555" strokeWidth="3" strokeDasharray="15, 15" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          {/* Map Nodes */}
          {steps.map((step, i) => {
            const isEven = i % 2 === 0;
            const color = WAVY_COLORS[i % WAVY_COLORS.length];
            const peakY = (i * segmentHeight) + segmentHeight / 2;
            const pinSize = Math.max(50, w * 0.08);
            const pinPointerSize = Math.max(12, w * 0.02);
            
            const pinLeft = isEven ? centerX + amp + roadStrokeOuter / 2 : centerX - amp - roadStrokeOuter / 2 - pinSize;
            const pointerProps = isEven ? { left: -pinPointerSize / 2 } : { right: -pinPointerSize / 2 };
            const contentPosProps = isEven ? { left: 0 } : { right: 0 };
            const contentAlign = isEven ? 'flex-end' : 'flex-start';
            const contentTextAlign = isEven ? 'right' as const : 'left' as const;

            return (
              <div key={i} style={{ position: 'absolute', top: peakY, left: 0, width: w, height: 0 }}>
                {/* PIN */}
                <div style={{
                  position: 'absolute',
                  top: -pinSize / 2,
                  left: pinLeft,
                  width: pinSize, height: pinSize,
                  background: color,
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 10px 20px ${color}40`,
                  zIndex: 2,
                  opacity: step.completed ? 0.5 : 1,
                  transition: 'opacity 0.3s ease'
                }}>
                  {/* Pin Pointer */}
                  <div style={{
                    position: 'absolute',
                    ...pointerProps,
                    top: '50%',
                    transform: 'translateY(-50%) rotate(45deg)',
                    width: pinPointerSize, height: pinPointerSize,
                    background: color,
                    zIndex: -1,
                    borderRadius: 4
                  }} />
                  {/* Pin Inner White Circle */}
                  <div style={{
                    width: pinSize * 0.8, height: pinSize * 0.8,
                    background: 'var(--bg)',
                    borderRadius: '50%',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1,
                    border: `2px solid ${color}`
                  }}>
                    <span style={{ fontSize: pinSize * 0.35, fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>
                      {step.completed ? "✓" : (i + 1 < 10 ? `0${i+1}` : i+1)}
                    </span>
                  </div>
                </div>

                {/* CONTENT */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  transform: 'translateY(-50%)',
                  ...contentPosProps,
                  width: centerX + amp - roadStrokeOuter / 2 - 20,
                  padding: '0 20px',
                  display: 'flex', flexDirection: 'column',
                  alignItems: contentAlign,
                  textAlign: contentTextAlign,
                  opacity: step.completed ? 0.5 : 1,
                  transition: 'opacity 0.3s ease'
                }}>
                  <div style={{ fontSize: 32, marginBottom: 8, filter: `drop-shadow(0 0 10px ${color}40)` }}>
                    {getIcon(step.skill)}
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: color, textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.5px' }}>
                    {step.skill}
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: 12, maxWidth: 240 }}>
                    {step.description.substring(0, 70)}...
                  </p>

                  {step.resources && step.resources.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', maxWidth: 240, alignItems: contentAlign }}>
                      {step.resources.slice(0, 2).map((res, idx) => (
                        <a key={idx} href={res.url} target="_blank" rel="noreferrer" style={{
                          fontSize: 11,
                          padding: '6px 10px',
                          background: 'var(--bg-card)',
                          borderRadius: 6,
                          color: 'var(--text-sub)',
                          textDecoration: 'none',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          border: `1px solid ${color}30`,
                          transition: 'all 0.2s',
                          cursor: 'pointer',
                          width: '100%',
                          flexDirection: isEven ? 'row-reverse' : 'row'
                        }}>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%', textAlign: contentTextAlign }}>
                            {res.url.includes("youtube") ? "▶️ " : res.url.includes("coursera") ? "🎓 " : "📚 "}
                            {res.name}
                          </span>
                          <span style={{ color: res.type === 'Free' ? 'var(--primary)' : '#fbbf24', fontWeight: 700 }}>{res.type}</span>
                        </a>
                      ))}
                    </div>
                  )}
                  
                  <button
                    onClick={() => toggleStep(i)}
                    style={{
                      marginTop: 12,
                      padding: '6px 16px',
                      borderRadius: 20,
                      border: `1px solid ${step.completed ? 'var(--primary)' : color}`,
                      background: step.completed ? 'rgba(52,211,153,0.1)' : 'transparent',
                      color: step.completed ? 'var(--primary)' : color,
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {step.completed ? "COMPLETED" : "MARK AS DONE"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: { padding: "40px", maxWidth: 900, margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 16 },
  title: { fontSize: 28, fontWeight: 800, marginBottom: 6, letterSpacing: "-0.5px" },
  sub: { color: "var(--text-muted)", fontSize: 14 },
  scoreBadge: { padding: "8px 20px", borderRadius: 999, background: "rgba(var(--primary-rgb),0.15)", color: "var(--accent)", fontWeight: 700, fontSize: 15 },
  progressCard: { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, marginBottom: 32 },
  progressHeader: { display: "flex", justifyContent: "space-between", marginBottom: 12, alignItems: "center" },
  progressLabel: { fontSize: 14, fontWeight: 600 },
  progressPct: { fontSize: 13, color: "var(--text-muted)" },
  progressBg: { height: 8, background: "var(--border)", borderRadius: 999, overflow: "hidden", marginBottom: 16 },
  progressFill: { height: "100%", background: "linear-gradient(90deg, var(--primary), var(--secondary), var(--primary))", borderRadius: 999, transition: "width 0.5s ease" },
  priorityLegend: { display: "flex", gap: 20, flexWrap: "wrap" },
  mapContainer: { position: "relative", paddingLeft: 40, marginTop: 20 },
  pathLine: { position: "absolute", left: 19, top: 0, bottom: 0, width: 2, background: "var(--border)", zIndex: 0 },
  mapNodeWrapper: { position: "relative", marginBottom: 30 },
  nodeCircle: { position: "absolute", left: -40, top: 20, width: 40, height: 40, borderRadius: "50%", border: "2px solid", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15, zIndex: 1, color: "var(--text-main)", transform: "translateX(-50%)", background: "var(--bg)", boxShadow: "0 0 0 6px var(--bg)" },
  stepCard: { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, transition: "all 0.3s ease", position: "relative", marginLeft: 16 },
  stepTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 16, flexWrap: "wrap" },
  stepTitle: { fontSize: 18, fontWeight: 700, marginBottom: 6, color: "var(--text-main)" },
  stepDesc: { fontSize: 14, color: "var(--text-sub)", lineHeight: 1.6 },
  stepMeta: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 },
  priorityTag: { padding: "4px 12px", borderRadius: 999, fontSize: 11, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.05em" },
  duration: { fontSize: 13, color: "var(--text-muted)", fontWeight: 500 },
  resourcesContainer: { marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" },
  resourcesTitle: { fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 12, textTransform: "uppercase" as const, letterSpacing: "0.05em" },
  resourcesList: { display: "flex", flexDirection: "column", gap: 10 },
  resourceLink: { display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "var(--bg-card)", borderRadius: 10, textDecoration: "none", transition: "background 0.2s", border: "1px solid var(--border)" },
  resourceIcon: { fontSize: 18 },
  resourceName: { flex: 1, color: "var(--text-sub)", fontSize: 14, fontWeight: 500 },
  priceTag: { padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 },
  stepFooter: { display: "flex", justifyContent: "flex-end", alignItems: "center", marginTop: 20 },
  checkBtn: { padding: "8px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, transition: "all 0.2s" },
  empty: { textAlign: "center" as const, padding: "80px 24px" },
  emptyIcon: { fontSize: 64, marginBottom: 20 },
  emptyTitle: { fontSize: 22, fontWeight: 700, marginBottom: 12 },
  emptyText: { color: "var(--text-muted)", fontSize: 15, marginBottom: 28 },
  emptyBtn: { display: "inline-block", padding: "12px 28px", borderRadius: 12, background: "linear-gradient(135deg, var(--primary), var(--secondary))", color: "#fff", textDecoration: "none", fontWeight: 700 },
};
