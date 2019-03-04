<?php

return array(
    'plugins' => array(
        'melistoolprospects' => array(
            'conf' => array(
                // user rights exclusions
                'rightsDisplay' => 'none',
            ),
            'tools' => array(
                'melistoolprospects_tool_prospects' => array(
                    'conf' => array(
                        'title' => 'tr_melistoolprospects_tool_prospects',
                        'id' => 'id_melistoolprospects_tool_prospects',
                    ),
                    
                    // configure and control the view of the table if you want to use datatable 
                    'table' => array(
                        // table ID
                        'target' => '#tableToolProspect', 
                        'ajaxUrl' => '/melis/MelisCmsProspects/ToolProspects/getToolProspectData',
                        'dataFunction' => 'initDatePickerFilter',
                        'ajaxCallback' => '',
                        'filters' => array(
                            'left' => array(
                                'toolprospect-limit' => array(
                                    'module' => 'MelisCmsProspects',
                                    'controller' => 'ToolProspects',
                                    'action' => 'render-tool-prospects-content-filters-limit'
                                ),
                                'toolprospect-date-filter' => array(
                                    'module' => 'MelisCmsProspects',
                                    'controller' => 'ToolProspects',
                                    'action' => 'render-tool-prospects-content-filters-date'
                                ),
                                'toolprospect-site-filter' => array(
                                    'module' => 'MelisCmsProspects',
                                    'controller' => 'ToolProspects',
                                    'action' => 'render-tool-prospects-content-filters-site'
                                ),
                                'toolprospect-type-filter' => array(
                                    'module' => 'MelisCmsProspects',
                                    'controller' => 'ToolProspects',
                                    'action' => 'render-tool-prospects-content-filters-pros-type'
                                ),
                            ),
                            'center' => array(
                                'toolprospect-search' => array(
                                    'module' => 'MelisCmsProspects',
                                    'controller' => 'ToolProspects',
                                    'action' => 'render-tool-prospects-content-filters-search'
                                ),
                            ),
                            'right' => array(
                                'toolprospect-export' => array(
                                    'module' => 'MelisCmsProspects',
                                    'controller' => 'ToolProspects',
                                    'action' => 'render-tool-prospects-content-filters-export'
                                ),
                                'toolprospect-refresh' => array(
                                    'module' => 'MelisCmsProspects',
                                    'controller' => 'ToolProspects',
                                    'action' => 'render-tool-prospects-content-filters-refresh'
                                ),
                            ),
                        ),
                        'columns' => array(
                            'pros_id' => array(
                                'text' => 'tr_melistoolprospects_prospects_pros_id',
                                'css' => array('width' => '1%', 'padding-right' => '0'),
                                'sortable' => true,
                                
                            ),
                            'site_label' => array(
                                'text' => 'tr_melis_cms_prospects_gdpr_column_site',
                                'css' => array('width' => '15%', 'padding-right' => '0'),
                                'sortable' => true,

                            ),
                            'pros_name' => array(
                                'text' => 'tr_melistoolprospects_prospects_pros_name',
                                'css' => array('width' => '15%', 'padding-right' => '0'),
                                'sortable' => true,
                                
                            ),
                            'pros_email' => array(
                                'text' => 'tr_melistoolprospects_prospects_pros_email',
                                'css' => array('width' => '15%', 'padding-right' => '0'),
                                'sortable' => true,
                                
                            ),
                            'pros_type' => array(
                                'text' => 'tr_melistoolprospects_prospects_pros_filter_type',
                                'css' => array('width' => '15%', 'padding-right' => '0'),
                                'sortable' => true,

                            ),
                            'pros_telephone' => array(
                                'text' => 'tr_melistoolprospects_prospects_pros_telephone',
                                'css' => array('width' => '15%', 'padding-right' => '0'),
                                'sortable' => true,
                                
                            ),
                            'pros_contact_date' => array(
                                'text' => 'tr_melistoolprospects_prospects_pros_contact_date',
                                'css' => array('width' => '14%', 'padding-right' => '0'),
                                'sortable' => true,
                                
                            ),
                            'pros_theme' => array(
                                'text' => 'tr_melistoolprospects_prospects_pros_theme',
                                'css' => array('width' => '15%', 'padding-right' => '0'),
                                'sortable' => true,
                                
                            ),
                            'pros_message' => array(
                                'text' => 'tr_melistoolprospects_prospects_pros_message',
                                'css' => array('width' => '15%', 'padding-right' => '0'),
                                'sortable' => false,
                                
                            ),
                        ), // end columns
                        
                        // define what columns can be used in searching
                        'searchables' => array('pros_id','site_name', 'pros_name', 'pros_email', 'pros_telephone', 'pros_contact_date', 'pros_theme', 'pros_message'),
                        
                        'actionButtons' => array(
                            'edit' => array(
                                'module' => 'MelisCmsProspects',
                                'controller' => 'ToolProspects',
                                'action' => 'render-tool-prospects-action-edit',
                            ),
                            'delete' => array(
                                'module' => 'MelisCmsProspects',
                                'controller' => 'ToolProspects',
                                'action' => 'render-tool-prospects-action-delete',
                            ),
                        )
                    ),
                    'export' => array(
                        'csvFileName' => 'prospect_export.csv',
                    ),
                    'modals' => array( // handles the contents of the modals
                
                    ), // end modals
                    'forms' => array(
                        'melistoolprospects_tool_prospects_update' => array(
                            'attributes' => array(
                                'name' => 'prospectmanager',
                                'id' => 'idformprospectdata',
                                'method' => 'POST',
                                'action' => '',
                            ),
                            'hydrator'  => 'Zend\Stdlib\Hydrator\ArraySerializable',
                            'elements' => array(
                
                                array(
                                    'spec' => array(
                                        'name' => 'pros_id',
                                        'type' => 'MelisText',
                                        'options' => array(
                                            'label' => 'tr_melistoolprospects_prospects_common_pros_id',
                                            'tooltip' => 'tr_melistoolprospects_prospects_common_pros_id tooltip',
                                        ),
                                        'attributes' => array(
                                            'id' => 'id_pros_id',
                                            'value' => '',
                                            'readonly' => 'readonly',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'pros_site_id',
                                        'type' => 'MelisCoreSiteSelect',
                                        'options' => array(
                                            'label' => 'tr_melistoolprospects_prospects_pros_site_id',
                                            'tooltip' => 'tr_melistoolprospects_prospects_pros_site_id tooltip',
                                        ),
                                        'attributes' => array(
                                            'id' => 'id_pros_site_id',
                                            'value' => '',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'pros_name',
                                        'type' => 'MelisText',
                                        'options' => array(
                                            'label' => 'tr_melistoolprospects_prospects_pros_name',
                                            'tooltip' => 'tr_melistoolprospects_prospects_pros_name tooltip',
                                        ),
                                        'attributes' => array(
                                            'id' => 'id_pros_name',
                                            'value' => '',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'pros_email',
                                        'type' => 'MelisText',
                                        'options' => array(
                                            'label' => 'tr_melistoolprospects_prospects_pros_email',
                                            'tooltip' => 'tr_melistoolprospects_prospects_pros_email tooltip',
                                        ),
                                        'attributes' => array(
                                            'id' => 'id_pros_email',
                                            'value' => '',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'pros_telephone',
                                        'type' => 'MelisText',
                                        'options' => array(
                                            'label' => 'tr_melistoolprospects_prospects_pros_telephone',
                                            'tooltip' => 'tr_melistoolprospects_prospects_pros_telephone tooltip',
                                        ),
                                        'attributes' => array(
                                            'id' => 'id_pros_telephone',
                                            'value' => '',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'pros_contact_date',
                                        'type' => 'MelisText',
                                        'options' => array(
                                            'label' => 'tr_melistoolprospects_prospects_pros_contact_date',
                                            'tooltip' => 'tr_melistoolprospects_prospects_pros_contact_date tooltip',
                                        ),
                                        'attributes' => array(
                                            'id' => 'id_pros_contact_date',
                                            'value' => '',
                                            'disabled' => 'disabled',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'pros_theme',
                                        'type' => 'MelisCmsProspectThemeItemSelect',
                                        'options' => array(
                                            'label' => 'tr_melistoolprospects_prospects_pros_theme',
                                            'tooltip' => 'tr_melistoolprospects_prospects_pros_theme tooltip',
                                            'disable_inarray_validator' => true,
                                        ),
                                        'attributes' => array(
                                            'id' => 'id_pros_message',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'pros_company',
                                        'type' => 'MelisText',
                                        'options' => array(
                                            'label' => 'tr_contactus_company',
                                            'tooltip' => 'tr_contactus_company',
                                        ),
                                        'attributes' => array(
                                            'id' => 'id_pros_company',
                                            'value' => '',
                                            'class' => 'form-control',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'pros_message',
                                        'type' => 'TextArea',
                                        'options' => array(
                                            'label' => 'tr_melistoolprospects_prospects_pros_message',
                                            'tooltip' => 'tr_melistoolprospects_prospects_pros_message tooltip',
                                        ),
                                        'attributes' => array(
                                            'id' => 'id_pros_message',
                                            'value' => '',
                                            'class' => 'form-control editme',
                                            'style' => 'max-width:100%',
                                            'rows' => '4',
                                        ),
                                    ),
                                ),
                            ),// end elements
                            'input_filter' => array(
                                'pros_id' => array(
                                    'name'     => 'pros_id',
                                    'required' => false,
                                    'validators' => array(
                                        array(
                                            'name'    => 'IsInt',
                                            'options' => array(
                                                'messages' => array(
                                                    \Zend\I18n\Validator\IsInt::NOT_INT => 'tr_meliscms_tool_platform_not_digit',
                                                    \Zend\I18n\Validator\IsInt::INVALID => 'tr_meliscms_tool_platform_not_digit',
                                                )
                                            )
                                        ),
                                    ),
                                    'filters' => array(
                                    ),
                                ),
                
                                'pros_name' => array(
                                    'name'     => 'pros_name',
                                    'required' => false,
                                    'validators' => array(
                                        array(
                                            'name'    => 'StringLength',
                                            'options' => array(
                                                'encoding' => 'UTF-8',
                                                //'min'      => 1,
                                                'max'      => 255,
                                                'messages' => array(
                                                    \Zend\Validator\StringLength::TOO_LONG => 'tr_tool_text_prospect_pros_name_error_long'
                                                ),
                                            ),
                                        ),
                                        array(
                                            'name' => 'NotEmpty',
                                            'options' => array(
                                                'messages' => array(
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_tool_text_prospect_pros_name_error_empty',
                                                ),
                                            ),
                                        ),
                                    ),
                                    'filters'  => array(
                                        array('name' => 'StripTags'),
                                        array('name' => 'StringTrim'),
                                    ),
                                ),
                                'pros_email' => array(
                                    'name'     => 'pros_email',
                                    'required' => false,
                                    'validators' => array(
                                        array(
                                            'name' => 'EmailAddress',
                                            'options' => array(
                                                'domain'   => 'true',
                                                'hostname' => 'true',
                                                'mx'       => 'true',
                                                'deep'     => 'true',
                                                'message'  => 'tr_meliscore_tool_user_invalid_email',
                                            )
                                        ),
                                        array(
                                            'name'    => 'StringLength',
                                            'options' => array(
                                                'encoding' => 'UTF-8',
                                                //'min'      => 1,
                                                'max'      => 255,
                                                'messages' => array(
                                                    \Zend\Validator\StringLength::TOO_LONG => 'tr_tool_text_prospect_pros_email_error_long'
                                                ),
                                            ),
                                        ),
                                        array(
                                            'name' => 'NotEmpty',
                                            'options' => array(
                                                'messages' => array(
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_tool_text_prospect_pros_email_error_empty',
                                                ),
                                            ),
                                        ),
                                    ),
                                    'filters'  => array(
                                        array('name' => 'StripTags'),
                                        array('name' => 'StringTrim'),
                                    ),
                                ),
                                'pros_telephone' => array(
                                    'name'     => 'pros_telephone',
                                    'required' => false,
                                    'validators' => array(
                                        array(
                                            'name'    => 'regex', false,
                                            'options' => array(
                                                'pattern' => '/^([0-9\(\)\/\+ \-]*)$/',
                                                'messages'=> array(\Zend\Validator\Regex::NOT_MATCH => sprintf('tr_tool_text_prospect_validation_invalid_phone_num','%value%')),
                                            ),
                                        ),
                                        array(
                                            'name' => 'NotEmpty',
                                            'options' => array(
                                                'messages' => array(
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_tool_text_prospect_pros_telephone_error_empty',
                                                ),
                                            ),
                                        ),
                                    ),
                                    'filters'  => array(
                                        array('name' => 'StripTags'),
                                        array('name' => 'StringTrim'),
                                    ),
                                ),
                                'pros_theme' => array(
                                    'name'     => 'pros_theme',
                                    'required' => true,
                                    'validators' => array(
                                        array(
                                            'name'    => 'StringLength',
                                            'options' => array(
                                                'encoding' => 'UTF-8',
                                                //'min'      => 1,
                                                'max'      => 255,
                                                'messages' => array(
                                                    \Zend\Validator\StringLength::TOO_LONG => 'tr_tool_text_prospect_pros_theme_error_long',
                                                ),
                                            ),
                                        ),
                                        array(
                                            'name' => 'NotEmpty',
                                            'options' => array(
                                                'messages' => array(
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_tool_text_prospect_pros_theme_error_empty',
                                                ),
                                            ),
                                        ),
                                    ),
                                    'filters'  => array(
                                        array('name' => 'StripTags'),
                                        array('name' => 'StringTrim'),
                                    ),
                                ),
                                'pros_message' => array(
                                    'name'     => 'pros_message',
                                    'required' => false,
                                    'validators' => array(
                                        array(
                                            'name' => 'NotEmpty',
                                            'options' => array(
                                                'messages' => array(
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_tool_text_prospect_pros_message_error_empty',
                                                ),
                                            ),
                                        ),
                                        
                                    ),
                                    'filters'  => array(
                                        array('name' => 'StringTrim'),
                                    ),
                                ),
                
                            ), // end input filter
                        ),
                    ), // end forms
                ), // end melistoolprospects_tool_prospects
                'melistoolprospects_tool_prospects_themes' => array(
                    'conf' => array(
                        'title' => 'tr_melis_cms_prospects_theme',
                        'id' => 'id_melistoolprospects_tool_prospects_themes',
                    ),
                    // configure and control the view of the table if you want to use datatable
                    'table' => array(
                        // table ID
                        'target' => '#tableToolProspectsTheme',
                        'ajaxUrl' => '/melis/MelisCmsProspects/ProspectThemes/getData',
                        'dataFunction' => '',
                        'ajaxCallback' => '',
                        'filters' => array(
                            'left' => array(
                                'tool-prospect-themes-limit' => array(
                                    'module' => 'MelisCmsProspects',
                                    'controller' => 'ProspectThemes',
                                    'action' => 'limit'
                                ),
                            ),
                            'center' => array(
                                'tool-prospect-themes-search' => array(
                                    'module' => 'MelisCmsProspects',
                                    'controller' => 'ProspectThemes',
                                    'action' => 'search'
                                ),
                            ),
                            'right' => array(
                                'tool-prospect-themes-refresh' => array(
                                    'module' => 'MelisCmsProspects',
                                    'controller' => 'ProspectThemes',
                                    'action' => 'refresh'
                                ),
                            ),
                        ),
                        'columns' => array(
                            'pros_theme_id' => array(
                                'text' => 'tr_melis_cms_prospects_theme_pros_theme_id',
                                'css' => array('width' => '20%', 'padding-right' => '0'),
                                'sortable' => true,

                            ),
                            'pros_theme_name' => array(
                                'text' => 'tr_melis_cms_prospects_theme_pros_theme_name',
                                'css' => array('width' => '30%', 'padding-right' => '0'),
                                'sortable' => true,

                            ),
                        ), // end columns

                        // define what columns can be used in searching
                        'searchables' => array('pros_theme_id', 'pros_theme_code', 'pros_theme_name'),

                        'actionButtons' => array(
                            'item_list' => array(
                                'module' => 'MelisCmsProspects',
                                'controller' => 'ProspectThemes',
                                'action' => 'item-list',
                            ),
                            'edit' => array(
                                'module' => 'MelisCmsProspects',
                                'controller' => 'ProspectThemes',
                                'action' => 'edit',
                            ),
                            'delete' => array(
                                'module' => 'MelisCmsProspects',
                                'controller' => 'ProspectThemes',
                                'action' => 'delete',
                            ),
                        )
                    ),
                    'export' => array(),
                    'forms' => array(
                        'prospects_theme_form' => array(
                            'attributes' => array(
                                'name' => 'prospects_theme_form',
                                'id' => 'prospects_theme_form',
                                'method' => 'POST',
                                'action' => '',
                            ),
                            'hydrator'  => 'Zend\Stdlib\Hydrator\ArraySerializable',
                            'elements' => array(
                                array(
                                    'spec' => array(
                                        'name' => 'pros_theme_id',
                                        'type' => 'MelisText',
                                        'options' => array(
                                            'label' => 'tr_melistoolprospects_prospects_common_pros_id',
                                            'tooltip' => 'tr_melistoolprospects_prospects_theme_id tooltip',
                                        ),
                                        'attributes' => array(
                                            'id' => 'pros_theme_id',
                                            'value' => '',
                                            'disabled' => 'disabled',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'pros_theme_name',
                                        'type' => 'MelisText',
                                        'options' => array(
                                            'label' => 'tr_melis_cms_prospects_theme_pros_theme_name',
                                            'tooltip' => 'tr_melis_cms_prospects_theme_pros_theme_name tooltip',
                                        ),
                                        'attributes' => array(
                                            'id' => 'pros_theme_name',
                                            'value' => '',
                                            'placeholder' => 'tr_melis_cms_prospects_theme_pros_theme_name',
                                        ),
                                    ),
                                ),
                            ),
                            'input_filter' => array(
                                'pros_theme_id' => array(
                                    'name'     => 'pros_theme_id',
                                    'required' => false,
                                    'validators' => array(
                                        array(
                                            'name'    => 'IsInt',
                                            'options' => array(
                                                'messages' => array(
                                                    \Zend\I18n\Validator\IsInt::NOT_INT => 'tr_melis_cms_prospects_theme_pros_theme_id_invalid',
                                                    \Zend\I18n\Validator\IsInt::INVALID => 'tr_melis_cms_prospects_theme_pros_theme_id_invalid',
                                                )
                                            )
                                        ),
                                    ),
                                    'filters' => array(
                                        array('name' => 'StripTags'),
                                        array('name' => 'StringTrim'),
                                    ),
                                ),
                                'pros_theme_name' => array(
                                    'name'     => 'pros_theme_name',
                                    'required' => true,
                                    'validators' => array(
                                        array(
                                            'name'    => 'StringLength',
                                            'options' => array(
                                                'encoding' => 'UTF-8',
                                                //'min'      => 1,
                                                'max'      => 45,
                                                'messages' => array(
                                                    \Zend\Validator\StringLength::TOO_LONG => 'tr_melis_cms_prospects_theme_name_long',
                                                ),
                                            ),
                                        ),
                                        array(
                                            'name' => 'NotEmpty',
                                            'options' => array(
                                                'messages' => array(
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_melis_cms_prospects_theme_name_empty',
                                                ),
                                            ),
                                        ),
                                    ),
                                    'filters'  => array(
                                        array('name' => 'StripTags'),
                                        array('name' => 'StringTrim'),
                                    ),
                                ),
                            )
                        )
                    )
                ),
                'melistoolprospects_tool_prospects_theme_items' => array(
                    'conf' => array(
                        'title' => 'tr_melis_cms_prospects_theme',
                        'id' => 'id_melistoolprospects_tool_prospects_themes',
                    ),
                    // configure and control the view of the table if you want to use datatable
                    'table' => array(
                        // table ID
                        'target' => '#tableToolProspectsThemeItems',
                        'ajaxUrl' => '/melis/MelisCmsProspects/ProspectThemeItems/getItemData',
                        'dataFunction' => 'setThemeId',
                        'ajaxCallback' => '',
                        'filters' => array(
                            'left' => array(
                                'tool-prospect-theme-items-limit' => array(
                                    'module' => 'MelisCmsProspects',
                                    'controller' => 'ProspectThemeItems',
                                    'action' => 'limit'
                                ),
                            ),
                            'center' => array(
                                'tool-prospect-theme-items-search' => array(
                                    'module' => 'MelisCmsProspects',
                                    'controller' => 'ProspectThemeItems',
                                    'action' => 'search'
                                ),
                            ),
                            'right' => array(
                                'tool-prospect-theme-items-refresh'=> array(
                                    'module' => 'MelisCmsProspects',
                                    'controller' => 'ProspectThemeItems',
                                    'action' => 'refresh'
                                ),
                            ),
                        ),
                        'columns' => array(
                            'pros_theme_item_id' => array(
                                'text' => 'tr_melis_cms_prospects_theme_items_pros_theme_item_id',
                                'css' => array('width' => '30%', 'padding-right' => '0'),
                                'sortable' => true,

                            ),
                           'item_trans_text' => array(
                               'text' => 'tr_melis_cms_prospects_theme_items_pros_theme_item_text2',
                               'css' => array('width' => '30%', 'padding-right' => '0'),
                               'sortable' => true,

                           ),
                        ), // end columns

                        // define what columns can be used in searching
                        'searchables' => array('pros_theme_item_id', 'item_trans_text'),

                        'actionButtons' => array(
                            'edit' => array(
                                'module' => 'MelisCmsProspects',
                                'controller' => 'ProspectThemeItems',
                                'action' => 'edit',
                            ),
                            'delete' => array(
                                'module' => 'MelisCmsProspects',
                                'controller' => 'ProspectThemeItems',
                                'action' => 'delete',
                            ),
                        )
                    ),
                    'export' => array(),
                    'forms' => array(
                        'prospects_theme_item_form' => array(
                            'attributes' => array(
                                'name' => 'prospects_theme_item_form',
                                'id' => 'prospects_theme_item_form',
                                'method' => 'POST',
                                'action' => '',
                            ),
                            'hydrator'  => 'Zend\Stdlib\Hydrator\ArraySerializable',
                            'elements' => array(
                                array(
                                    'spec' => array(
                                        'name' => 'item_trans_id',
                                        'type' => 'hidden',
                                        'options' => array(
                                            'label' => '',
                                        ),
                                        'attributes' => array(),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'item_trans_text',
                                        'type' => 'MelisText',
                                        'options' => array(
                                            'label' => 'tr_melis_cms_prospects_theme_items_pros_theme_item_text',
                                            'tooltip' => 'tr_melis_cms_prospects_theme_items_pros_theme_item_text tooltip',
                                        ),
                                        'attributes' => array(
                                            'id' => 'pros_theme_item_code',
                                            'value' => '',
                                            'placeholder' => '',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'item_trans_theme_item_id',
                                        'type' => 'hidden',
                                        'options' => array(
                                            'label' => '',
                                        ),
                                        'attributes' => array(
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'item_trans_lang_id',
                                        'type' => 'hidden',
                                        'options' => array(
                                            'label' => '',
                                        ),
                                        'attributes' => array(
                                        ),
                                    ),
                                ),
                            )
                        )
                    )
                ),
            ),
        ),
    ),
);