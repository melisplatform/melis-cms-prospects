import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  deleteProspect, fetchProspectById, fetchProspects, fetchProspectStats, fetchSites, fetchTypes, fetchThemes,
  saveProspect, markProspectsListStale, consumeProspectsListStale,
  type ProspectItem, type ProspectStats, type SiteOption, type ThemeOption,
} from './prospects-api'
import { ExportModal, DownloadIcon } from './ExportModal'
import { ViewToggle, type ViewMode } from './ViewToggle'

// Outil Prospects legacy (vue « Old » en iframe). Voir brick.manifest.json (prospects).
const MELIS_KEY = 'MelisCmsProspects_tool_prospects'

declare global {
  interface Window {
    MelisCan?: (melisKey: string, cap: string) => boolean
    __melisOpenSubTab?: (section: string, tab: { id: string; label: string; path: string }) => void
    __melisUpdateSubTabLabel?: (section: string, id: string, label: string) => void
    __melisCloseSubTab?: (section: string, id: string) => void
  }
}

// Capacités (droits avancés) : la brique ne peut PAS importer le hook hôte → lit le global window.MelisCan.
// Default-allow (true) tant que non chargé / pour un admin ; l'API reste gardée côté serveur (403).
function can(cap: string): boolean {
  return window.MelisCan?.(MELIS_KEY, cap) ?? true
}

/* ──────────────────────────────────────────────────────────────────────────
 * Brique « Prospects » (MelisCmsProspects) — full React, montée à /prospects
 * (et /prospects/:id pour le formulaire). La brique ne peut PAS importer les
 * modules de l'hôte (Tailwind/shadcn/i18n) : tout est en styles inline + variables
 * CSS du thème, avec un mini-dictionnaire FR/EN lu depuis <html lang>.
 * Design/disposition (KPI, filtre de statut segmenté, colonnes, cartes du
 * formulaire) calqués sur l'outil Utilisateurs (Users) du back-office natif.
 * ────────────────────────────────────────────────────────────────────────── */

// ── i18n minimal (la brique ne partage pas le dictionnaire de l'hôte) ──
type Lang = 'fr' | 'en'
function currentLang(): Lang {
  const l = (document.documentElement.lang || 'en').toLowerCase()
  return l.startsWith('fr') ? 'fr' : 'en'
}
const DICT: Record<Lang, Record<string, string>> = {
  fr: {
    title: 'Prospects', subtitle: 'Demandes de contact reçues via le site',
    search: 'Rechercher un prospect…', empty: 'Aucun prospect trouvé', count: '{n} prospects — fin de la liste',
    kpi_total: 'Total', kpi_month: 'Ce mois-ci', kpi_avg: 'Moyenne / mois', kpi_anon: 'Anonymisés',
    all_sites: 'Tous les sites', all_types: 'Tous les types',
    col_id: 'ID', col_name: 'Nom', col_email: 'Email', col_phone: 'Téléphone', col_site: 'Site',
    col_type: 'Type', col_date: 'Date', col_theme: 'Thème', col_message: 'Message',
    columns: 'Colonnes', export: 'Exporter', cols_visible: 'Visibles', cols_hidden: 'Masquées', drag_here: 'Glisser ici', reset: 'Réinitialiser',
    reset_filters: 'Réinitialiser les filtres',
    edit: 'Modifier', del: 'Supprimer', cancel: 'Annuler', save: 'Enregistrer', back: 'retour',
    refresh: 'Rafraîchir', loading: 'Chargement…', saved: 'Enregistré ✓',
    del_title: 'Supprimer le prospect', del_confirm: 'Supprimer « {u} » ? Cette action est irréversible.',
    edit_title: 'Prospect', sec_contact: 'Coordonnées', sec_message: 'Message', sec_details: 'Détails',
    f_name: 'Nom', f_email: 'Email', f_phone: 'Téléphone', f_company: 'Société', f_country: 'Pays',
    f_site: 'Site', f_site_ph: '— Aucun site —', f_type: 'Type', f_date: 'Date de contact', f_theme: 'Thème',
    err_save: 'Erreur lors de la sauvegarde', err_required: 'Le nom, l’email, le téléphone et le message sont obligatoires.',
    no_access: 'Vous n’avez pas les droits pour consulter cette liste.', none: '—',
    dr_label: 'Date', dr_all: 'Toutes les dates', dr_today: "Aujourd'hui", dr_yesterday: 'Hier',
    dr_last7: '7 derniers jours', dr_last30: '30 derniers jours', dr_thismonth: 'Ce mois-ci', dr_lastmonth: 'Le mois dernier',
    dr_custom: 'Plage personnalisée', dr_from: 'Du', dr_to: 'Au', dr_apply: 'Appliquer',
  },
  en: {
    title: 'Prospects', subtitle: 'Contact requests received via the site',
    search: 'Search a prospect…', empty: 'No prospect found', count: '{n} prospects — end of list',
    kpi_total: 'Total', kpi_month: 'This month', kpi_avg: 'Average / month', kpi_anon: 'Anonymized',
    all_sites: 'All sites', all_types: 'All types',
    col_id: 'ID', col_name: 'Name', col_email: 'Email', col_phone: 'Phone', col_site: 'Site',
    col_type: 'Type', col_date: 'Date', col_theme: 'Theme', col_message: 'Message',
    columns: 'Columns', export: 'Export', cols_visible: 'Visible', cols_hidden: 'Hidden', drag_here: 'Drag here', reset: 'Reset',
    reset_filters: 'Reset filters',
    edit: 'Edit', del: 'Delete', cancel: 'Cancel', save: 'Save', back: 'back',
    refresh: 'Refresh', loading: 'Loading…', saved: 'Saved ✓',
    del_title: 'Delete prospect', del_confirm: 'Delete “{u}”? This action is irreversible.',
    edit_title: 'Prospect', sec_contact: 'Contact information', sec_message: 'Message', sec_details: 'Details',
    f_name: 'Name', f_email: 'Email', f_phone: 'Phone', f_company: 'Company', f_country: 'Country',
    f_site: 'Site', f_site_ph: '— No site —', f_type: 'Type', f_date: 'Contact date', f_theme: 'Theme',
    err_save: 'Error while saving', err_required: 'Name, email, phone and message are required.',
    no_access: 'You do not have permission to view this list.', none: '—',
    dr_label: 'Date', dr_all: 'All dates', dr_today: 'Today', dr_yesterday: 'Yesterday',
    dr_last7: 'Last 7 days', dr_last30: 'Last 30 days', dr_thismonth: 'This month', dr_lastmonth: 'Last month',
    dr_custom: 'Custom range', dr_from: 'From', dr_to: 'To', dr_apply: 'Apply',
  },
}
function useT() {
  const lang = currentLang()
  return (key: string, vars?: Record<string, string | number>) => {
    let s = DICT[lang][key] ?? key
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v))
    return s
  }
}
function notify(kind: 'ok' | 'ko', title: string, message: string) {
  window.postMessage({ __melisNotif: true, kind, title, message }, '*')
}

