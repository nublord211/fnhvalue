import { NextResponse } from "next/server"
import { addCommentToTradepost, type TradepostComment } from "@/lib/tradeposts-store"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const payload = (await request.json()) as TradepostComment

    if (!payload || !payload.id || !payload.text || !payload.author) {
      return NextResponse.json({ error: "Invalid comment payload." }, { status: 400 })
    }

    const updated = await addCommentToTradepost(id, payload)
    if (!updated) {
      return NextResponse.json({ error: "Tradepost not found." }, { status: 404 })
    }

    return NextResponse.json(updated, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to add comment." }, { status: 500 })
  }
}
