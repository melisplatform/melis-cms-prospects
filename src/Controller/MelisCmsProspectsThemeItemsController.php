<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCmsProspects\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\Session\Container;
use Zend\View\Model\JsonModel;
use Zend\View\Model\ViewModel;

/**
 * This controller handles the display of the Prospect Theme Item Tool
 */
class MelisCmsProspectsThemeItemsController extends AbstractActionController
{
    const LOG_ADD = 'CMS_PROSPECTS_THEME_ITEM_ADD';
    const LOG_UPDATE = 'CMS_PROSPECTS_THEME_ITEM_UPDATE';
    const LOG_DELETE = 'CMS_PROSPECTS_THEME_ITEM_DELETE';

    /**
     * Tool container
     * @return ViewModel
     */
    public function toolContainerAction()
    {
        return new ViewModel([
            'melisKey' => $this->getMelisKey(),
            'theme'    => $this->getTheme()
        ]);
    }

    /**
     * Header section
     * @return ViewModel
     */
    public function toolHeaderAction()
    {
        return new ViewModel([
            'melisKey' => $this->getMelisKey(),
            'theme'    => $this->getTheme()
        ]);
    }

    /**
     * Header | add button
     * @return ViewModel
     */
    public function toolHeaderAddAction()
    {
        return new ViewModel();
    }

    /**
     * Tool content
     * @return ViewModel
     */
    public function toolContentAction()
    {
        $translator = $this->getServiceLocator()->get('translator');

        $container = new Container('meliscore');
        $locale    = $container['melis-lang-locale'];

        $columns            = $this->tool()->getColumns();
        $columns['actions'] = array('text' => $translator->translate('tr_meliscore_global_action'), 'width' => '20%');

        $theme   = $this->getTheme();
        $themeId = isset($theme->pros_theme_id) ? (int) $theme->pros_theme_id : null;
        $view    = new ViewModel();
        $view->melisKey               = $this->getMelisKey();
        $view->tableColumns           = $columns;
        $view->getToolDataTableConfig = $this->tool()->getDataTableConfiguration('#' . $themeId . '_tableToolProspectsThemeItems', true, false, array('order' => '[[ 0, "desc" ]]'));
        $view->theme = $theme;

        return $view;
    }

    /**
     * Modal container
     * @return ViewModel
     */
    public function toolModalContainerAction()
    {
        $id = $this->params()->fromRoute('id', $this->params()->fromQuery('id', ''));

        $melisKey = $this->getMelisKey();

        $view = new ViewModel();
        $view->setTerminal(false);
        $view->melisKey = $melisKey;
        $view->id = $id;

        return $view;
    }

    /**
     * Modal content
     * @return ViewModel
     */
    public function toolModalContentAction()
    {
        $id       = (int)$this->params()->fromRoute('id', $this->params()->fromQuery('id', ''));
        $melisKey = $this->params()->fromRoute('melisKey', '');
        $title    = $this->tool()->getTranslation('tr_melis_cms_prospects_theme_items_edit_title');
        $data     = array();
        $themeItemId  = (int)$this->params()->fromQuery('itemId', null);

        $code = $this->params()->fromQuery('code', null);
        $form = $this->getThemeItemForm();
        
        if($themeItemId)
        $data = $this->themeItemTable()->getItemById($themeItemId)->toArray();

        $langTable = $this->getServiceLocator()->get('MelisEngineTableCmsLang');
        $languages = $langTable->fetchAll()->toArray();

        $tmpData = array();

        $view            = new ViewModel();
        $view->melisKey  = $melisKey;
        $view->title     = $title;
        $view->form      = $form;
        $view->data      = $data;
        $view->languages = $languages;
        $view->itemId    = $themeItemId;
        return $view;
    }

    /**
     * Modal container for theme code form
     * @return ViewModel
     */
    public function toolModalCodeContainerAction()
    {
        $id = $this->params()->fromRoute('id', $this->params()->fromQuery('id', ''));

        $melisKey = $this->getMelisKey();

        $view = new ViewModel();
        $view->setTerminal(false);
        $view->melisKey = $melisKey;
        $view->id = $id;

        return $view;
    }

