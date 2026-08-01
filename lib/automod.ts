import { Filter } from "bad-words"

const MAX_TEXT_LENGTH = 280
const MAX_TITLE_LENGTH = 90
const profanityFilter = new Filter()

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ")
}

function ratioOfUppercase(text: string): number {
  const letters = text.replace(/[^a-z]/gi, "")
  if (!letters) return 0
  const upper = (letters.match(/[A-Z]/g) || []).length
  return upper / letters.length
}

export function runAutomod(input: {
  title?: string
  note?: string
}): { allowed: boolean; reason?: string } {
  const title = input.title || ""
  const note = input.note || ""

  const combined = `${title} ${note}`.trim()
  if (!combined) {
    return { allowed: false, reason: "Tradepost needs a title or notes before it can be posted." }
  }

  if (title.length > MAX_TITLE_LENGTH || combined.length > MAX_TEXT_LENGTH) {
    return { allowed: false, reason: "Tradepost is too long for the board." }
  }

  const normalized = normalize(combined)
  if (profanityFilter.isProfane(normalized)) {
    return { allowed: false, reason: "Your post contains blocked language." }
  }

  const repeatedPunctuation = /([!?.,])\1{2,}/.test(combined)
  if (repeatedPunctuation) {
    return { allowed: false, reason: "Your post contains repeated punctuation that looks like spam." }
  }

  if (ratioOfUppercase(combined) > 0.55 && combined.length > 18) {
    return { allowed: false, reason: "Please avoid excessive caps in a tradepost." }
  }

  if (/https?:\/\//i.test(combined) && combined.split(/https?:\/\//i).length > 2) {
    return { allowed: false, reason: "Too many links in a single post." }
  }

  return { allowed: true }
}
