window.app = window.app || {};

(function($) {

	'use strict';

	var $sgBody = $('body'),
		app = window.app;

	// vars for datasets

	app.data = {
		employees: [],// this is the array with all the employees. All reference to an employee points to an item in this array.
		buckets: {
			// use field name in .csv as property name
			// use the same property-names we use in app.data.employees if possible
			gender: { guiName: 'Gender', dataset: []},
			discipline: { guiName: 'Discipline', dataset: []},
			organisationalUnit: { guiName: 'Organisational unit', dataset: []},
			office: { guiName: 'Office', dataset: []},
			parttimePercentage: { guiName: 'Parttime percentage', dataset: []},
			hoursPerWeek: { guiName: 'Hours per week', dataset: []},
			ageRound: { guiName: 'Age', dataset: []},
			startYear: { guiName: 'Starting year', dataset: []}
		},
		offices: [],
		hometowns: [],
		placesWithoutGeoData: [],
		levels: ['senior', 'stagiair', 'junior'],
		ages: [],
		averageAge: 0,
		employeesPerYear: [],
		employeesStartedPerYear: [],
		employeesResidenceIsBirthplace: 0,
		employeesResidenceIsOffice: 0,
		employeesResidenceIsOtherOffice: 0,
		employeesBirthplaceIsOffice: 0,
		employeesResidenceIsBirthplaceIsOffice: 0,
	};

	app.colors = {
		band31: ['#fecc00','#fbbd18','#f9ae24','#f59f2c','#f18f32','#ee7f36','#e96e3a','#e55d3d','#e0493f','#db3241','#d60042','#d23352','#cd4a64','#c75c75','#bf6d86','#b57b99','#a889ac','#9798c0','#80a4d3','#60b0e6','#00bdfa','#45c1f9','#65c6f8','#7dcbf7','#90d0f6','#a0d5f4','#b1daf3','#c1def2','#d0e3f1','#dfe8ef','#ecedee']
	};



	/**
	* create svg for graph
	* @returns {undefined}
	*/
	var initSimulation = function() {
		let $svg = $('#nodes-chart-svg');
		app.nodes.elements.nodesSvg = d3.select('#nodes-chart-svg');
		app.nodes.elements.nodesSvgWidth = $svg.width();
		app.nodes.elements.nodesSvgHeight = $svg.height();
	};



	/**
	* handle geo sorting
	* @returns {undefined}
	*/
	const geoSortHandler = function(e) {
		e.preventDefault();

		app.nodes.setNodeSize(2);
		app.nodes.setNodeSpacing(0);
		
		var $tgt = $(e.currentTarget),
			coordsProp = $tgt.attr('data-geo-sort'),
			defaultX = app.nodes.elements.nodesSvgWidth -50,
			defaultY = 50;
		app.nodes.elements.infoProp = $tgt.attr('data-info-property');

		app.simulation.changeForce('forceX', app.simulation.xForce(app.simulation.getGeoForce('x', coordsProp, defaultX)));
		app.simulation.changeForce('forceY', app.simulation.yForce(app.simulation.getGeoForce('y', coordsProp, defaultY)));
		app.simulation.setDefaultCollisionForce();


		// set chart-context and highlights
		let selection = app.nodes.elements.nodes,
			dataset =  app.data.employees,
			activeContextIds = ['nodes-chart-context--map'],
			activeTakeawayIds;

		if (coordsProp === 'officeCoords') {
			removeHighlightClasses();
			$sgBody.addClass('highlight-office');
			app.nodes.removeNodeBackgrounds();
			activeTakeawayIds = ['topic-takeaways--offices'];
		}

		if (coordsProp === 'hometownCoords') {
			activeContextIds.push('nodes-chart-context--city-lines');
			activeTakeawayIds = ['topic-takeaways--hometown'];
			setTimeout(addResidenceLines, 2000);
		}

		if (coordsProp === 'birthplaceCoords') {
			activeContextIds.push('nodes-chart-context--unknown');
			activeTakeawayIds = ['topic-takeaways--birthplace'];
		}

		app.nodes.changeNodesChartTopic(selection, dataset, activeContextIds, activeTakeawayIds);

	};


	/**
	* handle grid sorting
	* @returns {undefined}
	*/
	const gridSortHandler = function(e) {
		e.preventDefault();

		let simulation = app.simulation.getSimulation();
		simulation.stop();

		// do positioning stuff
		let selection = app.nodes.elements.nodes,
			positionFunction = app.nodes.getNodeGridPosition,
			duration = 1000,
			nodeSize = app.nodes.elements.defaultNodeSize,
			optionsForPositionFunction = {
				nodeSize: nodeSize
			};

		app.nodes.setNodePositions(selection, positionFunction, duration, optionsForPositionFunction)
			.attr('r', app.nodes.elements.defaultNodeSize);

		// do context stuff
		let dataset =  app.data.employees,
			activeContextIds = [],
			activeTakeawayIds = ['topic-takeaways--employees-general'];

		app.nodes.changeNodesChartTopic(selection, dataset, activeContextIds, activeTakeawayIds);
	};
	


	/**
	* initialize links for sorting nodes
	* @returns {undefined}
	*/
	var initSortingLinks = function() {
		// geo sorting
		$('[data-geo-sort]').on('click', geoSortHandler);
		$('#sort-by-grid').on('click', gridSortHandler);
		$('#sort-by-discipline').on('click', app.disciplinesNodesChart.activate);
		$('#sort-by-age').on('click', (e) => {
			app.agesNodesChart.activate(e);
			removeHighlightClasses();
			app.nodes.removeNodeBackgrounds(e);
			app.nodes.addAgeHighlighting(e);
			$sgBody.addClass('highlight-age');
		});
		// $('#sort-by-discipline').on('click', disciplineSortHandler);
	};




	/**
	* add lines between hometowns and offices
	* @returns {undefined}
	*/
	const addResidenceLines = function(placesChartSvg) {
		let linesGroup = document.getElementById('nodes-chart-context--city-lines');
		if (!linesGroup.firstChild) {
			// somehow using enter() does not prevent repeated adding of lines,
			// so check if the group contains lines already
			placesChartSvg = app.nodes.elements.nodesSvg;
			let svgGroup = placesChartSvg.select('#nodes-chart-context--city-lines'),
				lines = svgGroup.selectAll('.line')
					.data(app.data.employees)
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
		}
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
			app.nodes.removeNodeBackgrounds();
			$sgBody.addClass('highlight-gender');
		});

		$('#highlight-office').on('click', function(e) {
			e.preventDefault();
			removeHighlightClasses();
			app.nodes.removeNodeBackgrounds();
			$sgBody.addClass('highlight-office');
		});

		$('#highlight-age').on('click', function(e) {
			e.preventDefault();
			removeHighlightClasses();
			app.nodes.removeNodeBackgrounds();
			app.nodes.addAgeHighlighting();
			$sgBody.addClass('highlight-age');
		});

		$('#no-highlight').on('click', function(e) {
			e.preventDefault();
			removeHighlightClasses();
			app.nodes.removeNodeBackgrounds();
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
			let office = app.data.offices[i],
				item = '';
				
			items += '<li class="takeaway__office takeaway__office--' + office.city.toLowerCase() + '"">';
			items += '	<span class="takeaway__office-name">' + office.city + '</span>';
			items += '	<span class="takeaway__office-metric">' + office.employeeCount + '</span>';
			items += '</li>';
		}

		$list.append(items);
	};
	


	//-- Start age fucntions --


		/**
		* calculate and show age info
		* @returns {undefined}
		*/
		var calculateAgeInfo = function() {
			var avgYears = Math.floor(app.data.averageAge),
				avgMonths = Math.floor(12 * (app.data.averageAge % avgYears));

			$('#topic-takeaways--age').find('.age-years__number')
				.text(avgYears)
				.end()
				.find('.age-months__number')
				.text(avgMonths);
		};




	//-- End age functions --

	

	/**
	* set the total number of employees
	* @returns {undefined}
	*/
	var setEmployeeCount = function() {
		let $box = $('#topic-takeaways--employees-general'),
			$value = $box.find('.value--primary'),
			numEmployees = app.data.employees.length;

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
	* initialize and start the bubble chart simulation
	* @returns {undefined}
	*/
	const startSimulation = function() {
		// initialize force simulation
		app.simulation.initSimulation();
		// this kicks off the animation
		var sim = app.simulation.getSimulation();
		sim.on('tick', app.simulation.simulationTickHandler);

		document.getElementById('nodes-chart-svg').classList.remove('nodes-chart--is-not-initiated');
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
		app.data.employees = employees;
		app.data.offices = offices;
		app.data.hometowns = cities;
		app.data.employeesPerYear = employeesPerYear;

		// initialize geo stuff
		app.map.init(mapData, app.nodes.elements.nodesSvg, '#nodes-chart-context--map');


		// process employee data
		app.dataprocessorEmployees.init();

		// process all geo-related data
		app.dataprocessorGeo.init();
		initEmployeesPerOfficeList();

		// add shapes for nodes
		app.nodes.init();
		setEmployeeCount();

		let firstDelay = 200;
		app.nodes.revealNodes(firstDelay);
			// let devMode = true;// skip delays while developing
			// app.nodes.revealNodes(firstDelay, devMode);

		calculateAgeInfo();

		app.disciplinesNodesChart.init();
		app.agesNodesChart.init();

		app.genderFilters.init();
		app.otherFilters.init();

		app.lineChart.init();

		app.hoursPerWeekChart.init();

		// report data missing in dataset (for dev purposes only)
		app.dataprocessorGeo.reportMissingGeoData();

	};// loadHandler



	/**
	* load data and kick off rendering
	* @returns {undefined}
	*/
	var loadData = function() {
		d3.queue()
			// .defer(d3.csv, '../data/employees-12-2016.csv')
			.defer(d3.csv, '../data/employees-12-2017.csv')
			// .defer(d3.csv, '../data/employees-excerpt-real-data.csv')
			// .defer(d3.csv, '../data/employees-excerpt.csv')
			.defer(d3.json, '../data/provinces.topojson')
			.defer(d3.csv, '../data/offices-netherlands.csv')
			.defer(d3.csv, '../data/hometowns-and-birthplaces.csv')
			// .defer(d3.csv, '../data/employee-count-per-year-mockup.csv')
			.defer(d3.csv, '../data/employee-count-per-year.csv')
			.await(loadHandler);
	};



	/**
	* initialize the app
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