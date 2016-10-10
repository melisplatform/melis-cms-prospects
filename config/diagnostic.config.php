<?php

return array(

    'plugins' => array(
        'diagnostic' => array(
            'MelisCmsProspects' => array(
                
                // tests to execute
                'basicTest' => array(
                    'controller' => 'Diagnostic',
                    'action' => 'basicTest',
                    'payload' => array(
                        'label' => 'tr_melis_module_basic_action_test',
                        'module' => 'MelisCmsProspects'
                    )
                ),
        
                'testModuleTables' => array(
                    'controller' => 'Diagnostic',
                    'action' => 'testModuleTables',
                    'payload' => array(
                        'label' => 'tr_melis_module_db_test',
                        'tables' => array(
                            'melis_cms_prospects', 
                        )
                    ),
                ),
            ),
        
        ),
    ),


);

