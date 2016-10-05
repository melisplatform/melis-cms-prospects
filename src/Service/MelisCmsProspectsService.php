<?php

namespace MelisCmsProspects\Service;

use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorInterface;
// use MelisEngine\Model\MelisPage;

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
	
	public function saveProspectsDatas($datas, $prosId = null){
	    
	    $prospectsTable = $this->getServiceLocator()->get('MelisProspects');
	    
	    if ($prosId!=null){
	        $prosId = $prospectsTable->save($datas);
	    }else{
	        $prospectsTable->save($datas, $prosId);
	    }
	    return $prosId;
	}

}