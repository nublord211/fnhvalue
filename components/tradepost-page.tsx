"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Plus, X } from "lucide-react"
import { Item, TIER_COLORS, SITE_COLORS, TIER_ORDER } from "@/lib/types"
import { VALUES as SITE_ITEMS } from "@/lib/values"
import { fmt, getItemValue, isSerialAffectedSkin } from "@/lib/calculator"
import { ItemPickerModal } from "@/components/item-picker-modal"
import { runAutomod } from "@/lib/automod"

const TRADEPOST_STORAGE_KEY = "fnh-tradeposts"

interface TradepostAuthor {
  id: string
  name: string
  avatar: string | null
  discordId: string | null
  isAnonymous: boolean
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

function isTradePresetItem(item: Item): boolean {
  return item.id.startsWith("trade-option-")
}

export function TradepostPage() {
  const router = useRouter()
  const [items] = useState<Item[]>(SITE_ITEMS)
  const [giveItems, setGiveItems] = useState<SelectedItemState[]>([])
  const [getItems, setGetItems] = useState<SelectedItemState[]>([])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [currentSide, setCurrentSide] = useState<"give" | "get">("give")
  const [draftTitle, setDraftTitle] = useState("")
  const [draftNote, setDraftNote] = useState("")
  const [moderationMessage, setModerationMessage] = useState<string | null>(null)

  const addItem = (item: Item) => {
    const newItem: SelectedItemState = {
      item,
      serial: "",
      isGlitched: false,
      isCursed: false,
    }

    if (currentSide === "give") {
      setGiveItems((prev) => [...prev, newItem])
    } else {
      setGetItems((prev) => [...prev, newItem])
    }

    setPickerOpen(false)
  }

  const removeItem = (side: "give" | "get", index: number) => {
    if (side === "give") {
      setGiveItems((prev) => prev.filter((_, i) => i !== index))
    } else {
      setGetItems((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const updateItem = (side: "give" | "get", index: number, updates: Partial<SelectedItemState>) => {
    if (side === "give") {
      setGiveItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...updates } : item)))
    } else {
      setGetItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...updates } : item)))
    }
  }

  const calculateTotalValue = (itemList: SelectedItemState[]): number => {
    return itemList.reduce((total, selected) => {
      if (isTradePresetItem(selected.item)) {
        return total
      }

      const serial = parseSerialValue(selected.serial)
      const value = getItemValue(selected.item, selected.isGlitched, selected.isCursed, serial)
      return Number.isFinite(value) ? total + value : total
    }, 0)
  }

  const giveTotal = useMemo(() => calculateTotalValue(giveItems), [giveItems])
  const getTotal = useMemo(() => calculateTotalValue(getItems), [getItems])
  const difference = getTotal - giveTotal
  const fairnessPercent = giveTotal > 0 ? (getTotal / giveTotal) * 100 : 0
  const fairnessLabel = Number.isFinite(fairnessPercent) ? fairnessPercent.toFixed(1) : "0"

  const handlePostToBoard = () => {
    const title = draftTitle.trim() || "Untitled tradepost"
    const note = draftNote.trim()
    const automod = runAutomod({ title, note })

    if (!automod.allowed) {
      setModerationMessage(automod.reason || "Tradepost could not be posted.")
      return
    }

    setModerationMessage(null)

    const storedDiscordUser = (() => {
      try {
        const stored = window.localStorage.getItem("discordUser")
        return stored ? JSON.parse(stored) : null
      } catch {
        return null
      }
    })()

    let authorId = window.localStorage.getItem("fnh-tradepost-user-id")
    if (!authorId) {
      authorId = typeof crypto !== "undefined" && "randomUUID" in crypto
        ? `anon-${crypto.randomUUID()}`
        : `anon-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      window.localStorage.setItem("fnh-tradepost-user-id", authorId)
    }

    const author: TradepostAuthor = {
      id: authorId,
      name: storedDiscordUser?.username || "Anonymous",
      avatar: storedDiscordUser?.avatar ? `https://cdn.discordapp.com/avatars/${storedDiscordUser.id}/${storedDiscordUser.avatar}.png` : null,
      discordId: storedDiscordUser?.id || null,
      isAnonymous: !storedDiscordUser,
    }

    const newPost = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      note,
      giveItems,
      getItems,
      giveTotal,
      getTotal,
      createdAt: new Date().toISOString(),
      author,
      comments: [],
    }

    try {
      const existing = window.localStorage.getItem(TRADEPOST_STORAGE_KEY)
      const parsed = existing ? JSON.parse(existing) : []
      const posts = Array.isArray(parsed) ? parsed : []
      window.localStorage.setItem(TRADEPOST_STORAGE_KEY, JSON.stringify([newPost, ...posts]))
    } catch {
      window.localStorage.setItem(TRADEPOST_STORAGE_KEY, JSON.stringify([newPost]))
    }

    router.push("/tradeposts")
  }

  const renderItemCard = (selected: SelectedItemState, side: "give" | "get", index: number) => {
    const tierColor = TIER_COLORS[selected.item.tier]
    const serial = parseSerialValue(selected.serial)
    const showPresetRaritySelector = isTradePresetItem(selected.item)
    const value = showPresetRaritySelector ? 0 : getItemValue(selected.item, selected.isGlitched, selected.isCursed, serial)
    const showSerial = !showPresetRaritySelector && isSerialAffectedSkin(selected.item)
    const canToggleGlitched = showPresetRaritySelector || selected.item.glitchedVal !== undefined
    const canToggleCursed = showPresetRaritySelector || selected.item.cursedVal !== undefined

    return (
      <div key={`${side}-${index}`} className="bg-card border border-border p-2 sm:p-3 relative">
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
              <Image src={selected.item.image} alt={selected.item.name} width={48} height={48} className="object-contain relative z-0" />
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
          {canToggleGlitched && (
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

          {canToggleCursed && (
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

        {showPresetRaritySelector && (
          <div className="mt-2">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Rarity</p>
            <div className="flex flex-wrap gap-1">
              {TIER_ORDER.map((tier) => {
                const isActive = selected.item.tier === tier
                return (
                  <button
                    key={`${selected.item.id}-${tier}`}
                    onClick={() => updateItem(side, index, { item: { ...selected.item, tier } })}
                    className={`px-2 py-0.5 text-[10px] sm:text-xs font-semibold uppercase transition-colors ${
                      isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                    }`}
                  >
                    {tier}
                  </button>
                )
              })}
            </div>
          </div>
        )}

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
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-muted transition-colors rounded-md"
          >
            <ArrowLeft size={16} />
            Back to values
          </button>
          <div className="text-sm text-muted-foreground">Tradepost draft</div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="bg-card border border-border p-4 sm:p-6">
              <h1 className="text-2xl font-bold mb-2">Create a tradepost</h1>
              <p className="text-sm text-muted-foreground">Use the same item selector as the calculator to build an offer and compare values.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-card border border-border p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold" style={{ color: SITE_COLORS.dangerText }}>GIVE</h2>
                  <button
                    onClick={() => {
                      setCurrentSide("give")
                      setPickerOpen(true)
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-secondary hover:bg-muted transition-colors text-sm"
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
                <div className="space-y-2 min-h-[220px] bg-secondary/30 p-2 border border-border">
                  {giveItems.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-8">Add items you are offering</p>
                  ) : (
                    giveItems.map((item, idx) => renderItemCard(item, "give", idx))
                  )}
                </div>
                <div className="mt-2 p-2 border" style={{ backgroundColor: SITE_COLORS.dangerBg, borderColor: SITE_COLORS.dangerBorder }}>
                  <p className="text-sm" style={{ color: SITE_COLORS.dangerText }}>
                    Total: <span className="font-bold text-lg">{fmt(giveTotal)}</span>
                  </p>
                </div>
              </div>

              <div className="bg-card border border-border p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold" style={{ color: SITE_COLORS.successText }}>GET</h2>
                  <button
                    onClick={() => {
                      setCurrentSide("get")
                      setPickerOpen(true)
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-secondary hover:bg-muted transition-colors text-sm"
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
                <div className="space-y-2 min-h-[220px] bg-secondary/30 p-2 border border-border">
                  {getItems.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-8">Add items you want in return</p>
                  ) : (
                    getItems.map((item, idx) => renderItemCard(item, "get", idx))
                  )}
                </div>
                <div className="mt-2 p-2 border" style={{ backgroundColor: SITE_COLORS.successBg, borderColor: SITE_COLORS.successBorder }}>
                  <p className="text-sm" style={{ color: SITE_COLORS.successText }}>
                    Total: <span className="font-bold text-lg">{fmt(getTotal)}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border p-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Difference</p>
                  <p className="text-xl font-bold" style={{ color: difference >= 0 ? SITE_COLORS.successText : SITE_COLORS.dangerText }}>
                    {difference >= 0 ? "+" : ""}{fmt(difference)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fairness</p>
                  <p className={`text-xl font-bold ${Number(fairnessLabel) >= 95 && Number(fairnessLabel) <= 105 ? "text-green-400" : Number(fairnessLabel) >= 80 && Number(fairnessLabel) <= 120 ? "text-yellow-400" : "text-red-400"}`}>
                    {fairnessLabel}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border p-4 sm:p-6 space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">Tradepost title</label>
              <input
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                placeholder="e.g. Trading my secret for a legendary"
                className="w-full px-3 py-2 bg-secondary border border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Notes</label>
              <textarea
                value={draftNote}
                onChange={(e) => setDraftNote(e.target.value)}
                placeholder="Add any extra details for the trade"
                rows={6}
                className="w-full px-3 py-2 bg-secondary border border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="rounded-md border border-border bg-secondary/40 p-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-2">Preview</p>
              <p className="font-semibold text-foreground">{draftTitle || "Untitled tradepost"}</p>
              <p className="mt-2 whitespace-pre-wrap">{draftNote || "No notes added yet."}</p>
            </div>
            {moderationMessage ? (
              <div className="rounded-md border border-red-500/60 bg-red-950/40 px-3 py-2 text-sm text-red-200">
                {moderationMessage}
              </div>
            ) : null}
            <button
              className="w-full px-4 py-3 bg-primary text-primary-foreground hover:bg-primary/80 transition-colors font-medium rounded-md"
              onClick={handlePostToBoard}
            >
              Post to board
            </button>
          </div>
        </div>
      </div>

      <ItemPickerModal
        isOpen={pickerOpen}
        items={items}
        onClose={() => setPickerOpen(false)}
        onSelect={addItem}
      />
    </div>
  )
}
