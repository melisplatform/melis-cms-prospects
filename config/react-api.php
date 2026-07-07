<?php

/**
 * Routes + contrôleurs React API fournis par MelisCmsProspects.
 *
 * Ces routes s'ajoutent aux child_routes de `melis-react-api` (défini dans MelisReactApi,
 * le bridge GÉNÉRIQUE). Modularité : les contrôleurs/routes/invokables d'un outil vivent
 * dans SON module, pas dans MelisReactApi. Laminas\Stdlib\ArrayUtils::merge() fusionne.
 * Les URLs ne changent pas. Capacités : cf. config/react.capabilities.php.
 * Mergé via MelisCmsProspects\Module::getConfig().
 */

return [
    'router' => [
        'routes' => [
            'melis-backoffice' => [
                'child_routes' => [
                    'melis-react-api' => [
                        'child_routes' => [
                            // ── Prospects (MelisCmsProspects tool, UI via brick) ──
                            'prospects-list' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'    => '/prospects[/]',
                                    'defaults' => [
                                        '__NAMESPACE__' => 'MelisCmsProspects\Controller',
                                        'controller'    => 'MelisReactApiProspect',
                                        'action'        => 'list',
                                    ],
                                ],
                            ],
                            'prospects-stats' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'    => '/prospects/stats[/]',
                                    'defaults' => [
                                        '__NAMESPACE__' => 'MelisCmsProspects\Controller',
                                        'controller'    => 'MelisReactApiProspect',
                                        'action'        => 'stats',
                                    ],
                                ],
                            ],
                            'prospects-sites' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'    => '/prospects/sites[/]',
                                    'defaults' => [
                                        '__NAMESPACE__' => 'MelisCmsProspects\Controller',
                                        'controller'    => 'MelisReactApiProspect',
                                        'action'        => 'sites',
                                    ],
                                ],
                            ],
                            'prospects-themes' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'    => '/prospects/themes[/]',
                                    'defaults' => [
                                        '__NAMESPACE__' => 'MelisCmsProspects\Controller',
                                        'controller'    => 'MelisReactApiProspect',
                                        'action'        => 'themes',
                                    ],
                                ],
                            ],
                            'prospects-types' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'    => '/prospects/types[/]',
                                    'defaults' => [
                                        '__NAMESPACE__' => 'MelisCmsProspects\Controller',
                                        'controller'    => 'MelisReactApiProspect',
                                        'action'        => 'types',
                                    ],
                                ],
                            ],
                            'prospects-save' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'    => '/prospects/save[/]',
                                    'defaults' => [
                                        '__NAMESPACE__' => 'MelisCmsProspects\Controller',
                                        'controller'    => 'MelisReactApiProspect',
                                        'action'        => 'save',
                                    ],
                                ],
                            ],
                            'prospects-delete' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'       => '/prospects/delete/:id',
                                    'constraints' => ['id' => '[0-9]+'],
                                    'defaults'    => [
                                        '__NAMESPACE__' => 'MelisCmsProspects\Controller',
                                        'controller'    => 'MelisReactApiProspect',
                                        'action'        => 'delete',
                                    ],
                                ],
                            ],
                            'prospects-item' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'       => '/prospects/:id',
                                    'constraints' => ['id' => '[0-9]+'],
                                    'defaults'    => [
                                        '__NAMESPACE__' => 'MelisCmsProspects\Controller',
                                        'controller'    => 'MelisReactApiProspect',
                                        'action'        => 'get',
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ],

    'controllers' => [
        'invokables' => [
            'MelisCmsProspects\Controller\MelisReactApiProspect' => \MelisCmsProspects\Controller\MelisReactApiProspectController::class,
        ],
    ],
];
