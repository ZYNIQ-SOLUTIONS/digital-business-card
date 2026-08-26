"use client";

import { useEffect, useState } from "react";


export function PageLoader() {
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    // Show loader for a brief moment on initial load
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []); // Only run on initial mount

  if (!loading) return null;

  return (
    <div id="pageLoader" className="page-loader">
      <svg className="loader-logo w-32 h-32 mb-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <path className="half-top" d="M 40 100 A 60 60 0 0 1 160 100" fill="none" stroke="#8b5cf6" strokeWidth="12" strokeLinecap="round"/>
        <path className="half-bot" d="M 160 100 A 60 60 0 0 1 40 100" fill="none" stroke="#ec4899" strokeWidth="12" strokeLinecap="round"/>
        <circle className="core-node" cx="100" cy="100" r="12" fill="#ffffff"/>
      </svg>
      <div className="font-[Space_Mono] font-semibold tracking-[0.3em] uppercase text-xs text-gray-400">
        Syncing Identity
      </div>
      <div className="w-48 h-[2px] bg-white/10 rounded-full mt-6 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-violet-500 via-pink-500 to-sky-400 w-1/3 animate-progress-loader rounded-full"></div>
      </div>
    </div>
  );
}
