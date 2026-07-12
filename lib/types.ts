export type Tier = 
  | "secret" 
  | "sacred" 
  | "exclusive" 
  | "mythic" 
  | "legendary" 
  | "epic" 
  | "rare"
  | "uncommon" 
  | "common"

export type Demand = "none" | "moderate" | "decent" | "high" | "trending" | "extreme" 

export type SortOption = "default" | "value-low" | "value-high" | "date-new" | "date-old"

export interface Skill {
  name: string
  description: string
}

export interface Item {
  id: string
  name: string
  tier: Tier
  image?: string
  value: number
  ac?: number
  era?: string
  releaseDate?: string
  skills?: Skill[]
  demand?: Demand
  updates?: string[]
  glitchedOff?: boolean
  cursedOff?: boolean
  glitchedVal?: number
  glitchedAC?: number
  cursedVal?: number
  cursedAC?: number
  gcVal?: number
  gcAC?: number
  // Supply fields for calculator
  supply?: number
  glitched_supply?: number
  cursed_supply?: number
  cursed_glitched_supply?: number
  serial2_unique?: boolean
  unique_value?: boolean
  glitched_unique?: boolean
  serial_values?: {
    normal?: Record<string, number>
    glitched?: Record<string, number>
    cursed?: Record<string, number>
    glitched_cursed?: Record<string, number>
  }
}

export const TIER_COLORS: Record<Tier, string> = {
  secret: "#22c55e",      // green
  sacred: "#4a4a4a",      // blackish grey
  exclusive: "#ec4899",   // pink
  mythic: "#ef4444",      // red
  legendary: "#f97316",   // orange
  epic: "#a855f7",        // purple
  rare: "#3b82f6",        // blue
  uncommon: "#86efac",    // lighter green
  common: "#eab308",      // yellow
}

export const DEMAND_COLORS: Record<Demand, string> = {
  none: "#6b7280",        // grey
  moderate: "#eab308",    // yellow
  decent: "#22c55e",      // green
  trending: "#4B0082",   // indigo
  high: "#3b82f6",        // blue
  extreme: "#ef4444",     // red
}

export const TIER_ORDER: Tier[] = [
  "secret",
  "sacred", 
  "exclusive",
  "mythic",
  "legendary",
  "epic",
  "rare",
  "uncommon",
  "common"
]

export const SITE_COLORS = {
  glitched: {
    activeBg: "#581c87",
    activeText: "#f0abfc",
    inactiveBg: "#F2C1D1",
    inactiveText: "#581c87",
  },
  cursed: {
    activeBg: "#FE5A1D",
    activeText: "#fde68a",
    inactiveBg: "#fef3c7",
    inactiveText: "#FF7538",
  },
  updatePanel: "#BA160C",
  successBg: "#14532d",
  successBorder: "#166534",
  successText: "#4ade80",
  dangerBg: "#7f1d1d",
  dangerBorder: "#991b1b",
  dangerText: "#f87171",
  warningText: "#facc15",
  infoText: "#60a5fa",
}
