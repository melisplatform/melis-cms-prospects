<?php 
return [
    'plugins' => [
        'meliscore' => [
            'interface' => [
                'melis_dashboardplugin' => [
                    'interface' => [
                        'melisdashboardplugin_section' => [
                            'interface' => [
                                'MelisCmsProspectsStatisticsPlugin' => [
                                    'conf' => [
                                        'type' => '/meliscmsprospects/interface/MelisCmsProspectsStatisticsPlugin'
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ],
        ],
        'meliscmsprospects' => [
            'ressources' => [
                'css' => [],
                'js' => [
                    '/MelisCmsProspects/assets/flotchart/dashboard-line-chart.js',
                    '/MelisCmsProspects/assets/flotchart/dashboard-bar-chart.js',
                ]
            ],
            'interface' => [
                'MelisCmsProspectsStatisticsPlugin' => [
                    'conf' => [
                        'name' => 'MelisCmsProspectsStatisticsPlugin',
                        'melisKey' => 'MelisCmsProspectsStatisticsPlugin'
                    ],
                    'datas' => [
                        'plugin_id' => 'ProspectsStatistics',
                        'name' => 'tr_melistoolprospects_dashboard_Prospects Statistics',
                        'description' => 'tr_melistoolprospects_dashboard_Prospects Statistics description',
                        'icon' => 'fa fa-bar-chart-o',
                        'thumbnail' => '/MelisCmsProspects/plugins/images/MelisCmsProspectsStatisticsPlugin.jpg',
                        'jscallback' => 'prospectsDashboardLineChart.loadChart()',
                        'height' => 4,
                        'width' => 6,
                        'x-axis' => 0,
                        'y-axis' => 0,
                        'section' => 'MelisMarketing',
                    ],
                    'forward' => [
                        'module' => 'MelisCmsProspects',
                        'plugin' => 'MelisCmsProspectsStatisticsPlugin',
                        'function' => 'prospectsStatistics',
                    ]
                ]
            ]
        ]
    ]
];