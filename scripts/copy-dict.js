import { cpSync, existsSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const src = resolve(__dirname, '../node_modules/kuromoji/dict')
const dest = resolve(__dirname, '../public/dict')

if (existsSync(src)) {
  mkdirSync(dest, { recursive: true })
  cpSync(src, dest, { recursive: true })
  console.log('Kuromoji dictionary copied to public/dict/')
} else {
  console.warn('kuromoji dict not found — Japanese romanization will not work')
}
