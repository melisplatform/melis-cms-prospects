<?php

return array(
    'plugins' => array(
        'meliscmsprospects' => array(
            'conf' => array(
                // user rights exclusions
                'rightsDisplay' => 'none',
            ),
            'plugins' => array(
                'MelisCmsProspectsShowFormPlugin' => array(
                    'front' => array(
                        'template_path' => array('MelisCmsProspects/prospects-form'),
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
                        'post' => array(),
                        'theme' => '',
                        // List the files to be automatically included for the correct display of the plugin
                        // To overide a key, just add it again in your site module
                        // To delete an entry, use the keyword "disable" instead of the file path for the same key
                        'files' => array(
                            'css' => array(
                            ),
                            'js' => array(
                            ),
                        ),
                        'forms' => array(
                            'contact_us' => array(
                                'attributes' => array(
                                    'name' => 'contact-us',
                                    'id' => 'contact-us',
                                    'method' => 'POST',
                                    'action' => '',
                                    'data-pluginid' => 'showform'
                                ),
                                'hydrator'  => 'Zend\Stdlib\Hydrator\ArraySerializable',
                                'elements' => array(
                                    array(
                                        'spec' => array(
                                            'name' => 'pros_name',
                                            'type' => 'Text',
                                            'options' => array(
                                                'label' => 'tr_contactus_name',
                                            ),
                                            'attributes' => array(
                                                'id' => 'pros_name',
                                                'class' => 'form-control',
                                                'value' => '',
                                                'placeholder' => 'tr_contactus_name'
                                            ),
                                        ),
                                    ),
                                    array(
                                        'spec' => array(
                                            'name' => 'pros_company',
                                            'type' => 'Text',
                                            'options' => array(
                                                'label' => 'tr_contactus_company',
                                            ),
                                            'attributes' => array(
                                                'id' => 'pros_company',
                                                'class' => 'form-control',
                                                'value' => '',
                                                'placeholder' => 'tr_contactus_company'
                                            ),
                                        ),
                                    ),
                                    array(
                                        'spec' => array(
                                            'name' => 'pros_country',
                                            'type' => 'Text',
                                            'options' => array(
                                                'label' => 'tr_contactus_country',
                                            ),
                                            'attributes' => array(
                                                'id' => 'pros_country',
                                                'class' => 'form-control',
                                                'value' => '',
                                                'placeholder' => 'tr_contactus_country'
                                            ),
                                        ),
                                    ),
                                    array(
                                        'spec' => array(
                                            'name' => 'pros_telephone',
                                            'type' => 'Text',
                                            'options' => array(
                                                'label' => 'tr_contactus_phone',
                                            ),
                                            'attributes' => array(
                                                'id' => 'pros_telephone',
                                                'class' => 'form-control',
                                                'value' => '',
                                                'placeholder' => 'tr_contactus_phone'
                                            ),
                                        ),
                                    ),
                                    array(
                                        'spec' => array(
                                            'name' => 'pros_email',
                                            'type' => 'Text',
                                            'options' => array(
                                                'label' => 'tr_contactus_email',
                                            ),
                                            'attributes' => array(
                                                'id' => 'pros_email',
                                                'class' => 'form-control',
                                                'value' => '',
                                                'placeholder' => 'tr_contactus_email'
                                            ),
                                        ),
                                    ),
                                    array(
                                        'spec' => array(
                                            'name' => 'pros_theme',
                                            'type' => 'MelisCmsProspectThemeItemSelect',
                                            'options' => array(
                                                'label' => 'tr_contactus_subject',
                                                'empty_option' => 'tr_contactus_subj_choose',
                                                'disable_inarray_validator' => true,
                                            ),
                                            'attributes' => array(
                                                'id' => 'pros_theme',
                                                'class' => 'form-control',
                                                'value' => '',
                                            ),
                                        ),
                                    ),
                                    array(
                                        'spec' => array(
                                            'name' => 'pros_message',
                                            'type' => 'Zend\Form\Element\Textarea',
                                            'options' => array(
                                                'label' => 'tr_contactus_message',
                                            ),
                                            'attributes' => array(
                                                'id' => 'pros_message',
                                                'value' => '',
                                                'placeholder' => 'tr_contactus_message',
                                                'class' => 'form-control',
                                                'rows' => '5'
                                            ),
                                        ),
                                    ),
                                ),
                                'input_filter' => array(
                                    'pros_name' => array(
                                        'name'     => 'pros_name',
                                        'required' => true,
                                        'validators' => array(
                                            array(
                                                'name'    => 'StringLength',
                                                'options' => array(
                                                    'encoding' => 'UTF-8',
                                                    //'min'      => 1,
                                                    'max'      => 50,
                                                    'messages' => array(
                                                        \Zend\Validator\StringLength::TOO_LONG => 'tr_contactus_name_long',
                                                    ),
                                                ),
                                            ),
                                            array(
                                                'name' => 'NotEmpty',
                                                'options' => array(
                                                    'messages' => array(
                                                        \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_contactus_name_empty',
                                                    ),
                                                ),
                                            ),
                                        ),
                                        'filters'  => array(
                                            array('name' => 'StripTags'),
                                            array('name' => 'StringTrim'),
                                        ),
                                    ),
                                    'pros_company' => array(
                                        'name'     => 'pros_company',
                                        'required' => true,
                                        'validators' => array(
                                            array(
                                                'name'    => 'StringLength',
                                                'options' => array(
                                                    'encoding' => 'UTF-8',
                                                    //'min'      => 1,
                                                    'max'      => 100,
                                                    'messages' => array(
                                                        \Zend\Validator\StringLength::TOO_LONG => 'tr_contactus_company_long',
                                                    ),
                                                ),
                                            ),
                                            array(
                                                'name' => 'NotEmpty',
                                                'options' => array(
                                                    'messages' => array(
                                                        \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_contactus_company_empty',
                                                    ),
                                                ),
                                            ),
                                        ),
                                        'filters'  => array(
                                            array('name' => 'StripTags'),
                                            array('name' => 'StringTrim'),
                                        ),
                                    ),
                                    'pros_country' => array(
                                        'name'     => 'pros_country',
                                        'required' => true,
                                        'validators' => array(
                                            array(
                                                'name'    => 'StringLength',
                                                'options' => array(
                                                    'encoding' => 'UTF-8',
                                                    //'min'      => 1,
                                                    'max'      => 100,
                                                    'messages' => array(
                                                        \Zend\Validator\StringLength::TOO_LONG => 'tr_contactus_country_long',
                                                    ),
                                                ),
                                            ),
                                            array(
                                                'name' => 'NotEmpty',
                                                'options' => array(
                                                    'messages' => array(
                                                        \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_contactus_country_empty',
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
                                                'name'    => 'EmailAddress',
                                                'options' => array(
                                                    'domain'   => 'true',
                                                    'hostname' => 'true',
                                                    'mx'       => 'true',
                                                    'deep'     => 'true',
                                                    'message'  => 'tr_contactus_invalid_email',
                                                )
                                            ),
                                            array(
                                                'name' => 'NotEmpty',
                                                'options' => array(
                                                    'messages' => array(
                                                        \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_contactus_empty_email',
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
                                                'name'    => 'StringLength',
                                                'options' => array(
                                                    'encoding' => 'UTF-8',
                                                    //'min'      => 1,
                                                    'max'      => 50,
                                                    'messages' => array(
                                                        \Zend\Validator\StringLength::TOO_LONG => 'tr_contactus_phone_long',
                                                    ),
                                                ),
                                            ),
                                            array(
                                                'name' => 'NotEmpty',
                                                'options' => array(
                                                    'messages' => array(
                                                        \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_contactus_phone_empty',
                                                    ),
                                                ),
                                            ),
                                            array(
                                                'name'    => 'regex', false,
                                                'options' => array(
                                                    'pattern' => '/^([0-9\(\)\/\+ \-]*)$/',
                                                    'messages'=> array(\Zend\Validator\Regex::NOT_MATCH => 'tr_tool_text_prospect_validation_invalid_phone_num'),
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
                                                'name' => 'NotEmpty',
                                                'options' => array(
                                                    'messages' => array(
                                                        \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_contactus_subject_empty',
                                                    ),
                                                ),
                                            ),
                                        ),
                                        'filters'  => array(
                                        ),
                                    ),
                                    'pros_message' => array(
                                        'name'     => 'pros_message',
                                        'required' => true,
                                        'validators' => array(
                                            array(
                                                'name' => 'NotEmpty',
                                                'options' => array(
                                                    'messages' => array(
                                                        \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_contactus_message_empty',
                                                    ),
                                                ),
                                            ),
                                        ),
                                        'filters'  => array(
                                            array('name' => 'StripTags'),
                                            array('name' => 'StringTrim'),
                                        ),
                                    ),
                                ),
                            ),
                        ),
                    ),
                    'melis' => array(
                        'name' => 'tr_MelisCmsProspectsShowFormPlugin_Name',
                        'thumbnail' => '/MelisCmsProspects/plugins/images/MelisCmsProspectsShowFormPlugin_thumb.jpg',
                        'description' => 'tr_MelisCmsProspectsShowFormPlugin_Description',
                        'files' => array(
                            'css' => array(
                            ),
                            'js' => array(
                            ),
                        ),
                        'js_initialization' => array(),
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
                        'modal_form' => array(
                            'plugin_prospect_tab_01' => array(
                                'tab_title' => 'tr_prospects_plugin_tab_properties',
                                'tab_icon'  => 'fa fa-cog',
                                'tab_form_layout' => 'MelisCmsProspects/prospects-form/melis/form_tab1',
                                'attributes' => array(
                                    'name' => 'plugin_prospect_tab_01',
                                    'id' => 'plugin_prospect_tab_01',
                                    'method' => '',
                                    'action' => '',
                                ),
                                'hydrator'  => 'Zend\Stdlib\Hydrator\ArraySerializable',
                                'elements' => array(
                                    array(
                                        'spec' => array(
                                            'name' => 'template_path',
                                            'type' => 'MelisEnginePluginTemplateSelect',
                                            'options' => array(
                                                'label' => 'tr_melis_Plugins_Template',
                                                'tooltip' => 'tr_melis_Plugins_Template tooltip',
                                                'empty_option' => 'tr_melis_Plugins_Choose',
                                                'disable_inarray_validator' => true,
                                            ),
                                            'attributes' => array(
                                                'id' => 'id_page_tpl_id',
                                                'class' => 'form-control',
                                                'required' => 'required',
                                            ),
                                        ),
                                    ),
                                    array(
                                        'spec' => array(
                                            'name' => 'pros_site_id',
                                            'type' => 'MelisCmsPluginSiteSelect',
                                            'options' => array(
                                                'label' => 'tr_melistoolprospects_prospects_pros_filter_site',
                                                'tooltip' => 'tr_melistoolprospects_prospects_pros_site tooltip',
                                                'empty_option' => 'tr_melis_Plugins_Choose',
                                                'disable_inarray_validator' => true,
                                            ),
                                            'attributes' => array(
                                                'id' => 'pros_site_id',
                                                'class' => 'form-control',
                                                'required' => 'required',
                                            ),
                                        ),
                                    ),
                                ),
                                'input_filter' => array(
                                    'template_path' => array(
                                        'name'     => 'template_path',
                                        'required' => true,
                                        'validators' => array(
                                            array(
                                                'name' => 'NotEmpty',
                                                'options' => array(
                                                    'messages' => array(
                                                        \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_front_template_path_empty',
                                                    ),
                                                ),
                                            ),
                                        ),
                                        'filters'  => array(
                                        ),
                                    ),
                                    'pros_site_id' => array(
                                        'name'     => 'pros_site_id',
                                        'required' => true,
                                        'validators' => array(
                                            array(
                                                'name' => 'NotEmpty',
                                                'options' => array(
                                                    'messages' => array(
                                                        \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_front_common_input_empty',
                                                    ),
                                                ),
                                            ),
                                        ),
                                        'filters'  => array(
                                        ),
                                    ),
                                ),
                            ),
                            'plugin_prospect_tab_02' => array(
                                'tab_title' => 'tr_MelisCmsProspectsShowFormPlugin_modal_fields',
                                'tab_icon'  => 'fa fa-pencil',
                                'tab_form_layout' => 'MelisCmsProspects/prospects-form/melis/form_tab2',
                                'attributes' => array(
                                    'name' => 'plugin_prospect_tab_02',
                                    'id' => 'plugin_prospect_tab_02',
                                    'method' => '',
                                    'action' => '',
                                ),
                                'hydrator'  => 'Zend\Stdlib\Hydrator\ArraySerializable',
                                'elements' => array(

                                ),
                                'input_filter' => array(

                                )
                            ),
                            'plugin_prospect_tab_03' => array(
                                'tab_title' => 'tr_melis_cms_prospects_theme',
                                'tab_icon'  => 'fa fa-pencil',
                                'tab_form_layout' => 'MelisCmsProspects/prospects-form/melis/form_tab1',
                                'attributes' => array(
                                    'name' => 'plugin_prospect_tab_03',
                                    'id' => 'plugin_prospect_tab_03',
                                    'method' => '',
                                    'action' => '',
                                ),
                                'hydrator'  => 'Zend\Stdlib\Hydrator\ArraySerializable',
                                'elements' => array(
                                    array(
                                        'spec' => array(
                                            'name' => 'theme',
                                            'type' => 'MelisCmsProspectThemeSelect',
                                            'options' => array(
                                                'label' => 'tr_melis_cms_prospects_theme_plugin_modal_theme',
                                                'tooltip' => 'tr_melis_cms_prospects_theme_plugin_modal_theme tooltip',
                                                'empty_option' => 'tr_meliscms_form_common_Choose',
                                                'disable_inarray_validator' => true,
                                                'open_tool' => array(
                                                    'tool_name' => 'tr_melis_cms_prospects_theme',
                                                    'tooltip' => 'tr_melis_cms_prospects_theme edit',
                                                    'tool_icon' => 'fa-pencil',
                                                    'tool_id' => 'id_MelisCmsProspects_tool_themes',
                                                    'tool_meliskey' => 'MelisCmsProspects_tool_themes',
                                                ),
                                            ),
                                            'attributes' => array(
                                                'id' => 'theme',
                                                'class' => 'form-control',
                                                'required' => 'required',
                                            ),
                                        ),
                                    ),
                                ),
                                'input_filter' => array(
                                    'theme' => array(
                                        'name'     => 'theme',
                                        'required' => true,
                                        'validators' => array(
                                            array(
                                                'name' => 'NotEmpty',
                                                'options' => array(
                                                    'messages' => array(
                                                        \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_melis_cms_prospects_plugin_config_no_theme',
                                                    ),
                                                ),
                                            ),
                                        ),
                                        'filters'  => array(
                                        ),
                                    ),
                                )
                            ),
                        )
                    ),
                ),
            ),
        ),
    ),
);