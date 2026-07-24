import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  deleteTheme, fetchThemeById, fetchThemes, fetchThemeStats, saveTheme,
  markThemesListStale, consumeThemesListStale,
  fetchThemeItems, fetchThemeItemById, fetchCmsLanguages, saveThemeItem, deleteThemeItem,
  type ThemeItem, type ThemeStats, type ThemeItemRow, type CmsLang,
} from './prospect-themes-api'
import { ExportModal, DownloadIcon } from './ExportModal'
import { ViewToggle, type ViewMode } from './ViewToggle'

// Outil Thèmes legacy (vue « Old » en iframe). Renderable ZONE key — le `conf.type` target.
// Les droits ne s'accrochent PAS dessus (cf. brick.manifest.json → melisKey).
const MELIS_KEY = 'MelisCmsProspects_tool_themes'

// Capability key — doit correspondre à config/react.capabilities.php (melisKey du nœud de menu
// porteur de droits). Distinct de la zone-key ci-dessus.
const CAPS_KEY = 'melisprospects_tool_themes_section'

declare global {
  interface Window {
    MelisCan?: (melisKey: string, cap: string) => boolean
    // Publié par l'hôte (melis-core, lib/tool-view-mode) : dit quelle vue du toggle est active,
    // pour que la ToolTabBar masque les onglets legacy de l'iframe « Old » en vue React.
    __melisSetToolView?: (melisKey: string, view: ViewMode) => void
    __melisOpenSubTab?: (section: string, tab: { id: string; label: string; path: string }) => void
    __melisUpdateSubTabLabel?: (section: string, id: string, label: string) => void
    __melisCloseSubTab?: (section: string, id: string) => void
  }
}

// Capacités (droits avancés) : la brique ne peut PAS importer le hook hôte → lit le global window.MelisCan.
// Default-allow (true) tant que non chargé / pour un admin ; l'API reste gardée côté serveur (403).
function can(cap: string): boolean {
  return window.MelisCan?.(CAPS_KEY, cap) ?? true
}

/* ──────────────────────────────────────────────────────────────────────────
 * Brique « Thèmes » (MelisCmsProspects) — full React, montée à /prospect-themes
 * (et /prospect-themes/:id | /new pour le formulaire). La brique ne peut PAS
 * importer les modules de l'hôte : tout est en styles inline + variables CSS du
 * thème, avec un mini-dictionnaire FR/EN lu depuis <html lang>.
 * Design calqué sur l'outil Prospects (même module) / Users (natif).
 * ────────────────────────────────────────────────────────────────────────── */

