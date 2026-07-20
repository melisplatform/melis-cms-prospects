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
    ],
];
