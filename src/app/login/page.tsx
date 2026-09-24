'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'

export default function AuthPage() {
  const supabase = createClient()


  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        window.location.href = '/?login=success';
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const redirectUrl =
    typeof window !== 'undefined' ? window.location.origin : ''

  return (
    <div className="w-full max-w-md p-8 space-y-3 rounded-xl bg-white shadow-lg">
        <h1 className="text-2xl font-bold text-center">Login / Register</h1>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google', 'github']}
          redirectTo={redirectUrl ? `${redirectUrl}/auth/callback` : undefined}
        />
      </div>
  )
}
