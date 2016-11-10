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
    
    public function getProspectsOrderByDate($order = 'ASC')
    {
        $select = $this->tableGateway->getSql()->select();
        $select->order(array('pros_contact_date' => $order));
        
        $resultSet = $this->tableGateway->selectWith($select);
        return $resultSet;
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