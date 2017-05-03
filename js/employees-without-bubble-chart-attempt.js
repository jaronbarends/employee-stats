window.app = window.app || {};

(function($) {

	'use strict';


	var $sgBody = $('body');
	
	// vars for datasets

	app.data = {
		sgEmployees: [],
		employeeProps: [],
		sgOffices: [],
		sgHometowns: [],
		sgPlacesWithoutGeoData: [],
		sgLevels: ['senior', 'stagiair', 'junior'],
		sgBirthdays: [],
		sgAges: [],
		sgAvarageAge: 0
	};

	app.colors = {
		band31: ['#fecc00','#fbbd18','#f9ae24','#f59f2c','#f18f32','#ee7f36','#e96e3a','#e55d3d','#e0493f','#db3241','#d60042','#d23352','#cd4a64','#c75c75','#bf6d86','#b57b99','#a889ac','#9798c0','#80a4d3','#60b0e6','#00bdfa','#45c1f9','#65c6f8','#7dcbf7','#90d0f6','#a0d5f4','#b1daf3','#c1def2','#d0e3f1','#dfe8ef','#ecedee']
	}




	/**
	* enable the default view for filters (hide map, set collision etc)
	* @returns {undefined}
	*/
	var enableDefaultFilterView = function() {
		app.map.hide();
		app.nodes.setNodeSize();
		app.nodes.setNodeSpacing();
		app.simulation.setDefaultCollisionForce();
	};
	
	


	/**
	* initialize links for sorting nodes
	* @returns {undefined}
	*/
	var initSortingLinks = function() {
		
		$('#sort-by-gender').on('click', function(e) {
			e.preventDefault();
			enableDefaultFilterView();
			// app.simulation.changeForce('forceX', xForce(forceXGender));
			// app.simulation.changeForce('forceY', yForce(forceYCenter));
			app.simulation.changeForces('gender');
		});
		
		$('#sort-by-discipline').on('click', function(e) {
			e.preventDefault();
			enableDefaultFilterView();
			// app.simulation.changeForce('forceX', xForce(forceXDiscipline));
			// app.simulation.changeForce('forceY', yForce(forceYCenter));
			app.simulation.changeForces('discipline');
		});

		// geo sorting
		$('[data-geo-sort]').on('click', function(e) {
			e.preventDefault();
			app.nodes.setNodeSize(2);
			app.nodes.setNodeSpacing(0);
			app.map.show();
			
			var $tgt = $(e.currentTarget),
				coordsProp = $tgt.attr('data-geo-sort');

			app.simulation.geoCoordsProp = coordsProp;
			app.simulation.setGeoType(coordsProp);
			console.log('set app.simulation.geoCoordsProp to', coordsProp);
			app.nodes.elements.sgInfoProp = $tgt.attr('data-info-property');

			// app.simulation.changeForce('forceX', xForce(getGeoForce('x', coordsProp, 120)));
			// app.simulation.changeForce('forceY', yForce(getGeoForce('y', coordsProp, 20)));
			app.simulation.changeForces('geo');
			app.simulation.setDefaultCollisionForce();
		});
		

		$('#no-sorting').on('click', function(e) {
			e.preventDefault();
			enableDefaultFilterView();
			app.simulation.changeForces('default');
			// app.simulation.changeForce('forceX', xForce(forceXGrid));
			// app.simulation.changeForce('forceY', yForce(forceYGrid));
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
	
	









	/**
	* initialize list with employees per office
	* @returns {undefined}
	*/
	var initEmployeesPerOfficeList = function() {

		var $list = $('#office-list'),
			items = '';
		for (var i=0, len=app.data.offices.length; i<len; i++) {
			var office = app.data.offices[i];
			items += '<li>'+office.city + '(' + office.employeeCount + ')</li>';
		}

		$list.append(items);
	};
	


	/**
	* put comparable employee properties into array
	* @returns {undefined}
	*/
	var initEmployeeProperties = function() {
		for (var prop in app.data.employees[0]) {
			app.data.employeeProps.push(prop);
		}
	};
	


	/**
	* handle an employee's discipline data
	* - fill disciplines array
	* - put level into separate field
	* @returns {undefined}
	*/
	var processEmployeeDisciplines = function() {
		for (var i=0, len=app.data.employees.length; i<len; i++) {
			var emp = app.data.employees[i],
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

		for (var i=0, len=app.data.employees.length; i<len; i++) {
			var emp = app.data.employees[i];

			// process age data
			app.data.sgBirthdays.push(emp.birthday);
			var age = app.util.getYearsUntilToday(emp.birthday),
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
		app.data.sgAverageAge = ageSum / app.data.employees.length;
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
		for (var i=0, len=app.data.employees.length; i<len; i++) {
			var employee = app.data.employees[i];

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


	//-- End age functions --

	


	

	/**
	* set the total number of employees
	* @returns {undefined}
	*/
	var setEmployeeCount = function() {
		var $box = $('#info-box--employees-general'),
			$value = $box.find('.value--primary'),
			numEmployees = app.data.employees.length;

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
		app.data.employees = employees;
		app.data.offices = offices;
		app.data.sgHometowns = cities;

		// put original employee properties into array before we add all kind of helper props
		initEmployeeProperties();

		// initialize geo stuff
		// initMap(mapData);
		app.map.init(mapData);

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
		app.simulation.initSimulation();
		// this kicks off the animation
		// sgSimulation.on('tick', simulationTickHandler);
		app.simulation.sgSimulation.on('tick', app.simulation.simulationTickHandler);

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
		app.simulation.init();
		initSortingLinks();
		initHighlightLinks();

		// load data and kick things off
		loadData();
	};
	
	$(document).ready(init);

})(jQuery);