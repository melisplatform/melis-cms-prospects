import type { CSSProperties, ReactNode } from 'react'

// Bouton « + / − » (colonne la plus à gauche de la ligne) + ligne de détail dépliée en dessous,
// pour l'essential-column-collapse des tables sur mobile. Styles inline + icônes autonomes
// (la brique n'a pas de ui.tsx partagé). cf. skill melis-react-mobile-responsive.

const sIcon = { width: 13, height: 13, flexShrink: 0 } as const
const PlusIcon = () => <svg style={sIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
const MinusIcon = () => <svg style={sIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /></svg>

const toggleBtn: CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-card)', color: 'var(--color-muted-foreground)', cursor: 'pointer', padding: 0 }

export function ExpandToggle({ expanded, onClick }: { expanded: boolean; onClick: () => void }) {
  return (
    <button type="button" style={toggleBtn} onClick={onClick} title={expanded ? '−' : '+'}>
      {expanded ? <MinusIcon /> : <PlusIcon />}
    </button>
  )
}

export function HiddenColsRow({ colSpan, cols }: { colSpan: number; cols: { label: string; value: ReactNode }[] }) {
  return (
    <tr>
      <td colSpan={colSpan} style={{ padding: '4px 16px 12px', borderTop: '1px solid var(--color-border)', background: 'var(--color-muted,rgba(0,0,0,.02))' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {cols.map((c) => (
            <div key={c.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13 }}>
              <span style={{ color: 'var(--color-muted-foreground)', flexShrink: 0 }}>{c.label}</span>
              <span style={{ textAlign: 'right', color: 'var(--color-foreground)', overflowWrap: 'anywhere' }}>{c.value}</span>
            </div>
          ))}
        </div>
      </td>
    </tr>
  )
}
