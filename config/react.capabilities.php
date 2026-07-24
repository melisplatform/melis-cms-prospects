<?php

/**
 * Capacités d'outils (droits avancés React) déclarées par MelisCmsProspects.
 * Mergé via MelisCmsProspects\Module::getConfig() (clé `melisReactToolCapabilities`,
 * map melisKey => [caps]). Cf. MelisReactApi\Service\Capabilities.
 *
 * Pas de `create` : un prospect est créé uniquement par le plugin de contact
 * front-office (formulaire public) — l'outil BO est édition/suppression seulement,
 * comme le legacy ToolProspectsController (aucune action de création).
 */

return [
    'melisReactToolCapabilities' => [
        // Key = melisKey of the RIGHTS-BEARING menu node (rights_checkbox_disable=false), i.e.
        // `melisprospects_tool_prospects_section` (app.interface.php) — what RightsTreeView hangs
        // capabilities on, what the rights XML stores, and the react-api guard's MELIS_KEY.
        // NOT `MelisCmsProspects_tool_prospects`: that is the `conf.type` TARGET, which stays the
        // renderable ZONE key (iframe react-tool-page?key=) and is not granted on its own.
        'melisprospects_tool_prospects_section' => ['list', 'edit', 'delete', 'export'],
        // Thèmes : outil CRUD complet (création autorisée, contrairement à Prospects), donc `create`.
        // Key = rights-bearing menu node melisKey (app.interface.php), pas la zone-key
        // `MelisCmsProspects_tool_themes`. Guard : MelisReactApiProspectThemeController::MELIS_KEY.
        //
        // Forme ARBORESCENTE : le nœud `melisprospects_tool_themes_section` résout (via conf.type)
        // vers Themes + Theme Items, que MelisCoreRightsService (~L942) traite comme UN SEUL outil.
        // Les « Éléments du thème » (sous-outil ouvert par l'action « Éditer » de la liste) sont donc
        // un sous-onglet `items` de ce même outil, pas une entrée de droits distincte.
        //   - actions du haut = CRUD des thèmes (boutons React gatés par can('create'|'edit'|...)).
        //   - onglet `items`  = accès aux Éléments du thème (bouton « Éditer » gaté par can('items')) ;
        //     ses sous-actions list/create/edit/delete apparaissent dans l'onglet Droits (l'UI des
        //     items est encore l'outil legacy en iframe → gating déclaratif, prêt pour un futur React).
        'melisprospects_tool_themes_section' => [
            'actions' => ['create', 'list', 'edit', 'delete', 'export'],
            'tabs' => [
                [
                    'key'     => 'items',
                    'label'   => 'tr_melis_cms_prospects_theme_items',
                    'actions' => ['list', 'create', 'edit', 'delete'],
                ],
            ],
        ],
    ],
];
