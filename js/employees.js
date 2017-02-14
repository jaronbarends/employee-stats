(function($) {

	'use strict';

	// vars for graph's svg
	var sgSvg,
		sgSvgMargin = {
			top: 0, 
			left: 0,
			right: 0,
			bottom: 0
		},
		sgSvgCanvasWidth = 500,
		sgSvgCanvasHeight = 600,
		sgSvgWidth = sgSvgCanvasWidth - sgSvgMargin.left - sgSvgMargin.right,
		sgSvgHeight = sgSvgCanvasHeight - sgSvgMargin.top - sgSvgMargin.bottom,
		sgGroupTranslate = 'translate(' + sgSvgMargin.left + ', ' + sgSvgMargin.top + ')';

	// vars for svg-groups
	var sgEmployeesG,
		sgGeoG;

	// vars for employee nodes
	var sgNodes,
		sgDefaultNodeSize = 5,
		sgNodeSize = sgDefaultNodeSize,
		sgNodeSpacing = 1;

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
	var createSvg = function() {
		sgSvg = d3.select('#chart')
			.append('svg')
			.attr('width', sgSvgCanvasWidth)
			.attr('height', sgSvgCanvasHeight);
	};


	//-- Start force / simulation functions


		//-- Start force definitions

			/**
			* x-force for hometown
			* @returns {number}	the x coordinate to move to
			* @param {object} d current object's data
			*/
			var forceXHometown = function(d) {
				var x = d.hometownX || 20;
				return x;
			};

			/**
			* y-force for hometown
			* @returns {number}	the y coordinate to move to
			* @param {object} d current object's data
			*/
			var forceYHometown = function(d) {
				var y = d.hometownY || 120;
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

		sgNodes = employeeG.selectAll('.employee')
			.data(datapoints)
			.enter()
			.append('circle')
			.attr('class', 'employee')
			.attr('r', sgNodeSize)
			.on('mouseover', function(d) {
				var name = d.firstName;
				name += d.preposition ? ' ' + d.preposition : '';
				name += ' ' + d.lastName
				console.log(name);
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
	* initialize buttons
	* @returns {undefined}
	*/
	var initButtons = function() {
		
		d3.select('#split-by-gender').on('click', function() {
			hideMap();
			setNodeSize();
			setDefaultCollisionForce();
			changeForce('forceX', xForce(forceXGender));
			changeForce('forceY', yForce(forceYCenter));
		});
		
		d3.select('#split-by-discipline').on('click', function() {
			hideMap();
			setNodeSize();
			setDefaultCollisionForce();
			changeForce('forceX', xForce(forceXDiscipline));
			changeForce('forceY', yForce(forceYCenter));
		});
		
		d3.select('#split-by-hometown').on('click', function() {
			setNodeSize(2);
			showMap();
			changeForce('forceX', xForce(forceXHometown));
			changeForce('forceY', yForce(forceYHometown));
			setDefaultCollisionForce();
		});

		d3.select('#combined').on('click', function() {
			hideMap();
			setNodeSize();
			setDefaultCollisionForce();
			changeForce('forceX', xForce(forceXCenter));
			changeForce('forceY', yForce(forceYCenter));
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
			sgMap.classed('map--is-active', true);
		};


		/**
		* hide the map
		* @returns {undefined}
		*/
		var hideMap = function() {
			sgMap.classed('map--is-active', false);
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
		var addOffices = function(offices) {
			sgMap.selectAll('.office')
				.data(offices)
				.enter()
				.append('circle')
				.attr('class', 'office')
				// .attr('r', function(d) {
				// 	return getRadiusByPopulation(100000)
				// })
				.attr('r', 10)
				.attr('cx', function(d) {
					var coords = sgProjection([d.Longitude, d.Latitude]);
					return coords[0];
				})
				.attr('cy', function(d) {
					var coords = sgProjection([d.Longitude, d.Latitude]);
					return coords[1];
				})
		};
	
	

		/**
		* initialize geo stuff
		* @returns {undefined}
		*/
		var initGeo = function(mapData, offices) {
			
			var geojson = topojson.feature(mapData, mapData.objects.collection);

			drawMap(geojson);
			addOffices(offices);
		};
	

	//-- End geo functions --


	/**
	* enrich employee data based on other fetched data (like geo info)
	* @returns {undefined}
	*/
	var enrichEmployeeData = function(employees, cities) {
		// console.log(cities);

		for (var i=0, len=employees.length; i<len; i++) {
			var employee = employees[i],
				hometown = employee.hometown.toLowerCase();

			for (var j=0, len2=cities.length; j<len2; j++) {
				var city = cities[j];
				if (city.city.toLowerCase() === hometown) {
					// calculate the city's coords in the map projection
					var coords = sgProjection([city.long, city.lat]);
					employee.hometownLat = city.lat;
					employee.hometownLong = city.long;
					employee.hometownX = coords[0];
					employee.hometownY = coords[1];
					break;
				}
			}

			if (!employee.hometownLat) {
				console.log('no geo for ', employee.hometown);
			}
		}
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
		// initialize geo stuff
		initGeo(mapData, offices);

		enrichEmployeeData(employees, cities);

		// add shapes for nodes
		addEmployeeNodes(employees);

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
		createSvg();
		initSimulation();
		initButtons();

		// load data and kick things off
		loadData();
	};
	
	$(document).ready(init);

})(jQuery);