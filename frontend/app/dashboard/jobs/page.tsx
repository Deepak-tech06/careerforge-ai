"use client";

import React, { useEffect, useState } from "react";
import api from "../../../lib/api";

const JOBS = [
  {
    role: "Frontend Developer",
    company: "TechCorp Solutions",
    location: "Remote",
    salary: "$80k - $120k",
    type: "Full-time",
    requiredSkills: ["javascript", "typescript", "react", "html", "css", "tailwind", "nextjs", "redux", "graphql", "webpack", "git", "rest api"],
    tags: ["React", "TypeScript", "Remote"],
    color: "var(--secondary)",
  },
  {
    role: "Backend Developer",
    company: "DataSystems Inc",
    location: "Hybrid",
    salary: "$90k - $130k",
    type: "Full-time",
    requiredSkills: ["javascript", "typescript", "nodejs", "express", "nestjs", "postgresql", "mongodb", "redis", "docker", "rest api", "jwt", "git", "linux"],
    tags: ["Node.js", "PostgreSQL", "Docker"],
    color: "var(--accent)",
  },
  {
    role: "Full Stack Developer",
    company: "StartupAI",
    location: "Remote",
    salary: "$100k - $150k",
    type: "Full-time",
    requiredSkills: ["javascript", "typescript", "react", "nodejs", "express", "postgresql", "mongodb", "docker", "git", "rest api", "html", "css", "jwt"],
    tags: ["Full Stack", "Startup", "High Growth"],
    color: "var(--primary)",
  },
  {
    role: "Data Scientist",
    company: "Analytics Corp",
    location: "On-site",
    salary: "$95k - $140k",
    type: "Full-time",
    requiredSkills: ["python", "machine learning", "deep learning", "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", "matplotlib", "sql", "git"],
    tags: ["Python", "ML", "Data"],
    color: "#34d399",
  },
  {
    role: "DevOps Engineer",
    company: "CloudBase",
    location: "Remote",
    salary: "$110k - $160k",
    type: "Full-time",
    requiredSkills: ["linux", "docker", "kubernetes", "aws", "terraform", "ci/cd", "nginx", "git", "python"],
    tags: ["DevOps", "Cloud", "Kubernetes"],
    color: "#f59e0b",
  },
  {
    role: "ML Engineer",
    company: "AIVentures",
    location: "Hybrid",
    salary: "$120k - $180k",
    type: "Full-time",
    requiredSkills: ["python", "machine learning", "deep learning", "tensorflow", "pytorch", "scikit-learn", "docker", "aws", "git", "rest api", "nlp"],
    tags: ["AI/ML", "Python", "NLP"],
    color: "#f472b6",
  },
];

export default function JobsPage() {
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "high" | "medium">("all");

  useEffect(() => {
    api.get("/analysis/my")
      .then(({ data }) => {
        if (data.length > 0) setUserSkills(data[0].extractedSkills || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const scored = JOBS.map((job) => {
    const matched = job.requiredSkills.filter((rs) =>
      userSkills.some((us) => us.toLowerCase().includes(rs) || rs.includes(us.toLowerCase()))
    );
    const score = Math.round((matched.length / job.requiredSkills.length) * 100);
    return { ...job, matchScore: score, matchedCount: matched.length, totalRequired: job.requiredSkills.length };
  }).sort((a, b) => b.matchScore - a.matchScore);

  const filtered = scored.filter((j) =>
    filter === "all" ? true : filter === "high" ? j.matchScore >= 60 : j.matchScore < 60
  );

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Job Matches</h1>
          <p style={S.sub}>Roles ranked by your skill match percentage</p>
        </div>
      </div>

      <div style={S.filterRow}>
        {(["all", "high", "medium"] as const).map((f) => (
          <button
            key={f}
            style={{ ...S.filterBtn, ...(filter === f ? S.filterActive : {}) }}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "All Roles" : f === "high" ? "60%+ Match" : "< 60% Match"}
          </button>
        ))}
        {!loading && userSkills.length === 0 && (
          <span style={S.hint}>⚠ Upload a resume for personalized scores</span>
        )}
      </div>

      <div style={S.grid}>
        {filtered.map((job) => {
          const scoreColor = job.matchScore >= 70 ? "#34d399" : job.matchScore >= 40 ? "#fbbf24" : "#f87171";
          return (
            <div key={job.role} className="premium-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12, borderColor: job.color + "33" }}>
              <div style={S.cardTop}>
                <div style={{ ...S.roleIcon, background: job.color + "22", color: job.color }}>
                  {job.role[0]}
                </div>
                <div style={{ ...S.matchBadge, background: scoreColor + "20", color: scoreColor }}>
                  {job.matchScore}% match
                </div>
              </div>

              <h3 style={S.roleName}>{job.role}</h3>
              <div style={S.company}>{job.company}</div>

              <div style={S.metaRow}>
                <span style={S.meta}>📍 {job.location}</span>
                <span style={S.meta}>💰 {job.salary}</span>
                <span style={S.meta}>🕐 {job.type}</span>
              </div>

              <div style={S.progressBg}>
                <div style={{ ...S.progressFill, width: `${job.matchScore}%`, background: job.color }} />
              </div>
              <div style={S.matchText}>{job.matchedCount} of {job.totalRequired} required skills matched</div>

              <div style={S.tags}>
                {job.tags.map((t) => (
                  <span key={t} style={{ ...S.tag, background: job.color + "15", color: job.color }}>{t}</span>
                ))}
              </div>

              <button className="premium-action-btn" style={{ borderColor: job.color + "55", color: job.color, marginTop: 4, width: "100%" }}>
                View Details →
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: { padding: "40px", maxWidth: 1100, margin: "0 auto" },
  header: { marginBottom: 28 },
  title: { fontSize: 28, fontWeight: 800, marginBottom: 6, letterSpacing: "-0.5px" },
  sub: { color: "var(--text-muted)", fontSize: 14 },
  filterRow: { display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap", alignItems: "center" },
  filterBtn: { padding: "7px 16px", borderRadius: 999, border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", cursor: "pointer", fontSize: 13 },
  filterActive: { border: "1px solid var(--primary)", color: "var(--accent)", background: "rgba(var(--primary-rgb),0.12)" },
  hint: { color: "var(--text-muted)", fontSize: 12, marginLeft: 8 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: 20 },
  card: { background: "var(--bg-card)", border: "1px solid", borderRadius: 20, padding: 24, display: "flex", flexDirection: "column", gap: 12, transition: "transform 0.2s" },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  roleIcon: { width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 20 },
  matchBadge: { padding: "4px 12px", borderRadius: 999, fontSize: 13, fontWeight: 700 },
  roleName: { fontSize: 18, fontWeight: 800 },
  company: { color: "var(--text-muted)", fontSize: 13 },
  metaRow: { display: "flex", gap: 12, flexWrap: "wrap" },
  meta: { fontSize: 12, color: "var(--text-sub)" },
  progressBg: { height: 5, background: "var(--border)", borderRadius: 999, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 999, transition: "width 0.8s ease" },
  matchText: { fontSize: 11, color: "var(--text-muted)" },
  tags: { display: "flex", gap: 6, flexWrap: "wrap" },
  tag: { padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600 },
  applyBtn: { padding: "9px 18px", borderRadius: 10, border: "1px solid", background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: 600, marginTop: 4, textAlign: "center" as const },
};
