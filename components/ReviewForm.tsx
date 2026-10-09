'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Dict } from '@/lib/i18n'

const TAGS = ['punctual', 'friendly', 'safe', 'clean', 'polite'] as const

export default function ReviewForm({
  t,
  rideId,
  reviewerId,
  revieweeId,
  revieweeName,
}: {
  t: Dict
  rideId: string
  reviewerId: string
  revieweeId: string
  revieweeName: string
}) {
  const router = useRouter()
  const tr = t as unknown as Record<string, string>
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [tags, setTags] = useState<string[]>([])
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  function toggle(tag: string) {
    setTags((cur) => (cur.includes(tag) ? cur.filter((x) => x !== tag) : [...cur, tag]))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error } = await createClient().from('reviews').insert({
      ride_id: rideId,
      reviewer_id: reviewerId,
      reviewee_id: revieweeId,
      rating,
      tags,
      comment: comment.trim() || null,
    })
    setBusy(false)
    if (error) {
      setError(error.code === '23505' ? t.err_already_reviewed : t.error_generic)
      return
    }
    setOpen(false)
    router.refresh()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-emerald-700 px-3 py-1.5 text-sm font-medium text-emerald-700"
      >
        {t.review_leave}: {revieweeName}
      </button>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-lg border border-stone-200 bg-white p-3 text-sm">
      <p className="font-medium">
        {t.review_for}: {revieweeName}
      </p>

      <div className="flex items-center gap-1" aria-label={t.review_rate}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={`text-2xl leading-none ${n <= rating ? 'text-amber-500' : 'text-stone-300'}`}
          >
            ★
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => toggle(tag)}
            className={`rounded-full border px-3 py-1 text-xs ${
              tags.includes(tag)
                ? 'border-emerald-700 bg-emerald-50 text-emerald-800'
                : 'border-stone-300 text-stone-600'
            }`}
          >
            {tr['tag_' + tag]}
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={300}
        rows={2}
        placeholder={t.review_comment}
        className="w-full rounded-lg border border-stone-300 px-3 py-2"
      />

      {error && <p className="text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-emerald-700 px-4 py-1.5 font-medium text-white disabled:opacity-60"
        >
          {t.review_submit}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-stone-300 px-4 py-1.5 text-stone-600"
        >
          {t.cancel}
        </button>
      </div>
    </form>
  )
}