import { promises as fs } from "fs"
import path from "path"
import { describeSupabaseConfig, getSupabaseDataClient } from "@/lib/supabase"

export interface TradepostItemEntry {
  item: {
    id: string
    name: string
    tier: string
    image?: string
    glitchedVal?: number
    cursedVal?: number
  }
  serial: string
  isGlitched: boolean
  isCursed: boolean
}

export interface TradepostAuthor {
  id: string
  name: string
  avatar: string | null
  discordId: string | null
  isAnonymous: boolean
}

export interface TradepostComment {
  id: string
  text: string
  createdAt: string
  author: TradepostAuthor
}

export interface TradepostEntry {
  id: string
  title: string
  note: string
  giveItems: TradepostItemEntry[]
  getItems: TradepostItemEntry[]
  giveTotal: number
  getTotal: number
  createdAt: string
  author: TradepostAuthor
  comments: TradepostComment[]
}

const TABLE = "tradeposts"
const TRADEPOSTS_FILE = path.join(process.cwd(), "data", "tradeposts.json")

const globalForTradeposts = globalThis as typeof globalThis & {
  __fnhTradepostsMemory?: TradepostEntry[]
}

function normalizeTradepost(post: TradepostEntry): TradepostEntry {
  return {
    ...post,
    comments: Array.isArray(post.comments) ? post.comments : [],
    giveItems: Array.isArray(post.giveItems) ? post.giveItems : [],
    getItems: Array.isArray(post.getItems) ? post.getItems : [],
    giveTotal: Number(post.giveTotal) || 0,
    getTotal: Number(post.getTotal) || 0,
  }
}

function sortNewestFirst(posts: TradepostEntry[]) {
  return [...posts].sort((a, b) => (a.createdAt > b.createdAt ? -1 : a.createdAt < b.createdAt ? 1 : 0))
}

function setMemoryTradeposts(posts: TradepostEntry[]) {
  globalForTradeposts.__fnhTradepostsMemory = posts
}

function getMemoryTradeposts(): TradepostEntry[] {
  return globalForTradeposts.__fnhTradepostsMemory ?? []
}

/* -------------------------------------------------------------------------- */
/*  Local file fallback (dev only — the filesystem is read-only on Vercel)     */
/* -------------------------------------------------------------------------- */

async function readFileTradeposts(): Promise<TradepostEntry[]> {
  try {
    const raw = await fs.readFile(TRADEPOSTS_FILE, "utf8")
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed as TradepostEntry[]).map(normalizeTradepost) : []
  } catch {
    return []
  }
}

async function writeFileTradeposts(posts: TradepostEntry[]) {
  try {
    await fs.mkdir(path.dirname(TRADEPOSTS_FILE), { recursive: true })
    await fs.writeFile(TRADEPOSTS_FILE, JSON.stringify(posts, null, 2), "utf8")
  } catch {
    // Read-only filesystem (Vercel) — memory cache is the fallback instead.
  }
}

/* -------------------------------------------------------------------------- */
/*  Supabase access                                                           */
/* -------------------------------------------------------------------------- */

interface TradepostRow {
  id: string
  payload: TradepostEntry | null
}

function rowsToPosts(rows: TradepostRow[] | null): TradepostEntry[] {
  return (rows ?? [])
    .map((row) => {
      if (!row?.payload) return null
      // `payload` can come back as a JSON string if the column was ever text-typed.
      const payload =
        typeof row.payload === "string" ? (JSON.parse(row.payload) as TradepostEntry) : row.payload
      return normalizeTradepost({ ...payload, id: payload.id || row.id })
    })
    .filter((post): post is TradepostEntry => Boolean(post?.id))
}

