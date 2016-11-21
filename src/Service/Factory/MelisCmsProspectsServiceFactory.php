<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCmsProspects\Service\Factory;

use Zend\ServiceManager\ServiceLocatorInterface;
use Zend\ServiceManager\FactoryInterface;
use MelisCmsProspects\Service\MelisCmsProspectsService;

class MelisCmsProspectsServiceFactory implements FactoryInterface
{
	public function createService(ServiceLocatorInterface $sl)
	{ 
	    $melisCmsProspects = new MelisCmsProspectsService();
	    $melisCmsProspects->setServiceLocator($sl);
	    return $melisCmsProspects;
	}

}