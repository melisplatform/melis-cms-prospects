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
                $melisCoreConfig = $e->getTarget()->getServiceLocator()->get('config');
                $prospectsTable = $e->getTarget()->getServiceLocator()->get('MelisProspects');
                $parameters = $e->getParams();

                $columns = $melisCoreConfig['plugins'][$moduleName]['gdpr']['export']['columns'];

                if (isset($parameters['selected'][$moduleName])) {
                    $xmlDoc = new \DOMDocument();
                    $xmlDoc->formatOutput = true;

                    $root = $xmlDoc->appendChild($xmlDoc->createElement('xml'));
                    $module = $root->appendChild($xmlDoc->createElement($moduleName));

                    $prospects = $prospectsTable->getEntryByField('pros_id', $parameters['selected'][$moduleName])->toArray();

                    foreach ($prospects as $prospect) {
                        $moduleId = $module->appendChild($xmlDoc->createElement("prospect_" . $prospect['pros_id']));
                        foreach ($prospect as $prospectColumn => $prospectValue) {
                            if (isset($columns[$prospectColumn])) {
                                $newKey = $columns[$prospectColumn]['text'];
                                $moduleId->appendChild($xmlDoc->createElement($newKey, $prospectValue));
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