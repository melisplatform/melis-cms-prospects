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
    
    public function getCurrentMonth()
    {
        $select = $this->tableGateway->getSql()->select();
        $select->where('YEAR(pros_contact_date) = YEAR(CURRENT_DATE())');
        $select->where('MONTH(pros_contact_date) = MONTH(CURRENT_DATE())');
    
        $resultData = $this->tableGateway->selectWith($select);
        return $resultData;
    }
    
    public function getAvgMonth($months)
    {        
        $sql = "SELECT sum(`monthly`)/$months AS average FROM (SELECT COUNT(*) as `monthly` from melis_cms_prospects group by YEAR(`pros_contact_date`), MONTH(`pros_contact_date`)) AS average";

        $resultData = $this->tableGateway->getAdapter()->driver->getConnection()->execute($sql);
    
        return $resultData;
    }

    public function getData($search = '', $prosSiteId = null,  $searchableColumns = [], $orderBy = '', $orderDirection = 'ASC', $start = 0, $limit = null)
    {
        $select = $this->tableGateway->getSql()->select();
        $select->columns(array('*'));
        $select->join('melis_cms_site', 'melis_cms_site.site_id = melis_cms_prospects.pros_site_id',
            array('site_name'), $select::JOIN_LEFT);

        if(!empty($searchableColumns) && !empty($search)) {
            foreach($searchableColumns as $column) {
                $select->where->or->like($column, '%'.$search.'%');
            }
        }

        if(!empty($prosSiteId) && !is_null($prosSiteId)){
            $select->where->equalTo("pros_site_id", $prosSiteId);
        }

        if(!empty($orderBy)) {
            $select->order($orderBy . ' ' . $orderDirection);
        }

        $getCount = $this->tableGateway->selectWith($select);
        // set current data count for pagination
        $this->setCurrentDataCount((int) $getCount->count());

        if(!empty($limit)) {
            $select->limit( (int) $limit);
        }

        if(!empty($start)) {
            $select->offset( (int) $start);
        }

        $resultSet = $this->tableGateway->selectWith($select);
        return $resultSet;
    }

}