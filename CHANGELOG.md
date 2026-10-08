# Changelog

## v6.0.6 - 2026-10-05
### Security
* Page-editor: internationalize the React UI (was hardcoded French)
### Added
* **plugin-config:** full-React config tabs for melis-cms-prospects plugin
### Changed
* I18n: fix wrong-language values and mismatched keys in interface translations

## v6.0.5 - 2026-09-25
### Security
* **security:** declare a grantable tool key on the legacy controller (audit item 7.0)

## v6.0.4 - 2026-09-23
### Security
* **security:** parameterised SQL for date filters, ORDER BY and hand-quoted values (audit item 11.0)

## v6.0.3 - 2026-08-20
### Security
* Gate mutating/data actions in legacy tool controllers (CWE-862)
### Fixed
* **prospects-react:** use the code-xml </> icon for the "New" toggle
### Docs
* **melisai:** React back-office AI documentation for MelisCmsProspects

## v6.0.1 - 2026-08-10
### Changed
* Bump postcss from 8.5.15 to 8.5.26 in /ui-react
### Dependencies & build
* **composer:** update docs/homepage links, swap zf2 keyword for laminas, bump php constraint to ^8.3|^8.5

## v6.0.0 - 2026-08-10
### Security
* **security:** add SECURITY.md (private vulnerability reporting policy)
* Fix audit findings
* **rights:** put the Prospects rights keys back on the left-menu path
### Added
* **react:** Prospect Themes tool (backend controller/tables + React page); fix(mobile): touch-compatible column drag-and-drop, KPI icons, translate New/Old toggle
* **cms-prospects:** React prospects tool updates + rebuild brick
* **marketplace:** add React back-office screenshots (etc/MarketPlace/images/react)
* **webservices:** translatable service description for the token WS listing
* **cms-react:** sync mobile-responsive Prospects tool (list+themes+export) into subgit
* **cms-react:** listes infinies keyset + tri server-side + icones de tri unifiees
* **themes:** full-React Themes tool + native Theme Items sub-tool
* **react:** brique React melis-cms-prospects (ui-react source + build)
* Add MelisAI module documentation for AI consumption
### Fixed
* **dashboard-plugins:** silence AJAX failures (no alert/console) + prospects stats perf (0010871)
* **security:** harden legacy file/dir creation & output escaping
* Fix notifications and logging
* **prospects-react:** la vue « Old » ne coupe plus le contenu de l'iframe
* **react:** éviter que les popovers Colonnes/Export soient rognés en bas de viewport
### Changed
* I18n(prospects): renomme la section Prospect en Prospects (FR + EN)
* Export button and saved message updates
* Migrate to react
* Strip tags on null update
### Dependencies & build
* **composer:** bump melis-core/melis-engine/melis-front/melis-cms constraint to ^6.0
* Local WIP snapshot before reconcile (20260806-114605)
* **brick:** rebuild brick ui-react + sync vite/package-lock
### Docs
* **meliscmsprospects:** rewrite as two-part doc (functional guide + technical reference with examples)
* Rename prospects screenshots to convention, add Themes/Items captures

## v5.3.1 - 2024-09-26
### Fixed
* Fix release issue 7115

## v5.3.0 - 2024-09-25
### Fixed
* Fix issue 6604
* Fix issue 6362
### Changed
* Related to jquery migration
* Jquery migration related
* Notice and fixed an issue while also fixing 6383
* Check on dev3 issue
* Bs5 tab
* Update jQuery 3.7.1 migration
* JQuery 3.7.1 migration
* Update on jQuery migration
### Dependencies & build
* Rebuilt the asset bundle

## v5.2.0 - 2024-06-06
* Maintenance release.

## v5.1.0 - 2024-02-13
### Fixed
* Fixed problem passing null on strtoupper
* Fixed strftime deprecated
* Fixed problem on missing field
### Changed
* Us psr container

## v5.0.1 - 2023-05-24
### Added
* Added/updated scripts to update tables to utf8mb4
### Changed
* Renamed sql file
* Updated structure

## v5.0.0 - 2022-06-22
### Fixed
* Fixed object vars problem on php 7
### Changed
* Removed default value of type param
* Removed get_object_vars in getting the post data
* Changed deprecated Laminas\\Hydrator\\ArraySerializable to Laminas\\Hydrator\\ArraySerializableHydrator
