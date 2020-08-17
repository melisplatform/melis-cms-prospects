<?php 

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCmsProspects\Listener;

use Laminas\EventManager\EventInterface;
use Laminas\EventManager\EventManagerInterface;
use MelisCore\Listener\MelisGeneralListener;

/**
 * This listener listen to prospects events in order to add entries in the
 * flash messenger
 */
class MelisCmsProspectFlashMessengerListener extends MelisGeneralListener
{
    public function attach(EventManagerInterface $events, $priority = 1)
    {
        $identifier = '*';
        $eventsName = [
            'meliscmsprospects_toolprospects_save_end',
            'meliscmsprospects_toolprospects_delete_end',
            'meliscmsprospects_theme_save_end',
            'meliscmsprospects_theme_delete_end',
            'meliscmsprospects_theme_item_save_end',
            'meliscmsprospects_theme_code_save_end',
        ];

        $priority = -1000;

        $this->attachEventListener($events, $identifier, $eventsName, [$this, 'logMessages'], $priority);
    }
}