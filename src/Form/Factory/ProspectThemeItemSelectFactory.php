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
use Zend\ServiceManager\FactoryInterface;
/**
 * Prospect theme select factory
 */
class ProspectThemeItemSelectFactory extends Select implements FactoryInterface
{
    public function createService(ServiceLocatorInterface $formElementManager)
    {
        return $this;
    }

    public function loadValueOptions($data, $exludeThemName = false)
    {
        if(!empty($data)) {

            $valueoptions = array();
            foreach($data as $idx => $item) {
                switch(gettype($item)) {
                    case 'object':
                        $text = $item->item_trans_text;
                        if(!$exludeThemName){
                            $text = $item->pros_theme_name . ' / ' .$text;
                        }
                        $valueoptions[$item->pros_theme_item_id] = $text;
                    break;
                    case 'array':
                        $valueoptions[$item['pros_theme_item_id']] = $item['pros_theme_name'];
                    break;
                }

            }
            $this->setValueOptions($valueoptions);
        }
    }




}