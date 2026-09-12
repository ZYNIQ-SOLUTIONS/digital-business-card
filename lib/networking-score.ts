/**
 * Networking Score & Reputation Engine
 * Calculates a dynamic 0 - 1,000 reputation score based on:
 * - Profile Completeness: up to 250 pts
 * - Verified Identity (AI camera verification): 150 pts
 * - Connections Saved: up to 350 pts (25 pts per verified contact save)
 * - Views & Taps: up to 250 pts (5 pts per card view)
 */

export type NetworkingTier = "Bronze" | "Silver" | "Gold" | "Diamond";

export interface NetworkingScoreDetails {
  score: number;
  tier: NetworkingTier;
  tierColor: string;
  tierBg: string;
  tierBorder: string;
  tierGradient: string;
  nextTier: NetworkingTier | null;
  pointsToNextTier: number;
  breakdown: {
    profileCompleteness: { current: number; max: 250; label: string };
    identityVerification: { current: number; max: 150; label: string };
    connections: { current: number; max: 350; count: number; label: string };
    views: { current: number; max: 250; count: number; label: string };
  };
  recommendations: string[];
}

export function calculateNetworkingScore(card: any, connectionsCount: number = 0): NetworkingScoreDetails {
  let profilePoints = 0;
  const recommendations: string[] = [];

  // Profile Completeness (max 250 pts)
  if (card?.full_name?.trim()) profilePoints += 40;
  else recommendations.push("Add your full name (+40 pts)");

  if (card?.title?.trim()) profilePoints += 40;
  else recommendations.push("Add your job title (+40 pts)");

  if (card?.company?.trim()) profilePoints += 35;
  else recommendations.push("Add your company or firm name (+35 pts)");

  if (card?.avatar_url || card?.profile_image_url) profilePoints += 45;
  else recommendations.push("Upload a profile photo or avatar (+45 pts)");

  if (card?.bio?.trim()) profilePoints += 40;
  else recommendations.push("Write a bio or executive summary (+40 pts)");

  const socialsCount = Array.isArray(card?.social_links)
    ? card.social_links.filter((s: any) => s?.url?.trim()).length
    : (card?.phone || card?.email ? 1 : 0);

  if (socialsCount >= 3) profilePoints += 50;
  else if (socialsCount > 0) profilePoints += 25;
  else recommendations.push("Add 3 or more social/contact links (+50 pts)");

  profilePoints = Math.min(250, profilePoints);

  // Identity Verification (150 pts)
  const isVerified = Boolean(card?.is_verified);
  const verifyPoints = isVerified ? 150 : 0;
  if (!isVerified) {
    recommendations.push("Complete biometric AI identity verification (+150 pts)");
  }

  // Connections (max 350 pts, 25 pts each)
  const connections = Math.max(0, Number(connectionsCount) || 0);
  const connectionPoints = Math.min(350, connections * 25);
  if (connectionPoints < 350) {
    const needed = Math.ceil((350 - connectionPoints) / 25);
    recommendations.push(`Connect with ${needed} more professionals (+${needed * 25} pts)`);
  }

  // Views / Taps (max 250 pts, 5 pts each)
  const views = Math.max(0, Number(card?.views_count) || 0);
  const viewPoints = Math.min(250, views * 5);
  if (viewPoints < 250) {
    recommendations.push("Tap your smart card or share Apple Wallet pass (+5 pts per view)");
  }

  const totalScore = Math.min(1000, profilePoints + verifyPoints + connectionPoints + viewPoints);

  // Tier Assignment
  let tier: NetworkingTier = "Bronze";
  let tierColor = "#cd7f32";
  let tierBg = "rgba(205, 127, 50, 0.12)";
  let tierBorder = "rgba(205, 127, 50, 0.3)";
  let tierGradient = "from-[#cd7f32] to-[#8b4513]";
  let nextTier: NetworkingTier | null = "Silver";
  let pointsToNextTier = 300 - totalScore;

  if (totalScore >= 850) {
    tier = "Diamond";
    tierColor = "#38bdf8";
    tierBg = "rgba(56, 189, 248, 0.15)";
    tierBorder = "rgba(56, 189, 248, 0.4)";
    tierGradient = "from-[#38bdf8] via-[#818cf8] to-[#c084fc]";
    nextTier = null;
    pointsToNextTier = 0;
  } else if (totalScore >= 600) {
    tier = "Gold";
    tierColor = "#f59e0b";
    tierBg = "rgba(245, 158, 11, 0.15)";
    tierBorder = "rgba(245, 158, 11, 0.35)";
    tierGradient = "from-[#f59e0b] to-[#d97706]";
    nextTier = "Diamond";
    pointsToNextTier = 850 - totalScore;
  } else if (totalScore >= 300) {
    tier = "Silver";
    tierColor = "#94a3b8";
    tierBg = "rgba(148, 163, 184, 0.15)";
    tierBorder = "rgba(148, 163, 184, 0.35)";
    tierGradient = "from-[#cbd5e1] to-[#64748b]";
    nextTier = "Gold";
    pointsToNextTier = 600 - totalScore;
  }

  return {
    score: totalScore,
    tier,
    tierColor,
    tierBg,
    tierBorder,
    tierGradient,
    nextTier,
    pointsToNextTier: Math.max(0, pointsToNextTier),
    breakdown: {
      profileCompleteness: { current: profilePoints, max: 250, label: "Profile Completeness" },
      identityVerification: { current: verifyPoints, max: 150, label: "AI Identity Verification" },
      connections: { current: connectionPoints, max: 350, count: connections, label: "Verified Connections" },
      views: { current: viewPoints, max: 250, count: views, label: "Card Taps & Views" },
    },
    recommendations: recommendations.slice(0, 3),
  };
}
