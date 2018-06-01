<?php 
    return array(
        'plugins' => array(
            'meliscmsprospects' => array(
                'ressources' => array(
                    'css' => array(
                    ),
                    'js' => array(
                        '/MelisCmsProspects/assets/flotchart/dashboard-line-chart.js',
                        '/MelisCmsProspects/assets/flotchart/dashboard-bar-chart.js',
                    )
                ),
                'dashboard_plugins' => array(
                    'MelisCmsProspectsStatisticsPlugin' => array(
                        'plugin_id' => 'ProspectsStatistics',
                        'name' => 'tr_melistoolprospects_dashboard_Prospects Statistics',
                        'description' => 'tr_melistoolprospects_dashboard_Prospects Statistics description',
                        'icon' => 'fa fa-bar-chart-o',
                        'thumbnail' => '/MelisCmsProspects/plugins/images/MelisCmsProspectsStatisticsPlugin.jpg',
                        'jscallback' => 'cmsProsDashLineGraphInit()',
                        'height' => 8,
                        
                        'interface' => array(
                            'meliscalendar_events' => array(
                                'forward' => array(
                                    'module' => 'MelisCmsProspects',
                                    'plugin' => 'MelisCmsProspectsStatisticsPlugin',
                                    'function' => 'prospectsStatistics',
                                ),
                            ),
                        ),
                    ),
                ),
            ),
        ),
    );