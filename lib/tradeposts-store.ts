import { promises as fs } from "fs"
import path from "path"
import { getSupabaseClient } from "@/lib/supabase"

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
  }
}

async function ensureStoreFile() {
  await fs.mkdir(path.dirname(TRADEPOSTS_FILE), { recursive: true })

  try {
    await fs.access(TRADEPOSTS_FILE)
  } catch {
    await fs.writeFile(TRADEPOSTS_FILE, "[]", "utf8")
  }
}

function setMemoryTradeposts(posts: TradepostEntry[]) {
  globalForTradeposts.__fnhTradepostsMemory = posts
}

export async function readTradeposts(): Promise<TradepostEntry[]> {
  const client = getSupabaseClient()
  if (client) {
    try {
      const { data, error } = await client.from("tradeposts").select("payload").order("created_at", { ascending: false })
      if (!error && data) {
        const nextPosts = (data
          .map((row: { payload?: TradepostEntry }) => row.payload)
          .filter(Boolean) as TradepostEntry[])
          .map(normalizeTradepost)

        setMemoryTradeposts(nextPosts)
        return [...nextPosts]
      }
    } catch (error) {
      console.error("Supabase tradeposts read failed; falling back to file store.", error)
    }
  }

  try {
    await ensureStoreFile()
    const raw = await fs.readFile(TRADEPOSTS_FILE, "utf8")
    const parsed = JSON.parse(raw) as unknown
    const nextPosts = Array.isArray(parsed) ? (parsed as TradepostEntry[]).map(normalizeTradepost) : []
    setMemoryTradeposts(nextPosts)
    return [...nextPosts]
  } catch {
    const fallbackPosts: TradepostEntry[] = []
    setMemoryTradeposts(fallbackPosts)
    return fallbackPosts
  }
}

export async function writeTradeposts(posts: TradepostEntry[]) {
  setMemoryTradeposts(posts)

  try {
    await ensureStoreFile()
    await fs.writeFile(TRADEPOSTS_FILE, JSON.stringify(posts, null, 2), "utf8")
  } catch (error) {
    console.error("Tradeposts disk persistence failed; using in-memory fallback.", error)
  }
}

export async function createTradepost(post: TradepostEntry) {
  const normalizedPost = normalizeTradepost(post)
  const client = getSupabaseClient()

  if (client) {
    try {
      const { error } = await client.from("tradeposts").insert({ id: normalizedPost.id, payload: normalizedPost })
      if (!error) {
        const posts = await readTradeposts()
        const nextPosts = [normalizedPost, ...posts.filter((existing) => existing.id !== normalizedPost.id)]
        await writeTradeposts(nextPosts)
        return normalizedPost
      }
    } catch (error) {
      console.error("Supabase tradepost insert failed; falling back to file store.", error)
    }
  }

  const posts = await readTradeposts()
  const nextPosts = [normalizedPost, ...posts]
  await writeTradeposts(nextPosts)
  return normalizedPost
}

export async function updateTradepost(postId: string, updates: Partial<TradepostEntry>) {
  const client = getSupabaseClient()
  const posts = await readTradeposts()
  const nextPosts = posts.map((post) => {
    if (post.id !== postId) return post
    return normalizeTradepost({ ...post, ...updates })
  })

  if (client) {
    try {
      const target = nextPosts.find((post) => post.id === postId)
      if (target) {
        const { error } = await client.from("tradeposts").upsert({ id: postId, payload: target })
        if (!error) {
          await writeTradeposts(nextPosts)
          return target ?? null
        }
      }
    } catch (error) {
      console.error("Supabase tradepost update failed; falling back to file store.", error)
    }
  }

  await writeTradeposts(nextPosts)
  return nextPosts.find((post) => post.id === postId) ?? null
}

export async function deleteTradepost(postId: string) {
  const client = getSupabaseClient()
  const posts = await readTradeposts()
  const nextPosts = posts.filter((post) => post.id !== postId)

  if (client) {
    try {
      const { error } = await client.from("tradeposts").delete().eq("id", postId)
      if (!error) {
        await writeTradeposts(nextPosts)
        return nextPosts
      }
    } catch (error) {
      console.error("Supabase tradepost delete failed; falling back to file store.", error)
    }
  }

  await writeTradeposts(nextPosts)
  return nextPosts
}

export async function addCommentToTradepost(postId: string, comment: TradepostComment) {
  const client = getSupabaseClient()
  const posts = await readTradeposts()
  const nextPosts = posts.map((post) => {
    if (post.id !== postId) return post
    return normalizeTradepost({
      ...post,
      comments: [...(post.comments || []), comment],
    })
  })

  if (client) {
    try {
      const target = nextPosts.find((post) => post.id === postId)
      if (target) {
        const { error } = await client.from("tradeposts").upsert({ id: postId, payload: target })
        if (!error) {
          await writeTradeposts(nextPosts)
          return target ?? null
        }
      }
    } catch (error) {
      console.error("Supabase comment add failed; falling back to file store.", error)
    }
  }

  await writeTradeposts(nextPosts)
  return nextPosts.find((post) => post.id === postId) ?? null
}

export async function deleteCommentFromTradepost(postId: string, commentId: string) {
  const client = getSupabaseClient()
  const posts = await readTradeposts()
  const nextPosts = posts.map((post) => {
    if (post.id !== postId) return post
    return normalizeTradepost({
      ...post,
      comments: (post.comments || []).filter((comment) => comment.id !== commentId),
    })
  })

  if (client) {
    try {
      const target = nextPosts.find((post) => post.id === postId)
      if (target) {
        const { error } = await client.from("tradeposts").upsert({ id: postId, payload: target })
        if (!error) {
          await writeTradeposts(nextPosts)
          return target ?? null
        }
      }
    } catch (error) {
      console.error("Supabase comment delete failed; falling back to file store.", error)
    }
  }

  await writeTradeposts(nextPosts)
  return nextPosts.find((post) => post.id === postId) ?? null
}
