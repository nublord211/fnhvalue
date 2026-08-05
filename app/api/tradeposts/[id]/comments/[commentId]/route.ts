import { NextResponse } from "next/server"
import { deleteCommentFromTradepost } from "@/lib/tradeposts-store"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> },
) {
  try {
    const { id, commentId } = await params
    const updated = await deleteCommentFromTradepost(id, commentId)

    if (!updated) {
      return NextResponse.json({ error: "Tradepost not found." }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: "Failed to delete comment." }, { status: 500 })
  }
}
