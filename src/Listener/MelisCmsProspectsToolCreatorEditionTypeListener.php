<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCmsProspects\Listener;

use Laminas\EventManager\EventManagerInterface;
use Laminas\EventManager\ListenerAggregateInterface;
use MelisCore\Listener\MelisGeneralListener;

class MelisCmsProspectsToolCreatorEditionTypeListener extends MelisGeneralListener implements ListenerAggregateInterface
{
    public function attach(EventManagerInterface $events, $priority = 1)
    {
        $sharedEvents      = $events->getSharedManager();

        $this->listeners[] = $sharedEvents->attach(
            '*',
            'melis_toolcreator_input_edition_type_options',
            function ($e) {
                $sm = $e->getTarget()->getServiceManager();
                $params = $e->getParams();
                $params['valueOptions']['MelisCmsProspectName'] = $sm->get('translator')->translate('tr_melistoolprospects_tool_prospects');
            }
        );
    }
}