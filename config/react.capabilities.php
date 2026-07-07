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
        'MelisCmsProspects_tool_prospects' => ['list', 'edit', 'delete', 'export'],
    ],
];
