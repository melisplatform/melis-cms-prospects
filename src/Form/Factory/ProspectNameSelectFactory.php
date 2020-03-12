<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCmsProspects\Form\Factory;

use Zend\Form\Element\Select;
use Zend\ServiceManager\ServiceLocatorInterface;
use MelisCore\Form\Factory\MelisSelectFactory;


class ProspectNameSelectFactory extends MelisSelectFactory
{
    public function createService(ServiceLocatorInterface $formElementManager)
    {
        $serviceManager = $formElementManager->getServiceLocator();

        $element = new Select();
        $element->setValueOptions($this->loadValueOptions($formElementManager));
        $element->setEmptyOption($serviceManager->get('translator')->translate('tr_meliscore_common_choose'));
        return $element;
    }

    protected function loadValueOptions(ServiceLocatorInterface $formElementManager)
    {
        $serviceManager = $formElementManager->getServiceLocator();
        $prospectTbl    = $serviceManager->get('MelisProspects');

        $valueoptions   = [];
        foreach($prospectTbl->fetchAll() as $data){
            $valueoptions[$data->pros_id] = $data->pros_name;
        }
        return $valueoptions;
    }

}