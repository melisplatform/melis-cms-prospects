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

class MelisCmsProspectsGdprAutoDeleteSecondWarningListUsersListener extends MelisCoreGeneralListener implements ListenerAggregateInterface
{

    public function attach(EventManagerInterface $events)
    {
        $sharedEvents = $events->getSharedManager();
        $callBackHandler = $sharedEvents->attach(
            '*',
            MelisCoreGdprAutoDeleteService::SECOND_WARNING_EVENT,
            function ($e) {
                // get the first list of warning users
                return $e->getTarget()->getServiceLocator()->get('MelisProspectsGdprAutoDeleteService')->getSecondWarningListOfUsers();
            },
            -1000);

        $this->listeners[] = $callBackHandler;
    }
}