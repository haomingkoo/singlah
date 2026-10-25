const link = 'underline decoration-text-dim/50 underline-offset-2 hover:text-text'

export function SiteFooter() {
  return (
    <footer className="border-t border-line px-4 py-6 text-center text-[13px] leading-relaxed text-text-dim md:px-8">
      <p>
        © 2026 Haoming Koo · <a className={link} href="/privacy/">Privacy</a> ·{' '}
        <a className={link} href="/terms/">Terms</a> · Contact (
        <a className={link} href="mailto:privacy@kooexperience.com">privacy@kooexperience.com</a>) ·{' '}
        <a className={link} href="https://kooexperience.com">More projects → kooexperience.com</a>
      </p>
      <p className="mt-1">
        Lyrics from <a className={link} href="https://lrclib.net">LRCLib</a>, a free community library.
      </p>
    </footer>
  )
}
