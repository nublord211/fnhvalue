"use client"

import { useState, useMemo } from "react"
import { Item, Tier, SortOption } from "@/lib/types"
import { TierTabs } from "./tier-tabs"
import { SearchBar } from "./search-bar"
import { ValueCard } from "./value-card"

interface FilterState {
  sortBy: SortOption
  minValue: string
  maxValue: string
  dateFrom: string
  dateTo: string
}

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
    skills: [
      { name: "Fire Blast", description: "Unleashes a powerful blast of fire dealing massive damage" },
      { name: "Shadow Step", description: "Teleport through shadows to evade attacks" },
      { name: "Rebirth", description: "Rise from the ashes with full health once per battle" }
    ],
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
    skills: [
      { name: "Void Shift", description: "Phase through dimensions to avoid damage" },
      { name: "Dark Matter", description: "Create a zone of dark matter that slows enemies" }
    ],
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
    skills: [
      { name: "Crystal Shield", description: "Create a protective barrier of crystals" },
      { name: "Refraction", description: "Reflect incoming projectiles back at attackers" }
    ],
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
    skills: [
      { name: "Flame Breath", description: "Breathe a cone of devastating fire" },
      { name: "Wing Gust", description: "Create powerful gusts that push enemies back" },
      { name: "Inferno", description: "Engulf the area in flames" }
    ],
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
    skills: [
      { name: "Golden Strike", description: "A powerful strike imbued with golden energy" }
    ],
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
    skills: [
      { name: "Lightning Bolt", description: "Strike enemies with a bolt of lightning" },
      { name: "Thunder Clap", description: "Create a deafening thunder that stuns nearby enemies" }
    ],
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
    skills: [
      { name: "Venom Strike", description: "Inject deadly venom that damages over time" },
      { name: "Coil", description: "Constrict an enemy, immobilizing them" }
    ],
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
    skills: [
      { name: "Shadow Realm", description: "Trap enemies in a realm of shadows" },
      { name: "Dominate", description: "Take control of an enemy for a short time" }
    ],
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
    skills: [
      { name: "Phase Out", description: "Become intangible for a short duration" },
      { name: "Neon Flash", description: "Blind enemies with a burst of neon light" }
    ],
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
    skills: [
      { name: "Magma Pool", description: "Create a pool of magma that burns enemies" },
      { name: "Heat Wave", description: "Emit a wave of intense heat" }
    ],
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
    skills: [
      { name: "Thunder Strike", description: "Call down thunder from the sky" }
    ],
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
    skills: [
      { name: "Wisdom Aura", description: "Boost the abilities of nearby allies" }
    ],
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
  const [filters, setFilters] = useState<FilterState>({
    sortBy: "default",
    minValue: "",
    maxValue: "",
    dateFrom: "",
    dateTo: ""
  })

  const filteredItems = useMemo(() => {
    let result = items.filter((item) => {
      const matchesTier = activeTier === "all" || item.tier === activeTier
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
      
      // Value range filter
      const minVal = filters.minValue ? parseInt(filters.minValue) : null
      const maxVal = filters.maxValue ? parseInt(filters.maxValue) : null
      const matchesMinValue = minVal === null || item.value >= minVal
      const matchesMaxValue = maxVal === null || item.value <= maxVal
      
      // Date range filter
      const itemDate = item.releaseDate ? new Date(item.releaseDate) : null
      const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null
      const toDate = filters.dateTo ? new Date(filters.dateTo) : null
      const matchesFromDate = !fromDate || !itemDate || itemDate >= fromDate
      const matchesToDate = !toDate || !itemDate || itemDate <= toDate
      
      return matchesTier && matchesSearch && matchesMinValue && matchesMaxValue && matchesFromDate && matchesToDate
    })

    // Apply sorting
    switch (filters.sortBy) {
      case "value-low":
        result = [...result].sort((a, b) => a.value - b.value)
        break
      case "value-high":
        result = [...result].sort((a, b) => b.value - a.value)
        break
      case "date-new":
        result = [...result].sort((a, b) => {
          if (!a.releaseDate) return 1
          if (!b.releaseDate) return -1
          return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
        })
        break
      case "date-old":
        result = [...result].sort((a, b) => {
          if (!a.releaseDate) return 1
          if (!b.releaseDate) return -1
          return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
        })
        break
    }

    return result
  }, [items, activeTier, searchQuery, filters])

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

        {/* Search Bar with Filters */}
        <div className="mb-8">
          <SearchBar 
            value={searchQuery} 
            onChange={setSearchQuery}
            filters={filters}
            onFiltersChange={setFilters}
          />
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
