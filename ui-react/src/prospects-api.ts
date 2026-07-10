/**
 * Client de l'API Prospects pour la brique MelisCmsProspects.
 *
 * Appelle la couche REST partagée (module MelisReactApi, routes déclarées par ce module) :
 *   /melis/react-api/prospects[/...]
 * Contrat `{ success, data, error }` (comme les outils natifs). La brique ne peut pas
 * importer les modules de l'hôte (`@/lib/...`) — ce client est donc autonome.
 */

const XHR_HEADER = { 'X-Requested-With': 'XMLHttpRequest' } as const

// La liste est montée en permanence (Shell, brique `persistent`) → elle ne se re-monte pas au
// retour du formulaire. Le formulaire pose ce flag au save ; la liste le consomme au retour.
let _prospectsListStale = false
export function markProspectsListStale(): void { _prospectsListStale = true }
export function consumeProspectsListStale(): boolean {
  const stale = _prospectsListStale
  _prospectsListStale = false
  return stale
}

export interface ProspectItem {
  id: number
  siteId: number | null
  siteName: string | null
  type: string | null
  theme: number | null
  themeName: string | null
  name: string
  email: string
  telephone: string
  message: string
  company: string | null
  country: string | null
  contactDate: string
  anonymized: boolean
}
export interface ProspectStats { total: number; thisMonth: number; avgPerMonth: number; anonymized: number }
export interface SiteOption { id: number; name: string }
export interface ThemeOption { id: number; name: string; themeName: string }
export interface ProspectListResult { items: ProspectItem[]; total: number; page: number; limit: number }
export interface ProspectSavePayload {
  id: number
  siteId: number | null
  name: string
  email: string
  telephone: string
  message: string
  company: string
  country: string
  theme: number | null
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

export async function fetchProspects(params: { search?: string; site?: number | null; type?: string; dateFrom?: string; dateTo?: string } = {}): Promise<ProspectListResult> {
  const qs = new URLSearchParams()
  qs.set('limit', '9999')
  if (params.search) qs.set('search', params.search)
  if (params.site) qs.set('site', String(params.site))
  if (params.type) qs.set('type', params.type)
  if (params.dateFrom) qs.set('dateFrom', params.dateFrom)
  if (params.dateTo) qs.set('dateTo', params.dateTo)
  return apiFetch<ProspectListResult>(`/melis/react-api/prospects?${qs}`)
}

export async function fetchProspectById(id: number): Promise<ProspectItem> {
  return apiFetch<ProspectItem>(`/melis/react-api/prospects/${id}`)
}

export async function fetchProspectStats(): Promise<ProspectStats> {
  return apiFetch<ProspectStats>('/melis/react-api/prospects/stats')
}

export async function fetchSites(): Promise<SiteOption[]> {
  const d = await apiFetch<{ sites: SiteOption[] }>('/melis/react-api/prospects/sites')
  return d.sites
}

export async function fetchTypes(): Promise<string[]> {
  const d = await apiFetch<{ types: string[] }>('/melis/react-api/prospects/types')
  return d.types
}

export async function fetchThemes(): Promise<ThemeOption[]> {
  const d = await apiFetch<{ themes: ThemeOption[] }>('/melis/react-api/prospects/themes')
  return d.themes
}

export async function saveProspect(payload: ProspectSavePayload): Promise<{ id: number }> {
  return apiFetch<{ id: number }>('/melis/react-api/prospects/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function deleteProspect(id: number): Promise<void> {
  await apiFetch<null>(`/melis/react-api/prospects/delete/${id}`, { method: 'DELETE' })
}
