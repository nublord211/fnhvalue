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

export type Demand = "none" | "moderate" | "decent" | "high" | "extreme"

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
