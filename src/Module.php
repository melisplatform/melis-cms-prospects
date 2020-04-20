<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCmsProspects;

use Laminas\Mvc\ModuleRouteListener;
use Laminas\Mvc\MvcEvent;
use Laminas\ModuleManager\ModuleManager;
use Laminas\Db\TableGateway\TableGateway;
use Laminas\Stdlib\Hydrator\ObjectProperty;
use Laminas\Db\ResultSet\HydratingResultSet;
use Laminas\Stdlib\ArrayUtils;
use Laminas\Session\Container;
use MelisCmsProspects\Model\MelisProspects;
use MelisCmsProspects\Model\Tables\MelisProspectTable;
use MelisCmsProspects\Listener\MelisCmsProspectFlashMessengerListener;
use MelisCmsProspects\Listener\MelisCmsProspectsGdprUserInfoListener;
use MelisCmsProspects\Listener\MelisCmsProspectsGdprUserExtractListener;
use MelisCmsProspects\Listener\MelisCmsProspectsGdprUserDeleteListener;
use MelisCmsProspects\Listener\MelisCmsProspectsTableColumnDisplayListener;
use MelisCmsProspects\Listener\MelisCmsProspectsToolCreatorEditionTypeListener;
use Laminas\Mvc\Router\Http\RouteMatch;
/**
 * Class Module
 * @package MelisCmsProspects
 * @require melis-core|melis-cms
 */
class Module
{
    public function onBootstrap(MvcEvent $e)
    {
        $eventManager        = $e->getApplication()->getEventManager();
        $moduleRouteListener = new ModuleRouteListener();
        $moduleRouteListener->attach($eventManager);

        $moduleName = null;
        
        $sm = $e->getApplication()->getServiceManager();
        $routeMatch = $sm->get('router')->match($sm->get('request'));
        
        if (!empty($routeMatch))
        {
            $this->createTranslations($e, $routeMatch);
            
            $routeName = $routeMatch->getMatchedRouteName();
            $moduleName = explode('/', $routeName);
            
            if (!empty($moduleName[0]))
	        {

		        if ($moduleName[0] == 'melis-backoffice')
		        {
                    (new MelisCmsProspectFlashMessengerListener())->attach($eventManager);
                    (new MelisCmsProspectsGdprUserInfoListener())->attach($eventManager);
                    (new MelisCmsProspectsGdprUserExtractListener())->attach($eventManager);
                    (new MelisCmsProspectsGdprUserDeleteListener())->attach($eventManager);
                    (new MelisCmsProspectsToolCreatorEditionTypeListener())->attach($eventManager);
                    (new MelisCmsProspectsTableColumnDisplayListener())->attach($eventManager);
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

    	    // interface design Melis
			include __DIR__ . '/../config/app.interface.php',
    	    include __DIR__ . '/../config/app.tools.php',
    	    include __DIR__ . '/../config/app.microservice.php',
    	    
    	    // Tests
			include __DIR__ . '/../config/diagnostic.config.php',
    	    
    	    // Templating plugins
    	    include __DIR__ . '/../config/plugins/MelisCmsProspectsShowFormPlugin.config.php',
    	    
    	    include __DIR__ . '/../config/dashboard-plugins/MelisCmsProspectsStatisticsPlugin.config.php',

            //gdpr
            include __DIR__ . '/../config/app.gdpr.php'
    	);
    	
    	foreach ($configFiles as $file) {
    		$config = ArrayUtils::merge($config, $file);
    	} 
    	
    	return $config;
    }

    public function getAutoloaderConfig()
    {
        return array(
            'Laminas\Loader\StandardAutoloader' => array(
                'namespaces' => array(
                    __NAMESPACE__ => __DIR__ . '/src/' . __NAMESPACE__,
                ),
            ),
        );
    }
    
    public function createTranslations($e, $routeMatch)
    {
        $param = $routeMatch->getParams();
        // Checking if the Request is from Melis-BackOffice or Front
        $renderMode = (isset($param['renderMode'])) ? $param['renderMode'] : 'melis';
        if ($renderMode == 'melis')
        {
            $container = new Container('meliscore');
            $locale = $container['melis-lang-locale'];
        }
        else
        {
            $container = new Container('melisplugins');
            $locale = $container['melis-plugins-lang-locale'];
        }
        
        if (!empty($locale))
        {
            $sm = $e->getApplication()->getServiceManager();
            $translator = $sm->get('translator');
            
            $translationType = array(
                'interface',
            );
            	
            $translationList = array();
            if(file_exists($_SERVER['DOCUMENT_ROOT'].'/../module/MelisModuleConfig/config/translation.list.php')){
                $translationList = include 'module/MelisModuleConfig/config/translation.list.php';
            }

            foreach($translationType as $type){
                
                $transPath = '';
                $moduleTrans = __NAMESPACE__."/$locale.$type.php";
                
                if(in_array($moduleTrans, $translationList)){
                    $transPath = "module/MelisModuleConfig/languages/".$moduleTrans;
                }

                if(empty($transPath)){
                    
                    // if translation is not found, use melis default translations
                    $defaultLocale = (file_exists(__DIR__ . "/../language/$locale.$type.php"))? $locale : "en_EN";
                    $transPath = __DIR__ . "/../language/$defaultLocale.$type.php";
                }
                
                $translator->addTranslationFile('phparray', $transPath);
            }
        }
    }
}
