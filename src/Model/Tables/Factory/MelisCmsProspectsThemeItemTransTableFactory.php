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

use MelisCmsProspects\Model\MelisCmsProspectsThemeItemTrans;
use MelisCmsProspects\Model\Tables\MelisCmsProspectsThemeItemTransTable;

class MelisCmsProspectsThemeItemTransTableFactory implements FactoryInterface
{
	public function createService(ServiceLocatorInterface $sl)
	{
    	$hydratingResultSet = new HydratingResultSet(new ObjectProperty(), new MelisCmsProspectsThemeItemTrans());
    	$tableGateway = new TableGateway('melis_cms_prospects_theme_items_trans', $sl->get('Zend\Db\Adapter\Adapter'), null, $hydratingResultSet);
		
    	return new MelisCmsProspectsThemeItemTransTable($tableGateway);
	}

}