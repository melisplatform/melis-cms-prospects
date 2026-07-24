import ProspectsPage from './ProspectsPage'
import ProspectThemesPage from './ProspectThemesPage'

declare global {
  interface Window {
    __melisRegisterBrick?: (b: { id: string; Component: unknown }) => void
  }
}

// Chaque id DOIT correspondre à une entrée de public/ui-react/brick.manifest.json (clé `bricks`).
// Les deux briques sont bundlées dans le même brick.js et s'auto-enregistrent par id.
window.__melisRegisterBrick?.({ id: 'prospects', Component: ProspectsPage })
window.__melisRegisterBrick?.({ id: 'prospect-themes', Component: ProspectThemesPage })
