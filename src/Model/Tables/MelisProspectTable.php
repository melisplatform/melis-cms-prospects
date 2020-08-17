<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCmsProspects\Model\Tables;

use MelisEngine\Model\Tables\MelisGenericTable;
use Laminas\Db\TableGateway\TableGateway;
use Laminas\Db\Metadata\Metadata;

class MelisProspectTable extends MelisGenericTable 
{
    /**
     * Table name
     */
    const TABLE = 'melis_cms_prospects';
    /**
     * Primary key
     */
    const PRIMARY_KEY = 'pros_id';

    public function __construct()
    {
        $this->idField = self::PRIMARY_KEY;
    }
    
    /**
     * Gets the number of prospect per day 
     * 
     * @param int $maxDays How many past days you want
     * @return NULL|\Laminas\Db\ResultSet\ResultSetInterface
     */
    public function getNumberProspectsPerDay($maxDays = 30)
    {
    	$select = $this->tableGateway->getSql()->select();

    	$select->columns(array(new \Laminas\Db\Sql\Expression('COUNT("pros_id") AS nb'), "pros_contact_date"));
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

    public function getData($search = '', $prosSiteId = null,  $searchableColumns = [], $orderBy = '', $orderDirection = 'ASC', $start = 0, $limit = null, $prosType = null, $startDate = null, $endDate = null)
    {
        $select = $this->tableGateway->getSql()->select();
        $select->columns(array('*'));
        $select->join('melis_cms_site', 'melis_cms_site.site_id = melis_cms_prospects.pros_site_id',
            array('site_name','site_label'), $select::JOIN_LEFT);

        if (!empty($searchableColumns) && !empty($search)) {
            $nest = $select->where->nest();

            foreach ($searchableColumns as $column) {
                if (!empty($search) && is_array($search)) {
                    $moreThanOneInput = true;
                    foreach ($search as $searchItem) {
                        if ($searchItem != '') {
                            if ($moreThanOneInput) {
                                $nest->like($column, '%' . $searchItem . '%');
                                $moreThanOneInput = false;
                            } else
                                $nest->or->like($column, '%' . $searchItem . '%');
                        }
                    }
                } else {
                    $nest->or->like($column, '%' . $search . '%');
                }
            }
        }

        if (!empty($prosSiteId) && !is_null($prosSiteId)) {
            $select->where->equalTo("melis_cms_prospects.pros_site_id", $prosSiteId);
        }

        if(!empty($prosType) && !is_null($prosType)){
            $select->where->equalTo("melis_cms_prospects.pros_type", $prosType);
        }

//        if(!empty($startDate) && !empty($endDate)){
//            $select->where->between('melis_cms_prospects.pros_contact_date', date('Y-m-d', strtotime($startDate)), date('Y-m-d', strtotime($endDate)));
//        }

        if(!empty($orderBy)) {
            $select->order($orderBy . ' ' . $orderDirection);
        }

        /**
         *  Applying Start Date & End Date filters
         */
         if (!empty($startDate) && !empty($endDate)) {
            //select entries >= startDate && <= endDate
            $select->where->nest()->greaterThanOrEqualTo('pros_contact_date', date_format(date_create($startDate), "Y-m-d H:i:s"))
                ->and->lessThanOrEqualTo('pros_contact_date', date_format(date_create($endDate . '23:59:59'), "Y-m-d H:i:s"))
                ->unnest();
        }

        $getCount = $this->tableGateway->selectWith($select);
        // set current data count for pagination
        $this->setCurrentDataCount((int)$getCount->count());

        if (!empty($limit)) {
            $select->limit((int)$limit);
        }

        if (!empty($start)) {
            $select->offset((int)$start);
        }

        $resultSet = $this->tableGateway->selectWith($select);

        return $resultSet;
    }

    /**
     * Returns needed data for the gdpr tool
     * @param array $searchInputs
     * @param bool $isSpecificSearch
     * @return mixed
     */
    public function getDataForGdpr($searchInputs = [], $isSpecificSearch = false)
    {
        $select = $this->tableGateway->getSql()->select();
        $select->columns(['*']);
        $select->join(
            'melis_cms_site', 
            'melis_cms_site.site_id = melis_cms_prospects.pros_site_id',
            ['site_label'],
            $select::JOIN_LEFT
        );

        if (!empty($searchInputs)) {
            if (!empty($searchInputs['user_name'])) {
                if ($isSpecificSearch)
                    $select->where->literal('LOWER(' . 'pros_name' . ') = ' . "'" . strtolower($searchInputs['user_name']) . "'");
                else
                    $select->where->literal('LOWER(' . 'pros_name' . ') LIKE ' . "'%" . strtolower($searchInputs['user_name']) . "%'");
            }

            if (!empty($searchInputs['user_email']))
                $select->where->literal('LOWER(' . 'pros_email' . ') = ' . "'" . strtolower($searchInputs['user_email']) . "'");

            if (!empty($searchInputs['site_id']))
                $select->where->literal('LOWER(' . 'pros_site_id' . ') = ' . "'" . strtolower($searchInputs['site_id']) . "'");
        }

        $resultSet = $this->tableGateway->selectWith($select);
        return $resultSet;
    }
}