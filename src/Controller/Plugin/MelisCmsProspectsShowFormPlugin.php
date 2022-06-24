<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCmsProspects\Controller\Plugin;

use MelisEngine\Controller\Plugin\MelisTemplatingPlugin;
use Laminas\View\Model\ViewModel;
use Laminas\View\Model\JsonModel;
use Laminas\Stdlib\ArrayUtils;
use Laminas\Session\Container;
/**
 * This plugin implements the business logic of the
 * "prospectsForm" plugin.
 *
 * Please look inside app.plugins.php for possible awaited parameters
 * in front and back function calls.
 *
 * front() and back() are the only functions to create / update.
 * front() generates the website view
 *
 * Configuration can be found in $pluginConfig / $pluginFrontConfig / $pluginBackConfig
 * Configuration is automatically merged with the parameters provided when calling the plugin.
 * Merge detects automatically from the route if rendering must be done for front or back.
 *
 * How to call this plugin without parameters:
 * $plugin = $this->MelisCmsProspectsShowFormPlugin();
 * $pluginView = $plugin->render();
 *
 * How to call this plugin with custom parameters:
 * $plugin = $this->MelisCmsProspectsShowFormPlugin();
 * $parameters = array(
 *      'template_path' => 'MySiteTest/contactus/prospectsForm'
 * );
 * $pluginView = $plugin->render($parameters);
 *
 * How to add to your controller's view:
 * $view->addChild($pluginView, 'prospectsForm');
 *
 * How to display in your controller's view:
 * echo $this->prospectsForm;
 */
class MelisCmsProspectsShowFormPlugin extends MelisTemplatingPlugin
{


    public function __construct($updatesPluginConfig = array())
    {
        $this->configPluginKey = 'meliscmsprospects';
        $this->pluginXmlDbKey = 'melisCmsProspects';
        parent::__construct($updatesPluginConfig);
    }


