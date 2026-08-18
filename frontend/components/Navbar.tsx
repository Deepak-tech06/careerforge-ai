"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
  const handleScroll = () => {
    setScrolled(window.scrollY > 20);
  };

  window.addEventListener("scroll", handleScroll);

  // ✅ move login check OUTSIDE render cycle safely
  setTimeout(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, 0);

  return () => window.removeEventListener("scroll", handleScroll);
}, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        width: "100%",
        padding: "14px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 1000,
        transition: "all 0.3s ease",

        background: scrolled
          ? "var(--bg-card)"
          : "transparent",

        backdropFilter: scrolled ? "blur(14px)" : "none",

        borderBottom: scrolled
          ? "1px solid var(--border)"
          : "none",
      }}
    >
      {/* LOGO */}
      <link href="/" style={logo}>
        CareerForge AI
      </link>

      {/* NAV LINKS */}
      <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>

        {/* SHOW ONLY AFTER LOGIN */}
        {isLoggedIn && (
          <NavItem
            label="Dashboard"
            href="/dashboard"
            active={pathname === "/dashboard"}
          />
        )}

        {/* BEFORE LOGIN */}
        {!isLoggedIn ? (
          <>
            <a href="/auth" style={loginBtn}>
              Log in
            </a>

            <a
              href="/auth"
              style={signupBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 0 30px rgba(var(--primary-rgb),0.7)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 0 15px rgba(var(--primary-rgb),0.4)";
              }}
            >
              Get started
            </a>
          </>
        ) : (
          /* AFTER LOGIN */
          <button style={logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

/* NAV ITEM */
interface NavItemProps {
  label: string;
  href: string;
  active: boolean;
}

function NavItem({ label, href, active }: NavItemProps) {
  return (
    <a
      href={href}
      style={{
        position: "relative",
        color: active ? "var(--text-main)" : "var(--text-sub)",
        textDecoration: "none",
        fontSize: "14px",
        fontWeight: 500,
        paddingBottom: "4px",
        transition: "color 0.3s ease",
      }}
      onMouseEnter={(e) => {
        const line = e.currentTarget.querySelector("span") as HTMLElement;
        if (line) line.style.width = "100%";
        e.currentTarget.style.color = "var(--text-main)";
      }}
      onMouseLeave={(e) => {
        const line = e.currentTarget.querySelector("span") as HTMLElement;
        if (line && !active) line.style.width = "0%";
        if (!active) e.currentTarget.style.color = "var(--text-sub)";
      }}
    >
      {label}

      <span
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: "2px",
          width: active ? "100%" : "0%",
          background: "linear-gradient(135deg, var(--primary), var(--secondary))",
          transition: "width 0.3s ease",
        }}
      />
    </a>
  );
}

/* STYLES */

const logo = {
  fontWeight: 800,
  fontSize: "20px",
  letterSpacing: "-0.5px",
  background: "linear-gradient(135deg, var(--primary), var(--secondary))",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  textDecoration: "none",
};

const loginBtn = {
  padding: "8px 16px",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  color: "var(--text-main)",
  textDecoration: "none",
  fontSize: "14px",
};

const signupBtn = {
  padding: "8px 18px",
  borderRadius: "8px",
  background: "linear-gradient(135deg, var(--primary), var(--secondary))",
  color: "#fff",
  textDecoration: "none",
  fontSize: "14px",
  fontWeight: 500,
  boxShadow: "0 0 15px rgba(var(--primary-rgb),0.4)",
  transition: "all 0.25s ease",
};

const logoutBtn = {
  padding: "8px 16px",
  borderRadius: "8px",
  border: "1px solid #ff4d4f",
  color: "#ff4d4f",
  background: "transparent",
  cursor: "pointer",
  fontSize: "14px",
};