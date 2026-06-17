import { useEffect, useRef } from 'react'

const MELIS_KEY = 'MelisCmsProspects_tool_prospects' // rendable zone (follow_regular_rendering:false)
const FRAME_ID = 'melis-brick-frame-prospects'       // unique per brick

/**
 * Renders the legacy MelisCmsProspects tool in an iframe via the shared loading mechanism
 * (/melis/react-tool-page?key=<melisKey>).
 *
 * PERSISTENT iframe (no reload on tab switch): React unmounts a route's component when you
 * navigate away, which would destroy the iframe and reload it on return. So the iframe is
 * created ONCE and kept in <body> forever (a module singleton); this component only
 * positions it over its anchor and toggles visibility. Re-parenting an iframe reloads it,
 * so it is NEVER moved — only shown/hidden + repositioned. No sandbox: same-origin trusted
 * Melis content (a sandbox propagates to nested legacy iframes and breaks them).
 */
function getFrame(): HTMLIFrameElement {
  let f = document.getElementById(FRAME_ID) as HTMLIFrameElement | null
  if (!f) {
    f = document.createElement('iframe')
    f.id = FRAME_ID
    f.src = `/melis/react-tool-page?key=${encodeURIComponent(MELIS_KEY)}`
    f.title = 'Prospects'
    f.style.cssText = 'position:fixed;border:0;display:none;z-index:1;'
    document.body.appendChild(f)
  }
  return f
}

export default function ProspectsPage() {
  const anchorRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const f = getFrame()
    const anchor = anchorRef.current!
    const sync = () => {
      const r = anchor.getBoundingClientRect()
      f.style.left = `${r.left}px`
      f.style.top = `${r.top}px`
      f.style.width = `${r.width}px`
      f.style.height = `${r.height}px`
      f.style.display = 'block'
    }
    sync()
    // The anchor fills the content area, so it resizes on sidebar collapse / sub-tab bar
    // changes / window resize — re-sync the floating frame to match.
    const ro = new ResizeObserver(sync)
    ro.observe(anchor)
    window.addEventListener('resize', sync)
    window.addEventListener('scroll', sync, true)
    return () => {
      f.style.display = 'none' // hide but keep in <body> → no reload
      ro.disconnect()
      window.removeEventListener('resize', sync)
      window.removeEventListener('scroll', sync, true)
    }
  }, [])

  return <div ref={anchorRef} style={{ height: '100%', width: '100%', minHeight: 0 }} />
}
