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
use Zend\ServiceManager\ServiceManager;

class MelisCmsProspectsGdprUserInfoListener extends MelisCoreGeneralListener implements ListenerAggregateInterface
{
    public function attach(EventManagerInterface $events)
    {
        $sharedEvents = $events->getSharedManager();

        $callBackHandler = $sharedEvents->attach(
            '*',
            [
                'melis_core_gdpr_user_info_event',
            ],
            function($e)
            {
                $moduleName = $this->getModuleName($this);
                $prospectsTable = $e->getTarget()->getServiceLocator()->get('MelisProspects');
                $melisCoreConfig = $e->getTarget()->getServiceLocator()->get('config');
                $parameters = $e->getParams();

                $dataConfig = $melisCoreConfig['plugins'][$moduleName]['gdpr']['getUserInfo'];

                //get all keys of columns
                $tableColumns = array_keys($dataConfig['values']['columns']);

                $searchableColumns = [
                    'user_name' => 'pros_name',
                    'user_email' => 'pros_email',
                    'site_id' => 'pros_site_id'
                ];

                $arrayDatas = $prospectsTable->getDataForGdpr($parameters['search'], $searchableColumns)->toArray();
                //module should stay silent if no data mataches
                if (!empty($arrayDatas)) {
                    $dataConfig['values']['datas'] = $this->structureDatasArray($arrayDatas, $tableColumns, $dataConfig);
                    $parameters['results'][$moduleName] = $dataConfig;
                }
            });
        $this->listeners[] = $callBackHandler;
    }

    /**
     * This will get the module name of the class
     * @param Class
     * @return String = module name
     */
    private function getModuleName($class)
    {
        $controllerClass = get_class($this);
        $moduleName = substr($controllerClass, 0, strpos($controllerClass, '\\'));

        return $moduleName;
    }

    /**
     * Returns structured data array
     * @param Array = params
     * @param Array = columns
     */
    private function structureDatasArray($arrayDatas = [], $tableColumns = [])
    {
        foreach ($arrayDatas as $arrayData) {
            $datasArray[$arrayData['pros_id']] = [];

            foreach($tableColumns as $columnKey => $columnValue) {
                foreach ($arrayData as $dataKey => $dataValue) {
                    if ($columnValue == $dataKey) {
                        $datasArray[$arrayData['pros_id']] = $datasArray[$arrayData['pros_id']] + [$dataKey => $dataValue];
                        break;
                    }
                }
            }
        }

        return $datasArray;
    }
}