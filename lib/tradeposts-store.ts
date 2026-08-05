import { promises as fs } from "fs"
import path from "path"

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

async function ensureStoreFile() {
  await fs.mkdir(path.dirname(TRADEPOSTS_FILE), { recursive: true })

  try {
    await fs.access(TRADEPOSTS_FILE)
  } catch {
    await fs.writeFile(TRADEPOSTS_FILE, "[]", "utf8")
  }
}

export async function readTradeposts(): Promise<TradepostEntry[]> {
  await ensureStoreFile()

  const raw = await fs.readFile(TRADEPOSTS_FILE, "utf8")
  try {
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed as TradepostEntry[] : []
  } catch {
    return []
  }
}

export async function writeTradeposts(posts: TradepostEntry[]) {
  await ensureStoreFile()
  await fs.writeFile(TRADEPOSTS_FILE, JSON.stringify(posts, null, 2), "utf8")
}

export async function createTradepost(post: TradepostEntry) {
  const posts = await readTradeposts()
  const nextPosts = [post, ...posts]
  await writeTradeposts(nextPosts)
  return post
}

export async function updateTradepost(postId: string, updates: Partial<TradepostEntry>) {
  const posts = await readTradeposts()
  const nextPosts = posts.map((post) => {
    if (post.id !== postId) return post
    return { ...post, ...updates }
  })

  await writeTradeposts(nextPosts)
  return nextPosts.find((post) => post.id === postId) ?? null
}

export async function deleteTradepost(postId: string) {
  const posts = await readTradeposts()
  const nextPosts = posts.filter((post) => post.id !== postId)
  await writeTradeposts(nextPosts)
  return nextPosts
}

export async function addCommentToTradepost(postId: string, comment: TradepostComment) {
  const posts = await readTradeposts()
  const nextPosts = posts.map((post) => {
    if (post.id !== postId) return post
    return {
      ...post,
      comments: [...(post.comments || []), comment],
    }
  })

  await writeTradeposts(nextPosts)
  return nextPosts.find((post) => post.id === postId) ?? null
}

export async function deleteCommentFromTradepost(postId: string, commentId: string) {
  const posts = await readTradeposts()
  const nextPosts = posts.map((post) => {
    if (post.id !== postId) return post
    return {
      ...post,
      comments: (post.comments || []).filter((comment) => comment.id !== commentId),
    }
  })

  await writeTradeposts(nextPosts)
  return nextPosts.find((post) => post.id === postId) ?? null
}
