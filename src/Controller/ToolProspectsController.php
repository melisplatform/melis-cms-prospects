<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCmsProspects\Controller;

use Laminas\View\Model\ViewModel;
use Laminas\View\Model\JsonModel;
use MelisCore\Controller\MelisAbstractActionController;
use MelisCore\Service\MelisCoreRightsService;
use Laminas\Session\Container;

/**
 * This controller handles the display of the Prospect Tool
 */
class ToolProspectsController extends MelisAbstractActionController
{
    const ToolProspectsAppConfigPath = 'melistoolprospects/tools/melistoolprospects_tool_prospects';
    const TOOL_KEY = 'melistoolprospects_tool_prospects';

    /**
     * Renders the View file of this controller
     * @return \Laminas\View\Model\ViewModel
     */
    public function renderProspectsAction()
    {

        $translator = $this->getServiceManager()->get('translator');
        $melisKey = $this->params()->fromRoute('melisKey', '');
        $noAccessPrompt = '';

        $melisCoreRights = $this->getServiceManager()->get('MelisCoreRights');
        if (!$melisCoreRights->canAccess($this::TOOL_KEY)) {
            $noAccessPrompt = $translator->translate('tr_tool_no_access');
        }

        $melisKey = $this->params()->fromRoute('melisKey', '');
        $melisTool = $this->getServiceManager()->get('MelisCoreTool');
        $melisTool->setMelisToolKey('melistoolprospects', 'melistoolprospects_tool_prospects');


        $view = new ViewModel();
        $view->title = $melisTool->getTitle();
        $view->melisKey = $melisKey;

        return $view;
    }

    /**
     * Renders to the Tool Header Title
     * @return \Laminas\View\Model\ViewModel
     */
    public function renderToolProspectsHeaderAction()
    {
        $melisTool = $this->getServiceManager()->get('MelisCoreTool');
        $melisKey = $this->params()->fromRoute('melisKey', '');
        $zoneConfig = $this->params()->fromRoute('zoneconfig', array());

        $melisTool->setMelisToolKey('melistoolprospects', 'melistoolprospects_tool_prospects');

        $view = new ViewModel();
        $view->title = $melisTool->getTitle();
        $view->melisKey = $melisKey;

        return $view;
    }

    /**
     * Renders the Widget Container
     * @return \Laminas\View\Model\ViewModel
     */
    public function renderToolProspectsWidgetsContentAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');

        $view = new ViewModel();
        $view->melisKey = $melisKey;

