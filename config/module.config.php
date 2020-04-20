<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

return array(
    'router' => array(
        'routes' => array(
        	'melis-backoffice' => array(
        		'type'    => 'Segment',
        		'options' => array(
        			'route'    => '/melis[/]',
        		),
                'child_routes' => array(
                    'application-MelisCmsProspects' => array(
                        'type'    => 'Literal',
                        'options' => array(
                            'route'    => 'MelisCmsProspects',
                            'defaults' => array(
                                '__NAMESPACE__' => 'MelisCmsProspects\Controller',
                                'controller'    => 'ToolProspects',
                                'action'        => 'renderProspects',
                            ),
                        ),
                        'may_terminate' => true,
                        'child_routes' => array(
                            'default' => array(
                                'type'    => 'Segment',
                                'options' => array(
                                    'route'    => '/[:controller[/:action]]',
                                    'constraints' => array(
                                        'controller' => '[a-zA-Z][a-zA-Z0-9_-]*',
                                        'action'     => '[a-zA-Z][a-zA-Z0-9_-]*',
                                    ),
                                    'defaults' => array(
                                    ),
                                ),
                            ),
                        ),
                    ), 
                ),
            ),            
        ),
    ),
    'service_manager' => array(
        'aliases' => array(
            'MelisCmsProspectsService' => \MelisCmsProspects\Service\MelisCmsProspectsService::class,
            'MelisProspectsService' => \MelisCmsProspects\Service\MelisCmsProspectsService::class,

            'MelisProspects' => \MelisCmsProspects\Model\Tables\MelisProspectTable::class,
            'MelisCmsProspectsThemeTable'     => \MelisCmsProspects\Model\Tables\MelisCmsProspectsThemeTable::class,
            'MelisCmsProspectsThemeItemTable' => \MelisCmsProspects\Model\Tables\MelisCmsProspectsThemeItemTable::class,
            'MelisCmsProspectsThemeItemTransTable' => \MelisCmsProspects\Model\Tables\MelisCmsProspectsThemeItemTransTable::class,
        ),
    ),
    'controllers' => array(
        'invokables' => array(
            'MelisCmsProspects\Controller\ProspectThemes' => \MelisCmsProspects\Controller\MelisCmsProspectsThemesController::class,
            'MelisCmsProspects\Controller\ProspectThemeItems' => \MelisCmsProspects\Controller\MelisCmsProspectsThemeItemsController::class,
            'MelisCmsProspects\Controller\ToolProspects'    => \MelisCmsProspects\Controller\ToolProspectsController::class,
        ),
    ),
    'controller_plugins' => array(
        'invokables' => array(
            'MelisCmsProspectsShowFormPlugin' => \MelisCmsProspects\Controller\Plugin\MelisCmsProspectsShowFormPlugin::class,
            // Dashboard plugins
            'MelisCmsProspectsStatisticsPlugin' => \MelisCmsProspects\Controller\DashboardPlugins\MelisCmsProspectsStatisticsPlugin::class
        ),
    ),
    'form_elements' => array(
        'factories' => array(
            'MelisCmsProspectThemeSelect' => 'MelisCmsProspects\Form\Factory\ProspectThemeSelectFactory',
            'MelisCmsProspectThemeItemSelect' => 'MelisCmsProspects\Form\Factory\ProspectThemeItemSelectFactory',
            'MelisCmsProspectName' => 'MelisCmsProspects\Form\Factory\ProspectNameSelectFactory',
        ),
    ),
    'view_manager' => array(
        'display_not_found_reason' => true,
        'display_exceptions'       => true,
        'doctype'                  => 'HTML5',
        'template_map' => array(
            'MelisCmsProspects/prospects-form' => __DIR__ . '/../view/melis-cms-prospects/plugins/prospects-form.phtml',
            'MelisCmsProspects/prospects-form/melis/form_tab1' => __DIR__ . '/../view/melis-cms-prospects/plugins/prospect-melis-modal-form-tab-1.phtml',
            'MelisCmsProspects/prospects-form/melis/form_tab2' => __DIR__ . '/../view/melis-cms-prospects/plugins/prospect-melis-modal-form-tab-2.phtml',
            
            'melis-cmsprospects/dashboard/prospects-statistics' => __DIR__ . '/../view/melis-cms-prospects/dashboard-plugins/prospects-statistics.phtml',
        ),
        'template_path_stack' => array(
            __DIR__ . '/../view',
        ),
        'strategies' => array(
            'ViewJsonStrategy',
        ),
    ),
);