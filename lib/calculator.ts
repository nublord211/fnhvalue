import { Item } from "./types"

// Utility functions
function toFiniteNumber(value: number | null | undefined): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null
  return value
}

function getVariantBaseValue(item: Item, isGlitched: boolean, isCursed: boolean): number {
  const baseValue = toFiniteNumber(item?.value) ?? 0
  const glitchedValue = toFiniteNumber(item?.glitchedVal)
  const cursedValue = toFiniteNumber(item?.cursedVal)
  const gcValue = toFiniteNumber(item?.gcVal)

  if (isGlitched && isCursed) {
    if (gcValue !== null) return gcValue
    if (glitchedValue !== null) return Math.round(glitchedValue * 3.25)
    if (cursedValue !== null) return cursedValue
    return baseValue
  }

  if (isCursed && cursedValue !== null) return cursedValue
  if (isGlitched && glitchedValue !== null) return glitchedValue
  return baseValue
}

export function fmt(n: number | null | undefined): string {
  if (n === null || n === undefined) return "?"
  if (typeof n !== "number" || !Number.isFinite(n)) return "?"
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

function getPositiveNumber(value: number | null | undefined): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return null
  return value
}

function getBaseSupply(skin: Item): number | null {
  return getPositiveNumber(skin.supply) ?? getPositiveNumber(skin.ac) ?? null
}

// Get static (historical max) supply from skin object
export function getStaticSupply(skin: Item, isGlitched: boolean, isCursed: boolean): number | null {
  const baseSupply = getBaseSupply(skin)

  if (isGlitched && isCursed) {
    if (getPositiveNumber(skin.gcAC) !== null) return getPositiveNumber(skin.gcAC) as number
    if (getPositiveNumber(skin.cursedAC) !== null) return getPositiveNumber(skin.cursedAC) as number
    if (getPositiveNumber(skin.glitchedAC) !== null) return getPositiveNumber(skin.glitchedAC) as number
    if (baseSupply != null) return Math.max(2, Math.floor(baseSupply * 0.05))
    return null
  }

  if (isCursed) {
    if (getPositiveNumber(skin.cursedAC) !== null) return getPositiveNumber(skin.cursedAC) as number
    if (baseSupply != null) return Math.max(2, Math.floor(baseSupply * 0.05))
    return null
  }

  if (isGlitched) {
    if (getPositiveNumber(skin.glitchedAC) !== null) return getPositiveNumber(skin.glitchedAC) as number
    if (baseSupply != null) return Math.max(2, Math.floor(baseSupply * 0.02))
    return null
  }

  return baseSupply
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

function multiplierFromSerial(serial: number, supply: number, isExclusive: boolean = false): number | null {
  const n = Math.floor(Number(serial))
  const S = Math.floor(Number(supply))

  if (!Number.isFinite(n) || !Number.isFinite(S) || S < 2) return 1.0
  if (n <= 1) return null

  const nn = clamp(n, 2, S)
  const maxMultiplier = isExclusive ? 4.0 : 2.0

  if (nn <= 2) return 1.0

  const progress = (nn - 2) / Math.max(1, S - 2)
  return easedLerp(1.0, maxMultiplier, progress, 2.2)
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

  const isExclusive = String(skin?.tier || "").toLowerCase() === "exclusive"
  const baseValue = getVariantBaseValue(skin, isGlitched, isCursed)

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
  
  const mult = multiplierFromSerial(serialNum, supply, isExclusive)
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
  const serialNumber = typeof serial === "number" && Number.isFinite(serial) ? serial : undefined

  // If we have a serial and it's a serial-affected skin, calculate serial value
  if (serialNumber !== undefined && serialNumber > 1 && isSerialAffectedSkin(item)) {
    const result = getSerialValue(item, serialNumber, isGlitched, isCursed)
    if (result && result.value !== null) {
      return result.value
    }
  }

  return getVariantBaseValue(item, isGlitched, isCursed)
}
