"use client"

import { useState, useMemo } from "react"
import { Item, Tier, SortOption } from "@/lib/types"
import { TierTabs } from "./tier-tabs"
import { SearchBar } from "./search-bar"
import { ValueCard } from "./value-card"
import { Calculator } from "./calculator"
import { Calculator as CalcIcon } from "lucide-react"

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
    name: "Bling Freddy",
    tier: "exclusive",
    value: 67,
    ac: 67,
    era: "Season 1",
    releaseDate: "2022-03-15",
    skills: [
      { name: "Golden Glow", description: "Emits a blinding flash of golden light" },
      { name: "Midas Touch", description: "Turns enemies into solid gold temporarily" }
    ],
    demand: "extreme",
    updates: ["Value adjusted from 125 to 67", "Added golden particle effects"],
    glitchedVal: 67,
    glitchedAC: 67,
    cursedVal: 67,
    cursedAC: 67,
    gcVal: 67,
    gcAC: 67,
    supply: 500
  },
  {
    id: "2",
    name: "Springtrap 2026",
    tier: "sacred",
    value: 67,
    ac: 67,
    era: "Season 2",
    releaseDate: "2022-07-20",
    skills: [
      { name: "Spring Lock", description: "Traps enemy in a devastating mechanical grip" }
    ],
    demand: "extreme",
    updates: ["Model rework", "Added new animation set"],
    glitchedVal: 67,
    glitchedAC: 67,
    cursedVal: 67,
    cursedAC: 67,
    gcVal: 67,
    gcAC: 67,
    supply: 350
  },
  {
    id: "3",
    name: "Nightmare Tidal King",
    tier: "sacred",
    value: 67,
    ac: 67,
    era: "Season 3",
    releaseDate: "2023-01-10",
    skills: [
      { name: "Tidal Wave", description: "Summons a massive wave that crashes the battlefield" },
      { name: "Nightmare Surge", description: "Enemies in range are paralyzed with fear" },
      { name: "Abyssal Grasp", description: "Tentacles rise from below to trap foes" }
    ],
    demand: "extreme",
    updates: ["Glitched variant introduced", "Value increased from 50 to 67"],
    glitchedVal: 67,
    glitchedAC: 67,
    cursedVal: 67,
    cursedAC: 67,
    gcVal: 67,
    gcAC: 67,
    supply: 200
  },
  {
    id: "4",
    name: "Dragon MXES",
    tier: "sacred",
    value: 67,
    ac: 67,
    era: "Season 4",
    releaseDate: "2023-06-05",
    skills: [
      { name: "Dragon Breath", description: "Scorching flames reduce enemy armor" },
      { name: "MXES Protocol", description: "Digital corruption spreads to enemies" }
    ],
    demand: "high",
    updates: ["Glitched serials #3 and #4 added", "Demand increased from moderate to high"],
    glitchedVal: 67,
    glitchedAC: 67,
    cursedVal: 67,
    cursedAC: 67,
    gcVal: 67,
    gcAC: 67,
    supply: 150
  },
  {
    id: "5",
    name: "Midnight Motorist",
    tier: "sacred",
    value: 67,
    ac: 67,
    era: "Season 5",
    releaseDate: "2023-10-18",
    skills: [
      { name: "Midnight Drive", description: "Dashes through shadows, untargetable" },
      { name: "Motor Roar", description: "Deafening engine noise stuns enemies" }
    ],
    demand: "extreme",
    updates: ["Serial #0 discovered", "Glitched variant reworked"],
    glitchedVal: 67,
    glitchedAC: 67,
    cursedVal: 67,
    cursedAC: 67,
    gcVal: 67,
    gcAC: 67,
    supply: 300
  },
  {
    id: "6",
    name: "Bloomtrap",
    tier: "secret",
    value: 67,
    ac: 67,
    era: "Season 6",
    releaseDate: "2024-02-28",
    skills: [
      { name: "Pollen Cloud", description: "Toxic pollen damages over time" },
      { name: "Vine Snare", description: "Thorny vines root enemies in place" },
      { name: "Flourish", description: "Heals based on nearby enemy count" }
    ],
    demand: "high",
    updates: ["Second glitched serial added", "Visual overhaul"],
    glitchedVal: 67,
    glitchedAC: 67,
    cursedVal: 67,
    cursedAC: 67,
    gcVal: 67,
    gcAC: 67,
    supply: 100
  },
  {
    id: "7",
    name: "Clowntrap",
    tier: "sacred",
    value: 67,
    ac: 67,
    era: "Season 7",
    releaseDate: "2024-07-14",
    skills: [
      { name: "Laughing Gas", description: "Enemies become confused and attack randomly" },
      { name: "Carnival Trap", description: "Summons a merry-go-round that pulls enemies inward" }
    ],
    demand: "high",
    updates: ["Glitched supply increased", "Value decreased from 42 to 67"],
    glitchedVal: 67,
    glitchedAC: 67,
    cursedVal: 67,
    cursedAC: 67,
    gcVal: 67,
    gcAC: 67,
    supply: 250
  },
  {
    id: "8",
    name: "Mad Hatter Vanny",
    tier: "sacred",
    value: 67,
    ac: 67,
    era: "Season 8",
    releaseDate: "2024-12-01",
    skills: [
      { name: "Tea Party", description: "Forces enemies to sit and sip tea, disabling them" },
      { name: "Hat Trick", description: "Pulls random buffs or debuffs from a magical hat" },
      { name: "Madness", description: "Attack speed increases as health decreases" }
    ],
    demand: "extreme",
    updates: ["Glitched serials #7 and #8 added", "Normal variant introduced late"],
    glitchedVal: 67,
    glitchedAC: 67,
    cursedVal: 67,
    cursedAC: 67,
    gcVal: 67,
    gcAC: 67,
    supply: 180
  }
];

export function ValueSite() {
  const [items] = useState<Item[]>(SAMPLE_ITEMS)
  const [activeTier, setActiveTier] = useState<Tier | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showCalculator, setShowCalculator] = useState(false)
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
          <h1 className="text-3xl font-bold mb-2 text-foreground">Values & shi </h1>
          <p className="text-muted-foreground">ou shiiiiii</p>
        </header>

        {/* Calculator button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setShowCalculator(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/80 transition-colors font-medium"
          >
            <CalcIcon size={20} />
            Trade Calculator
          </button>
        </div>

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

      {/* Calculator Modal */}
      {showCalculator && (
        <Calculator items={items} onClose={() => setShowCalculator(false)} />
      )}
    </div>
  )
}