// ── Styles (variables CSS du thème de l'hôte) ──
const card: CSSProperties = { border: '1px solid var(--color-border)', background: 'var(--color-card)', borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,.04)' }
const inputCss: CSSProperties = { height: 40, width: '100%', boxSizing: 'border-box', borderRadius: 8, border: '1px solid var(--color-input,var(--color-border))', background: 'var(--color-card)', color: 'var(--color-foreground)', padding: '0 12px', fontSize: 14, outline: 'none' }
const btnPrimary: CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, height: 36, padding: '0 14px', borderRadius: 8, border: 0, background: 'var(--color-primary)', color: 'var(--color-primary-foreground,#fff)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }
const btnGhost: CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, height: 36, padding: '0 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-card)', color: 'var(--color-foreground)', fontSize: 14, cursor: 'pointer' }
const iconBtn: CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, border: 0, background: 'transparent', color: 'var(--color-muted-foreground)', cursor: 'pointer' }
const th: CSSProperties = { textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--color-muted-foreground)', whiteSpace: 'nowrap' }
const td: CSSProperties = { padding: '10px 16px', fontSize: 14, color: 'var(--color-foreground)', borderTop: '1px solid var(--color-border)' }
const label: CSSProperties = { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: 'var(--color-foreground)' }
const secTitle: CSSProperties = { fontSize: 14, fontWeight: 600, margin: '0 0 14px', color: 'var(--color-foreground)' }

