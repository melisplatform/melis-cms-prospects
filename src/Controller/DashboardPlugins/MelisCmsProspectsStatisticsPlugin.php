<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCmsProspects\Controller\DashboardPlugins;

use MelisCore\Controller\DashboardPlugins\MelisCoreDashboardTemplatingPlugin;
use Laminas\View\Model\ViewModel;
use Laminas\Session\Container;
use Laminas\View\Model\JsonModel;


class MelisCmsProspectsStatisticsPlugin extends MelisCoreDashboardTemplatingPlugin
{
    public function __construct()
    {
        $this->pluginModule = 'meliscmsprospects';
        parent::__construct();
    }
    
    public function prospectsStatistics()
    {
        $melisProspects = $this->getServiceManager()->get('MelisProspects');
        $melisTool = $this->getServiceManager()->get('MelisCoreTool');
        $melisProspectsService = $this->getServiceManager()->get('MelisProspectsService');

        /**
         * Check user's accessibility(rights) for this plugin
         * @var \MelisCore\Service\MelisCoreDashboardPluginsRightsService $dashboardPluginsService
         */
        $dashboardPluginsService = $this->getServiceManager()->get('MelisCoreDashboardPluginsService');
        $path = explode('\\', __CLASS__);
        $className = array_pop($path);
        $isAccessible = $dashboardPluginsService->canAccess($className);

        // Get Total number Prospects
        $numPropects = $melisProspectsService->getProspectsDataForWidgets('numPropects');
        
        // Get Total Recent Prospects
        $recentPropects = $melisProspects->getDashboardRecentProspectData(5)->toArray();
        $prosData = $recentPropects;
        
        for($x = 0; $x < count($prosData); $x++) 
        {
            foreach($prosData[$x] as $vKey => $vValue)
            {
                $prosData[$x][$vKey] = $melisTool->limitedText($vValue);
            }
        }
        
        // Get Current Language
        $container = new Container('meliscore');
        $locale = $container['melis-lang-locale'];
        $dateFormat = ($locale=='en_EN') ? 'm/d/Y' : 'd/m/Y';
        
        $view = new ViewModel();
        $view->setTemplate('melis-cmsprospects/dashboard/prospects-statistics');
        $view->numPropects = $numPropects;
        $view->recentPropects = (!empty($prosData)) ? $prosData : array();
        $view->dateFormat = $dateFormat;
        $view->toolIsAccessible = $isAccessible;
        
        return $view;
    }
    
    /**
     * Returns JSon datas for the graphs on the dashboard
     */
    public function getDashboardStats()
    {
        // Graph Range X-Axis Limit to this value
        $limit = 10;
        $success = 1;
        // Values hanler
        $values = array();
        
        if($this->getController()->getRequest()->isPost()) {

            $chartFor = $this->getController()->getRequest()->getPost()->toArray();
            $chartFor = isset($chartFor['chartFor']) ? $chartFor['chartFor'] : 'monthly';

            // ⚠️ Perf/robustesse (ticket 0010871) : AVANT, on appelait getProspectsDataByDate() 10× dans
            // la boucle, et CHAQUE appel refaisait un fetch COMPLET de la table prospects + un balayage
            // → O(10 × N). Sur un gros volume (dev6) ça pouvait dépasser mémoire/temps et renvoyer un 502.
            // On récupère désormais les prospects UNE SEULE FOIS puis on compte par « bucket » en mémoire.
            $prospectsTable = $this->getServiceManager()->get('MelisProspects');
            $rows = $prospectsTable->getProspectsOrderByDate('DESC');
            $rows = $rows ? $rows->toArray() : array();

            // Clé de regroupement d'une date selon le type de rapport (mêmes règles que l'ancien
            // getProspectsDataByDate : jour = Y-m-d, mois = Y-m, année = Y).
            $bucketOf = function ($dateStr) use ($chartFor) {
                $ts = strtotime((string) $dateStr);
                if ($ts === false) { return null; }
                switch ($chartFor) {
                    case 'daily':  return date('Y-m-d', $ts);
                    case 'yearly': return date('Y', $ts);
                    case 'monthly':
                    default:       return date('Y-m', $ts);
                }
            };

            // Nombre de prospects par bucket (un seul balayage de la table).
            $counts = array();
            foreach ($rows as $r) {
                $key = isset($r['pros_contact_date']) ? $bucketOf($r['pros_contact_date']) : null;
                if ($key !== null) { $counts[$key] = (isset($counts[$key]) ? $counts[$key] : 0) + 1; }
            }

            // Last Date/value of the Graph will be the Current Date
            $curdate = date('Y-m-d');
            for ($ctr = $limit ; $ctr > 0 ;$ctr--)
            {
                $key = $bucketOf($curdate);
                $nb = ($key !== null && isset($counts[$key])) ? $counts[$key] : 0;
                $values[] = array($curdate, $nb);

                // Recule d'un pas selon le type de rapport (jour/mois/année).
                switch ($chartFor) {
                    case 'daily':  $curdate = date('Y-m-d', strtotime($curdate.' -1 days'));   break;
                    case 'yearly': $curdate = date('Y-m-d', strtotime($curdate.' -1 years'));  break;
                    case 'monthly':
                    default:       $curdate = date('Y-m-d', strtotime($curdate.' -1 months')); break;
                }
            }
        }
        
        return new JsonModel(array(
            'date' => date('Y-m-d'),
            'success' => $success,
            'values' => $values,
        ));
        
    }
}