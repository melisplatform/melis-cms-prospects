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
     * ** FORMAT **
     * Gdpr::TAG_KEY => [
        'NAME', 'FIRSTNAME', 'EMAIL'
        ]
     *
     * @return array
     */
    public function getListOfTags()
    {
        return [
            Gdpr::TAG_LIST_KEY => [
                self::MODULE_NAME => [
                    // TODO : List of Tags for replacing tags of email content
                    'USER', 'LOGIN', 'EMAIL'
                ]
            ]
        ];
    }

    /**
     * ** FORMAT **
     * 'sample@mmail.com' => [
            'tags' => [
                // tags
                'USER_LOGIN' => 'sample',
            ],
            'config' => [
                // validation key
                'validationKey' => md5('USER_LOGIN' . Gdpr::WARNING_LIST_KEY),
                // lang id
                'lang' => '1',
                'last_date' => $this->getUserLastDateByEmail('sample@mmail.com'),
                'site_id' => $this->getUserSiteIdByEmail('sample@mmail.com')
                'acount_id' => [id]
            ],
        ]
     *
     * above keys are basic required for gdpr auto delete
     *
     * @return array
     */
    public function getWarningListOfUsers()
    {
        return [
            Gdpr::WARNING_LIST_KEY => [
                self::MODULE_NAME => [
//                    'jrago@melistechnology.com' => [
//                        'tags' => [
//                            // tags
//                            'NAME' => 'Jerremei',
//                            'EMAIL' => 'jrago@melistechnology.com',
//                            'URL' => '%revalidation_url%'
//                        ],
//                        'config' => [
//                            // validation key
//                            'validationKey' => md5('NAME' . 'EMAIL' . Gdpr::WARNING_LIST_KEY),
//                            /*
//                             * required keys for gdpr auto delete
//                             */
//                            'lang' => '1',
//                            'last_date' => $this->getUserLastDateByEmail('jrago@melistechnology.com'),
//                            'site_id' => $this->getUserSiteIdByEmail('jrago@melistechnology.com'),
//                            'account_id' => $this->getUserByEmail('jrago@melistechnology.com')->pros_id ?: null
//                        ],
//                    ]
                ]
            ]
        ];
    }

    /**
     * ** FORMAT **
     * 'sample@mail.com' => [
            'tags' => [
                // tags
                'USER_LOGIN' => 'sample',
            ],
            // config
            'config' => [
                // validation key
                'validationKey' => md5('USER_LOGIN' . Gdpr::WARNING_LIST_KEY),
                // lang id
                'lang' => '1',
                'last_date' => $this->getUserLastDateByEmail('sample@mail.com'),
                'site_id' => $this->getUserSiteIdByEmail('sample@mail.com')
                'acount_id' => [id]
            ],
        ]
     *
     * above keys are basic required for gdpr auto delete
     *
     * @return array
     */
    public function getSecondWarningListOfUsers()
    {
        return [
            Gdpr::SECOND_WARNING_LIST_KEY => [
                self::MODULE_NAME => [
//            'jrago@melistechnology.com' => [
//                'tags' => [
//                    // tags
//                    'NAME' => 'Jerremei',
//                    'EMAIL' => 'jrago@melistechnology.com',
//                ],
//                // config
//                'config' => [
//                    /*
//                     * required keys for gdpr auto delete
//                     */
//                    'lang' => '1',
//                    'last_date' => $this->getUserLastDateByEmail('jrago@melistechnology.com'),
//                    'site_id' => $this->getUserSiteIdByEmail('jrago@melistechnology.com'),
//                    'account_id' => $this->getUserByEmail('jrago@melistechnology.com')->pros_id ?: null
//                ],
//            ]
                ]
            ]
        ];
    }

    /**
     * ** FORMAT **
     * 'sample@mail.com' => [
        'tags' => [
            // tags
            'USER_LOGIN' => 'sample',
        ],
        // config
        'config' => [
                // lang id
                'lang' => '1',
                // user last date active
                'last_date' => $this->getUserLastDateByEmail('sample@mail.com'),
                // user site id
                'site_id'   => $this->getUserSiteIdByEmail('sample@mail.com')
                'acount_id' => [id]
            ],
        ]
     *
     * above keys are basic required for gdpr auto delete
     *
     * @return array
     */
    public function getDeleteListOfUsers()
    {
        return [
//            'jrago@melistechnology.com' => [
//                'tags' => [
//                    // tags
//                    'NAME' => 'Jerremei',
//                    'EMAIL' => 'jrago@melistechnology.com',
//                ],
//                // config
//                'config' => [
//                    /*
//                     * required keys for gdpr auto delete
//                     */
//                    'lang' => '1',
//                    'last_date' => $this->getUserLastDateByEmail('jrago@melistechnology.com'),
//                    'site_id' => $this->getUserSiteIdByEmail('jrago@melistechnology.com'),
//                    'account_id' => $this->getUserByEmail('jrago@melistechnology.com')->pros_id ?: null
//                ],
//            ]
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
                foreach ($emails as $email => $emailOpts) {
                    // check user existence
                    if (isset($emailOpts['config']['last_date']) && !empty($emailOpts['config']['last_date'])) {
                        // search for the validation key
                        if ($emailOpts['config']['validationKey'] == $validationKey) {
                            // return user data
                            $userData = $this->getUserByEmail($email);
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
        // get user
        $user = $this->getUserPerValidationKey($validationKey);
        // update the last date of the user
        if ($this->getServiceLocator()->get('MelisProspects')->save(['pros_gdpr_lastdate' => date('Y-m-d h:i:s')], $user->pros_id)) {
            return true;
        }

        return false;
    }

    /**
     * Removal of users who have missed the deadline, returns the list of users deleted with their tags
     *
     * @param $autoDeleteConfig
     * @return array
     */
    public function removeOldUnvalidatedUsers($autoDeleteConfig)
    {
        $deletedUsers = [];
        if ($autoDeleteConfig['mgdprc_module_name'] == self::MODULE_NAME) {
            foreach ($this->getDeleteListOfUsers() as $email => $val) {
                // delete if users days of inactivity is already passed the set
                if ($this->getDaysDiff($val['config']['last_date'], date('Y-m-d')) > $autoDeleteConfig['mgdprc_delete_days']) {
                    // get user data
                    $data = $this->getUserByEmail($email);
                    // perform delete
                    if ($this->getServiceLocator()->get('MelisProspects')->deleteById($data->pros_id)) {
                        // return deleted email with its opeions
                        $deletedUsers[$email] = $val;
                    }
                    // trigger event for other modules
                    $this->getEventManager()->trigger('melis_cms_prospects_gdpr_auto_delete_action_delete', $this, $data);
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
        return round((strtotime($date2) - strtotime($date1)) / (60 * 60 * 24));
    }

    /**
     * @param $email
     * @return false|null|string
     */
    private function getUserLastDateByEmail($email)
    {
        $data = $this->getServiceLocator()->get('MelisProspects')->getEntryByField('pros_email', $email)->current();
        if (! empty($data)) {
            return date('Y-m-d', strtotime($data->pros_gdpr_lastdate));
        }

        return null;
    }

    private function getUserByEmail($email)
    {
        return $this->getServiceLocator()->get('MelisProspects')->getEntryByField('pros_email', $email)->current() ?: [];
    }

    /**
     * @param $email
     * @return null
     */
    private function getUserSiteIdByEmail($email)
    {
        $data = $this->getServiceLocator()->get('MelisProspects')->getEntryByField('pros_email',$email)->current();
        if (! empty($data)) {
            return $data->pros_site_id;
        }

        return null;
    }

}