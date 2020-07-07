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
use Laminas\EventManager\EventManagerInterface;
use MelisCore\Listener\MelisGeneralListener;

class MelisCmsProspectsGdprAutoDeleteModuleListListener extends MelisGeneralListener
{
    public function attach(EventManagerInterface $events, $priority = 1)
    {
        $this->attachEventListener(
            $events,
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
            -1000
        );
    }
}