const sIcon = { width: 15, height: 15, flexShrink: 0 } as const
const PencilIcon = () => <svg style={sIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
const TrashIcon = () => <svg style={sIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg>
const GripIcon = () => <svg style={{ width: 13, height: 13, flexShrink: 0, color: 'var(--color-muted-foreground)' }} viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" /><circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="9" cy="18" r="1.5" /></svg>
const UserIcon = () => <svg style={{ width: 20, height: 20 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
const CalendarIcon = () => <svg style={sIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
const ChevronDownIcon = () => <svg style={{ width: 12, height: 12, flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
const Columns3Icon = () => <svg style={sIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M9 3v18M15 3v18" /></svg>
const RotateCcwIcon = ({ spinning }: { spinning?: boolean }) => (
  <svg style={{ ...sIcon, animation: spinning ? 'melis-prospects-spin 0.8s linear infinite' : undefined, transformOrigin: 'center' }}
    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <style>{'@keyframes melis-prospects-spin { to { transform: rotate(360deg) } }'}</style>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
  </svg>
)

// ── Colonnes (masquer + réordonner par glisser-déposer, persisté) ──
type ColDef = { id: string; visible: boolean }
// Ordre + visibilité par défaut calqués sur la liste legacy (ID, Site, Nom, Email, Type, Téléphone, Date, Thème, Message).
const COL_ORDER = ['id', 'site', 'name', 'email', 'type', 'phone', 'date', 'theme', 'message'] as const
const COL_LABEL: Record<string, string> = { id: 'col_id', name: 'col_name', email: 'col_email', phone: 'col_phone', site: 'col_site', type: 'col_type', theme: 'col_theme', date: 'col_date', message: 'col_message' }
const DEFAULT_COLS: ColDef[] = COL_ORDER.map((id) => ({ id, visible: true }))
const COL_KEY = 'melis-prospects-cols-v2'
function loadCols(): ColDef[] {
  try {
    const raw = localStorage.getItem(COL_KEY)
    if (!raw) return DEFAULT_COLS
    const saved: ColDef[] = JSON.parse(raw)
    const ordered = saved.map((s) => { const d = DEFAULT_COLS.find((c) => c.id === s.id); return d ? { id: d.id, visible: s.visible } : null }).filter(Boolean) as ColDef[]
    const missing = DEFAULT_COLS.filter((d) => !saved.find((s) => s.id === d.id))
    return [...ordered, ...missing]
  } catch { return DEFAULT_COLS }
}
function saveCols(c: ColDef[]) { try { localStorage.setItem(COL_KEY, JSON.stringify(c)) } catch { /* */ } }
const visibleCols = (c: ColDef[]) => c.filter((x) => x.visible)

const panelCss: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 2, minHeight: 130, maxHeight: 'min(48vh, 320px)', overflowY: 'auto', minWidth: 0, borderRadius: 8, border: '1px dashed var(--color-border)', padding: 6 }
const panelTitle: CSSProperties = { padding: '0 6px 4px', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--color-muted-foreground)' }

function ColManager({ anchorRef, cols, labelFor, onChange, onClose }: {
  anchorRef: RefObject<HTMLElement | null>; cols: ColDef[]; labelFor: (id: string) => string; onChange: (c: ColDef[]) => void; onClose: () => void
}) {
  const t = useT()
  const [dragId, setDragId] = useState<string | null>(null)
  const [over, setOver] = useState<{ id: string; panel: 'visible' | 'hidden' } | null>(null)
  const [pos, setPos] = useState<{ top?: number; bottom?: number; right: number; maxHeight: number } | null>(null)
  const shown = cols.filter((c) => c.visible)
  const hidden = cols.filter((c) => !c.visible)

  useLayoutEffect(() => {
    const anchor = anchorRef.current
    if (!anchor) return
    const rect = anchor.getBoundingClientRect()
    const margin = 8
    const spaceBelow = window.innerHeight - rect.bottom - margin
    const spaceAbove = rect.top - margin
    const right = Math.max(margin, window.innerWidth - rect.right)
    if (spaceBelow >= 200 || spaceBelow >= spaceAbove) {
      setPos({ top: rect.bottom + 6, right, maxHeight: Math.max(160, spaceBelow - 6) })
    } else {
      setPos({ bottom: window.innerHeight - rect.top + 6, right, maxHeight: Math.max(160, spaceAbove - 6) })
    }
  }, [anchorRef])

  function drop(panel: 'visible' | 'hidden') {
    if (!dragId) return
    const src = cols.find((c) => c.id === dragId)!
    const upd = { ...src, visible: panel === 'visible' }
    let vList = shown.filter((c) => c.id !== dragId)
    const hList = hidden.filter((c) => c.id !== dragId)
    if (panel === 'visible') {
      const dst = over?.id
      if (!dst || dst === '__panel__') vList = [...vList, upd]
      else { const i = vList.findIndex((c) => c.id === dst); vList = i === -1 ? [...vList, upd] : [...vList.slice(0, i), upd, ...vList.slice(i)] }
      const next = [...vList, ...hList]; onChange(next); saveCols(next)
    } else { const next = [...vList, ...hList, upd]; onChange(next); saveCols(next) }
    setDragId(null); setOver(null)
  }

  function item(col: ColDef, panel: 'visible' | 'hidden') {
    const isOver = over?.id === col.id && over?.panel === panel
    return (
      <div key={col.id} draggable
        onDragStart={() => setDragId(col.id)}
        onDragEnd={() => { setDragId(null); setOver(null) }}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); if (over?.id !== col.id || over?.panel !== panel) setOver({ id: col.id, panel }) }}
        onDrop={(e) => { e.preventDefault(); drop(panel) }}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, borderRadius: 8, padding: '6px 8px', fontSize: 14, cursor: 'grab', userSelect: 'none',
          opacity: dragId === col.id ? 0.4 : 1,
          background: isOver ? 'color-mix(in srgb, var(--color-primary) 12%, transparent)' : 'transparent',
          boxShadow: isOver ? '0 0 0 1px color-mix(in srgb, var(--color-primary) 35%, transparent)' : 'none',
        }}>
        <GripIcon /><span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{labelFor(col.id)}</span>
      </div>
    )
  }

  if (!pos) return null
  return (
    <div style={{
      ...card, position: 'fixed', right: pos.right, zIndex: 50, width: 380, maxWidth: 'calc(100vw - 1rem)',
      maxHeight: pos.maxHeight, overflowY: 'auto', display: 'flex', flexDirection: 'column',
      ...(pos.top != null ? { top: pos.top } : { bottom: pos.bottom }),
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderBottom: '1px solid var(--color-border)' }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>{t('columns')}</span>
        <button style={{ ...iconBtn, width: 22, height: 22 }} onClick={onClose}>✕</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: 12 }}>
        <div style={panelCss}
          onDragOver={(e) => { e.preventDefault(); if (over?.id !== '__panel__' || over?.panel !== 'hidden') setOver({ id: '__panel__', panel: 'hidden' }) }}
          onDrop={(e) => { e.preventDefault(); drop('hidden') }}>
          <p style={panelTitle}>{t('cols_hidden')}</p>
          {hidden.length === 0 ? <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--color-muted-foreground)', opacity: 0.5, padding: '16px 0' }}>{t('drag_here')}</div> : hidden.map((c) => item(c, 'hidden'))}
        </div>
        <div style={panelCss}
          onDragOver={(e) => { e.preventDefault(); if (over?.id !== '__panel__' || over?.panel !== 'visible') setOver({ id: '__panel__', panel: 'visible' }) }}
          onDrop={(e) => { e.preventDefault(); drop('visible') }}>
          <p style={panelTitle}>{t('cols_visible')}</p>
          {shown.length === 0 ? <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--color-muted-foreground)', opacity: 0.5, padding: '16px 0' }}>{t('drag_here')}</div> : shown.map((c) => item(c, 'visible'))}
        </div>
      </div>
      <div style={{ borderTop: '1px solid var(--color-border)', padding: 6 }}>
        <button style={{ ...btnGhost, width: '100%', height: 30, border: 0, justifyContent: 'center', color: 'var(--color-muted-foreground)' }}
          onClick={() => { onChange(DEFAULT_COLS); saveCols(DEFAULT_COLS) }}>{t('reset')}</button>
      </div>
    </div>
  )
}

// ── KPI ──
function Kpi({ label: lbl, value }: { label: string; value: number | string | null }) {
  return (
    <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 2, padding: 16, flex: 1, minWidth: 140 }}>
      <span style={{ fontSize: 12, color: 'var(--color-muted-foreground)' }}>{lbl}</span>
      <span style={{ fontSize: 22, fontWeight: 700 }}>{value == null ? '…' : value}</span>
    </div>
  )
}

