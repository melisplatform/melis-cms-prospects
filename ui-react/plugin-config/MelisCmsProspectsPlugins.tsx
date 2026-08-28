// Full-React config for the MelisCmsProspects plugin. Source lives in melis-cms-prospects (this module),
// imported into melis-cms's SPA build and registered into the shared tab registry (PluginFormKit).
// Mirrors the plugin's legacy modal_form: Properties, a Field-list grid (fields[]/required_fields[]),
// and a Theme select.
import { registerPluginTab, type PluginTabContext, TemplateField, RemoteSelectField, FieldListField } from '../../../melis-cms/ui-react/src/PluginFormKit'

/* ── Properties ── template + site ───────────────────────────────────────── */
function ProspectsProperties({ ctx }: { ctx: PluginTabContext }) {
  return (<div>
    <TemplateField ctx={ctx} hint="Gabarit de rendu du formulaire." />
    <RemoteSelectField ctx={ctx} name="pros_site_id" label="Site" hint="Le site auquel rattacher les prospects." />
  </div>)
}

/* ── Field list ── show / mandatory / order of the form fields ───────────── */
function ProspectsFieldList({ ctx }: { ctx: PluginTabContext }) {
  return (<div><FieldListField ctx={ctx} label="Champs du formulaire" hint="Afficher, rendre obligatoire et ordonner les champs." /></div>)
}

/* ── Theme ── theme select ───────────────────────────────────────────────── */
function ProspectsTheme({ ctx }: { ctx: PluginTabContext }) {
  return (<div><RemoteSelectField ctx={ctx} name="theme" label="Thème" hint="Le thème visuel du formulaire." /></div>)
}

/** Register the MelisCmsProspects plugin's native config tab(s). Called from melis-cms's PluginForms registry. */
export function registerMelisCmsProspectsPlugins(): void {
  registerPluginTab('MelisCmsProspectsShowFormPlugin', { id: 'properties', title: 'Propriétés', icon: 'fa fa-cog', order: 0, Component: ProspectsProperties })
  registerPluginTab('MelisCmsProspectsShowFormPlugin', { id: 'fields', title: 'Champs', icon: 'fa fa-list-ul', order: 1, Component: ProspectsFieldList })
  registerPluginTab('MelisCmsProspectsShowFormPlugin', { id: 'theme', title: 'Thème', icon: 'fa fa-paint-brush', order: 2, Component: ProspectsTheme })
}
