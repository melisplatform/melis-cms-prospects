import ProspectsPage from './ProspectsPage'

declare global {
  interface Window {
    __melisRegisterBrick?: (b: { id: string; Component: unknown }) => void
  }
}

// id MUST match public/ui-react/brick.manifest.json
window.__melisRegisterBrick?.({ id: 'prospects', Component: ProspectsPage })
