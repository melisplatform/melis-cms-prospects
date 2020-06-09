<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCmsProspects\Form\Factory;

use Interop\Container\ContainerInterface;
use Laminas\Form\Element\Select;
use Laminas\ServiceManager\FactoryInterface;

/**
 * Prospect theme select factory
 */
class ProspectThemeItemSelectFactory extends Select
{
    /**
     * @param ContainerInterface $container
     * @param string $requestedName
     * @return $this|object
     */
    public function __invoke(ContainerInterface $container, $requestedName)
    {
        return $this;
    }

    /**
     * @param $data
     * @param bool $exludeThemName
     */
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