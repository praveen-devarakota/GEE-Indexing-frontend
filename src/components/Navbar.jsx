import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/homepage.css";

import isroLogo from "/isro-logo.webp";
import saheLogo from "/sahe-logo.png";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate("/");
  };

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const saheBrand = (
    <>
      <span style={{ fontFamily: "Georgia, serif" }}>
        Siddhartha Academy
        <br />
        <small>of Higher Education</small>
      </span>
      <img
        className="institution-logo sahe-logo"
        src={saheLogo}
        alt="SAHE logo"
      />
    </>
  );

  return (
    <nav className="nav" aria-label="Primary navigation">
      {/* Left brand — ISRO */}
      <div className="brand">
        <img
          className="institution-logo isro-logo"
          src={isroLogo}
          alt="ISRO logo"
        />
        <span style={{ fontFamily: "Georgia, serif" }}>
          ISRO
          <br />
          <small>Indian Space Research Organisation</small>
        </span>
      </div>

      {/* Centre title */}
      <div className="nav-title">
        Jal Sanchay
        <small>Geospatial Intelligence Platform</small>
      </div>

      {/* Right brand — SAHE (dropdown when logged in) */}
      {user ? (
        <div className="user-menu" ref={menuRef}>
          <button
            type="button"
            className="brand right user-menu-trigger"
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={open}
          >
            {saheBrand}
            <svg
              className={`menu-arrow ${open ? "open" : ""}`}
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {open && (
            <div className="user-dropdown" role="menu">
              <button
                type="button"
                className="dropdown-item"
                role="menuitem"
                onClick={handleLogout}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="15"
                  height="15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="brand right">{saheBrand}</div>
      )}
    </nav>
  );
}