"use client"

import { useState, useMemo } from "react"
import { Item, TIER_COLORS, SITE_COLORS } from "@/lib/types"
import { fmt, getItemValue, isSerialAffectedSkin } from "@/lib/calculator"
import { X, Plus } from "lucide-react"
import Image from "next/image"

interface CalculatorProps {
  items: Item[]
  onClose: () => void
}

interface SelectedItemState {
  item: Item
  serial: string
  isGlitched: boolean
  isCursed: boolean
}

function parseSerialValue(value: string): number | undefined {
  const cleaned = value.replace(/[^\d]/g, "")
  if (!cleaned) return undefined
  const parsed = Number.parseInt(cleaned, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

export function Calculator({ items, onClose }: CalculatorProps) {
  const [giveItems, setGiveItems] = useState<SelectedItemState[]>([])
  const [getItems, setGetItems] = useState<SelectedItemState[]>([])
  const [currentSide, setCurrentSide] = useState<"give" | "get">("give")
  const [searchQuery, setSearchQuery] = useState("")
  const [showSkinPicker, setShowSkinPicker] = useState(false)

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items
    return items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [items, searchQuery])

  const calculateTotalValue = (itemList: SelectedItemState[]): number => {
    return itemList.reduce((total, selected) => {
      const serial = parseSerialValue(selected.serial)
      const value = getItemValue(selected.item, selected.isGlitched, selected.isCursed, serial)
      return Number.isFinite(value) ? total + value : total
    }, 0)
  }

  const giveTotal = calculateTotalValue(giveItems)
  const getTotal = calculateTotalValue(getItems)
  const difference = getTotal - giveTotal
  const fairnessPercent = giveTotal > 0 ? ((getTotal / giveTotal) * 100) : 0
  const fairnessLabel = Number.isFinite(fairnessPercent) ? fairnessPercent.toFixed(1) : "0"

  const addItem = (item: Item) => {
    const newItem: SelectedItemState = {
      item,
      serial: "",
      isGlitched: false,
      isCursed: false
    }
    if (currentSide === "give") {
      setGiveItems([...giveItems, newItem])
    } else {
      setGetItems([...getItems, newItem])
    }
    setShowSkinPicker(false)
    setSearchQuery("")
  }

  const removeItem = (side: "give" | "get", index: number) => {
    if (side === "give") {
      setGiveItems(giveItems.filter((_, i) => i !== index))
    } else {
      setGetItems(getItems.filter((_, i) => i !== index))
    }
  }

  const updateItem = (side: "give" | "get", index: number, updates: Partial<SelectedItemState>) => {
    if (side === "give") {
      setGiveItems(giveItems.map((item, i) => i === index ? { ...item, ...updates } : item))
    } else {
      setGetItems(getItems.map((item, i) => i === index ? { ...item, ...updates } : item))
    }
  }

  const renderItemCard = (selected: SelectedItemState, side: "give" | "get", index: number) => {
    const tierColor = TIER_COLORS[selected.item.tier]
    const serial = parseSerialValue(selected.serial)
    const value = getItemValue(selected.item, selected.isGlitched, selected.isCursed, serial)
    const showSerial = isSerialAffectedSkin(selected.item)

    return (
      <div key={index} className="bg-card border border-border p-2 sm:p-3 relative">
        <button
          onClick={() => removeItem(side, index)}
          className="absolute top-1 right-1 w-5 h-5 bg-destructive text-white flex items-center justify-center hover:bg-red-700 transition-colors"
        >
          <X size={12} />
        </button>
        
        <div className="h-1 w-full mb-2" style={{ backgroundColor: tierColor }} />
        
          <div className="flex gap-2 items-start">
          <div className="relative w-12 h-12 bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden rounded-sm border border-border/60">
            <div className="absolute inset-x-0 top-0 h-1 z-10" style={{ backgroundColor: tierColor }} />
            {selected.item.image ? (
              <Image 
                src={selected.item.image} 
                alt={selected.item.name} 
                width={48} 
                height={48} 
                className="object-contain relative z-0" 
              />
            ) : (
              <span className="text-xs text-muted-foreground">?</span>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium truncate">{selected.item.name}</p>
            <p className="text-[10px] sm:text-xs uppercase" style={{ color: tierColor }}>{selected.item.tier}</p>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          {/* Glitched toggle */}
          {(selected.item.glitchedVal !== undefined) && (
            <button
              onClick={() => updateItem(side, index, { isGlitched: !selected.isGlitched })}
              className="px-2 py-0.5 text-[10px] sm:text-xs font-bold transition-colors"
              style={{
                backgroundColor: selected.isGlitched ? SITE_COLORS.glitched.activeBg : SITE_COLORS.glitched.inactiveBg,
                color: selected.isGlitched ? SITE_COLORS.glitched.activeText : SITE_COLORS.glitched.inactiveText,
              }}
            >
              G
            </button>
          )}
          
          {/* Cursed toggle */}
          {(selected.item.cursedVal !== undefined) && (
            <button
              onClick={() => updateItem(side, index, { isCursed: !selected.isCursed })}
              className="px-2 py-0.5 text-xs font-bold transition-colors"
              style={{
                backgroundColor: selected.isCursed ? SITE_COLORS.cursed.activeBg : SITE_COLORS.cursed.inactiveBg,
                color: selected.isCursed ? SITE_COLORS.cursed.activeText : SITE_COLORS.cursed.inactiveText,
              }}
            >
              C
            </button>
          )}
        </div>

        {/* Serial input for affected skins */}
        {showSerial && (
          <div className="mt-2">
            <input
              type="number"
              placeholder="Serial #"
              value={selected.serial}
              onChange={(e) => updateItem(side, index, { serial: e.target.value.replace(/[^\d]/g, "") })}
              className="w-full px-2 py-1 text-[12px] sm:text-xs bg-secondary border border-border text-foreground placeholder:text-muted-foreground"
              min="1"
              step="1"
              inputMode="numeric"
            />
          </div>
        )}

        <p className="mt-2 text-lg font-bold">{fmt(value)}</p>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border w-full max-w-full sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col sm:rounded-lg">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold">Trade Calculator</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Give side */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold" style={{ color: SITE_COLORS.dangerText }}>GIVE</h3>
                <button
                  onClick={() => { setCurrentSide("give"); setShowSkinPicker(true) }}
                  className="flex items-center gap-1 px-3 py-1 bg-secondary hover:bg-muted transition-colors text-sm"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
              <div className="space-y-2 min-h-[200px] bg-secondary/30 p-2 border border-border">
                {giveItems.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">Click Add to add items</p>
                ) : (
                  giveItems.map((item, idx) => renderItemCard(item, "give", idx))
                )}
              </div>
              <div className="mt-2 p-2 border" style={{ backgroundColor: SITE_COLORS.dangerBg, borderColor: SITE_COLORS.dangerBorder }}>
                <p className="text-sm" style={{ color: SITE_COLORS.dangerText }}>Total: <span className="font-bold text-lg">{fmt(giveTotal)}</span></p>
              </div>
            </div>

            {/* Get side */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold" style={{ color: SITE_COLORS.successText }}>GET</h3>
                <button
                  onClick={() => { setCurrentSide("get"); setShowSkinPicker(true) }}
                  className="flex items-center gap-1 px-3 py-1 bg-secondary hover:bg-muted transition-colors text-sm"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
              <div className="space-y-2 min-h-[200px] bg-secondary/30 p-2 border border-border">
                {getItems.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">Click Add to add items</p>
                ) : (
                  getItems.map((item, idx) => renderItemCard(item, "get", idx))
                )}
              </div>
              <div className="mt-2 p-2 border" style={{ backgroundColor: SITE_COLORS.successBg, borderColor: SITE_COLORS.successBorder }}>
                <p className="text-sm" style={{ color: SITE_COLORS.successText }}>Total: <span className="font-bold text-lg">{fmt(getTotal)}</span></p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-4 p-4 bg-secondary border border-border">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Difference</p>
                <p className="text-xl font-bold" style={{ color: difference >= 0 ? SITE_COLORS.successText : SITE_COLORS.dangerText }}>
                  {difference >= 0 ? "+" : ""}{fmt(difference)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fairness</p>
                <p className={`text-xl font-bold ${
                  Number(fairnessLabel) >= 95 && Number(fairnessLabel) <= 105 
                    ? "text-green-400" 
                    : Number(fairnessLabel) >= 80 && Number(fairnessLabel) <= 120
                      ? "text-yellow-400"
                      : "text-red-400"
                }`}>
                  {fairnessLabel}%
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Verdict</p>
                <p className={`text-xl font-bold ${
                  Number(fairnessLabel) >= 95 && Number(fairnessLabel) <= 105 
                    ? "text-green-400" 
                    : Number(fairnessLabel) >= 80 && Number(fairnessLabel) <= 120
                      ? "text-yellow-400"
                      : "text-red-400"
                }`}>
                  {Number(fairnessLabel) >= 95 && Number(fairnessLabel) <= 105 
                    ? "Fair" 
                    : Number(fairnessLabel) > 105 
                      ? "W" 
                      : "L"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Skin picker modal */}
        {showSkinPicker && (
          <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-3">
            <div className="w-full max-w-full sm:max-w-3xl max-h-[80vh] bg-card border border-border flex flex-col sm:rounded-lg overflow-hidden">
            <div className="p-3 border-b border-border flex items-center gap-3">
              <button 
                onClick={() => { setShowSkinPicker(false); setSearchQuery("") }}
                className="p-2 hover:bg-secondary transition-colors"
              >
                <X size={20} />
              </button>
              <input
                type="text"
                placeholder="Search skins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 bg-secondary border border-border text-foreground placeholder:text-muted-foreground"
                autoFocus
              />
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {filteredItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => addItem(item)}
                    className="bg-card border border-border p-1.5 hover:border-foreground transition-colors text-left"
                    style={{
                      borderTopColor: TIER_COLORS[item.tier],
                      borderTopWidth: "3px"
                    }}
                  >
                    <div className="aspect-square bg-secondary flex items-center justify-center mb-1 p-1">
                      {item.image ? (
                        <Image 
                          src={item.image} 
                          alt={item.name} 
                          width={40} 
                          height={40} 
                          className="object-contain w-10 h-10" 
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">?</span>
                      )}
                    </div>
                    <p className="text-[10px] leading-tight truncate">{item.name}</p>
                    <p className="text-[10px] font-bold">{fmt(item.value)}</p>
                  </button>
                ))}
              </div>
            </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
