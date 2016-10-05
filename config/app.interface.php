<?php 

return array(
    'plugins' => array(
        'meliscore' => array(
            'datas' => array(),
            'interface' => array(
                'meliscore_leftmenu' => array(
                    'interface' => array(
        			    'meliscore_toolstree' =>  array(
        			    	'interface' => array(
								'melisprospects_tools_section' => array(
									'conf' => array(
											'id' => 'id_melisprospects_tools_section',
											'name' => 'tr_melistoolprospects_tool_prospects',
											'icon' => 'fa-user-plus',
											'rights_checkbox_disable' => true,
									),
        			    			'interface' => array( 
		        			    		'MelisCmsProspects_tool_prospects' => array(
		        			    			'conf' => array(
		        			    				'type' => '/MelisCmsProspects/interface/MelisCmsProspects_toolstree/interface/MelisCmsProspects_tool_conf',
		        			    			),
		        			    		),
        			    			),
								),
        			    	),
        			    ),
                    ),
                ),
            ),
        ),
		'meliscore_dashboard' => array(
			'interface' => array(
				'MelisCmsProspects_dashboard_statistics' => array(
                	'conf' => array(
                    	'id' => 'id_MelisCmsProspects_dashboard_statistics',
                    	'name' => 'tr_melistoolprospects_dashboard_Statistics',
                    	'melisKey' => 'MelisCmsProspects_dashboard_statistics',
                     	'width' => 6,
                    	'height' => 'dashboard-large',
                	),
                    'forward' => array(
                        'module' => 'MelisCmsProspects',
                        'controller' => 'Dashboard',
                        'action' => 'dashboardStatistics',
                        'jscallback' => 'simpleChartInit();',
                        'jsdatas' => array()
                     ),
                ),
			),
		),
        'MelisCmsProspects' => array(
            'conf' => array(
                'id' => '',
                'name' => 'tr_melistoolprospects_tool_prospects',
                'rightsDisplay' => 'none',
            ),
            'ressources' => array(
                'js' => array(
                    '/MelisCmsProspects/js/tools/prospects.tool.js',
                    // flot charts
                    '/MelisCore/assets/components/modules/admin/charts/flot/assets/lib/excanvas.js?v=v1.2.3',
                    '/MelisCore/assets/components/modules/admin/charts/flot/assets/lib/jquery.flot.js?v=v1.2.3',
                    '/MelisCore/assets/components/modules/admin/charts/flot/assets/lib/jquery.flot.resize.js?v=v1.2.3',
                    '/MelisCore/assets/components/modules/admin/charts/flot/assets/lib/jquery.flot.time.js?v=v1.2.3',
				    '/MelisCore/assets/components/modules/admin/charts/flot/assets/lib/plugins/jquery.flot.tooltip.min.js?v=v1.2.3',
				    '/MelisCore/assets/components/modules/admin/charts/flot/assets/custom/js/flotcharts.common.js?v=v1.2.3',
				    '/MelisCore/assets/components/modules/admin/charts/flot/assets/custom/js/flotchart-simple.init.js?v=v1.2.3',
				    '/MelisCore/assets/components/modules/admin/charts/flot/assets/custom/js/flotchart-simple-bars.init.js?v=v1.2.3',
                ),
                
                'css' => array(
                    '/MelisCmsProspects/css/style.css',
                ),
            ),
            'datas' => array(
                
            ),
            'interface' => array(
                'MelisCmsProspects_toolstree' => array(
                    'conf' => array(
                        'name' => 'tr_melistoolprospects_tool_prospects',
                        'rightsDisplay' => 'referencesonly',
                    ),
                    'interface' => array(
                        'MelisCmsProspects_tool_conf' => array(
                            'conf' => array(
                                'id' => 'id_MelisCmsProspects_tool_prospects',
                                'name' => 'tr_melistoolprospects_tool_prospects',
                                'melisKey' => 'MelisCmsProspects_tool_prospects',
                            	'icon' => 'fa-list-ol',
								'rights_checkbox_disable' => true,
                            ),
                            'forward' => array(
                                'module' => 'MelisCmsProspects',
                                'controller' => 'ToolProspects',
                                'action' => 'render-prospects',
                                'jscallback' => 'initProspectEditor();',
                                'jsdatas' => array()
                            ),
                            'interface' => array(
                                'MelisCmsProspects_tool_prospects_header' => array( // tool header | usually buttons
                                    'conf' => array(
                                        'id' => 'id_MelisCmsProspects_tool_prospects_header',
                                        'name' => 'tr_meliscore_tool_gen_header',
                                        'melisKey' => 'MelisCmsProspects_tool_prospects_header',
                                    ),
                                    'forward' => array(
                                        'module' => 'MelisCmsProspects',
                                        'controller' => 'ToolProspects',
                                        'action' => 'render-tool-prospects-header',
                                        'jscallback' => '',
                                        'jsdatas' => array()
                                    ),
                                    'interface' => array(

//                                         'MelisCmsProspects_tool_prospects_header_indicators' => array( // tool header | usually buttons
//                                             'conf' => array(
//                                                 'id' => 'id_MelisCmsProspects_tool_prospects_header_indicators',
//                                                 'name' => 'tr_MelisCmsProspects_tool_prospects_header_indicators',
//                                                 'melisKey' => 'MelisCmsProspects_tool_prospects_header_indicators',
//                                             ),
//                                             'forward' => array(
//                                                 'module' => 'MelisCmsProspects',
//                                                 'controller' => 'ToolProspects',
//                                                 'action' => 'render-tool-prospects-header-indicators',
//                                                 'jscallback' => '',
//                                                 'jsdatas' => array()
//                                             ),
//                                         ),
                                        

                                    ),
                                ),
                                // Prospects Widgets
                                'MelisCmsProspects_tool_prospects_widgets' => array( 
                                    'conf' => array(
                                        'id' => 'id_MelisCmsProspects_tool_prospects_widgets',
                                        'name' => 'tr_MelisCmsProspects_tool_prospects_widgets',
                                        'melisKey' => 'MelisCmsProspects_tool_prospects_widgets',
                                    ),
                                    'forward' => array(
                                        'module' => 'MelisCmsProspects',
                                        'controller' => 'ToolProspects',
                                        'action' => 'render-tool-prospects-widgets-content',
                                        'jscallback' => '',
                                        'jsdatas' => array()
                                    ),
                                    'interface' => array(
                                        // Number of Prospect widget
                                        'MelisCmsProspects_tool_prospects_header_num_prospects' => array( 
                                            'conf' => array(
                                                'id' => 'id_MelisCmsProspects_tool_prospects_header_num_prospects',
                                                'name' => 'tr_MelisCmsProspects_tool_prospects_header_num_prospects',
                                                'melisKey' => 'MelisCmsProspects_tool_prospects_header_num_prospects',
                                                'width' => '4' // width of the widget
                                            ),
                                            'forward' => array(
                                                'module' => 'MelisCmsProspects',
                                                'controller' => 'ToolProspects',
                                                'action' => 'render-tool-prospects-widget-num-prospects',
                                                'jscallback' => '',
                                                'jsdatas' => array()
                                            ),
                                        ),
                                        // Number of Prospect this month widget
                                        'MelisCmsProspects_tool_prospects_header_num_prospects_this_month' => array(
                                            'conf' => array(
                                                'id' => 'id_MelisCmsProspects_tool_prospects_header_num_prospects_this_month',
                                                'name' => 'tr_MelisCmsProspects_tool_prospects_header_num_prospects_this_month',
                                                'melisKey' => 'MelisCmsProspects_tool_prospects_header_num_prospects_this_month',
                                                'width' => '4' // width of the widget
                                            ),
                                            'forward' => array(
                                                'module' => 'MelisCmsProspects',
                                                'controller' => 'ToolProspects',
                                                'action' => 'render-tool-prospects-widget-num-prospects-this-month',
                                                'jscallback' => '',
                                                'jsdatas' => array()
                                            ),
                                        ),
                                        // Average of Prospect per month widget
                                        'MelisCmsProspects_tool_prospects_header_num_prospects_average_per_month' => array(
                                            'conf' => array(
                                                'id' => 'id_MelisCmsProspects_tool_prospects_header_num_prospects_average_per_month',
                                                'name' => 'tr_MelisCmsProspects_tool_prospects_header_num_prospects_average_per_month',
                                                'melisKey' => 'MelisCmsProspects_tool_prospects_header_num_prospects_average_per_month',
                                                'width' => '4' // width of the widget
                                            ),
                                            'forward' => array(
                                                'module' => 'MelisCmsProspects',
                                                'controller' => 'ToolProspects',
                                                'action' => 'render-tool-prospects-widget-prospects-average-per-month',
                                                'jscallback' => '',
                                                'jsdatas' => array()
                                            ),
                                        ),
                                    )
                                ),
                                'MelisCmsProspects_tool_prospects_contents' => array( // tool data | shown in the form of tables
                                    'conf' => array(
                                        'id' => 'id_MelisCmsProspects_tool_prospects_content',
                                        'name' => 'tr_meliscore_tool_gen_content',
                                        'melisKey' => 'MelisCmsProspects_tool_prospects_content',
                                    ),
                                    'forward' => array(
                                        'module' => 'MelisCmsProspects',
                                        'controller' => 'ToolProspects',
                                        'action' => 'render-tool-prospects-content',
                                        'jscallback' => '',
                                        'jsdatas' => array()
                                    ),
                                    'interface' => array(
                                        'MelisCmsProspects_tool_prospects_content_action_edit' => array(
                                            'conf' => array(
                                                'id' => 'id_MelisCmsProspects_tool_prospects_action_edit',
                                                'name' => 'tr_meliscore_tool_gen_edit',
                                                'melisKey' => 'MelisCmsProspects_tool_prospects_action_edit',
                                            ),
                                            'forward' => array(
                                                'module' => 'MelisCmsProspects',
                                                'controller' => 'ToolProspects',
                                                'action' => 'render-tool-prospects-action-edit',
                                                'jscallback' => '',
                                                'jsdatas' => array()
                                            ),
                                        ),
                                        'MelisCmsProspects_tool_prospects_content_action_delete' => array(
                                            'conf' => array(
                                                'id' => 'id_MelisCmsProspects_tool_prospects_action_delete',
                                                'name' => 'tr_meliscore_tool_gen_delete',
                                                'melisKey' => 'MelisCmsProspects_tool_prospects_action_delete',
                                            ),
                                            'forward' => array(
                                                'module' => 'MelisCmsProspects',
                                                'controller' => 'ToolProspects',
                                                'action' => 'render-tool-prospects-action-delete',
                                                'jscallback' => '',
                                                'jsdatas' => array()
                                            ),
                                        ),
                                    ),
                                ),
                                'MelisCmsProspects_tool_prospects_content_modal' => array( // modals
                                    'conf' => array(
                                        'id' => 'id_MelisCmsProspects_tool_prospects_modal',
                                        'name' => 'tr_meliscore_tool_gen_modal',
                                        'melisKey' => 'MelisCmsProspects_tool_prospects_modal',
                                    ),
                                    'forward' => array(
                                        'module' => 'MelisCmsProspects',
                                        'controller' => 'ToolProspects',
                                        'action' => 'render-tool-prospects-modal-container',
                                        'jscallback' => '',
                                        'jsdatas' => array()
                                    ),
                                    'interface' => array( // handles the display and the rights of the modal
                                        'MelisCmsProspects_tool_prospects_update_modal_content' => array(
                                            'conf' => array(
                                                'id' => 'id_MelisCmsProspects_tool_prospects_update_modal_content',
                                                'name' => 'tr_meliscore_tool_gen_save',
                                                'melisKey' => 'MelisCmsProspects_tool_prospects_update_modal_content',
                                            ),
                                            'forward' => array(
                                                'module' => 'MelisCmsProspects',
                                                'controller' => 'ToolProspects',
                                                'action' => 'render-tool-prospects-modal-update-content',
                                                'jscallback' => '',
                                                'jsdatas' => array()
                                            )
                                        ),
                        
                                    ),
                                ),
                        
                            ),
                        ), // end prospects tool
                    ),
                ),
            ),
        ),
    ),

);