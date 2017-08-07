<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCmsProspects\Form\Factory;

use Zend\ServiceManager\ServiceLocatorInterface;
use MelisCore\Form\Factory\MelisSelectFactory;


class ProspectThemeSelectFactory extends MelisSelectFactory
{
    protected function loadValueOptions(ServiceLocatorInterface $formElementManager)
    {

        $serviceManager = $formElementManager->getServiceLocator();
        $themesTable    = $serviceManager->get('MelisCmsProspectsThemeTable');
        $themesData     = $themesTable->fetchAll();

        $valueoptions   = [];
        foreach($themesData as $data){
            $valueoptions[$data->pros_theme_id] = $data->pros_theme_name;
        }
        return $valueoptions;
    }

}