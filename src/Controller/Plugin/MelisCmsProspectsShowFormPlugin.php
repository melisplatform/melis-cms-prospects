<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCmsProspects\Controller\Plugin;

use MelisEngine\Controller\Plugin\MelisTemplatingPlugin;

/**
 * This plugin implements the business logic of the
 * "prospectsForm" plugin.
 * 
 * Please look inside app.plugins.php for possible awaited parameters
 * in front and back function calls.
 * 
 * front() and back() are the only functions to create / update.
 * front() generates the website view
 * back() generates the plugin view in template edition mode (TODO)
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
    // the key of the configuration in the app.plugins.php
    public $configPluginKey = 'meliscmsprospects';
    
    /**
     * This function gets the datas and create an array of variables
     * that will be associated with the child view generated.
     */
    public function front()
    {
        $translator = $this->getServiceLocator()->get('translator');
        
        $appConfigForm = (!empty($this->pluginFrontConfig['forms']['contact_us'])) ? $this->pluginFrontConfig['forms']['contact_us'] : array();
        
        $factory = new \Zend\Form\Factory();
        $formElements = $this->getServiceLocator()->get('FormElementManager');
        $factory->setFormElementManager($formElements);
        $prospectsForm = $factory->createForm($appConfigForm);
        
        // Get the parameters and config from $this->pluginFrontConfig (default > hardcoded > get > post)
        $post = (!empty($this->pluginFrontConfig['post'])) ? $this->pluginFrontConfig['post'] : array();
        
        $success = 0;
        $errors = array();
        if (!empty($post))
        {
            $prospectsForm->setData($post);
            if($prospectsForm->isValid())
            {
                // Preparing the Datas that required for adding prospects
                $post['pros_societe'] = $post['pros_company'];
                $post['pros_contact_date'] = date('Y-m-d H:i:s');
                $post['pros_theme'] = $translator->translate('tr_contactus_'.$post['pros_theme']);

                unset($post['pros_company']);
                unset($post['pros_country']);

                // Saving the Prospects from Contactus form using the Prospects Service
                $prospectService = $this->getServiceLocator()->get('MelisProspectsService');
                $responseData = $prospectService->saveProspectsDatas($post);

                $success = 1;
            }
            else
            {
                $errors = $prospectsForm->getMessages();
                
                $appConfigForm = $appConfigForm['elements'];
                foreach ($errors as $keyError => $valueError)
                {
                    foreach ($appConfigForm as $keyForm => $valueForm)
                    {
                        if ($valueForm['spec']['name'] == $keyError && !empty($valueForm['spec']['options']['label']))
                        {
                            $errors[$keyError]['label'] = $translator->translate($valueForm['spec']['options']['label']);
                        }
                    }
                    
                    foreach ($valueError As $evKey => $evVal)
                    {
                        $errors[$keyError][$evKey] = $translator->translate($evVal);
                    }
                }
            }
        }
        
        // Create an array with the variables that will be available in the view
        $viewVariables = array(
            'prospectsForm' => $prospectsForm,
            'success' => $success,
            'errors' => $errors
        );
        
        // return the variable array and let the view be created
        return $viewVariables;
    }
}
