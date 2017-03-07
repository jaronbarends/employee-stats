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


	// vars for simulation
	// var sgSimulation,
	// 	sgForceStrength = 0.04,
	// 	sgAlphaTarget = 0.4;

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




	/**
	* enable the default view for filters (hide map, set collision etc)
	* @returns {undefined}
	*/
	var enableDefaultFilterView = function() {
		app.map.hide();
		app.nodes.setNodeSize();
		app.nodes.setNodeSpacing();
		app.bubbleChart.setDefaultCollisionForce();
	};
	
	


	/**
	* initialize links for sorting nodes
	* @returns {undefined}
	*/
	var initSortingLinks = function() {
		
		$('#sort-by-gender').on('click', function(e) {
			e.preventDefault();
			enableDefaultFilterView();
			app.bubbleChart.changeForce('forceX', app.bubbleChart.xForce(forceXGender));
			app.bubbleChart.changeForce('forceY', app.bubbleChart.yForce(forceYCenter));
		});
		
		$('#sort-by-discipline').on('click', function(e) {
			e.preventDefault();
			enableDefaultFilterView();
			app.bubbleChart.changeForce('forceX', app.bubbleChart.xForce(forceXDiscipline));
			app.bubbleChart.changeForce('forceY', app.bubbleChart.yForce(forceYCenter));
		});

		// geo sorting
		$('[data-geo-sort]').on('click', function(e) {
			e.preventDefault();
			app.nodes.setNodeSize(2);
			app.nodes.setNodeSpacing(0);
			app.map.show();
			
			var $tgt = $(e.currentTarget),
				coordsProp = $tgt.attr('data-geo-sort');
			app.nodes.elements.sgInfoProp = $tgt.attr('data-info-property');

			app.bubbleChart.changeForce('forceX', app.bubbleChart.xForce(app.bubbleChart.getGeoForce('x', coordsProp, 120)));
			app.bubbleChart.changeForce('forceY', app.bubbleChart.yForce(app.bubbleChart.getGeoForce('y', coordsProp, 20)));
			app.bubbleChart.setDefaultCollisionForce();
		});
		

		$('#no-sorting').on('click', function(e) {
			e.preventDefault();
			enableDefaultFilterView();
			app.bubbleChart.changeForce('forceX', app.bubbleChart.xForce(forceXGrid));
			app.bubbleChart.changeForce('forceY', app.bubbleChart.yForce(forceYGrid));
		});
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
		for (var i=0, len=app.data.sgOffices.length; i<len; i++) {
			var office = app.data.sgOffices[i];
			items += '<li>'+office.city + '(' + office.employeeCount + ')</li>';
		}

		$list.append(items);
	};
	


	//-- Start age fucntions --



		/**
		* create chart for age
		* @returns {undefined}
		*/
		var createAgeChart = function() {
			var ageChart = d3.select('#age-chart'),
				svgWidth = parseInt(ageChart.style('width'), 10),
				svgHeight = parseInt(ageChart.style('height'), 10),
				margin = {
					top: 10,
					right: 10,
					bottom: 30,
					left: 50
				},
				width = svgWidth - margin.left - margin.right,
				height = svgHeight - margin.top - margin.bottom,
				minAge = d3.min(app.data.sgAges, function(obj) {
					return obj.age;
				}),
				maxAge = d3.max(app.data.sgAges, function(obj) {
					return obj.age + 1;// op de een of andere manier moet dit +1 zijn, anders komt laatste bar niet in schaal
				});


			var xScale = d3.scaleBand()
					// .domain(d3.range(app.data.sgAges.length))
					.domain(d3.range(minAge, maxAge))
					.rangeRound([0, width])
					.padding(0.1);

					// console.log('ages:', app.data.sgAges);

			var yScale = d3.scaleLinear()
					.domain([0, d3.max(app.data.sgAges, function(obj) {
							return obj.employeeCount;
						})])
					.range([height, 0]);

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
					return height - yScale(d.employeeCount);
				});

			// render axes
			ageChart.append('g')
				.attr('class', 'axis')
				.attr('transform', 'translate(' + margin.left +',' + (margin.top + height) +')')
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
	* @param {object} employeesPerYear Data for number of employees per year
	*/
	var loadHandler = function(error, employees, mapData, offices, cities, employeesPerYear) {
		// create semi globals for datasets
		app.data.sgEmployees = employees;
		app.data.sgOffices = offices;
		app.data.sgHometowns = cities;
		app.data.employeeHistory = employeesPerYear;

		// app.dataprocessor.init();

		// put original employee properties into array before we add all kind of helper props
		// initEmployeeProperties();

		// initialize geo stuff
		app.map.init(mapData);

		// process all geo-related data
		app.dataprocessorGeo.init();

		// process employee data (disciplines)
		app.dataprocessor.init();
		// processEmployeeData();

		setEmployeeCount();
		initEmployeesPerOfficeList();


		// add shapes for nodes
		app.nodes.init();

		createAgeChart();
		calculateAgeInfo();

		// initialize force simulation
		app.bubbleChart.initSimulation();
		// this kicks off the animation
		var sim = app.bubbleChart.getSimulation();
		// console.log('app.bubbleChart.sgSimulation:', sim);
		// console.log('app.bubbleChart.sgSimulation:', app.bubbleChart.sgSimulation);
		// app.bubbleChart.sgSimulation.on('tick', app.bubbleChart.simulationTickHandler);
		sim.on('tick', app.bubbleChart.simulationTickHandler);

		app.filters.init();

		app.lineChart.init();

		// report data missing in dataset (for dev purposes only)
		// reportMissingGeoData();

	};// loadHandler


	/**
	* load data and kick off rendering
	* @returns {undefined}
	*/
	var loadData = function() {
		d3.queue()
			.defer(d3.csv, 'data/employees.csv')
			// .defer(d3.csv, 'data/employees-excerpt.csv')
			.defer(d3.json, 'data/provinces.topojson')
			.defer(d3.csv, 'data/offices-netherlands.csv')
			.defer(d3.csv, 'data/hometowns-and-birthplaces.csv')
			.defer(d3.csv, 'data/employee-count-per-year.csv')
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