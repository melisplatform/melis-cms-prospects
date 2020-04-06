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
                    'NAME', 'FIRSTNAME', 'EMAIL'
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
                    // TODO : List of first alert warning users
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
                    // TODO : List of second (resend) alert warning users
                ]
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
                foreach ($emails as $email => $emailOpts) {
                    // check user existence
                    if (isset($emailOpts['config']['last_date']) && !empty($emailOpts['config']['last_date'])) {
                        // search for the validation key
                        if ($emailOpts['config']['validationKey'] == $validationKey) {
                            // return user data
                            $userData = null;
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
     * update user status
     *
     * @param $validationKey
     * @return mixed
     */
    public function updateGdprUserStatus($validationKey)
    {
        return true;
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
            // TODO : List of delete users
        ];
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

}