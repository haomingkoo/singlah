export interface IdentifiedSong {
  title: string
  artist: string
  score: number
}

export async function identifySong(
  audioBuffer: AudioBuffer
): Promise<IdentifiedSong | null> {
  const { fingerprintFromSamples } = await import('rusty-chromaprint-wasm')

  // Convert to mono Int16Array
  const channelData = audioBuffer.getChannelData(0)
  const samples = new Int16Array(channelData.length)
  for (let i = 0; i < channelData.length; i++) {
    samples[i] = Math.max(-32768, Math.min(32767, Math.round(channelData[i] * 32767)))
  }

  const result = fingerprintFromSamples(audioBuffer.sampleRate, 1, samples)
  const fingerprint = result.compressed
  const duration = Math.round(audioBuffer.duration)
  result.free()

  const apiKey = import.meta.env.VITE_ACOUSTID_API_KEY
  if (!apiKey) {
    throw new Error('AcoustID API key not configured')
  }

  const params = new URLSearchParams({
    client: apiKey,
    duration: String(duration),
    fingerprint,
    meta: 'recordings',
  })

  const res = await fetch(`https://api.acoustid.org/v2/lookup?${params}`)
  if (!res.ok) throw new Error(`AcoustID lookup failed: ${res.status}`)

  const data = await res.json()
  if (data.status !== 'ok' || !data.results?.length) return null

  const best = data.results[0]
  if (!best.recordings?.length) return null

  const recording = best.recordings[0]
  return {
    title: recording.title ?? 'Unknown',
    artist: recording.artists?.map((a: { name: string }) => a.name).join(', ') ?? 'Unknown',
    score: best.score ?? 0,
  }
}

export async function recordAudio(seconds: number): Promise<AudioBuffer> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const audioCtx = new AudioContext()
  const source = audioCtx.createMediaStreamSource(stream)
  const processor = audioCtx.createScriptProcessor(4096, 1, 1)

  const chunks: Float32Array[] = []
  const totalSamples = audioCtx.sampleRate * seconds

  return new Promise((resolve) => {
    let collected = 0

    processor.onaudioprocess = (e) => {
      const data = e.inputBuffer.getChannelData(0)
      chunks.push(new Float32Array(data))
      collected += data.length

      if (collected >= totalSamples) {
        processor.disconnect()
        source.disconnect()
        stream.getTracks().forEach((t) => t.stop())

        // Combine chunks into a single AudioBuffer
        const buffer = audioCtx.createBuffer(1, collected, audioCtx.sampleRate)
        const output = buffer.getChannelData(0)
        let offset = 0
        for (const chunk of chunks) {
          output.set(chunk, offset)
          offset += chunk.length
        }

        resolve(buffer)
      }
    }

    source.connect(processor)
    processor.connect(audioCtx.destination)
  })
}
