"use client";

import { useEffect } from "react";
import { H } from "highlight.run";
import LogRocket from 'logrocket';

export function ErrorTracking() {
  useEffect(() => {
    // LogRocket Integration
    if (typeof window !== "undefined") {
      LogRocket.init('veqwkq/izn-aizen');
    }

    const projectId = process.env.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID;
    if (projectId) {
      H.init(projectId, {
        environment: process.env.NODE_ENV,
        networkRecording: {
          enabled: true,
          recordHeadersAndBody: true,
        },
      });
    }
  }, []);

  return null;
}
