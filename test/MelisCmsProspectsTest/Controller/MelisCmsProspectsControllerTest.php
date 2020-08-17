<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCmsProspectsTest\Controller;

use MelisCore\ServiceManagerGrabber;
use Laminas\Test\PHPUnit\Controller\AbstractHttpControllerTestCase;
class MelisCmsProspectsControllerTest extends AbstractHttpControllerTestCase
{
    protected $traceError = false;
    protected $sm;
    protected $method = 'save';

    public function setUp()
    {
        $this->sm  = new ServiceManagerGrabber();
    }



    public function getPayload($method)
    {
        return $this->sm->getPhpUnitTool()->getPayload('MelisCmsProspects', $method);
    }

    /**
     * START ADDING YOUR TESTS HERE
     */

    public function testBasicMelisCmsProspectsTestSuccess()
    {
        $this->assertEquals("equalvalue", "equalvalue");
    }


}

