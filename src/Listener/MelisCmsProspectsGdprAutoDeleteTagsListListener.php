<?php
namespace MelisCmsProspects\Listener;
/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2020 Melis Technology (http://www.melistechnology.com)
 *
 */

use MelisCmsUserAccount\Service\MelisCmsUserAccountGdprAutoDeleteService;
use MelisCore\Service\MelisCoreGdprAutoDeleteService;
use Zend\EventManager\EventManagerInterface;
use Zend\EventManager\ListenerAggregateInterface;
use MelisCore\Listener\MelisCoreGeneralListener;

class MelisCmsProspectsGdprAutoDeleteTagsListListener extends MelisCoreGeneralListener implements ListenerAggregateInterface
{
	
    public function attach(EventManagerInterface $events)
    {
        $sharedEvents      = $events->getSharedManager();
        $callBackHandler = $sharedEvents->attach(
        	'*',
            MelisCoreGdprAutoDeleteService::TAGS_EVENT,
        	function($e){
        	    /*
        	     * get list of tags
        	     */
                return $e->getTarget()->getServiceLocator()->get('MelisProspectsGdprAutoDeleteService')->getListOfTags();
        	},
        -1000);
        
        $this->listeners[] = $callBackHandler;
    }
}