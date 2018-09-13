<?php
    return [
        'plugins' => [
            'MelisCmsProspects' => [
                'gdpr' => [
                    'getUserInfo' => [
                        'icon' => 'fa fa-user-plus',
                        'moduleName' => 'MelisCmsProspects',
                        'values' => [
                            'columns' => [
                                'pros_email' => [
                                    'id' => 'meliscmsprospects_pros_email',
                                    'class' => '',
                                    'style' => 'width:1%;padding-left:65px !important;',
                                    'text' => 'tr_melis_cms_prospects_gdpr_column_email',
                                    'sorting' => false
                                ],
                                'pros_name' => [
                                    'id' => 'meliscmsprospects_pros_name',
                                    'class' => '',
                                    'style' => 'padding-left:70px !important;',
                                    'text' => 'tr_melis_cms_prospects_gdpr_column_name',
                                    'sorting' => false
                                ],
                                'pros_company' => [
                                    'id' => 'meliscmsprospects_pros_company',
                                    'class' => '',
                                    'style' => '',
                                    'text' => 'tr_melis_cms_prospects_gdpr_column_company',
                                    'sorting' => false
                                ],
                                'pros_country' => [
                                    'id' => 'meliscmsprospects_pros_country',
                                    'class' => '',
                                    'style' => '',
                                    'text' => 'tr_melis_cms_prospects_gdpr_column_country',
                                    'sorting' => false
                                ],
                                'site_name' => [
                                    'id' => 'meliscmsprospects_pros_site',
                                    'class' => '',
                                    'style' => '',
                                    'text' => 'tr_melis_cms_prospects_gdpr_column_site',
                                    'sorting' => false
                                ],
                            ],
                        ],
                    ],
                    'extract' => [
                        'columns' => [
                            'pros_id' => [
                                'text' => 'id'
                            ],
                            'pros_name' => [
                                'text' => 'name'
                            ],
                            'pros_email' => [
                                'text' => 'email'
                            ],
                            'pros_telephone' => [
                                'text' => 'telephone'
                            ],
                            'pros_message' => [
                                'text' => 'message'
                            ],
                            'pros_company' => [
                                'text' => 'company'
                            ],
                            'pros_country' => [
                                'text' => 'country'
                            ],
                            'pros_contact_date' => [
                                'text' => 'contact_date'
                            ]
                        ],
                    ],
                ],
            ],
        ],
    ];