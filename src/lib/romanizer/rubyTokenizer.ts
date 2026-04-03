import { pinyin } from 'pinyin-pro'
import type { RubyToken } from '../../types'

const CJK = /[\u4e00-\u9fff]/
const HANGUL = /[\uac00-\ud7af]/

export function tokenizeChinese(text: string): RubyToken[] {
  const chars = [...text]
  const pinyinArray = pinyin(text, { toneType: 'symbol', type: 'array' })

  let pIdx = 0
  return chars.map((char) => {
    if (CJK.test(char) && pIdx < pinyinArray.length) {
      return { base: char, annotation: pinyinArray[pIdx++] }
    }
    // Non-CJK characters (punctuation, spaces, latin) — skip pinyin index too
    if (/\S/.test(char) && pIdx < pinyinArray.length && !CJK.test(char)) {
      pIdx++
    }
    return { base: char, annotation: '' }
  })
}

export async function tokenizeKorean(text: string): Promise<RubyToken[]> {
  // Dynamic import to avoid startup crash
  ;(globalThis as Record<string, unknown>).AROMANIZE_EXTEND_STRING = false
  // @ts-expect-error aromanize has no type declarations
  const Aromanize = (await import('aromanize')).default

  return [...text].map((char) => {
    if (HANGUL.test(char)) {
      return { base: char, annotation: Aromanize.romanize(char) as string }
    }
    return { base: char, annotation: '' }
  })
}
