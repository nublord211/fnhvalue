"use client"

import { Tier, TIER_COLORS, TIER_ORDER } from "@/lib/types"

interface TierTabsProps {
  activeTier: Tier | "all"
  onTierChange: (tier: Tier | "all") => void
}

export function TierTabs({ activeTier, onTierChange }: TierTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <button
        onClick={() => onTierChange("all")}
        className={`px-4 py-2 text-sm font-medium transition-colors ${
          activeTier === "all"
            ? "bg-foreground text-background"
            : "bg-secondary text-foreground hover:bg-muted"
        }`}
      >
        All
      </button>
      {TIER_ORDER.map((tier) => (
        <button
          key={tier}
          onClick={() => onTierChange(tier)}
          className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
            activeTier === tier
              ? "text-background"
              : "bg-secondary hover:bg-muted"
          }`}
          style={{
            backgroundColor: activeTier === tier ? TIER_COLORS[tier] : undefined,
            color: activeTier === tier ? "#ffffff" : TIER_COLORS[tier],
          }}
        >
          {tier}
        </button>
      ))}
    </div>
  )
}
