<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCmsProspects;

use Zend\Mvc\ModuleRouteListener;
use Zend\Mvc\MvcEvent;
use Zend\ModuleManager\ModuleManager;
use Zend\Db\TableGateway\TableGateway;
use Zend\Stdlib\Hydrator\ObjectProperty;
use Zend\Db\ResultSet\HydratingResultSet;
use Zend\Stdlib\ArrayUtils;
use Zend\Session\Container;
use MelisCmsProspects\Model\MelisProspects;
use MelisCmsProspects\Model\Tables\MelisProspectTable;
use MelisCmsProspects\Listener\MelisCmsProspectFlashMessengerListener;

class Module
{
    public function onBootstrap(MvcEvent $e)
    {
        $eventManager        = $e->getApplication()->getEventManager();
        $moduleRouteListener = new ModuleRouteListener();
        $moduleRouteListener->attach($eventManager);
        
        $sm = $e->getApplication()->getServiceManager();
        $routeMatch = $sm->get('router')->match($sm->get('request'));
        
        if (!empty($routeMatch))
        {
            $routeName = $routeMatch->getMatchedRouteName();
            $module = explode('/', $routeName);
            
            if (!empty($module[0]))
	        {
		        if (!in_array($module[0], array('melis-front')))
		        {
                    $this->createTranslations($e);
                    $eventManager->attach(new MelisCmsProspectFlashMessengerListener());
		        }
	        }
        }
    }
    
    public function init(ModuleManager $manager)
    {
    }

    public function getConfig()
    {
    	$config = array();
    	$configFiles = array(
			include __DIR__ . '/../config/module.config.php',
			include __DIR__ . '/../config/app.interface.php',
			include __DIR__ . '/../config/diagnostic.config.php',
    	    include __DIR__ . '/../config/app.tools.php',
    	);
    	
    	foreach ($configFiles as $file) {
    		$config = ArrayUtils::merge($config, $file);
    	} 
    	
    	return $config;
    }
    
    public function createTranslations($e)
    {
        $sm = $e->getApplication()->getServiceManager();
        $translator = $sm->get('translator');
    
        $container = new Container('meliscore');
        $locale = $container['melis-lang-locale'];
    
        $translator->addTranslationFile('phparray', __DIR__ . '/../language/' . $locale . '.interface.php');
    }
    
    public function getServiceConfig()
    {
        return array(
			'factories' => array(
			    'MelisCmsProspects\Service\MelisCmsProspectsService' =>  function($sm) {
    			    $melisCmsProspects = new \MelisCmsProspects\Service\MelisCmsProspectsService();
    			    $melisCmsProspects->setServiceLocator($sm);
    			    return $melisCmsProspects;
			    },
				'MelisCmsProspects\Model\Tables\MelisProspectTable' =>  function($sm) {
					return new MelisProspectTable($sm->get('MelisProspectGateway'));
				},
			    'MelisProspectGateway' => function($sm) {
			         $hydratingResultSet = new HydratingResultSet(new ObjectProperty(), new MelisProspects());
			         return new TableGateway('melis_cms_prospects', $sm->get('Zend\Db\Adapter\Adapter'), null, $hydratingResultSet);
			    },
			),
        );
    }
 
}