    /**
     * This function gets the datas and create an array of variables
     * that will be associated with the child view generated.
     */
    public function front()
    {
        $translator = $this->getServiceManager()->get('translator');

        $appConfigForm = (!empty($this->pluginFrontConfig['forms']['contact_us'])) ? $this->pluginFrontConfig['forms']['contact_us'] : array();
        $factory       = new \Laminas\Form\Factory();

        $config = $this->pluginFrontConfig;
        $theme  = '';
        if(!empty($config)) {
            $fields    = $config['fields'] ? explode(',', $config['fields']) : array();
            $fields = array_filter($fields);//remove empty values, happens when the user hides some of the prospect fields from the plugin form
            $theme     = $config['theme'];
            $elements  = $appConfigForm['elements'];
            $validator = $appConfigForm['input_filter'];

            $tmpAppConfigForm = [];
            foreach($elements as $spec => $element) {
                $elName = $element['spec']['name'];
                if(in_array($elName, $fields)) {
                    $tmpAppConfigForm['elements'][] = $element;
                }
            }

            foreach($validator as $input => $validation) {
                if(in_array($input, $fields)) {
                    $tmpAppConfigForm['input_filter'][$input] = $validation;
                }
            }

            // rearrange fields
            if(!empty($fields)) {
                $tmp = [];
                foreach($fields as $idx => $name) {
                    foreach($tmpAppConfigForm['elements'] as $elIdx => $spec) {
                        $elementName = $spec['spec']['name'];
                        if($name == $elementName) {
                            $tmp[] = $spec;
                        }
                    }
                }
                $tmpAppConfigForm['elements'] = $tmp;
            }

            $appConfigForm['elements']     = isset($tmpAppConfigForm['elements']) ? $tmpAppConfigForm['elements'] : $appConfigForm['elements'];
            $appConfigForm['input_filter'] = isset($tmpAppConfigForm['input_filter']) ? $tmpAppConfigForm['input_filter'] : $appConfigForm['input_filter'];

        }

        $formElements = $this->getServiceManager()->get('FormElementManager');
        $factory->setFormElementManager($formElements);
        $prospectsForm = $factory->createForm($appConfigForm);

        $themeItemTable = $this->getServiceManager()->get('MelisCmsProspectsThemeItemTable');
        $container = new Container('melisplugins');

        /**
         * Checking if the Theme field is included to Form Fields
         */
        if (in_array('pros_theme', $fields)){
            $temp       =  $themeItemTable->getItemByThemeId($theme, (int) $container['melis-plugins-lang-id'], true);
            $data = array();
            foreach($temp as $item){
                $i = $item;
                if(empty($item->item_trans_text)){
                    $i = $themeItemTable->getItemById(
                        $item->pros_theme_item_id,
                        null,
                        true
                        )->current();
                }
                $data[] = $i;
            }
            $prospectsForm->get('pros_theme')->loadValueOptions($data, true);
        }

        $success = 0;
        $errors = array();

        // form submission
        $request  = $this->getServiceManager()->get('request');

        if($request->isPost()) {
            
            $post = $request->getPost()->toArray();

            // to avoid conflict in melis edition mode
            if (!empty($post)) {

                /**
                 * Checking if the posted fields are the same
                 * with the fields set for plugin form
                 * if arrays are match the action would be consider as
                 * form submission from the front page
                 */
                $postedFields = array();
                foreach ($post As $key => $val) {
                    array_push($postedFields, $key);
                }

                /**
                 * check if pros_type is included in the post
                 * to include it in the fields so that
                 * fields will match with the post fields
                 *
                 * we will put the pros_type at the beginning of the
                 * fields array, so we assume that the pros_type is also
                 * at the beginning of the post fields
                 */
                if(isset($post['pros_type'])){
                    array_unshift($fields, 'pros_type');
                }

                if ($postedFields == $fields || empty($fields)) {
                    $prospectsForm->setData($post);
                    
                    $requiredFields = $this->pluginFrontConfig['required_fields'] ? explode(',', $this->pluginFrontConfig['required_fields']) : array();
                    foreach ($prospectsForm->getElements() As $key => $val) {
                        if (!in_array($key, $requiredFields)) {
                            $prospectsForm->getInputFilter()->remove($key);
                        }
                    }
                    
                    if ($prospectsForm->isValid()) {                       
                        $siteId = null;

                        /**
                         * Getting the current page id
                         */
                        $pageId = (!empty($this->getFormData()['pageId'])) ? $this->getFormData()['pageId'] :$this->getController()->params()->fromRoute('idpage');
                        $selectedSiteId = (!empty(($this->getFormData()['pros_site_id']))) ? $this->getFormData()['pros_site_id'] : null;

                        if (is_null($selectedSiteId) && empty($selectedSiteId)) {
                            $pageTreeService = $this->getServiceManager()->get('MelisEngineTree');
                            $site = $pageTreeService->getSiteByPageId($pageId);

                            if (!empty($site)) {
                                $siteId = $site->site_id;
                            }
                        }else{
                            $siteId = $selectedSiteId;
                        }
                        
                        // Preparing the Datas that required for adding prospects
                        $post['pros_contact_date'] = date('Y-m-d H:i:s');
                        $post['pros_site_id']      = $siteId;
                        
                        // Saving the Prospects from Contactus form using the Prospects Service
                        $prospectService = $this->getServiceManager()->get('MelisProspectsService');
                        $responseData = $prospectService->saveProspectsDatas($post);
                        
                        // Resting form elements after saving prospects
                        foreach ($prospectsForm->getElements() As $key => $val) {
                            $val->setValue(null);
                        }

                        if($responseData){
                            $melisEngineGeneralService = $this->getServiceManager()->get('MelisGeneralService');
                            $melisEngineGeneralService->sendEvent('meliscms_prospects_plugin_save', $post);
                            $success = 1;

                            if (!$request->isXmlHttpRequest()) {
                                $router = $this->getServiceManager()->get('router');
                                $uri = $router->getRequestUri();

                                // Add Flash success message to flag the Success result
                                $this->getController()->flashMessenger()->addSuccessMessage('success');
                                // Redirect to the current uri
                                // this will avoid submit form by reloading page
                                $this->getController()->redirect()->toUrl($uri);
                            }
                        }
                    } else {                        
                        $errors = $prospectsForm->getMessages();
                        
                        $appConfigForm = $appConfigForm['elements'];
                        foreach ($errors as $keyError => $valueError) {
                            foreach ($appConfigForm as $keyForm => $valueForm) {
                                if ($valueForm['spec']['name'] == $keyError && !empty($valueForm['spec']['options']['label'])) {
                                    $errors[$keyError]['label'] = $translator->translate($valueForm['spec']['options']['label']);
                                }
                            }
                            
                            foreach ($valueError As $evKey => $evVal) {
                                $errors[$keyError][$evKey] = $translator->translate($evVal);
                            }
                        }
                    }
                }
            }
        }

        $flashMessenger = $this->getController()->flashMessenger();
        if ($flashMessenger->hasCurrentSuccessMessages()) {
            $success = 1;
        }
        
        // Create an array with the variables that will be available in the view
        $viewVariables = array(
            'pluginId'      => $this->pluginFrontConfig['id'],
            'prospectsForm' => $prospectsForm,
            'success'       => $success,
            'errors'        => $errors,
            'previewMode' => $this->previewMode,
            'renderMode'  => $this->renderMode,
        );
        
        return $viewVariables;
    }

