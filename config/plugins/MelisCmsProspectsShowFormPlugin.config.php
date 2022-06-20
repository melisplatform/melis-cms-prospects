<?php

return [
    'plugins' => [
        'meliscmsprospects' => [
            'conf' => [
                // user rights exclusions
                'rightsDisplay' => 'none',
            ],
            'plugins' => [
                'MelisCmsProspectsShowFormPlugin' => [
                    'front' => [
                        'template_path' => ['MelisCmsProspects/prospects-form'],
                        'id' => 'showform',
                        // Site id of Prospects
                        'pros_site_id' => null,
                        // Fields to display
                        'fields' => '',
                        // Required fields
                        'required_fields' => '',
                        
                        'formid' => '',
                        'action' => '',
                        'type' => '',
                        'post' => [],
                        'theme' => '',
                        // List the files to be automatically included for the correct display of the plugin
                        // To overide a key, just add it again in your site module
                        // To delete an entry, use the keyword "disable" instead of the file path for the same key
                        'files' => [
                            'css' => [
                            ],
                            'js' => [
                            ],
                        ],
                        'forms' => [
                            'contact_us' => [
                                'attributes' => [
                                    'name' => 'contact-us',
                                    'id' => 'contact-us',
                                    'method' => 'POST',
                                    'action' => '',
                                    'data-pluginid' => 'showform'
                                ],
                                'hydrator'  => 'Laminas\Hydrator\ArraySerializableHydrator',
                                'elements' => [
                                    [
                                        'spec' => [
                                            'name' => 'pros_name',
                                            'type' => 'Text',
                                            'options' => [
                                                'label' => 'tr_contactus_name',
                                            ],
                                            'attributes' => [
                                                'id' => 'pros_name',
                                                'class' => 'form-control',
                                                'value' => '',
                                                'placeholder' => 'tr_contactus_name'
                                            ],
                                        ],
                                    ],
                                    [
                                        'spec' => [
                                            'name' => 'pros_company',
                                            'type' => 'Text',
                                            'options' => [
                                                'label' => 'tr_contactus_company',
                                            ],
                                            'attributes' => [
                                                'id' => 'pros_company',
                                                'class' => 'form-control',
                                                'value' => '',
                                                'placeholder' => 'tr_contactus_company'
                                            ],
                                        ],
                                    ],
                                    [
                                        'spec' => [
                                            'name' => 'pros_country',
                                            'type' => 'Text',
                                            'options' => [
                                                'label' => 'tr_contactus_country',
                                            ],
                                            'attributes' => [
                                                'id' => 'pros_country',
                                                'class' => 'form-control',
                                                'value' => '',
                                                'placeholder' => 'tr_contactus_country'
                                            ],
                                        ],
                                    ],
                                    [
                                        'spec' => [
                                            'name' => 'pros_telephone',
                                            'type' => 'Text',
                                            'options' => [
                                                'label' => 'tr_contactus_phone',
                                            ],
                                            'attributes' => [
                                                'id' => 'pros_telephone',
                                                'class' => 'form-control',
                                                'value' => '',
                                                'placeholder' => 'tr_contactus_phone'
                                            ],
                                        ],
                                    ],
                                    [
                                        'spec' => [
                                            'name' => 'pros_email',
                                            'type' => 'Text',
                                            'options' => [
                                                'label' => 'tr_contactus_email',
                                            ],
                                            'attributes' => [
                                                'id' => 'pros_email',
                                                'class' => 'form-control',
                                                'value' => '',
                                                'placeholder' => 'tr_contactus_email'
                                            ],
                                        ],
                                    ],
                                    [
                                        'spec' => [
                                            'name' => 'pros_theme',
                                            'type' => 'MelisCmsProspectThemeItemSelect',
                                            'options' => [
                                                'label' => 'tr_contactus_subject',
                                                'empty_option' => 'tr_contactus_subj_choose',
                                                'disable_inarray_validator' => true,
                                            ],
                                            'attributes' => [
                                                'id' => 'pros_theme',
                                                'class' => 'form-control',
                                                'value' => '',
                                            ],
                                        ],
                                    ],
                                    [
                                        'spec' => [
                                            'name' => 'pros_message',
                                            'type' => 'Laminas\Form\Element\Textarea',
                                            'options' => [
                                                'label' => 'tr_contactus_message',
                                            ],
                                            'attributes' => [
                                                'id' => 'pros_message',
                                                'value' => '',
                                                'placeholder' => 'tr_contactus_message',
                                                'class' => 'form-control',
                                                'rows' => '5'
                                            ],
                                        ],
                                    ],
                                ],
                                'input_filter' => [
                                    'pros_name' => [
                                        'name'     => 'pros_name',
                                        'required' => true,
                                        'validators' => [
                                            [
                                                'name'    => 'StringLength',
                                                'options' => [
                                                    'encoding' => 'UTF-8',
                                                    //'min'      => 1,
                                                    'max'      => 50,
                                                    'messages' => [
                                                        \Laminas\Validator\StringLength::TOO_LONG => 'tr_contactus_name_long',
                                                    ],
                                                ],
                                            ],
                                            [
                                                'name' => 'NotEmpty',
                                                'options' => [
                                                    'messages' => [
                                                        \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_contactus_name_empty',
                                                    ],
                                                ],
                                            ],
                                        ],
                                        'filters'  => [
                                            ['name' => 'StripTags'],
                                            ['name' => 'StringTrim'],
                                        ],
                                    ],
                                    'pros_company' => [
                                        'name'     => 'pros_company',
                                        'required' => true,
                                        'validators' => [
                                            [
                                                'name'    => 'StringLength',
                                                'options' => [
                                                    'encoding' => 'UTF-8',
                                                    //'min'      => 1,
                                                    'max'      => 100,
                                                    'messages' => [
                                                        \Laminas\Validator\StringLength::TOO_LONG => 'tr_contactus_company_long',
                                                    ],
                                                ],
                                            ],
                                            [
                                                'name' => 'NotEmpty',
                                                'options' => [
                                                    'messages' => [
                                                        \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_contactus_company_empty',
                                                    ],
                                                ],
                                            ],
                                        ],
                                        'filters'  => [
                                            ['name' => 'StripTags'],
                                            ['name' => 'StringTrim'],
                                        ],
                                    ],
                                    'pros_country' => [
                                        'name'     => 'pros_country',
                                        'required' => true,
                                        'validators' => [
                                            [
                                                'name'    => 'StringLength',
                                                'options' => [
                                                    'encoding' => 'UTF-8',
                                                    //'min'      => 1,
                                                    'max'      => 100,
                                                    'messages' => [
                                                        \Laminas\Validator\StringLength::TOO_LONG => 'tr_contactus_country_long',
                                                    ],
                                                ],
                                            ],
                                            [
                                                'name' => 'NotEmpty',
                                                'options' => [
                                                    'messages' => [
                                                        \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_contactus_country_empty',
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
                                        'required' => true,
                                        'validators' => [
                                            [
                                                'name'    => 'EmailAddress',
                                                'options' => [
                                                    'domain'   => 'true',
                                                    'hostname' => 'true',
                                                    'mx'       => 'true',
                                                    'deep'     => 'true',
                                                    'message'  => 'tr_contactus_invalid_email',
                                                ]
                                            ],
                                            [
                                                'name' => 'NotEmpty',
                                                'options' => [
                                                    'messages' => [
                                                        \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_contactus_empty_email',
                                                    ],
                                                ],
                                            ],
                                            [
                                                'name' => 'regex', false,
                                                'options' => [
                                                    'pattern' => '/^[a-zA-Z0-9]+([._@]?[a-zA-Z0-9])*$/',
                                                    'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_contactus_invalid_email'],
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
                                        'required' => true,
                                        'validators' => [
                                            [
                                                'name'    => 'StringLength',
                                                'options' => [
                                                    'encoding' => 'UTF-8',
                                                    //'min'      => 1,
                                                    'max'      => 50,
                                                    'messages' => [
                                                        \Laminas\Validator\StringLength::TOO_LONG => 'tr_contactus_phone_long',
                                                    ],
                                                ],
                                            ],
                                            [
                                                'name' => 'NotEmpty',
                                                'options' => [
                                                    'messages' => [
                                                        \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_contactus_phone_empty',
                                                    ],
                                                ],
                                            ],
                                            [
                                                'name'    => 'regex', false,
                                                'options' => [
                                                    'pattern' => '/^([0-9\(\)\/\+ \-]*)$/',
                                                    'messages'=> [\Laminas\Validator\Regex::NOT_MATCH => 'tr_tool_text_prospect_validation_invalid_phone_num'],
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
                                        'required' => true,
                                        'validators' => [
                                            [
                                                'name' => 'NotEmpty',
                                                'options' => [
                                                    'messages' => [
                                                        \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_contactus_subject_empty',
                                                    ],
                                                ],
                                            ],
                                        ],
                                        'filters'  => [
                                        ],
                                    ],
                                    'pros_message' => [
                                        'name'     => 'pros_message',
                                        'required' => true,
                                        'validators' => [
                                            [
                                                'name' => 'NotEmpty',
                                                'options' => [
                                                    'messages' => [
                                                        \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_contactus_message_empty',
                                                    ],
                                                ],
                                            ],
                                        ],
                                        'filters'  => [
                                            ['name' => 'StripTags'],
                                            ['name' => 'StringTrim'],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                    'melis' => [
                        'name' => 'tr_MelisCmsProspectsShowFormPlugin_Name',
                        'thumbnail' => '/MelisCmsProspects/plugins/images/MelisCmsProspectsShowFormPlugin_thumb.jpg',
                        'description' => 'tr_MelisCmsProspectsShowFormPlugin_Description',
                        'files' => [
                            'css' => [
                            ],
                            'js' => [
                            ],
                        ],
                        'js_initialization' => [],
                        /*
                        * if set this plugin will belong to a specific marketplace section,
                        * if not it will go directly to ( Others ) section
                        *  - available section for templating plugins as of 2019-05-16
                        *    - MelisCms
                        *    - MelisMarketing
                        *    - MelisSite
                        *    - Others
                        *    - CustomProjects
                        */
                        'section' => 'MelisMarketing',
                        'modal_form' => [
                            'plugin_prospect_tab_01' => [
                                'tab_title' => 'tr_prospects_plugin_tab_properties',
                                'tab_icon'  => 'fa fa-cog',
                                'tab_form_layout' => 'MelisCmsProspects/prospects-form/melis/form_tab1',
                                'attributes' => [
                                    'name' => 'plugin_prospect_tab_01',
                                    'id' => 'plugin_prospect_tab_01',
                                    'method' => '',
                                    'action' => '',
                                ],
                                'hydrator'  => 'Laminas\Hydrator\ArraySerializableHydrator',
                                'elements' => [
                                    [
                                        'spec' => [
                                            'name' => 'template_path',
                                            'type' => 'MelisEnginePluginTemplateSelect',
                                            'options' => [
                                                'label' => 'tr_melis_Plugins_Template',
                                                'tooltip' => 'tr_melis_Plugins_Template tooltip',
                                                'empty_option' => 'tr_melis_Plugins_Choose',
                                                'disable_inarray_validator' => true,
                                            ],
                                            'attributes' => [
                                                'id' => 'id_page_tpl_id',
                                                'class' => 'form-control',
                                                'required' => 'required',
                                            ],
                                        ],
                                    ],
                                    [
                                        'spec' => [
                                            'name' => 'pros_site_id',
                                            'type' => 'MelisCmsPluginSiteSelect',
                                            'options' => [
                                                'label' => 'tr_melistoolprospects_prospects_pros_filter_site',
                                                'tooltip' => 'tr_melistoolprospects_prospects_pros_site tooltip',
                                                'empty_option' => 'tr_melis_Plugins_Choose',
                                                'disable_inarray_validator' => true,
                                            ],
                                            'attributes' => [
                                                'id' => 'pros_site_id',
                                                'class' => 'form-control',
                                                'required' => 'required',
                                            ],
                                        ],
                                    ],
                                ],
                                'input_filter' => [
                                    'template_path' => [
                                        'name'     => 'template_path',
                                        'required' => true,
                                        'validators' => [
                                            [
                                                'name' => 'NotEmpty',
                                                'options' => [
                                                    'messages' => [
                                                        \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_front_template_path_empty',
                                                    ],
                                                ],
                                            ],
                                        ],
                                        'filters'  => [
                                        ],
                                    ],
                                    'pros_site_id' => [
                                        'name'     => 'pros_site_id',
                                        'required' => true,
                                        'validators' => [
                                            [
                                                'name' => 'NotEmpty',
                                                'options' => [
                                                    'messages' => [
                                                        \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_front_common_input_empty',
                                                    ],
                                                ],
                                            ],
                                        ],
                                        'filters'  => [
                                        ],
                                    ],
                                ],
                            ],
                            'plugin_prospect_tab_02' => [
                                'tab_title' => 'tr_MelisCmsProspectsShowFormPlugin_modal_fields',
                                'tab_icon'  => 'fa fa-pencil',
                                'tab_form_layout' => 'MelisCmsProspects/prospects-form/melis/form_tab2',
                                'attributes' => [
                                    'name' => 'plugin_prospect_tab_02',
                                    'id' => 'plugin_prospect_tab_02',
                                    'method' => '',
                                    'action' => '',
                                ],
                                'hydrator'  => 'Laminas\Hydrator\ArraySerializableHydrator',
                                'elements' => [

                                ],
                                'input_filter' => []
                            ],
                            'plugin_prospect_tab_03' => [
                                'tab_title' => 'tr_melis_cms_prospects_theme',
                                'tab_icon'  => 'fa fa-pencil',
                                'tab_form_layout' => 'MelisCmsProspects/prospects-form/melis/form_tab1',
                                'attributes' => [
                                    'name' => 'plugin_prospect_tab_03',
                                    'id' => 'plugin_prospect_tab_03',
                                    'method' => '',
                                    'action' => '',
                                ],
                                'hydrator'  => 'Laminas\Hydrator\ArraySerializableHydrator',
                                'elements' => [
                                    [
                                        'spec' => [
                                            'name' => 'theme',
                                            'type' => 'MelisCmsProspectThemeSelect',
                                            'options' => [
                                                'label' => 'tr_melis_cms_prospects_theme_plugin_modal_theme',
                                                'tooltip' => 'tr_melis_cms_prospects_theme_plugin_modal_theme tooltip',
                                                'empty_option' => 'tr_meliscms_form_common_Choose',
                                                'disable_inarray_validator' => true,
                                                'open_tool' => [
                                                    'tool_name' => 'tr_melis_cms_prospects_theme',
                                                    'tooltip' => 'tr_melis_cms_prospects_theme edit',
                                                    'tool_icon' => 'fa-pencil',
                                                    'tool_id' => 'id_MelisCmsProspects_tool_themes',
                                                    'tool_meliskey' => 'MelisCmsProspects_tool_themes',
                                                ],
                                            ],
                                            'attributes' => [
                                                'id' => 'theme',
                                                'class' => 'form-control',
                                                'required' => 'required',
                                            ],
                                        ],
                                    ],
                                ],
                                'input_filter' => [
                                    'theme' => [
                                        'name'     => 'theme',
                                        'required' => true,
                                        'validators' => [
                                            [
                                                'name' => 'NotEmpty',
                                                'options' => [
                                                    'messages' => [
                                                        \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_melis_cms_prospects_plugin_config_no_theme',
                                                    ],
                                                ],
                                            ],
                                        ],
                                        'filters'  => [
                                        ],
                                    ],
                                ]
                            ],
                        ]
                    ],
                ],
            ],
        ],
    ],
];