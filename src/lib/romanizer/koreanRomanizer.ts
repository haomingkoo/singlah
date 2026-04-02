// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Aromanize: any = null

async function loadAromanize() {
  if (Aromanize) return
  // Set flag BEFORE loading to prevent document.currentScript.src crash
  ;(globalThis as Record<string, unknown>).AROMANIZE_EXTEND_STRING = false
  // @ts-expect-error aromanize has no type declarations
  Aromanize = (await import('aromanize')).default
}

export async function romanizeKorean(text: string): Promise<string> {
  await loadAromanize()
  return Aromanize.toLatin(text) as string
}