// ── i18n minimal ──
type Lang = 'fr' | 'en'
function currentLang(): Lang {
  const l = (document.documentElement.lang || 'en').toLowerCase()
  return l.startsWith('fr') ? 'fr' : 'en'
}
const DICT: Record<Lang, Record<string, string>> = {
  fr: {
    title: 'Thèmes', subtitle: 'Thèmes de contact (formulaires de prospects)',
    search: 'Rechercher un thème…', empty: 'Aucun thème trouvé', count: '{n} thèmes — fin de la liste',
    kpi_total: 'Total', kpi_code: 'Avec code', kpi_items: 'Éléments',
    col_id: 'ID', col_name: 'Nom', col_code: 'Code', col_items: 'Éléments',
    columns: 'Colonnes', export: 'Exporter', cols_visible: 'Visibles', cols_hidden: 'Masquées', drag_here: 'Glisser ici', reset: 'Réinitialiser',
    reset_filters: 'Réinitialiser les filtres',
    rename: 'Renommer', edit: 'Éditer', del: 'Supprimer', cancel: 'Annuler', save: 'Enregistrer', back: 'Retour', add: 'Nouveau thème',
    items_title: 'Éléments — {u}', items_add: 'Nouvel élément', items_empty: 'Aucun élément', items_count: '{n} éléments',
    items_search: 'Rechercher un élément…',
    items_new_title: 'Nouvel élément', items_edit_title: 'Élément', items_name: 'Nom',
    tab_theme: 'Thème', tab_items: 'Éléments',
    items_content_per_lang: 'Contenu par langue',
    items_required: 'Au moins un nom (dans une langue) est obligatoire.',
    items_del_title: 'Supprimer l’élément', items_del_confirm: 'Supprimer « {u} » ? Cette action est irréversible.',
    refresh: 'Rafraîchir', loading: 'Chargement…', saved: 'Enregistré ✓',
    del_title: 'Supprimer le thème', del_confirm: 'Supprimer « {u} » ? Ses éléments et traductions seront aussi supprimés. Cette action est irréversible.',
    edit_title: 'Thème', new_title: 'Nouveau thème', sec_identity: 'Identité', sec_info: 'Information',
    f_name: 'Nom', f_code: 'Code', f_code_ph: 'Optionnel — identifiant technique',
    info_note: 'Le nom identifie le thème dans le back-office (formulaires de prospects).',
    err_save: 'Erreur lors de la sauvegarde', err_required: 'Le nom du thème est obligatoire.',
    no_access: 'Vous n’avez pas les droits pour consulter cette liste.', none: '—',
  },
  en: {
    title: 'Themes', subtitle: 'Contact themes (prospect forms)',
    search: 'Search a theme…', empty: 'No theme found', count: '{n} themes — end of list',
    kpi_total: 'Total', kpi_code: 'With code', kpi_items: 'Items',
    col_id: 'ID', col_name: 'Name', col_code: 'Code', col_items: 'Items',
    columns: 'Columns', export: 'Export', cols_visible: 'Visible', cols_hidden: 'Hidden', drag_here: 'Drag here', reset: 'Reset',
    reset_filters: 'Reset filters',
    rename: 'Rename', edit: 'Edit', del: 'Delete', cancel: 'Cancel', save: 'Save', back: 'Back', add: 'New theme',
    items_title: 'Items — {u}', items_add: 'New item', items_empty: 'No item', items_count: '{n} items',
    items_search: 'Search an item…',
    items_new_title: 'New item', items_edit_title: 'Item', items_name: 'Name',
    tab_theme: 'Theme', tab_items: 'Items',
    items_content_per_lang: 'Content per language',
    items_required: 'At least one name (in one language) is required.',
    items_del_title: 'Delete item', items_del_confirm: 'Delete “{u}”? This action is irreversible.',
    refresh: 'Refresh', loading: 'Loading…', saved: 'Saved ✓',
    del_title: 'Delete theme', del_confirm: 'Delete “{u}”? Its items and translations will also be removed. This action is irreversible.',
    edit_title: 'Theme', new_title: 'New theme', sec_identity: 'Identity', sec_info: 'Information',
    f_name: 'Name', f_code: 'Code', f_code_ph: 'Optional — technical identifier',
    info_note: 'The name identifies the theme in the back-office (prospect forms).',
    err_save: 'Error while saving', err_required: 'The theme name is required.',
    no_access: 'You do not have permission to view this list.', none: '—',
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
// Onglets de langue (« Contenu par langue ») — calqués sur CategoryEditor (melis-cms-category2).
const langTab: CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, height: 30, padding: '0 12px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-muted-foreground)', fontSize: 13, cursor: 'pointer' }
const langTabActive: CSSProperties = { background: 'var(--color-card)', color: 'var(--color-foreground)', borderColor: 'var(--color-primary,#e11d48)' }

// Drapeau de langue — même source d'images que l'hôte (/MelisCore/assets/images/lang/<xx>.png).
function LangFlag({ locale, size = 15 }: { locale: string; size?: number }) {
  const short = (locale || '').split('_')[0].toLowerCase()
  if (!short) return null
  return (
    <img src={`/MelisCore/assets/images/lang/${short}.png`} alt="" width={size} height={Math.round((size * 2) / 3)}
      style={{ display: 'inline-block', borderRadius: 2, objectFit: 'cover', boxShadow: '0 0 0 1px rgba(0,0,0,.10)', flexShrink: 0 }}
      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
  )
}

const sIcon = { width: 15, height: 15, flexShrink: 0 } as const
const PencilIcon = () => <svg style={sIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
const TrashIcon = () => <svg style={sIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg>
const PlusIcon = () => <svg style={sIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
// Action « Renommer » : édite le nom/code du thème → icône « champ texte / curseur » (text-cursor-input).
const RenameIcon = () => <svg style={sIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h1a3 3 0 0 1 3 3 3 3 0 0 1 3-3h1" /><path d="M13 20h-1a3 3 0 0 1-3-3 3 3 0 0 1-3 3H5" /><path d="M5 16H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1" /><path d="M13 8h7a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-7" /><path d="M9 7v10" /></svg>
const GripIcon = () => <svg style={{ width: 13, height: 13, flexShrink: 0, color: 'var(--color-muted-foreground)' }} viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" /><circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="9" cy="18" r="1.5" /></svg>
// Icône « recherche » (lucide Search) placée À L'INTÉRIEUR du champ.
const SearchIcon = () => <svg style={{ width: 16, height: 16, flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
const TagIcon = () => <svg style={{ width: 20, height: 20 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" /><circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" /></svg>
const Columns3Icon = () => <svg style={sIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M9 3v18M15 3v18" /></svg>
const RotateCcwIcon = ({ spinning }: { spinning?: boolean }) => (
  <svg style={{ ...sIcon, animation: spinning ? 'melis-themes-spin 0.8s linear infinite' : undefined, transformOrigin: 'center' }}
    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <style>{'@keyframes melis-themes-spin { to { transform: rotate(360deg) } }'}</style>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
  </svg>
)

// ── Colonnes (masquer + réordonner par glisser-déposer, persisté) ──
type ColDef = { id: string; visible: boolean }
const COL_ORDER = ['id', 'name', 'items'] as const
const COL_LABEL: Record<string, string> = { id: 'col_id', name: 'col_name', items: 'col_items' }
const DEFAULT_COLS: ColDef[] = COL_ORDER.map((id) => ({ id, visible: true }))
const COL_KEY = 'melis-prospect-themes-cols-v2'
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

// ════════════════════════════════════════════════════════════════════════════
export default function ProspectThemesPage() {
  const { id } = useParams()
  const location = useLocation()
  // base = route de la liste (pathname sans le segment /:id | /new éventuel)
  const base = id ? location.pathname.slice(0, location.pathname.length - id.length - 1) : location.pathname

  return (
    <>
      <div style={{ display: id ? 'none' : 'block', height: '100%' }}>
        <ThemeList base={base} />
      </div>
      {id && <ThemeForm id={id} base={base} />}
    </>
  )
}

// ── Liste ───────────────────────────────────────────────────────────────────
function ThemeList({ base }: { base: string }) {
  const t = useT()
  const navigate = useNavigate()
  const location = useLocation()
  const [items, setItems] = useState<ThemeItem[]>([])
  const [stats, setStats] = useState<ThemeStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [sortAsc, setSortAsc] = useState(false)
  const [toDelete, setToDelete] = useState<ThemeItem | null>(null)
  const [editingTheme, setEditingTheme] = useState<ThemeItem | 'new' | null>(null)
  const [tick, setTick] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [cols, setCols] = useState<ColDef[]>(loadCols)
  const colsAnchorRef = useRef<HTMLDivElement>(null)
  const [showCols, setShowCols] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [mode, setMode] = useState<ViewMode>('react')
  const [frameLoaded, setFrameLoaded] = useState(false)

  // Publier la vue courante à l'hôte : en vue React, la ToolTabBar masque les onglets legacy
  // que l'iframe « Old » (restée montée en display:none) continue de publier → plus d'onglet
  // fantôme non-cliquable après un retour en « New ».
  useEffect(() => { window.__melisSetToolView?.(MELIS_KEY, mode) }, [mode])

  useEffect(() => {
    if (location.pathname === base && consumeThemesListStale()) setTick((x) => x + 1)
  }, [location.pathname, base])

  useEffect(() => { fetchThemeStats().then(setStats).catch(() => null) }, [tick])
  useEffect(() => {
    setLoading(true)
    fetchThemes({ search })
      .then((r) => setItems(r.items)).catch(() => null).finally(() => { setLoading(false); setRefreshing(false) })
  }, [search, tick])

  const sorted = useMemo(() => [...items].sort((a, b) => sortAsc ? a.id - b.id : b.id - a.id), [items, sortAsc])

  function handleRefresh() { setItems([]); setRefreshing(true); setTick((x) => x + 1) }
  function resetFilters() {
    setSearchInput(''); setSearch(''); setSortAsc(false)
    setItems([]); setRefreshing(true); setTick((x) => x + 1)
  }

  async function confirmDelete() {
    if (!toDelete) return
    try {
      await deleteTheme(toDelete.id)
      window.__melisCloseSubTab?.(base, `${base}/${toDelete.id}`)
      setToDelete(null); setTick((x) => x + 1)
    } catch { setToDelete(null) }
  }

  function cellText(r: ThemeItem, id: string): string | number {
    if (id === 'id') return r.id
    if (id === 'name') return r.name
    if (id === 'items') return r.itemCount
    return ''
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
          {can('create') && <button style={btnPrimary} onClick={() => setEditingTheme('new')}><PlusIcon />{t('add')}</button>}
        </div>
      </div>

      {/* Vue « Old » : outil Thèmes legacy en iframe */}
      {frameLoaded && (
        <div style={{ ...card, display: mode === 'iframe' ? 'flex' : 'none', flex: 1, minHeight: 480, overflow: 'hidden' }}>
          <iframe src={`/melis/react-tool-page?key=${encodeURIComponent(MELIS_KEY)}`}
            style={{ flex: 1, width: '100%', border: 0 }} title="Thèmes — Vue Melis"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals" />
        </div>
      )}

      {/* Vue « New » : liste React native */}
      <div style={{ display: mode === 'react' ? 'flex' : 'none', flexDirection: 'column', gap: 20, flex: 1, minHeight: 0 }}>
      {!can('list') ? (
        <div style={{ ...card, padding: '40px 16px', textAlign: 'center', fontSize: 14, color: 'var(--color-muted-foreground)' }}>{t('no_access')}</div>
      ) : (<>
      {/* KPI */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Kpi label={t('kpi_total')} value={stats?.total ?? null} />
        <Kpi label={t('kpi_items')} value={stats?.items ?? null} />
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <input style={{ ...inputCss, height: 36, flex: 1, minWidth: 220 }} value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && setSearch(searchInput.trim())}
          placeholder={t('search')} />
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
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
          <thead style={{ background: 'var(--color-muted,rgba(0,0,0,.03))' }}>
            <tr>
              {visibleCols(cols).map(({ id }) => (
                <th key={id} style={{ ...th, ...(id === 'id' ? { cursor: 'pointer', width: 70 } : {}), ...(id === 'items' ? { width: 100 } : {}) }}
                  onClick={id === 'id' ? () => setSortAsc((v) => !v) : undefined}>
                  {t(COL_LABEL[id])}{id === 'id' ? ` ${sortAsc ? '↑' : '↓'}` : ''}
                </th>
              ))}
              <th style={{ ...th, width: 120 }} />
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
                    ...(id === 'name' ? { fontWeight: 500 } : {}),
                  }}>
                    {id === 'id' && r.id}
                    {id === 'name' && r.name}
                    {id === 'items' && r.itemCount}
                  </td>
                ))}
                <td style={td}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                    {/* Renommer : le thème n'a qu'un champ → modale (legacy btn_prospects_theme_edit, tooltip « Rename »). */}
                    {can('edit') && <button style={iconBtn} title={t('rename')} onClick={() => setEditingTheme(r)}><RenameIcon /></button>}
                    {/* Éditer : ouvre le thème en SOUS-ONGLET pour gérer ses éléments (legacy btn_prospects_theme_items).
                        Gaté par la capacité `items`. */}
                    {can('items') && <button style={iconBtn} title={t('edit')} onClick={() => navigate(`${base}/${r.id}`)}><PencilIcon /></button>}
                    {/* Supprimer (legacy btn_prospects_theme_delete) */}
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

      {/* Ajout / renommage d'un thème (modale — un seul champ) */}
      {editingTheme && (
        <ThemeModal
          theme={editingTheme}
          onClose={() => setEditingTheme(null)}
          onSaved={() => { setEditingTheme(null); setTick((x) => x + 1) }}
        />
      )}

      {/* Suppression */}
      {toDelete && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.5)' }}>
          <div style={{ ...card, padding: 24, width: '100%', maxWidth: 380 }}>
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
        <ExportModal<ThemeItem>
          cols={cols}
          labelFor={(id) => t(COL_LABEL[id])}
          fetchAll={async () => (await fetchThemes({ search })).items}
          getCell={(r, id) => cellText(r, id)}
          filename="prospect-themes"
          sheetName={t('title')}
          total={items.length}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  )
}

// ── Modale d'ajout/renommage d'un thème (un seul champ : le Nom) ──────────────
// Le thème n'a qu'un champ éditable → une modale suffit (pas de sous-onglet).
function ThemeModal({ theme, onClose, onSaved }: { theme: ThemeItem | 'new'; onClose: () => void; onSaved: () => void }) {
  const t = useT()
  const isNew = theme === 'new'
  const [name, setName] = useState(isNew ? '' : theme.name)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    setError(null)
    if (!name.trim()) { setError(t('err_required')); return }
    setSaving(true)
    try {
      // Parité legacy (`prospects_theme_form`) : uniquement ID + Nom (le back préserve le code).
      await saveTheme({ id: isNew ? 0 : theme.id, name: name.trim() })
      notify('ok', t('title'), t('saved'))
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('err_save'))
    } finally { setSaving(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.5)', padding: 16 }}>
      <div style={{ ...card, padding: 24, width: '100%', maxWidth: 420 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px' }}>{isNew ? t('new_title') : t('rename')}</h3>
        {error && <div style={{ ...card, borderColor: '#fca5a5', background: '#fef2f2', color: '#b91c1c', padding: '8px 14px', fontSize: 14, marginBottom: 14 }}>{error}</div>}
        <label style={label}>{t('f_name')}</label>
        <input style={inputCss} value={name} maxLength={45} autoComplete="off" autoFocus
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !saving) submit() }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
          <button style={btnGhost} onClick={onClose}>{t('cancel')}</button>
          <button style={btnPrimary} onClick={submit} disabled={saving}>{saving ? '…' : t('save')}</button>
        </div>
      </div>
    </div>
  )
}

// ── Sous-onglet « Éléments du thème » ────────────────────────────────────────
// Ouvert par l'action « Éditer » de la liste (route /prospect-themes/:id). Le thème
// lui-même se renomme via une modale (ThemeModal) ; ce sous-onglet ne gère QUE ses éléments.
function ThemeForm({ id, base }: { id: string; base: string }) {
  const t = useT()
  const navigate = useNavigate()
  const themeId = parseInt(id)
  const path = `${base}/${id}`

  const [item, setItem] = useState<ThemeItem | null>(null)
  const [loading, setLoading] = useState(true)
  const subTabRegistered = useRef(false)

  // Accès réservé à la capacité `items` ; /new (création) passe par la modale, pas cette route.
  useEffect(() => { if (id === 'new' || !can('items')) navigate(base) }, [id, base, navigate])

  // Sous-onglet hôte (SubTabBar) — ouvert au montage, libellé mis à jour au chargement.
  useEffect(() => {
    if (!subTabRegistered.current) {
      window.__melisOpenSubTab?.(base, { id: path, label: t('loading'), path })
      subTabRegistered.current = true
    }
  }, [base, path, t])

  useEffect(() => {
    if (id === 'new') return
    setLoading(true)
    fetchThemeById(themeId)
      .then((r) => { setItem(r); window.__melisUpdateSubTabLabel?.(base, path, r.name) })
      .catch(() => navigate(base))
      .finally(() => setLoading(false))
  }, [themeId]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 24, height: '100%', boxSizing: 'border-box', overflow: 'auto' }}>
      {/* Header : nom du thème (le Retour est fourni par le sous-onglet hôte) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', color: 'var(--color-primary)' }}><TagIcon /></span>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{item?.name || t('edit_title')}</h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: '2px 0 0' }}>{t('tab_items')}</p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--color-muted-foreground)' }}>{t('loading')}</div>
      ) : item ? (
        <ThemeItemsPanel theme={item} />
      ) : null}
    </div>
  )
}

// ── Éléments du thème (sous-outil natif React) ───────────────────────────────
// Ouvert par l'action « Éditer » de la liste des thèmes. Liste + ajout/édition
// (un nom par langue CMS) + suppression, 100% React (remplace l'iframe legacy).
function ThemeItemsPanel({ theme }: { theme: ThemeItem }) {
  const t = useT()
  const [rows, setRows] = useState<ThemeItemRow[]>([])
  const [langs, setLangs] = useState<CmsLang[]>([])
  const [loading, setLoading] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [tick, setTick] = useState(0)
  const [editing, setEditing] = useState<number | 'new' | null>(null)
  const [toDelete, setToDelete] = useState<ThemeItemRow | null>(null)

  // Recherche « live » débouncée (aucun bouton, aucune touche Entrée) — cf. skill list-toolbar.
  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), 300)
    return () => clearTimeout(id)
  }, [searchInput])

  useEffect(() => { fetchCmsLanguages().then(setLangs).catch(() => null) }, [])
  useEffect(() => {
    setLoading(true)
    fetchThemeItems(theme.id, { search }).then(setRows).catch(() => null).finally(() => setLoading(false))
  }, [theme.id, search, tick])

  const resetFilters = () => { setSearchInput(''); setSearch(''); setTick((x) => x + 1) }

  async function confirmDelete() {
    if (!toDelete) return
    try { await deleteThemeItem(toDelete.id); setToDelete(null); setTick((x) => x + 1); markThemesListStale() }
    catch { setToDelete(null) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, minHeight: 0 }}>
      {/* Barre : recherche (icône dans le champ, live) + Réinitialiser + « Nouvel élément »
          (le sous-onglet hôte fournit déjà Retour + titre) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--color-muted-foreground)', display: 'inline-flex' }}><SearchIcon /></span>
          <input style={{ ...inputCss, height: 36, width: '100%', paddingLeft: 34 }} value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('items_search')} />
        </div>
        <button style={{ ...btnGhost, height: 36 }} onClick={resetFilters} title={t('reset_filters')}>
          <RotateCcwIcon />{t('reset_filters')}
        </button>
        {can('items.create') && <button style={btnPrimary} onClick={() => setEditing('new')}><PlusIcon />{t('items_add')}</button>}
      </div>

      {/* Table */}
      <div style={{ ...card, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
          <thead style={{ background: 'var(--color-muted,rgba(0,0,0,.03))' }}>
            <tr>
              <th style={{ ...th, width: 70 }}>{t('col_id')}</th>
              <th style={th}>{t('items_name')}</th>
              <th style={{ ...th, width: 90 }} />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !loading ? (
              <tr><td style={{ ...td, textAlign: 'center', color: 'var(--color-muted-foreground)', padding: '40px 16px' }} colSpan={3}>{t('items_empty')}</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id}>
                <td style={{ ...td, color: 'var(--color-muted-foreground)', fontVariantNumeric: 'tabular-nums' }}>{r.id}</td>
                <td style={{ ...td, fontWeight: 500 }}>{r.name}</td>
                <td style={td}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                    {can('items.edit') && <button style={iconBtn} title={t('edit')} onClick={() => setEditing(r.id)}><PencilIcon /></button>}
                    {can('items.delete') && <button style={{ ...iconBtn, color: 'var(--color-destructive,#ef4444)' }} title={t('del')} onClick={() => setToDelete(r)}><TrashIcon /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: '10px 16px', textAlign: 'center', fontSize: 12, color: 'var(--color-muted-foreground)' }}>
          {loading ? t('loading') : t('items_count', { n: rows.length })}
        </div>
      </div>

      {editing !== null && (
        <ThemeItemForm
          theme={theme}
          itemId={editing === 'new' ? 0 : editing}
          langs={langs}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); setTick((x) => x + 1); markThemesListStale() }}
        />
      )}

      {toDelete && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.5)' }}>
          <div style={{ ...card, padding: 24, width: '100%', maxWidth: 380 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{t('items_del_title')}</h3>
            <p style={{ fontSize: 14, color: 'var(--color-muted-foreground)', marginTop: 8 }}>{t('items_del_confirm', { u: toDelete.name })}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <button style={btnGhost} onClick={() => setToDelete(null)}>{t('cancel')}</button>
              <button style={{ ...btnGhost, borderColor: '#fca5a5', color: '#dc2626' }} onClick={confirmDelete}>{t('del')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Modale d'ajout/édition d'un élément : un champ texte par langue CMS.
function ThemeItemForm({ theme, itemId, langs, onClose, onSaved }: {
  theme: ThemeItem; itemId: number; langs: CmsLang[]; onClose: () => void; onSaved: () => void
}) {
  const t = useT()
  const isNew = itemId === 0
  const [texts, setTexts] = useState<Record<string, string>>({})
  const [activeLang, setActiveLang] = useState<number>(langs[0]?.id ?? 1)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { if (langs.length && !langs.some((l) => l.id === activeLang)) setActiveLang(langs[0].id) }, [langs]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isNew) return
    setLoading(true)
    fetchThemeItemById(itemId)
      .then((d) => setTexts(d.translations ?? {}))
      .catch(() => onClose())
      .finally(() => setLoading(false))
  }, [itemId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function submit() {
    setError(null)
    const anyText = Object.values(texts).some((v) => v && v.trim() !== '')
    if (!anyText) { setError(t('items_required')); return }
    setSaving(true)
    try {
      await saveThemeItem({ id: itemId, themeId: theme.id, translations: texts })
      notify('ok', t('items_edit_title'), t('saved'))
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('err_save'))
    } finally { setSaving(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.5)', padding: 16 }}>
      <div style={{ ...card, padding: 24, width: '100%', maxWidth: 460, maxHeight: '90vh', overflow: 'auto' }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px' }}>{isNew ? t('items_new_title') : t('items_edit_title')}</h3>
        {error && <div style={{ ...card, borderColor: '#fca5a5', background: '#fef2f2', color: '#b91c1c', padding: '8px 14px', fontSize: 14, marginBottom: 14 }}>{error}</div>}
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-muted-foreground)' }}>{t('loading')}</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--color-muted-foreground)' }}>{t('items_content_per_lang')}</div>
            {/* Onglets par langue : un drapeau + nom + pastille « rempli ». */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, borderBottom: '1px solid var(--color-border)', paddingBottom: 12 }}>
              {langs.map((l) => {
                const filled = (texts[String(l.id)] ?? '').trim() !== ''
                return (
                  <button key={l.id} type="button" onClick={() => setActiveLang(l.id)}
                    style={{ ...langTab, ...(activeLang === l.id ? langTabActive : {}) }}>
                    <LangFlag locale={l.locale} size={15} />
                    <span style={{ textAlign: 'left' }}>{l.name}</span>
                    <span title={filled ? undefined : t('items_required')}
                      style={{ width: 6, height: 6, borderRadius: 999, flexShrink: 0, background: filled ? '#22c55e' : 'var(--color-border)' }} />
                  </button>
                )
              })}
            </div>
            {/* Champ de la langue active uniquement. */}
            <div>
              <label style={label}>{t('items_name')}</label>
              <input style={inputCss} value={texts[String(activeLang)] ?? ''} maxLength={255} autoComplete="off" autoFocus
                onChange={(e) => setTexts((p) => ({ ...p, [String(activeLang)]: e.target.value }))} />
            </div>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
          <button style={btnGhost} onClick={onClose}>{t('cancel')}</button>
          <button style={btnPrimary} onClick={submit} disabled={saving || loading}>{saving ? '…' : t('save')}</button>
        </div>
      </div>
    </div>
  )
}
