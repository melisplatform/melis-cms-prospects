/**
 * Client de l'API Thèmes pour la brique MelisCmsProspects.
 *
 * Appelle la couche REST partagée (module MelisReactApi, routes déclarées par ce module) :
 *   /melis/react-api/prospect-themes[/...]
 * Contrat `{ success, data, error }` (comme les outils natifs). La brique ne peut pas
 * importer les modules de l'hôte (`@/lib/...`) — ce client est donc autonome.
 */

const XHR_HEADER = { 'X-Requested-With': 'XMLHttpRequest' } as const

// La liste est montée en permanence (Shell, brique `persistent`) → elle ne se re-monte pas au
// retour du formulaire. Le formulaire pose ce flag au save ; la liste le consomme au retour.
let _themesListStale = false
export function markThemesListStale(): void { _themesListStale = true }
export function consumeThemesListStale(): boolean {
  const stale = _themesListStale
  _themesListStale = false
  return stale
}

export interface ThemeItem {
  id: number
  name: string
  code: string | null
  itemCount: number
}
export interface ThemeStats { total: number; withCode: number; items: number }
export interface ThemeListResult { items: ThemeItem[]; total: number; page: number; limit: number }
export interface ThemeSavePayload {
  id: number
  name: string
  // Facultatif : le formulaire (parité legacy `prospects_theme_form`) ne saisit pas le code.
  // Quand absent, le back préserve `pros_theme_code` en édition (NULL en création).
  code?: string
}

async function apiFetch<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...opts,
    headers: { ...XHR_HEADER, ...(opts?.headers ?? {}) },
    credentials: 'include',
  })
  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try {
      const d = (await res.json()) as { error?: string }
      if (d.error) msg = d.error
    } catch { /* ignore */ }
    throw new Error(msg)
  }
  const data = (await res.json()) as { success: boolean; data?: T; error?: string }
  if (!data.success) throw new Error(data.error ?? 'API error')
  return data.data as T
}

export async function fetchThemes(params: { search?: string } = {}): Promise<ThemeListResult> {
  const qs = new URLSearchParams()
  qs.set('limit', '9999')
  if (params.search) qs.set('search', params.search)
  return apiFetch<ThemeListResult>(`/melis/react-api/prospect-themes?${qs}`)
}

export async function fetchThemeById(id: number): Promise<ThemeItem> {
  return apiFetch<ThemeItem>(`/melis/react-api/prospect-themes/${id}`)
}

export async function fetchThemeStats(): Promise<ThemeStats> {
  return apiFetch<ThemeStats>('/melis/react-api/prospect-themes/stats')
}

export async function saveTheme(payload: ThemeSavePayload): Promise<{ id: number }> {
  return apiFetch<{ id: number }>('/melis/react-api/prospect-themes/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function deleteTheme(id: number): Promise<void> {
  await apiFetch<null>(`/melis/react-api/prospect-themes/delete/${id}`, { method: 'DELETE' })
}

// ── Éléments du thème (theme items) — sous-outil natif React ──────────────────
// Un élément a un nom PAR LANGUE (translations : { langId: texte }).

export interface CmsLang { id: number; name: string; locale: string }
export interface ThemeItemRow { id: number; name: string }
export interface ThemeItemDetail { id: number; themeId: number; translations: Record<string, string> }
export interface ThemeItemSavePayload { id: number; themeId: number; translations: Record<string, string> }

export async function fetchThemeItems(themeId: number, params: { search?: string } = {}): Promise<ThemeItemRow[]> {
  const qs = new URLSearchParams()
  qs.set('themeId', String(themeId))
  if (params.search) qs.set('search', params.search)
  const d = await apiFetch<{ items: ThemeItemRow[]; total: number }>(`/melis/react-api/prospect-themes/items?${qs}`)
  return d.items
}

export async function fetchThemeItemById(id: number): Promise<ThemeItemDetail> {
  return apiFetch<ThemeItemDetail>(`/melis/react-api/prospect-themes/items/${id}`)
}

export async function fetchCmsLanguages(): Promise<CmsLang[]> {
  const d = await apiFetch<{ languages: CmsLang[] }>('/melis/react-api/prospect-themes/languages')
  return d.languages
}

export async function saveThemeItem(payload: ThemeItemSavePayload): Promise<{ id: number }> {
  return apiFetch<{ id: number }>('/melis/react-api/prospect-themes/items/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function deleteThemeItem(id: number): Promise<void> {
  await apiFetch<null>(`/melis/react-api/prospect-themes/items/delete/${id}`, { method: 'DELETE' })
}
