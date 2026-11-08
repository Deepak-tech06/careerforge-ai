"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getUser, clearAuth, isAuthenticated } from "../../lib/auth";
import { useTheme, THEMES, ThemeType } from "../../components/ThemeProvider";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: "🏠" },
  { href: "/dashboard/upload", label: "Upload Resume", icon: "📄" },
  { href: "/dashboard/analysis", label: "Analysis", icon: "📊" },
  { href: "/dashboard/roadmap", label: "Roadmap", icon: "🗺️" },
  { href: "/dashboard/jobs", label: "Job Matches", icon: "💼" },
  { href: "/dashboard/interview", label: "Interview Prep", icon: "🎤" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLightNav, theme, setTheme } = useTheme();
  const [user, setUser] = useState<{ name: string; email: string; role?: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/auth");
    } else {
      const u = getUser();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(u);
      setIsAdmin(u?.role === 'ADMIN');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    clearAuth();
    router.push("/auth");
  };

  return (
    <div style={S.root}>
      {/* SIDEBAR */}
      <aside style={S.sidebar}>
        <div style={S.sidebarTop}>
          <Link href="/" className="logo-container" style={S.brand}>
            <img src={isLightNav ? "/logo-light.png" : "/logo.png"} alt="CareerForge AI" style={{ height: '70px', display: 'flex' }} />
          </Link>
        </div>

        <nav style={S.nav}>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="dashboard-nav-item"
                style={{
                  ...S.navItem,
                  ...(active ? S.navItemActive : {}),
                }}
              >
                <span style={S.navIcon}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={S.sidebarBottom}>
          {isAdmin && (
            <div style={{ marginBottom: "16px", padding: "0 4px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--nav-text-sub, var(--text-muted))", marginBottom: "6px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                System Theme
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as ThemeType)}
                className="theme-select"
                style={{ width: "100%" }}
              >
                {Object.keys(THEMES).map((t) => (
                  <option key={t} value={t} style={{ background: "var(--bg)", color: "var(--text-main)" }}>
                    {t} Theme
                  </option>
                ))}
              </select>
            </div>
          )}
          {user && (
            <div style={S.userCard}>
              <div style={S.userAvatar}>{user.name?.[0]?.toUpperCase() || "U"}</div>
              <div>
                <div style={S.userName}>{user.name}</div>
                <div style={S.userEmail}>{user.email}</div>
              </div>
            </div>
          )}
          <button className="logout-btn-premium" style={S.logoutBtn} onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={S.main}>
        {children}
      </main>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  root: { display: "grid", gridTemplateColumns: "260px 1fr", minHeight: "100vh", background: "var(--bg)", color: "var(--text-main)", fontFamily: "'Inter', sans-serif" },
  sidebar: { background: "var(--nav-bg, var(--bg-card))", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflow: "hidden", backdropFilter: "blur(20px)", boxShadow: "2px 0 10px rgba(0,0,0,0.02)" },
  sidebarTop: { padding: "28px 24px 20px" },
  brand: { fontSize: 17, fontWeight: 900, color: "var(--nav-text, var(--text-main))", textDecoration: "none", letterSpacing: "-0.3px" },
  nav: { flex: 1, padding: "8px 12px", display: "flex", flexDirection: "column", gap: 4, overflowY: "auto" },
  navItem: { display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, color: "var(--nav-text-sub, var(--text-muted))", textDecoration: "none", fontSize: 14, fontWeight: 500, transition: "all 0.3s ease", cursor: "pointer" },
  navItemActive: { background: "rgba(var(--primary-rgb),0.15)", color: "var(--accent)", borderLeft: "3px solid var(--primary)" },
  navIcon: { fontSize: 18 },
  sidebarBottom: { padding: "16px 12px 24px", borderTop: "1px solid var(--border)" },
  userCard: { display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, marginBottom: 8, background: "var(--bg-card)" },
  userAvatar: { width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), var(--secondary))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15, flexShrink: 0 },
  userName: { fontSize: 13, fontWeight: 600, color: "var(--nav-text, var(--text-main))" },
  userEmail: { fontSize: 11, color: "var(--nav-text-sub, var(--text-muted))" },
  logoutBtn: { width: "100%", padding: "9px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "transparent", color: "var(--nav-text-sub, var(--text-muted))", cursor: "pointer", fontSize: 13, textAlign: "left" as const, transition: "all 0.3s ease" },
  main: { flex: 1, overflowY: "auto", minHeight: "100vh" },
};
