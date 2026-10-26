import { pinyin } from 'pinyin-pro'
import { romanize } from 'es-hangul'
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

export function tokenizeKorean(text: string): RubyToken[] {
  return [...text].map((char) => ({
    base: char,
    annotation: HANGUL.test(char) ? romanize(char) : '',
  }))
}
