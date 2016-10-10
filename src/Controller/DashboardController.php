<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCmsProspects\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;
use Zend\View\Model\JsonModel;
use Zend\Session\Container;

/**
 * Dashboard controller for MelisProspects
 * 
 * Used to render dashboard components in MelisPlatform Back Office
 *
 */
class DashboardController extends AbstractActionController
{
    /**
     * Generate the prospects dashboard entry
     */
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

	/**
	 * Returns JSon datas for the graphs on the dashboard
	 */
	public function getDashboardStatsAction()
	{
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
