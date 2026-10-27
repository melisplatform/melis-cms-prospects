<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCmsProspects\Listener;

use Laminas\EventManager\EventManagerInterface;
use MelisCore\Listener\MelisGeneralListener;

class MelisCmsProspectsTableColumnDisplayListener extends MelisGeneralListener
{
    public function attach(EventManagerInterface $events, $priority = 1)
    {
        $this->attachEventListener(
            $events,
            '*',
            'melis_toolcreator_col_display_options',
            function ($e) {

                $sm = $e->getTarget()->getServiceManager();
                $params = $e->getParams();
                $params['valueOptions']['prospect_name'] = $sm->get('translator')->translate('tr_melistoolprospects_tool_prospects');
            }
        );

        $this->attachEventListener(
            $events,
            '*',
            'melis_tool_column_display_prospect_name',
            function($e){

                $sm = $e->getTarget()->getServiceManager();
                $params = $e->getParams();

                $name = $params['data'];

                $prospectTbl    = $sm->get('MelisProspects');
                $prosData = $prospectTbl->getEntryById($params['data'])->current();
                if ($prosData)
                    $name = $prosData->pros_name;

                /**
                 * SECURITY (audit PRO-M8) : pros_name est saisi par un ANONYME et le
                 * consommateur (datatable d'un outil généré par le Tool Creator) rend
                 * en HTML brut — on livre une valeur échappée.
                 */
                $params['data'] = htmlspecialchars((string) $name, ENT_QUOTES, 'UTF-8');
            }
        );
    }
}