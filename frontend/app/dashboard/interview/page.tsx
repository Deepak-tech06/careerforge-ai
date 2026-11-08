"use client";

import React, { useState } from "react";

const QUESTIONS_BY_ROLE: Record<string, { q: string; hint: string; category: string }[]> = {
  "Frontend": [
    { q: "What is the difference between `==` and `===` in JavaScript?", hint: "Type coercion vs strict equality", category: "JS Fundamentals" },
    { q: "Explain the Virtual DOM and how React uses it.", hint: "Talk about diffing and reconciliation", category: "React" },
    { q: "How does CSS specificity work?", hint: "Inline > ID > Class > Element", category: "CSS" },
    { q: "What are React Hooks and why were they introduced?", hint: "State and lifecycle in functional components", category: "React" },
    { q: "Explain the box model in CSS.", hint: "content, padding, border, margin", category: "CSS" },
    { q: "What is event delegation and why is it useful?", hint: "Single listener on parent vs many on children", category: "JS" },
  ],
  "Backend": [
    { q: "What is the difference between REST and GraphQL?", hint: "Over/under fetching, schema-first vs endpoint-first", category: "API Design" },
    { q: "Explain database indexing and when you would use it.", hint: "Performance vs write overhead tradeoff", category: "Database" },
    { q: "How does JWT authentication work?", hint: "Header.Payload.Signature, stateless", category: "Auth" },
    { q: "What is the N+1 query problem?", hint: "Eager loading vs lazy loading", category: "Database" },
    { q: "Explain ACID properties in databases.", hint: "Atomicity, Consistency, Isolation, Durability", category: "Database" },
    { q: "What are microservices and what are their tradeoffs?", hint: "Scalability vs complexity, distributed systems", category: "Architecture" },
  ],
  "Full Stack": [
    { q: "How would you design a scalable URL shortener?", hint: "Hash + DB + cache + load balancer", category: "System Design" },
    { q: "What is the difference between SQL and NoSQL databases?", hint: "Schema, scaling, consistency tradeoffs", category: "Database" },
    { q: "Explain the browser's critical rendering path.", hint: "DOM + CSSOM → Render tree → Layout → Paint", category: "Browser" },
    { q: "How do you handle state management in a large React app?", hint: "Context, Redux, Zustand tradeoffs", category: "React" },
    { q: "What is CORS and how do you configure it?", hint: "Same-origin policy, preflight requests", category: "Security" },
    { q: "Describe a CI/CD pipeline you've worked with.", hint: "Build, test, lint, deploy stages", category: "DevOps" },
  ],
  "Data Science / ML": [
    { q: "What is the bias-variance tradeoff?", hint: "Underfitting vs overfitting", category: "ML Theory" },
    { q: "Explain how gradient descent works.", hint: "Loss minimization via partial derivatives", category: "ML Theory" },
    { q: "What is cross-validation and why do we use it?", hint: "Generalization, k-fold", category: "Evaluation" },
    { q: "Difference between supervised and unsupervised learning?", hint: "Labeled vs unlabeled data", category: "ML Theory" },
    { q: "What are precision and recall?", hint: "TP/(TP+FP) vs TP/(TP+FN)", category: "Evaluation" },
    { q: "How do you handle missing data in a dataset?", hint: "Imputation, deletion, model-based", category: "Data Prep" },
  ],
};

const CATEGORIES = Object.keys(QUESTIONS_BY_ROLE);

