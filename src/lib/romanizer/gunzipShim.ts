import { gunzipSync } from 'fflate'

// Stands in for zlibjs/bin/gunzip.min.js, which kuromoji's browser loader requires.
// zlibjs attaches itself to a top-level `this`, which is undefined in an ES module bundle.
export const Zlib = {
  Gunzip: class {
    private data: Uint8Array
    constructor(data: Uint8Array) {
      this.data = data
    }
    decompress(): Uint8Array {
      // Bytes already inflated by a Content-Encoding: gzip response pass through.
      if (this.data[0] !== 0x1f || this.data[1] !== 0x8b) return this.data.slice()
      return gunzipSync(this.data).slice()
    }
  },
}
