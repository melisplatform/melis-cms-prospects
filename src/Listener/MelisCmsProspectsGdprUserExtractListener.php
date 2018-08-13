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

/**
 *
 */
class MelisCmsProspectsGdprUserExtractListener extends MelisCoreGeneralListener implements ListenerAggregateInterface
{

    public function attach(EventManagerInterface $events)
    {
        $sharedEvents = $events->getSharedManager();

        $callBackHandler = $sharedEvents->attach(
            '*',
            array(
                'melis_core_gdpr_user_extract_event',
            ),
            function($e){
                $moduleName = $this->getModuleName($this);

                $prospectsTable = $e->getTarget()->getServiceLocator()->get('MelisProspects');
                $parameters = $e->getParams();

                $columns = [
                    'pros_id' => [
                        'text' => 'id'
                    ],
                    'pros_name' => [
                        'text' => 'name'
                    ],
                    'pros_email' => [
                        'text' => 'email'
                    ],
                    'pros_telephone' => [
                        'text' => 'telephone'
                    ],
                    'pros_message' => [
                        'text' => 'message'
                    ],
                    'pros_company' => [
                        'text' => 'company'
                    ],
                    'pros_country' => [
                        'text' => 'country'
                    ],
                    'pros_contact_date' => [
                        'text' => 'contact_date'
                    ]
                ];

                if (isset($parameters['selected'][$moduleName])) {
                    $xmlDoc = new \DOMDocument();
                    $xmlDoc->formatOutput = true;

                    $root = $xmlDoc->appendChild($xmlDoc->createElement('xml'));
                    $module = $root->appendChild($xmlDoc->createElement($moduleName));

                    foreach ($parameters['selected'][$moduleName] as $id) {
                        $dataArray = $prospectsTable->getEntryById($id)->toArray();
                        $moduleId = $module->appendChild($xmlDoc->createElement("pros_" . $id));
                        foreach ($dataArray[0] as $key => $value) {
                            if (isset($columns[$key])) {
                                $newKey = $columns[$key]['text'];
                                $moduleId->appendChild($xmlDoc->createElement($newKey, $value));
                            }
                        }
                    }

                    $parameters['results'][$moduleName] = $xmlDoc->saveXML();
                }
            });
        $this->listeners[] = $callBackHandler;
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