export default function InterviewPage() {
  const [roleFilter, setRoleFilter] = useState("Full Stack");
  const [activeQ, setActiveQ] = useState<number | null>(null);
  const [showHint, setShowHint] = useState<Set<number>>(new Set());
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [ratings, setRatings] = useState<Record<number, number>>({});

  const questions = QUESTIONS_BY_ROLE[roleFilter] || [];

  const toggleHint = (i: number) => {
    setShowHint((prev) => {
      const s = new Set(prev);
      if (s.has(i)) {
        s.delete(i);
      } else {
        s.add(i);
      }
      return s;
    });
  };

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Interview Prep</h1>
          <p style={S.sub}>Practice role-specific questions with hints and self-rating</p>
        </div>
        <div style={S.stats}>
          <span style={S.stat}>{Object.keys(ratings).length} / {questions.length} rated</span>
        </div>
      </div>

      {/* Role filter */}
      <div style={S.filterRow}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            style={{ ...S.filterBtn, ...(roleFilter === cat ? S.filterActive : {}) }}
            onClick={() => { setRoleFilter(cat); setActiveQ(null); }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Questions */}
      <div style={S.questions}>
        {questions.map((q, i) => {
          const isOpen = activeQ === i;
          const rated = ratings[i];
          return (
            <div key={i} className="premium-card" style={{ padding: 20, borderColor: isOpen ? "rgba(var(--primary-rgb),0.4)" : "var(--border)" }}>
              <div style={S.qTop} onClick={() => setActiveQ(isOpen ? null : i)}>
                <div style={S.qLeft}>
                  <span style={S.qNum}>Q{i + 1}</span>
                  <span style={{ ...S.qCategory, background: "rgba(var(--primary-rgb),0.12)", color: "var(--accent)" }}>{q.category}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {rated && (
                    <span style={{ fontSize: 12, color: rated >= 4 ? "#34d399" : rated >= 2 ? "#fbbf24" : "#f87171" }}>
                      {"★".repeat(rated)}{"☆".repeat(5 - rated)}
                    </span>
                  )}
                  <span style={S.chevron}>{isOpen ? "▼" : "▶"}</span>
                </div>
              </div>

              <p style={{ ...S.qText, fontWeight: isOpen ? 600 : 400 }}>{q.q}</p>

              {isOpen && (
                <div style={S.qBody}>
                  <textarea
                    style={S.textarea}
                    placeholder="Write your answer here..."
                    value={answers[i] || ""}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [i]: e.target.value }))}
                    rows={4}
                  />

                  <div style={S.hintRow}>
                    <button className="premium-action-btn" style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12 }} onClick={() => toggleHint(i)}>
                      {showHint.has(i) ? "Hide Hint" : "💡 Show Hint"}
                    </button>
                    {showHint.has(i) && <span style={S.hint}>{q.hint}</span>}
                  </div>

                  <div style={S.ratingRow}>
                    <span style={S.ratingLabel}>Rate your answer:</span>
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button
                        key={r}
                        style={{ ...S.starBtn, color: (ratings[i] || 0) >= r ? "#fbbf24" : "#444" }}
                        onClick={() => setRatings((prev) => ({ ...prev, [i]: r }))}
                      >
                        ★
                      </button>
                    ))}
                    {rated && <span style={{ fontSize: 12, color: rated >= 4 ? "#34d399" : rated >= 2 ? "#fbbf24" : "#f87171", marginLeft: 8 }}>
                      {rated >= 4 ? "Great!" : rated >= 2 ? "Getting there" : "Keep practicing"}
                    </span>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {Object.keys(ratings).length > 0 && (
        <div className="premium-card" style={{ marginTop: 32 }}>
          <h3 style={S.summaryTitle}>Your Performance</h3>
          <div style={S.summaryGrid}>
            <div className="premium-stat-card" style={{ padding: 16 }}>
              <div style={{ ...S.summaryVal, color: "#34d399" }}>
                {Object.values(ratings).filter((r) => r >= 4).length}
              </div>
              <div style={S.summaryLabel}>Strong</div>
            </div>
            <div className="premium-stat-card" style={{ padding: 16 }}>
              <div style={{ ...S.summaryVal, color: "#fbbf24" }}>
                {Object.values(ratings).filter((r) => r >= 2 && r < 4).length}
              </div>
              <div style={S.summaryLabel}>Developing</div>
            </div>
            <div className="premium-stat-card" style={{ padding: 16 }}>
              <div style={{ ...S.summaryVal, color: "#f87171" }}>
                {Object.values(ratings).filter((r) => r < 2).length}
              </div>
              <div style={S.summaryLabel}>Needs Work</div>
            </div>
            <div className="premium-stat-card" style={{ padding: 16 }}>
              <div style={{ ...S.summaryVal, color: "var(--accent)" }}>
                {(Object.values(ratings).reduce((a, b) => a + b, 0) / Object.keys(ratings).length).toFixed(1)}
              </div>
              <div style={S.summaryLabel}>Avg Rating</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: { padding: "40px", maxWidth: 900, margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 16 },
  title: { fontSize: 28, fontWeight: 800, marginBottom: 6, letterSpacing: "-0.5px" },
  sub: { color: "var(--text-muted)", fontSize: 14 },
  stats: {},
  stat: { padding: "6px 16px", borderRadius: 999, background: "rgba(var(--primary-rgb),0.15)", color: "var(--accent)", fontSize: 13, fontWeight: 600 },
  filterRow: { display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" },
  filterBtn: { padding: "7px 16px", borderRadius: 999, border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", cursor: "pointer", fontSize: 13 },
  filterActive: { border: "1px solid var(--primary)", color: "var(--accent)", background: "rgba(var(--primary-rgb),0.12)" },
  questions: { display: "flex", flexDirection: "column", gap: 12 },
  qCard: { background: "var(--bg-card)", border: "1px solid", borderRadius: 16, padding: 20, transition: "border-color 0.2s" },
  qTop: { display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", marginBottom: 8 },
  qLeft: { display: "flex", alignItems: "center", gap: 10 },
  qNum: { fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" as const },
  qCategory: { padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600 },
  chevron: { color: "var(--text-muted)", fontSize: 12 },
  qText: { fontSize: 15, color: "var(--text-main)", lineHeight: 1.5 },
  qBody: { marginTop: 16, display: "flex", flexDirection: "column", gap: 14 },
  textarea: { width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-main)", fontSize: 14, resize: "vertical", fontFamily: "inherit", lineHeight: 1.6, boxSizing: "border-box" as const },
  hintRow: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
  hintBtn: { padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(var(--primary-rgb),0.4)", background: "rgba(var(--primary-rgb),0.1)", color: "var(--accent)", cursor: "pointer", fontSize: 12, fontWeight: 600 },
  hint: { fontSize: 13, color: "#fbbf24", fontStyle: "italic" },
  ratingRow: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
  ratingLabel: { fontSize: 12, color: "var(--text-muted)", marginRight: 4 },
  starBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 22, padding: "0 2px", transition: "color 0.1s" },
  summary: { marginTop: 32, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 28 },
  summaryTitle: { fontSize: 16, fontWeight: 700, marginBottom: 20 },
  summaryGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 },
  summaryCard: { textAlign: "center" as const, padding: 16, borderRadius: 12, background: "var(--bg-card)" },
  summaryVal: { fontSize: 36, fontWeight: 900 },
  summaryLabel: { fontSize: 12, color: "var(--text-muted)", marginTop: 4 },
};
