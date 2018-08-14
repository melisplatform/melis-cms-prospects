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
            array(
                'melis_core_gdpr_user_info_event',
            ),
            function($e)
            {
                $moduleName = $this->getModuleName($this);
                $prospectsTable = $e->getTarget()->getServiceLocator()->get('MelisProspects');

                $parameters = $e->getParams();

                $dataConfig = array(
                    'icon' => 'fa fa-user-plus',
                    'moduleName' => $moduleName,

                    'values' => array(
                        'columns' => array(
                            'pros_email' => array(
                                'id' => 'meliscmsprospects_pros_email',
                                'text' => 'tr_melis_cms_prospects_gdpr_column_email'
                            ),
                            'pros_name' => array(
                                'id' => 'meliscmsprospects_pros_name',
                                'text' => 'tr_melis_cms_prospects_gdpr_column_name'
                            ),
                            'pros_company' => array(
                                'id' => 'meliscmsprospects_pros_company',
                                'text' => 'tr_melis_cms_prospects_gdpr_column_company'
                            ),
                            'pros_country' => array(
                                'id' => 'meliscmsprospects_pros_country',
                                'text' => 'tr_melis_cms_prospects_gdpr_column_country'
                            ),
                            'site_name' => array(
                                'id' => 'meliscmsprospects_pros_site',
                                'text' => 'tr_melis_cms_prospects_gdpr_column_site'
                            ),
                        ),
                    ),
                );
                //get all keys of columns
                $tableColumns = array_keys($dataConfig['values']['columns']);
                //column in database we don't want to use in querying
                $notIncludedColumnsInQuery = array(
                    'pros_telephone', 'pros_contact_date', 'pros_id'
                );

                $arrayDatas = $prospectsTable->getDataForGdpr($parameters['search'], $notIncludedColumnsInQuery)->toArray();
                //module should stay silent if no data mataches
                if(!empty($arrayDatas)){
                    $dataConfig['values']['datas'] = $this->structureDatasArray($arrayDatas, $tableColumns, $dataConfig);
                    //send data back
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
                        $datasArray[$arrayData['pros_id']] = $datasArray[$arrayData['pros_id']] + array($dataKey => $dataValue);
                        break;
                    }
                }
            }
        }

        return $datasArray;
    }
}