"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function PageLoader() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[2px] bg-blue-500 z-[9999] animate-pulse"
      style={{ animationDuration: "0.3s" }}
    />
  );
}

export default PageLoader;
