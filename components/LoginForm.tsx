'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Locale } from '@/lib/locales'
import type { Dict } from '@/lib/i18n'

export default function LoginForm({ locale, t }: { locale: Locale; t: Dict }) {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [isError, setIsError] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMsg('')
    setIsError(false)
    const supabase = createClient()

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback?next=/${locale}/profile`,
        },
      })
      if (error) {
        setIsError(true)
        setMsg(error.message || t.error_generic)
      } else if (data.session) {
        router.push(`/${locale}/profile`)
        router.refresh()
      } else {
        setMsg(t.check_email)
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setIsError(true)
        setMsg(error.message || t.error_generic)
      } else {
        router.push(`/${locale}/profile`)
        router.refresh()
      }
    }
    setBusy(false)
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5">
      <h1 className="text-xl font-semibold">{mode === 'login' ? t.login_title : t.signup_title}</h1>
      <label className="block text-sm">
        <span className="text-stone-600">{t.email}</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        <span className="text-stone-600">{t.password}</span>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
        />
      </label>
      {msg && <p className={isError ? 'text-sm text-red-600' : 'text-sm text-emerald-700'}>{msg}</p>}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-emerald-700 py-2.5 font-medium text-white disabled:opacity-60"
      >
        {mode === 'login' ? t.submit_login : t.submit_signup}
      </button>
      <button
        type="button"
        onClick={() => {
          setMode(mode === 'login' ? 'signup' : 'login')
          setMsg('')
        }}
        className="w-full text-sm text-stone-500"
      >
        {mode === 'login' ? t.switch_to_signup : t.switch_to_login}
      </button>
    </form>
  )
}
