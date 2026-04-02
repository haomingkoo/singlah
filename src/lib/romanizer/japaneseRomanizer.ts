// @ts-expect-error kuroshiro has no type declarations
import Kuroshiro from 'kuroshiro'
// @ts-expect-error kuroshiro-analyzer-kuromoji has no type declarations
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji'

let instance: InstanceType<typeof Kuroshiro> | null = null
let initPromise: Promise<void> | null = null

export async function initJapaneseRomanizer(): Promise<void> {
  if (instance) return
  if (initPromise) return initPromise

  initPromise = (async () => {
    const k = new Kuroshiro()
    await k.init(
      new KuromojiAnalyzer({
        dictPath: import.meta.env.BASE_URL + 'dict',
      })
    )
    instance = k
  })()

  return initPromise
}

export async function romanizeJapanese(text: string): Promise<string> {
  if (!instance) await initJapaneseRomanizer()
  return instance!.convert(text, {
    to: 'romaji',
    mode: 'spaced',
    romajiSystem: 'hepburn',
  })
}

export function isJapaneseReady(): boolean {
  return instance !== null
}
