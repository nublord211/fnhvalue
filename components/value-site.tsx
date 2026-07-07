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
    glitchedOff: true,
    cursedOff: true,
    name: "Bling Freddy",
    tier: "exclusive",
    value: 95,
    ac: 764,
    era: "Summer upd 2025",
    releaseDate: "2025-04-14",
    skills: [
      { name: "Springlocked", description: "ez win" },
      { name: "Freddys thing ", description: "ez win" }
    ],
    demand: "moderate",
    updates: ["Now able to use sprnglocked"],
    supply: 500
  },
  {
    id: "2",
    glitchedOff: true,
    cursedOff: true,
    name: "Springtrap 2026",
    tier: "sacred",
    value: 215,
    ac: 180,
    era: "New years",
    releaseDate: "???",
    skills: [
      { name: "Spring Lock", description: "ez win" }
    ],
    demand: "extreme",
    supply: 181
  },
  {
    cursedOff: true,
    id: "3",
    name: "Nightmare Tidal King",
    tier: "sacred",
    value: 85,
    ac: 750,
    era: "Summer 2025",
    releaseDate: "???",
    skills: [
      { name: "Tidal Wave", description: "wave of baby oil" },
    ],
    demand: "extreme",
    updates: ["New vfx better ones coming soon"],
    glitchedVal: 1500,
    glitchedAC: 6,
  },
  {
    cursedOff: true,
    id: "4",
    name: "Dragon MXES",
    tier: "sacred",
    value: 65,
    ac: 300,
    era: "Lunar New Years",
    releaseDate: "???",
    skills: [
      { name: "Dragon Breath", description: "Releases racchet stank breath" },
    ],
    demand: "moderate",
    updates: ["ability still broken"],
    glitchedVal: 1000,
    glitchedAC: 4,
    supply: 300
  },
  {
    cursedOff: true,
    id: "5",
    name: "Midnight Motorist",
    tier: "sacred",
    value: 55,
    ac: 708,
    era: "Halloween",
    releaseDate: "????",
    skills: [
      { name: "Vengance", description: "buns ability " },

    ],
    demand: "extreme",
    updates: ["gc mm got created but got reversed"],
    glitchedVal: 1000,
    glitchedAC: 10,
    supply: 709
  },
  {
    cursedOff: true,
    id: "6",
    name: "Bloomtrap",
    tier: "secret",
    value: 60,
    ac: 316,
    era: "Easter",
    releaseDate: "04/04/2026",
    skills: [
      { name: "Springlocked", description: "ez win" },
      { name: "Gardeners grasp", description: "dumbass ability" },

    ],
    demand: "moderate",
    updates: ["can now get spirnglocked"],
    glitchedVal: 1120,
    glitchedAC: 3,
    ac: 316
  },
  {
    cursedOff: true,
    id: "7",
    name: "Clowntrap",
    tier: "sacred",
    value: 55,
    ac: 300,
    era: "Halloween 2025",
    releaseDate: "???",
    skills: [
      { name: "springlocked", description: "ez win" },

    ],
    demand: "trending",
    updates: ["Sudden rise in demand"],
    glitchedVal: 85,
    glitchedAC: 97,
    supply: 250
  },
  {
    cursedOff: true,
    id: "8",
    name: "Mad Hatter Vanny",
    tier: "sacred",
    value: 40,
    ac: 425,
    era: "Easter",
    releaseDate: "04/04/2026",
    skills: [
      { name: "Rabbits calling", description: "worse sha" },
    ],
    demand: "decent",
    updates: ["dumbass zero has g #8 now "],
    glitchedVal: 450,
    glitchedAC: 8,
    supply: 425
  },
  {
    cursedOff: true,
    id: "9",
    name: "Lava ennard",
    tier: "sacred",
    value: 35,
    ac: 512,
    era: "TJOC",
    releaseDate: "???",
    skills: [
      { name: "Limb GRIPPER", description: "grip those limbs boi" },
    ],
    demand: "moderate",
    updates: ["new vfx"],
    glitchedVal: 400,
    glitchedAC: 1,
    supply: 512
  },
  {
    cursedOff: true,
    id: "10",
    name: "Withered moon rose",
    tier: "sacred",
    value: 30,
    ac: 500,
    era: "Valentines",
    releaseDate: "???",
    skills: [
      { name: "fuckass moon ability", description: "worse than ampt im crine" },
    ],
    demand: "none",
    glitchedVal: 275,
    glitchedAC: 5,
    supply: 500
  },
  {
    id: "11",
    name: "Crimson Ballora",
    tier: "sacred",
    value: 25,
    ac: 1050,
    era: "Lunar New Year",
    releaseDate: "???",
    skills: [
      { name: "fuckass fan", description: "35 free dmg with a decent cd" },
    ],
    demand: "high",
    glitchedVal: 175,
    updates: ["ability got nerfed"],
    glitchedAC: 20,
    supply: 1000
  },
  {
    cursedOff: true,
    id: "12",
    name: "The Pumpkin Rabbit",
    tier: "sacred",
    value: 20,
    ac: 700,
    era: "Walten Files",
    releaseDate: "???",
    skills: [
      { name: "shadow clone", description: "shadow clone n shi" },
    ],
    demand: "none",
    glitchedVal: 150,
    glitchedAC: 8,
    supply: 700
  },
  
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
