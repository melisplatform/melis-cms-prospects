<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCmsProspects\Form\Factory;

use Laminas\Form\Element\Select;
use Laminas\ServiceManager\ServiceManager;
use MelisCore\Form\Factory\MelisSelectFactory;
use Psr\Container\ContainerInterface;


class ProspectNameSelectFactory extends MelisSelectFactory
{
    /**
     * @param ContainerInterface $container
     * @param $requestedName
     * @return \Laminas\Form\Element\Select|Select
     */
    public function __invoke(ContainerInterface $container, $requestedName)
    {
        $element = new Select;
        $element->setValueOptions($this->loadValueOptions($container));
        $element->setEmptyOption($container->get('translator')->translate('tr_meliscore_common_choose'));
        return $element;
    }

    /**
     * @param ServiceManager $serviceManager
     * @return array
     */
    protected function loadValueOptions(ServiceManager $serviceManager)
    {
        $prospectTbl    = $serviceManager->get('MelisProspects');

        $valueoptions   = [];
        foreach($prospectTbl->fetchAll() as $data){
            $valueoptions[$data->pros_id] = $data->pros_name;
        }
        return $valueoptions;
    }

}