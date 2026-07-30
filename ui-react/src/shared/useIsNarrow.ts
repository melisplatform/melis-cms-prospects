import { useEffect, useState } from 'react'

// Source unique de vérité pour les décisions responsive de la brique (jamais de `sm:` — la
// brique n'a de toute façon pas Tailwind). cf. skill melis-react-mobile-responsive.
export function useIsNarrow(breakpoint = 640): boolean {
  const [narrow, setNarrow] = useState(() => window.innerWidth < breakpoint)
  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < breakpoint)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [breakpoint])
  return narrow
}
