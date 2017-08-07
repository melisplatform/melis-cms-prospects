<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCmsProspects\Model\Tables\Factory;

use Zend\ServiceManager\ServiceLocatorInterface;
use Zend\ServiceManager\FactoryInterface;
use Zend\Db\ResultSet\HydratingResultSet;
use Zend\Db\TableGateway\TableGateway;
use Zend\Stdlib\Hydrator\ObjectProperty;

use MelisCmsProspects\Model\MelisCmsProspectsTheme;
use MelisCmsProspects\Model\Tables\MelisCmsProspectsThemeTable;

class MelisCmsProspectsThemeTableFactory implements FactoryInterface
{
    public function createService(ServiceLocatorInterface $sl)
    {
        $hydratingResultSet = new HydratingResultSet(new ObjectProperty(), new MelisCmsProspectsTheme());
        $tableGateway = new TableGateway('melis_cms_prospects_themes', $sl->get('Zend\Db\Adapter\Adapter'), null, $hydratingResultSet);

        return new MelisCmsProspectsThemeTable($tableGateway);
    }

}