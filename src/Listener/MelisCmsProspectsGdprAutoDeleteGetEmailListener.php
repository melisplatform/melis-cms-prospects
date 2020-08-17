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
use Laminas\EventManager\EventManagerInterface;
use MelisCore\Listener\MelisGeneralListener;

class MelisCmsProspectsGdprAutoDeleteGetEmailListener extends MelisGeneralListener
{
    public function attach(EventManagerInterface $events, $priority = 1)
    {
        $this->attachEventListener(
            $events,
            '*',
            'melis_core_gdpr_auto_delete_log_get_user_email',
            function($e){
                $params = $e->getParams();
                if ($params['module'] == MelisCmsProspectsGdprAutoDeleteService::MODULE_NAME) {
                    // get service manager
                    $sm = $e->getTarget()->getServiceManager();
                    // melis prospects gdpr service
                    $userData = $sm->get('MelisProspectsGdprAutoDeleteService')->getUserById($params['id']);
                    $result['module'] = $params['module'];
                    if (! empty($userData)) {
                        if (!$userData->pros_anonymized) {
                            $result['email'] = $userData->pros_email;
                        }
                    }

                    return $result;
                }  
            },
            -1000
        );
    }
}
