<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

return [
    'router' => [
        'routes' => [
            'melis-backoffice' => [
                'type'    => 'Segment',
                'options' => [
                    'route'    => '/melis[/]',
                ],
                'child_routes' => [
                    'application-MelisCmsProspects' => [
                        'type'    => 'Literal',
                        'options' => [
                            'route'    => 'MelisCmsProspects',
                            'defaults' => [
                                '__NAMESPACE__' => 'MelisCmsProspects\Controller',
                                'controller'    => 'ToolProspects',
                                'action'        => 'renderProspects',
                            ],
                        ],
                        'may_terminate' => true,
                        'child_routes' => [
                            'default' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'    => '/[:controller[/:action]]',
                                    'constraints' => [
                                        'controller' => '[a-zA-Z][a-zA-Z0-9_-]*',
                                        'action'     => '[a-zA-Z][a-zA-Z0-9_-]*',
                                    ],
                                    'defaults' => [],
                                ],
                            ],
                        ],
                    ], 
                ],
            ],            
        ],
    ],
    'service_manager' => [
        'aliases' => [
            // Services
            'MelisCmsProspectsService'              => \MelisCmsProspects\Service\MelisCmsProspectsService::class,
            'MelisProspectsService'                 => \MelisCmsProspects\Service\MelisCmsProspectsService::class,
            'MelisProspectsGdprAutoDeleteService'   => \MelisCmsProspects\Service\MelisCmsProspectsGdprAutoDeleteService::class,
            // Tables
            'MelisProspects'                        => \MelisCmsProspects\Model\Tables\MelisProspectTable::class,
            'MelisCmsProspectsThemeTable'           => \MelisCmsProspects\Model\Tables\MelisCmsProspectsThemeTable::class,
            'MelisCmsProspectsThemeItemTable'       => \MelisCmsProspects\Model\Tables\MelisCmsProspectsThemeItemTable::class,
            'MelisCmsProspectsThemeItemTransTable'  => \MelisCmsProspects\Model\Tables\MelisCmsProspectsThemeItemTransTable::class,
        ],
    ],
    'controllers' => [
        'invokables' => [
            'MelisCmsProspects\Controller\ProspectThemes'       => \MelisCmsProspects\Controller\MelisCmsProspectsThemesController::class,
            'MelisCmsProspects\Controller\ProspectThemeItems'   => \MelisCmsProspects\Controller\MelisCmsProspectsThemeItemsController::class,
            'MelisCmsProspects\Controller\ToolProspects'        => \MelisCmsProspects\Controller\ToolProspectsController::class,
        ],
    ],
    'controller_plugins' => [
        'invokables' => [
            'MelisCmsProspectsShowFormPlugin'   => \MelisCmsProspects\Controller\Plugin\MelisCmsProspectsShowFormPlugin::class,
            // Dashboard plugins
            'MelisCmsProspectsStatisticsPlugin' => \MelisCmsProspects\Controller\DashboardPlugins\MelisCmsProspectsStatisticsPlugin::class
        ],
    ],
    'form_elements' => [
        'factories' => [
            'MelisCmsProspectThemeSelect'       => \MelisCmsProspects\Form\Factory\ProspectThemeSelectFactory::class,
            'MelisCmsProspectThemeItemSelect'   => \MelisCmsProspects\Form\Factory\ProspectThemeItemSelectFactory::class,
            'MelisCmsProspectName'              => \MelisCmsProspects\Form\Factory\ProspectNameSelectFactory::class,
        ],
    ],
    'view_manager' => [
        'doctype' => 'HTML5',
        'template_map' => [
            'MelisCmsProspects/prospects-form'                  => __DIR__ . '/../view/melis-cms-prospects/plugins/prospects-form.phtml',
            'MelisCmsProspects/prospects-form/melis/form_tab1'  => __DIR__ . '/../view/melis-cms-prospects/plugins/prospect-melis-modal-form-tab-1.phtml',
            'MelisCmsProspects/prospects-form/melis/form_tab2'  => __DIR__ . '/../view/melis-cms-prospects/plugins/prospect-melis-modal-form-tab-2.phtml',
            
            'melis-cmsprospects/dashboard/prospects-statistics' => __DIR__ . '/../view/melis-cms-prospects/dashboard-plugins/prospects-statistics.phtml',
        ],
        'template_path_stack' => [
            __DIR__ . '/../view',
        ],
        'strategies' => [
            'ViewJsonStrategy',
        ],
    ],
];