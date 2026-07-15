"use client"

import { useState } from "react"
import { Item, TIER_COLORS, DEMAND_COLORS, SITE_COLORS } from "@/lib/types"
import { X, ChevronDown, ChevronUp } from "lucide-react"

interface ItemDetailModalProps {
  item: Item
  isGlitched: boolean
  isCursed: boolean
  onClose: () => void
}

export function ItemDetailModal({ item, isGlitched, isCursed, onClose }: ItemDetailModalProps) {
  const tierColor = TIER_COLORS[item.tier]
  const demandColor = item.demand ? DEMAND_COLORS[item.demand] : DEMAND_COLORS.none
  const glitchedTextColor = SITE_COLORS.glitched.activeText
  const cursedTextColor = SITE_COLORS.cursed.activeText
  const gcTextColor = SITE_COLORS.infoText
  const [updatesOpen, setUpdatesOpen] = useState(false)
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null)

  const getDemandLabel = () => {
    if (!item.demand) return "None"
    return item.demand.charAt(0).toUpperCase() + item.demand.slice(1)
  }

  const hasUpdates = item.updates && item.updates.length > 0

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-3" onClick={onClose}>
      <div 
        className="bg-card border border-border max-w-md w-full max-h-[90vh] overflow-y-auto sm:rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header color bar */}
        <div className="h-2 w-full" style={{ backgroundColor: tierColor }} />
        
        <div className="p-4 sm:p-6">
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

          {/* Updates section - only render if updates exist */}
          {hasUpdates && (
            <div className="mb-4">
              <button
                onClick={() => setUpdatesOpen(!updatesOpen)}
                className="w-full flex items-center justify-between p-3 text-left transition-colors"
                style={{ backgroundColor: SITE_COLORS.updatePanel }}
              >
                <span className="text-white font-semibold text-sm uppercase tracking-wider">Updates</span>
                {updatesOpen ? (
                  <ChevronUp className="w-4 h-4 text-white" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-white" />
                )}
              </button>
              {updatesOpen && (
                <div className="border border-border border-t-0 p-3 bg-secondary">
                  <ul className="space-y-2">
                    {item.updates!.map((update, index) => (
                      <li key={index} className="text-sm text-foreground flex items-start gap-2">
                        <span className="text-muted-foreground">-</span>
                        {update}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Info grid */}
          <div className="space-y-4">
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Tier</span>
              <span className="text-foreground uppercase" style={{ color: tierColor }}>{item.tier}</span>
            </div>

            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Demand</span>
              <span className="font-bold" style={{ color: demandColor }}>{getDemandLabel()}</span>
            </div>

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

            {/* Skills - with hover descriptions */}
            {item.skills && item.skills.length > 0 && (
              <div className="pt-2">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {item.skills.map((skill, index) => (
                    <div 
                      key={index}
                      className="relative"
                      onMouseEnter={() => setHoveredSkill(skill.name)}
                      onMouseLeave={() => setHoveredSkill(null)}
                    >
                      <span 
                        className="bg-secondary text-foreground text-xs px-2 py-1 cursor-help"
                      >
                        {skill.name}
                      </span>
                      {hoveredSkill === skill.name && skill.description && (
                        <div className="absolute bottom-full left-0 mb-2 z-10 w-48 p-2 bg-card border border-border text-xs text-foreground shadow-lg">
                          {skill.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
                <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: glitchedTextColor }}>Glitched Values</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {item.glitchedVal !== undefined && (
                    <div className="bg-secondary p-2">
                      <span className="text-muted-foreground block">Glitched Value</span>
                      <span className="font-bold" style={{ color: glitchedTextColor }}>{item.glitchedVal}</span>
                    </div>
                  )}
                  {item.glitchedAC !== undefined && (
                    <div className="bg-secondary p-2">
                      <span className="text-muted-foreground block">Glitched AC</span>
                      <span className="font-bold" style={{ color: glitchedTextColor }}>{item.glitchedAC}</span>
                    </div>
                  )}
                </div>
                {item.glitchedOff && (
                  <p className="text-xs text-muted-foreground mt-2">Glitched: OFF</p>
                )}
              </div>
            )}

            {/* Cursed Values - now GC color (greenish) */}
            {(item.cursedVal !== undefined || item.cursedAC !== undefined) && (
              <div className="pt-2">
                <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: cursedTextColor }}>Cursed Values</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {item.cursedVal !== undefined && (
                    <div className="bg-secondary p-2">
                      <span className="text-muted-foreground block">Cursed Value</span>
                      <span className="font-bold" style={{ color: cursedTextColor }}>{item.cursedVal}</span>
                    </div>
                  )}
                  {item.cursedAC !== undefined && (
                    <div className="bg-secondary p-2">
                      <span className="text-muted-foreground block">Cursed AC</span>
                      <span className="font-bold" style={{ color: cursedTextColor }}>{item.cursedAC}</span>
                    </div>
                  )}
                </div>
                {item.cursedOff && (
                  <p className="text-xs text-muted-foreground mt-2">Cursed: OFF</p>
                )}
              </div>
            )}

            {/* GC (Glitched + Cursed) Values - now blue */}
            {(item.gcVal !== undefined || item.gcAC !== undefined) && (
              <div className="pt-2">
                <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: gcTextColor }}>Glitched + Cursed Values</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {item.gcVal !== undefined && (
                    <div className="bg-secondary p-2">
                      <span className="text-muted-foreground block">GC Value</span>
                      <span className="font-bold" style={{ color: gcTextColor }}>{item.gcVal}</span>
                    </div>
                  )}
                  {item.gcAC !== undefined && (
                    <div className="bg-secondary p-2">
                      <span className="text-muted-foreground block">GC AC</span>
                      <span className="font-bold" style={{ color: gcTextColor }}>{item.gcAC}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
