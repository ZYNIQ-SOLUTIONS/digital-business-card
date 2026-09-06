import React from 'react';

export default function Loading() {
  return (
    <>
      <style>{`
        .premium-loader-wrapper {
          position: fixed;
          inset: 0;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          z-index: 99999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, sans-serif;
        }
        .premium-loader-glow {
          position: absolute;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0, 113, 227, 0.06) 0%, rgba(52, 199, 89, 0.03) 50%, transparent 100%);
          filter: blur(50px);
          z-index: -1;
          animation: premium-glow-pulse 3s ease-in-out infinite alternate;
        }
        .premium-loader-card {
          width: 120px;
          height: 120px;
          border-radius: 32px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(0, 0, 0, 0.04);
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.06), 0 0 1px 1px rgba(0, 0, 0, 0.02), inset 0 0 0 1px rgba(255, 255, 255, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          animation: premium-card-float 3s ease-in-out infinite alternate;
        }
        .premium-loader-logo .half-top {
          animation: premium-spin-top 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          transform-origin: 100px 100px;
        }
        .premium-loader-logo .half-bot {
          animation: premium-spin-bot 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          transform-origin: 100px 100px;
        }
        .premium-loader-logo .core-node {
          animation: premium-pulse-core 2s ease-in-out infinite;
          transform-origin: 100px 100px;
        }
        .premium-loading-text {
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          font-size: 0.65rem;
          color: #1D1D1F;
          margin-top: 2rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          opacity: 0.8;
        }
        .premium-loading-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background-color: #0071E3;
          animation: premium-dot-pulse 1.2s ease-in-out infinite alternate;
        }
        .premium-loading-bar-container {
          width: 100px;
          height: 2px;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 999px;
          margin-top: 1rem;
          overflow: hidden;
          position: relative;
        }
        .premium-loading-bar {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 30%;
          background: linear-gradient(90deg, #0071E3, #34C759);
          border-radius: 999px;
          animation: premium-bar-slide 1.5s cubic-bezier(0.65, 0, 0.35, 1) infinite;
        }

        @keyframes premium-glow-pulse {
          0% { transform: scale(0.9); opacity: 0.5; }
          100% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes premium-card-float {
          0% { transform: translateY(0px) scale(1); box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.06), 0 0 1px 1px rgba(0, 0, 0, 0.02); }
          100% { transform: translateY(-8px) scale(1.02); box-shadow: 0 30px 50px -15px rgba(0, 0, 0, 0.1), 0 0 1px 1px rgba(0, 0, 0, 0.02); }
        }
        @keyframes premium-dot-pulse {
          0% { transform: scale(0.8); opacity: 0.3; }
          100% { transform: scale(1.5); opacity: 1; }
        }
        @keyframes premium-bar-slide {
          0% { left: -30%; width: 20%; }
          50% { left: 40%; width: 50%; }
          100% { left: 100%; width: 20%; }
        }
        @keyframes premium-spin-top {
          0% { transform: translateY(0) rotate(0deg) scale(1); stroke: #0071E3; }
          50% { transform: translateY(-10px) rotate(180deg) scale(1.05); stroke: #5856D6; }
          100% { transform: translateY(0) rotate(360deg) scale(1); stroke: #0071E3; }
        }
        @keyframes premium-spin-bot {
          0% { transform: translateY(0) rotate(0deg) scale(1); stroke: #34C759; }
          50% { transform: translateY(10px) rotate(-180deg) scale(1.05); stroke: #0071E3; }
          100% { transform: translateY(0) rotate(-360deg) scale(1); stroke: #34C759; }
        }
        @keyframes premium-pulse-core {
          0% { transform: scale(0.9); fill: #1D1D1F; }
          50% { transform: scale(1.1); fill: #0071E3; }
          100% { transform: scale(0.9); fill: #1D1D1F; }
        }
      `}</style>

      <div className="premium-loader-wrapper">
        <div className="premium-loader-glow" />
        
        <div className="premium-loader-card">
          <svg className="premium-loader-logo w-12 h-12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
            <path
              className="half-top"
              d="M 40 100 A 60 60 0 0 1 160 100"
              fill="none"
              stroke="#0071E3"
              strokeWidth="16"
              strokeLinecap="round"
            />
            <path
              className="half-bot"
              d="M 160 100 A 60 60 0 0 1 40 100"
              fill="none"
              stroke="#34C759"
              strokeWidth="16"
              strokeLinecap="round"
            />
            <circle className="core-node" cx="100" cy="100" r="14" fill="#1D1D1F" />
          </svg>
        </div>

        <div className="premium-loading-text">
          <span className="premium-loading-dot" />
          <span>IZN SMART PASS</span>
        </div>

        <div className="premium-loading-bar-container">
          <div className="premium-loading-bar" />
        </div>
      </div>
    </>
  );
}
