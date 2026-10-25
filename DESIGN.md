# SingLah design

Inherits the kooexperience design core (`~/.agent-memory/design/DESIGN-core.md`). This file only adds what is specific to SingLah.

## Audience and scene
People singing karaoke in a language whose script they can't read. Phones held at arm's length in a dark room, or a laptop on a TV. Dark is chosen for that room, not for style.

## Mood
A karaoke room at night: plum-black ground, one stage-light pink. Playful in the words, never in decoration.

## Tokens (`src/index.css`)
- Ground `#141119`, surface `#1e1a26`, hover `#29243a`, hairline `rgb(255 255 255 / .08)`.
- Text `#f4eff6` (16.5:1), secondary `#aba3b8` (7.7:1 on ground, 7.0:1 on surface).
- Accent `#f06a9f` (6.5:1 on ground). Used for the wordmark's "Lah", the active lyric line, the current tab, primary buttons and focus. Text on accent fills is the ground colour.
- Error `#f2918a`, only for remove/leave actions.
- Radius 6 controls, 10 cards, 16 sheets. No shadows except the word popup.

## Type
- Figtree, self-hosted in `public/fonts/`, falling back to the platform CJK faces for lyrics.
- Sizes: 13 labels, 15 body, 18 wordmark, 28/40 page titles, 26/32 lyrics with romanisation at 16.

## Layout
- Top bar on every screen: wordmark left, Search and Saved on the right from 768px. Below 768px the same two links sit in a bottom tab bar.
- The player is full screen but always has a back control; back falls through to search when the song was opened from a link.
- Shared footer on search, saved and the legal pages.

## States
- Search: example songs (real, checked against LRCLib) when empty, skeleton rows while searching, a plain message for no results, and a retry plus a link to saved songs when LRCLib is down or the device is offline.
- Player: skeleton lyrics while loading; offline or LRCLib errors fall back to the saved copy, otherwise show back, retry and saved.

## Copy
Sentence case. Name the lyrics source (LRCLib) but never status codes. "Romanisation", British spelling.
