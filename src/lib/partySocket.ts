type MessageHandler = (data: Record<string, unknown>) => void

export class PartySocket {
  private ws: WebSocket | null = null
  private handlers: Map<string, MessageHandler[]> = new Map()

  connect(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(url)

      this.ws.onopen = () => resolve()
      this.ws.onerror = () => reject(new Error('WebSocket connection failed'))

      this.ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data)
          const handlers = this.handlers.get(msg.type) ?? []
          for (const h of handlers) h(msg.data)
        } catch {
          // ignore malformed messages
        }
      }

      this.ws.onclose = () => {
        const handlers = this.handlers.get('close') ?? []
        for (const h of handlers) h({})
      }
    })
  }

  send(type: string, data: Record<string, unknown> = {}): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }))
    }
  }

  on(type: string, handler: MessageHandler): void {
    const list = this.handlers.get(type) ?? []
    list.push(handler)
    this.handlers.set(type, list)
  }

  off(type: string, handler: MessageHandler): void {
    const list = this.handlers.get(type) ?? []
    this.handlers.set(
      type,
      list.filter((h) => h !== handler)
    )
  }

  disconnect(): void {
    this.handlers.clear()
    this.ws?.close()
    this.ws = null
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}
