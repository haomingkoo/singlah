// @ts-expect-error aromanize has no type declarations
import Aromanize from 'aromanize'

export function romanizeKorean(text: string): string {
  return Aromanize.toLatin(text) as string
}
