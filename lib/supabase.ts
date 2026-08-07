import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log("Supabase config loaded:")
console.log("  URL:", supabaseUrl ? "✓ set" : "✗ NOT SET")
console.log("  Anon Key:", supabaseAnonKey ? "✓ set" : "✗ NOT SET")
console.log("  Service Key:", supabaseServiceKey ? "✓ set" : "✗ NOT SET")

/**
 * Client-side Supabase client (anon key)
 * Used in browser and for public operations
 */
export function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("getSupabaseClient: Missing URL or anon key")
    return null
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

/**
 * Server-side Supabase client (service role key)
 * Used only in API routes for admin operations
 * DO NOT expose this key to the browser
 */
export function getSupabaseServerClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("getSupabaseServerClient: Missing URL or service key")
    return null
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
