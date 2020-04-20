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

class MelisCmsProspectsThemeTable extends MelisGenericTable
{
    /**
     * Table name
     */
    const TABLE = 'melis_cms_prospects_themes';
    /**
     * Primary key
     */
    const PRIMARY_KEY = 'pros_theme_id';

    public function __construct()
    {
        $this->idField = self::PRIMARY_KEY;
    }

    public function getData($search = '', $searchableColumns = [], $orderBy = '', $orderDirection = 'ASC', $start = 0, $limit = null)
    {
        $select = $this->tableGateway->getSql()->select();
        $select->columns(array('*'));


        if(!empty($searchableColumns) && !empty($search)) {
            foreach($searchableColumns as $column) {
                $select->where->or->like($column, '%'.$search.'%');
            }
        }

        if(!empty($orderBy)) {
            $select->order($orderBy . ' ' . $orderDirection);
        }

        $getCount = $this->tableGateway->selectWith($select);
        // set current data count for pagination
        $this->setCurrentDataCount((int) $getCount->count());

        if(!empty($limit)) {
            $select->limit($limit);
        }

        if(!empty($start)) {
            $select->offset($start);
        }

        $resultSet = $this->tableGateway->selectWith($select);
        return $resultSet;
    }

    public function getItemsByCode($code, $langId)
    {
        $select = $this->tableGateway->getSql()->select();
        $select->columns(array('*'));

        $select->join('melis_cms_prospects_theme_items', 'melis_cms_prospects_theme_items.pros_theme_id = melis_cms_prospects_themes.pros_theme_id', ['*'], $select::JOIN_LEFT);
        $select->where->equalTo('melis_cms_prospects_themes.pros_theme_code', $code)->and->equalTo('melis_cms_prospects_theme_items.pros_theme_item_lang_id', $langId);

        $resultSet = $this->tableGateway->selectWith($select);

        return $resultSet;
    }

}