/** yyyy-mm-dd (heure locale) */
function fmtYmd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ── Filtre de date à présets (Aujourd'hui / Hier / 7 derniers jours / … / Plage personnalisée),
// calqué sur le daterangepicker legacy du back-office (port de melis-commerce/shared/DateRangeFilter —
// la brique ne peut pas importer le module hôte, voir la note en tête de fichier).
function DateRangeFilter({ from, to, onChange }: { from: string; to: string; onChange: (from: string, to: string) => void }) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const [custom, setCustom] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const shift = (n: number) => { const x = new Date(today); x.setDate(x.getDate() + n); return x }
  const y = today.getFullYear(), m = today.getMonth()

  const presets: { key: string; label: string; from: string; to: string }[] = [
    { key: 'all', label: t('dr_all'), from: '', to: '' },
    { key: 'today', label: t('dr_today'), from: fmtYmd(today), to: fmtYmd(today) },
    { key: 'yesterday', label: t('dr_yesterday'), from: fmtYmd(shift(-1)), to: fmtYmd(shift(-1)) },
    { key: 'last7', label: t('dr_last7'), from: fmtYmd(shift(-6)), to: fmtYmd(today) },
    { key: 'last30', label: t('dr_last30'), from: fmtYmd(shift(-29)), to: fmtYmd(today) },
    { key: 'thismonth', label: t('dr_thismonth'), from: fmtYmd(new Date(y, m, 1)), to: fmtYmd(new Date(y, m + 1, 0)) },
    { key: 'lastmonth', label: t('dr_lastmonth'), from: fmtYmd(new Date(y, m - 1, 1)), to: fmtYmd(new Date(y, m, 0)) },
  ]

  const activePreset = presets.find((p) => p.from === from && p.to === to)
  const buttonLabel = activePreset && activePreset.key !== 'all'
    ? activePreset.label
    : (from || to ? `${from || '…'} → ${to || '…'}` : t('dr_label'))

  function pick(p: { from: string; to: string }) { onChange(p.from, p.to); setCustom(false); setOpen(false) }

  const itemStyle = (active: boolean): CSSProperties => ({
    display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', border: 0, borderRadius: 6,
    background: active ? 'var(--color-primary)' : 'transparent', color: active ? 'var(--color-primary-foreground,#fff)' : 'var(--color-foreground)',
    fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
  })

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      <button style={{ ...btnGhost, height: 36, gap: 8 }} onClick={() => setOpen((o) => !o)}>
        <CalendarIcon /><span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>{buttonLabel}</span><ChevronDownIcon />
      </button>
      {open && (
        <div style={{ ...card, position: 'absolute', top: '100%', left: 0, marginTop: 6, zIndex: 60, padding: 6, minWidth: 200 }}>
          {presets.map((p) => (
            <button key={p.key} style={itemStyle(!!activePreset && activePreset.key === p.key && !custom)} onClick={() => pick(p)}>{p.label}</button>
          ))}
          <button style={itemStyle(custom)} onClick={() => setCustom(true)}>{t('dr_custom')}</button>
          {custom && (
            <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 6, paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, fontSize: 12, color: 'var(--color-muted-foreground)' }}>
                {t('dr_from')}<input type="date" style={{ ...inputCss, height: 32, width: 150 }} value={from} onChange={(e) => onChange(e.target.value, to)} />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, fontSize: 12, color: 'var(--color-muted-foreground)' }}>
                {t('dr_to')}<input type="date" style={{ ...inputCss, height: 32, width: 150 }} value={to} onChange={(e) => onChange(from, e.target.value)} />
              </label>
              <button style={{ ...btnGhost, height: 32, justifyContent: 'center' }} onClick={() => setOpen(false)}>{t('dr_apply')}</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
export default function ProspectsPage() {
  const { id } = useParams()
  const location = useLocation()
  // base = route de la liste (pathname sans le segment /:id éventuel)
  const base = id ? location.pathname.slice(0, location.pathname.length - id.length - 1) : location.pathname

  // La liste reste montée en permanence (cachée en CSS quand le formulaire est ouvert) — comme les
  // modules natifs persistants (ex. Languages) : évite de la démonter/refetch à chaque aller-retour.
  return (
    <>
      {/* height:100% : propage la hauteur bornée de l'hôte (BrickHost `h-full`) jusqu'à la liste,
          sinon ce wrapper (hauteur auto) casse la chaîne de `height:100%` et l'iframe de la vue
          « Old » reste coincée à son minHeight (contenu coupé, pas de scroll). */}
      <div style={{ display: id ? 'none' : 'block', height: '100%' }}>
        <ProspectList base={base} />
      </div>
      {id && <ProspectForm id={id} base={base} />}
    </>
  )
}

// ── Liste ───────────────────────────────────────────────────────────────────
function ProspectList({ base }: { base: string }) {
  const t = useT()
  const navigate = useNavigate()
  const location = useLocation()
  const [items, setItems] = useState<ProspectItem[]>([])
  const [stats, setStats] = useState<ProspectStats | null>(null)
  const [sites, setSites] = useState<SiteOption[]>([])
  const [types, setTypes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [site, setSite] = useState<number | null>(null)
  const [type, setType] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortAsc, setSortAsc] = useState(false)
  const [toDelete, setToDelete] = useState<ProspectItem | null>(null)
  const [tick, setTick] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [cols, setCols] = useState<ColDef[]>(loadCols)
  const colsAnchorRef = useRef<HTMLDivElement>(null)
  const [showCols, setShowCols] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [mode, setMode] = useState<ViewMode>('react')
  const [frameLoaded, setFrameLoaded] = useState(false)

  useEffect(() => {
    if (location.pathname === base && consumeProspectsListStale()) setTick((x) => x + 1)
  }, [location.pathname, base])

  useEffect(() => { fetchProspectStats().then(setStats).catch(() => null) }, [tick])
  useEffect(() => { fetchSites().then(setSites).catch(() => null) }, [])
  useEffect(() => { fetchTypes().then(setTypes).catch(() => null) }, [])
  useEffect(() => {
    setLoading(true)
    fetchProspects({ search, site, type, dateFrom, dateTo })
      .then((r) => setItems(r.items)).catch(() => null).finally(() => { setLoading(false); setRefreshing(false) })
  }, [search, site, type, dateFrom, dateTo, tick])

  const sorted = useMemo(() => [...items].sort((a, b) => sortAsc ? a.id - b.id : b.id - a.id), [items, sortAsc])

  function handleRefresh() {
    setItems([]); setRefreshing(true); setTick((x) => x + 1)
  }

  function resetFilters() {
    setSearchInput(''); setSearch(''); setSite(null); setType(''); setDateFrom(''); setDateTo(''); setSortAsc(false)
    setItems([]); setRefreshing(true); setTick((x) => x + 1)
  }

  async function confirmDelete() {
    if (!toDelete) return
    try {
      await deleteProspect(toDelete.id)
      window.__melisCloseSubTab?.(base, `${base}/${toDelete.id}`)
      setToDelete(null); setTick((x) => x + 1)
    } catch { setToDelete(null) }
  }

  function fmtDate(v: string) {
    try { return new Date(v.replace(' ', 'T')).toLocaleDateString(currentLang() === 'fr' ? 'fr-FR' : 'en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }) }
    catch { return v }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 24, height: '100%', boxSizing: 'border-box', overflow: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{t('title')}</h1>
          <p style={{ fontSize: 14, color: 'var(--color-muted-foreground)', margin: '2px 0 0' }}>{t('subtitle')}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ViewToggle mode={mode} onChange={(m) => { setMode(m); if (m === 'iframe') setFrameLoaded(true) }} />
          <button style={btnGhost} onClick={handleRefresh} disabled={refreshing} title={t('refresh')}><RotateCcwIcon spinning={refreshing} /></button>
        </div>
      </div>

      {/* Vue « Old » : outil Prospects legacy en iframe (montée à la 1ʳᵉ activation, gardée en display:none) */}
      {frameLoaded && (
        <div style={{ ...card, display: mode === 'iframe' ? 'flex' : 'none', flex: 1, minHeight: 480, overflow: 'hidden' }}>
          <iframe src={`/melis/react-tool-page?key=${encodeURIComponent(MELIS_KEY)}`}
            style={{ flex: 1, width: '100%', border: 0 }} title="Prospects — Vue Melis"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals" />
        </div>
      )}

      {/* Vue « New » : liste React native */}
      <div style={{ display: mode === 'react' ? 'flex' : 'none', flexDirection: 'column', gap: 20 }}>
      {!can('list') ? (
        <div style={{ ...card, padding: '40px 16px', textAlign: 'center', fontSize: 14, color: 'var(--color-muted-foreground)' }}>{t('no_access')}</div>
      ) : (<>
      {/* KPI */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Kpi label={t('kpi_total')} value={stats?.total ?? null} />
        <Kpi label={t('kpi_month')} value={stats?.thisMonth ?? null} />
        <Kpi label={t('kpi_avg')} value={stats?.avgPerMonth ?? null} />
        <Kpi label={t('kpi_anon')} value={stats?.anonymized ?? null} />
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <input style={{ ...inputCss, height: 36, flex: 1, minWidth: 220 }} value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && setSearch(searchInput.trim())}
          placeholder={t('search')} />
        <select style={{ ...inputCss, height: 36, width: 'auto' }} value={site ?? ''} onChange={(e) => setSite(e.target.value ? Number(e.target.value) : null)}>
          <option value="">{t('all_sites')}</option>
          {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select style={{ ...inputCss, height: 36, width: 'auto' }} value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">{t('all_types')}</option>
          {types.map((tp) => <option key={tp} value={tp}>{tp}</option>)}
        </select>
        <DateRangeFilter from={dateFrom} to={dateTo} onChange={(f, tt) => { setDateFrom(f); setDateTo(tt) }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          <button style={{ ...btnGhost, height: 36 }} onClick={resetFilters} disabled={refreshing} title={t('reset_filters')}>
            <RotateCcwIcon spinning={refreshing} />{t('reset_filters')}
          </button>
          <div ref={colsAnchorRef} style={{ position: 'relative' }}>
            <button style={{ ...btnGhost, height: 36 }} onClick={() => setShowCols((v) => !v)}><Columns3Icon />{t('columns')}</button>
            {showCols && <ColManager anchorRef={colsAnchorRef} cols={cols} labelFor={(id) => t(COL_LABEL[id])} onChange={setCols} onClose={() => setShowCols(false)} />}
          </div>
          {can('export') && <button style={{ ...btnGhost, height: 36 }} onClick={() => setShowExport(true)}><DownloadIcon />{t('export')}</button>}
        </div>
      </div>

      {/* Table */}
      <div style={{ ...card, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1040 }}>
          <thead style={{ background: 'var(--color-muted,rgba(0,0,0,.03))' }}>
            <tr>
              {visibleCols(cols).map(({ id }) => (
                <th key={id} style={{ ...th, ...(id === 'id' ? { cursor: 'pointer', width: 70 } : {}) }}
                  onClick={id === 'id' ? () => setSortAsc((v) => !v) : undefined}>
                  {t(COL_LABEL[id])}{id === 'id' ? ` ${sortAsc ? '↑' : '↓'}` : ''}
                </th>
              ))}
              <th style={{ ...th, width: 80 }} />
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && !loading ? (
              <tr><td style={{ ...td, textAlign: 'center', color: 'var(--color-muted-foreground)', padding: '40px 16px' }} colSpan={visibleCols(cols).length + 1}>{t('empty')}</td></tr>
            ) : sorted.map((r) => (
              <tr key={r.id}>
                {visibleCols(cols).map(({ id }) => (
                  <td key={id} style={{
                    ...td,
                    ...(id === 'id' ? { color: 'var(--color-muted-foreground)', fontVariantNumeric: 'tabular-nums' } : {}),
                    ...(id === 'message' ? { maxWidth: 240, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } : {}),
                  }} title={id === 'message' ? r.message : undefined}>
                    {id === 'id' && r.id}
                    {id === 'name' && r.name}
                    {id === 'email' && r.email}
                    {id === 'phone' && r.telephone}
                    {id === 'site' && (r.siteName ?? t('none'))}
                    {id === 'type' && (r.type ?? t('none'))}
                    {id === 'theme' && (r.themeName ?? t('none'))}
                    {id === 'date' && fmtDate(r.contactDate)}
                    {id === 'message' && r.message}
                  </td>
                ))}
                <td style={td}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                    {can('edit') && <button style={iconBtn} title={t('edit')} onClick={() => navigate(`${base}/${r.id}`)}><PencilIcon /></button>}
                    {can('delete') && <button style={{ ...iconBtn, color: 'var(--color-destructive,#ef4444)' }} title={t('del')} onClick={() => setToDelete(r)}><TrashIcon /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: '10px 16px', textAlign: 'center', fontSize: 12, color: 'var(--color-muted-foreground)' }}>
          {loading ? t('loading') : t('count', { n: items.length })}
        </div>
      </div>
      </>)}
      </div>

      {/* Suppression */}
      {toDelete && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.5)' }}>
          <div style={{ ...card, padding: 24, width: '100%', maxWidth: 360 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{t('del_title')}</h3>
            <p style={{ fontSize: 14, color: 'var(--color-muted-foreground)', marginTop: 8 }}>{t('del_confirm', { u: toDelete.name })}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <button style={btnGhost} onClick={() => setToDelete(null)}>{t('cancel')}</button>
              <button style={{ ...btnGhost, borderColor: '#fca5a5', color: '#dc2626' }} onClick={confirmDelete}>{t('del')}</button>
            </div>
          </div>
        </div>
      )}

      {showExport && (
        <ExportModal<ProspectItem>
          cols={cols}
          labelFor={(id) => t(COL_LABEL[id])}
          fetchAll={async () => (await fetchProspects({ search, site, type, dateFrom, dateTo })).items}
          getCell={(r, id) => {
            if (id === 'id') return r.id
            if (id === 'name') return r.name
            if (id === 'email') return r.email
            if (id === 'phone') return r.telephone
            if (id === 'site') return r.siteName ?? ''
            if (id === 'type') return r.type ?? ''
            if (id === 'theme') return r.themeName ?? ''
            if (id === 'date') return fmtDate(r.contactDate)
            if (id === 'message') return r.message
            return ''
          }}
          filename={currentLang() === 'fr' ? 'prospects' : 'prospects'}
          sheetName={t('title')}
          total={items.length}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  )
}

// ── Formulaire ────────────────────────────────────────────────────────────────
function ProspectForm({ id, base }: { id: string; base: string }) {
  const t = useT()
  const navigate = useNavigate()
  const prospectId = parseInt(id)
  const path = `${base}/${id}`

  const [item, setItem] = useState<ProspectItem | null>(null)
  const [siteId, setSiteId] = useState<number | ''>('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [company, setCompany] = useState('')
  const [country, setCountry] = useState('')
  const [message, setMessage] = useState('')
  const [theme, setTheme] = useState<number | ''>('')
  const [sites, setSites] = useState<SiteOption[]>([])
  const [themes, setThemes] = useState<ThemeOption[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const subTabRegistered = useRef(false)

  useEffect(() => { if (!can('edit')) navigate(base) }, [base, navigate])
  useEffect(() => { fetchSites().then(setSites).catch(() => null) }, [])
  useEffect(() => { fetchThemes().then(setThemes).catch(() => null) }, [])

  // Sous-onglet hôte (SubTabBar) — même mécanisme que l'outil Utilisateurs : ouvert au montage,
  // libellé mis à jour une fois le prospect chargé (jamais de titre générique persistant).
  useEffect(() => {
    if (!subTabRegistered.current) {
      window.__melisOpenSubTab?.(base, { id: path, label: t('loading'), path })
      subTabRegistered.current = true
    }
  }, [base, path, t])

  useEffect(() => {
    setLoading(true)
    fetchProspectById(prospectId)
      .then((r) => {
        setItem(r)
        setSiteId(r.siteId ?? '')
        setName(r.name); setEmail(r.email); setTelephone(r.telephone)
        setCompany(r.company ?? ''); setCountry(r.country ?? ''); setMessage(r.message)
        setTheme(r.theme ?? '')
        window.__melisUpdateSubTabLabel?.(base, path, r.name)
      })
      .catch(() => navigate(base))
      .finally(() => setLoading(false))
  }, [prospectId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function submit() {
    setError(null)
    if (!name.trim() || !email.trim() || !telephone.trim() || !message.trim()) { setError(t('err_required')); return }
    setSaving(true)
    try {
      await saveProspect({
        id: prospectId, siteId: siteId === '' ? null : Number(siteId),
        name: name.trim(), email: email.trim(), telephone: telephone.trim(),
        message: message.trim(), company: company.trim(), country: country.trim(),
        theme: theme === '' ? null : Number(theme),
      })
      markProspectsListStale()
      notify('ok', t('title'), t('saved'))
      window.__melisUpdateSubTabLabel?.(base, path, name.trim())
      setTimeout(() => navigate(base), 600)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('err_save'))
    } finally { setSaving(false) }
  }

  function fmtDate(v: string) {
    try { return new Date(v.replace(' ', 'T')).toLocaleString(currentLang() === 'fr' ? 'fr-FR' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }) }
    catch { return v }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 24, height: '100%', boxSizing: 'border-box', overflow: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', color: 'var(--color-primary)' }}><UserIcon /></span>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{item?.name || t('edit_title')}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button style={btnPrimary} onClick={submit} disabled={saving || loading}>{saving ? '…' : t('save')}</button>
        </div>
      </div>

      {error && <div style={{ ...card, borderColor: '#fca5a5', background: '#fef2f2', color: '#b91c1c', padding: '8px 14px', fontSize: 14 }}>{error}</div>}

      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--color-muted-foreground)' }}>{t('loading')}</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(240px,280px)', gap: 20, alignItems: 'start' }}>
          {/* Colonne principale */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ ...card, padding: 20 }}>
              <h3 style={secTitle}>{t('sec_contact')}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={label}>{t('f_name')}</label>
                  <input style={inputCss} value={name} onChange={(e) => setName(e.target.value)} maxLength={255} autoComplete="off" />
                </div>
                <div>
                  <label style={label}>{t('f_email')}</label>
                  <input style={inputCss} type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} autoComplete="off" />
                </div>
                <div>
                  <label style={label}>{t('f_phone')}</label>
                  <input style={inputCss} value={telephone} onChange={(e) => setTelephone(e.target.value)} autoComplete="off" />
                </div>
                <div>
                  <label style={label}>{t('f_company')}</label>
                  <input style={inputCss} value={company} onChange={(e) => setCompany(e.target.value)} maxLength={45} autoComplete="off" />
                </div>
                <div>
                  <label style={label}>{t('f_country')}</label>
                  <input style={inputCss} value={country} onChange={(e) => setCountry(e.target.value)} maxLength={45} autoComplete="off" />
                </div>
              </div>
            </div>

            <div style={{ ...card, padding: 20 }}>
              <h3 style={secTitle}>{t('sec_message')}</h3>
              <textarea style={{ ...inputCss, height: 'auto', minHeight: 140, padding: 12, resize: 'vertical' }} value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
          </div>

          {/* Colonne latérale */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ ...card, padding: 16 }}>
              <h3 style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--color-muted-foreground)', margin: '0 0 12px' }}>{t('sec_details')}</h3>
              <div style={{ marginBottom: 14 }}>
                <label style={label}>{t('f_site')}</label>
                <select style={inputCss} value={siteId} onChange={(e) => setSiteId(e.target.value ? Number(e.target.value) : '')}>
                  <option value="">{t('f_site_ph')}</option>
                  {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={label}>{t('f_theme')}</label>
                <select style={inputCss} value={theme} onChange={(e) => setTheme(e.target.value ? Number(e.target.value) : '')}>
                  <option value="">{t('none')}</option>
                  {themes.map((th) => <option key={th.id} value={th.id}>{th.name}</option>)}
                </select>
              </div>
              <div>
                <label style={label}>{t('f_date')}</label>
                <input style={{ ...inputCss, color: 'var(--color-muted-foreground)' }} value={item ? fmtDate(item.contactDate) : ''} disabled />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
