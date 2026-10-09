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
import vkk from '@/messages/reviews.kk.json'
import vru from '@/messages/reviews.ru.json'
import vzh from '@/messages/reviews.zh.json'
import ven from '@/messages/reviews.en.json'
import akk from '@/messages/admin.kk.json'
import aru from '@/messages/admin.ru.json'
import azh from '@/messages/admin.zh.json'
import aen from '@/messages/admin.en.json'
import type { Locale } from './locales'

export type Dict = typeof kk & typeof skk & typeof rkk & typeof tkk & typeof vkk & typeof akk

const base: Dict = { ...kk, ...skk, ...rkk, ...tkk, ...vkk, ...akk }

const all: Record<Locale, Partial<Dict>> = {
  kk: base,
  ru: { ...ru, ...sru, ...rru, ...tru, ...vru, ...aru },
  zh: { ...zh, ...szh, ...rzh, ...tzh, ...vzh, ...azh },
  en: { ...en, ...sen, ...ren, ...ten, ...ven, ...aen },
}

export function getDict(locale: Locale): Dict {
  return { ...base, ...all[locale] }
}