    /**
     * Saving method for theme items
     * @return JsonModel
     */
    public function saveItemAction()
    {
        $success = 0;
        $message = 'tr_melis_cms_prospects_theme_items_save_failed';
        $errors = [];
        $title = 'tr_melis_cms_prospects_theme_items';
        $request = $this->getRequest();
        $itemId = 0;
        $logType = self::LOG_ADD;
        $inputValidator = 0;

        if ($request->isPost()) {
            $forms = $this->tool()->sanitizeRecursive($request->getPost()->toArray(), ["'", '"'], false);
            $themeId = $forms['themeId'];

            if (isset($forms['forms']) && !empty($forms['forms'])) {
                foreach ($forms['forms'] as $idx => $form) {
                    //check for existing item id
                    $itemId = empty($itemId) ? (int)$form['item_trans_theme_item_id'] : $itemId;
                    $itemTexts = empty($itemTexts) ? $form['item_trans_text'] : $itemTexts;

                    //check if is there an input
                    if (!empty($form['item_trans_text']) || $form['item_trans_text'] != "") {
                        $inputValidator++;
                    }
                }

                if (!empty($itemId)) {
                    $logType = self::LOG_UPDATE;
                }

                if ($inputValidator) {
                    // create if item ID is empty
                    if (empty($itemId) && !empty($itemTexts)) {
                        $itemId = $this->themeItemTable()->save(array('pros_theme_id' => $themeId));
                    }

                    foreach ($forms['forms'] as $idx => $form) {
                        $transId = isset($form['item_trans_id']) ? (int)$form['item_trans_id'] : null;
                        $text = $form['item_trans_text'];

                        if (!empty($transId) && empty($text)) {
                            // delete the entry if it is blank
                            $this->themeItemTransTable()->deleteById($transId);
                        }

                        if (!empty($itemId) && !empty($text)) {
                            $form['item_trans_theme_item_id'] = $itemId;
                            unset($form['item_trans_id']);
                            $this->themeItemTransTable()->save($form, $transId);
                        }
                    }

                    $success = 1;
                    $message = 'tr_melis_cms_prospects_theme_items_save_success';
                } else {
                    $success = 0;
                    $errors[$this->tool()->getTranslation("tr_melis_cms_prospects_theme_items_pros_theme_item_text2")]["isEmpty"] = $this->tool()->getTranslation("tr_melis_cms_prospects_theme_items_trans_text_empty");
                }
            }

        }

        $response = [
            'success' => $success,
            'errors' => $errors,
            'textMessage' => $this->tool()->getTranslation($message),
            'textTitle' => $this->tool()->getTranslation($title)
        ];

        $this->getEventManager()->trigger(
            'meliscmsprospects_theme_item_save_end',
            $this,
            array_merge(
                $response,
                ['typeCode' => $logType, 'itemId' => $itemId]
            )
        );

        return new JsonModel($response);
    }

    /**
     * Remove event
     * @return JsonModel
     */
    public function removeAction()
    {
        $success = 0;
        $message = 'tr_melis_cms_prospects_theme_item_delete_failed';
        $errors = [];
        $title = 'tr_melis_cms_prospects_theme_items';
        $request = $this->getRequest();
        $itemId = 0;

        if ($request->isPost()) {
            $itemId = $request->getPost('itemId');

            $this->themeItemTable()->deleteById($itemId);
            $this->themeItemTransTable()->deleteByField('item_trans_theme_item_id', $itemId);

            $checkData = $this->themeItemTable()->getEntryById($itemId)->toArray();

            if (empty($checkData)) {
                $success = 1;
                $message = 'tr_melis_cms_prospects_theme_item_delete_success';
            }
        }

        $response = [
            'success' => $success,
            'errors' => $errors,
            'textMessage' => $this->tool()->getTranslation($message),
            'textTitle' => $this->tool()->getTranslation($title)
        ];

        $this->getEventManager()->trigger(
            'meliscmsprospects_theme_delete_end',
            $this,
            array_merge(
                $response,
                ['typeCode' => self::LOG_DELETE, 'itemId' => $itemId]
            )
        );

        return new JsonModel($response);
    }


    public function updateAction()
    {
        return new ViewModel();
    }

