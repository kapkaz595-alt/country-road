import kk from '@/messages/kk.json'
import ru from '@/messages/ru.json'
import zh from '@/messages/zh.json'
import en from '@/messages/en.json'
import skk from '@/messages/search.kk.json'
import sru from '@/messages/search.ru.json'
import szh from '@/messages/search.zh.json'
import sen from '@/messages/search.en.json'
import rkk from '@/messages/ride.kk.json'
import rru from '@/messages/ride.ru.json'
import rzh from '@/messages/ride.zh.json'
import ren from '@/messages/ride.en.json'
import tkk from '@/messages/trips.kk.json'
import tru from '@/messages/trips.ru.json'
import tzh from '@/messages/trips.zh.json'
import ten from '@/messages/trips.en.json'
import type { Locale } from './locales'

export type Dict = typeof kk & typeof skk & typeof rkk & typeof tkk

const base: Dict = { ...kk, ...skk, ...rkk, ...tkk }

const all: Record<Locale, Partial<Dict>> = {
  kk: base,
  ru: { ...ru, ...sru, ...rru, ...tru },
  zh: { ...zh, ...szh, ...rzh, ...tzh },
  en: { ...en, ...sen, ...ren, ...ten },
}

// 缺失的 key 自动回退到哈语
export function getDict(locale: Locale): Dict {
  return { ...base, ...all[locale] }
}