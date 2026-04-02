// Prevent aromanize from accessing document.currentScript.src
// (crashes in ES module context where currentScript is null)
// @ts-expect-error global flag to skip String.prototype extension
globalThis.AROMANIZE_EXTEND_STRING = false

// @ts-expect-error aromanize has no type declarations
import Aromanize from 'aromanize'

export function romanizeKorean(text: string): string {
  return Aromanize.toLatin(text) as string
}
