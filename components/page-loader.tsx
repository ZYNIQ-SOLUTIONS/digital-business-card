"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function PageLoader() {
  const [visible, setVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Start showing loader
    setVisible(true);
    setIsFadingOut(false);
    
    // Auto fadeout after 600ms
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 600);

    // Completely remove from DOM after fade-out transition (900ms total)
    const removeTimer = setTimeout(() => {
      setVisible(false);
    }, 900);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [pathname]);

  if (!visible) return null;

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
          transition: opacity 300ms cubic-bezier(0.4, 0, 0.2, 1), transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        .sync-loader-wrapper.fade-out {
          opacity: 0;
          transform: scale(1.02);
          pointer-events: none;
        }
        .loader-glow {
          position: absolute;
          width: 250px;
          height: 250px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(16, 185, 129, 0.05) 50%, transparent 100%);
          filter: blur(40px);
          z-index: -1;
          animation: glow-pulse 3s ease-in-out infinite alternate;
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
        .loading-text {
          font-family: var(--font-mono), monospace;
          font-weight: 600;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          font-size: 0.75rem;
          color: #9ca3af;
          margin-top: 2rem;
          animation: text-pulse 1.5s ease-in-out infinite alternate;
        }
        @keyframes glow-pulse {
          0% { transform: scale(0.9); opacity: 0.8; }
          100% { transform: scale(1.1); opacity: 1.2; }
        }
        @keyframes text-pulse {
          0% { opacity: 0.6; }
          100% { opacity: 1; }
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
      <div className={`sync-loader-wrapper ${isFadingOut ? "fade-out" : ""}`}>
        <div className="loader-glow" />
        <svg
          className="sync-loader-logo animate-in zoom-in-95 duration-300"
          style={{ width: "8rem", height: "8rem" }}
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
        
        <div className="loading-text">
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
            position: "relative",
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
