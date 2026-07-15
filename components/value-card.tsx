"use client"

import { useState } from "react"
import { Item, TIER_COLORS, DEMAND_COLORS, SITE_COLORS } from "@/lib/types"
import { ItemDetailModal } from "./item-detail-modal"
import Image from "next/image"

interface ValueCardProps {
  item: Item
}

export function ValueCard({ item }: ValueCardProps) {
  const tierColor = TIER_COLORS[item.tier]
  const demandColor = item.demand ? DEMAND_COLORS[item.demand] : DEMAND_COLORS.none
  const glitchedColors = SITE_COLORS.glitched
  const cursedColors = SITE_COLORS.cursed
  const [isGlitched, setIsGlitched] = useState(false)
  const [isCursed, setIsCursed] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const getDisplayValue = () => {
    if (isGlitched && isCursed && item.gcVal !== undefined) return item.gcVal
    if (isCursed && item.cursedVal !== undefined) return item.cursedVal
    if (isGlitched && item.glitchedVal !== undefined) return item.glitchedVal
    return item.value
  }

  const getDisplayAC = () => {
    if (isGlitched && isCursed && item.gcAC !== undefined) return item.gcAC
    if (isCursed && item.cursedAC !== undefined) return item.cursedAC
    if (isGlitched && item.glitchedAC !== undefined) return item.glitchedAC
    return item.ac
  }

  const hasGlitchedData = item.glitchedVal !== undefined || item.glitchedAC !== undefined
  const hasCursedData = item.cursedVal !== undefined || item.cursedAC !== undefined

  return (
    <>
      <div 
        className="bg-card border border-border flex flex-col cursor-pointer transition-all"
        onClick={() => setShowModal(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          borderColor: isHovered ? tierColor : undefined,
          boxShadow: isHovered ? `0 0 10px ${tierColor}40` : undefined
        }}
      >
        {/* Tier color bar at top */}
        <div className="h-1 w-full" style={{ backgroundColor: tierColor }} />
        
        <div className="p-2 sm:p-3 min-w-0">
          {/* Header with tier name and demand indicator */}
          <div className="flex items-center justify-between mb-3">
            <span 
              className="text-[10px] sm:text-xs font-bold uppercase tracking-wider"
              style={{ color: tierColor }}
            >
              {item.tier}
            </span>
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3"
                style={{ backgroundColor: tierColor }}
              />
              <span 
                className="text-[10px] sm:text-xs px-2 py-0.5 font-bold flex-shrink-0"
                style={{ backgroundColor: demandColor, color: "#fff" }}
              >
                {item.demand ? item.demand.charAt(0).toUpperCase() + item.demand.slice(1) : "None"}
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
          <h3 className="font-semibold text-foreground text-xs sm:text-sm mb-1 truncate">
            {item.name}
          </h3>

          {/* AC value and toggle buttons row */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {getDisplayAC() !== undefined && (
              <p className="text-[10px] sm:text-xs text-primary">
                AC: {getDisplayAC()}
              </p>
            )}
            
            {/* Toggle buttons - G for glitched, C for cursed */}
            <div className="flex items-center gap-1 ml-auto" onClick={(e) => e.stopPropagation()}>
              {hasGlitchedData && (
                <button
                  onClick={() => setIsGlitched(!isGlitched)}
                  className="sm:w-5 sm:h-5 w-6 h-6 text-[10px] sm:text-xs font-bold transition-colors flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: isGlitched ? glitchedColors.activeBg : glitchedColors.inactiveBg,
                    color: isGlitched ? glitchedColors.activeText : glitchedColors.inactiveText,
                  }}
                  title="Toggle Glitched"
                >
                  G
                </button>
              )}
              {hasCursedData && (
                <button
                  onClick={() => setIsCursed(!isCursed)}
                  className="sm:w-5 sm:h-5 w-6 h-6 text-[10px] sm:text-xs font-bold transition-colors flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: isCursed ? cursedColors.activeBg : cursedColors.inactiveBg,
                    color: isCursed ? cursedColors.activeText : cursedColors.inactiveText,
                  }}
                  title="Toggle Cursed"
                >
                  C
                </button>
              )}
            </div>
          </div>

          {/* Value */}
          <p className="text-xl font-bold text-foreground">
            {getDisplayValue()}
          </p>

          {/* Status badges */}
          <div className="flex flex-wrap gap-1 mt-2">
            {item.glitchedOff && (
              <div className="flex items-center gap-1 text-purple-900 text-xs bg-secondary px-2 py-0.5" style={{ backgroundColor: glitchedColors.inactiveBg, color: glitchedColors.inactiveText }}>
                <span className="font-bold">G</span>
                OFF
              </div>
            )}
            {item.cursedOff && (
              <div className="flex items-center gap-1 text-yellow-800 text-xs bg-secondary px-2 py-0.5" style={{ backgroundColor: cursedColors.inactiveBg, color: cursedColors.inactiveText }}>
                <span className="font-bold">C</span>
                OFF
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showModal && (
        <ItemDetailModal 
          item={item} 
          isGlitched={isGlitched}
          isCursed={isCursed}
          onClose={() => setShowModal(false)} 
        />
      )}
    </>
  )
}
