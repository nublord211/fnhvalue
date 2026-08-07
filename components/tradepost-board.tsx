"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, ArrowRight, Sparkles, Pencil, Trash2, MessageCircle } from "lucide-react"

const DISCORD_AUTH_URL =
  "https://discord.com/oauth2/authorize?client_id=1530289183715889204&response_type=code&redirect_uri=https%3A%2F%2Ffnhvalues.vercel.app%2Fdiscord&scope=identify"
import { Item, TIER_COLORS, SITE_COLORS } from "@/lib/types"
import { fmt, getItemValue } from "@/lib/calculator"
import posthog from "posthog-js"

interface TradepostItemEntry {
  item: Item
  serial: string
  isGlitched: boolean
  isCursed: boolean
}

interface TradepostAuthor {
  id: string
  name: string
  avatar: string | null
  discordId: string | null
  isAnonymous: boolean
}

interface TradepostComment {
  id: string
  text: string
  createdAt: string
  author: TradepostAuthor
}

interface TradepostEntry {
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

const AUTHOR_STORAGE_KEY = "fnh-tradepost-user-id"
const ANON_ID_STORAGE_KEY = "fnh-tradepost-anon-id"
const LEGACY_STORAGE_KEY = "fnh-tradeposts"

function parseSerialValue(value: string): number | undefined {
  const cleaned = value.replace(/[^\d]/g, "")
  if (!cleaned) return undefined
  const parsed = Number.parseInt(cleaned, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

function calculateItemValue(entry: TradepostItemEntry): number {
  const serial = parseSerialValue(entry.serial)
  return getItemValue(entry.item, entry.isGlitched, entry.isCursed, serial)
}

function getItemLabel(entry: TradepostItemEntry): string | null {
  if (entry.serial && entry.serial.trim()) {
    return `Serial #${entry.serial}`
  }

  return null
}

function getStoredDiscordUser() {
  if (typeof window === "undefined") return null
  try {
    const stored = window.localStorage.getItem("discordUser")
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function canManageAllTradeposts(author: TradepostAuthor | null) {
  if (!author) return false
  return author.discordId === "1367643116391108711"
}

function getLegacyLocalPosts(): TradepostEntry[] {
  if (typeof window === "undefined") return []

  try {
    const stored = window.localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!stored) return []

    const parsed = JSON.parse(stored) as unknown
    return Array.isArray(parsed) ? (parsed as TradepostEntry[]) : []
  } catch {
    return []
  }
}

function getCurrentAuthor(): TradepostAuthor {
  if (typeof window === "undefined") {
    return { id: "anonymous", name: "Anonymous", avatar: null, discordId: null, isAnonymous: true }
  }

  const discordUser = getStoredDiscordUser()
  const discordAuthorId = discordUser?.id || null
  let stableAuthorId = window.localStorage.getItem(AUTHOR_STORAGE_KEY)

  if (!stableAuthorId) {
    stableAuthorId = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? `anon-${crypto.randomUUID()}`
      : `anon-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    window.localStorage.setItem(AUTHOR_STORAGE_KEY, stableAuthorId)
  }

  if (!window.localStorage.getItem(ANON_ID_STORAGE_KEY)) {
    window.localStorage.setItem(ANON_ID_STORAGE_KEY, stableAuthorId)
  }

  return {
    id: discordAuthorId || stableAuthorId,
    name: discordUser?.username || "Anonymous",
    avatar: discordUser?.avatar ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png` : null,
    discordId: discordAuthorId,
    isAnonymous: !discordUser,
  }
}

export function TradepostBoard() {
  const router = useRouter()
  const [posts, setPosts] = useState<TradepostEntry[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentUser, setCurrentUser] = useState<TradepostAuthor | null>(null)
  const [discordUser, setDiscordUser] = useState<{ id: string; username: string; avatar: string | null } | null>(null)
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editNote, setEditNote] = useState("")
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({})

  useEffect(() => {
    const storedDiscord = getStoredDiscordUser()
    if (storedDiscord) {
      setDiscordUser(storedDiscord)
    }

    const author = getCurrentAuthor()
    setCurrentUser(author)

    const loadPosts = async () => {
      try {
        const legacyPosts = getLegacyLocalPosts()

        if (legacyPosts.length > 0) {
          await Promise.all(legacyPosts.map(async (post) => {
            await fetch("/api/tradeposts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(post),
            })
          }))

          window.localStorage.removeItem(LEGACY_STORAGE_KEY)
        }

        const response = await fetch("/api/tradeposts", { cache: "no-store" })
        const data = await response.json()
        setPosts(Array.isArray(data) ? data : [])
      } catch {
        setPosts([])
      } finally {
        setIsLoaded(true)
      }
    }

    void loadPosts()
  }, [])

  const sortedPosts = useMemo(() => [...posts].sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1)), [posts])

  const updatePost = (postId: string, updates: Partial<TradepostEntry>) => {
    setPosts((prev) => prev.map((post) => (post.id === postId ? { ...post, ...updates } : post)))
  }

