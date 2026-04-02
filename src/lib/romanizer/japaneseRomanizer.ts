// eslint-disable-next-line @typescript-eslint/no-explicit-any
let instance: any = null
let initPromise: Promise<void> | null = null

export async function initJapaneseRomanizer(): Promise<void> {
  if (instance) return
  if (initPromise) return initPromise

  initPromise = (async () => {
    // Dynamic import to avoid loading kuromoji's Node polyfills at startup
    // @ts-expect-error kuroshiro has no type declarations
    const Kuroshiro = (await import('kuroshiro')).default
    // @ts-expect-error kuroshiro-analyzer-kuromoji has no type declarations
    const KuromojiAnalyzer = (await import('kuroshiro-analyzer-kuromoji')).default

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
  return instance.convert(text, {
    to: 'romaji',
    mode: 'spaced',
    romajiSystem: 'hepburn',
  })
}

export function isJapaneseReady(): boolean {
  return instance !== null
}
