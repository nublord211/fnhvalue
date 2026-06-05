"use client"

import { Item, TIER_COLORS } from "@/lib/types"
import { X } from "lucide-react"

interface ItemDetailModalProps {
  item: Item
  isGlitched: boolean
  isCursed: boolean
  onClose: () => void
}

export function ItemDetailModal({ item, isGlitched, isCursed, onClose }: ItemDetailModalProps) {
  const tierColor = TIER_COLORS[item.tier]

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

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-card border border-border max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header color bar */}
        <div className="h-2 w-full" style={{ backgroundColor: tierColor }} />
        
        <div className="p-6">
          {/* Close button */}
          <div className="flex items-center justify-between mb-4">
            <span 
              className="text-sm font-bold uppercase tracking-wider"
              style={{ color: tierColor }}
            >
              {item.tier}
            </span>
            <button 
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Item name */}
          <h2 className="text-2xl font-bold text-foreground mb-6">{item.name}</h2>

          {/* Info grid */}
          <div className="space-y-4">
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Tier</span>
              <span className="text-foreground uppercase" style={{ color: tierColor }}>{item.tier}</span>
            </div>

            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Value</span>
              <span className="text-foreground font-bold">{getDisplayValue()}</span>
            </div>

            {getDisplayAC() !== undefined && (
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">AC</span>
                <span className="text-primary font-bold">{getDisplayAC()}</span>
              </div>
            )}

            {item.era && (
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Era</span>
                <span className="text-foreground">{item.era}</span>
              </div>
            )}

            {item.releaseDate && (
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Release Date</span>
                <span className="text-foreground">{item.releaseDate}</span>
              </div>
            )}

            {/* Base Values Section */}
            <div className="pt-2">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Base Values</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-secondary p-2">
                  <span className="text-muted-foreground block">Base Value</span>
                  <span className="text-foreground font-bold">{item.value}</span>
                </div>
                {item.ac !== undefined && (
                  <div className="bg-secondary p-2">
                    <span className="text-muted-foreground block">Base AC</span>
                    <span className="text-foreground font-bold">{item.ac}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Glitched Values */}
            {(item.glitchedVal !== undefined || item.glitchedAC !== undefined) && (
              <div className="pt-2">
                <h3 className="text-sm font-semibold text-yellow-500 mb-3 uppercase tracking-wider">Glitched Values</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {item.glitchedVal !== undefined && (
                    <div className="bg-secondary p-2">
                      <span className="text-muted-foreground block">Glitched Value</span>
                      <span className="text-yellow-500 font-bold">{item.glitchedVal}</span>
                    </div>
                  )}
                  {item.glitchedAC !== undefined && (
                    <div className="bg-secondary p-2">
                      <span className="text-muted-foreground block">Glitched AC</span>
                      <span className="text-yellow-500 font-bold">{item.glitchedAC}</span>
                    </div>
                  )}
                </div>
                {item.glitchedOff && (
                  <p className="text-xs text-muted-foreground mt-2">Glitched: OFF</p>
                )}
              </div>
            )}

            {/* Cursed Values */}
            {(item.cursedVal !== undefined || item.cursedAC !== undefined) && (
              <div className="pt-2">
                <h3 className="text-sm font-semibold text-red-500 mb-3 uppercase tracking-wider">Cursed Values</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {item.cursedVal !== undefined && (
                    <div className="bg-secondary p-2">
                      <span className="text-muted-foreground block">Cursed Value</span>
                      <span className="text-red-500 font-bold">{item.cursedVal}</span>
                    </div>
                  )}
                  {item.cursedAC !== undefined && (
                    <div className="bg-secondary p-2">
                      <span className="text-muted-foreground block">Cursed AC</span>
                      <span className="text-red-500 font-bold">{item.cursedAC}</span>
                    </div>
                  )}
                </div>
                {item.cursedOff && (
                  <p className="text-xs text-muted-foreground mt-2">Cursed: OFF</p>
                )}
              </div>
            )}

            {/* GC (Glitched + Cursed) Values */}
            {(item.gcVal !== undefined || item.gcAC !== undefined) && (
              <div className="pt-2">
                <h3 className="text-sm font-semibold text-purple-500 mb-3 uppercase tracking-wider">Glitched + Cursed Values</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {item.gcVal !== undefined && (
                    <div className="bg-secondary p-2">
                      <span className="text-muted-foreground block">GC Value</span>
                      <span className="text-purple-500 font-bold">{item.gcVal}</span>
                    </div>
                  )}
                  {item.gcAC !== undefined && (
                    <div className="bg-secondary p-2">
                      <span className="text-muted-foreground block">GC AC</span>
                      <span className="text-purple-500 font-bold">{item.gcAC}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Skills */}
            {item.skills && item.skills.length > 0 && (
              <div className="pt-2">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {item.skills.map((skill, index) => (
                    <span 
                      key={index}
                      className="bg-secondary text-foreground text-xs px-2 py-1"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
