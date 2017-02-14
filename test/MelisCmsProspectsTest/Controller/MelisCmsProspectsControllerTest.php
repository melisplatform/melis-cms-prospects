<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCmsProspectsTest\Controller;

use PHPUnit_Framework_TestCase;
use MelisCmsProspectsTest\ServiceManagerGrabber;
use Zend\Test\PHPUnit\Controller\AbstractHttpControllerTestCase;
class MelisCmsProspectsControllerTest extends AbstractHttpControllerTestCase
{
    protected $traceError = false;

    public function setUp()
    {
        $this->setApplicationConfig(
            include '../../../config/test.application.config.php'
        );

        parent::setUp();

    }

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


