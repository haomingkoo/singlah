import { romanize } from 'es-hangul'

// Revised Romanization, with pronunciation rules applied across syllables.
export function romanizeKorean(text: string): string {
  return romanize(text)
}
