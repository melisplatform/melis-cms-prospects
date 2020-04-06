<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCmsProspects\Service\Factory;

use MelisCmsProspects\Service\MelisCmsProspectsGdprAutoDeleteService;
use Zend\ServiceManager\ServiceLocatorInterface;
use Zend\ServiceManager\FactoryInterface;

class MelisCmsProspectsGdprAutoDeleteServiceFactory implements FactoryInterface
{
	public function createService(ServiceLocatorInterface $sl)
	{ 
	    $melisCmsProspects = new MelisCmsProspectsGdprAutoDeleteService();
	    $melisCmsProspects->setServiceLocator($sl);
	    return $melisCmsProspects;
	}

}