window.app = window.app || {};

app.dataprocessorGeo = (function($) {

	'use strict';

	var app = window.app;


	//-- Start geo functions

		/**
		* match employees with a set of locations (hometowns, birthplaces, offices)
		* enrich location-dataset:
		*	- add prop employeeCount to every location
		* enrich every employee-object:
		*	- add object with location coords to every employee object
		* 
		* @param {array} dataset The dataset containing the locations
		* @returns {undefined}
		*/
		var matchEmployeesWithLocations = function({locationData, datasetLocationProp, employeeLocationProp, locationCoordsProp}) {

			// enrich location-data: add prop for employee count to every location
			for (var i=0, locationCount=locationData.length; i<locationCount; i++) {
				locationData[i].employeeCount = 0;
			}

			// enrich employee-data
			for (var j=0, len=app.data.employees.length; j<len; j++) {
				var employee = app.data.employees[j],
					locationName = employee[employeeLocationProp].toLowerCase(),
					locationFound = false;

				// create a coordinates object
				employee[locationCoordsProp] = {};

				// check if location is within dataset
				// if so, get its lat/long and augment its employeeCount
				for (var k=0; k<locationCount; k++) {
					var location = locationData[k];

					if (location[datasetLocationProp].toLowerCase() === locationName) {
						// calculate the location's coords in the map projection
						var coords = app.map.elements.projection([location.long, location.lat]);
						employee[locationCoordsProp] = {
							x: coords[0],
							y: coords[1]
						};

						locationFound = true;

						// keep track of # of employees per location
						location.employeeCount++;

						break;
					}
				}

				// checkLocationOverlap(employee);

				if (!locationFound) {
					app.data.placesWithoutGeoData.push(employee[employeeLocationProp]);
				}
			}

			// now order location by # of employees
			locationData.sort(function(a, b) {
				return b.employeeCount - a.employeeCount;
			});

		};


		/**
		* check if employee has overlapping location data
		* i.e. does he live/work/was born in same location?
		* @returns {undefined}
		*/
		const checkLocationOverlap = function() {
			app.data.employees.forEach(function(emp) {
				const office = emp.office.toLowerCase(),
					hometown = emp.hometown.toLowerCase(),
					birthplace = emp.birthplace.toLowerCase();
				let hometownIsBirthplace = false,
					hometownIsOffice = false,
					birthplaceIsOffice = false,
					hometownIsBirthplaceIsOffice = false;

				if (hometown === birthplace) {
					hometownIsBirthplace = true;
					app.data.employeesResidenceIsBirthplace++;
				}

				if (hometown === office) {
					hometownIsOffice = true;
					app.data.employeesResidenceIsOffice++;
				}

				if (birthplace === office) {
					birthplaceIsOffice = true;
					app.data.employeesBirthplaceIsOffice++;
				}

				if (hometownIsBirthplace && hometownIsOffice) {
					hometownIsBirthplaceIsOffice = true;
					app.data.employeesResidenceIsBirthplaceIsOffice++;
				}

				emp.hometownIsBirthplace = hometownIsBirthplace;
				emp.hometownIsOffice = hometownIsOffice;
				emp.birthplaceIsOffice = birthplaceIsOffice;
				emp.hometownIsBirthplaceIsOffice = hometownIsBirthplaceIsOffice;
			});
		};
		
		


		/**
		* process hometown data
		* @returns {undefined}
		*/
		var processHometownData = function() {
			var options = {
				locationData: app.data.hometowns,
				datasetLocationProp: 'name',
				employeeLocationProp: 'hometown',
				locationCoordsProp: 'hometownCoords'
			};
			matchEmployeesWithLocations(options);

			var $list = $('#hometown-list'),
				items = '';
			for (var i=0; i<5; i++) {
				var hometown = app.data.hometowns[i];
				items += '<li>'+hometown.name + ' (' + hometown.employeeCount + ')</li>';
			}

			$list.append(items);
		};


		/**
		* process birthplace data
		* @returns {undefined}
		*/
		var processBirthplaceData = function() {
			var options = {
				locationData: app.data.hometowns,
				datasetLocationProp: 'name',
				employeeLocationProp: 'birthplace',
				locationCoordsProp: 'birthplaceCoords'
			};
			matchEmployeesWithLocations(options);
		};


		/**
		* process hometown data
		* @returns {undefined}
		*/
		var processOfficeData = function() {
			var officeOptions = {
				locationData: app.data.offices,
				datasetLocationProp: 'city',
				employeeLocationProp: 'office',
				locationCoordsProp: 'officeCoords'
			};
			matchEmployeesWithLocations(officeOptions);
		};



		//-- Start debugging functions


			/**
			* report missing data in the dataset
			* @returns {undefined}
			*/
			var reportMissingGeoData = function() {
				
				Array.prototype.unique = function() {
				  return this.filter(function (value, index, self) { 
				    return self.indexOf(value) === index;
				  });
				};

				var uniqueUnknown = app.data.placesWithoutGeoData.unique(),
					str = '\n\n';

				for (var i=0, len=uniqueUnknown.length; i<len; i++) {
					str += uniqueUnknown[i] + '\n';
				}

				console.log(str);
			};


		//-- End debugging functions

	//-- End geo functions --

	/**
	* 
	* @returns {undefined}
	*/
	var init = function() {
		processHometownData();
		processBirthplaceData();
		processOfficeData();
		checkLocationOverlap();

		console.log('res is birth:', app.data.employeesResidenceIsBirthplace);
		console.log('res is off:', app.data.employeesResidenceIsOffice);
		console.log('birth is off:', app.data.employeesBirthplaceIsOffice);
		console.log('all:', app.data.employeesResidenceIsBirthplaceIsOffice);
	};



	// define public methods that are available through app
	var publicMethodsAndProps = {
		init
	};

	return publicMethodsAndProps;

})(jQuery);