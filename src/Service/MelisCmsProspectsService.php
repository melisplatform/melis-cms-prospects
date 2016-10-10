<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCmsProspects\Service;

use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorInterface;

/**
 * This service is made for dealing with prospects
 *
 */
class MelisCmsProspectsService implements MelisCmsProspectsServiceInterface, ServiceLocatorAwareInterface
{
	protected $serviceLocator;
	
	public function setServiceLocator(ServiceLocatorInterface $sl)
	{
		$this->serviceLocator = $sl;
		return $this;
	}
	
	public function getServiceLocator()
	{
		return $this->serviceLocator;
	}	
	
	/**
	 * Save a prospect in the database
	 * 
	 * @param array $datas The datas to be saved
	 * @param int $prosId The id of the prospect in case of update
	 * 
	 */
	public function saveProspectsDatas($datas, $prosId = null){
	    
	    $prospectsTable = $this->getServiceLocator()->get('MelisProspects');
	    
	    if ($prosId != null)
	    {
	        $prosId = $prospectsTable->save($datas);
	    }
	    else
	    {
	        $prospectsTable->save($datas, $prosId);
	    }
	    
	    return $prosId;
	}

}