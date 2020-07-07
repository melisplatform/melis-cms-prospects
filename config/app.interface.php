<?php 

return [
    'plugins' => [
        'meliscore' => [
            'datas' => [],
            'interface' => [
                'meliscore_leftmenu' => [
                    'interface' => [
                        'melismarketing_toolstree_section' =>  [
                            'interface' => [
                                'melisprospects_tools_section' => [
                                    'conf' => [
                                        'id' => 'id_melisprospects_tools_section',
                                        'name' => 'tr_melistoolprospects_tool_prospects',
                                        'icon' => 'fa-user-plus',
                                        'rights_checkbox_disable' => true,
                                    ],
                                    'interface' => [
                                        'MelisCmsProspects_tool_prospects' => [
                                            'conf' => [
                                                'type' => '/MelisCmsProspects/interface/MelisCmsProspects_toolstree/interface/MelisCmsProspects_tool_conf',
                                            ],
                                        ],
                                        'MelisCmsProspects_tool_prospects_themes' => [
                                            'conf' => [
                                                'type' => '/MelisCmsProspects/interface/MelisCmsProspects_toolstree/interface/MelisCmsProspectsThemes_tool_conf',
                                            ],
                                        ], 
        			    			],
								],
        			    	],
        			    ],
                    ],
                ],
            ],
        ],
        'MelisCmsProspects' => [
            'conf' => [
                'id' => '',
                'name' => 'tr_melistoolprospects_tool_prospects',
                'rightsDisplay' => 'none',
                'gdpr' => [
                    'tags' => [
                        'SITE_NAME'       => 'pros_site_id',
                        'NAME'            => 'pros_name',
                        'DATE_REGISTERED' => 'pros_contact_date',
                        'COMPANY'         => 'pros_company',
                        'URL_VALIDATION'  => '%revalidation_link%'
                    ]
                ]
            ],
            'ressources' => [
                'js' => [
                    '/MelisCmsProspects/js/tools/prospects.tool.js',
                    '/MelisCmsProspects/js/tools/prospects.theme.tool.js',
                ],
                
                'css' => [
                    '/MelisCmsProspects/css/style.css',
                ],
                /**
                 * the "build" configuration compiles all assets into one file to make
                 * lesser requests
                 */
                'build' => [
                    // lists of assets that will be loaded in the layout
                    'css' => [
                        '/MelisCmsProspects/build/css/bundle.css',

                    ],
                    'js' => [
                        '/MelisCmsProspects/build/js/bundle.js',
                    ]
                ]
            ],
            'datas' => [
                
            ],
            'interface' => [
                'MelisCmsProspects_toolstree' => [
                    'conf' => [
                        'name' => 'tr_melistoolprospects_tool_prospects',
                        'rightsDisplay' => 'referencesonly',
                    ],
                    'interface' => [
                        'MelisCmsProspects_tool_conf' => [
                            'conf' => [
                                'id' => 'id_MelisCmsProspects_tool_prospects',
                                'name' => 'tr_melistoolprospects_tool_prospects',
                                'melisKey' => 'MelisCmsProspects_tool_prospects',
                            	'icon' => 'fa-list-ol',
								'rights_checkbox_disable' => true,
                                'follow_regular_rendering' => false,
                            ],
                            'forward' => [
                                'module' => 'MelisCmsProspects',
                                'controller' => 'ToolProspects',
                                'action' => 'render-prospects',
                                'jscallback' => 'initProspectEditor();',
                                'jsdatas' => []
                            ],
                            'interface' => [
                                'MelisCmsProspects_tool_prospects_header' => [ // tool header | usually buttons
                                    'conf' => [
                                        'id' => 'id_MelisCmsProspects_tool_prospects_header',
                                        'name' => 'tr_meliscore_tool_gen_header',
                                        'melisKey' => 'MelisCmsProspects_tool_prospects_header',
                                    ],
                                    'forward' => [
                                        'module' => 'MelisCmsProspects',
                                        'controller' => 'ToolProspects',
                                        'action' => 'render-tool-prospects-header',
                                        'jscallback' => '',
                                        'jsdatas' => []
                                    ],
                                    'interface' => [

                                    ],
                                ],
                                // Prospects Widgets
                                'MelisCmsProspects_tool_prospects_widgets' => [ 
                                    'conf' => [
                                        'id' => 'id_MelisCmsProspects_tool_prospects_widgets',
                                        'name' => 'tr_melistoolprospects_tool_prospects_widgets',
                                        'melisKey' => 'MelisCmsProspects_tool_prospects_widgets',
                                    ],
                                    'forward' => [
                                        'module' => 'MelisCmsProspects',
                                        'controller' => 'ToolProspects',
                                        'action' => 'render-tool-prospects-widgets-content',
                                        'jscallback' => '',
                                        'jsdatas' => []
                                    ],
                                    'interface' => [
                                        // Number of Prospect widget
                                        'MelisCmsProspects_tool_prospects_header_num_prospects' => [ 
                                            'conf' => [
                                                'id' => 'id_MelisCmsProspects_tool_prospects_header_num_prospects',
                                                'name' => 'tr_melistoolprospects_tool_prospects_header_num_prospects',
                                                'melisKey' => 'MelisCmsProspects_tool_prospects_header_num_prospects',
                                                'width' => '4' // width of the widget
                                            ],
                                            'forward' => [
                                                'module' => 'MelisCmsProspects',
                                                'controller' => 'ToolProspects',
                                                'action' => 'render-tool-prospects-widget-num-prospects',
                                                'jscallback' => '',
                                                'jsdatas' => []
                                            ],
                                        ],
                                        // Number of Prospect this month widget
                                        'MelisCmsProspects_tool_prospects_header_num_prospects_this_month' => [
                                            'conf' => [
                                                'id' => 'id_MelisCmsProspects_tool_prospects_header_num_prospects_this_month',
                                                'name' => 'tr_melistoolprospects_tool_prospects_header_num_prospects_this_month',
                                                'melisKey' => 'MelisCmsProspects_tool_prospects_header_num_prospects_this_month',
                                                'width' => '4' // width of the widget
                                            ],
                                            'forward' => [
                                                'module' => 'MelisCmsProspects',
                                                'controller' => 'ToolProspects',
                                                'action' => 'render-tool-prospects-widget-num-prospects-this-month',
                                                'jscallback' => '',
                                                'jsdatas' => []
                                            ],
                                        ],
                                        // Average of Prospect per month widget
                                        'MelisCmsProspects_tool_prospects_header_num_prospects_average_per_month' => [
                                            'conf' => [
                                                'id' => 'id_MelisCmsProspects_tool_prospects_header_num_prospects_average_per_month',
                                                'name' => 'tr_melistoolprospects_tool_prospects_header_num_prospects_average_per_month',
                                                'melisKey' => 'MelisCmsProspects_tool_prospects_header_num_prospects_average_per_month',
                                                'width' => '4' // width of the widget
                                            ],
                                            'forward' => [
                                                'module' => 'MelisCmsProspects',
                                                'controller' => 'ToolProspects',
                                                'action' => 'render-tool-prospects-widget-prospects-average-per-month',
                                                'jscallback' => '',
                                                'jsdatas' => []
                                            ],
                                        ],
                                    ]
                                ],
                                'MelisCmsProspects_tool_prospects_contents' => [ // tool data | shown in the form of tables
                                    'conf' => [
                                        'id' => 'id_MelisCmsProspects_tool_prospects_content',
                                        'name' => 'tr_meliscore_tool_gen_content',
                                        'melisKey' => 'MelisCmsProspects_tool_prospects_content',
                                    ],
                                    'forward' => [
                                        'module' => 'MelisCmsProspects',
                                        'controller' => 'ToolProspects',
                                        'action' => 'render-tool-prospects-content',
                                        'jscallback' => '',
                                        'jsdatas' => []
                                    ],
                                    'interface' => [
                                        'MelisCmsProspects_tool_prospects_content_action_edit' => [
                                            'conf' => [
                                                'id' => 'id_MelisCmsProspects_tool_prospects_action_edit',
                                                'name' => 'tr_meliscore_tool_gen_edit',
                                                'melisKey' => 'MelisCmsProspects_tool_prospects_action_edit',
                                            ],
                                            'forward' => [
                                                'module' => 'MelisCmsProspects',
                                                'controller' => 'ToolProspects',
                                                'action' => 'render-tool-prospects-action-edit',
                                                'jscallback' => '',
                                                'jsdatas' => []
                                            ],
                                        ],
                                        'MelisCmsProspects_tool_prospects_content_action_delete' => [
                                            'conf' => [
                                                'id' => 'id_MelisCmsProspects_tool_prospects_action_delete',
                                                'name' => 'tr_meliscore_tool_gen_delete',
                                                'melisKey' => 'MelisCmsProspects_tool_prospects_action_delete',
                                            ],
                                            'forward' => [
                                                'module' => 'MelisCmsProspects',
                                                'controller' => 'ToolProspects',
                                                'action' => 'render-tool-prospects-action-delete',
                                                'jscallback' => '',
                                                'jsdatas' => []
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                        ], // end prospects tool
                        'MelisCmsProspectsThemes_tool_conf' => [
                            'conf' => [
                                'id' => 'id_MelisCmsProspects_tool_themes',
                                'name' => 'tr_melis_cms_prospects_theme',
                                'melisKey' => 'MelisCmsProspects_tool_themes',
                                'icon' => 'fa-pencil',
                                'rights_checkbox_disable' => true,
                                'follow_regular_rendering' => false,
                            ],
                            'interface' => [
                                'MelisCmsProspects_tool_themes' => [
                                    'conf' => [
                                        'id' => 'id_MelisCmsProspects_tool_themes',
                                        'name' => 'tr_melis_cms_prospects_theme',
                                        'melisKey' => 'MelisCmsProspects_tool_themes',
                                    ],
                                    'forward' => [
                                        'module' => 'MelisCmsProspects',
                                        'controller' => 'ProspectThemes',
                                        'action' => 'tool-container',
                                        'jscallback' => '',
                                        'jsdatas' => []
                                    ],
                                    'interface' => [
                                        'MelisCmsProspects_tool_themes_header' => [
                                            'conf' => [
                                                'id' => 'id_MelisCmsProspects_tool_themes_header',
                                                'name' => 'tr_melis_cms_prospects_theme_header',
                                                'melisKey' => 'MelisCmsProspects_tool_themes_header',
                                            ],
                                            'forward' => [
                                                'module' => 'MelisCmsProspects',
                                                'controller' => 'ProspectThemes',
                                                'action' => 'tool-header',
                                                'jscallback' => '',
                                                'jsdatas' => []
                                            ],
                                            'interface' => [
                                                'MelisCmsProspects_tool_themes_header_add' => [
                                                    'conf' => [
                                                        'id' => 'id_MelisCmsProspects_tool_themes_header_add',
                                                        'name' => 'tr_melis_cms_prospects_theme_new',
                                                        'melisKey' => 'MelisCmsProspects_tool_themes_header_add',
                                                    ],
                                                    'forward' => [
                                                        'module' => 'MelisCmsProspects',
                                                        'controller' => 'ProspectThemes',
                                                        'action' => 'tool-header-add',
                                                        'jscallback' => '',
                                                        'jsdatas' => []
                                                    ],
                                                ]
                                            ]
                                        ],
                                        'MelisCmsProspects_tool_themes_content' => [
                                            'conf' => [
                                                'id' => 'id_MelisCmsProspects_tool_themes_content',
                                                'name' => 'tr_melis_cms_prospects_theme_content',
                                                'melisKey' => 'MelisCmsProspects_tool_themes_content_themes_content',
                                            ],
                                            'forward' => [
                                                'module' => 'MelisCmsProspects',
                                                'controller' => 'ProspectThemes',
                                                'action' => 'tool-content',
                                                'jscallback' => '',
                                                'jsdatas' => []
                                            ],
                                        ],
                                        'MelisCmsProspects_tool_themes_modal_container' => [
                                            'conf' => [
                                                'id'   => 'id_MelisCmsProspects_tool_themes_modal_container',
                                                'name' => 'tr_melis_cms_prospects_theme_modal',
                                                'melisKey' => 'MelisCmsProspects_tool_themes_modal_container',
                                            ],
                                            'forward' => [
                                                'module' => 'MelisCmsProspects',
                                                'controller' => 'ProspectThemes',
                                                'action' => 'tool-modal-container',
                                                'jscallback' => '',
                                                'jsdatas' => []
                                            ],
                                            'interface' => [
                                                'MelisCmsProspects_tool_themes_modal_content' => [
                                                    'conf' => [
                                                        'id' => 'id_MelisCmsProspects_tool_themes_modal_content',
                                                        'melisKey' => 'MelisCmsProspects_tool_themes_modal_content',
                                                        'name' => 'tr_melis_cms_prospects_theme_modal'
                                                    ],
                                                    'forward' => [
                                                        'module' => 'MelisCmsProspects',
                                                        'controller' => 'ProspectThemes',
                                                        'action' => 'tool-modal-content',
                                                        'jscallback' => '',
                                                        'jsdatas' => []
                                                    ],
                                                ]
                                            ]
                                        ],
                                    ]
                                ],
                                // end theme tool
                                'MelisCmsProspects_tool_theme_items' => [
                                    'conf' => [
                                        'id' => 'id_MelisCmsProspects_tool_theme_items',
                                        'name' => 'tr_melis_cms_prospects_theme_items',
                                        'melisKey' => 'MelisCmsProspects_tool_theme_items',
                                    ],
                                    'forward' => [
                                        'module' => 'MelisCmsProspects',
                                        'controller' => 'ProspectThemeItems',
                                        'action' => 'tool-container',
                                        'jscallback' => '',
                                        'jsdatas' => []
                                    ],
                                    'interface' => [
                                        'MelisCmsProspects_tool_theme_items_header' => [
                                            'conf' => [
                                                'id' => 'id_MelisCmsProspects_tool_theme_items_header',
                                                'name' => 'tr_melis_cms_prospects_theme_items_header',
                                                'melisKey' => 'MelisCmsProspects_tool_theme_items_header',
                                            ],
                                            'forward' => [
                                                'module' => 'MelisCmsProspects',
                                                'controller' => 'ProspectThemeItems',
                                                'action' => 'tool-header',
                                                'jscallback' => '',
                                                'jsdatas' => []
                                            ],
                                            'interface' => [
                                                'MelisCmsProspects_tool_themes_items_header_add' => [
                                                    'conf' => [
                                                        'id' => 'id_MelisCmsProspects_tool_themes_items_header_add',
                                                        'name' => 'tr_melis_cms_prospects_theme_items_add',
                                                        'melisKey' => 'MelisCmsProspects_tool_themes_items_header_add',
                                                    ],
                                                    'forward' => [
                                                        'module' => 'MelisCmsProspects',
                                                        'controller' => 'ProspectThemeItems',
                                                        'action' => 'tool-header-add',
                                                        'jscallback' => '',
                                                        'jsdatas' => []
                                                    ],
                                                ]
                                            ]
                                        ],
                                        'MelisCmsProspects_tool_theme_items_content' => [
                                            'conf' => [
                                                'id' => 'id_MelisCmsProspects_tool_theme_items_content',
                                                'name' => 'tr_melis_cms_prospects_theme_items_header',
                                                'melisKey' => 'MelisCmsProspects_tool_theme_items_content',
                                            ],
                                            'forward' => [
                                                'module' => 'MelisCmsProspects',
                                                'controller' => 'ProspectThemeItems',
                                                'action' => 'tool-content',
                                                'jscallback' => '',
                                                'jsdatas' => []
                                            ],
                                        ],
                                    ],
                                ],
                                // end theme item tool

                            ]
                        ]
                    ],
                ],
                'MelisCmsProspects_tool_prospects_content_modal' => [ // modals
                    'conf' => [
                        'id' => 'id_MelisCmsProspects_tool_prospects_modal',
                        'name' => 'tr_meliscore_tool_gen_modal',
                        'melisKey' => 'MelisCmsProspects_tool_prospects_modal',
                    ],
                    'forward' => [
                        'module' => 'MelisCmsProspects',
                        'controller' => 'ToolProspects',
                        'action' => 'render-tool-prospects-modal-container',
                        'jscallback' => '',
                        'jsdatas' => []
                    ],
                    'interface' => [ // handles the display and the rights of the modal
                        'MelisCmsProspects_tool_prospects_update_modal_content' => [
                            'conf' => [
                                'id' => 'id_MelisCmsProspects_tool_prospects_update_modal_content',
                                'name' => 'tr_meliscore_tool_gen_save',
                                'melisKey' => 'MelisCmsProspects_tool_prospects_update_modal_content',
                            ],
                            'forward' => [
                                'module' => 'MelisCmsProspects',
                                'controller' => 'ToolProspects',
                                'action' => 'render-tool-prospect-update-form',
                                'jscallback' => 'initProspectEditor();',
                                'jsdatas' => []
                            ]
                        ],
                        'MelisCmsProspects_tool_theme_items_modal_content' => [
                            'conf' => [
                                'id' => 'id_MelisCmsProspects_tool_theme_items_modal_content',
                                'melisKey' => 'MelisCmsProspects_tool_theme_items_modal_content',
                                'name' => 'tr_melis_cms_prospects_theme_items_modal_content'
                            ],
                            'forward' => [
                                'module' => 'MelisCmsProspects',
                                'controller' => 'ProspectThemeItems',
                                'action' => 'tool-modal-content',
                                'jscallback' => '',
                                'jsdatas' => []
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ],
];
