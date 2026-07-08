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
    image: "/Skins/Bling.webp",
    tier: "exclusive",
    value: 95,
    ac: 764,
    era: "Summer upd 2025",
    releaseDate: "04/14/2025",
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
    image: "",
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
    image: "/Skins/Tidal.webp",
    tier: "sacred",
    value: 85,
    ac: 724,
    era: "Summer 2025",
    releaseDate: "???",
    skills: [
      { name: "Tidal Wave", description: "wave of baby oil" },
    ],
    demand: "extreme",
    updates: ["New vfx better ones coming soon"],
    glitchedVal: 1600,
    glitchedAC: 6,
    supply: 724

  },
  {
    cursedOff: true,
    id: "4",
    name: "Dragon MXES",
    image: "/Skins/DragonMXES.webp",
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
    glitchedVal: 925,
    glitchedAC: 4,
    supply: 300
  },
  {
    cursedOff: true,
    id: "5",
    name: "Midnight Motorist",
    image: "/Skins/MidnightMotorist.webp",
    tier: "sacred",
    value: 60,
    ac: 790,
    era: "Halloween",
    releaseDate: "????",
    skills: [
      { name: "Vengance", description: "buns ability " },

    ],
    demand: "high",
    updates: ["gc mm got created but got reversed"],
    glitchedVal: 1100,
    glitchedAC: 10,
    supply: 790
  },
  {
    cursedOff: true,
    id: "6",
    name: "Bloomtrap",
    image: "/Skins/Bloomtrap.webp",
    tier: "secret",
    value: 60,
    ac: 316,
    era: "Easter",
    releaseDate: "04/04/2026",
    skills: [
      { name: "Springlocked", description: "ez win" },
      { name: "Gardeners grasp", description: "dumbass ability" },

    ],
    demand: "high",
    updates: ["can now get spirnglocked"],
    glitchedVal: 800,
    glitchedAC: 3,
    supply: 316

  },
  {
    cursedOff: true,
    id: "7",
    name: "Clowntrap",
    image: "/Skins/Clowntrap.webp",
    tier: "sacred",
    value: 50,
    ac: 281,
    era: "Halloween 2025",
    releaseDate: "???",
    skills: [
      { name: "springlocked", description: "ez win" },

    ],
    demand: "trending",
    updates: ["Sudden rise in demand"],
    glitchedVal: 75,
    glitchedAC: 97,
    supply: 281
  },
  {
    cursedOff: true,
    id: "8",
    name: "Mad Hatter Vanny",
    image: "/Skins/Mad-Hatter-Vanny.webp",
    tier: "sacred",
    value: 40,
    ac: 488,
    era: "Easter",
    releaseDate: "04/04/2026",
    skills: [
      { name: "Rabbits calling", description: "worse sha" },
    ],
    demand: "decent",
    updates: ["dumbass zero has g #8 now "],
    glitchedVal: 450,
    glitchedAC: 8,
    supply: 488
  },
  {
    cursedOff: true,
    id: "9",
    name: "Lava ennard",
    image: "/Skins/LavaEnnard.webp",
    tier: "sacred",
    value: 35,
    ac: 525,
    era: "TJOC",
    releaseDate: "???",
    skills: [
      { name: "Limb GRIPPER", description: "grip those limbs boi" },
    ],
    demand: "moderate",
    updates: ["new vfx"],
    glitchedVal: 400,
    glitchedAC: 1,
    supply: 525
  },
  {
    cursedOff: true,
    id: "10",
    name: "Withered moon rose",
    image: "/Skins/Withered-Moon-Rose.webp",
    tier: "sacred",
    value: 30,
    ac: 582,
    era: "Valentines",
    releaseDate: "???",
    skills: [
      { name: "fuckass moon ability", description: "worse than ampt im crine" },
    ],
    demand: "decent",
    glitchedVal: 275,
    glitchedAC: 5,
    supply: 582
  },
  {
    id: "11",
    name: "Crimson Ballora",
    image: "/Skins/CrimsonBallora.webp",
    tier: "mythic",
    value: 25,
    ac: 1096,
    era: "Lunar New Year",
    releaseDate: "???",
    skills: [
      { name: "fuckass fan", description: "35 free dmg with a decent cd" },
    ],
    demand: "high",
    glitchedVal: 175,
    updates: ["ability got nerfed"],
    glitchedAC: 20,
    gcVal: 600,
    gcAC: 1,
    supply: 1096
  },
  {
    cursedOff: true,
    id: "12",
    name: "The Pumpkin Rabbit",
    image: "/Skins/ThePumpkinRabbit.webp",
    tier: "sacred",
    value: 17,
    ac: 803
,
    era: "Walten Files",
    releaseDate: "???",
    skills: [
      { name: "shadow clone", description: "shadow clone n shi" },
    ],
    demand: "decent",
    glitchedVal: 150,
    glitchedAC: 8,
    supply: 803

  },
  {
    glitchedOff: true,
    cursedOff: true,
    id: "13",
    name: "8-bit",
    image: "/Skins/8-bit.webp",
    tier: "sacred",
    value: 20,
    ac: 556,
    era: "I dont fucking know son",
    releaseDate: "???",
    skills: [
      { name: "vengance", description: "L ability" },
    ],
    demand: "none",
    supply: 500
  },
  {
    cursedOff: true,
    id: "14",
    name: "Blooming ennard",
    image: "/Skins/BloomingEnnard.webp",
    tier: "sacred",
    value: 13,
    ac: 673,
    era: "Easter",
    releaseDate: "???",
    skills: [
      { name: "limb gripper(vegan edition)", description: "free win(no animals were harmed in the making of this skill)" },
    ],
    demand: "moderate",
    supply: 673,
    glitchedVal: 120,
    glitchedAC: 10
  },
  {
    id: "15",
    name: "Sun-kissed-drop",
    image: "/Skins/Sun-kissed-drop.webp",
    tier: "sacred",
    value: 10,
    ac: 2686,
    era: "Valentines",
    releaseDate: "???",
    skills: [
      { name: "kissy kissy drop", description: "the name isnt freaky trust" },
    ],
    demand: "moderate",
    supply: 2000,
    cursedVal: 33,
    cursedAC: 20,
  },
  {
    glitchedOff: true,
    id: "16",
    name: "Snowfall",
    image: "",
    tier: "sacred",
    value: 7,
    ac: 4216,
    era: "Christmas",
    releaseDate: "???",
    skills: [
      { name: "snowfall", description: "use anything else bro please" },
    ],
    demand: "moderate",
    supply: 4000,
    cursedVal: 22,
    cursedAC: 40,
  },
  {
    id: "17",
    name: "Creation",
    image: "/Skins/Creation.webp",
    tier: "sacred",
    value: 5,
    ac: 6732,
    era: "TJOC",
    releaseDate: "???",
    skills: [
      { name: "crwation thingy", description: "nerfed to hell" },
    ],
    demand: "moderate",
    updates: ["ability got nerfed to hell"],
    supply: 6000,
    glitchedVal: 30,
    glitchedAC: 65,
    cursedVal: 15,
    cursedAC: 340,
    gcVal: 80,
    gcAC: 10
  },
  {
    cursedOff: true,
    id: "18",
    name: "Chicas magic rainbow",
    image: "",
    tier: "sacred",
    value: 22,
    ac: 493,
    era: "Easter",
    releaseDate: "???",
    skills: [
      { name: "rainbow save thingy", description: "takes 20% longer 4 u to die in ballpits" },
    ],
    demand: "moderate",
    supply: 475,
    glitchedVal: 300,
    glitchedAC: 10,
  },
  {
    cursedOff: true,
    id: "19",
    name: "Blessed Helpy",
    image: "",
    tier: "sacred",
    value: 18,
    ac: 1040,
    era: "Lunar New Year",
    releaseDate: "???",
    skills: [
      { name: "helping hand", description: "nerfed to hell bust still op" },
    ],
    demand: "trending",
    updates: ["ability got nerfed to hell"],
    supply: 1419,
    glitchedVal: 30,
    glitchedAC: 65,
    cursedVal: 15,
    cursedAC: 340,
    gcVal: 80,
    gcAC: 10
  },
  {
    id: "20",
    name: "Bullfighter Endo",
    image: "",
    tier: "exclusive",
    value: 5,
    ac: 1745,
    era: "???",
    releaseDate: "???",
    demand: "moderate",
},
{
    id: "21",
    name: "Kitsune Lolbit",
    image: "/Skins/Kitsune.webp",
    tier: "exclusive",
    value: 3,
    ac: 5652,
    era: "???",
    releaseDate: "???",
    demand: "moderate",
},
{
    id: "22",
    name: "Freedom Freddy",
    image: "/Skins/FreedomFreddy.webp",
    tier: "exclusive",
    value: 4,
    ac: 2786,
    era: "???",
    releaseDate: "???",
    demand: "moderate",
},
{
    id: "23",
    name: "Birthday Bash Bonnie",
    image: "/Skins/BirthdayBash.webp",
    tier: "exclusive",
    value: 2,
    ac: 1320,
    era: "???",
    releaseDate: "???",
    demand: "moderate",
},
{
    id: "24",
    name: "Vocalist Bonnie",
    image: "/Skins/Vocalist.webp",
    tier: "exclusive",
    value: 3,
    ac: 2790,
    era: "???",
    releaseDate: "???",
    demand: "moderate",
},
{
    id: "25",
    name: "Lucky Charm Endo-01",
    image: "/Skins/LuckyCharm.webp",
    tier: "exclusive",
    value: 1,
    ac: 1501,
    era: "???",
    releaseDate: "???",
    demand: "moderate",
},
{
    id: "26",
    name: "Twisted Bonnie",
    image: "",
    tier: "exclusive",
    value: 4,
    ac: 4227,
    era: "???",
    releaseDate: "???",
    demand: "moderate",
},
{
    id: "27",
    name: "Chick Chica",
    image: "/Skins/Chick.png",
    tier: "exclusive",
    value: 1,
    ac: 1450,
    era: "???",
    releaseDate: "???",
    demand: "moderate",
},
{
    id: "28",
    name: "Catrina Chica",
    image: "/Skins/CatrinaChica.webp",
    tier: "exclusive",
    value: 4,
    ac: 1518,
    era: "???",
    releaseDate: "???",
    demand: "moderate",
},
{
    id: "29",
    name: "Monarch Baby",
    image: "/Skins/MonarchBaby.webp",
    tier: "exclusive",
    value: 1,
    ac: 2000,
    era: "???",
    releaseDate: "???",
    demand: "moderate",
},
{
    id: "30",
    name: "Lady Chica",
    image: "/Skins/LadyChica.webp",
    tier: "exclusive",
    value: 5,
    ac: 4505,
    era: "???",
    releaseDate: "???",
    demand: "moderate",
},
{
    id: "31",
    name: "Ringmaster Foxy",
    image: "/Skins/RIngMasterFoxy.webp",
    tier: "exclusive",
    value: 4,
    ac: 1262,
    era: "???",
    releaseDate: "???",
    demand: "moderate",
},
{
    id: "32",
    name: "Glam Chica",
    image: "",
    tier: "exclusive",
    value: 4,
    ac: 3981,
    era: "???",
    releaseDate: "???",
    demand: "moderate",
},
{
    id: "33",
    name: "The Mangle",
    image: "/Skins/The-Mangle.webp",
    tier: "exclusive",
    value: 1,
    ac: 1318,
    era: "???",
    releaseDate: "???",
    demand: "moderate",
},
{
    id: "34",
    name: "Hungry(chud) Freddy",
    image: "/Skins/HungryFreddy.webp",
    tier: "exclusive",
    value: 4,
    ac: 2005,
    era: "???",
    releaseDate: "???",
    demand: "moderate",
},
{
    id: "35",
    name: "Trickster Puppet",
    image: "/Skins/TricksterPuppet.webp",
    tier: "exclusive",
    value: 2,
    ac: 2649,
    era: "???",
    releaseDate: "???",
    demand: "moderate",
},
{
    id: "36",
    name: "Captain Foxy",
    image: "/Skins/CaptainFoxy.webp",
    tier: "exclusive",
    value: 4,
    ac: 2893,
    era: "???",
    releaseDate: "???",
    demand: "moderate",
},
{
    id: "37",
    name: "Sprinting Fredbear",
    image: "/Skins/SprintingFredbear.webp",
    tier: "exclusive",
    value: 2,
    ac: 3378,
    era: "???",
    releaseDate: "???",
    demand: "moderate",
},
{
    id: "38",
    name: "Samurai Foxy",
    image: "",
    tier: "exclusive",
    value: 7,
    ac: 4838,
    era: "???",
    releaseDate: "???",
    demand: "moderate",
},
{
    id: "39",
    name: "Glamrock Foxy",
    image: "/Skins/GlamrockFoxy.webp",
    tier: "exclusive",
    value: 2,
    ac: 4543,
    era: "???",
    releaseDate: "???",
    demand: "moderate",
},
{
    id: "40",
    name: "Bling Bonnie",
    image: "",
    tier: "exclusive",
    value: 4,
    ac: 1306,
    era: "???",
    releaseDate: "???",
    demand: "moderate",
},
{
    id: "42",
    name: "Loveshot Mangle",
    image: "/Skins/LoveShot.webp",
    tier: "exclusive",
    value: 2,
    ac: 3702,
    era: "Valentines",
    releaseDate: "???",
    demand: "moderate",
},
{
    id: "43",
    name: "Lava Marionette",
    image: "/Skins/LavaMarionette.webp",
    tier: "exclusive",
    value: 2,
    ac: 4253,
    era: "TJOC",
    releaseDate: "???",
    demand: "moderate",
},
{
    id: "44",
    name: "Krampus Burntrap",
    image: "/Skins/KrampusBurntrap.webp",
    tier: "exclusive",
    value: 2,
    ac: 5512,
    era: "Christmas",
    releaseDate: "???",
    demand: "moderate",
},
{
    id: "45",
    name: "Cardmaster Bonnie",
    image: "",
    tier: "exclusive",
    value: 5,
    ac: 7354,
    era: "???",
    releaseDate: "???",
    demand: "moderate",
},
{
    id: "46",
    name: "Baker Freddy",
    image: "",
    tier: "exclusive",
    value: 3,
    ac: 1157,
    era: "???",
    releaseDate: "???",
    demand: "moderate",
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
