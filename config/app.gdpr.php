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
                                    'text' => 'tr_melis_cms_prospects_gdpr_column_email'
                                ],
                                'pros_name' => [
                                    'id' => 'meliscmsprospects_pros_name',
                                    'text' => 'tr_melis_cms_prospects_gdpr_column_name'
                                ],
                                'pros_company' => [
                                    'id' => 'meliscmsprospects_pros_company',
                                    'text' => 'tr_melis_cms_prospects_gdpr_column_company'
                                ],
                                'pros_country' => [
                                    'id' => 'meliscmsprospects_pros_country',
                                    'text' => 'tr_melis_cms_prospects_gdpr_column_country'
                                ],
                                'site_name' => [
                                    'id' => 'meliscmsprospects_pros_site',
                                    'text' => 'tr_melis_cms_prospects_gdpr_column_site'
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