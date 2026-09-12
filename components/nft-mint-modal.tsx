"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  ShieldCheck, 
  Wallet, 
  Zap, 
  Flame, 
  Layers, 
  Copy, 
  Check,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { NetworkingScoreDetails } from "@/lib/networking-score";

interface NftMintModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardId: string;
  card: any;
  scoreDetails: NetworkingScoreDetails;
  existingNft?: any;
  onMintSuccess?: (nft: any) => void;
}

export function NftMintModal({
  isOpen,
  onClose,
  cardId,
  card,
  scoreDetails,
  existingNft,
  onMintSuccess,
}: NftMintModalProps) {
  const [nft, setNft] = useState<any>(existingNft || null);
  const [isMinting, setIsMinting] = useState(false);
  const [mintMode, setMintMode] = useState<"gasless" | "web3">("gasless");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync existing NFT
  useEffect(() => {
    if (existingNft) {
      setNft(existingNft);
    }
  }, [existingNft]);

  if (!isOpen) return null;

  // Connect Web3 wallet if available
  const connectWallet = async () => {
    setErrorMsg(null);
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        });
        if (accounts && accounts[0]) {
          setWalletAddress(accounts[0]);
          setMintMode("web3");
        }
      } catch (err: any) {
        setErrorMsg(err?.message || "Failed to connect wallet.");
      }
    } else {
      setErrorMsg("No Web3 wallet extension found. Switching to 1-Click Gasless Minting.");
      setMintMode("gasless");
    }
  };

  const handleMint = async () => {
    setIsMinting(true);
    setErrorMsg(null);

    try {
      let finalWallet = walletAddress;

      if (mintMode === "web3" && !finalWallet) {
        if (typeof window !== "undefined" && (window as any).ethereum) {
          const accounts = await (window as any).ethereum.request({
            method: "eth_requestAccounts",
          });
          finalWallet = accounts[0];
          setWalletAddress(finalWallet);
        }
      }

      const res = await fetch(`/api/cards/${cardId}/nft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerWallet: finalWallet || undefined,
          isGasless: mintMode === "gasless",
        }),
      });

      const data = await res.json();
      if (!res.ok && data.error) {
        throw new Error(data.error);
      }

      setNft(data.nft);
      if (onMintSuccess) onMintSuccess(data.nft);
    } catch (err: any) {
      setErrorMsg(err?.message || "Minting failed. Please try again.");
    } finally {
      setIsMinting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-xl bg-[#0b0b12] border border-white/[0.12] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-white max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#8b5cf6]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#10b981]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8b5cf6]/15 border border-[#8b5cf6]/30 text-[#c084fc] font-mono text-[11px] font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Base Sepolia Web3 Identity</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Blockchain Card NFT &amp; Score
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            Mint your digital business card as an on-chain Soulbound NFT with a dynamic reputation score that grows with every contact you save.
          </p>
        </div>

        {/* ── NETWORKING SCORE GAUGE CARD ── */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent border border-white/[0.08] space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400">
                Reputation Score
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white tabular-nums tracking-tight">
                  {scoreDetails.score}
                </span>
                <span className="text-xs text-gray-500 font-mono">/ 1,000 pts</span>
              </div>
            </div>

            <div 
              className="px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
              style={{
                backgroundColor: scoreDetails.tierBg,
                borderColor: scoreDetails.tierBorder,
                color: scoreDetails.tierColor,
              }}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>{scoreDetails.tier} Tier</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full h-2.5 bg-white/[0.06] rounded-full overflow-hidden p-0.5">
              <div
                className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-[#8b5cf6] via-[#10b981] to-[#38bdf8]"
                style={{ width: `${Math.min(100, (scoreDetails.score / 1000) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-gray-500">
              <span>Bronze (0)</span>
              <span>Silver (300)</span>
              <span>Gold (600)</span>
              <span>Diamond (850+)</span>
            </div>
          </div>

          {/* Breakdown Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <span className="text-[10px] text-gray-500 block">Profile</span>
              <span className="font-bold text-white tabular-nums">
                {scoreDetails.breakdown.profileCompleteness.current} / 250
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <span className="text-[10px] text-gray-500 block">AI Verified</span>
              <span className="font-bold text-white tabular-nums">
                {scoreDetails.breakdown.identityVerification.current} / 150
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <span className="text-[10px] text-gray-500 block">Connections</span>
              <span className="font-bold text-white tabular-nums">
                {scoreDetails.breakdown.connections.current} / 350
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <span className="text-[10px] text-gray-500 block">Views</span>
              <span className="font-bold text-white tabular-nums">
                {scoreDetails.breakdown.views.current} / 250
              </span>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ── MINTED STATUS OR MINTING FORM ── */}
        {nft ? (
          <div className="p-5 rounded-2xl bg-emerald-500/[0.08] border border-emerald-500/25 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Card Successfully Minted on Base</h3>
                <p className="text-[11px] text-gray-400 font-mono">Soulbound ERC-721 Digital Asset</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
                <span className="text-[10px] font-mono text-gray-500 block uppercase">Token ID</span>
                <span className="font-mono font-bold text-white truncate block">{nft.tokenId}</span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
                <span className="text-[10px] font-mono text-gray-500 block uppercase">Network</span>
                <span className="font-mono font-bold text-emerald-400 block">Base Sepolia (84532)</span>
              </div>
            </div>

            {/* Transaction Hash */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between gap-3 text-xs">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono text-gray-500 block uppercase">Tx Hash</span>
                <span className="font-mono text-gray-300 truncate block text-[11px]">
                  {nft.txHash}
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(nft.txHash)}
                className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-gray-400 hover:text-white transition shrink-0"
                title="Copy Hash"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* View on BaseScan */}
            <div className="pt-1">
              <a
                href={nft.explorerUrl || `https://sepolia.basescan.org/tx/${nft.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-white font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <span>View on BaseScan Explorer</span>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Mint Mode Switcher */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
              <button
                type="button"
                onClick={() => setMintMode("gasless")}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 ${
                  mintMode === "gasless"
                    ? "bg-gradient-to-r from-[#10b981] to-[#0ea5e9] text-white shadow-md"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>1-Click Gasless</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMintMode("web3");
                  if (!walletAddress) connectWallet();
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 ${
                  mintMode === "web3"
                    ? "bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] text-white shadow-md"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Web3 Wallet</span>
              </button>
            </div>

            {mintMode === "gasless" ? (
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Zero Gas Fees • Instant On-Chain Minting</span>
                </div>
                <p className="text-gray-400 leading-relaxed text-[11px]">
                  IZN covers the blockchain gas fees on Base Sepolia. Your card is assigned a unique Soulbound NFT Token ID and immutable metadata hash without requiring crypto or MetaMask.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-[11px]">Connected Wallet:</span>
                  {walletAddress ? (
                    <span className="font-mono text-emerald-400 text-[11px]">
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={connectWallet}
                      className="px-3 py-1 rounded-lg bg-[#8b5cf6]/20 border border-[#8b5cf6]/40 text-[#c084fc] font-semibold text-[10px]"
                    >
                      Connect MetaMask
                    </button>
                  )}
                </div>
                <p className="text-gray-500 text-[10px] leading-relaxed">
                  Sign an authorization message to anchor your card identity directly to your Ethereum/Base wallet address.
                </p>
              </div>
            )}

            {/* Action CTA */}
            <button
              type="button"
              onClick={handleMint}
              disabled={isMinting}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#8b5cf6] via-[#10b981] to-[#0ea5e9] hover:brightness-110 text-white font-bold text-xs shadow-lg transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isMinting ? (
                <span>Minting on Base Sepolia...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Mint Soulbound Card NFT</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default NftMintModal;
