<?php
/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 * 
 */

namespace MelisCmsProspects\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;
use Zend\View\Model\JsonModel;
use Zend\Session\Container;
/**
 * Page Historic Plugin
 */
class DashboardController extends AbstractActionController
{
	public function dashboardStatisticsAction()
	{
		$melisKey = $this->params()->fromRoute('melisKey', '');
		
		$melisProspects = $this->serviceLocator->get('MelisProspects');
		$melisTool = $this->getServiceLocator()->get('MelisCoreTool');
		// Get Total number Prospects
		$numPropects = $melisProspects->getProspectsDataForWidgets('numPropects');
		// Get Total Recent Prospects
		$recentPropects = $melisProspects->getDashboardRecentProspectData(5)->toArray();
		$prosData = $recentPropects;
        for($x = 0; $x < count($prosData); $x++) {
                foreach($prosData[$x] as $vKey => $vValue)
                {
                    $prosData[$x][$vKey] = $melisTool->limitedText($vValue);
                }
        }
		// Get Current Language
		$container = new Container('meliscore');
		$locale = $container['melis-lang-locale'];
		$dateFormat = ($locale=='en_EN') ? 'm/d/Y' : 'd/m/Y';
		$view = new ViewModel();
		$view->melisKey = $melisKey;
		$view->numPropects = $numPropects;
		$view->recentPropects = (!empty($prosData)) ? $prosData : array();
		$view->dateFormat = $dateFormat;
		
		return $view;
	}


// 	public function getStatsValuesAction()
// 	{
	    
// 	    $chartFor = get_object_vars($this->getRequest()->getPost());
	    
// 	    $chartFor = $chartFor['chartFor'];
	    
// 		$limit = 10;
// 		$success = 1;
// 		$values = array();
				
// 		$prospectTable = $this->getServiceLocator()->get('MelisProspects');
// 		$prospects = $prospectTable->getNumberProspectsPerDay($limit);
// 		if ($prospects)
// 		{
// 			$prospects = $prospects->toArray();
			
// 			$todayStart = mktime(0, 0, 0, date('m'), date('d'), date('Y'));
// 			$todayEnd = mktime(23, 59, 59, date('m'), date('d'), date('Y'));
			
// 			for ($cpt = 0; $cpt < $limit; $cpt++)
// 			{
// 				$num = 0;
// 				$todayStart -= 60*60*24;
// 				$todayEnd -= 60*60*24;
// 				foreach ($prospects as $prospect)
// 				{
// 					$timeProspects = strtotime($prospect['pros_contact_date']);
// 					if ($timeProspects >= $todayStart && $timeProspects <= $todayEnd)
// 					{
// 						$num = $prospect['nb'];
// 						break;
// 					}	
// 				}
				
// 				$values[] = array($todayStart * 1000, $num);
// 			}
// 		}
		
// 		return new JsonModel(array(
// 		    'chartFor' => $chartFor,
//     		'success' => $success,
//     		'values' => $values,
//     	));
// 	}
	
	public function getDashboardStatsAction(){
	    // Get Post DataString

	    
	    // Graph Range X-Axis Limit to this value
		$limit = 10;
		$success = 1;
		// Values hanler
		$values = array();
		
		if($this->getRequest()->isPost()) {
		    
		    $chartFor = get_object_vars($this->getRequest()->getPost());
		    $chartFor = isset($chartFor['chartFor']) ? $chartFor['chartFor'] : 'monthly';
		    
		    $prospectTable = $this->getServiceLocator()->get('MelisProspects');
		    
		    // Last Date/value of the Graph will be the Current Date
		    $curdate = date('Y-m-d');
		    for ($ctr = $limit ; $ctr > 0 ;$ctr--)
		    {
		        // Retreve Prospects Values from database
		        $nb = $prospectTable->getProspectsDataByDate($chartFor,$curdate);
		    
		        // Checking type of report
		        switch ($chartFor) {
		            case 'daily':
		                $values[] = array(strtotime($curdate) * 1000, $nb);
		                // Deduct 1 Day every loop
		                $curdate = date('Y-m-d',strtotime($curdate.' -1 days'));
		                break;
		            case 'monthly':
		                $values[] = array(strtotime($curdate)* 1000, $nb);
		                // Deduct 1 Month every loop
		                $curdate = date('Y-m-d',strtotime($curdate.' -1 months'));
		                break;
		            case 'yearly':
		                $values[] = array(strtotime($curdate)* 1000, $nb);
		                // Deduct 1 Year every loop
		                $curdate = date('Y-m-d',strtotime($curdate.' -1 years'));
		                break;
		            default:
		                # code...
		                break;
		        }
		    }
		}
				

	    
		return new JsonModel(array(
		    'date' => date('Y-m-d'),
		    'success' => $success,
		    'values' => $values,
		));
		
	}
}
