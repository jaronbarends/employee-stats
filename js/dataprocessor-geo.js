window.app = window.app || {};

app.dataprocessorGeo = (function($) {

	'use strict';


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
		var matchEmployeesWithLocations = function(options) {
			var locationData = options.locationData,
				datasetLocationProp = options.datasetLocationProp,
				employeeLocationProp = options.employeeLocationProp,
				locationCoordsProp = options.locationCoordsProp,
				unknownPlaces = [];

			// enrich location-data: add prop for employee count to every location
			for (var i=0, locationCount=locationData.length; i<locationCount; i++) {
				locationData[i].employeeCount = 0;
			}

			// enrich employee-data
			for (var j=0, len=app.data.sgEmployees.length; j<len; j++) {
				var employee = app.data.sgEmployees[j],
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
						var coords = app.map.sgProjection([location.long, location.lat]);
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

				if (!locationFound) {
					app.data.sgPlacesWithoutGeoData.push(employee[employeeLocationProp]);
				}
			}

			// now order location by # of employees
			locationData.sort(function(a, b) {
				return b.employeeCount - a.employeeCount;
			});

		};
		


		/**
		* process hometown data
		* @returns {undefined}
		*/
		var processHometownData = function() {
			var options = {
				locationData: app.data.sgHometowns,
				datasetLocationProp: 'name',
				employeeLocationProp: 'hometown',
				locationCoordsProp: 'hometownCoords'
			};
			matchEmployeesWithLocations(options);

			var $list = $('#hometown-list'),
				items = '';
			for (var i=0; i<5; i++) {
				var hometown = app.data.sgHometowns[i];
				items += '<li>'+hometown.name + '(' + hometown.employeeCount + ')</li>';
			}

			$list.append(items);
		};


		/**
		* process birthplace data
		* @returns {undefined}
		*/
		var processBirthplaceData = function() {
			var options = {
				locationData: app.data.sgHometowns,
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
				locationData: app.data.sgOffices,
				datasetLocationProp: 'city',
				employeeLocationProp: 'office',
				locationCoordsProp: 'officeCoords'
			};
			matchEmployeesWithLocations(officeOptions);
		};


		/**
		* process data about locations
		* @returns {undefined}
		*/
		var processGeoData = function() {
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

				var uniqueUnknown = app.data.sgPlacesWithoutGeoData.unique(),
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
	};



	// define public methods that are available through app
	var publicMethodsAndProps = {
		init: init
	};

	return publicMethodsAndProps;

})(jQuery);