    /**
     * This function generates the form displayed when editing the parameters of the plugin
     */
    public function createOptionsForms()
    {
        // construct form
        $factory = new \Laminas\Form\Factory();
        $formElements = $this->getServiceManager()->get('FormElementManager');
        $factory->setFormElementManager($formElements);
        $formConfig = $this->pluginBackConfig['modal_form'];
        $translator = $this->getServiceManager()->get('translator');

        $response = [];
        $render   = [];
        if (!empty($formConfig)) {
            foreach ($formConfig as $formKey => $config) {
                $form = $factory->createForm($config);
                $request = $this->getServiceManager()->get('request');
                $parameters = $request->getQuery()->toArray();

                if (!isset($parameters['validate'])) {

                    $form->setData($this->getFormData());
                    $viewModelTab = new ViewModel();
                    $viewModelTab->setTemplate($config['tab_form_layout']);
                    $viewModelTab->modalForm   = $form;
                    $viewModelTab->cbElements  = $this->getFormElements();
                    
                    if ($formKey == 'plugin_prospect_tab_02') {
                        $this->pluginFrontConfig['fields'] = !empty($this->pluginFrontConfig['fields']) ? explode(',', $this->pluginFrontConfig['fields']) : ['pros_name', 'pros_company', 'pros_country', 'pros_telephone', 'pros_email', 'pros_theme', 'pros_message'];
                        $this->pluginFrontConfig['required_fields'] = $this->pluginFrontConfig['required_fields'] ? explode(',', $this->pluginFrontConfig['required_fields']) : array();
                    }
                    
                    $viewModelTab->frontConfig = $this->pluginFrontConfig;

                    $viewRender = $this->getServiceManager()->get('ViewRenderer');
                    $html = $viewRender->render($viewModelTab);
                    array_push($render, [
                            'name' => $config['tab_title'],
                            'icon' => $config['tab_icon'],
                            'html' => $html
                        ]
                    );
                } else  {
                    // validate the forms and send back an array with errors by tabs
                    $post = $request->getPost()->toArray();
                    $success = false;
                    $errors = array();
                    
                    if ($formKey == 'plugin_prospect_tab_02') {
                        /**
                         * Checking if has field set as mandatory 
                         */
                        if (empty($post['required_fields'])) {
                            $errors['fields'] = array(
                                'label' => $translator->translate('tr_melis_cms_prospects_plugin_config_fields'),
                                'noMandatoryField' => $translator->translate('tr_melis_cms_prospects_plugin_config_no_mandatory'),
                            );
                        }
                        
                        /**
                         * Checking if has field shown atleast one
                         */
                        if (empty($post['fields'])) {
                            $err = array(
                                'label' => $translator->translate('tr_melis_cms_prospects_plugin_config_fields'),
                                'noMandatoryField' => $translator->translate('tr_melis_cms_prospects_plugin_config_no_field'),
                            );
                            
                            if (!isset($errors['fields'])) {
                                $errors['fields'] = $err;
                            } else {
                                $errors['fields']['noShownField'] = $translator->translate('tr_melis_cms_prospects_plugin_config_no_field');
                            }
                        }
                    } elseif ($formKey == 'plugin_prospect_tab_03') {
                        /**
                         * Removing validation on theme field if the
                         * field is set to Hide status
                         */
                        if (!empty($post['fields'])) {
                            if (!in_array('pros_theme', $post['fields'])) {
                                $form->getInputFilter()->remove('theme');
                            }
                        }
                    }
                    
                    $form->setData($post);
                    
                    if ($form->isValid())  {
                        if (empty($errors)) {
                            $elements = isset($post['elements']) ? $post['elements'] : null;
                            if(!empty($elements)) {
                                
                                $tmpEl = '';
                                foreach($elements as $elementKey => $status) {
                                    $tmpEl .= $elementKey . '|';
                                }
                                $tmpEl    = substr($tmpEl, 0, strlen($tmpEl)-1);
                                $elements = $tmpEl;
                                
                                $success = true;
                                array_push($response, [
                                    'name' => $this->pluginBackConfig['modal_form'][$formKey]['tab_title'],
                                    'success' => $success,
                                ]);
                            }
                        }
                    } else {
                        if (!empty($errors)) {
                            $errors = ArrayUtils::merge($errors, $form->getMessages());
                        } else {
                            $errors = $form->getMessages();
                        }
                        
                        foreach ($errors as $keyError => $valueError) {
                            foreach ($config['elements'] as $keyForm => $valueForm) {
                                if ($valueForm['spec']['name'] == $keyError &&
                                    !empty($valueForm['spec']['options']['label'])
                                )
                                    $errors[$keyError]['label'] = $valueForm['spec']['options']['label'];
                            }
                        }
                    }
                    
                    if (!empty($errors)) {
                        array_push($response, [
                            'name' => $this->pluginBackConfig['modal_form'][$formKey]['tab_title'],
                            'success' => $success,
                            'errors' => $errors,
                            'message' => '',
                        ]);
                    }
                }
            }
        }

        if (!isset($parameters['validate'])) {
            return $render;
        } else {
            return $response;
        }

    }