        return $view;
    }

    /**
     * Renders the Number of Prospects
     * @return \Laminas\View\Model\ViewModel
     */
    public function renderToolProspectsWidgetNumProspectsAction()
    {
        $melisTool = $this->getServiceManager()->get('MelisCoreTool');
        $melisKey = $this->params()->fromRoute('melisKey', '');

        $melisProspectsService = $this->getServiceManager()->get('MelisProspectsService');
        $numPropects = $melisProspectsService->getProspectsDataForWidgets('numPropects');

        $view = new ViewModel();
        $view->melisKey = $melisKey;
        $view->numPropects = $numPropects;

        return $view;
    }

    /**
     * Renders the Prospect Widget for Number of CurrentProspects Month
     * @return \Laminas\View\Model\ViewModel
     */
    public function renderToolProspectsWidgetNumProspectsThisMonthAction()
    {
        $melisTool = $this->getServiceManager()->get('MelisCoreTool');
        $melisKey = $this->params()->fromRoute('melisKey', '');

        $melisProspectsService = $this->getServiceManager()->get('MelisProspectsService');
        $numPropectsMonth = $melisProspectsService->getWidgetProspects('curMonth');

        $view = new ViewModel();
        $view->melisKey = $melisKey;
        $view->numPropectsMonth = $numPropectsMonth;

        return $view;
    }

    /**
     * Renders the Prospect Widget for Number of CurrentProspects Month
     * @return \Laminas\View\Model\ViewModel
     */
    public function renderToolProspectsWidgetProspectsAveragePerMonthAction()
    {
        $melisTool = $this->getServiceManager()->get('MelisCoreTool');
        $melisKey = $this->params()->fromRoute('melisKey', '');

        $melisProspectsService = $this->getServiceManager()->get('MelisProspectsService');
        $numPropectsMonthAvg = $melisProspectsService->getWidgetProspects('avgMonth');

        $view = new ViewModel();
        $view->melisKey = $melisKey;
        $view->numPropectsMonthAvg = (float)$numPropectsMonthAvg['average'];

        return $view;
    }

    /**
     * Renders the Refresh Button of the tool
     * @return \Laminas\View\Model\ViewModel
     */
    public function renderToolProspectsHeaderRefreshAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');

        $view = new ViewModel();
        $view->melisKey = $melisKey;

        return $view;
    }

    /**
     * Renders to the overall content of the tool (table, modals and tool buttons)
     * @return \Laminas\View\Model\ViewModel
     */
    public function renderToolProspectsContentAction()
    {
        $translator = $this->getServiceManager()->get('translator');
        $melisKey = $this->params()->fromRoute('melisKey', '');
        $melisTool = $this->getServiceManager()->get('MelisCoreTool');
        $melisTool->setMelisToolKey('melistoolprospects', 'melistoolprospects_tool_prospects');

        $container = new Container('meliscore');
        $locale = $container['melis-lang-locale'];

        $columns = $melisTool->getColumns();
        // pre-add Action Columns
        $columns['actions'] = array('text' => $translator->translate('tr_meliscore_global_action'), 'width' => '10%');

        $view = new ViewModel();
        $view->melisKey = $melisKey;
        $view->tableColumns = $columns;
        $view->getToolDataTableConfig = $melisTool->getDataTableConfiguration('#tableToolProspect', true, false, array('order' => '[[ 0, "desc" ]]'));

        return $view;
    }

    /**
     * Renders to the date filter plugin in the filter bar inside the datatable
     * @return \Laminas\View\Model\ViewModel
     */
    public function renderToolProspectsContentFiltersDateAction()
    {
        return new ViewModel();
    }

    /**
     * Renders to the limit selection in the filter bar inside the datatable
     * @return \Laminas\View\Model\ViewModel
     */
    public function renderToolProspectsContentFiltersLimitAction()
    {
        return new ViewModel();
    }

    /**
     * Renders to the search input in the filter bar inside the datatable
     * @return \Laminas\View\Model\ViewModel
     */
    public function renderToolProspectsContentFiltersSearchAction()
    {
        return new ViewModel();
    }

    /**
     * Renders to the refresh button in the filter bar inside the datatable
     * @return \Laminas\View\Model\ViewModel
     */
    public function renderToolProspectsContentFiltersRefreshAction()
    {
        return new ViewModel();
    }

    public function renderToolProspectsContentFiltersExportAction()
    {
        return new ViewModel();
    }


    /**
     * Renders to modal container
     * @return \Laminas\View\Model\ViewModel
     */
    public function renderToolProspectsModalContainerAction()
    {

        $id = $this->params()->fromQuery('id');
        $view = new ViewModel();
        $melisKey = $this->params()->fromRoute('melisKey', '');
        $view->melisKey = $melisKey;
        $view->id = $id;
        $view->setTerminal(true);
        return $view;
    }

    /**
     * Renders the update form content for the modal
     * @return \Laminas\View\Model\ViewModel
     */
    public function renderToolProspectUpdateFormAction()
    {
        $prospectId = (int) $this->params()->fromQuery('prospectId', '');

        $melisCoreConfig = $this->getServiceManager()->get('MelisCoreConfig');
        $appConfigForm = $melisCoreConfig->getFormMergedAndOrdered('melistoolprospects/tools/melistoolprospects_tool_prospects/forms/melistoolprospects_tool_prospects_update', 'melistoolprospects_tool_prospects_update');
        $factory = new \Laminas\Form\Factory();
        $formElements = $this->getServiceManager()->get('FormElementManager');
        $factory->setFormElementManager($formElements);
        $form = $factory->createForm($appConfigForm);

        $prospectTable = $this->getServiceManager()->get('MelisProspects');
        $themeTable = $this->getServiceManager()->get('MelisCmsProspectsThemeTable');
        $themeItemTable = $this->getServiceManager()->get('MelisCmsProspectsThemeItemTable');
        $container = new Container('meliscore');

        if (!empty($prospectId)) {

            $prospect =  $prospectTable->getEntryById($prospectId)->current();

            if (!empty($prospect)) {

                $theme  =  $themeItemTable->getEntryById($prospect->pros_theme)->current();

                if (!empty($theme)) {

                    $temp  =  $themeItemTable->getItemByThemeId($theme->pros_theme_id, (int) $container['melis-lang-id'], true);
                    $data = array();

                    foreach ($temp as $item) {
                        $i = $item;
                        if (empty($item->item_trans_text)) {
                            $i = $themeItemTable->getItemById(
                                $item->pros_theme_item_id,
                                null,
                                true
                            )->current();
                        }
                        $data[] = $i;
                    }

                    $form->get('pros_theme')->loadValueOptions($data);
                } else {

                    $load[] = array(
                        'pros_theme_item_id' => $prospect->pros_theme,
                        'pros_theme_name' => $prospect->pros_theme
                    );

                    $form->get('pros_theme')->loadValueOptions($load);
                }
                $form->setData((array)$prospect);
            }
        }

        $melisKey = $this->params()->fromRoute('melisKey', '');
        $view = new ViewModel();
        $view->melisKey = $melisKey;
        $view->form = $form;
        $view->title = "tr_prospect_manager_fm_delete_update_title";
        return $view;
    }

    public function renderToolProspectsActionEditAction()
    {
        $view = new ViewModel();

        return $view;
    }

    public function renderToolProspectsActionDeleteAction()
    {
        $view = new ViewModel();

        return $view;
    }

    public function renderToolProspectsModalUpdateContentAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');
        $melisTool = $this->getServiceManager()->get('MelisCoreTool');
        $melisTool->setMelisToolKey('melistoolprospects', 'melistoolprospects_tool_prospects');

        $view = new ViewModel();
        $view->prospectsModal = $melisTool->getModal('melistoolprospects_tool_prospects_update_modal');
        $view->melisKey = $melisKey;

        return $view;
    }

    public function renderToolProspectsModalEmptyContentAction()
    {
        $view = new ViewModel();

        return $view;
    }

    /**
     * renders the list content prospects filter site
     * @return \Laminas\View\Model\ViewModel
     */
    public function renderToolProspectsContentFiltersSiteAction()
    {
        $tableSite = $this->getServiceManager()->get('MelisEngineTableSite');
        $translator = $this->getServiceManager()->get('translator');
        $sites = $tableSite->fetchAll();
        $siteId = $this->getRequest()->getPost('pros_site_id');

        $options = '<option  value="">' . $translator->translate('tr_melistoolprospects_prospects_common_choose_label') . '</option>';
        foreach ($sites as $site) {
            $selected  = ($site->site_id == $siteId) ? 'selected' : '';
            $options .= '<option value="' . $site->site_id . '" ' . $selected . '>' . $site->site_label . '</option>';
        }

        $view =  new ViewModel();
        $view->options = $options;
        return $view;
    }

    /**
     * @return ViewModel
     */
    public function renderToolProspectsContentFiltersProsTypeAction()
    {
        $prospectsTable = $this->getServiceManager()->get('MelisProspects');
        $translator = $this->getServiceManager()->get('translator');
        $types = $prospectsTable->fetchAll()->toArray();

        $prosTypes = array();
        foreach ($types as $val) {
            if (!empty($val['pros_type'])) {
                array_push($prosTypes, $val['pros_type']);
            }
        }
        $prosTypes = array_unique($prosTypes, SORT_REGULAR);

        $options = '<option  value="">' . $translator->translate('tr_melistoolprospects_prospects_common_choose_label') . '</option>';
        foreach ($prosTypes as $type) {
            $options .= '<option value="' . $type . '">' . $type . '</option>';
        }

        $view =  new ViewModel();
        $view->options = $options;
        return $view;
    }

    /**
     * Returns all prospect data in JSON format
     * @return \Laminas\View\Model\JsonModel
     */
    public function getToolProspectDataAction()
    {
        /** @var \MelisCmsProspects\Model\Tables\MelisProspectTable $prospectTable */
        $prospectTable = $this->getServiceManager()->get('MelisProspects');
        $translator = $this->getServiceManager()->get('translator');
        $melisTool = $this->getServiceManager()->get('MelisCoreTool');
        $melisTool->setMelisToolKey('melistoolprospects', 'melistoolprospects_tool_prospects');
        $melisTranslation = $this->getServiceManager()->get('MelisCoreTranslation');
        $container = new Container('meliscore');
        $locale = $container['melis-lang-locale'];

        $formatter = new \IntlDateFormatter($locale, \IntlDateFormatter::LONG, \IntlDateFormatter::NONE);

        $colId = array();
        $dataCount = 0;
        $draw = 0;
        $tableData = array();
        if ($this->getRequest()->isPost()) {
            $colId = array_keys($melisTool->getColumns());
            $post = $this->getRequest()->getPost()->toArray();

            $pros_site_id = empty($post['pros_site_id']) ? null : $post['pros_site_id'];
            $startDate = empty($post['startDate']) ? null : $post['startDate'];
            $endDate = empty($post['endDate']) ? null : $post['endDate'];

            $pros_type = $this->getRequest()->getPost('pros_type');
            $pros_type = !empty($pros_type) ? $pros_type : null;

            //date
            $prosStartDate = $this->getRequest()->getPost('startDate');
            $prosStartDate = !empty($prosStartDate) ? $prosStartDate : null;
            $prosEndDate = $this->getRequest()->getPost('endDate');
            $prosEndDate = !empty($prosEndDate) ? $prosEndDate : null;

            $sortOrder = $this->getRequest()->getPost('order');

            $sortOrder = $sortOrder[0]['dir'];
            $selCol = $post['order'];
            $selCol = $colId[$selCol[0]['column']];

            $draw = $post['draw'];

            $start = $post['start'];
            $length =  $post['length'];

            $search = $post['search'];
            $search = $search['value'];

            $dataCount = $prospectTable->getTotalData();

            $getData = $prospectTable->getData($search, $pros_site_id, $melisTool->getSearchableColumns(), $selCol, $sortOrder, $start, $length, $pros_type, $prosStartDate, $prosEndDate);

            $themeItemTable = $this->getServiceManager()->get('MelisCmsProspectsThemeItemTable');

            // store fetched Object Data into array so we can apply any string modifications
            $tableData = $getData->toArray();
            for ($ctr = 0; $ctr < count($tableData); $ctr++) {
                // apply text limits
                foreach ($tableData[$ctr] as $vKey => $vValue) {
                    $tableData[$ctr][$vKey] = $melisTool->sanitize($melisTool->limitedText($vValue));
                }

                // manually modify value of the desired row
                $tableData[$ctr]['DT_RowId'] = $tableData[$ctr]['pros_id'];
                $tableData[$ctr]['pros_contact_date'] = $formatter->format(strtotime($tableData[$ctr]['pros_contact_date']));
                $itemName = '';
                if (is_numeric($tableData[$ctr]['pros_theme'])) {

                    $themeItem = $themeItemTable->getItemById($tableData[$ctr]['pros_theme'], (int) $melisTool->getCurrentLocaleID(), true)->current();

                    if (empty($themeItem)) {
                        $themeItem =  $themeItemTable->getItemById($tableData[$ctr]['pros_theme'], null, true)->current();
                    }

                    $itemName = !empty($themeItem) ? $themeItem->pros_theme_name . ' / ' . $themeItem->item_trans_text : '';
                }

                $tableData[$ctr]['pros_theme'] = !empty($itemName) ? $itemName : $translator->translate($tableData[$ctr]['pros_theme']);

                $tableData[$ctr]['pros_message'] = strip_tags($tableData[$ctr]['pros_message'] ?? '');
            }
        }

        return new JsonModel(array(
            'draw' => (int) $draw,
            'recordsTotal' => $dataCount,
            'recordsFiltered' =>  $prospectTable->getTotalFiltered(),
            'data' => $tableData,
        ));
    }

    public function exportToCsvAction()
    {
        $prospectTable = $this->getServiceManager()->get('MelisProspects');
        $translator = $this->getServiceManager()->get('translator');
        $melisTool = $this->getServiceManager()->get('MelisCoreTool');
        $melisTool->setMelisToolKey('melistoolprospects', 'melistoolprospects_tool_prospects');


        $searched = $this->getRequest()->getQuery('filter');
        $siteId = !empty($this->getRequest()->getQuery('pros_site_id')) ? $this->getRequest()->getQuery('pros_site_id') : null;
        $prosType = !empty($this->getRequest()->getQuery('pros_type')) ? $this->getRequest()->getQuery('pros_type') : null;
        $startDate = !empty($this->getRequest()->getQuery('startDate')) ? $this->getRequest()->getQuery('startDate') : null;
        $endDate = !empty($this->getRequest()->getQuery('endDate')) ? $this->getRequest()->getQuery('endDate') : null;

        $columns  = $melisTool->getSearchableColumns();

        //remove the sitename from the where clause to avoid error since it doesn't exist in the template table
        for ($i = 0; $i < sizeof($columns); $i++) {
            if ($columns[$i] == 'site_name') {
                unset($columns[$i]);
            }
        }

        $data = $prospectTable->getData($searched, $siteId, $columns, 'pros_contact_date', 'DESC', 0, null, $prosType, $startDate, $endDate);
        $data = $data->toArray();
        if (empty($data))
            $data = array(array());

        return $melisTool->exportDataToCsv($data);
    }


    /**
     * Removed a specific prospect data in the database table
     * @return \Laminas\View\Model\JsonModel
     */
    public function removeProspectDataAction()
    {
        $response = array();
        $this->getEventManager()->trigger('meliscmsprospects_toolprospects_delete_start', $this, $response);

        $translator = $this->getServiceManager()->get('translator');
        $prospectTable = $this->getServiceManager()->get('MelisProspects');
        $id = $this->params()->fromRoute('id', $this->params()->fromQuery('id', ''));

        $prospectTable->deleteById($id);

        $response = array(
            'textTitle' => 'tr_melistoolprospects_tool_prospects',
            'textMessage' => 'tr_prospect_manager_fm_delete_data_content',
            'success' => true,
        );

        $this->getEventManager()->trigger('meliscmsprospects_toolprospects_delete_end', $this, array_merge($response, array('typeCode' => 'CMS_PROSPECTS_DELETE', 'itemId' => $id)));

        return new JsonModel($response);
    }

    /**
     * returns the prospect data from the ID provided
     * @return \Laminas\View\Model\JsonModel
     */
    public function retrieveProspectDataByIdAction()
    {
        $prospectTable = $this->getServiceManager()->get('MelisProspects');
        $id = $this->params()->fromRoute('id', $this->params()->fromQuery('id', ''));

        return new JsonModel($prospectTable->getEntryById($id));
    }

    /**
     * Updates an specific information of Prospect Data 
     * @return \Laminas\View\Model\JsonModel
     */
    public function updateProspectDataAction()
    {
        $response = array();
        $this->getEventManager()->trigger('meliscmsprospects_toolprospects_save_start', $this, $response);
        $id = null;
        $success = 0;
        $errors  = array();
        $textTitle = 'tr_melistoolprospects_tool_prospects';
        $textMessage = '';
        // for event logging
        $translator = $this->getServiceManager()->get('translator');
        $prospectTable = $this->getServiceManager()->get('MelisProspects');
        $melisTool = $this->getServiceManager()->get('MelisCoreTool');
        $melisTool->setMelisToolKey('melistoolprospects', 'melistoolprospects_tool_prospects');
        $prospectForm = $melisTool->getForm('melistoolprospects_tool_prospects_update');

        if ($this->getRequest()->isPost()) {
            $postValues = $this->getRequest()->getPost()->toArray();
            $postValues = $melisTool->sanitizePost($postValues, array('pros_message'));
            $id = $this->getRequest()->getPost('pros_id');
            $prospectForm->setData($postValues);

            if ($prospectForm->isValid()) {
                $data = $prospectForm->getData();
                // get the current data

                $curData = $prospectTable->getEntryById($id);
                $curData = $curData->current();

                $data['pros_contact_date'] = $curData->pros_contact_date;
                $data['pros_type'] = $curData->pros_type;
                $data['pros_theme'] = empty($data['pros_theme']) ? null : $data['pros_theme'];
                $prospectTable->save($data, $id);

                // add event to Flash messenger
                $textMessage = $translator->translate('tr_prospect_manager_fm_update_data_content');
                $success = 1;
            } else {
                $textMessage = $translator->translate('tr_prospect_manager_fm_update_data_content_error');
                $errors = $prospectForm->getMessages();
            }

            $melisMelisCoreConfig = $this->getServiceManager()->get('MelisCoreConfig');
            $appConfigForm = $melisMelisCoreConfig->getItem('melistoolprospects/tools/melistoolprospects_tool_prospects/forms/melistoolprospects_tool_prospects_update');
            $appConfigForm = $appConfigForm['elements'];

            foreach ($errors as $keyError => $valueError) {
                foreach ($appConfigForm as $keyForm => $valueForm) {
                    if (
                        $valueForm['spec']['name'] == $keyError &&
                        !empty($valueForm['spec']['options']['label'])
                    )
                        $errors[$keyError]['label'] = $valueForm['spec']['options']['label'];
                }
            }
        }

        $response = array(
            'success' => $success,
            'textTitle' => $textTitle,
            'textMessage' => $textMessage,
            'errors' => $errors
        );

        $this->getEventManager()->trigger('meliscmsprospects_toolprospects_save_end', $this, array_merge($response, array('typeCode' => 'CMS_PROSPECTS_UPDATE', 'itemId' => $id)));

        return new JsonModel($response);
    }

    public function removeAllProspectDataAction()
    {
        $response = array();
        $this->getEventManager()->trigger('meliscmsprospects_toolprospects_delete_start', $this, $response);

        $translator = $this->getServiceManager()->get('translator');
        $prospectTable = $this->getServiceManager()->get('MelisProspects');
        $id = $this->params()->fromRoute('id', $this->params()->fromQuery('id', ''));



        return new JsonModel($response);
    }
}
