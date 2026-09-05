"use client";

import React, { useState } from "react";
import { Smartphone } from "lucide-react";
import { MagicDemoModal } from "@/components/magic-demo-modal";

interface MagicDemoTriggerProps {
  className?: string;
  label?: string;
  children?: React.ReactNode;
}

export function MagicDemoTrigger({
  className,
  label = "Try Interactive Demo",
  children,
}: MagicDemoTriggerProps) {
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsDemoOpen(true)}
        className={
          className ||
          "w-full sm:w-auto px-7 py-4 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white font-semibold text-sm transition border border-white/[0.12] flex items-center justify-center gap-2 backdrop-blur-md active:scale-95 cursor-pointer"
        }
      >
        {children ? (
          children
        ) : (
          <>
            <Smartphone className="w-4 h-4 text-[#0ea5e9]" />
            <span>{label}</span>
          </>
        )}
      </button>

      <MagicDemoModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
      />
    </>
  );
}
