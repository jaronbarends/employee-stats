window.app = window.app || {};

(function($) {

	'use strict';

	var $sgBody = $('body'),
		app = window.app;
	
	// vars for datasets

	app.data = {
		sgEmployees: [],
		sgEmployeeProps: [],
		buckets: {
			// use field name in .csv as property name
			// use the same property-names we use in app.data.sgEmployees if possible
			gender: { guiName: 'Gender', dataset: []},
			discipline: { guiName: 'Discipline', dataset: []},
			organisationalUnit: { guiName: 'Organisational unit', dataset: []},
			office: { guiName: 'Office', dataset: []},
			parttimePercentage: { guiName: 'Parttime percentage', dataset: []},
			ageRound: { guiName: 'Age', dataset: []},
			startYear: { guiName: 'Starting year', dataset: []}
		},
		sgOffices: [],
		sgHometowns: [],
		sgPlacesWithoutGeoData: [],
		sgLevels: ['senior', 'stagiair', 'junior'],
		sgAges: [],
		sgAvarageAge: 0,
		employeesPerYear: [],
		employeesStartedPerYear: []
	};


	// vars for simulation
	// var sgSimulation,
	// 	sgForceStrength = 0.04,
	// 	sgAlphaTarget = 0.4;

	app.colors = {
		band31: ['#fecc00','#fbbd18','#f9ae24','#f59f2c','#f18f32','#ee7f36','#e96e3a','#e55d3d','#e0493f','#db3241','#d60042','#d23352','#cd4a64','#c75c75','#bf6d86','#b57b99','#a889ac','#9798c0','#80a4d3','#60b0e6','#00bdfa','#45c1f9','#65c6f8','#7dcbf7','#90d0f6','#a0d5f4','#b1daf3','#c1def2','#d0e3f1','#dfe8ef','#ecedee']
	};



	/**
	* create svg for graph
	* @returns {undefined}
	*/
	var initSimulation = function() {
		app.nodes.elements.sgNodesSvg = d3.select('#bubble-chart');
		app.nodes.elements.$sgNodesSvg = $('#bubble-chart');
		app.nodes.elements.sgNodesSvgWidth = app.nodes.elements.$sgNodesSvg.width();
		app.nodes.elements.sgNodesSvgHeight = app.nodes.elements.$sgNodesSvg.height();
	};




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

		// geo sorting
		$('[data-geo-sort]').on('click', function(e) {
			e.preventDefault();
			app.nodes.setNodeSize(1.5);
			app.nodes.setNodeSize(2);
			app.nodes.setNodeSpacing(0);
			app.map.show();
			
			var $tgt = $(e.currentTarget),
				coordsProp = $tgt.attr('data-geo-sort');
			app.nodes.elements.sgInfoProp = $tgt.attr('data-info-property');

			app.simulation.changeForce('forceX', app.simulation.xForce(app.simulation.getGeoForce('x', coordsProp, 120)));
			app.simulation.changeForce('forceY', app.simulation.yForce(app.simulation.getGeoForce('y', coordsProp, 20)));
			app.simulation.setDefaultCollisionForce();

			if (coordsProp === 'officeCoords') {
				$sgBody.addClass('highlight-office');
			}

			if (coordsProp === 'hometownCoords') {
				setTimeout(addLines, 200);
			}
		});

		console.log(app.simulation);
		

		$('#sort-by-grid').on('click', function(e) {
			e.preventDefault();
			console.log(app.simulation.getSimulation());
			let simulation = app.simulation.getSimulation();
			simulation.stop();
			console.log(app.nodes.elements.sgDefaultNodeSize);

			let duration = 1000,
				nodeSize = app.nodes.elements.sgDefaultNodeSize,
				optionsForPositionFunction = {
					nodeSize: nodeSize
				};

			let selection = app.nodes.elements.sgNodes;
				// .transition()
				// .duration(1000)
				// .ease(d3.easeSinInOut)
				// .attr('r', app.nodes.elements.sgDefaultNodeSize);

			// app.nodes.elements.sgNodes
			// 	.attr('r', app.nodes.elements.sgDefaultNodeSize);

			// call setNodePositions and get selection back
			selection = app.nodes.setNodePositions(selection, app.nodes.getNodeGridPosition, duration, optionsForPositionFunction)
				.attr('r', app.nodes.elements.sgDefaultNodeSize);
			// setNodesContext('grid');
			// enableDefaultFilterView();
			// getGridPositions
			// app.simulation.changeForce('forceX', app.simulation.xForce(forceXGrid));
			// app.simulation.changeForce('forceY', app.simulation.yForce(forceYGrid));
		});
	};




	/**
	* add lines between hometowns and offices
	* @returns {undefined}
	*/
	const addLines = function(placesChartSvg) {
		placesChartSvg = app.nodes.elements.sgNodesSvg;
		let svgGroup = placesChartSvg.selectAll('.lines-group'),
			lines = svgGroup.selectAll('.line')
				.data(app.data.sgEmployees)
				.enter()
				.append('line')
				.attr('class', function(d) {
					let clss = 'line--office line--office-'+d.office.toLowerCase();
					return clss;
				})
				.attr('x1', function(d) {
					return d.officeCoords.x;
				})
				.attr('y1', function(d) {
					return d.officeCoords.y;
				})
				.attr('x2', function(d) {
					return d.hometownCoords.x;
				})
				.attr('y2', function(d) {
					return d.hometownCoords.y;
				});
				// .attr('stroke', 'rgba(0,0,0,0.3')
				// .attr('stroke-width', 1);
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

		$('#highlight-office').on('click', function(e) {
			e.preventDefault();
			removeHighlightClasses();
			$sgBody.addClass('highlight-office');
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
		let $box = $('#info-box--employees-general'),
			$value = $box.find('.value--primary'),
			numEmployees = app.data.sgEmployees.length;

		// define callback function for updating employee count
		const updateEmployeeNumber = function(e, data) {
			let count = data.revealed;
			$value.text(count);
			if (count === numEmployees) {
				$sgBody.off('nodeRevealed', updateEmployeeNumber);
				setTimeout(startSimulation, 500);
			}
		};

		$sgBody.on('nodeRevealed', updateEmployeeNumber);
		$box.addClass('infobox--is-initiated');
	};


	


	/**
	* draw unit chart for disciplines
	* @returns {undefined}
	*/
	var drawDisciplineChart = function() {
		let dataset = app.data.buckets.discipline.dataset,
			chartSelector = '#unit-chart--discipline',  
			options = {
				sortFunction: app.util.sortBucketByEmployeeCount,
				margin: {
					top: 10,
					right: 30,
					bottom: 30,
					left: 200
				}
			};

		app.unitChart.drawChart(dataset, chartSelector, options);
	};


	/**
	* draw unit chart for disciplines
	* @returns {undefined}
	*/
	var drawAgeChart = function() {
		let dataset = app.data.buckets.ageRound.dataset,
			chartSelector = '#unit-chart--age',  
			options = {
				isHorizontal: false,
				margin: {
					top: 30,
					right: 10,
					bottom: 50,
					left: 30
				}
			},
			lowestAge = dataset[0].type,
			showTicks5nPlus = 6 - lowestAge%5;

		app.unitChart.drawChart(dataset, chartSelector, options);
		document.querySelector('#unit-chart--age .axis--x').setAttribute('data-tick-show-5n-plus', showTicks5nPlus);
	};
	
	


	/**
	* initialize and start the bubble chart simulation
	* @returns {undefined}
	*/
	const startSimulation = function() {
		// initialize force simulation
		app.simulation.initSimulation();
		// this kicks off the animation
		var sim = app.simulation.getSimulation();
		// console.log('app.simulation.sgSimulation:', sim);
		// console.log('app.simulation.sgSimulation:', app.simulation.sgSimulation);
		// app.simulation.sgSimulation.on('tick', app.simulation.simulationTickHandler);
		
		sim.on('tick', app.simulation.simulationTickHandler);

		document.getElementById('bubble-chart').classList.remove('bubble-chart--is-not-initiated');
		document.getElementById('node-filter-box').classList.add('node-filter-box--is-active');
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
		// randomize array, so we don't get same view every time
		d3.shuffle(employees);

		// create semi globals for datasets
		app.data.sgEmployees = employees;
		app.data.sgOffices = offices;
		app.data.sgHometowns = cities;
		app.data.employeesPerYear = employeesPerYear;

		// initialize geo stuff
		app.map.init(mapData, app.nodes.elements.sgNodesSvg, '.map');


		// process employee data
		app.dataprocessorEmployees.init();

		// process all geo-related data
		app.dataprocessorGeo.init();
		initEmployeesPerOfficeList();

		
		// let placesChartSvg = d3.select('#places-chart'),
		// 	placesMapSelector = '.map';
		// app.map.init(mapData, placesChartSvg, placesMapSelector);
		// app.geoChartNodes.init(placesChartSvg);

		// add shapes for nodes
		app.nodes.init();
		setEmployeeCount();
		app.nodes.revealNodes();

		// app.ageChart.init();
		calculateAgeInfo();

		// app.disciplineChart.init();
		drawDisciplineChart();
		drawAgeChart();

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
			// .defer(d3.csv, 'data/employee-count-per-year-mockup.csv')
			.defer(d3.csv, 'data/employee-count-per-year.csv')
			.await(loadHandler);
	};


	// load data and kick things off

	/**
	* initialize all
	* @returns {undefined}
	*/
	var init = function() {
		initSimulation();
		initSortingLinks();
		initHighlightLinks();

		// load data and kick things off
		loadData();
	};
	
	$(document).ready(init);

})(jQuery);