    public function getFormElements()
    {
        $form       = $this->pluginFrontConfig['forms']['contact_us'];
        $elements   = [];
        $translator = $this->getServiceManager()->get('translator');
        foreach($form['elements'] as $spec) {
            $element = $spec['spec']['name'];
            $elements[$element] = $translator->translate($spec['spec']['options']['label']);
        }

        // reconstruct based on their arrangement
        $frontConfig = $this->pluginFrontConfig;
        $fields      = $frontConfig['fields'] ? : [];

        if (! is_array($fields)) {
            $fields = explode(',', $fields);
        }

        if(!empty($fields)) {
            $tmp = [];

            foreach($fields as $idx => $name) {
                if (!empty($name))
                $tmp[$name] = $elements[$name];
            }
            $elements = ArrayUtils::merge($tmp, $elements);
        }


        return $elements;
    }

    /**
     * Returns the data to populate the form inside the modals when invoked
     * @return array|bool|null
     */
    public function getFormData()
    {
        $data = parent::getFormData();
        return $data;
    }

    /**
     * This method will decode the XML in DB to make it in the form of the plugin config file
     * so it can overide it. Only front key is needed to update.
     * The part of the XML corresponding to this plugin can be found in $this->pluginXmlDbValue
     */
    public function loadDbXmlToPluginConfig()
    {
        $configValues = array();
        
        $xml = simplexml_load_string($this->pluginXmlDbValue);
        if ($xml) {
            if (!empty($xml->template_path))
                $configValues['template_path'] = (string)$xml->template_path;
            if (!empty($xml->pros_site_id))
                $configValues['pros_site_id'] = (string)$xml->pros_site_id;
            if (!empty($xml->fields))
                $configValues['fields'] = (string)$xml->fields;
            if (!empty($xml->required_fields))
                $configValues['required_fields'] = (string)$xml->required_fields;
            if (!empty($xml->theme))
                $configValues['theme'] = (string)$xml->theme;
        }
        
        return $configValues;
    }

    /**
     * This method saves the XML version of this plugin in DB, for this pageId
     * Automatically called from savePageSession listenner in PageEdition
     */
    public function savePluginConfigToXml($parameters)
    {
        $xmlValueFormatted = '';
        
        // template_path is mendatory for all plugins
        if (!empty($parameters['template_path']))
            $xmlValueFormatted .= "\t\t" . '<template_path><![CDATA[' . $parameters['template_path'] . ']]></template_path>';
        if (!empty($parameters['pros_site_id']))
            $xmlValueFormatted .= "\t\t" . '<pros_site_id><![CDATA[' . $parameters['pros_site_id'] . ']]></pros_site_id>';
        if(!empty($parameters['fields']))
            $xmlValueFormatted .= "\t\t" . '<fields><![CDATA['   . implode(',', $parameters['fields']). ']]></fields>';
        if(!empty($parameters['required_fields']))
            $xmlValueFormatted .= "\t\t" . '<required_fields><![CDATA['   . implode(',', $parameters['required_fields']) . ']]></required_fields>';
        if(!empty($parameters['theme']))
            $xmlValueFormatted .= "\t\t" . '<theme><![CDATA['   . $parameters['theme'] . ']]></theme>';

        // for resizing
        $widthDesktop = null;
        $widthMobile   = null;
        $widthTablet  = null;

        if (! empty($parameters['melisPluginDesktopWidth'])) {
            $widthDesktop =  " width_desktop=\"" . $parameters['melisPluginDesktopWidth'] . "\" ";
        }
        if (! empty($parameters['melisPluginMobileWidth'])) {
            $widthMobile =  "width_mobile=\"" . $parameters['melisPluginMobileWidth'] . "\" ";
        }
        if (! empty($parameters['melisPluginTabletWidth'])) {
            $widthTablet =  "width_tablet=\"" . $parameters['melisPluginTabletWidth'] . "\" ";
        }

        // Something has been saved, let's generate an XML for DB
        $xmlValueFormatted = "\t" . '<' . $this->pluginXmlDbKey . ' id="' . $parameters['melisPluginId'] . '"' .$widthDesktop . $widthMobile . $widthTablet . ' >' .
            $xmlValueFormatted .
            "\t" . '</' . $this->pluginXmlDbKey . '>' . "\n";
        
        return $xmlValueFormatted;
    }
}