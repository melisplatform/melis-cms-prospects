---
title: MelisCmsProspects module
package: melisplatform/melis-cms-prospects
doc_type: module-documentation
audience: [users, developers, ai]
language: en
module_version: unversioned
last_reviewed: 2026-06-08
maintainer: Melis Technology
keywords: [prospects, leads, contact-form, contact-us, cms, melis, back-office, plugin, gdpr, dashboard, themes, csv-export]
screenshots_dir: ./images
---

# MelisCmsProspects — Functional & Technical Documentation (for AI)

> **What this is.** MelisCmsProspects is the **leads / contact management** system: a front
> **contact form** block that captures visitors' messages, a back-office tool to browse, filter,
> edit, export (CSV) and delete those leads, classify them by **themes**, and a **dashboard
> chart** of registrations. It plugs into the platform's **GDPR** tooling.
>
> **Two parts:** **[Part A — Functional Guide](#part-a--functional-guide)** (users) ·
> **[Part B — Technical Reference](#part-b--technical-reference)** (developers/AI, with examples).
> Consumed by the **MelisAI** MCP; the **[Screenshot index](#screenshot-index)** maps filenames.
> Reviewed 2026-06-08.

---
---

# PART A — Functional Guide

## A1. What MelisCmsProspects lets you do

- **Collect leads** from your website with a configurable **contact form**.
- **Manage the leads** in the back-office: search, filter, edit, **export to CSV**, delete.
- **See trends** — stat widgets (total, this month, monthly average) and a dashboard chart.
- **Classify** contact requests by **themes** (the subject categories of the form).

## A2. The contact form on your site — the Show Form block

From the **page editor** (MelisCms → Edition tab → plugins menu), drop the **Show Form** block
onto a page. This is your **contact form**.

![Show Form in the plugin selector](./images/meliscmsprospects-page-menu-plugins-selector.png)

Its settings modal has three tabs:

- **Properties** — the rendering template and the source **site**.

  ![Show Form — Properties](./images/meliscmsprospects-page-plugin-showform-config-tab-properties.png)

- **Fields** — **the key tab.** It's a **field-builder table** that lets you compose the form with
  no code. Each row is one possible field (Name, Company, Country, Email, Telephone, Message…)
  with: a **Show/Hide switch** (does it appear?), a **Mandatory** checkbox (is it required? —
  only enabled when the field is shown), and the rows are **drag-sortable** so their order is the
  order on the form. In short, from this one tab you decide **which fields show, which are
  required, and in what order.**

  ![Show Form — Fields field-builder](./images/meliscmsprospects-page-plugins-showform-config-tab-fieldlist.png)

- **Theme** — the **theme** that drives the form's subject dropdown.

  ![Show Form — Theme](./images/meliscmsprospects-page-plugin-showform-config-tab-themes.png)

When a visitor submits the form, a **prospect** (lead) is created and shows up in the Prospects
tool.

## A3. The Prospects tool (back-office) — managing leads

**Where:** back-office left menu → **Prospects** tool.

At the top are three **stat widgets** (total prospects, this month, monthly average). Below is
the list of leads (id, site, name, email, type, telephone, contact date, theme, message). Filter
by **limit, date range, site, type**, **search**, **export to CSV**, or **refresh**.

![Prospects tool — list, widgets, filters](./images/meliscmsprospects-tool-prospects-list.png)
*The Prospects tool — widgets, filters and the leads table.*

Each row can be **edited** (a modal with the lead's fields) or **deleted**.

![Edit a prospect](./images/meliscmsprospects-tool-prospects-edit-modal.png)
*The edit-prospect modal.*

## A4. Themes — classify your contact requests

**Where:** the **Themes** tool.

A **theme** is a subject/category of contact request (and it feeds the contact form's subject
dropdown). The Themes tool lists your themes; **Add** creates one (name + code).

![Themes list](./images/meliscmsprospects-tool-themes-list.png)
![New theme](./images/meliscmsprospects-tool-themes-new-modal.png)
*The Themes list and the new-theme modal.*

**Editing a theme opens its list of items** (its "categories") — translatable entries under the
theme. Add/edit items via modals.

![Theme item list](./images/meliscmsprospects-tool-themes-edit-themecategorylist.png)
![New theme item](./images/meliscmsprospects-tool-themes-edit-themecategorylist-new-modal.png)
![Edit theme item](./images/meliscmsprospects-tool-themes-edit-themecategorylist-edit-modal.png)
*Editing a theme reveals its item list, with add/edit modals.*

## A5. Dashboard chart & GDPR

- On the back-office **Dashboard**, the **Prospects Statistics** widget charts registrations over time.

  ![Prospects Statistics dashboard widget](./images/meliscmsprospects-dashboard-plugin-prospectsstatistics.png)

- Prospect data is exposed to the platform's **GDPR** screens (user info / data extract / delete)
  and to the **auto-delete** (warning → deletion) cycle, so leads are handled compliantly.

## A6. Common tasks — "How do I…?"

- **Add a contact form to a page** → page editor → drop **Show Form** → on the **Fields** tab,
  toggle the fields you want and mark the required ones.
- **Make a field required** → Show Form → Fields tab → turn the field's *Show* on, then tick *Mandatory*.
- **See and export my leads** → Prospects tool → filter as needed → **Export** (CSV).
- **Organise contact subjects** → Themes tool → add a theme → edit it to add items.

---
---

# PART B — Technical Reference

## B1. Metadata & dependencies

| Item | Value |
|---|---|
| Package | `melisplatform/melis-cms-prospects` · category `cms` · namespace `MelisCmsProspects\` · dbdeploy |
| Requires | `melis-core`, `melis-engine`, `melis-front`, `melis-cms` (`^5.2`), `laminas/laminas-mvc-plugin-flashmessenger` |

## B2. Data model

| Table | Role | PK |
|---|---|---|
| `melis_cms_prospects` | A lead (site, type, theme, name, email, telephone, message, company, country, contact date, gdpr last date) | `pros_id` |
| `melis_cms_prospects_themes` | Theme (`pros_theme_name`, `pros_theme_code`) | `pros_theme_id` |
| `melis_cms_prospects_theme_items` | Items belonging to a theme | `pros_theme_item_id` |
| `melis_cms_prospects_theme_items_trans` | Per-language item text | `item_trans_id` |

Gateways: `MelisProspects`, `MelisCmsProspectsThemeTable`, `MelisCmsProspectsThemeItemTable`,
`MelisCmsProspectsThemeItemTransTable`.

## B3. Service `MelisCmsProspectsService` (with examples)

Aliases `MelisCmsProspectsService` / `MelisProspectsService` (implements
`MelisCmsProspectsServiceInterface`).

```php
$prospects = $this->getServiceManager()->get('MelisProspectsService');

$id = $prospects->saveProspectsDatas($datas, $prosId);          // create/update a lead
$nb = $prospects->getProspectsDataByDate('monthly', '2017-10-04 12:00:00'); // counts by date
$w  = $prospects->getProspectsDataForWidgets();                 // total / month / average
```

Methods: `saveProspectsDatas($datas, $prosId=null)`, `getProspectsDataForWidgets($widgetId='')`,
`getProspectsDataByDate($type, $date)`, `getWidgetProspects($identifier)`. A GDPR auto-delete
service: `MelisProspectsGdprAutoDeleteService`.

> This service does **not** emit per-method events; the observable events are fired at the
> **controller** level. Hook them like:

```php
$sharedEvents->attach('MelisCmsProspects', 'meliscmsprospects_toolprospects_save_end', $fn, 50);
```

Controller events: `meliscmsprospects_toolprospects_save_start`/`_end` &
`…_delete_start`/`_end` (`ToolProspectsController`), `meliscmsprospects_theme_save_end` /
`…theme_delete_end` (`ProspectThemesController`), `meliscmsprospects_theme_item_save_end`
(`ProspectThemeItemsController`).

## B4. The Show Form plugin & the field-builder

`MelisCmsProspectsShowFormPlugin` (controller plugin, `front()`/`createOptionsForms()`/…),
config `config/plugins/MelisCmsProspectsShowFormPlugin.config.php`, three modal tabs:
**Properties** (`template_path`, `pros_site_id`), **Fields**
(`prospect-melis-modal-form-tab-2.phtml` — the field-builder; produces the `fields` and
`required_fields` config arrays; rows are jQuery-sortable so order is meaningful; the Mandatory
checkbox is disabled unless the field's Show switch is on), **Theme** (`theme`). Available form
fields: `pros_name`, `pros_company`, `pros_country`, `pros_email`, `pros_telephone`,
`pros_message`. Template `view/.../plugins/prospects-form.phtml`.

## B5. Tools, controllers, listeners

- `ToolProspectsController` — the Prospects tool: list (`getToolProspectDataAction`), stat
  widgets, filters (date/site/type/search), edit modal (`renderToolProspectUpdateFormAction` /
  `updateProspectDataAction`), delete (`removeProspectDataAction`, `removeAllProspectDataAction`),
  **CSV export** (`exportToCsvAction`). DataTable config in `config/app.tools.php`.
- `MelisCmsProspectsThemesController` / `…ThemeItemsController` — themes & their (translatable) items.
- `DashboardPlugins/MelisCmsProspectsStatisticsPlugin` (`prospectsStatistics`) — the dashboard
  chart (Flot), section *MelisMarketing*.
- **GDPR listeners** (`src/Listener`): user info/extract/delete + auto-delete cycle (module list,
  tags list, first/second warning lists, account deletion) — wired in `src/Module.php`; columns
  exposed in `config/app.gdpr.php`. Form elements: `MelisCmsProspectThemeSelect`,
  `MelisCmsProspectThemeItemSelect`, `MelisCmsProspectName`.

## B6. Quick code map

```
melis-cms-prospects/
├── config/   module.config.php · app.interface.php · app.tools.php · app.microservice.php
│            · app.gdpr.php · plugins/ (Show Form) · dashboard-plugins/ (Statistics)
├── src/   Controller/ (ToolProspects, ProspectThemes, ProspectThemeItems, Plugin/, DashboardPlugins/)
│        · Service/ (Prospects, GdprAutoDelete, Interface) · Model/ + Model/Tables/
│        · Listener/ (flash, table-column, tool-creator, GDPR…) · Form/Factory/
├── view/ · public/ (flot charts, JS/CSS) · language/ · install/
└── etc/   MarketPlace + MelisAI/doc (this doc)
```

---

## Screenshot index

| Image file | Content |
|---|---|
| `meliscmsprospects-tool-prospects-list.png` | Prospects tool — widgets, filters, leads table |
| `meliscmsprospects-tool-prospects-edit-modal.png` | Edit-prospect modal |
| `meliscmsprospects-tool-themes-list.png` | Themes tool — list of themes |
| `meliscmsprospects-tool-themes-new-modal.png` | New-theme modal |
| `meliscmsprospects-tool-themes-edit-themecategorylist.png` | Theme item list (editing a theme) |
| `meliscmsprospects-tool-themes-edit-themecategorylist-new-modal.png` | New theme-item modal |
| `meliscmsprospects-tool-themes-edit-themecategorylist-edit-modal.png` | Edit theme-item modal |
| `meliscmsprospects-page-menu-plugins-selector.png` | Show Form in the page editor's selector |
| `meliscmsprospects-page-plugin-showform-config-tab-properties.png` | Show Form — Properties tab |
| `meliscmsprospects-page-plugins-showform-config-tab-fieldlist.png` | Show Form — Fields field-builder |
| `meliscmsprospects-page-plugin-showform-config-tab-themes.png` | Show Form — Theme tab |
| `meliscmsprospects-dashboard-plugin-prospectsstatistics.png` | Prospects Statistics dashboard widget |

---

*Document for AI consumption (MelisAI MCP) — `melisplatform/melis-cms-prospects`. Part A =
functional; Part B = technical with examples. Last reviewed 2026-06-08.*
