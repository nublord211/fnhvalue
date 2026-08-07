import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY

// Supabase renamed the privileged key: legacy projects expose SUPABASE_SERVICE_ROLE_KEY,
// newer ones expose SUPABASE_SECRET_KEY (sb_secret_...). Accept either.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY

const clientOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
} as const

let cachedAnonClient: SupabaseClient | null = null
let cachedAdminClient: SupabaseClient | null = null

/**
 * Browser / public client (anon key).
 * Subject to Row Level Security — only use it for data that is publicly readable.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) return null
  if (!cachedAnonClient) {
    cachedAnonClient = createClient(supabaseUrl, supabaseAnonKey, clientOptions)
  }
  return cachedAnonClient
}

/**
 * Privileged server-only client (service role / secret key).
 * Bypasses Row Level Security. NEVER import this from a client component.
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseServiceKey) return null
  if (!cachedAdminClient) {
    cachedAdminClient = createClient(supabaseUrl, supabaseServiceKey, clientOptions)
  }
  return cachedAdminClient
}

/**
 * The client that server-side data access should use.
 *
 * Prefers the privileged client so RLS cannot silently hide rows, and only falls
 * back to the anon client if no service key is configured. Reading with the anon
 * key while writing with the service key is what made tradeposts return 0 rows:
 * inserts bypassed RLS but selects were filtered out to an empty array with no error.
 */
export function getSupabaseDataClient(): { client: SupabaseClient | null; isPrivileged: boolean } {
  const admin = getSupabaseServerClient()
  if (admin) return { client: admin, isPrivileged: true }
  return { client: getSupabaseClient(), isPrivileged: false }
}

export function describeSupabaseConfig() {
  return {
    hasUrl: Boolean(supabaseUrl),
    hasAnonKey: Boolean(supabaseAnonKey),
    hasServiceKey: Boolean(supabaseServiceKey),
  }
}
