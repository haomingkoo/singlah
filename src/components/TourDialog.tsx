import { useEffect, useRef } from 'react'

export function TourDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // ?tour=1 opens the tour on load (the README links here); never autoplays.
  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open && new URLSearchParams(window.location.search).get('tour') === '1') {
      dialog.showModal()
    }
  }, [])

  function handleClose() {
    videoRef.current?.pause()
    triggerRef.current?.focus()
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="self-start text-[13px] text-text-dim underline decoration-text-dim/50 underline-offset-2 hover:text-text"
      >
        ▶ 30-second tour
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby="tour-title"
        onClose={handleClose}
        // Clicks on the backdrop land on the dialog element itself.
        onClick={(e) => e.target === e.currentTarget && dialogRef.current?.close()}
        className="tour-dialog m-auto w-[min(960px,calc(100vw-2rem))] max-w-none rounded-[16px] bg-surface-alt p-0 text-text"
      >
        <div className="p-4 md:p-5">
          <div className="mb-3 flex items-center justify-between gap-4">
            <h2 id="tour-title" className="text-[15px] font-semibold">
              SingLah in 30 seconds
            </h2>
            <button
              type="button"
              aria-label="Close tour"
              onClick={() => dialogRef.current?.close()}
              className="rounded-[6px] px-2 py-1 text-[18px] leading-none text-text-dim hover:bg-surface-hover hover:text-text"
            >
              ×
            </button>
          </div>
          <video
            ref={videoRef}
            controls
            preload="none"
            playsInline
            poster="/media/singlah-poster.jpg"
            className="aspect-video w-full rounded-[10px] bg-surface"
          >
            <source src="/media/singlah.webm" type="video/webm" />
            <source src="/media/singlah.mp4" type="video/mp4" />
          </video>
          <p className="mt-2 text-[13px] text-text-dim">Music: Sascha Ende, ende.app (CC BY 4.0)</p>
        </div>
      </dialog>
    </>
  )
}
