import { NextResponse } from "next/server"
import { createTradepost, readTradeposts, type TradepostEntry } from "@/lib/tradeposts-store"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  try {
    const posts = await readTradeposts()

    const visiblePosts = posts.filter((post) => {
      const isVerifierSeed =
        post.author?.name === "Verifier" &&
        post.title === "verify title" &&
        post.note === "verify note"

      return !isVerifierSeed
    })

    return NextResponse.json(visiblePosts, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    })
  } catch (error) {
    console.error("[v0] GET /api/tradeposts failed:", error)
    return NextResponse.json({ error: "Failed to fetch tradeposts" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as TradepostEntry

    if (!payload || typeof payload.id !== "string" || !payload.author) {
      return NextResponse.json({ error: "Invalid tradepost payload." }, { status: 400 })
    }

    const newPost: TradepostEntry = {
      ...payload,
      comments: Array.isArray(payload.comments) ? payload.comments : [],
      giveItems: Array.isArray(payload.giveItems) ? payload.giveItems : [],
      getItems: Array.isArray(payload.getItems) ? payload.getItems : [],
      createdAt: payload.createdAt || new Date().toISOString(),
    }

    const created = await createTradepost(newPost)
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error("Failed to save tradepost:", error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to save tradepost.",
    }, { status: 500 })
  }
}
