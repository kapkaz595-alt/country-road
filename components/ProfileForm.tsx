'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Dict } from '@/lib/i18n'

type Initial = { name: string; phone: string; whatsapp: string; telegram: string }

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  const national = raw.startsWith('+')
    ? digits.slice(1)
    : digits.length === 11 && (digits[0] === '7' || digits[0] === '8')
      ? digits.slice(1)
      : digits
  const n = national.slice(0, 10)
  if (!n) return ''
  const parts = [n.slice(0, 3), n.slice(3, 6), n.slice(6, 8), n.slice(8, 10)].filter(Boolean)
  return '+7-' + parts.join('-')
}

const PHONE_PATTERN = '\\+7-\\d{3}-\\d{3}-\\d{2}-\\d{2}'

export default function ProfileForm({
  t,
  userId,
  email,
  emailVerified,
  initial,
}: {
  t: Dict
  userId: string
  email: string
  emailVerified: boolean
  initial: Initial
}) {
  const router = useRouter()
  const [form, setForm] = useState<Initial>(initial)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [isError, setIsError] = useState(false)

  const set = (k: keyof Initial) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value })

  const setPhone = (k: 'phone' | 'whatsapp') => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: formatPhone(e.target.value) })

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMsg('')
    const supabase = createClient()
    const r1 = await supabase.from('profiles').update({ name: form.name.trim() }).eq('id', userId)
    const r2 = await supabase.from('contacts').upsert({
      user_id: userId,
      phone: form.phone.trim() || null,
      whatsapp: form.whatsapp.trim() || null,
      telegram: form.telegram.trim() || null,
      updated_at: new Date().toISOString(),
    })
    const failed = !!(r1.error || r2.error)
    setIsError(failed)
    setMsg(failed ? t.error_generic : t.saved)
    setBusy(false)
    if (!failed) router.refresh()
  }

  const input = 'mt-1 w-full rounded-lg border border-stone-300 px-3 py-2'

  return (
    <form onSubmit={save} className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5">
      <div>
        <p className="text-sm text-stone-600">{email}</p>
        {emailVerified && (
          <span className="mt-1 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
            ✓ {t.email_verified}
          </span>
        )}
      </div>
      <label className="block text-sm">
        <span className="text-stone-600">{t.name}</span>
        <input required value={form.name} onChange={set('name')} className={input} />
      </label>
      <div className="border-t border-stone-100 pt-4">
        <h2 className="font-medium">{t.contacts_title}</h2>
        <p className="text-xs text-stone-500">{t.contacts_hint}</p>
      </div>
      <label className="block text-sm">
        <span className="text-stone-600">{t.phone}</span>
                <input type="tel" value={form.phone} onChange={setPhone('phone')} placeholder="+7-123-456-78-90" pattern={PHONE_PATTERN} title="+7-123-456-78-90" className={input} />
      </label>
      <label className="block text-sm">
        <span className="text-stone-600">{t.whatsapp}</span>
                <input type="tel" value={form.whatsapp} onChange={setPhone('whatsapp')} placeholder="+7-123-456-78-90" pattern={PHONE_PATTERN} title="+7-123-456-78-90" className={input} />
      </label>
      <label className="block text-sm">
        <span className="text-stone-600">{t.telegram}</span>
        <input value={form.telegram} onChange={set('telegram')} placeholder="@username" className={input} />
      </label>
      {msg && <p className={isError ? 'text-sm text-red-600' : 'text-sm text-emerald-700'}>{msg}</p>}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-emerald-700 py-2.5 font-medium text-white disabled:opacity-60"
      >
        {t.save}
      </button>
    </form>
  )
}
