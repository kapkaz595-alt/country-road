'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Locale } from '@/lib/locales'
import type { Dict } from '@/lib/i18n'

export default function LoginForm({ locale, t }: { locale: Locale; t: Dict }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function signInWithGoogle() {
    setBusy(true)
    setError('')
    const { error: authError } = await createClient().auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback?next=/${locale}/profile`,
      },
    })
    if (authError) {
      setError(t.login_google_err)
      setBusy(false)
    }
  }

  return (
    <div className="space-y-5 rounded-3xl border border-stone-200 bg-white p-6 text-center">
      <div>
        <p className="text-2xl font-bold tracking-tight text-emerald-700">Birge</p>
        <h1 className="mt-3 text-lg font-semibold">{t.login_title}</h1>
        <p className="mt-1 text-sm text-stone-500">{t.login_google_hint}</p>
      </div>

      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={busy}
        className="flex w-full items-center justify-center gap-3 rounded-full border border-stone-300 bg-white py-3 text-sm font-medium text-stone-800 shadow-sm transition hover:bg-stone-50 disabled:opacity-60"
      >
        <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z" />
          <path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z" />
          <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
        </svg>
        {t.login_google}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
