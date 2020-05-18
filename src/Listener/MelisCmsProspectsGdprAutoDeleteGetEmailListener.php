<?php 

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCmsProspects\Listener;

use MelisCmsProspects\Service\MelisCmsProspectsGdprAutoDeleteService;
use MelisCore\Service\MelisCoreGdprAutoDeleteService as Gdpr;
use Zend\EventManager\EventManagerInterface;
use Zend\EventManager\ListenerAggregateInterface;
use MelisCore\Listener\MelisCoreGeneralListener;

class MelisCmsProspectsGdprAutoDeleteGetEmailListener extends MelisCoreGeneralListener implements ListenerAggregateInterface
{
	
    public function attach(EventManagerInterface $events)
    {
        $sharedEvents      = $events->getSharedManager();
        $callBackHandler = $sharedEvents->attach(
        	'*',
            'melis_core_gdpr_auto_delete_log_get_user_email',
        	function($e){
                $params = $e->getParams();
                if ($params['module'] == MelisCmsProspectsGdprAutoDeleteService::MODULE_NAME) {
                    // get service manager
                    $sm = $e->getTarget()->getServiceLocator();
                    // melis prospects gdpr service
                    $userData = $sm->get('MelisProspectsGdprAutoDeleteService')->getUserById($params['id']);
                    $result['module'] = $params['module'];
                    if (! empty($userData)) {
                        if ($userData->pros_email != Gdpr::ANO_VALUE) {
                            $result['email'] = $userData->pros_email;
                        }
                    }

                    return $result;
                }  
            },
        -1000);

        $this->listeners[] = $callBackHandler;
    }
}
