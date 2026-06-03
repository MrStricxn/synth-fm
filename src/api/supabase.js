import { createClient } from '@supabase/supabase-js'

// Supabase client. URL + anon key come from Vite env vars (safe to expose —
// the anon key is public by design; row-level security protects the data).
// Set them in `.env.local` for dev and in the Vercel project env for prod:
//   VITE_SUPABASE_URL=https://xxxx.supabase.co
//   VITE_SUPABASE_ANON_KEY=eyJ...
//
// When the keys are absent the app runs fine in guest mode (auth UI hidden),
// so the site never breaks just because auth isn't configured yet.
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isAuthConfigured = Boolean(url && anonKey)

export const supabase = isAuthConfigured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null
