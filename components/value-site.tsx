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
    ac: 764,
    era: "Summer upd 2025",
    releaseDate: "2025-04-14",
    skills: [
      { name: "Springlocked", description: "ez win" },
      { name: "Freddys thing ", description: "ez win" }
    ],
    demand: "mid",
    updates: ["Now able to use sprnglocked"],
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
    era: "New years",
    releaseDate: "???",
    skills: [
      { name: "Spring Lock", description: "ez win" }
    ],
    demand: "extreme",
    glitchedVal: 67,
    glitchedAC: 67,
    cursedVal: 67,
    cursedAC: 67,
    gcVal: 67,
    gcAC: 67,
    supply: 181
  },
  {
    id: "3",
    name: "Nightmare Tidal King",
    tier: "sacred",
    value: 67,
    ac: 67,
    era: "Summer 2025",
    releaseDate: "???",
    skills: [
      { name: "Tidal Wave", description: "wave of baby oil" },
    ],
    demand: "extreme",
    updates: ["New vfx better ones coming soon"],
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
    era: "Lunar New Years",
    releaseDate: "???",
    skills: [
      { name: "Dragon Breath", description: "Releases racchet stank breath" },
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
    releaseDate: "????",
    skills: [
      { name: "Midnight Drive", description: "cya mane" },

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
    releaseDate: "04/04/2026",
    skills: [
      { name: "Pollen bust", description: "sprays toxic shi in ur eyes" },

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
    era: "Halloween 2025",
    releaseDate: "???",
    skills: [
      { name: "Laughing Gas", description: "Gassy laughing" },

    ],
    demand: "high",
    updates: ["Sudden rise in demand"],
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
    era: "Easter",
    releaseDate: "04/04/2026",
    skills: [
      { name: "Rabbits calling", description: "worse sha" },
    ],
    demand: "extreme",
    updates: ["dumbass zero has g #8 now "],
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
