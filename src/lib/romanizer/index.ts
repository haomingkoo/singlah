import type { TimedLine, RubyToken } from '../../types'
import { romanizeChinese } from './chineseRomanizer'
import { romanizeJapanese } from './japaneseRomanizer'
import { romanizeKorean } from './koreanRomanizer'
import { tokenizeChinese, tokenizeKorean } from './rubyTokenizer'

export async function romanizeLine(
  text: string,
  lang: string
): Promise<string> {
  switch (lang) {
    case 'zh':
      return romanizeChinese(text)
    case 'ja':
      return romanizeJapanese(text)
    case 'ko':
      return romanizeKorean(text)
    default:
      return text
  }
}

async function tokenizeLine(
  text: string,
  lang: string
): Promise<RubyToken[] | undefined> {
  switch (lang) {
    case 'zh':
      return tokenizeChinese(text)
    case 'ja': {
      // For Japanese, build tokens from individual characters + their romanization
      // kuroshiro doesn't have a simple per-char API, so we romanize each char
      const tokens: RubyToken[] = []
      for (const char of text) {
        if (/[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff]/.test(char)) {
          const reading = await romanizeJapanese(char)
          tokens.push({ base: char, annotation: reading.trim() })
        } else {
          tokens.push({ base: char, annotation: '' })
        }
      }
      return tokens
    }
    case 'ko':
      return tokenizeKorean(text)
    default:
      return undefined
  }
}

export async function romanizeAllLines(
  lines: TimedLine[]
): Promise<TimedLine[]> {
  const results = await Promise.allSettled(
    lines.map(async (line) => {
      if (!line.lang || !['zh', 'ja', 'ko'].includes(line.lang)) {
        return line
      }

      const [romanized, rubyTokens] = await Promise.all([
        romanizeLine(line.text, line.lang),
        tokenizeLine(line.text, line.lang),
      ])

      return { ...line, romanized, rubyTokens }
    })
  )

  return results.map((r, i) =>
    r.status === 'fulfilled' ? r.value : lines[i]
  )
}
