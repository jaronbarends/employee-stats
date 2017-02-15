(function($) {

	'use strict';

	var $sgBody = $('body');
	
	// vars for graph's svg
	var sgSvg,
		$sgSvg,
		sgSvgWidth,
		sgSvgHeight,
		sgGroupTranslate = 'translate(0,0)';

	// vars for svg-groups
	var sgEmployeesG,
		sgGeoG;

	// vars for employee nodes
	var sgNodes,
		sgDefaultNodeSize = 8,
		sgNodeSize = sgDefaultNodeSize,
		sgDefaultNodeSpacing = 2,
		sgNodeSpacing = sgDefaultNodeSpacing;

	// vars for datasets
	var sgEmployees,
		sgOffices,
		sgCities,
		sgDisciplines = [];

	// vars for geo stuff
	var sgProjection,
		sgPath,
		sgMap;

	// vars for simulation
	var sgSimulation,
		sgForceStrength = 0.04,
		sgAlphaTarget = 0.4;




	/**
	* create svg for graph
	* @returns {undefined}
	*/
	var initSvg = function() {
		sgSvg = d3.select('#main-svg');
		$sgSvg = $('#main-svg');
		sgSvgWidth = $sgSvg.width();
		sgSvgHeight = $sgSvg.height();
	};


	//-- Start force / simulation functions


		//-- Start force definitions

			/**
			* x-force for hometown
			* @returns {number}	the x coordinate to move to
			* @param {object} d current object's data
			*/
			var forceXHometown = function(d) {
				var x = d.hometownCoords.x || 20;
				return x;
			};

			/**
			* y-force for hometown
			* @returns {number}	the y coordinate to move to
			* @param {object} d current object's data
			*/
			var forceYHometown = function(d) {
				var y = d.hometownCoords.y || 120;
				return y;
			};

			/**
			* x-force for office
			* @returns {number}	the x coordinate to move to
			* @param {object} d current object's data
			*/
			var forceXOffice = function(d) {
				var x = d.officeCoords.x || 20;
				return x;
			};

			/**
			* y-force for office
			* @returns {number}	the y coordinate to move to
			* @param {object} d current object's data
			*/
			var forceYOffice = function(d) {
				var y = d.officeCoords.y || 120;
				return y;
			};


			/**
			* x-force for filter by gender
			* @returns {number}	the x coordinate to move to
			* @param {object} d current object's data
			*/
			var forceXGender = function(d) {
				var x = sgSvgWidth/3;
				if (d.gender === 'male') {
					x = 2*sgSvgWidth/3;
				}
				return x;
			};


			/**
			* x-force for filtering by discipline
			* @returns {number}	the x coordinate to move to
			* @param {object} d current object's data
			*/
			var forceXDiscipline = function(d) {
				var x = sgSvgWidth/4;
				if (d.discipline === 'frontend development' || d.discipline === 'visual design' || d.discipline === 'interaction design') {
					x = sgSvgWidth/2;
				} else if (d.discipline === 'backend development') {
					x = 4*sgSvgWidth / 5;
				}
				return x;
			};


			/**
			* x-force for all nodes combined
			* @returns {number}	the x coordinate to move to
			* @param {object} d current object's data
			*/
			var forceXCenter = function(d) {
				return sgSvgWidth / 2;
			};


			/**
			* y-force for all nodes combined
			* @returns {number}	the y coordinate to move to
			* @param {object} d current object's data
			*/
			var forceYCenter = function(d) {
				return sgSvgHeight / 2;
			};

		//-- Start force definitions
		


		/**
		* get an x-force definition
		* @param {function} forceFunction The force function to apply
		* @returns {force}
		*/
		var xForce = function(forceFunction) {
			return d3.forceX(forceFunction).strength(sgForceStrength);
		};
		


		/**
		* get an y-force definition
		* @param {function} forceFunction The force function to apply
		* @returns {force}
		*/
		var yForce = function(forceFunction) {
			return d3.forceY(forceFunction).strength(sgForceStrength);
		};



		/**
		* reset the collision force
		* @returns {undefined}
		*/
		var setDefaultCollisionForce = function() {
			sgSimulation.force('collide', d3.forceCollide(sgNodeSize + sgNodeSpacing));
		};
		
		
		


		/**
		* initialize the simulation
		* @returns {undefined}
		*/
		var initSimulation = function() {
			sgSimulation = d3.forceSimulation()
				.force('forceX', xForce(forceXCenter))
				.force('forceY', yForce(forceYCenter));
			setDefaultCollisionForce();	
		};


	//-- End force / simulation functions




	/**
	* add nodes to screen
	* @returns {undefined}
	*/
	var addEmployeeNodes = function(datapoints) {
		var employeeG = sgSvg.append('g')
				.attr('id', 'employee-group')
				.attr('transform', sgGroupTranslate);
			// centerX = sgSvgWidth/2,
			// centerY = sgSvgHeight/2;

		sgNodes = employeeG.selectAll('.employee')
			.data(datapoints)
			.enter()
			.append('circle')
			.attr('class', function(d) {
				var clsNames = [
					'employee',
					'employee--'+d.gender,
					'employee--office-'+d.office,
					'employee--discipline-'+d.discipline.replace(' ','-')
				],
				cls = clsNames.join(' ');

				return cls;
			})
			.attr('r', sgNodeSize)
			// .attr('cx', centerX)
			// .attr('cy', centerY)
			.on('mouseover', function(d) {
				var name = d.firstName;
				name += d.preposition ? ' ' + d.preposition : '';
				name += ' ' + d.lastName
				// console.log(name);
			});
	};


	/**
	* set size of employee nodes
	* @returns {undefined}
	*/
	var setNodeSize = function(size) {
		sgNodeSize = size || sgDefaultNodeSize;
		sgSvg.selectAll('.employee')
			.attr('r', sgNodeSize);
	};


	/**
	* set spacing between employee nodes
	* @returns {undefined}
	*/
	var setNodeSpacing = function(spacing) {
		if (typeof spacing === 'undefined') {
			spacing = sgDefaultNodeSpacing;
		}
		sgNodeSpacing = spacing;
	};
	


	/**
	* define what happens on simulation's ticked event
	* @returns {undefined}
	*/
	var simulationTickHandler = function() {
		sgNodes
			.attr('cx', function(d) {
				return d.x;
			})
			.attr('cy', function(d) {
				return d.y;
			})
	};


	/**
	* change a simulation force
	* @returns {undefined}
	*/
	var changeForce = function(forceId, newForce) {
		sgSimulation
			.force(forceId, newForce)
			.alphaTarget(sgAlphaTarget)
			.restart();
	};


	/**
	* enable the default view for filters (hide map, set collision etc)
	* @returns {undefined}
	*/
	var enableDefaultFilterView = function() {
		hideMap();
		setNodeSize();
		setNodeSpacing();
		setDefaultCollisionForce();
	};
	
	


	/**
	* initialize links for sorting nodes
	* @returns {undefined}
	*/
	var initSortingLinks = function() {
		
		$('#sort-by-gender').on('click', function(e) {
			e.preventDefault();
			enableDefaultFilterView();
			changeForce('forceX', xForce(forceXGender));
			changeForce('forceY', yForce(forceYCenter));
		});
		
		$('#sort-by-discipline').on('click', function(e) {
			e.preventDefault();
			enableDefaultFilterView();
			changeForce('forceX', xForce(forceXDiscipline));
			changeForce('forceY', yForce(forceYCenter));
		});
		
		$('#sort-by-hometown').on('click', function(e) {
			e.preventDefault();
			setNodeSize(2);
			setNodeSpacing(0);
			showMap();
			changeForce('forceX', xForce(forceXHometown));
			changeForce('forceY', yForce(forceYHometown));
			setDefaultCollisionForce();
		});
		
		$('#sort-by-office').on('click', function(e) {
			e.preventDefault();
			setNodeSize(2);
			setNodeSpacing(0);
			showMap();
			changeForce('forceX', xForce(forceXOffice));
			changeForce('forceY', yForce(forceYOffice));
			setDefaultCollisionForce();
		});

		$('#combined').on('click', function(e) {
			e.preventDefault();
			enableDefaultFilterView();
			changeForce('forceX', xForce(forceXCenter));
			changeForce('forceY', yForce(forceYCenter));
		});
	};


	/**
	* remove classes from the body element based on a pattern
	* @returns {undefined}
	*/
	var removeBodyClasses = function(pattern) {
		var classStr = $sgBody.attr('class');

		if (classStr) {
			var classes = classStr.split(' ');
			for (var i=classes.length-1; i>=0; i--) {
				var clss = classes[i];
				if (clss.match(pattern)) {
					$sgBody.removeClass(clss);
					classes.splice(i, 1);
				}
			}

		}
	};


	/**
	* remove all highlight classes from the body element
	* @returns {undefined}
	*/
	var removeHighlightClasses = function() {
		removeBodyClasses(/^highlight-/);
	};
	
	


	/**
	* initialize links for highlighting nodes
	* @returns {undefined}
	*/
	var initHighlightLinks = function() {
		$('#highlight-gender').on('click', function(e) {
			e.preventDefault();
			removeHighlightClasses();
			$sgBody.addClass('highlight-gender');
		});

		$('#no-highlight').on('click', function(e) {
			e.preventDefault();
			removeHighlightClasses();
		});
	};
	
	



	//-- Start geo functions --



		/**
		* draw map of The Netherlands
		* @returns {undefined}
		*/
		var drawMap = function(geojson) {
			var provinces = geojson.features;

			sgProjection = d3.geoMercator().fitSize([sgSvgWidth, sgSvgHeight], geojson);
			sgPath = d3.geoPath().projection(sgProjection);

			sgMap = sgSvg.append('g')
				.attr('id', 'geo-group')
				.attr('class', 'map')
				.attr('translate', sgGroupTranslate);

			sgMap.selectAll('.province')
				.data(provinces)
				.enter()
				.append('path')
				.attr('class', 'province')
				.attr('d', sgPath)
				.on('click', function(d) {
					// console.log(d.properties.OMSCHRIJVI);
					// console.log(d.properties.name);
				});
		};


		/**
		* show the map
		* @returns {undefined}
		*/
		var showMap = function() {
			$sgBody.addClass('map-view');
		};


		/**
		* hide the map
		* @returns {undefined}
		*/
		var hideMap = function() {
			$sgBody.removeClass('map-view');
		};
		



		/**
		* get a radius based on population
		* @returns {undefined}
		*/
		var getRadiusByPopulation = function(population) {
			var r = Math.round(population / 1000000);
			r = Math.max(2, r);

			return r;
		};
		

		/**
		* add circles for offices
		* @returns {undefined}
		*/
		var addOffices = function() {
			sgMap.selectAll('.office')
				.data(sgOffices)
				.enter()
				.append('circle')
				.attr('class', 'office')
				// .attr('r', function(d) {
				// 	return getRadiusByPopulation(100000)
				// })
				.attr('r', 10)
				.attr('cx', function(d) {
					var coords = sgProjection([d.long, d.lat]);
					return coords[0];
				})
				.attr('cy', function(d) {
					var coords = sgProjection([d.long, d.lat]);
					return coords[1];
				})
		};
	
	

		/**
		* initialize geo stuff
		* @returns {undefined}
		*/
		var initGeo = function(mapData) {
			
			var geojson = topojson.feature(mapData, mapData.objects.collection);

			drawMap(geojson);
			addOffices();
		};
	

	//-- End geo functions --


	/**
	* do stuff with city data:
	* enrich employee data based on other fetched data (like geo info)
	* and keep track of # of employees per city
	* @returns {undefined}
	*/
	var processCityData = function() {
		// console.log(cities);
		var dataset = sgCities,
			datasetLocationProp = 'name',
			employeeLocationProp = 'hometown',
			locationCoordsProp = 'hometownCoords';

		// add prop for employee count to every location
		for (var i=0, len=dataset.length; i<len; i++) {
			dataset[i].employeeCount = 0;
		}

		for (i=0, len=sgEmployees.length; i<len; i++) {
			var employee = sgEmployees[i],
				locationName = employee[employeeLocationProp].toLowerCase();

			// create a coordinates object
			employee[locationCoordsProp] = {};

			for (var j=0, len2=dataset.length; j<len2; j++) {
				var location = dataset[j];

				if (location.name.toLowerCase() === locationName) {
					// calculate the location's coords in the map projection
					var coords = sgProjection([location.long, location.lat]);
					employee[locationCoordsProp] = {
						x: coords[0],
						y: coords[1]
					};

					// keep track of # of employees per location
					location.employeeCount++;

					break;
				}
			}

			if (!employee[locationCoordsProp].x) {
				console.log('no geo for ', employee[employeeLocationProp]);
			}
		}

		// now order location by # of employees
		dataset.sort(function(a, b) {
			return b.employeeCount - a.employeeCount;
		});

	};


	/**
	* match employees with a set of locations (cities, offices)
	* @param {array} dataset The dataset containing the locations
	* @returns {undefined}
	*/
	var matchEmployeesWithLocations = function(options) {
		// console.log(cities);
		var dataset = options.dataset,
			datasetLocationProp = options.datasetLocationProp,
			employeeLocationProp = options.employeeLocationProp,
			locationCoordsProp = options.locationCoordsProp;

		// add prop for employee count to every location
		for (var i=0, len=dataset.length; i<len; i++) {
			dataset[i].employeeCount = 0;
		}

		for (i=0, len=sgEmployees.length; i<len; i++) {
			var employee = sgEmployees[i],
				locationName = employee[employeeLocationProp].toLowerCase();

			// create a coordinates object
			employee[locationCoordsProp] = {};

			for (var j=0, len2=dataset.length; j<len2; j++) {
				var location = dataset[j];

				if (location[datasetLocationProp].toLowerCase() === locationName) {
					// calculate the location's coords in the map projection
					var coords = sgProjection([location.long, location.lat]);
					employee[locationCoordsProp] = {
						x: coords[0],
						y: coords[1]
					};

					// keep track of # of employees per location
					location.employeeCount++;

					break;
				}
			}

			if (!employee[locationCoordsProp].x) {
				console.log('no geo for ', employee[employeeLocationProp]);
			}
		}

		// now order location by # of employees
		dataset.sort(function(a, b) {
			return b.employeeCount - a.employeeCount;
		});
	};
	


	/**
	* process data of employees (like fetching disciplines)
	* @param {object} employees Object with employee data
	* @returns {undefined}
	*/
	var processEmployeeData = function(employees) {
		for (var i=0, len=employees.length; i<len; i++) {
			var e = employees[i],
				discipline = e.discipline,
				disciplineFound = false;

				
			for (var j=0, len2=sgDisciplines.length; j<len2; j++) {
				var d = sgDisciplines[j];
				if (d.name === discipline) {
					d.employeeCount++;
					disciplineFound = true;
					break;
				}
			}
			
			if (!disciplineFound) {
				sgDisciplines.push({name: discipline, employeeCount: 1});
			}
		}

		// now order disciplines by # of employees
		sgDisciplines.sort(function(a, b) {
			return b.employeeCount - a.employeeCount;
		});
	};
	
	
	

	/**
	* handle loading of all data
	* @returns {undefined}
	* @param {object} error Error object
	* @param {object} employees Employee data
	* @param {object} mapData Geodata for map
	* @param {object} offices Data for offices (lat long etc)
	* @param {object} cities Data for cities (lat long etc)
	*/
	var loadHandler = function(error, employees, mapData, offices, cities) {
		// create semi globals for datasets
		sgEmployees = employees;
		sgOffices = offices;
		sgCities = cities;

		// initialize geo stuff
		initGeo(mapData);

		// process data
		var cityOptions = {
			dataset: sgCities,
			datasetLocationProp: 'name',
			employeeLocationProp: 'hometown',
			locationCoordsProp: 'hometownCoords'
		};
		matchEmployeesWithLocations(cityOptions);

		var officeOptions = {
			dataset: sgOffices,
			datasetLocationProp: 'city',
			employeeLocationProp: 'office',
			locationCoordsProp: 'officeCoords'
		};
		matchEmployeesWithLocations(officeOptions);

		// processCityData(employees, cities);
		processEmployeeData(employees);


		// add shapes for nodes
		addEmployeeNodes(employees);

		// initialize force simulation
		sgSimulation.nodes(employees)
			.on('tick', simulationTickHandler);

	}// loadHandler


	/**
	* load data and kick off rendering
	* @returns {undefined}
	*/
	var loadData = function() {
		d3.queue()
			.defer(d3.csv, 'data/employees.csv')
			.defer(d3.json, 'data/provinces.topojson')
			.defer(d3.csv, 'data/offices-netherlands.csv')
			.defer(d3.csv, 'data/city-lat-long.csv')
			.await(loadHandler);
	};



	// load data and kick things off

	/**
	* initialize all
	* @returns {undefined}
	*/
	var init = function() {
		initSvg();
		initSimulation();
		initSortingLinks();
		initHighlightLinks();

		// load data and kick things off
		loadData();
	};
	
	$(document).ready(init);

})(jQuery);