import { NextResponse } from "next/server"
import { describeSupabaseConfig, getSupabaseClient, getSupabaseServerClient } from "@/lib/supabase"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

interface ProbeResult {
  available: boolean
  ok: boolean
  rowCount: number
  code: string | null
  message: string | null
}

async function probe(client: ReturnType<typeof getSupabaseClient>): Promise<ProbeResult> {
  if (!client) {
    return { available: false, ok: false, rowCount: 0, code: null, message: "Key not configured." }
  }

  const { count, error } = await client.from("tradeposts").select("id", { count: "exact", head: true })

  if (error) {
    return {
      available: true,
      ok: false,
      rowCount: 0,
      code: error.code ?? null,
      message: error.message,
    }
  }

  return { available: true, ok: true, rowCount: count ?? 0, code: null, message: null }
}

/**
 * GET /api/tradeposts/diagnostics
 *
 * Compares what the public (anon) key can see against what the service role key
 * can see. If serviceRole.rowCount > 0 while anon.rowCount === 0, Row Level
 * Security is hiding the rows from the public key.
 */
export async function GET() {
  const config = describeSupabaseConfig()

  const [anon, serviceRole] = await Promise.all([
    probe(getSupabaseClient()),
    probe(getSupabaseServerClient()),
  ])

  let verdict = "OK"

  if (!config.hasUrl || !config.hasAnonKey) {
    verdict = "Supabase URL or public key is missing from the environment."
  } else if (!config.hasServiceKey) {
    verdict = "SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SECRET_KEY is missing — reads are subject to RLS."
  } else if (!serviceRole.ok) {
    verdict = `Service role key rejected by Supabase: ${serviceRole.message}`
  } else if (serviceRole.rowCount === 0) {
    verdict = "The tradeposts table is genuinely empty."
  } else if (anon.ok && anon.rowCount === 0) {
    verdict = "Row Level Security is hiding rows from the public key. Reads must use the service role key."
  }

  return NextResponse.json({ config, anon, serviceRole, verdict }, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  })
}
