'use client'

import { useState } from 'react'
import type { Dict } from '@/lib/i18n'

export default function ShareButton({ t, title }: { t: Dict; title: string }) {
  const [copied, setCopied] = useState(false)

  async function share() {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // 用户取消分享，忽略
    }
  }

  return (
    <button onClick={share} className="text-sm font-medium text-emerald-700">
      {copied ? `✓ ${t.share_copied}` : `↗ ${t.share_btn}`}
    </button>
  )
}