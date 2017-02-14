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
    'translator' => array(
    	'locale' => 'en_EN',
	),
    'service_manager' => array(
        'invokables' => array(
            'MelisCmsProspects\Service\MelisCmsProspectsServiceInterface' => 'MelisCmsProspects\Service\MelisCmsProspectsService',
        ),
        'aliases' => array(
            'translator' => 'MvcTranslator',
            'MelisProspects' => 'MelisCmsProspects\Model\Tables\MelisProspectTable',
        ),
        'factories' => array(
            'MelisProspectsService' => 'MelisCmsProspects\Service\Factory\MelisCmsProspectsServiceFactory',
            
            'MelisCmsProspects\Model\Tables\MelisProspectTable' => 'MelisCmsProspects\Model\Tables\Factory\MelisProspectsTableFactory',
        ),
    ),
    'controllers' => array(
        'invokables' => array(
            'MelisCmsProspects\Controller\ToolProspects' => 'MelisCmsProspects\Controller\ToolProspectsController',
            'MelisCmsProspects\Controller\Dashboard' => 'MelisCmsProspects\Controller\DashboardController',
        ),
    ),
    'controller_plugins' => array(
        'invokables' => array(
            'MelisCmsProspectsShowFormPlugin' => 'MelisCmsProspects\Controller\Plugin\MelisCmsProspectsShowFormPlugin'
        ),
    ),
    'view_manager' => array(
        'display_not_found_reason' => true,
        'display_exceptions'       => true,
        'doctype'                  => 'HTML5',
        'template_map' => array(
            'MelisCmsProspects/prospects-form' => __DIR__ . '/../view/melis-cms-prospects/plugins/prospects-form.phtml',
        ),
        'template_path_stack' => array(
            __DIR__ . '/../view',
        ),
        'strategies' => array(
            'ViewJsonStrategy',
        ),
    ),
    'asset_manager' => array(
        'resolver_configs' => array(
            'aliases' => array(
                'MelisCmsProspects/' => __DIR__ . '/../public/',
            ),
        ),
    ),
);