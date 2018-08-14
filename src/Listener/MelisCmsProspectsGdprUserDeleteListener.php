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
class MelisCmsProspectsGdprUserDeleteListener extends MelisCoreGeneralListener implements ListenerAggregateInterface
{
    public function attach(EventManagerInterface $events)
    {
        $sharedEvents = $events->getSharedManager();

        $callBackHandler = $sharedEvents->attach(
            '*',
            array(
                'melis_core_gdpr_user_delete_event',
            ),
            function($e){
                $moduleName = $this->getModuleName($this);
                $parameters = $e->getParams();
                //initialize delete functionality
                $parameters['enable_delete_functionality'][$moduleName] = true;

                $noErrors = true;

                if (isset($parameters['selected']) && isset($parameters['selected'][$moduleName])) {
                    $prospectsTable = $e->getTarget()->getServiceLocator()->get('MelisProspects');

                    foreach($parameters['selected'][$moduleName] as $id){
                        $checkData = $prospectsTable->getEntryById($id)->current();
                        if($checkData)
                            $prospectsTable->deleteById($id);
                        else
                            $noErrors = false;
                    }

                    $parameters['results'][$moduleName] = $noErrors;
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