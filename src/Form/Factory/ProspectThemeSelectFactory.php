<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCmsProspects\Form\Factory;

use Laminas\ServiceManager\ServiceLocatorInterface;
use Laminas\ServiceManager\ServiceManager;
use MelisCore\Form\Factory\MelisSelectFactory;


class ProspectThemeSelectFactory extends MelisSelectFactory
{
    /**
     * @param ServiceManager $serviceManager
     * @return array
     */
    protected function loadValueOptions(ServiceManager $serviceManager)
    {

        $themesTable    = $serviceManager->get('MelisCmsProspectsThemeTable');
        $themesData     = $themesTable->fetchAll();

        $valueoptions   = [];
        foreach($themesData as $data){
            $valueoptions[$data->pros_theme_id] = $data->pros_theme_name;
        }
        return $valueoptions;
    }

}