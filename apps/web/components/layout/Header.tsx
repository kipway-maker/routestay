"use client";

import { useState, useEffect } from "react";
import { MapPin, Menu, X } from "lucide-react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#features", label: "Fonctionnalités" },
    { href: "#how-it-works", label: "Comment ça marche" },
    { href: "#", label: "Tarifs" },
  ];

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: scrolled ? "rgba(248, 247, 244, 0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(26, 26, 46, 0.08)" : "1px solid transparent",
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "64px",
        }}
      >
        {/* Logo */}
        <a href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #FF6240, #FF8A6E)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(255, 98, 64, 0.35)",
            }}
          >
            <MapPin size={18} color="white" strokeWidth={2.5} />
          </div>
          <span
            style={{
              fontFamily: "var(--font-nunito), sans-serif",
              fontWeight: 800,
              fontSize: "20px",
              color: "var(--text)",
              letterSpacing: "-0.3px",
            }}
          >
            Route<span style={{ color: "var(--brand)" }}>Stay</span>
          </span>
        </a>

        {/* Desktop Nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: "32px" }} className="hidden-mobile">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontWeight: 500,
                fontSize: "15px",
                color: "var(--text-muted)",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--text)")}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--text-muted)")}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <a
            href="#"
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontWeight: 600,
              fontSize: "14px",
              color: "var(--text-muted)",
              display: "none",
            }}
            className="show-desktop"
          >
            Connexion
          </a>
          <a
            href="#hero-search"
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontWeight: 700,
              fontSize: "14px",
              color: "white",
              background: "linear-gradient(135deg, #FF6240, #FF8A6E)",
              padding: "10px 20px",
              borderRadius: "12px",
              boxShadow: "0 4px 14px rgba(255, 98, 64, 0.3)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(255, 98, 64, 0.4)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(255, 98, 64, 0.3)";
            }}
          >
            Commencer
          </a>

          {/* Mobile burger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              color: "var(--text)",
              display: "none",
            }}
            className="show-mobile"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          style={{
            backgroundColor: "rgba(248, 247, 244, 0.98)",
            backdropFilter: "blur(12px)",
            borderTop: "1px solid rgba(26, 26, 46, 0.08)",
            padding: "16px 24px 24px",
          }}
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: "block",
                fontFamily: "var(--font-inter), sans-serif",
                fontWeight: 500,
                fontSize: "16px",
                color: "var(--text)",
                padding: "12px 0",
                borderBottom: "1px solid rgba(26, 26, 46, 0.06)",
              }}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .hidden-mobile { display: flex !important; }
          .show-desktop { display: block !important; }
        }
        @media (max-width: 767px) {
          .show-mobile { display: block !important; }
        }
      `}</style>
    </header>
  );
}
