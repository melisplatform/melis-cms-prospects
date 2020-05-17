<?php

namespace MelisCmsProspects\Service;

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

use MelisCore\Service\MelisCoreGdprAutoDeleteInterface;
use MelisCore\Service\MelisCoreGdprAutoDeleteService as Gdpr;
use MelisCore\Service\MelisCoreGeneralService;

class MelisCmsProspectsGdprAutoDeleteService extends MelisCoreGeneralService implements MelisCoreGdprAutoDeleteInterface
{
    /**
     * @var
     */
    const MODULE_NAME = "melis-cms-prospects";

    /**
     * @return array
     */
    public function getListOfTags()
    {
        return [
            Gdpr::TAG_LIST_KEY => [
                self::MODULE_NAME=> [
                    Gdpr::TAG_KEY  => $this->getServiceLocator()->get('MelisConfig')->getItem('/MelisCmsProspects/conf/gdpr/tags')
                ]
            ]
        ];
    }

    /**
     * @param  $type
     * @return array
     */
    private function getUsersWithTagsAndConfig($type)
    {
        $users = $this->getServiceLocator()->get('MelisProspects')->fetchAll()->toArray();
        // get all tags
        $prospectsTags = $this->getServiceLocator()->get('MelisConfig')->getItem('/MelisCmsProspects/conf/gdpr/tags');
        $userList = [];
        if (! empty($users)) {
            foreach ($users as $i => $data) {
                // tags
                $tags = $this->assigningValueOfTags($prospectsTags, $data);
                $config = [
                    'lang'       => 1,
                    'site_id'    => $data['pros_site_id'],
                    'last_date'  => $data['pros_gdpr_lastdate'],
                    'account_id' => $data['pros_id'],
                    'validationKey' => md5(implode('', array_keys($prospectsTags)) . $type . $data['pros_id']),
                    'email' => $data['pros_email'] ?? null
                ];

                $userList[$data['pros_id']] = [
                    // append tags with value
                    'tags' => $tags, 
                    // append config
                    'config' => $config 
                ];
            }
        }


        return $userList;
    }
    /**
     * @return array
     */
    public function getWarningListOfUsers($autoDeleteConfig)
    {
        return [
            Gdpr::WARNING_LIST_KEY => [
                self::MODULE_NAME => $this->getUsersWithTagsAndConfig(Gdpr::WARNING_LIST_KEY)
            ]
        ];
    }

    /**
     * @return array
     */
    public function getSecondWarningListOfUsers($autoDeleteConfig)
    {
        return [
            Gdpr::SECOND_WARNING_LIST_KEY => [
                self::MODULE_NAME => $this->getUsersWithTagsAndConfig(Gdpr::SECOND_WARNING_LIST_KEY)
            ]
        ];
    }

    /**
     * retrieve user by validation key
     *
     * @param $validationKey
     * @return mixed
     */
    public function getUserPerValidationKey($validationKey)
    {
        // get all config users first warning list and second warning list
        $configUsers = array_merge($this->getWarningListOfUsers(),$this->getSecondWarningListOfUsers());
        foreach ($configUsers as $warningType => $modules) {
            foreach ($modules as $module => $emails) {
                foreach ($emails as $id => $emailOpts) {
                    // check user existence
                    if (isset($emailOpts['config']['last_date']) && !empty($emailOpts['config']['last_date'])) {
                        // search for the validation key
                        if ($emailOpts['config']['validationKey'] == $validationKey) {
                            // return user data
                            $userData = $this->getUserById($id);
                            if (! empty($userData)) {
                                // include user config options
                                $userData->config = $emailOpts['config'];

                                return $userData;
                            }
                        }
                    }
                }
            }
        }

        return false;
    }

    /**
     * update user last date
     *
     * @param $validationKey
     * @return mixed
     */
    public function updateGdprUserStatus($validationKey)
    {
        $id = null;
        // get user
        $user = $this->getUserPerValidationKey($validationKey);
        if (! empty($user)) {
            // update the last date of the user
            $this->getServiceLocator()->get('MelisProspects')->save(['pros_gdpr_lastdate' => date('Y-m-d H:i:s')], $user->pros_id);
            $id = $user->pros_id ;
        }

        return $id;
    }

    /**
     * Removal of users who have missed the deadline, returns the list of users deleted with their tags
     *
     * @param $autoDeleteConfig
     * @return array
     */
    public function removeOldUnvalidatedUsers($autoDeleteConfig)
    {
        $deletedUsers = [
            self::MODULE_NAME => []
        ];
        if ($autoDeleteConfig['mgdprc_module_name'] == self::MODULE_NAME) {
            foreach ($this->getUsersWithTagsAndConfig("user-deleted") as $id => $val) {
                // check if user belongs to the config site
                if ($autoDeleteConfig['mgdprc_site_id'] == $val['config']['site_id']) {
                    // delete if users days of inactivity is already pas sed the set
                    if ($this->getDaysDiff($val['config']['last_date'], date('Y-m-d')) > $autoDeleteConfig['mgdprc_delete_days']) {
                        // get user data
                        $data = $this->getUserById($id);
                        if (! empty($data)) {
                            // perform delete
                            if ($this->getServiceLocator()->get('MelisProspects')->deleteById($data->pros_id)) {
                                // return deleted email with its opeions
                                $deletedUsers[self::MODULE_NAME][$id] = $val;
                            }
                            // trigger event for other modules
                            $this->getEventManager()->trigger('melis_cms_prospects_gdpr_auto_delete_action_delete', $this, $data);
                        }
                    }
                }
            }
        }

        return $deletedUsers;
    }

    /**
     * calculate the diffrence of two dates in days
     *
     * @param $date1
     * @param $date2
     * @return float
     */
    private function getDaysDiff($date1, $date2)
    {
        return round((time() - strtotime($date1)) / 60);
       # return round((strtotime($date2) - strtotime($date1)) / (60 * 60 * 24));
    }


    /**
     * @param $email
     * @return mixed
     */
    private function getUserByEmail($email)    
    {
        return $this->getServiceLocator()->get('MelisProspects')->getEntryByField('pros_email', $email)->current();
    }
    /**
     * @param $id
     *
     */
    public function getUserById($id)
    {
        return $this->getServiceLocator()->get('MelisProspects')->getEntryById($id)->current();
    }


    /**
     * @param $siteId
     * @return null
     */
    private function getUserSiteLabel($siteId)
    {
        $siteTbl = $this->getServiceLocator()->get('MelisEngineTableSite');
        $siteName = null;
        // get site data
        $siteData = $siteTbl->getEntryById($siteId)->current();
        if (! empty($siteData)) {
            // set site name
            $siteName = $siteData->site_label ?? $siteData->site_name;
        }

        return $siteName;
    }

    /**
     * @param $tags
     * @param $userData
     * @return array
     */
    private function assigningValueOfTags($tags, $userData)
    {
        $userData['pros_site_id'] = $this->getUserSiteLabel($userData['pros_site_id']);
        foreach ($tags as $tag => $dbField) {
            if (isset($userData[$dbField])) {
                $tags[$tag] = $userData[$dbField] ?? null;
            } else {
                if ($tags[$tag] != "%revalidation_link%") {
                    // for tags that are not the db field
                    $tags[$tag] = null;
                }
            }
        }

        return $tags;
    }
}
