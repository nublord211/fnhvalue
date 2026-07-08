import { Item } from "./types"

// Utility functions
export function fmt(n: number | null | undefined): string {
  if (n === null || n === undefined) return "?"
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B"
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M"
  if (n >= 1e3) return (n / 1e3).toFixed(2) + "K"
  return Math.round(n).toString()
}

export function toNumber(s: string): number {
  const n = parseFloat(String(s).replace(/[^0-9.-]/g, ""))
  return Number.isFinite(n) ? n : NaN
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

const FLAT_GC_SERIAL_SKINS = new Set([
  "purpleguy",
  "ennard",
  "mxes",
  "lolbit",
  "nightmarefredbear",
  "nightmare",
  "vanny",
  "scrapbaby",
  "lefty",
  "burntrap"
])

function skinNameKey(name: string): string {
  return String(name || "").toLowerCase().replace(/[^a-z0-9]/g, "")
}

function usesFlatEGCSerialPricing(skin: Item, isGlitched: boolean, isCursed: boolean): boolean {
  return !!(skin && isGlitched && isCursed && FLAT_GC_SERIAL_SKINS.has(skinNameKey(skin.name)))
}

// Get static (historical max) supply from skin object
export function getStaticSupply(skin: Item, isGlitched: boolean, isCursed: boolean): number | null {
  const baseSupply = (skin.supply != null && skin.supply > 0) ? skin.supply : null
  if (isGlitched && isCursed) {
    if (skin.gcAC != null) return skin.gcAC
    const cursedS = skin.cursedAC != null ? skin.cursedAC : (baseSupply != null ? Math.floor(baseSupply * 0.05) : null)
    return cursedS != null ? Math.max(1, Math.floor(cursedS * 0.15)) : null
  } else if (isCursed) {
    if (skin.cursedAC != null) return skin.cursedAC
    return baseSupply != null ? Math.max(1, Math.floor(baseSupply * 0.05)) : null
  } else if (isGlitched) {
    if (skin.glitchedAC != null) return skin.glitchedAC
    return baseSupply != null ? Math.max(1, Math.floor(baseSupply * 0.02)) : null
  } else {
    return baseSupply
  }
}

// Serial multiplier calculations
function easedLerp(from: number, to: number, t: number, exponent: number = 2.0): number {
  const tt = clamp(t, 0, 1)
  const eased = 1 - Math.pow(1 - tt, exponent)
  return from + (to - from) * eased
}

function getTierEnds(supply: number): { tier1End: number; tier2End: number; tier3End: number; cap: number } {
  const S = Math.max(2, Math.floor(Number(supply) || 0))
  let tier1End = Math.max(2, Math.round(S * 0.014))
  let tier2End = Math.max(tier1End + 1, Math.round(S * 0.138))
  let tier3End = Math.max(tier2End + 1, Math.round(S * 0.691))
  // Safety clamps
  if (tier3End >= S) tier3End = Math.max(tier2End + 1, S - 1)
  if (tier2End >= tier3End) tier2End = Math.max(tier1End + 1, tier3End - 1)
  if (tier1End >= tier2End) tier1End = Math.max(2, tier2End - 1)
  return { tier1End, tier2End, tier3End, cap: S }
}

function multiplierFromSerial(serial: number, supply: number): number | null {
  const n = Math.floor(Number(serial))
  const S = Math.floor(Number(supply))
  
  if (!Number.isFinite(n) || !Number.isFinite(S) || S < 2) return 1.0
  if (n <= 1) return null
  
  const nn = clamp(n, 2, S)
  const { tier1End, tier2End, tier3End, cap } = getTierEnds(S)
  
  if (nn <= tier1End) {
    const t = (nn - 2) / Math.max(1, tier1End - 2)
    return easedLerp(2.00, 1.75, t, 3.0)
  }
  
  if (nn <= tier2End) {
    const t = (nn - (tier1End + 1)) / Math.max(1, tier2End - (tier1End + 1))
    return easedLerp(1.75, 1.40, t, 2.6)
  }
  
  if (nn <= tier3End) {
    const t = (nn - (tier2End + 1)) / Math.max(1, tier3End - (tier2End + 1))
    return easedLerp(1.40, 1.18, t, 2.2)
  }
  
  const t = (nn - (tier3End + 1)) / Math.max(1, cap - (tier3End + 1))
  return easedLerp(1.18, 1.00, t, 4.0)
}

export interface SerialValueResult {
  value: number | null
  isOC: boolean
  isSacreds?: boolean
  multiplier?: number
  flatEGC?: boolean
}

export function getSerialValue(skin: Item, serial: number, isGlitched: boolean, isCursed: boolean = false): SerialValueResult | null {
  const serialNum = toNumber(String(serial || "").replace(/,/g, ""))
  if (!Number.isFinite(serialNum) || serialNum < 0) return null
  
  if (serialNum === 0 || serialNum === 1) return { value: null, isOC: true }
  if (skin.serial2_unique && serialNum === 2) return { value: null, isOC: true }

  const baseValue = isCursed && isGlitched
    ? (skin.gcVal != null ? skin.gcVal : (skin.glitchedVal != null ? skin.glitchedVal * 3 : skin.value * 3))
    : isCursed
      ? (skin.cursedVal != null ? skin.cursedVal : skin.value * 3)
      : isGlitched
        ? (skin.glitchedVal != null ? skin.glitchedVal : skin.value)
        : skin.value

  if (usesFlatEGCSerialPricing(skin, isGlitched, isCursed)) {
    return { value: baseValue, isOC: false, isSacreds: true, multiplier: 1.0, flatEGC: true }
  }
  
  // Bling Freddy has no serial multiplier (flat pricing)
  if (skin.name === "Bling Freddy" && !isGlitched && !isCursed) {
    return { value: baseValue, isOC: false, isSacreds: true, multiplier: 1.0, flatEGC: true }
  }
  
  const rarity = String(skin.tier || "").toLowerCase()
  if (rarity !== "sacred" && rarity !== "mythic" && rarity !== "secret" && rarity !== "exclusive") {
    return { value: baseValue, isOC: false, multiplier: 1.0 }
  }
  
  const supply = getStaticSupply(skin, isGlitched, isCursed)

  // If supply is unknown or too small, return base value only
  if (supply == null || supply < 2) {
    return { value: baseValue, isOC: false, isSacreds: true, multiplier: 1.0 }
  }
  
  // Serial beyond total minted supply → base value only, no premium
  if (serialNum > supply) {
    return { value: baseValue, isOC: false, isSacreds: true, multiplier: 1.0 }
  }
  
  const mult = multiplierFromSerial(serialNum, supply)
  if (mult === null) return { value: null, isOC: true }
  
  // Universal formula: value = baseValue × serialMultiplier(serial, supply)
  return { value: baseValue * mult, isOC: false, isSacreds: true, multiplier: mult }
}

export function getMaxSupply(skin: Item, isGlitched: boolean, isCursed: boolean): number | null {
  // Only treat serial_values length as the total supply for TRULY unique skins
  const isUniqueVariant = (
    (isGlitched && skin.glitched_unique === true) ||
    (!isGlitched && skin.unique_value === true)
  )
  if (isUniqueVariant) {
    if (isGlitched && isCursed && skin.serial_values?.glitched_cursed) {
      return Object.keys(skin.serial_values.glitched_cursed).length
    }
    if (isGlitched && !isCursed && skin.serial_values?.glitched) {
      return Object.keys(skin.serial_values.glitched).length
    }
    if (!isGlitched && isCursed && skin.serial_values?.cursed) {
      return Object.keys(skin.serial_values.cursed).length
    }
    if (!isGlitched && !isCursed && skin.serial_values?.normal) {
      return Object.keys(skin.serial_values.normal).length
    }
  }

  return getStaticSupply(skin, isGlitched, isCursed)
}

export function isSerialAffectedSkin(skin: Item): boolean {
  if (!skin) return false
  const rarity = (skin.tier || "").toLowerCase()
  return rarity === "sacred" || rarity === "mythic" || rarity === "secret" || rarity === "exclusive"
}

export function getItemValue(item: Item, isGlitched: boolean, isCursed: boolean, serial?: number): number {
  // If we have a serial and it's a serial-affected skin, calculate serial value
  if (serial !== undefined && serial > 1 && isSerialAffectedSkin(item)) {
    const result = getSerialValue(item, serial, isGlitched, isCursed)
    if (result && result.value !== null) {
      return result.value
    }
  }
  
  // Otherwise return base value for variant
  if (isGlitched && isCursed && item.gcVal !== undefined) return item.gcVal
  if (isCursed && item.cursedVal !== undefined) return item.cursedVal
  if (isGlitched && item.glitchedVal !== undefined) return item.glitchedVal
  return item.value
}
