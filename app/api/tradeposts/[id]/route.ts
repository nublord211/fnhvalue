import { NextResponse } from "next/server"
import { deleteTradepost, updateTradepost, type TradepostEntry } from "@/lib/tradeposts-store"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const payload = (await request.json()) as Partial<TradepostEntry>
    const updated = await updateTradepost(id, payload)

    if (!updated) {
      return NextResponse.json({ error: "Tradepost not found." }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: "Failed to update tradepost." }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const posts = await deleteTradepost(id)
    return NextResponse.json(posts)
  } catch {
    return NextResponse.json({ error: "Failed to delete tradepost." }, { status: 500 })
  }
}
