<?php

return array(
    'plugins' => array(
        'melistoolprospects' => array(
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
                        'searchables' => array('pros_id', 'pros_name', 'pros_email', 'pros_telephone', 'pros_contact_date', 'pros_theme', 'pros_message'),
                        
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
                        'melistoolprospects_tool_prospects_update_modal' => array(
                            'id' => 'id_melistoolprospects_tool_prospects_update',
                            'class' => 'glyphicons user',
                            'tab-header' => '',
                            'tab-text' => 'tr_melistoolprospects_tool_prospects',
                            'content' => array(
                                'module' => 'MelisCmsProspects',
                                'controller' => 'ToolProspects',
                                'action' => 'render-tool-prospect-update-form',
                            ),
                        ),
                        'melistoolprospects_tool_prospects_empty_modal' => array(
                            'id' => 'id_melistoolprospects_tool_prospects_empty_modal',
                            'class' => 'glyphicons user',
                            'tab-header' => '',
                            'tab-text' => 'tr_tool_text_prospect_manager_empty_modal',
                            'content' => array(
                                'module' => 'MelisCmsProspects',
                                'controller' => 'ToolProspects',
                                'action' => 'render-tool-prospects-modal-empty-content'
                            ),
                        ),
                
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
                                        ),
                                        'attributes' => array(
                                            'id' => 'id_pros_id',
                                            'value' => '',
                                            'disabled' => 'disabled',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'pros_name',
                                        'type' => 'MelisText',
                                        'options' => array(
                                            'label' => 'tr_melistoolprospects_prospects_pros_name',
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
                                        'type' => 'MelisText',
                                        'options' => array(
                                            'label' => 'tr_melistoolprospects_prospects_pros_theme',
                                        ),
                                        'attributes' => array(
                                            'id' => 'id_pros_theme',
                                            'value' => '',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'pros_message',
                                        'type' => 'TextArea',
                                        'options' => array(
                                            'label' => 'tr_melistoolprospects_prospects_pros_message',
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
                                        ),
                                    ),
                                    'filters' => array(
                                    ),
                                ),
                
                                'pros_name' => array(
                                    'name'     => 'pros_name',
                                    'required' => true,
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
                                    'required' => true,
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
                                    'required' => true,
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
                                    'required' => true,
                                    'validators' => array(
//                                         array(
//                                             'name'    => 'StringLength',
//                                             'options' => array(
//                                                 'encoding' => 'UTF-8',
//                                                 'min'      => 1,
//                                                 //'max'      => 255,
//                                             ),
//                                         ),
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
                                        //array('name' => 'StripTags'),
                                        array('name' => 'StringTrim'),
                                    ),
                                ),
                
                            ), // end input filter
                        ),
                    ), // end forms
                ), // end melistoolprospects_tool_prospects
            ),
        ),
    ),
);