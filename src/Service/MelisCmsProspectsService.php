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
	    
	    try 
	    {
	        $datas['pros_theme'] = !empty($datas['pros_theme']) ? $datas['pros_theme'] : null;
	        $prosId = $prospectsTable->save($datas, $prosId);
	    }
	    catch (\Exception $e)
	    {
	        echo $e->getMessage();
	    }
	    
	    return $prosId;
	}
	
	/*
	 *  Get Data for Prospects widget
	 *  widgets id:
	 *      - ID(numPropects) Number of Prospects
	 *      - ID(numPropectsMonth) Number of Prospects for the current month
	 *      - ID(numPropectsMonthAvg) Average of Prospects per month
	 *
	 * return array
	 * */
	public function getProspectsDataForWidgets($widgetId = '')
	{
	    
	    $prospectsTable = $this->getServiceLocator()->get('MelisProspects');
	    
	    $dataProspects = $prospectsTable->getProspectsOrderByDate();
	
	    $numPropects = 0;
	    $numPropectsMonth = 0;
	    $numPropectsMonthAvg = 0;
	
	    if (!empty($dataProspects))
	    {
	        $datas = $dataProspects->toArray();
	        if (!empty($datas))
	        {
	            $numPropects = count($datas);
	
	            $curMonthYear = date('m-Y'); // Current Month
	            $sumMonthProspects = 0; // Sum of the Months Prospects
	            $flagFirstDate = TRUE;
	            $firstDate = '';
	
	            for ($i = 0; $i < $numPropects; $i++)
	            {
	                $dataMonthYear = date('m-Y',strtotime($datas[$i]['pros_contact_date'])); // Get Month value from Data
	                if($dataMonthYear == $curMonthYear)
	                {
	                    $numPropectsMonth++;
	                }
	
	                if ($flagFirstDate)
	                {
	                    $firstDate = date('Y-m-d',strtotime($datas[$i]['pros_contact_date']));
	                    $flagFirstDate = FALSE; // Set False After get the First Date of Prospects
	                }
	            }
	
	            $numMonths = 0; // Number of Months
	            if ($numPropects != 0 && $firstDate != '')
	            {
	                // Variable initialization
	                $totalNum = null;
	                $test = null;
	                $flag = TRUE;
	                $currentDate = date('Y-m');
	                $tempDate = date('Y-m',strtotime($firstDate));
	                do {
	                    // check if tempDate still on range
	                    if ($tempDate<=$currentDate){
	                        // checking date is same as firstDate
	                        if(date('Y-m',strtotime($firstDate))==$tempDate){
	                            // getting value of the firstDate
	                            $totalNum += date('d',strtotime($firstDate))/date('t',strtotime($firstDate));
	                        }else{
	                            // checking if tempDate is the last date of the range
	                            if (date('Y-m')==$tempDate){
	                                // getting value of the last date of range
	                                // last date is the current date
	                                $totalNum += date('d')/date('t');
	                            }else{
	                                $totalNum++;
	                            }
	                        }
	                        // Add 1 month to set tempMonth to next month
	                        $tempDate = date('Y-m',strtotime($tempDate.' +1 months'));
	                    }else{
	                        $flag = FALSE;
	                    }
	                }while($flag);
	                //Compute Average Prospects per month
	                $numPropectsMonthAvg = $numPropects/$totalNum;
	            }
	        }
	    }
	
	    // Check and return value requested
	    switch ($widgetId) {
	        case 'numPropects':
	            return number_format($numPropects); // return total number of prospects
	            break;
	        case 'numPropectsMonth':
	            return number_format($numPropectsMonth); // return total number of prospects of the current month
	            break;
	        case 'numPropectsMonthAvg':
	            return number_format($numPropectsMonthAvg,2); // return average of the total number of prospects
	            break;
	        default:
	            return null;
	            break;
	    }
	
	}
	
	/**
	 * This method will get Prospect Data
	 * 
	 * @param string $type, this will determine what type of request
	 * @param string $date, if specified this will return only from the date to the current date
	 * @return number
	 */
	public function getProspectsDataByDate($type = 'daily', $date){
	    
	    $prospectsTable = $this->getServiceLocator()->get('MelisProspects');
	    $dataProspects = $prospectsTable->getProspectsOrderByDate('DESC');
	
	    // Set Number of Prospect to Zero as default Value
	    $nb = 0;
	
	    if (!empty($dataProspects)){
	
	        $res = $dataProspects->toArray();
	
	        if (!empty($res)){
	
	            switch ($type) {
	                case 'daily':
	                    for ($i = 0 ; $i < count($res); $i++){
	                        // Checking if Date is same as the Param data
	                        if ($date==date('Y-m-d',strtotime($res[$i]['pros_contact_date']))){
	                            $nb++;
	                        }
	                    }
	                    break;
	                case 'monthly':
	                    for ($i = 0 ; $i < count($res); $i++){
	                        // Checking if Date is same as the Param data
	                        if (date('Y-m',strtotime($date))==date('Y-m',strtotime($res[$i]['pros_contact_date']))){
	                            $nb++;
	                        }
	                    }
	                    break;
	                case 'yearly':
	                    for ($i = 0 ; $i < count($res); $i++){
	                        // Checking if Date is same as the Param data
	                        if (date('Y',strtotime($date))==date('Y',strtotime($res[$i]['pros_contact_date']))){
	                            $nb++;
	                        }
	                    }
	                    break;
	                default:
	                    break;
	            }
	        }
	    }
	
	    return $nb;
	
	}
	
	/**
	 * This method retrieves the data used for the list widget
	 * @param varchar $identifier accepts curMonth|avgMonth
	 * @return float|null , float on success, otherwise null
	 */
	public function getWidgetProspects($identifier)
	{
	    // Event parameters prepare
	    $results = null;
	     
	    // Service implementation start
	    $prospectTable = $this->getServiceLocator()->get('MelisProspects');
	    switch($identifier){
	        case 'curMonth':
	            $results = $prospectTable->getCurrentMonth()->count(); break;
	        case 'avgMonth':
	            
	            $minDate = $prospectTable->getProspectsOrderByDate('ASC')->current();
	            $maxDate = $prospectTable->getProspectsOrderByDate('DESC')->current();
	            $minDate = ($minDate) ? strtotime($minDate->pros_contact_date) : 0;	           
	            $maxDate = ($maxDate) ? strtotime($maxDate->pros_contact_date) : 0;
	            $days = ceil(abs($minDate - time()) / 86400); // get days difference
	            $months = intval($days/30);      
	            $results = $prospectTable->getAvgMonth($months)->current(); break;
	        default:
	            break;
	    }
	    // Service implementation end
	     
	    return $results;
	}

}