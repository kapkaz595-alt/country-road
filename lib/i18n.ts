import kk from '@/messages/kk.json'
import ru from '@/messages/ru.json'
import zh from '@/messages/zh.json'
import en from '@/messages/en.json'
import type { Locale } from './locales'

export type Dict = typeof kk

const all: Record<Locale, Partial<Dict>> = { kk, ru, zh, en }

// 缺失的 key 自动回退到哈语
export function getDict(locale: Locale): Dict {
  return { ...kk, ...all[locale] }
}