    public function getItemDataAction()
    {
        $itemTable = $this->getServiceLocator()->get('MelisCmsProspectsThemeItemTable');
        $translator = $this->getServiceLocator()->get('translator');
        $melisTool = $this->getServiceLocator()->get('MelisCoreTool');
        $melisTool->setMelisToolKey('melistoolprospects', 'melistoolprospects_tool_prospects_theme_items');
        $melisTranslation = $this->getServiceLocator()->get('MelisCoreTranslation');
    
        $container = new Container('meliscore');
        $locale = $container['melis-lang-locale'];
    
        $colId = array();
        $dataCount = 0;
        $draw = 0;
        $tableData = array();
    
        if($this->getRequest()->isPost())
        {
            $themeId        = $this->getRequest()->getPost('themeId', null);;
            $langId         = $this->tool()->getCurrentLocaleID();
            
            $melisCoreAuth = $this->serviceLocator->get('MelisCoreAuth');
            $user = $melisCoreAuth->getIdentity();
    
            $colId = array_keys($melisTool->getColumns());
    
            $sortOrder = $this->getRequest()->getPost('order');
            $sortOrder = $sortOrder[0]['dir'];
    
            $selCol = $this->getRequest()->getPost('order');
            $selCol = $colId[$selCol[0]['column']];
    
            $draw = $this->getRequest()->getPost('draw');
    
            $start = $this->getRequest()->getPost('start');
            $length =  $this->getRequest()->getPost('length');
    
            $search = $this->getRequest()->getPost('search');
            $search = $search['value'];
    
            $dataCount = $itemTable->getTotalData();
    
            $getData = $itemTable->getItemData(array(
                'where' => array(
                    'key' => 'pros_theem_item_id',
                    'value' => $search,
                ),
                'order' => array(
                    'key' => $selCol,
                    'dir' => $sortOrder,
                ),
                'start' => $start,
                'limit' => $length,
                'columns' => $melisTool->getSearchableColumns(),
                'date_filter' => array(),
            ),
                null,
                $themeId,
                $langId
                );
    
            // store fetched data for data modification (if needed)
            $tableData = $getData->toArray();
           
            $defaultProfile = '/MelisCore/images/profile/default_picture.jpg';
            for($ctr = 0; $ctr < count($tableData); $ctr++)
            {
                $tableData[$ctr]['DT_RowId'] = $tableData[$ctr]['pros_theme_item_id'];
                
                if(empty($tableData[$ctr]['item_trans_text'])){
                    $tableData[$ctr]['item_trans_text'] = $itemTable->getItemById(
                        $tableData[$ctr]['pros_theme_item_id']
                    )->current()->item_trans_text;
                }
                
            }
        }
        
        return new JsonModel(array(
            'draw' => (int) $draw,
            'recordsTotal' => $dataCount,
            'recordsFiltered' =>  $itemTable->getTotalFiltered(),
            'data' => $tableData,
        ));
    
    }


    /**
     * @return ViewModel
     */
    public function limitAction()
    {
        return new ViewModel();
    }

    /**
     * @return ViewModel
     */
    public function searchAction()
    {
        return new ViewModel();
    }


    /**
     * @return ViewModel
     */
    public function refreshAction()
    {
        return new ViewModel();
    }

    /**
     * @return ViewModel
     */
    public function editAction()
    {
        return new ViewModel();
    }

    /**
     * @return ViewModel
     */
    public function deleteAction()
    {
        return new ViewModel();
    }

    private function getTheme()
    {
        $id = (int) $this->params()->fromQuery('id', null);

        if($id) {
            $data = $this->themeTable()->getEntryById($id)->current();
            return $data;
        }

        return null;

    }

    /**
     * @return mixed
     */
    private function getMelisKey()
    {
        $melisKey = $this->params()->fromRoute('melisKey', null);

        return $melisKey;
    }

    /**
     * @return array|object
     */
    private function tool()
    {
        $tool = $this->getServiceLocator()->get('MelisCoreTool');
        $tool->setMelisToolKey('melistoolprospects', 'melistoolprospects_tool_prospects_theme_items');
        return $tool;
    }

    /**
     * @return mixed
     */
    private function getThemeItemForm()
    {
        $form = $this->tool()->getForm('prospects_theme_item_form');
        return $form;
    }

    /**
     * @return mixed
     */
    private function getThemeItemCodeForm()
    {
        $form = $this->tool()->getForm('prospects_theme_item_code_form');
        return $form;
    }

    /**
     * @return array|object
     */
    private function themeTable()
    {
        $table = $this->getServiceLocator()->get('MelisCmsProspectsThemeTable');
        return $table;
    }

    /**
     * @return array|object
     */
    private function themeItemTable()
    {
        $table = $this->getServiceLocator()->get('MelisCmsProspectsThemeItemTable');
        return $table;
    }
    
    private function themeItemTransTable()
    {
       return $this->getServiceLocator()->get('MelisCmsProspectsThemeItemTransTable');
    }

}
