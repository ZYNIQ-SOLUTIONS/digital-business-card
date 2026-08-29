"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function PageLoader() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, [pathname]);

  if (!loading) return null;

  return (
    <>
      <style>{`
        .sync-loader-wrapper {
          position: fixed;
          inset: 0;
          background-color: #050507;
          z-index: 99999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          transition: opacity 0.3s ease;
        }
        .sync-loader-logo .half-top {
          animation: loader-spin-top 2s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
          transform-origin: 100px 100px;
        }
        .sync-loader-logo .half-bot {
          animation: loader-spin-bot 2s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
          transform-origin: 100px 100px;
        }
        .sync-loader-logo .core-node {
          animation: loader-pulse-core 2s ease-in-out infinite;
          transform-origin: 100px 100px;
        }
        @keyframes loader-spin-top {
          0% { transform: translateY(0) rotate(0deg) scale(1); stroke: #8b5cf6; filter: drop-shadow(0 0 12px rgba(139, 92, 246, 0.6)); }
          50% { transform: translateY(-16px) rotate(180deg) scale(1.1); stroke: #0ea5e9; filter: drop-shadow(0 0 12px rgba(14, 165, 233, 0.6)); }
          100% { transform: translateY(0) rotate(360deg) scale(1); stroke: #8b5cf6; filter: drop-shadow(0 0 12px rgba(139, 92, 246, 0.6)); }
        }
        @keyframes loader-spin-bot {
          0% { transform: translateY(0) rotate(0deg) scale(1); stroke: #10b981; filter: drop-shadow(0 0 12px rgba(16, 185, 129, 0.6)); }
          50% { transform: translateY(16px) rotate(180deg) scale(1.1); stroke: #8b5cf6; filter: drop-shadow(0 0 12px rgba(139, 92, 246, 0.6)); }
          100% { transform: translateY(0) rotate(360deg) scale(1); stroke: #10b981; filter: drop-shadow(0 0 12px rgba(16, 185, 129, 0.6)); }
        }
        @keyframes loader-pulse-core {
          0%, 100% { transform: scale(1); fill: #ffffff; filter: drop-shadow(0 0 0 transparent); }
          50% { transform: scale(1.6); fill: #ffffff; filter: drop-shadow(0 0 8px rgba(255,255,255,0.8)); }
        }
        @keyframes sync-progress {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
      <div className="sync-loader-wrapper animate-in fade-in duration-200">
        <svg
          className="sync-loader-logo"
          style={{ width: "8rem", height: "8rem", marginBottom: "2rem" }}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 200 200"
        >
          <path
            className="half-top"
            d="M 40 100 A 60 60 0 0 1 160 100"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            className="half-bot"
            d="M 160 100 A 60 60 0 0 1 40 100"
            fill="none"
            stroke="#10b981"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <circle className="core-node" cx="100" cy="100" r="12" fill="#ffffff" />
        </svg>
        <div
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontWeight: 600,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            fontSize: "0.75rem",
            color: "#9ca3af",
          }}
        >
          Syncing Identity
        </div>
        <div
          style={{
            width: "12rem",
            height: "2px",
            backgroundColor: "rgba(255,255,255,0.1)",
            borderRadius: "9999px",
            marginTop: "1.5rem",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              background: "linear-gradient(to right, #8b5cf6, #10b981, #0ea5e9)",
              width: "33.333333%",
              borderRadius: "9999px",
              animation: "sync-progress 1s ease-in-out infinite alternate",
            }}
          />
        </div>
      </div>
    </>
  );
}

export default PageLoader;
