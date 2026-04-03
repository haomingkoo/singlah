// Custom loader that initializes chromaprint WASM without ES module import
let initialized = false
let bgModule = null

export async function initChromaprint() {
  if (initialized) return bgModule

  // Load the bg.js module (has the actual API)
  bgModule = await import('./rusty_chromaprint_wasm_bg.js')

  // Fetch and instantiate the WASM binary
  const wasmUrl = new URL('./rusty_chromaprint_wasm_bg.wasm', import.meta.url)
  const wasmResponse = await fetch(wasmUrl)
  const wasmBytes = await wasmResponse.arrayBuffer()

  // Build the import object that the WASM module expects
  const imports = { './rusty_chromaprint_wasm_bg.js': bgModule }
  const { instance } = await WebAssembly.instantiate(wasmBytes, imports)

  // Wire up the wasm exports into the bg module
  bgModule.__wbg_set_wasm(instance.exports)

  // Call the wasm init function
  instance.exports.__wbindgen_start()

  initialized = true
  return bgModule
}
