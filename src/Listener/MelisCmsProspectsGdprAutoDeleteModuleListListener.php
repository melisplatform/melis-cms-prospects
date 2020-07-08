<?php 

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCmsProspects\Listener;

use MelisCmsProspects\Service\MelisCmsProspectsGdprAutoDeleteService;
use MelisCore\Service\MelisCoreGdprAutoDeleteService;
use Zend\EventManager\EventManagerInterface;
use Zend\EventManager\ListenerAggregateInterface;
use MelisCore\Listener\MelisCoreGeneralListener;

class MelisCmsProspectsGdprAutoDeleteModuleListListener extends MelisCoreGeneralListener implements ListenerAggregateInterface
{
	
    public function attach(EventManagerInterface $events)
    {
        $sharedEvents      = $events->getSharedManager();
        $callBackHandler = $sharedEvents->attach(
        	'*',
            'melis_core_gdpr_auto_delete_modules_list',
        	function($e){
                return [
                    MelisCoreGdprAutoDeleteService::MODULE_LIST_KEY => [
                        MelisCmsProspectsGdprAutoDeleteService::MODULE_NAME => [
                            'name' => 'Melis Cms Prospects',
                            'service' => 'MelisProspectsGdprAutoDeleteService',
                        ]
                    ]
                ];
        	},
        -1000);
        
        $this->listeners[] = $callBackHandler;
    }
}