export async function readTradeposts(): Promise<TradepostEntry[]> {
  const { client, isPrivileged } = getSupabaseDataClient()

  if (client) {
    const { data, error } = await client
      .from(TABLE)
      .select("id, payload")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] tradeposts read failed:", error.code, error.message)
    } else {
      const posts = sortNewestFirst(rowsToPosts(data as TradepostRow[]))

      if (posts.length > 0) {
        setMemoryTradeposts(posts)
        return [...posts]
      }

      if (isPrivileged) {
        // Service role bypasses RLS, so an empty result really means an empty table.
        setMemoryTradeposts(posts)
        return []
      }

      // Anon key + RLS with no SELECT policy returns an empty array and NO error,
      // which is exactly how a populated table looks like "0 tradeposts". Don't
      // trust it — fall through to the local mirror instead of wiping the board.
      console.warn(
        "[v0] tradeposts read returned 0 rows using the public key. Row Level Security is likely hiding them. " +
          "Set SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY), or add a SELECT policy from supabase/schema.sql.",
      )
    }
  } else {
    console.warn("[v0] Supabase not configured for tradeposts:", describeSupabaseConfig())
  }

  // Supabase unavailable, errored, or untrustworthy — fall back without destroying anything.
  const memory = getMemoryTradeposts()
  if (memory.length > 0) return [...memory]

  const filePosts = sortNewestFirst(await readFileTradeposts())
  setMemoryTradeposts(filePosts)
  return [...filePosts]
}

async function persistFallback(posts: TradepostEntry[]) {
  const next = sortNewestFirst(posts)
  setMemoryTradeposts(next)
  await writeFileTradeposts(next)
  return next
}

export async function writeTradeposts(posts: TradepostEntry[]) {
  return persistFallback(posts.map(normalizeTradepost))
}

/**
 * Writes a single post to Supabase. Returns true only when the row was actually saved.
 */
async function upsertToSupabase(post: TradepostEntry): Promise<boolean> {
  const { client } = getSupabaseDataClient()
  if (!client) return false

  const { error } = await client
    .from(TABLE)
    .upsert({ id: post.id, payload: post }, { onConflict: "id" })
    .select("id")

  if (error) {
    console.error("[v0] tradepost upsert failed:", error.code, error.message)
    return false
  }

  return true
}

export async function createTradepost(post: TradepostEntry) {
  const normalizedPost = normalizeTradepost(post)
  const saved = await upsertToSupabase(normalizedPost)
  const config = describeSupabaseConfig()

  if (!saved && config.hasUrl && config.hasServiceKey) {
    // Supabase is configured but rejected the write. Failing here is important:
    // the file fallback does not survive on Vercel, so a "success" would lose the post.
    throw new Error("Could not save your tradepost to the database. Please try again.")
  }

  const existing = await readTradeposts()
  const merged = existing.some((p) => p.id === normalizedPost.id)
    ? existing
    : [normalizedPost, ...existing]

  await persistFallback(merged)

  return normalizedPost
}

async function mutatePost(
  postId: string,
  mutate: (post: TradepostEntry) => TradepostEntry,
): Promise<TradepostEntry | null> {
  const posts = await readTradeposts()
  const current = posts.find((post) => post.id === postId)
  if (!current) return null

  const updated = normalizeTradepost(mutate(current))
  const nextPosts = posts.map((post) => (post.id === postId ? updated : post))

  await upsertToSupabase(updated)
  await persistFallback(nextPosts)

  return updated
}

export async function updateTradepost(postId: string, updates: Partial<TradepostEntry>) {
  return mutatePost(postId, (post) => ({ ...post, ...updates, id: post.id }))
}

export async function deleteTradepost(postId: string) {
  const posts = await readTradeposts()
  const nextPosts = posts.filter((post) => post.id !== postId)

  const { client } = getSupabaseDataClient()
  if (client) {
    const { error } = await client.from(TABLE).delete().eq("id", postId)
    if (error) console.error("[v0] tradepost delete failed:", error.code, error.message)
  }

  return persistFallback(nextPosts)
}

export async function addCommentToTradepost(postId: string, comment: TradepostComment) {
  return mutatePost(postId, (post) => ({
    ...post,
    comments: [...(post.comments || []), comment],
  }))
}

export async function deleteCommentFromTradepost(postId: string, commentId: string) {
  return mutatePost(postId, (post) => ({
    ...post,
    comments: (post.comments || []).filter((comment) => comment.id !== commentId),
  }))
}
