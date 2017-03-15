<?php

return array(
    'plugins' => array(
        'meliscmsprospects' => array(
            'plugins' => array(
                'MelisCmsProspectsShowFormPlugin' => array(
                    'front' => array(
                        'template_path' => 'MelisCmsProspects/prospects-form',
                        'id' => 'showform',
                        'formid' => '',
                        'action' => '',
                        'type' => '',
                        'post' => array(),
                        'forms' => array(
                            'contact_us' => array(
                                'attributes' => array(
                                    'name' => 'contactus',
                                    'id' => 'contactus',
                                    'method' => '',
                                    'action' => '',
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
                                            'type' => 'Zend\Form\Element\Select',
                                            'options' => array(
                                                'label' => 'tr_contactus_subject',
                                                'empty_option' => 'tr_contactus_subj_choose',
                                                'value_options' => array(
                                                    'subj_opt_1' => 'tr_contactus_subj_opt_1',
                                                    'subj_opt_2' => 'tr_contactus_subj_opt_2',
                                                    'subj_opt_3' => 'tr_contactus_subj_opt_3',
                                                    'subj_opt_4' => 'tr_contactus_subj_opt_4',
                                                    'subj_opt_5' => 'tr_contactus_subj_opt_5',
                                                ),
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
                        
                    ),
                ),
             ),
        ),
     ),
);