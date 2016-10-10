<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCmsProspects\Model\Tables;

use MelisEngine\Model\Tables\MelisGenericTable;
use Zend\Db\TableGateway\TableGateway;

class MelisProspectTable extends MelisGenericTable 
{
    protected $tableGateway;
    protected $idField;
    
    public function __construct(TableGateway $tableGateway)
    {
        parent::__construct($tableGateway);
        $this->idField = 'pros_id';
    }
    
    /**
     * Gets the number of prospect per day 
     * 
     * @param int $maxDays How many past days you want
     * @return NULL|\Zend\Db\ResultSet\ResultSetInterface
     */
    public function getNumberProspectsPerDay($maxDays = 30)
    {
    	$select = $this->tableGateway->getSql()->select();
    
    	$select->columns(array(new \Zend\Db\Sql\Expression('COUNT("pros_id") AS nb'), "pros_contact_date"));
    	$select->group("pros_contact_date");
    	$select->limit($maxDays);
    	
    	$resultSet = $this->tableGateway->selectWith($select);
    
    	return $resultSet;
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
        $select = $this->tableGateway->getSql()->select();
    	$select->order('pros_contact_date');
    	
    	$dataProspects = $this->tableGateway->selectWith($select);
        
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
    
    public function getProspectsDataByDate($type = 'daily', $date){
        
        $select = $this->tableGateway->getSql()->select();
        $select->order('pros_contact_date DESC');
        $resultSet = $this->tableGateway->selectWith($select);
        
        // Set Number of Prospect to Zero as default Value
        $nb = 0;
        
        if (!empty($resultSet)){
            
            $res = $resultSet->toArray();
            
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
    
    /* 
     * Retrieving Rencent Prospects
     * return array
     * 
     * */
    public function getDashboardRecentProspectData(){
        $select = $this->tableGateway->getSql()->select();
        $select->order('pros_id DESC');
        $select->limit(5);
        $dataProspects = $this->tableGateway->selectWith($select);
        
        return $dataProspects;
    }
}