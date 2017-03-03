window.app = window.app || {};

(function($) {

	'use strict';


	var $sgBody = $('body');
	
	// vars for datasets

	app.data = {
		sgEmployees: [],
		sgEmployeeProps: [],
		sgOffices: [],
		sgHometowns: [],
		sgPlacesWithoutGeoData: [],
		sgLevels: ['senior', 'stagiair', 'junior'],
		sgBirthdays: [],
		sgAges: [],
		sgAvarageAge: 0
	};


	// vars for geo stuff
	app.map = {
		sgProjection: null,
		sgPath: null,
		sgMap: null
	};

	// vars for simulation
	var sgSimulation,
		sgForceStrength = 0.04,
		sgAlphaTarget = 0.4;

	app.colors = {
		band31: ['#fecc00','#fbbd18','#f9ae24','#f59f2c','#f18f32','#ee7f36','#e96e3a','#e55d3d','#e0493f','#db3241','#d60042','#d23352','#cd4a64','#c75c75','#bf6d86','#b57b99','#a889ac','#9798c0','#80a4d3','#60b0e6','#00bdfa','#45c1f9','#65c6f8','#7dcbf7','#90d0f6','#a0d5f4','#b1daf3','#c1def2','#d0e3f1','#dfe8ef','#ecedee']
	}



	/**
	* create svg for graph
	* @returns {undefined}
	*/
	var initBubbleChart = function() {
		app.nodes.elements.sgNodesChart = d3.select('#bubble-chart');
		app.nodes.elements.$sgNodesChart = $('#bubble-chart');
		app.nodes.elements.sgNodesChartWidth = app.nodes.elements.$sgNodesChart.width();
		app.nodes.elements.sgNodesChartHeight = app.nodes.elements.$sgNodesChart.height();
	};


	//-- Start force / simulation functions


		//-- Start force definitions


			/**
			* get a force function for a location
			* @param {ob} coordsProp The object containing the coordinates for the location
			* @returns {function} a force-function
			*/
			var getGeoForce = function(xOrY, coordsProp, defaultValue) {
				var forceFunction = function(d) {
					var xOrYValue = d[coordsProp][xOrY] || defaultValue;
					return xOrYValue;
				};
				return forceFunction;
			};
		

			/**
			* x-force for filter by gender
			* @returns {number}	the x coordinate to move to
			* @param {object} d current object's data
			*/
			var forceXGender = function(d) {
				var x = app.nodes.elements.sgNodesChartWidth/4;
				if (d.gender.toLowerCase() === 'man') {
					x = 3*app.nodes.elements.sgNodesChartWidth/4;
				}
				return x;
			};


			/**
			* x-force for filtering by discipline
			* @returns {number}	the x coordinate to move to
			* @param {object} d current object's data
			*/
			var forceXDiscipline = function(d) {
				var x = app.nodes.elements.sgNodesChartWidth/4;
				if (d.discipline === 'frontend development' || d.discipline === 'visual design' || d.discipline === 'interaction design') {
					x = app.nodes.elements.sgNodesChartWidth/2;
				} else if (d.discipline === 'backend development') {
					x = 4*app.nodes.elements.sgNodesChartWidth / 5;
				}
				return x;
			};


			/**
			* x-force for positioning all nodes on a grid
			* @returns {undefined}
			*/
			var forceXGrid = function(d, i) {
				return app.nodes.getNodeGridPosition(i)[0];
			};


			/**
			* y-force for positioning all nodes on a grid
			* @returns {undefined}
			*/
			var forceYGrid = function(d, i) {
				return app.nodes.getNodeGridPosition(i)[1];
			};
			


			/**
			* x-force for all nodes centered
			* @returns {number}	the x coordinate to move to
			* @param {object} d current object's data
			*/
			var forceXCenter = function(d) {
				return app.nodes.elements.sgNodesChartWidth / 2;
			};


			/**
			* y-force for all nodes centered
			* @returns {number}	the y coordinate to move to
			* @param {object} d current object's data
			*/
			var forceYCenter = function(d) {
				return app.nodes.elements.sgNodesChartHeight / 2;
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
		* @returns {d3 simulation} the simulation object
		*/
		var setDefaultCollisionForce = function() {
			return sgSimulation.force('collide', d3.forceCollide(app.nodes.elements.sgNodeSize + app.nodes.elements.sgNodeSpacing));
		};


		/**
		* initialize the simulation
		* @returns {undefined}
		*/
		var initSimulation = function() {
			sgSimulation = d3.forceSimulation()
				.force('forceX', xForce(forceXGrid))
				.force('forceY', yForce(forceYGrid));

			setDefaultCollisionForce()
				.nodes(app.data.sgEmployees);	
		}


		/**
		* define what happens on simulation's ticked event
		* @returns {undefined}
		*/
		var simulationTickHandler = function() {
			app.nodes.elements.sgNodes
				.attr('cx', function(d) {
					return d.x;
				})
				.attr('cy', function(d) {
					return d.y;
				});
		};


		/**
		* change a simulation force
		* @returns {undefined}
		*/
		var changeForce = function(forceId, newForce) {
			sgSimulation
				.force(forceId, newForce)
				.alphaTarget(sgAlphaTarget)
				.alphaDecay(0.4)
				.restart();
		};
;

	//-- End force / simulation functions




	/**
	* enable the default view for filters (hide map, set collision etc)
	* @returns {undefined}
	*/
	var enableDefaultFilterView = function() {
		hideMap();
		app.nodes.setNodeSize();
		app.nodes.setNodeSpacing();
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

		// geo sorting
		$('[data-geo-sort]').on('click', function(e) {
			e.preventDefault();
			app.nodes.setNodeSize(2);
			app.nodes.setNodeSpacing(0);
			showMap();
			
			var $tgt = $(e.currentTarget),
				coordsProp = $tgt.attr('data-geo-sort');
			app.nodes.elements.sgInfoProp = $tgt.attr('data-info-property');

			changeForce('forceX', xForce(getGeoForce('x', coordsProp, 120)));
			changeForce('forceY', yForce(getGeoForce('y', coordsProp, 20)));
			setDefaultCollisionForce();
		});
		

		$('#no-sorting').on('click', function(e) {
			e.preventDefault();
			enableDefaultFilterView();
			changeForce('forceX', xForce(forceXGrid));
			changeForce('forceY', yForce(forceYGrid));
			// changeForce('forceX', xForce(forceXCenter));
			// changeForce('forceY', yForce(forceYCenter));
		});
	};
	
	



	/**
	* remove all highlight classes from the body element
	* @returns {undefined}
	*/
	var removeHighlightClasses = function() {
		app.util.removeBodyClasses(/^highlight-/);
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
	
	



	//-- Start map functions --



		/**
		* draw map of The Netherlands
		* @returns {undefined}
		*/
		var drawMap = function(geojson) {
			var provinces = geojson.features;

			app.map.sgProjection = d3.geoMercator().fitSize([app.nodes.elements.sgNodesChartWidth, app.nodes.elements.sgNodesChartHeight], geojson);
			app.map.sgPath = d3.geoPath().projection(app.map.sgProjection);

			app.map.sgMap = app.nodes.elements.sgNodesChart.selectAll('#geo-group')
				.attr('transform', app.nodes.elements.sgGroupTranslate);

			app.map.sgMap.selectAll('.province')
				.data(provinces)
				.enter()
				.append('path')
				.attr('class', 'province')
				.attr('d', app.map.sgPath);
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
		* add circles for offices
		* @returns {undefined}
		*/
		var addOffices = function() {
			app.map.sgMap.selectAll('.office')
				.data(app.data.sgOffices)
				.enter()
				.append('circle')
				.attr('class', 'office')
				.attr('r', 20)
				.attr('cx', function(d) {
					var coords = app.map.sgProjection([d.long, d.lat]);
					return coords[0];
				})
				.attr('cy', function(d) {
					var coords = app.map.sgProjection([d.long, d.lat]);
					return coords[1];
				})
		};
	
	

		/**
		* initialize map stuff
		* @returns {undefined}
		*/
		var initMap = function(mapData) {
			
			var geojson = topojson.feature(mapData, mapData.objects.collection);

			drawMap(geojson);
			addOffices();
		};
	

	//-- End map functions --






	/**
	* initialize list with employees per office
	* @returns {undefined}
	*/
	var initEmployeesPerOfficeList = function() {

		var $list = $('#office-list'),
			items = '';
		for (var i=0, len=app.data.sgOffices.length; i<len; i++) {
			var office = app.data.sgOffices[i];
			items += '<li>'+office.city + '(' + office.employeeCount + ')</li>';
		}

		$list.append(items);
	};
	


	/**
	* put comparable employee properties into array
	* @returns {undefined}
	*/
	var initEmployeeProperties = function() {
		for (var prop in app.data.sgEmployees[0]) {
			app.data.sgEmployeeProps.push(prop);
		}
	};
	


	/**
	* handle an employee's discipline data
	* - fill disciplines array
	* - put level into separate field
	* @returns {undefined}
	*/
	var processEmployeeDisciplines = function() {
		for (var i=0, len=app.data.sgEmployees.length; i<len; i++) {
			var emp = app.data.sgEmployees[i],
				discipline = emp.disciplineWithLevel,
				disciplineFound = false,
				level = '';

			// cut off level
			for (var lv=0, lvLen = app.data.sgLevels.length; lv<lvLen; lv++) {
				var currLevel = app.data.sgLevels[lv];
				
				if (discipline.toLowerCase().indexOf(currLevel) === 0) {
					discipline = discipline.substr(currLevel.length + 1);
					level = currLevel;

					// stagiairs often don't have discipline in their data
					// And I prefer not to count them within discipline anyhow
					if (level === 'stagiair') {
						discipline = 'stagiair';
					}
					break;
				}
			}

			// we've looped through the levels, so any level is cut of now
			// add the cleaned (or unchanged) discipline as a new property
			emp.discipline = discipline;
			emp.level = level;
		}
	};


	/**
	* process age and startdate data of employee
	* @returns {undefined}
	*/
	var processEmployeeAges = function() {
		var ages = [],
			ageMin = 1000,
			ageMax = 0,
			ageSum = 0;

		for (var i=0, len=app.data.sgEmployees.length; i<len; i++) {
			var emp = app.data.sgEmployees[i];

			// process age data
			app.data.sgBirthdays.push(emp.birthday);
			var age = getYearsUntilToday(emp.birthday),
				ageRound = Math.floor(age);


			// keep track of min and max ages, and the sum
			ageMin = Math.min(ageRound, ageMin);
			ageMax = Math.max(ageRound, ageMax);
			ageSum += age;

			// put age data into array
			if (!ages[ageRound]) {
				ages[ageRound] = 1;
				// this creates an array like ages[22], ages[15]
				// this is somehow different from a normal array like ages[0], [1] etc
			} else {
				ages[ageRound]++;
			}
		
		}// end loop employees

		// check if every age between min and max is present
		var ageRange = ageMax - ageMin;
		for (var a = 0; a <= ageRange; a++) {
			var currAge = ageMin + a;
			app.data.sgAges.push({
				age: currAge,
				employeeCount: ages[currAge] || 0
			});
		}

		// calculate avarage age
		app.data.sgAverageAge = ageSum / app.data.sgEmployees.length;
	};



	/**
	* add employee to group which specific prop
	* @param {string} employee The current employee
	* @param {string} groupName The property-name of the group
	* @returns {undefined}
	*/
	var addEmployeeToGroup = function(employee, groupName) {
		if (groupName === 'discipline') {
			// separate discipline and functionLevel
		}

		// check if this group already contains this employee's type
		var type = employee[groupName],
			dataset = app.filters.groups[groupName].dataset;

		if (! (type in dataset)) {
			dataset[type] = [];
		}
		dataset[type].push(employee);
	};
	
	
	

	/**
	* process data of employees (like fetching disciplines)
	* @returns {undefined}
	*/
	var processEmployeeData = function() {
		// process data we want to manipulate before use
		processEmployeeDisciplines();
		processEmployeeAges();

		// now popuplate filterGroups
		for (var i=0, len=app.data.sgEmployees.length; i<len; i++) {
			var employee = app.data.sgEmployees[i];

			// loop through employee groups and add this employee's data
			for (var groupName in app.filters.groups) {
				addEmployeeToGroup(employee, groupName);
			}
		}

		// console.log(app.filters.groups['discipline']);

	};



	//-- Start age fucntions --



		/**
		* create chart for age
		* @returns {undefined}
		*/
		var createAgeChart = function() {
			var ageChart = d3.select('#age-chart'),
				w = parseInt(ageChart.style('width'), 10),
				h = parseInt(ageChart.style('height'), 10),
				margin = {
					top: 10,
					right: 10,
					bottom: 30,
					left: 50
				},
				chartW = w - margin.left - margin.right,
				chartH = h - margin.top - margin.bottom,
				minAge = d3.min(app.data.sgAges, function(obj) {
					return obj.age;
				}),
				maxAge = d3.max(app.data.sgAges, function(obj) {
					return obj.age + 1;// op de een of andere manier moet dit +1 zijn, anders komt laatste bar niet in schaal
				});


			var xScale = d3.scaleBand()
					// .domain(d3.range(app.data.sgAges.length))
					.domain(d3.range(minAge, maxAge))
					.rangeRound([0, chartW])
					.padding(0.1);

					// console.log('ages:', app.data.sgAges);

			var yScale = d3.scaleLinear()
					.domain([0, d3.max(app.data.sgAges, function(obj) {
							return obj.employeeCount;
						})])
					.range([chartH, 0]);

			var xAxis = d3.axisBottom(xScale)
					.tickValues([25, 30, 35, 40, 45]),
				yAxis = d3.axisLeft(yScale)
					.ticks(3);

			// render bars
			ageChart.append('g')
				.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
				.selectAll('.age-bar')
				.data(app.data.sgAges)
				.enter()
				.append('rect')
				.attr('x', function(d, i) {
					return xScale(d.age);
				})
				.attr('y', function(d) {
					return yScale(d.employeeCount);
				})
				.attr('width', xScale.bandwidth())
				.attr('height', function(d) {
					return chartH - yScale(d.employeeCount);
				});

			// render axes
			ageChart.append('g')
				.attr('class', 'axis')
				.attr('transform', 'translate(' + margin.left +',' + (margin.top + chartH) +')')
				.call(xAxis);

			ageChart.append('g')
				.attr('class', 'axis')
				.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
				.call(yAxis);
		};


		/**
		* calculate and show age info
		* @returns {undefined}
		*/
		var calculateAgeInfo = function() {
			var avgYears = Math.floor(app.data.sgAverageAge),
				avgMonths = Math.floor(12 * (app.data.sgAverageAge % avgYears));

			$('#age-info').find('.age-years')
				.text(avgYears)
				.end()
				.find('.age-months').text(avgMonths);
		};


		/**
		* calculate the years passed between a certain date and today
		* @param {string} pastDateStr Date in the past, format d/m/y
		* @returns {number} The number of years (not rounded)
		*/
		var getYearsUntilToday = function(pastDateStr) {
			var now = new Date(),
				dateArr = pastDateStr.split('/'),
				pastDate = new Date(dateArr[2], dateArr[1]-1, dateArr[0]),// month is 0-based, hence -1
				nowMsecs = now.getTime(),
				pastDateMsecs = pastDate.getTime(),
				diffMsecs = nowMsecs - pastDateMsecs,// diff between dates in milliseconds
				diffYear = diffMsecs / (1000 * 60 * 60 * 24 * 365);// not entirely accurate (no leap years) but good enough for now

			return diffYear;
		};


	//-- End age functions --

	


	

	/**
	* set the total number of employees
	* @returns {undefined}
	*/
	var setEmployeeCount = function() {
		var $box = $('#info-box--employees-general'),
			$value = $box.find('.value--primary'),
			numEmployees = app.data.sgEmployees.length;

		$value.text(numEmployees);
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
		app.data.sgEmployees = employees;
		app.data.sgOffices = offices;
		app.data.sgHometowns = cities;

		// put original employee properties into array before we add all kind of helper props
		initEmployeeProperties();

		// initialize geo stuff
		initMap(mapData);

		// process all geo-related data
		// processGeoData();
		app.dataprocessorGeo.init();

		// process employee data (disciplines)
		setEmployeeCount();
		// defineFilterGroupsAndProps();
		processEmployeeData();

		initEmployeesPerOfficeList();


		// add shapes for nodes
		// addEmployeeNodes();
		app.nodes.init();

		createAgeChart();
		calculateAgeInfo();

		// initialize force simulation
		initSimulation();
		// this kicks off the animation
		sgSimulation.on('tick', simulationTickHandler);

		// initCompareTool();
		app.filters.init();

		// report data missing in dataset (for dev purposes only)
		// reportMissingGeoData();

	};// loadHandler


	/**
	* load data and kick off rendering
	* @returns {undefined}
	*/
	var loadData = function() {
		d3.queue()
			// .defer(d3.csv, 'data/employees.csv')
			.defer(d3.csv, 'data/employees-excerpt.csv')
			.defer(d3.json, 'data/provinces.topojson')
			.defer(d3.csv, 'data/offices-netherlands.csv')
			.defer(d3.csv, 'data/hometowns-and-birthplaces.csv')
			.await(loadHandler);
	};



	// load data and kick things off

	/**
	* initialize all
	* @returns {undefined}
	*/
	var init = function() {
		initBubbleChart();
		initSortingLinks();
		initHighlightLinks();

		// load data and kick things off
		loadData();
	};
	
	$(document).ready(init);

})(jQuery);