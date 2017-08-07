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

class MelisCmsProspectsThemeItemTransTable extends MelisGenericTable 
{
    protected $tableGateway;
    protected $idField;
    
    public function __construct(TableGateway $tableGateway)
    {
        parent::__construct($tableGateway);
        $this->idField = 'item_trans_id';
    }
    
    public function checkForDuplicates($itemId, $text, $lang){
        
        $select = $this->tableGateway->getSql()->select();
        
        $select->where->notEqualTo('item_trans_theme_item_id', $itemId);
        
        $select->where->equalTo('item_trans_text', $text);
        
        $select->where->equalTo('item_trans_lang_id', $lang);
        
        return $this->tableGateway->selectWith($select);
    }
}