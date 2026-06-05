"use client"

import { Item, TIER_COLORS } from "@/lib/types"
import Image from "next/image"

interface ValueCardProps {
  item: Item
}

export function ValueCard({ item }: ValueCardProps) {
  const tierColor = TIER_COLORS[item.tier]

  return (
    <div className="bg-card border border-border flex flex-col">
      {/* Tier color bar at top */}
      <div className="h-1 w-full" style={{ backgroundColor: tierColor }} />
      
      <div className="p-3">
        {/* Header with tier name and circle indicator */}
        <div className="flex items-center justify-between mb-3">
          <span 
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: tierColor }}
          >
            {item.tier}
          </span>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: tierColor }}
            />
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5">
              N/A
            </span>
          </div>
        </div>

        {/* Image container */}
        <div className="bg-secondary aspect-square flex items-center justify-center mb-3 overflow-hidden">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              width={150}
              height={150}
              className="object-contain w-full h-full"
            />
          ) : (
            <div className="w-20 h-20 bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-xs">No Image</span>
            </div>
          )}
        </div>

        {/* Item name */}
        <h3 className="font-semibold text-foreground text-sm mb-1 truncate">
          {item.name}
        </h3>

        {/* AC value */}
        {item.ac !== undefined && (
          <p className="text-xs text-primary mb-1">
            AC: {item.ac}
          </p>
        )}

        {/* Value */}
        <p className="text-xl font-bold text-foreground">
          {item.value}
        </p>

        {/* Glitched Off badge */}
        {item.glitchedOff && (
          <div className="mt-2 flex items-center gap-1.5 text-muted-foreground text-xs bg-secondary px-2 py-1 w-fit">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            GLITCHED OFF
          </div>
        )}
      </div>
    </div>
  )
}
