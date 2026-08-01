"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { X } from "lucide-react"
import { Item, TIER_COLORS } from "@/lib/types"
import { fmt } from "@/lib/calculator"

const TRADEPOST_PRESET_ITEMS: Item[] = [
  {
    id: "trade-option-downgrade",
    name: "downgrade",
    tier: "common",
    value: 0,
  },
  {
    id: "trade-option-upgrade",
    name: "upgrade",
    tier: "common",
    value: 0,
  },
  {
    id: "trade-option-adds",
    name: "adds",
    tier: "common",
    value: 0,
  },
  {
    id: "trade-option-overpay",
    name: "overpay",
    tier: "common",
    value: 0,
  },
  {
    id: "trade-option-anything",
    name: "anything",
    tier: "common",
    value: 0,
  },
  {
    id: "trade-option-bulk",
    name: "bulk",
    tier: "common",
    value: 0,
  },
]

interface ItemPickerModalProps {
  isOpen: boolean
  items: Item[]
  onClose: () => void
  onSelect: (item: Item) => void
}

export function ItemPickerModal({ isOpen, items, onClose, onSelect }: ItemPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredItems = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    const presetMatches = TRADEPOST_PRESET_ITEMS.filter((item) =>
      item.name.toLowerCase().includes(normalizedQuery)
    )

    if (!normalizedQuery) {
      return [...TRADEPOST_PRESET_ITEMS, ...items]
    }

    const matchedItems = items.filter((item) =>
      item.name.toLowerCase().includes(normalizedQuery)
    )

    return [...presetMatches, ...matchedItems]
  }, [items, searchQuery])

  if (!isOpen) return null

  return (
    <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-3">
      <div className="w-full max-w-full sm:max-w-3xl max-h-[80vh] bg-card border border-border flex flex-col sm:rounded-lg overflow-hidden">
        <div className="p-3 border-b border-border flex items-center gap-3">
          <button
            onClick={() => {
              setSearchQuery("")
              onClose()
            }}
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
                onClick={() => {
                  onSelect(item)
                  setSearchQuery("")
                }}
                className="bg-card border border-border p-1.5 hover:border-foreground transition-colors text-left"
                style={{
                  borderTopColor: TIER_COLORS[item.tier],
                  borderTopWidth: "3px",
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
  )
}
