"use client";

import React, { useState, useEffect } from "react";

export interface AvatarDisplayProps {
  avatarId?: string | null;
  fallbackUrl?: string | null;
  initials?: string | null;
  alt?: string;
  className?: string;
  imageClassName?: string;
  initialsClassName?: string;
}

export function AvatarDisplay({
  avatarId,
  fallbackUrl,
  initials = "IK",
  alt = "Profile Avatar",
  className = "w-full h-full flex items-center justify-center relative",
  imageClassName = "w-full h-full object-cover",
  initialsClassName = "text-3xl font-bold",
}: AvatarDisplayProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(avatarId));
  const [avatarLoadError, setAvatarLoadError] = useState<boolean>(false);
  const [fallbackLoadError, setFallbackLoadError] = useState<boolean>(false);

  useEffect(() => {
    if (!avatarId) {
      setAvatarUrl(null);
      setIsLoading(false);
      setAvatarLoadError(false);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    async function fetchZavatar() {
      setIsLoading(true);
      setAvatarLoadError(false);

      try {
        const response = await fetch(`/api/zavatar/${avatarId}`, {
          signal: controller.signal,
          headers: {
            Accept: "application/json, image/*",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch avatar metadata: HTTP ${response.status}`);
        }

        const contentType = response.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
          const data = await response.json();
          // Extract mid-LOD PNG (256px) or fallback to available asset URL
          const midLodUrl =
            data.assetUrls?.mid ||
            data.assetUrls?.high ||
            data.assetUrls?.low ||
            data.assetUrl ||
            data.storage_url ||
            data.url;

          if (isMounted) {
            if (midLodUrl) {
              setAvatarUrl(midLodUrl);
            } else {
              setAvatarLoadError(true);
            }
          }
        } else if (contentType.includes("image/")) {
          // Direct image response
          if (isMounted) {
            setAvatarUrl(`/api/zavatar/${avatarId}`);
          }
        } else {
          // Attempt fallback parse as JSON
          try {
            const data = await response.json();
            const resolved = data.assetUrls?.mid || data.assetUrl || data.url;
            if (isMounted) {
              if (resolved) setAvatarUrl(resolved);
              else setAvatarLoadError(true);
            }
          } catch {
            if (isMounted) setAvatarLoadError(true);
          }
        }
      } catch (err: any) {
        if (err.name !== "AbortError" && isMounted) {
          setAvatarLoadError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchZavatar();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [avatarId]);

  // Determine active source
  const hasValidZavatar = Boolean(avatarId && avatarUrl && !avatarLoadError);
  const effectiveFallbackUrl = !fallbackLoadError ? fallbackUrl : null;

  return (
    <div className={className} data-testid="avatar-display">
      {hasValidZavatar ? (
        <img
          src={avatarUrl!}
          alt={alt}
          className={`${imageClassName} transition-opacity duration-300 ${
            isLoading ? "opacity-70" : "opacity-100"
          }`}
          onError={() => setAvatarLoadError(true)}
        />
      ) : effectiveFallbackUrl ? (
        <img
          src={effectiveFallbackUrl}
          alt={alt}
          className={`${imageClassName} transition-opacity duration-300`}
          onError={() => setFallbackLoadError(true)}
        />
      ) : (
        <span className={initialsClassName}>
          {initials || "IK"}
        </span>
      )}
    </div>
  );
}

export default AvatarDisplay;
