"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function PageLoader() {
  const [visible, setVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Start showing loader on route navigation
    setVisible(true);
    setIsFadingOut(false);
    
    // Auto fadeout after 500ms
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 500);

    // Completely remove from DOM after fade-out transition (800ms total)
    const removeTimer = setTimeout(() => {
      setVisible(false);
    }, 800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <>
      <style>{`
        .apple-loader-wrapper {
          position: fixed;
          inset: 0;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          z-index: 99999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, sans-serif;
          transition: opacity 320ms cubic-bezier(0.16, 1, 0.3, 1), transform 320ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .apple-loader-wrapper.fade-out {
          opacity: 0;
          transform: scale(1.015);
          pointer-events: none;
        }
        .apple-loader-glow {
          position: absolute;
          width: 280px;
          height: 280px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0, 113, 227, 0.08) 0%, rgba(52, 199, 89, 0.04) 50%, transparent 100%);
          filter: blur(40px);
          z-index: -1;
          animation: apple-glow-pulse 2.5s ease-in-out infinite alternate;
        }
        .apple-loader-card {
          width: 140px;
          height: 140px;
          border-radius: 36px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(0, 0, 0, 0.06);
          box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 0 1px 1px rgba(0, 0, 0, 0.02);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          animation: apple-card-float 3s ease-in-out infinite alternate;
        }
        .apple-loader-logo .half-top {
          animation: apple-spin-top 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          transform-origin: 100px 100px;
        }
        .apple-loader-logo .half-bot {
          animation: apple-spin-bot 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          transform-origin: 100px 100px;
        }
        .apple-loader-logo .core-node {
          animation: apple-pulse-core 2s ease-in-out infinite;
          transform-origin: 100px 100px;
        }
        .apple-loading-text {
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-size: 0.6875rem;
          color: #1D1D1F;
          margin-top: 1.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .apple-loading-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background-color: #0071E3;
          animation: apple-dot-pulse 1.2s ease-in-out infinite alternate;
        }
        .apple-loading-bar-container {
          width: 80px;
          height: 3px;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 999px;
          margin-top: 0.75rem;
          overflow: hidden;
          position: relative;
        }
        .apple-loading-bar {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 40%;
          background: linear-gradient(90deg, #0071E3, #34C759);
          border-radius: 999px;
          animation: apple-bar-slide 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        @keyframes apple-glow-pulse {
          0% { transform: scale(0.9); opacity: 0.6; }
          100% { transform: scale(1.15); opacity: 1; }
        }
        @keyframes apple-card-float {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-4px); }
        }
        @keyframes apple-dot-pulse {
          0% { transform: scale(0.8); opacity: 0.4; }
          100% { transform: scale(1.2); opacity: 1; }
        }
        @keyframes apple-bar-slide {
          0% { left: -40%; width: 30%; }
          50% { left: 30%; width: 60%; }
          100% { left: 100%; width: 30%; }
        }
        @keyframes apple-spin-top {
          0% { transform: translateY(0) rotate(0deg) scale(1); stroke: #0071E3; }
          50% { transform: translateY(-12px) rotate(180deg) scale(1.06); stroke: #5856D6; }
          100% { transform: translateY(0) rotate(360deg) scale(1); stroke: #0071E3; }
        }
        @keyframes apple-spin-bot {
          0% { transform: translateY(0) rotate(0deg) scale(1); stroke: #34C759; }
          50% { transform: translateY(12px) rotate(-180deg) scale(1.06); stroke: #0071E3; }
          100% { transform: translateY(0) rotate(-360deg) scale(1); stroke: #34C759; }
        }
        @keyframes apple-pulse-core {
          0% { transform: scale(0.85); fill: #1D1D1F; }
          50% { transform: scale(1.15); fill: #0071E3; }
          100% { transform: scale(0.85); fill: #1D1D1F; }
        }
      `}</style>

      <div className={`apple-loader-wrapper ${isFadingOut ? 'fade-out' : ''}`}>
        <div className="apple-loader-glow" />
        
        <div className="apple-loader-card">
          <svg className="apple-loader-logo w-14 h-14" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
            <path
              className="half-top"
              d="M 40 100 A 60 60 0 0 1 160 100"
              fill="none"
              stroke="#0071E3"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <path
              className="half-bot"
              d="M 160 100 A 60 60 0 0 1 40 100"
              fill="none"
              stroke="#34C759"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <circle className="core-node" cx="100" cy="100" r="13" fill="#1D1D1F" />
          </svg>
        </div>

        <div className="apple-loading-text">
          <span className="apple-loading-dot" />
          <span>IZN SMART PASS</span>
        </div>

        <div className="apple-loading-bar-container">
          <div className="apple-loading-bar" />
        </div>
      </div>
    </>
  );
}
