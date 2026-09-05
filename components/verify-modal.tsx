"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Camera, 
  RefreshCw, 
  CheckCircle2, 
  ShieldCheck, 
  X, 
  Loader2, 
  Sparkles, 
  AlertCircle,
  FlipHorizontal
} from "lucide-react";
import { VerifiedBadgeIcon } from "@/components/icons";

interface VerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (data: { verified: boolean; confidence: number; badge: string; reason: string }) => void;
  cardId?: string;
  fullName?: string;
}

export function VerifyModal({
  isOpen,
  onClose,
  onVerified,
  cardId,
  fullName = "User",
}: VerifyModalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    confidence: number;
    reason: string;
    badge: string;
  } | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen && !capturedPhoto && !verificationResult) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode, capturedPhoto, verificationResult]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError(
        err.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access in your browser settings to proceed with AI verification."
          : "Unable to access camera on this device. You can still test with simulated verification."
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleCaptureCountdown = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          captureFrame();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // If front facing, mirror horizontally
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedPhoto(dataUrl);
    stopCamera();
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    setVerificationResult(null);
    setCameraError(null);
  };

  const handleToggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const handleVerifyWithAi = async () => {
    if (!capturedPhoto) return;
    setIsVerifying(true);

    try {
      const res = await fetch("/api/ai/verify-identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: capturedPhoto,
          cardId,
          fullName,
        }),
      });

      const data = await res.json();
      if (data.success && data.verified) {
        setVerificationResult({
          verified: true,
          confidence: data.confidence || 98,
          reason: data.reason || "Live photo identity confirmed with high confidence.",
          badge: data.badge || "ai_verified_executive",
        });
        onVerified({
          verified: true,
          confidence: data.confidence || 98,
          badge: data.badge || "ai_verified_executive",
          reason: data.reason || "AI Identity verified.",
        });
      } else {
        const failureResult = {
          verified: false,
          confidence: data.confidence || 0,
          reason: data.reason || data.error || "Could not confirm identity. Please try again in good lighting.",
          badge: "unverified",
        };
        setVerificationResult(failureResult);
        onVerified(failureResult);
      }
    } catch (err) {
      console.error("AI verification failed:", err);
      // Fail closed — do NOT auto-approve on error
      const errorResult = {
        verified: false,
        confidence: 0,
        reason: "Verification service temporarily unavailable. Please try again.",
        badge: "unverified",
      };
      setVerificationResult(errorResult);
      onVerified(errorResult);
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl border border-black/[0.08] flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-black/[0.06] flex items-center justify-between bg-[#FBFBFD]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0071E3] flex items-center justify-center shadow-2xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1D1D1F]">AI Identity Verification</h2>
              <p className="text-[11px] text-[#86868B]">Powered by Gemini 2.5 Flash Multimodal Vision</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-neutral-200 text-neutral-500 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder / Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          
          {/* Result State */}
          {verificationResult ? (
            <div className="text-center py-4 space-y-4 animate-in zoom-in-95 duration-200">
              {verificationResult.verified ? (
                <>
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-500/30 flex items-center justify-center text-green-600 shadow-md">
                      <VerifiedBadgeIcon className="w-10 h-10 text-green-500" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0071E3] text-white flex items-center justify-center shadow-xs">
                      <Sparkles className="w-3.5 h-3.5 fill-white" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-[#1D1D1F]">Identity Verified &amp; Approved!</h3>
                    <p className="text-xs text-[#86868B]">
                      {verificationResult.reason}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-green-50/80 border border-green-200 text-left flex items-center justify-between text-xs text-green-900">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                      <span className="font-medium">Confidence Score</span>
                    </div>
                    <span className="font-mono font-bold text-green-700 bg-green-200/60 px-2 py-0.5 rounded-full">
                      {verificationResult.confidence}%
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#F5F5F7] text-left text-[11px] text-neutral-600 space-y-1">
                    <span className="font-semibold block text-[#1D1D1F]">Verified Benefits:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-[#86868B]">
                      <li>Official Verified Shield badge displayed on your live card</li>
                      <li>Elevated trust ranking for enterprise networking</li>
                      <li>Biometric liveness confirmed</li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-3.5 rounded-2xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold shadow-xs transition"
                  >
                    Done &amp; Apply Verified Badge
                  </button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-red-600">Verification Inconclusive</h3>
                    <p className="text-xs text-[#86868B]">{verificationResult.reason}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="w-full py-3 rounded-2xl bg-black text-white text-xs font-semibold hover:bg-neutral-800 transition"
                  >
                    Try Again
                  </button>
                </>
              )}
            </div>
          ) : capturedPhoto ? (
            /* Snapshot Review State */
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden aspect-4/3 bg-black border border-black/10 shadow-inner">
                <img
                  src={capturedPhoto}
                  alt="Captured Selfie"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-mono">
                  Live Snapshot
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleRetake}
                  disabled={isVerifying}
                  className="w-1/3 py-3 rounded-2xl bg-[#F5F5F7] hover:bg-neutral-200 text-xs font-semibold text-[#1D1D1F] flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retake</span>
                </button>

                <button
                  type="button"
                  onClick={handleVerifyWithAi}
                  disabled={isVerifying}
                  className="w-2/3 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98] disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Gemini AI Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Verify Live Photo with AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Live Camera Viewfinder State */
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden aspect-4/3 bg-neutral-900 border border-black/10 flex items-center justify-center">
                {cameraError ? (
                  <div className="p-6 text-center text-white space-y-3">
                    <Camera className="w-10 h-10 mx-auto text-neutral-400 opacity-60" />
                    <p className="text-xs text-neutral-300 leading-relaxed">{cameraError}</p>
                    <button
                      type="button"
                      onClick={() => {
                        // Create mock photo for testing if camera isn't accessible
                        const canvas = document.createElement("canvas");
                        canvas.width = 640;
                        canvas.height = 480;
                        const ctx = canvas.getContext("2d");
                        if (ctx) {
                          ctx.fillStyle = "#1D1D1F";
                          ctx.fillRect(0, 0, 640, 480);
                          ctx.fillStyle = "#0071E3";
                          ctx.beginPath();
                          ctx.arc(320, 240, 100, 0, Math.PI * 2);
                          ctx.fill();
                          ctx.fillStyle = "#FFFFFF";
                          ctx.font = "bold 32px sans-serif";
                          ctx.textAlign = "center";
                          ctx.fillText(fullName || "Executive", 320, 250);
                        }
                        setCapturedPhoto(canvas.toDataURL("image/jpeg"));
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-medium backdrop-blur-md"
                    >
                      Use Test Photo
                    </button>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
                    />

                    {/* Face Guide Oval */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-48 h-60 rounded-[50%] border-2 border-dashed border-white/60 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center">
                        <div className="text-[11px] text-white/80 font-medium bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-xs">
                          Align Face Here
                        </div>
                      </div>
                    </div>

                    {/* Countdown Overlay */}
                    {countdown !== null && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center z-10 animate-in zoom-in-75">
                        <span className="text-6xl font-extrabold text-white drop-shadow-md">
                          {countdown}
                        </span>
                      </div>
                    )}

                    {/* Camera Flip Button */}
                    <button
                      type="button"
                      onClick={handleToggleCamera}
                      className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition"
                      title="Flip camera"
                    >
                      <FlipHorizontal className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              <canvas ref={canvasRef} className="hidden" />

              {!cameraError && (
                <div className="flex items-center justify-center pt-2">
                  <button
                    type="button"
                    onClick={handleCaptureCountdown}
                    disabled={countdown !== null}
                    className="py-3 px-6 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white text-xs font-bold flex items-center gap-2 shadow-md transition disabled:opacity-50 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Take Live Photo</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Note */}
        <div className="p-3 bg-neutral-50 border-t border-black/[0.04] text-center text-[10px] text-[#86868B] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
          <span>Biometric data is processed ephemerally and never stored or shared.</span>
        </div>

      </div>
    </div>
  );
}
