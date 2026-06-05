"use client"

import { useState } from "react"
import { Tier, TIER_COLORS, TIER_ORDER } from "@/lib/types"

interface TierTabsProps {
  activeTier: Tier | "all"
  onTierChange: (tier: Tier | "all") => void
}

export function TierTabs({ activeTier, onTierChange }: TierTabsProps) {
  const [hoveredTier, setHoveredTier] = useState<Tier | "all" | null>(null)

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <button
        onClick={() => onTierChange("all")}
        onMouseEnter={() => setHoveredTier("all")}
        onMouseLeave={() => setHoveredTier(null)}
        className={`px-4 py-2 text-sm font-medium transition-colors ${
          activeTier === "all"
            ? "bg-foreground text-background"
            : "bg-secondary text-foreground"
        }`}
        style={{
          backgroundColor: 
            activeTier === "all" 
              ? undefined 
              : hoveredTier === "all" 
                ? "#ffffff20" 
                : undefined,
        }}
      >
        All
      </button>
      {TIER_ORDER.map((tier) => (
        <button
          key={tier}
          onClick={() => onTierChange(tier)}
          onMouseEnter={() => setHoveredTier(tier)}
          onMouseLeave={() => setHoveredTier(null)}
          className={`px-4 py-2 text-sm font-medium capitalize transition-colors`}
          style={{
            backgroundColor: 
              activeTier === tier 
                ? TIER_COLORS[tier] 
                : hoveredTier === tier 
                  ? `${TIER_COLORS[tier]}40`
                  : "#2a2a2a",
            color: activeTier === tier ? "#ffffff" : TIER_COLORS[tier],
            borderColor: hoveredTier === tier ? TIER_COLORS[tier] : "transparent",
            borderWidth: "1px",
            borderStyle: "solid",
          }}
        >
          {tier}
        </button>
      ))}
    </div>
  )
}
