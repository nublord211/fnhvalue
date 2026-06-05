"use client"

import { useState, useMemo } from "react"
import { Item, Tier } from "@/lib/types"
import { TierTabs } from "./tier-tabs"
import { SearchBar } from "./search-bar"
import { ValueCard } from "./value-card"

// Sample data for demonstration with all new fields
const SAMPLE_ITEMS: Item[] = [
  { 
    id: "1", 
    name: "Shadow Phoenix", 
    tier: "secret", 
    value: 500, 
    ac: 999,
    era: "Season 5",
    releaseDate: "2024-03-15",
    skills: ["Fire Blast", "Shadow Step", "Rebirth"],
    demand: "extreme",
    updates: ["Value increased from 450 to 500", "Added new skill: Rebirth"],
    glitchedVal: 750,
    glitchedAC: 1200,
    cursedVal: 650,
    cursedAC: 1100,
    gcVal: 950,
    gcAC: 1500
  },
  { 
    id: "2", 
    name: "Void Walker", 
    tier: "sacred", 
    value: 350, 
    ac: 750,
    era: "Season 4",
    releaseDate: "2023-11-20",
    skills: ["Void Shift", "Dark Matter"],
    demand: "high",
    updates: ["Glitched AC adjusted"],
    glitchedVal: 520,
    glitchedAC: 950,
    cursedVal: 480,
    cursedAC: 900,
    gcVal: 700,
    gcAC: 1200
  },
  { 
    id: "3", 
    name: "Crystal Queen", 
    tier: "exclusive", 
    value: 280, 
    ac: 620,
    era: "Season 3",
    releaseDate: "2023-06-10",
    skills: ["Crystal Shield", "Refraction"],
    demand: "decent",
    glitchedVal: 420,
    glitchedAC: 800,
    cursedVal: 380,
    cursedAC: 750,
    gcVal: 560,
    gcAC: 1000
  },
  { 
    id: "4", 
    name: "Fire Dragon", 
    tier: "mythic", 
    value: 200, 
    ac: 500,
    era: "Season 2",
    releaseDate: "2023-02-14",
    skills: ["Flame Breath", "Wing Gust", "Inferno"],
    demand: "moderate",
    updates: ["Cursed variant discontinued"],
    glitchedVal: 300,
    glitchedAC: 650,
    cursedOff: true
  },
  { 
    id: "5", 
    name: "Golden Knight", 
    tier: "legendary", 
    value: 150, 
    ac: 400,
    era: "Season 1",
    releaseDate: "2022-09-01",
    skills: ["Golden Strike"],
    demand: "decent",
    cursedVal: 220,
    cursedAC: 550
  },
  { 
    id: "6", 
    name: "Storm Mage", 
    tier: "epic", 
    value: 100, 
    ac: 300,
    era: "Season 2",
    releaseDate: "2023-01-20",
    skills: ["Lightning Bolt", "Thunder Clap"],
    demand: "moderate"
  },
  { 
    id: "7", 
    name: "Ocean Guardian", 
    tier: "rare", 
    value: 75, 
    ac: 200,
    era: "Season 1",
    releaseDate: "2022-08-15",
    demand: "none"
  },
  { 
    id: "8", 
    name: "Forest Scout", 
    tier: "uncommon", 
    value: 40, 
    ac: 100,
    era: "Season 1",
    releaseDate: "2022-07-01",
    demand: "none"
  },
  { 
    id: "9", 
    name: "Stone Golem", 
    tier: "common", 
    value: 15, 
    ac: 50,
    era: "Season 1",
    releaseDate: "2022-06-15",
    demand: "none"
  },
  { 
    id: "10", 
    name: "Emerald Serpent", 
    tier: "secret", 
    value: 480, 
    ac: 950, 
    glitchedOff: true,
    era: "Season 5",
    releaseDate: "2024-02-28",
    skills: ["Venom Strike", "Coil"],
    demand: "high",
    updates: ["Glitched variant discontinued", "Base value increased"],
    cursedVal: 620,
    cursedAC: 1100,
    gcVal: 800,
    gcAC: 1350
  },
  { 
    id: "11", 
    name: "Dark Overlord", 
    tier: "sacred", 
    value: 320, 
    ac: 700,
    era: "Season 4",
    releaseDate: "2023-10-31",
    skills: ["Shadow Realm", "Dominate"],
    demand: "extreme",
    glitchedVal: 480,
    glitchedAC: 900,
    cursedVal: 450,
    cursedAC: 850,
    gcVal: 640,
    gcAC: 1100
  },
  { 
    id: "12", 
    name: "Neon Phantom", 
    tier: "exclusive", 
    value: 260, 
    ac: 580, 
    glitchedOff: true,
    era: "Season 3",
    releaseDate: "2023-07-04",
    skills: ["Phase Out", "Neon Flash"],
    demand: "decent",
    cursedVal: 350,
    cursedAC: 720
  },
  { 
    id: "13", 
    name: "Inferno Beast", 
    tier: "mythic", 
    value: 180, 
    ac: 450,
    era: "Season 2",
    releaseDate: "2023-03-15",
    skills: ["Magma Pool", "Heat Wave"],
    demand: "high",
    glitchedVal: 270,
    glitchedAC: 600,
    cursedVal: 250,
    cursedAC: 580,
    gcVal: 380,
    gcAC: 750
  },
  { 
    id: "14", 
    name: "Thunder Lord", 
    tier: "legendary", 
    value: 140, 
    ac: 380,
    era: "Season 1",
    releaseDate: "2022-12-20",
    skills: ["Thunder Strike"],
    demand: "moderate",
    updates: ["Minor value adjustment"],
    glitchedVal: 210,
    glitchedAC: 500
  },
  { 
    id: "15", 
    name: "Mystic Sage", 
    tier: "epic", 
    value: 90, 
    ac: 280,
    era: "Season 2",
    releaseDate: "2023-04-10",
    skills: ["Wisdom Aura"],
    demand: "moderate"
  },
  { 
    id: "16", 
    name: "Coral Titan", 
    tier: "rare", 
    value: 65, 
    ac: 180,
    era: "Season 1",
    releaseDate: "2022-09-20",
    demand: "none"
  },
  { 
    id: "17", 
    name: "Wind Runner", 
    tier: "uncommon", 
    value: 35, 
    ac: 90,
    era: "Season 1",
    releaseDate: "2022-08-01",
    demand: "none"
  },
  { 
    id: "18", 
    name: "Earth Guardian", 
    tier: "common", 
    value: 12, 
    ac: 40,
    era: "Season 1",
    releaseDate: "2022-06-01",
    demand: "none"
  },
]

export function ValueSite() {
  const [items] = useState<Item[]>(SAMPLE_ITEMS)
  const [activeTier, setActiveTier] = useState<Tier | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesTier = activeTier === "all" || item.tier === activeTier
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesTier && matchesSearch
    })
  }, [items, activeTier, searchQuery])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Value List</h1>
          <p className="text-muted-foreground">Browse and search items by tier</p>
        </header>

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
      </div>
    </div>
  )
}
