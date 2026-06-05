"use client"

import { useState, useMemo } from "react"
import { Item, Tier } from "@/lib/types"
import { TierTabs } from "./tier-tabs"
import { SearchBar } from "./search-bar"
import { ValueCard } from "./value-card"
import { JsonUploader } from "./json-uploader"

// Sample data for demonstration
const SAMPLE_ITEMS: Item[] = [
  { id: "1", name: "Shadow Phoenix", tier: "secret", value: 500, ac: 999 },
  { id: "2", name: "Void Walker", tier: "sacred", value: 350, ac: 750 },
  { id: "3", name: "Crystal Queen", tier: "exclusive", value: 280, ac: 620 },
  { id: "4", name: "Fire Dragon", tier: "mythic", value: 200, ac: 500 },
  { id: "5", name: "Golden Knight", tier: "legendary", value: 150, ac: 400 },
  { id: "6", name: "Storm Mage", tier: "epic", value: 100, ac: 300 },
  { id: "7", name: "Ocean Guardian", tier: "rare", value: 75, ac: 200 },
  { id: "8", name: "Forest Scout", tier: "uncommon", value: 40, ac: 100 },
  { id: "9", name: "Stone Golem", tier: "common", value: 15, ac: 50 },
  { id: "10", name: "Emerald Serpent", tier: "secret", value: 480, ac: 950, glitchedOff: true },
  { id: "11", name: "Dark Overlord", tier: "sacred", value: 320, ac: 700 },
  { id: "12", name: "Neon Phantom", tier: "exclusive", value: 260, ac: 580, glitchedOff: true },
  { id: "13", name: "Inferno Beast", tier: "mythic", value: 180, ac: 450 },
  { id: "14", name: "Thunder Lord", tier: "legendary", value: 140, ac: 380 },
  { id: "15", name: "Mystic Sage", tier: "epic", value: 90, ac: 280 },
  { id: "16", name: "Coral Titan", tier: "rare", value: 65, ac: 180 },
  { id: "17", name: "Wind Runner", tier: "uncommon", value: 35, ac: 90 },
  { id: "18", name: "Earth Guardian", tier: "common", value: 12, ac: 40 },
]

export function ValueSite() {
  const [items, setItems] = useState<Item[]>(SAMPLE_ITEMS)
  const [activeTier, setActiveTier] = useState<Tier | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesTier = activeTier === "all" || item.tier === activeTier
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesTier && matchesSearch
    })
  }, [items, activeTier, searchQuery])

  const handleJsonUpload = (newItems: Item[]) => {
    setItems(newItems)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Value List</h1>
          <p className="text-muted-foreground">Browse and search items by tier</p>
        </header>

        {/* JSON Uploader */}
        <div className="mb-6">
          <JsonUploader onUpload={handleJsonUpload} />
          <p className="text-center text-xs text-muted-foreground mt-2">
            Upload a JSON file with items to display
          </p>
        </div>

        {/* Tier Tabs */}
        <div className="mb-6">
          <TierTabs activeTier={activeTier} onTierChange={setActiveTier} />
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        {/* Items count */}
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {filteredItems.length} of {items.length} items
        </div>

        {/* Items Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredItems.map((item) => (
              <ValueCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No items found matching your criteria
          </div>
        )}

        {/* JSON Format Info */}
        <div className="mt-12 p-4 bg-card border border-border">
          <h2 className="text-lg font-semibold mb-2 text-foreground">JSON Format</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Upload a JSON file with the following structure:
          </p>
          <pre className="bg-secondary p-4 text-xs overflow-x-auto text-foreground">
{`[
  {
    "id": "1",
    "name": "Item Name",
    "tier": "secret" | "sacred" | "exclusive" | "mythic" | "legendary" | "epic" | "rare" | "uncommon" | "common",
    "value": 100,
    "image": "/path/to/image.png",
    "ac": 500,
    "glitchedOff": false
  }
]`}
          </pre>
        </div>
      </div>
    </div>
  )
}
