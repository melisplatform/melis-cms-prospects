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

class MelisCmsProspectsThemeItemTransTable extends MelisGenericTable 
{
    /**
     * Table name
     */
    const TABLE = 'melis_cms_prospects_theme_items_trans';
    /**
     * Primary key
     */
    const PRIMARY_KEY = 'item_trans_id';

    public function __construct()
    {
        $this->idField = self::PRIMARY_KEY;
    }
    
    public function checkForDuplicates($itemId, $text, $lang){
        
        $select = $this->tableGateway->getSql()->select();
        
        $select->where->notEqualTo('item_trans_theme_item_id', $itemId);
        
        $select->where->equalTo('item_trans_text', $text);
        
        $select->where->equalTo('item_trans_lang_id', $lang);
        
        return $this->tableGateway->selectWith($select);
    }
}