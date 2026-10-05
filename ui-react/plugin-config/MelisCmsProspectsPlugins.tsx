// Full-React config for the MelisCmsProspects plugin. Source lives in melis-cms-prospects (this module),
// imported into melis-cms's SPA build and registered into the shared tab registry (PluginFormKit).
// Mirrors the plugin's legacy modal_form: Properties, a Field-list grid (fields[]/required_fields[]),
// and a Theme select.
import { registerPluginTab, type PluginTabContext, TemplateField, RemoteSelectField, FieldListField } from '../../../melis-cms/ui-react/src/PluginFormKit'
import { peLang } from '../../../melis-cms/ui-react/src/page-editor-i18n'

const L = ({
  fr: {
    tabProperties: 'Propriétés',
    tabFields: 'Champs',
    tabTheme: 'Thème',
    templateHint: 'Gabarit de rendu du formulaire.',
    site: 'Site',
    siteHint: 'Le site auquel rattacher les prospects.',
    fieldsLabel: 'Champs du formulaire',
    fieldsHint: 'Afficher, rendre obligatoire et ordonner les champs.',
    theme: 'Thème',
    themeHint: 'Le thème visuel du formulaire.',
  },
  en: {
    tabProperties: 'Properties',
    tabFields: 'Fields',
    tabTheme: 'Theme',
    templateHint: 'Render template of the form.',
    site: 'Site',
    siteHint: 'The site to attach the prospects to.',
    fieldsLabel: 'Form fields',
    fieldsHint: 'Show, make required and order the fields.',
    theme: 'Theme',
    themeHint: 'The visual theme of the form.',
  },
} as const)[peLang()]

/* ── Properties ── template + site ───────────────────────────────────────── */
function ProspectsProperties({ ctx }: { ctx: PluginTabContext }) {
  return (<div>
    <TemplateField ctx={ctx} hint={L.templateHint} />
    <RemoteSelectField ctx={ctx} name="pros_site_id" label={L.site} hint={L.siteHint} />
  </div>)
}

/* ── Field list ── show / mandatory / order of the form fields ───────────── */
function ProspectsFieldList({ ctx }: { ctx: PluginTabContext }) {
  return (<div><FieldListField ctx={ctx} label={L.fieldsLabel} hint={L.fieldsHint} /></div>)
}

/* ── Theme ── theme select ───────────────────────────────────────────────── */
function ProspectsTheme({ ctx }: { ctx: PluginTabContext }) {
  return (<div><RemoteSelectField ctx={ctx} name="theme" label={L.theme} hint={L.themeHint} /></div>)
}

/** Register the MelisCmsProspects plugin's native config tab(s). Called from melis-cms's PluginForms registry. */
export function registerMelisCmsProspectsPlugins(): void {
  registerPluginTab('MelisCmsProspectsShowFormPlugin', { id: 'properties', title: L.tabProperties, icon: 'fa fa-cog', order: 0, Component: ProspectsProperties })
  registerPluginTab('MelisCmsProspectsShowFormPlugin', { id: 'fields', title: L.tabFields, icon: 'fa fa-list-ul', order: 1, Component: ProspectsFieldList })
  registerPluginTab('MelisCmsProspectsShowFormPlugin', { id: 'theme', title: L.tabTheme, icon: 'fa fa-paint-brush', order: 2, Component: ProspectsTheme })
}
