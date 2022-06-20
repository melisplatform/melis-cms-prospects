# melis-cms-prospects

MelisCmsProspects provides a full Prospect system for Melis Platform, including templating plugins.

## Getting Started

These instructions will get you a copy of the project up and running on your machine.  
This Melis Platform module is made to work with the MelisCms.

### Prerequisites

You will need to install melisplatform/melis-cms in order to have this module running.  
This will automatically be done when using composer.

### Installing

Run the composer command:

```
composer require melisplatform/melis-cms-prospects
```

### Database

Database model is accessible on the MySQL Workbench file:  
/melis-cms-prospects/install/sql/model  
Database will be installed through composer and its hooks.  
In case of problems, SQL files are located here:  
/melis-cms-prospects/install/sql

## Tools & Elements provided

- Prospects Tool
- Themes Tool
- Melis Templating Prospect Plugin (contact form & management)
- Dashboard item for prospects registration overview

## Running the code

### MelisCmsProspects Services

MelisCmsProspects provides many services to be used in other modules:

- MelisCmsProspects  
  Services to retrieve lists of prospects, prospects details and save a new prospect  
  File: /melis-cms-prospects/src/Service/MelisCmsProspectsService.php

```
// Get the service
$melisProspectsService = $this->getServiceManager()->get('MelisProspectsService');
// Get the number of prospects per month
$nb = $melisProspectsService->getProspectsDataByDate('monthly', '2017-10-04 12:00:00');
```

### MelisCmsProspects Forms

#### Forms factories

All Melis CMS News forms are built using Form Factories.  
All form configuration are available in the file: /melis-cms-prospects/config/app.tools.php  
Any module can override or add items in this form by building the keys in an array and marge it in the Module.php config creation part.

```
return array(
	'plugins' => array(

		// MelisCmsProspects array
		'melistoolprospects' => array(

			// Form key
			'forms' => array(

				// MelisCmsProspects update form
				'melistoolprospects_tool_prospects_update' => array(
					'attributes' => array(
						'name' => 'prospectmanager',
						'id' => 'idformprospectdata',
						'method' => 'POST',
						'action' => '',
					),
					'hydrator'  => 'Laminas\Hydrator\ArraySerializableHydrator',
					'elements' => array(
						array(
							'spec' => array(
								...
							),
						),
					),
					'input_filter' => array(
						'pros_id' => array(
							...
						),
					),
				),
			),
		),
	),
),
```

#### Forms elements

MelisCmsProspects provides form elements to be used in forms:

- MelisCmsProspectThemeSelect: a dropdown to select a theme
- MelisCmsProspectThemeItemSelect: a dropdown to select a theme item

### Listening to services and update behavior with custom code

Most services trigger events so that the behavior can be modified.

```
public function attach(EventManagerInterface $events)
{
	$sharedEvents      = $events->getSharedManager();

	$callBackHandler = $sharedEvents->attach(
		'MelisCmsProspects',
		array(
			'meliscmsprospects_toolprospects_save_end',
		),
		function($e){

    		$sm = $e->getTarget()->getServiceManager();
    		$params = $e->getParams();

    		// Custom code
    	},
    100);

    $this->listeners[] = $callBackHandler;
}
```

## Authors

- **Melis Technology** - [www.melistechnology.com](https://www.melistechnology.com/)

See also the list of [contributors](https://github.com/melisplatform/melis-cms-prospects/contributors) who participated in this project.

## License

This project is licensed under the OSL-3.0 License - see the [LICENSE.md](LICENSE.md) file for details
