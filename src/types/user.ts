import type { User } from '@supabase/supabase-js'

export type AppUser = User & {
  name: string | null
  avatar_url: string | null
}
