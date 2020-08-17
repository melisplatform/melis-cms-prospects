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

/**
 *
 */
class MelisCmsProspectsGdprUserDeleteListener extends MelisGeneralListener
{
    public function attach(EventManagerInterface $events, $priority = 1)
    {
        $this->attachEventListener(
            $events,
            '*',
            'melis_core_gdpr_user_delete_event',
            function($e){
                $moduleName = $this->getModuleName($this);
                $parameters = $e->getParams();

                $noErrors = true;

                if (isset($parameters['selected']) && isset($parameters['selected'][$moduleName])) {
                    $ids = $parameters['selected'][$moduleName];
                    $prospectsTable = $e->getTarget()->getServiceManager()->get('MelisProspects');

                    try {
                        $countOfDeletedProspects = $prospectsTable->deleteByField('pros_id', $ids);
                        $success = 1;
                    } catch (\Exception $ex) {
                        $success = 0;
                    }

                    foreach ($ids as $id) {
                        $parameters['log'][$moduleName][$id] = [
                            'event' => 'meliscmsprospects_toolprospects_delete_end',
                            'success' => $success,
                            'textTitle' => 'tr_melistoolprospects_tool_prospects',
                            'textMessage' => 'tr_prospect_manager_fm_delete_data_content',
                            'typeCode' => 'CMS_PROSPECTS_DELETE',
                            'itemId' => $id
                        ];
                    }

                    $noErrors = ($countOfDeletedProspects == count($ids)) ? true : false;
                    $parameters['results'][$moduleName] = $noErrors;
                }
            }
        );
    }

    /**
     * This will get the module name of the class
     * @param Class
     * @return String = module name
     */
    public function getModuleName($class)
    {
        $controllerClass = get_class($this);
        $moduleName = substr($controllerClass, 0, strpos($controllerClass, '\\'));

        return $moduleName;
    }

}