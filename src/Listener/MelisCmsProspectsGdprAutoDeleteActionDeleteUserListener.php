<?php

namespace MelisCmsProspects\Listener;

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2020 Melis Technology (http://www.melistechnology.com)
 *
 */

use MelisCore\Service\MelisCoreGdprAutoDeleteService;
use Zend\EventManager\EventManagerInterface;
use Zend\EventManager\ListenerAggregateInterface;
use MelisCore\Listener\MelisCoreGeneralListener;

class MelisCmsProspectsGdprAutoDeleteActionDeleteUserListener extends MelisCoreGeneralListener implements ListenerAggregateInterface
{

    public function attach(EventManagerInterface $events)
    {
        $sharedEvents = $events->getSharedManager();
        $callBackHandler = $sharedEvents->attach(
            '*',
            MelisCoreGdprAutoDeleteService::DELETE_ACTION_EVENT,
            function ($e) {
                return $e->getTarget()->getServiceLocator()->get('MelisProspectsGdprAutoDeleteService')->removeOldUnvalidatedUsers($e->getParams());
            },
            -1000);

        $this->listeners[] = $callBackHandler;
    }
}