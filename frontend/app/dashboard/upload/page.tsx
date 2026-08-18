"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import api from "../../../lib/api";

const ROLES = [
  "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "Data Scientist", "DevOps Engineer", "ML Engineer",
  "Mobile Developer", "Cloud Engineer",
];

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [role, setRole] = useState("Full Stack Developer");
  const [step, setStep] = useState<"upload" | "analyze" | "processing" | "done">("upload");
  const [uploadData, setUploadData] = useState<{ id: string; parsedSkills: string[] } | null>(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) { setFile(accepted[0]); setError(""); }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file) return;
    setError("");
    setStep("processing");
    setProgress(30);
    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await api.post("/resume/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadData(data);
      setProgress(100);
      setTimeout(() => setStep("analyze"), 500);
    } catch (e: unknown) {
      const axErr = e as { response?: { data?: { message?: string } } };
      setError(axErr.response?.data?.message || "Upload failed");
      setStep("upload");
    }
  };

  const handleAnalyze = async () => {
    if (!uploadData) return;
    setError("");
    setStep("processing");
    setProgress(20);
    try {
      setProgress(60);
      await api.post("/analysis", { resumeId: uploadData.id, targetRole: role });
      setProgress(100);
      setTimeout(() => router.push("/dashboard/analysis"), 600);
    } catch (e: unknown) {
      const axErr = e as { response?: { data?: { message?: string } } };
      setError(axErr.response?.data?.message || "Analysis failed");
      setStep("analyze");
    }
  };

  return (
    <div style={S.page}>
      <div style={S.header}>
        <h1 style={S.title}>Upload Resume</h1>
        <p style={S.sub}>Upload your PDF resume and select your target role for AI analysis</p>
      </div>

      {/* STEP INDICATOR */}
      <div style={S.steps}>
        {["Upload PDF", "Choose Role", "Get Analysis"].map((s, i) => {
          const done = (step === "analyze" && i === 0) || (step === "processing" && i <= 1) || (step === "done");
          const active = (step === "upload" && i === 0) || (step === "analyze" && i === 1) || ((step === "processing" || step === "done") && i === 2);
          return (
            <React.Fragment key={s}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ ...S.stepDot, background: done ? "#34d399" : active ? "var(--primary)" : "var(--border)", color: done || active ? "var(--text-main)" : "var(--text-muted)" }}>
                  {done ? "✓" : i + 1}
                </div>
                <span style={{ fontSize: 13, color: active || done ? "var(--text-main)" : "var(--text-sub)", fontWeight: active ? 600 : 400 }}>{s}</span>
              </div>
              {i < 2 && <div style={S.stepConnector} />}
            </React.Fragment>
          );
        })}
      </div>

      {error && <div style={S.error}>⚠ {error}</div>}

      {/* PROCESSING */}
      {step === "processing" && (
        <div className="premium-card" style={{ padding: 48, textAlign: "center" }}>
          <div style={S.spinner}>⚡</div>
          <h2 style={S.processingTitle}>AI is working...</h2>
          <p style={S.processingSub}>Extracting skills and matching against role requirements</p>
          <div style={S.progressBg}>
            <div style={{ ...S.progressFill, width: `${progress}%` }} />
          </div>
          <span style={S.progressPct}>{progress}%</span>
        </div>
      )}

      {/* UPLOAD STEP */}
      {step === "upload" && (
        <div className="premium-card">
          <div {...getRootProps()} style={{ ...S.dropzone, background: isDragActive ? "rgba(var(--primary-rgb),0.1)" : "var(--bg-card)", borderColor: isDragActive ? "var(--primary)" : "var(--border)" }}>
            <input {...getInputProps()} />
            {file ? (
              <div>
                <div style={S.fileIcon}>📄</div>
                <div style={S.fileName}>{file.name}</div>
                <div style={S.fileSize}>{(file.size / 1024).toFixed(1)} KB</div>
                <button style={S.changeBtn} onClick={(e) => { e.stopPropagation(); setFile(null); }}>Change file</button>
              </div>
            ) : (
              <div>
                <div style={S.dropIcon}>{isDragActive ? "📂" : "📤"}</div>
                <div style={S.dropTitle}>{isDragActive ? "Drop it here!" : "Drag & drop your resume"}</div>
                <div style={S.dropSub}>or click to browse — PDF only</div>
              </div>
            )}
          </div>

          <button
            className="btn-premium"
            style={{ width: "100%", justifyContent: "center", opacity: file ? 1 : 0.4, cursor: file ? "pointer" : "not-allowed" }}
            onClick={handleUpload}
            disabled={!file}
          >
            Upload & Extract Skills →
          </button>
        </div>
      )}

      {/* ANALYZE STEP */}
      {step === "analyze" && uploadData && (
        <div className="premium-card">
          <div style={S.successBanner}>
            ✅ Resume uploaded! Found <strong>{uploadData.parsedSkills.length} skills</strong>
          </div>

          <div style={S.pillGrid}>
            {uploadData.parsedSkills.map((s) => (
              <span key={s} className="green-pill-premium" style={{ marginRight: 8, marginBottom: 8 }}>{s}</span>
            ))}
            {uploadData.parsedSkills.length === 0 && (
              <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No standard tech skills detected — your resume may use different terminology. Analysis will still run.</p>
            )}
          </div>

          <div style={S.field}>
            <label style={S.label}>Target Role</label>
            <select className="theme-select" style={{ width: "100%", marginBottom: 20 }} value={role} onChange={(e) => setRole(e.target.value)}>
              {ROLES.map((r) => <option key={r} value={r} style={{ background: "var(--bg)", color: "var(--text-main)" }}>{r}</option>)}
            </select>
          </div>

          <button className="btn-premium" style={{ width: "100%", justifyContent: "center" }} onClick={handleAnalyze}>
            Run AI Analysis →
          </button>
        </div>
      )}
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: { padding: "40px", maxWidth: 720, margin: "0 auto" },
  header: { marginBottom: 36 },
  title: { fontSize: 28, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.5px" },
  sub: { color: "var(--text-muted)", fontSize: 14 },
  steps: { display: "flex", alignItems: "center", gap: 12, marginBottom: 32, flexWrap: "wrap" },
  stepDot: { width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 },
  stepConnector: { flex: 1, height: 1, background: "var(--border)", minWidth: 20 },
  error: { padding: "12px 16px", borderRadius: 10, background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", color: "#f87171", fontSize: 13, marginBottom: 20 },
  card: { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: 32 },
  dropzone: { border: "2px dashed", borderRadius: 16, padding: "48px 24px", textAlign: "center" as const, cursor: "pointer", transition: "all 0.3s", marginBottom: 24 },
  dropIcon: { fontSize: 48, marginBottom: 16 },
  dropTitle: { fontSize: 18, fontWeight: 600, marginBottom: 8 },
  dropSub: { color: "var(--text-muted)", fontSize: 13 },
  fileIcon: { fontSize: 40, marginBottom: 12 },
  fileName: { fontSize: 16, fontWeight: 600, marginBottom: 4 },
  fileSize: { color: "var(--text-muted)", fontSize: 12, marginBottom: 12 },
  changeBtn: { padding: "6px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text-sub)", cursor: "pointer", fontSize: 12 },
  btn: { width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, var(--primary), var(--secondary))", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" },
  successBanner: { padding: "12px 16px", borderRadius: 10, background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", color: "#34d399", fontSize: 13, marginBottom: 20 },
  pillGrid: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 },
  skillPill: { padding: "5px 12px", borderRadius: 999, background: "rgba(var(--primary-rgb),0.15)", color: "var(--accent)", fontSize: 12, fontWeight: 500 },
  field: { marginBottom: 20 },
  label: { display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase" as const, letterSpacing: "0.06em", fontWeight: 500 },
  select: { width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text-main)", fontSize: 14, marginBottom: 20 },
  processingCard: { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: 48, textAlign: "center" as const },
  spinner: { fontSize: 48, marginBottom: 20, display: "block", animation: "spin 1s linear infinite" },
  processingTitle: { fontSize: 22, fontWeight: 700, marginBottom: 10 },
  processingSub: { color: "var(--text-muted)", fontSize: 14, marginBottom: 28 },
  progressBg: { height: 8, background: "var(--border)", borderRadius: 999, overflow: "hidden", marginBottom: 8 },
  progressFill: { height: "100%", background: "linear-gradient(90deg, var(--primary), var(--secondary))", borderRadius: 999, transition: "width 0.5s ease" },
  progressPct: { fontSize: 13, color: "var(--text-muted)" },
};
