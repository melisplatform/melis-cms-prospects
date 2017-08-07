<?php 

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCmsProspects\Listener;

use Zend\EventManager\EventManagerInterface;
use Zend\EventManager\ListenerAggregateInterface;
use MelisCore\Listener\MelisCoreGeneralListener;

/**
 * This listener listen to prospects events in order to add entries in the
 * flash messenger
 */
class MelisCmsProspectFlashMessengerListener extends MelisCoreGeneralListener implements ListenerAggregateInterface
{
	
    public function attach(EventManagerInterface $events)
    {
        $sharedEvents      = $events->getSharedManager();
        
        $callBackHandler = $sharedEvents->attach(
        	'MelisCmsProspects',
        	array(
            'meliscmsprospects_toolprospects_save_end',
            'meliscmsprospects_toolprospects_delete_end',
            'meliscmsprospects_theme_save_end',
            'meliscmsprospects_theme_delete_end',
            'meliscmsprospects_theme_item_save_end',
            'meliscmsprospects_theme_code_save_end',
            'meliscmsprospects_theme_delete_end'),
        	function($e){

        		$sm = $e->getTarget()->getServiceLocator();
        		$flashMessenger = $sm->get('MelisCoreFlashMessenger');
        		
        		$params = $e->getParams();
        		$results = $e->getTarget()->forward()->dispatch(
        		    'MelisCore\Controller\MelisFlashMessenger',
        		    array_merge(array('action' => 'log'), $params))->getVariables();
        	},
        -1000);
        
        $this->listeners[] = $callBackHandler;
    }
}