import kk from '@/messages/kk.json'
import ru from '@/messages/ru.json'
import zh from '@/messages/zh.json'
import en from '@/messages/en.json'
import skk from '@/messages/search.kk.json'
import sru from '@/messages/search.ru.json'
import szh from '@/messages/search.zh.json'
import sen from '@/messages/search.en.json'
import type { Locale } from './locales'

export type Dict = typeof kk & typeof skk

const base: Dict = { ...kk, ...skk }

const all: Record<Locale, Partial<Dict>> = {
  kk: base,
  ru: { ...ru, ...sru },
  zh: { ...zh, ...szh },
  en: { ...en, ...sen },
}

// 缺失的 key 自动回退到哈语
export function getDict(locale: Locale): Dict {
  return { ...base, ...all[locale] }
}
