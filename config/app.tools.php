<?php

return [
    'plugins' => [
        'melistoolprospects' => [
            'conf' => [
                // user rights exclusions
                'rightsDisplay' => 'none',
            ],
            'tools' => [
                'melistoolprospects_tool_prospects' => [
                    'conf' => [
                        'title' => 'tr_melistoolprospects_tool_prospects',
                        'id' => 'id_melistoolprospects_tool_prospects',
                    ],
                    
                    // configure and control the view of the table if you want to use datatable 
                    'table' => [
                        // table ID
                        'target' => '#tableToolProspect', 
                        'ajaxUrl' => '/melis/MelisCmsProspects/ToolProspects/getToolProspectData',
                        'dataFunction' => 'initDatePickerFilter',
                        'ajaxCallback' => '',
                        'filters' => [
                            'left' => [
                                'toolprospect-limit' => [
                                    'module' => 'MelisCmsProspects',
                                    'controller' => 'ToolProspects',
                                    'action' => 'render-tool-prospects-content-filters-limit'
                                ],
                                'toolprospect-date-filter' => [
                                    'module' => 'MelisCmsProspects',
                                    'controller' => 'ToolProspects',
                                    'action' => 'render-tool-prospects-content-filters-date'
                                ],
                                'toolprospect-site-filter' => [
                                    'module' => 'MelisCmsProspects',
                                    'controller' => 'ToolProspects',
                                    'action' => 'render-tool-prospects-content-filters-site'
                                ],
                                'toolprospect-type-filter' => [
                                    'module' => 'MelisCmsProspects',
                                    'controller' => 'ToolProspects',
                                    'action' => 'render-tool-prospects-content-filters-pros-type'
                                ],
                            ],
                            'center' => [
                                'toolprospect-search' => [
                                    'module' => 'MelisCmsProspects',
                                    'controller' => 'ToolProspects',
                                    'action' => 'render-tool-prospects-content-filters-search'
                                ],
                            ],
                            'right' => [
                                'toolprospect-export' => [
                                    'module' => 'MelisCmsProspects',
                                    'controller' => 'ToolProspects',
                                    'action' => 'render-tool-prospects-content-filters-export'
                                ],
                                'toolprospect-refresh' => [
                                    'module' => 'MelisCmsProspects',
                                    'controller' => 'ToolProspects',
                                    'action' => 'render-tool-prospects-content-filters-refresh'
                                ],
                            ],
                        ],
                        'columns' => [
                            'pros_id' => [
                                'text' => 'tr_melistoolprospects_prospects_pros_id',
                                'css' => ['width' => '1%', 'padding-right' => '0'],
                                'sortable' => true,
                                
                            ],
                            'site_label' => [
                                'text' => 'tr_melis_cms_prospects_gdpr_column_site',
                                'css' => ['width' => '15%', 'padding-right' => '0'],
                                'sortable' => true,

                            ],
                            'pros_name' => [
                                'text' => 'tr_melistoolprospects_prospects_pros_name',
                                'css' => ['width' => '15%', 'padding-right' => '0'],
                                'sortable' => true,
                                
                            ],
                            'pros_email' => [
                                'text' => 'tr_melistoolprospects_prospects_pros_email',
                                'css' => ['width' => '15%', 'padding-right' => '0'],
                                'sortable' => true,
                                
                            ],
                            'pros_type' => [
                                'text' => 'tr_melistoolprospects_prospects_pros_filter_type',
                                'css' => ['width' => '15%', 'padding-right' => '0'],
                                'sortable' => true,

                            ],
                            'pros_telephone' => [
                                'text' => 'tr_melistoolprospects_prospects_pros_telephone',
                                'css' => ['width' => '15%', 'padding-right' => '0'],
                                'sortable' => true,
                                
                            ],
                            'pros_contact_date' => [
                                'text' => 'tr_melistoolprospects_prospects_pros_contact_date',
                                'css' => ['width' => '14%', 'padding-right' => '0'],
                                'sortable' => true,
                                
                            ],
                            'pros_theme' => [
                                'text' => 'tr_melistoolprospects_prospects_pros_theme',
                                'css' => ['width' => '15%', 'padding-right' => '0'],
                                'sortable' => true,
                                
                            ],
                            'pros_message' => [
                                'text' => 'tr_melistoolprospects_prospects_pros_message',
                                'css' => ['width' => '15%', 'padding-right' => '0'],
                                'sortable' => false,
                                
                            ],
                        ], // end columns
                        
                        // define what columns can be used in searching
                        'searchables' => ['pros_id','site_name', 'pros_name', 'pros_email', 'pros_telephone', 'pros_contact_date', 'pros_theme', 'pros_message'],
                        
                        'actionButtons' => [
                            'edit' => [
                                'module' => 'MelisCmsProspects',
                                'controller' => 'ToolProspects',
                                'action' => 'render-tool-prospects-action-edit',
                            ],
                            'delete' => [
                                'module' => 'MelisCmsProspects',
                                'controller' => 'ToolProspects',
                                'action' => 'render-tool-prospects-action-delete',
                            ],
                        ]
                    ],
                    'export' => [
                        'csvFileName' => 'prospect_export.csv',
                    ],
                    'modals' => [ // handles the contents of the modals
                
                    ], // end modals
                    'forms' => [
                        'melistoolprospects_tool_prospects_update' => [
                            'attributes' => [
                                'name' => 'prospectmanager',
                                'id' => 'idformprospectdata',
                                'method' => 'POST',
                                'action' => '',
                            ],
                            'hydrator'  => 'Laminas\Hydrator\ArraySerializableHydrator',
                            'elements' => [
                
                                [
                                    'spec' => [
                                        'name' => 'pros_id',
                                        'type' => 'MelisText',
                                        'options' => [
                                            'label' => 'tr_melistoolprospects_prospects_common_pros_id',
                                            'tooltip' => 'tr_melistoolprospects_prospects_common_pros_id tooltip',
                                        ],
                                        'attributes' => [
                                            'id' => 'id_pros_id',
                                            'value' => '',
                                            'readonly' => 'readonly',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'pros_site_id',
                                        'type' => 'MelisCoreSiteSelect',
                                        'options' => [
                                            'label' => 'tr_melistoolprospects_prospects_pros_site_id',
                                            'tooltip' => 'tr_melistoolprospects_prospects_pros_site_id tooltip',
                                        ],
                                        'attributes' => [
                                            'id' => 'id_pros_site_id',
                                            'value' => '',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'pros_name',
                                        'type' => 'MelisText',
                                        'options' => [
                                            'label' => 'tr_melistoolprospects_prospects_pros_name',
                                            'tooltip' => 'tr_melistoolprospects_prospects_pros_name tooltip',
                                        ],
                                        'attributes' => [
                                            'id' => 'id_pros_name',
                                            'value' => '',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'pros_email',
                                        'type' => 'MelisText',
                                        'options' => [
                                            'label' => 'tr_melistoolprospects_prospects_pros_email',
                                            'tooltip' => 'tr_melistoolprospects_prospects_pros_email tooltip',
                                        ],
                                        'attributes' => [
                                            'id' => 'id_pros_email',
                                            'value' => '',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'pros_telephone',
                                        'type' => 'MelisText',
                                        'options' => [
                                            'label' => 'tr_melistoolprospects_prospects_pros_telephone',
                                            'tooltip' => 'tr_melistoolprospects_prospects_pros_telephone tooltip',
                                        ],
                                        'attributes' => [
                                            'id' => 'id_pros_telephone',
                                            'value' => '',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'pros_contact_date',
                                        'type' => 'MelisText',
                                        'options' => [
                                            'label' => 'tr_melistoolprospects_prospects_pros_contact_date',
                                            'tooltip' => 'tr_melistoolprospects_prospects_pros_contact_date tooltip',
                                        ],
                                        'attributes' => [
                                            'id' => 'id_pros_contact_date',
                                            'value' => '',
                                            'disabled' => 'disabled',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'pros_theme',
                                        'type' => 'MelisCmsProspectThemeItemSelect',
                                        'options' => [
                                            'label' => 'tr_melistoolprospects_prospects_pros_theme',
                                            'tooltip' => 'tr_melistoolprospects_prospects_pros_theme tooltip',
                                            'disable_inarray_validator' => true,
                                        ],
                                        'attributes' => [
                                            'id' => 'id_pros_message',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'pros_company',
                                        'type' => 'MelisText',
                                        'options' => [
                                            'label' => 'tr_contactus_company',
                                            'tooltip' => 'tr_contactus_company',
                                        ],
                                        'attributes' => [
                                            'id' => 'id_pros_company',
                                            'value' => '',
                                            'class' => 'form-control',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'pros_message',
                                        'type' => 'Textarea',
                                        'options' => [
                                            'label' => 'tr_melistoolprospects_prospects_pros_message',
                                            'tooltip' => 'tr_melistoolprospects_prospects_pros_message tooltip',
                                        ],
                                        'attributes' => [
                                            'id' => 'id_pros_message',
                                            'value' => '',
                                            'class' => 'form-control editme',
                                            'style' => 'max-width:100%',
                                            'rows' => '4',
                                        ],
                                    ],
                                ],
                            ],// end elements
                            'input_filter' => [
                                'pros_id' => [
                                    'name'     => 'pros_id',
                                    'required' => false,
                                    'validators' => [
                                        [
                                            'name'    => 'IsInt',
                                            'options' => [
                                                'messages' => [
                                                    \Laminas\I18n\Validator\IsInt::NOT_INT => 'tr_meliscms_tool_platform_not_digit',
                                                    \Laminas\I18n\Validator\IsInt::INVALID => 'tr_meliscms_tool_platform_not_digit',
                                                ]
                                            ]
                                        ],
                                    ],
                                    'filters' => [
                                    ],
                                ],
                
                                'pros_name' => [
                                    'name'     => 'pros_name',
                                    'required' => false,
                                    'validators' => [
                                        [
                                            'name'    => 'StringLength',
                                            'options' => [
                                                'encoding' => 'UTF-8',
                                                //'min'      => 1,
                                                'max'      => 255,
                                                'messages' => [
                                                    \Laminas\Validator\StringLength::TOO_LONG => 'tr_tool_text_prospect_pros_name_error_long'
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => 'NotEmpty',
                                            'options' => [
                                                'messages' => [
                                                    \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_tool_text_prospect_pros_name_error_empty',
                                                ],
                                            ],
                                        ],
                                    ],
                                    'filters'  => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim'],
                                    ],
                                ],
                                'pros_email' => [
                                    'name'     => 'pros_email',
                                    'required' => false,
                                    'validators' => [
                                        [
                                            'name' => 'EmailAddress',
                                            'options' => [
                                                'domain'   => 'true',
                                                'hostname' => 'true',
                                                'mx'       => 'true',
                                                'deep'     => 'true',
                                                'message'  => 'tr_meliscore_tool_user_invalid_email',
                                            ]
                                        ],
                                        [
                                            'name'    => 'StringLength',
                                            'options' => [
                                                'encoding' => 'UTF-8',
                                                //'min'      => 1,
                                                'max'      => 255,
                                                'messages' => [
                                                    \Laminas\Validator\StringLength::TOO_LONG => 'tr_tool_text_prospect_pros_email_error_long'
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => 'NotEmpty',
                                            'options' => [
                                                'messages' => [
                                                    \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_tool_text_prospect_pros_email_error_empty',
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => 'regex', false,
                                            'options' => [
                                                'pattern' => '/^[a-zA-Z0-9]+([._@]?[a-zA-Z0-9])*$/',
                                                'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_tool_user_invalid_email'],
                                                'encoding' => 'UTF-8',
                                            ],
                                        ],
                                    ],
                                    'filters'  => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim'],
                                    ],
                                ],
                                'pros_telephone' => [
                                    'name'     => 'pros_telephone',
                                    'required' => false,
                                    'validators' => [
                                        [
                                            'name'    => 'regex', false,
                                            'options' => [
                                                'pattern' => '/^([0-9\(\)\/\+ \-]*)$/',
                                                'messages'=> [\Laminas\Validator\Regex::NOT_MATCH => sprintf('tr_tool_text_prospect_validation_invalid_phone_num','%value%')],
                                            ],
                                        ],
                                        [
                                            'name' => 'NotEmpty',
                                            'options' => [
                                                'messages' => [
                                                    \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_tool_text_prospect_pros_telephone_error_empty',
                                                ],
                                            ],
                                        ],
                                    ],
                                    'filters'  => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim'],
                                    ],
                                ],
                                'pros_theme' => [
                                    'name'     => 'pros_theme',
                                    'required' => false,
                                    'validators' => [
                                        [
                                            'name'    => 'StringLength',
                                            'options' => [
                                                'encoding' => 'UTF-8',
                                                //'min'      => 1,
                                                'max'      => 255,
                                                'messages' => [
                                                    \Laminas\Validator\StringLength::TOO_LONG => 'tr_tool_text_prospect_pros_theme_error_long',
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => 'NotEmpty',
                                            'options' => [
                                                'messages' => [
                                                    \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_tool_text_prospect_pros_theme_error_empty',
                                                ],
                                            ],
                                        ],
                                    ],
                                    'filters'  => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim'],
                                    ],
                                ],
                                'pros_message' => [
                                    'name'     => 'pros_message',
                                    'required' => false,
                                    'validators' => [
                                        [
                                            'name' => 'NotEmpty',
                                            'options' => [
                                                'messages' => [
                                                    \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_tool_text_prospect_pros_message_error_empty',
                                                ],
                                            ],
                                        ],
                                        
                                    ],
                                    'filters'  => [
                                        ['name' => 'StringTrim'],
                                    ],
                                ],
                
                            ], // end input filter
                        ],
                    ], // end forms
                ], // end melistoolprospects_tool_prospects
                'melistoolprospects_tool_prospects_themes' => [
                    'conf' => [
                        'title' => 'tr_melis_cms_prospects_theme',
                        'id' => 'id_melistoolprospects_tool_prospects_themes',
                    ],
                    // configure and control the view of the table if you want to use datatable
                    'table' => [
                        // table ID
                        'target' => '#tableToolProspectsTheme',
                        'ajaxUrl' => '/melis/MelisCmsProspects/ProspectThemes/getData',
                        'dataFunction' => '',
                        'ajaxCallback' => '',
                        'filters' => [
                            'left' => [
                                'tool-prospect-themes-limit' => [
                                    'module' => 'MelisCmsProspects',
                                    'controller' => 'ProspectThemes',
                                    'action' => 'limit'
                                ],
                            ],
                            'center' => [
                                'tool-prospect-themes-search' => [
                                    'module' => 'MelisCmsProspects',
                                    'controller' => 'ProspectThemes',
                                    'action' => 'search'
                                ],
                            ],
                            'right' => [
                                'tool-prospect-themes-refresh' => [
                                    'module' => 'MelisCmsProspects',
                                    'controller' => 'ProspectThemes',
                                    'action' => 'refresh'
                                ],
                            ],
                        ],
                        'columns' => [
                            'pros_theme_id' => [
                                'text' => 'tr_melis_cms_prospects_theme_pros_theme_id',
                                'css' => ['width' => '20%', 'padding-right' => '0'],
                                'sortable' => true,

                            ],
                            'pros_theme_name' => [
                                'text' => 'tr_melis_cms_prospects_theme_pros_theme_name',
                                'css' => ['width' => '30%', 'padding-right' => '0'],
                                'sortable' => true,

                            ],
                        ], // end columns

                        // define what columns can be used in searching
                        'searchables' => ['pros_theme_id', 'pros_theme_code', 'pros_theme_name'],

                        'actionButtons' => [
                            'item_list' => [
                                'module' => 'MelisCmsProspects',
                                'controller' => 'ProspectThemes',
                                'action' => 'item-list',
                            ],
                            'edit' => [
                                'module' => 'MelisCmsProspects',
                                'controller' => 'ProspectThemes',
                                'action' => 'edit',
                            ],
                            'delete' => [
                                'module' => 'MelisCmsProspects',
                                'controller' => 'ProspectThemes',
                                'action' => 'delete',
                            ],
                        ]
                    ],
                    'export' => [],
                    'forms' => [
                        'prospects_theme_form' => [
                            'attributes' => [
                                'name' => 'prospects_theme_form',
                                'id' => 'prospects_theme_form',
                                'method' => 'POST',
                                'action' => '',
                            ],
                            'hydrator'  => 'Laminas\Hydrator\ArraySerializableHydrator',
                            'elements' => [
                                [
                                    'spec' => [
                                        'name' => 'pros_theme_id',
                                        'type' => 'MelisText',
                                        'options' => [
                                            'label' => 'tr_melistoolprospects_prospects_common_pros_id',
                                            'tooltip' => 'tr_melistoolprospects_prospects_theme_id tooltip',
                                        ],
                                        'attributes' => [
                                            'id' => 'pros_theme_id',
                                            'value' => '',
                                            'disabled' => 'disabled',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'pros_theme_name',
                                        'type' => 'MelisText',
                                        'options' => [
                                            'label' => 'tr_melis_cms_prospects_theme_pros_theme_name',
                                            'tooltip' => 'tr_melis_cms_prospects_theme_pros_theme_name tooltip',
                                        ],
                                        'attributes' => [
                                            'id' => 'pros_theme_name',
                                            'value' => '',
                                            'placeholder' => 'tr_melis_cms_prospects_theme_pros_theme_name',
                                        ],
                                    ],
                                ],
                            ],
                            'input_filter' => [
                                'pros_theme_id' => [
                                    'name'     => 'pros_theme_id',
                                    'required' => false,
                                    'validators' => [
                                        [
                                            'name'    => 'IsInt',
                                            'options' => [
                                                'messages' => [
                                                    \Laminas\I18n\Validator\IsInt::NOT_INT => 'tr_melis_cms_prospects_theme_pros_theme_id_invalid',
                                                    \Laminas\I18n\Validator\IsInt::INVALID => 'tr_melis_cms_prospects_theme_pros_theme_id_invalid',
                                                ]
                                            ]
                                        ],
                                    ],
                                    'filters' => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim'],
                                    ],
                                ],
                                'pros_theme_name' => [
                                    'name'     => 'pros_theme_name',
                                    'required' => true,
                                    'validators' => [
                                        [
                                            'name'    => 'StringLength',
                                            'options' => [
                                                'encoding' => 'UTF-8',
                                                //'min'      => 1,
                                                'max'      => 45,
                                                'messages' => [
                                                    \Laminas\Validator\StringLength::TOO_LONG => 'tr_melis_cms_prospects_theme_name_long',
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => 'NotEmpty',
                                            'options' => [
                                                'messages' => [
                                                    \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_melis_cms_prospects_theme_name_empty',
                                                ],
                                            ],
                                        ],
                                    ],
                                    'filters'  => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim'],
                                    ],
                                ],
                            ]
                        ]
                    ]
                ],
                'melistoolprospects_tool_prospects_theme_items' => [
                    'conf' => [
                        'title' => 'tr_melis_cms_prospects_theme',
                        'id' => 'id_melistoolprospects_tool_prospects_themes',
                    ],
                    // configure and control the view of the table if you want to use datatable
                    'table' => [
                        // table ID
                        'target' => '#tableToolProspectsThemeItems',
                        'ajaxUrl' => '/melis/MelisCmsProspects/ProspectThemeItems/getItemData',
                        'dataFunction' => 'setThemeId',
                        'ajaxCallback' => '',
                        'filters' => [
                            'left' => [
                                'tool-prospect-theme-items-limit' => [
                                    'module' => 'MelisCmsProspects',
                                    'controller' => 'ProspectThemeItems',
                                    'action' => 'limit'
                                ],
                            ],
                            'center' => [
                                'tool-prospect-theme-items-search' => [
                                    'module' => 'MelisCmsProspects',
                                    'controller' => 'ProspectThemeItems',
                                    'action' => 'search'
                                ],
                            ],
                            'right' => [
                                'tool-prospect-theme-items-refresh'=> [
                                    'module' => 'MelisCmsProspects',
                                    'controller' => 'ProspectThemeItems',
                                    'action' => 'refresh'
                                ],
                            ],
                        ],
                        'columns' => [
                            'pros_theme_item_id' => [
                                'text' => 'tr_melis_cms_prospects_theme_items_pros_theme_item_id',
                                'css' => ['width' => '30%', 'padding-right' => '0'],
                                'sortable' => true,

                            ],
                        'item_trans_text' => [
                            'text' => 'tr_melis_cms_prospects_theme_items_pros_theme_item_text2',
                            'css' => ['width' => '30%', 'padding-right' => '0'],
                            'sortable' => true,

                        ],
                        ], // end columns

                        // define what columns can be used in searching
                        'searchables' => ['pros_theme_item_id', 'item_trans_text'],

                        'actionButtons' => [
                            'edit' => [
                                'module' => 'MelisCmsProspects',
                                'controller' => 'ProspectThemeItems',
                                'action' => 'edit',
                            ],
                            'delete' => [
                                'module' => 'MelisCmsProspects',
                                'controller' => 'ProspectThemeItems',
                                'action' => 'delete',
                            ],
                        ]
                    ],
                    'export' => [],
                    'forms' => [
                        'prospects_theme_item_form' => [
                            'attributes' => [
                                'name' => 'prospects_theme_item_form',
                                'id' => 'prospects_theme_item_form',
                                'method' => 'POST',
                                'action' => '',
                            ],
                            'hydrator'  => 'Laminas\Hydrator\ArraySerializableHydrator',
                            'elements' => [
                                [
                                    'spec' => [
                                        'name' => 'item_trans_id',
                                        'type' => 'hidden',
                                        'options' => [
                                            'label' => '',
                                        ],
                                        'attributes' => [],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'item_trans_text',
                                        'type' => 'MelisText',
                                        'options' => [
                                            'label' => 'tr_melis_cms_prospects_theme_items_pros_theme_item_text',
                                            'tooltip' => 'tr_melis_cms_prospects_theme_items_pros_theme_item_text tooltip',
                                        ],
                                        'attributes' => [
                                            'id' => 'pros_theme_item_code',
                                            'value' => '',
                                            'placeholder' => '',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'item_trans_theme_item_id',
                                        'type' => 'hidden',
                                        'options' => [
                                            'label' => '',
                                        ],
                                        'attributes' => [
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'item_trans_lang_id',
                                        'type' => 'hidden',
                                        'options' => [
                                            'label' => '',
                                        ],
                                        'attributes' => [
                                        ],
                                    ],
                                ],
                            ]
                        ]
                    ]
                ],
            ],
        ],
    ],
];