  const handleDeletePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/tradeposts/${postId}`, { method: "DELETE" })
      if (!response.ok) return
      const data = await response.json()
      setPosts(Array.isArray(data) ? data : [])
      posthog.capture("tradepost_deleted")
    } catch {
      setPosts((prev) => prev.filter((post) => post.id !== postId))
    }
  }

  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      const response = await fetch(`/api/tradeposts/${postId}/comments/${commentId}`, { method: "DELETE" })
      if (!response.ok) return
      const updatedPost = await response.json()
      setPosts((prev) => prev.map((post) => (post.id === postId ? updatedPost : post)))
    } catch {
      setPosts((prev) => prev.map((post) => {
        if (post.id !== postId) return post
        return {
          ...post,
          comments: (post.comments || []).filter((comment) => comment.id !== commentId),
        }
      }))
    }
  }

  const handleSaveEdit = async (postId: string) => {
    if (!editTitle.trim() && !editNote.trim()) return

    const payload = {
      title: editTitle.trim() || "Untitled tradepost",
      note: editNote.trim(),
    }

    try {
      const response = await fetch(`/api/tradeposts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) return
      const updated = await response.json()
      updatePost(postId, updated)
      posthog.capture("tradepost_updated", {
        has_title: Boolean(payload.title),
        has_note: Boolean(payload.note),
      })
    } catch {
      updatePost(postId, payload)
    } finally {
      setEditingPostId(null)
    }
  }

  const handleAddComment = async (postId: string) => {
    const text = (commentDrafts[postId] || "").trim()
    if (!text || !currentUser) return

    const newComment: TradepostComment = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text,
      createdAt: new Date().toISOString(),
      author: currentUser,
    }

    try {
      const response = await fetch(`/api/tradeposts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newComment),
      })

      if (!response.ok) return
      const updated = await response.json()
      setPosts((prev) => prev.map((post) => (post.id === postId ? updated : post)))
      setCommentDrafts((prev) => ({ ...prev, [postId]: "" }))
      posthog.capture("tradepost_comment_added")
    } catch {
      setPosts((prev) => prev.map((post) => (post.id === postId ? { ...post, comments: [...(post.comments || []), newComment] } : post)))
      setCommentDrafts((prev) => ({ ...prev, [postId]: "" }))
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Tradeposts😎</p>
            <h1 className="text-1xl font-bold">pretty please add smth to the board</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                window.location.href = DISCORD_AUTH_URL
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/80 transition-colors rounded-md"
            >
              {discordUser?.avatar ? (
                <img
                  src={`https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`}
                  alt="Discord avatar"
                  className="h-5 w-5 rounded-full"
                />
              ) : (
                <img
                  src="/discord-icon-svgrepo-com.svg"
                  alt="Discord icon"
                  className="h-5 w-5"
                />
              )}
              <span>{discordUser ? discordUser.username : "Sign in"}</span>
            </button>
            <button
              onClick={() => router.push("/tradepost")}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/80 transition-colors rounded-md"
            >
              <Plus size={16} />
              New tradepost
            </button>
          </div>
        </div>

        <div className="mx-auto mb-6 w-full max-w-3xl rounded-lg border border-border bg-card p-1.5">
          <div className="mb-1.5 flex items-center justify-between rounded-md bg-secondary/40 px-2 py-1 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            <span>Ad</span>
            <span>Advertisement</span>
          </div>
          <a href="https://discord.gg/VHcqrppMg" target="_blank" rel="noreferrer" className="block overflow-hidden rounded-md">
            <img
              src="/Advertisement.png"
              alt="Advertisement banner"
              className="block h-auto w-full object-cover"
            />
          </a>
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            if you want your ad placed here dm v8qtn on discord for more info
          </p>
        </div>

        {!isLoaded ? (
          <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">Loading posts…</div>
        ) : sortedPosts.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <div className="mb-3 flex justify-center">
              <div className="rounded-full bg-secondary p-3">
                <Sparkles size={20} />
              </div>
            </div>
            <h2 className="text-xl font-semibold">No tradeposts yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">Create the first post to start the board.</p>
            <button
              onClick={() => router.push("/tradepost")}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-muted transition-colors rounded-md"
            >
              <Plus size={16} />
              Create a tradepost
            </button>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {sortedPosts.map((post) => {
              const giveTotal = post.giveItems.reduce((sum, item) => sum + calculateItemValue(item), 0)
              const getTotal = post.getItems.reduce((sum, item) => sum + calculateItemValue(item), 0)
              const difference = getTotal - giveTotal
              const isAuthor = currentUser?.id === post.author?.id
              const canManagePost = canManageAllTradeposts(currentUser) || isAuthor

              return (
                <article key={post.id} className="rounded-lg border border-border bg-card p-4 sm:p-5">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        {post.author?.avatar ? (
                          <img src={post.author.avatar} alt={post.author.name} className="h-7 w-7 rounded-full" />
                        ) : (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-semibold uppercase">
                            {post.author?.name?.[0] || "A"}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium">{post.author?.name || "Anonymous"}</p>
                          <p className="text-[11px] text-muted-foreground">{post.author?.discordId ? "Discord linked" : "Anonymous post"}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground">
                        {post.giveItems.length + post.getItems.length} items
                      </div>
                      {canManagePost ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingPostId(post.id)
                              setEditTitle(post.title)
                              setEditNote(post.note)
                            }}
                            className="rounded-md border border-border p-1.5 hover:bg-secondary"
                            aria-label="Edit post"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="rounded-md border border-border p-1.5 hover:bg-secondary"
                            aria-label="Delete post"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {editingPostId === post.id ? (
                    <div className="mb-4 space-y-2">
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full border border-border bg-secondary px-3 py-2 text-sm"
                        placeholder="Tradepost title"
                      />
                      <textarea
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
                        className="w-full border border-border bg-secondary px-3 py-2 text-sm"
                        rows={3}
                        placeholder="Trade notes"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleSaveEdit(post.id)} className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground">
                          Save
                        </button>
                        <button onClick={() => setEditingPostId(null)} className="rounded-md bg-secondary px-3 py-2 text-sm">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-lg font-semibold">{post.title || "Untitled tradepost"}</h2>
                      {post.note ? <p className="mb-4 whitespace-pre-wrap text-sm text-muted-foreground">{post.note}</p> : null}
                    </>
                  )}

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-md border border-border bg-secondary/40 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm font-semibold" style={{ color: SITE_COLORS.dangerText }}>Give</p>
                        <span className="text-sm font-bold">{fmt(giveTotal)}</span>
                      </div>
                      <div className="space-y-2">
                        {post.giveItems.map((entry, index) => {
                          const value = calculateItemValue(entry)
                          const tierColor = TIER_COLORS[entry.item.tier]
                          const label = getItemLabel(entry)
                          return (
                            <div key={`${post.id}-give-${index}`} className="flex items-center justify-between rounded-md border border-border/60 bg-background/70 px-2 py-2 text-sm">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tierColor }} />
                                <span className="truncate">{entry.item.name}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">{fmt(value)}{label ? ` • ${label}` : ""}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="rounded-md border border-border bg-secondary/40 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm font-semibold" style={{ color: SITE_COLORS.successText }}>Get</p>
                        <span className="text-sm font-bold">{fmt(getTotal)}</span>
                      </div>
                      <div className="space-y-2">
                        {post.getItems.map((entry, index) => {
                          const value = calculateItemValue(entry)
                          const tierColor = TIER_COLORS[entry.item.tier]
                          const label = getItemLabel(entry)
                          return (
                            <div key={`${post.id}-get-${index}`} className="flex items-center justify-between rounded-md border border-border/60 bg-background/70 px-2 py-2 text-sm">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tierColor }} />
                                <span className="truncate">{entry.item.name}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">{fmt(value)}{label ? ` • ${label}` : ""}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-border pt-3">
                    <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                      <MessageCircle size={14} />
                      <span>{(post.comments || []).length} comment{(post.comments || []).length === 1 ? "" : "s"}</span>
                    </div>

                    <div className="space-y-2">
                      {(post.comments || []).map((comment) => {
                        const canDeleteComment = currentUser?.id === comment.author.id
                        return (
                          <div key={comment.id} className="rounded-md border border-border bg-secondary/40 p-2 text-sm">
                            <div className="mb-1 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                {comment.author.avatar ? (
                                  <img src={comment.author.avatar} alt={comment.author.name} className="h-5 w-5 rounded-full" />
                                ) : (
                                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-background text-[10px] font-semibold uppercase">
                                    {comment.author.name?.[0] || "A"}
                                  </div>
                                )}
                                <span className="font-medium">{comment.author.name || "Anonymous"}</span>
                                <span className="text-[10px] text-muted-foreground">{new Date(comment.createdAt).toLocaleString()}</span>
                              </div>
                              {canDeleteComment ? (
                                <button
                                  onClick={() => handleDeleteComment(post.id, comment.id)}
                                  className="rounded-md border border-border px-2 py-1 text-[10px] hover:bg-background"
                                >
                                  Delete
                                </button>
                              ) : null}
                            </div>
                            <p className="text-muted-foreground">{comment.text}</p>
                          </div>
                        )
                      })}
                    </div>

                    <div className="mt-3 flex gap-2">
                      <input
                        value={commentDrafts[post.id] || ""}
                        onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))}
                        placeholder="Write a comment"
                        className="flex-1 border border-border bg-secondary px-3 py-2 text-sm"
                      />
                      <button onClick={() => handleAddComment(post.id)} className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground">
                        Comment
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Difference</p>
                      <p className="text-lg font-semibold" style={{ color: difference >= 0 ? SITE_COLORS.successText : SITE_COLORS.dangerText }}>
                        {difference >= 0 ? "+" : ""}{fmt(difference)}
                      </p>
                    </div>
                    <button
                      onClick={() => router.push("/tradepost")}
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                    >
                      Make another
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
