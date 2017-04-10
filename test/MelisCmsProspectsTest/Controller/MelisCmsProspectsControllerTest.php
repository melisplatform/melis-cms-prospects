<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCmsProspectsTest\Controller;

use MelisCore\ServiceManagerGrabber;
use Zend\Test\PHPUnit\Controller\AbstractHttpControllerTestCase;
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

    public function testBasicMelisCmsProspectsTestError()
    {
        $this->assertEquals("supposed-to", "display-an-error");
    }

    public function testBasicMelisCmsProspectsTestSuccess1()
    {
        $this->assertEquals("equalvalue", "equalvalue1");
    }

    public function testBasicMelisCmsProspectsTestSuccess2()
    {
        $this->assertEquals("equalvalue", "equalvalue");
    }

    public function testBasicMelisCmsProspectsTestSuccess3()
    {
        $this->assertEquals("equalvalue", "equalvalue");
    }

    public function testBasicMelisCmsProspectsTestSuccess4()
    {
        $this->assertEquals("equalvalue", "equalvalue2");
    }

    public function testBasicMelisCmsProspectsTestSuccess5()
    {
        $this->assertEquals("equalvalue", "equalvalue");
    }



}

