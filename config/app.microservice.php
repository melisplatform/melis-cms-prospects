<?php 

return array(
	'plugins' => array(
		'microservice' => array(
			//Module Name
			'MelisCmsProspects' => array( 
				//MelisCmsSliderService.php
				'MelisCmsProspectsService' => array(
					/**
					 *  method getProspectsDataForWidgets
					 * 	@param widgetId
					 */
					'getProspectsDataForWidgets' => array(
						'attributes' => array(
							'name'	=> 'microservice_form',
							'id'	=> 'microservice_form',
							'method'=> 'POST',
							'action'=> $_SERVER['REQUEST_URI'],
						),
						'hydrator' => 'Zend\Stdlib\Hydrator\ArraySerializable',
						'elements' => array(
							array(
								'spec' => array(
									'name' => 'widgetId',
									'type' => 'Text',
									'options' => array(
										'label' => 'Widget Id',
									),
									'attributes' => array(
										'id' => 'widgetId',
										'value' => '',
										'class' => '',
										'placeholder' => 'Enter widgetId',
									),
								),
							),
						),
						'input_filter' => array(
							'widgetId' => array(
								'name' => 'widgetId',
								'required' => false,
								'validators' => array(
									array(
										'name' => 'NotEmpty',
										'option' => array(
											'messages' => array(
												\Zend\Validator\NotEmpty::INTEGER => 'Please enter widgetId'
											),
										),
									),
								),
								'filters' => array(
									array('name' => 'StripTags'),
									array('name' => 'StringTrim')
								),
							),
						),
					),
					/**
					 *  method getProspectsDataByDate
					 * 	@param type
					 * 	@param date (required)
					 */
					'getProspectsDataByDate' => array(
						'attributes' => array(
							'name'	=> 'microservice_form',
							'id'	=> 'microservice_form',
							'method'=> 'POST',
							'action'=> $_SERVER['REQUEST_URI'],
						),
						'hydrator' => 'Zend\Stdlib\Hydrator\ArraySerializable',
						'elements' => array(
							array(
								'spec' => array(
									'name' => 'type',
									'type' => 'Text',
									'options' => array(
										'label' => 'Type',
									),
									'attributes' => array(
										'id' => 'type',
										'value' => '',
										'class' => '',
										'placeholder' => 'Enter type',
									),
								),
							),
							array(
								'spec' => array(
									'name' => 'date',
									'type' => 'Text',
									'options' => array(
										'label' => 'Date',
									),
									'attributes' => array(
										'id' => 'date',
										'value' => '',
										'class' => '',
										'placeholder' => 'Enter Date',
									),
								),
							),
						),
						'input_filter' => array(
							'widgetId' => array(
								'name' => 'widgetId',
								'required' => false,
								'validators' => array(
									array(
										'name' => 'NotEmpty',
										'options' => array(
											'message' => array(
												\Zend\Validator\NotEmpty::IS_EMPTY => 'Please enter widgetId'
											),
										),
									),
								),
								'filters' => array(
									array('name' => 'StripTags'),
									array('name' => 'StringTrim')
								),
							),
							'date' => array(
								'name' => 'date',
								'required' => true,
								'validators' => array(
									array(
										'name' => 'NotEmpty',
										'options' => array(
											'message' => array(
												\Zend\Validator\NotEmpty::IS_EMPTY => 'Please enter date'
											),
										),
									),
								),
								'filters' => array(
									array('name' => 'StripTags'),
									array('name' => 'StringTrim')
								),
							),
						),
					),
					/**
					 *  method getWidgetProspects
					 * 	@param identifier (required)
					 */
					'getWidgetProspects' => array(
						'attributes' => array(
							'name'	=> 'microservice_form',
							'id'	=> 'microservice_form',
							'method'=> 'POST',
							'action'=> $_SERVER['REQUEST_URI'],
						),
						'hydrator' => 'Zend\Stdlib\Hydrator\ArraySerializable',
						'elements' => array(
							array(
								'spec' => array(
									'name' => 'identifier',
									'type' => 'Text',
									'options' => array(
										'label' => 'Identifier',
									),
									'attributes' => array(
										'id' => 'identifier',
										'value' => '',
										'class' => '',
										'placeholder' => 'Enter identifier',
									),
								),
							),
						),
						'input_filter' => array(
							'identifier' => array(
								'name' => 'identifier',
								'required' => true,
								'validators' => array(
									array(
										'name' => 'NotEmpty',
										'options' => array(
											'messages' => array(
												\Zend\Validator\NotEmpty::IS_EMPTY => 'Please enter identifier'
											),
										),
									),
								),
								'filters' => array(
									array('name' => 'StripTags'),
									array('name' => 'StringTrim')
								),
							),
						),
					),
				),
			),
		),
	),
);