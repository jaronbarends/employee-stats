window.app = window.app || {};

window.app.agesNodesChart = (function($) {

	'use strict';

	/* globals UnitChart */ //Tell jshint UnitChart exists as global var

	let app = window.app,
		chart;


	/**
	* get the disciplines chart
	* @returns {undefined}
	*/
	const getChart = function() {
		return chart;
	};


	/**
	* activate this chart
	* @returns {undefined}
	*/
	const activate = function(e) {
		e.preventDefault();
		let simulation = app.simulation.getSimulation();
		simulation.stop();

		let unitChartObject = app.agesNodesChart.getChart(),
			dataset = unitChartObject.getDataset(),
			selection = app.nodes.elements.nodes,
			positionFunction = unitChartObject.getNodePosition,
			duration = 1000,
			nodeSize = 4,
			optionsForPositionFunction = {
				ths: unitChartObject,
				addChartMargins: true,
				id: 'age'
			},
			activeContextIds = ['nodes-chart-context--age'],
			activeTakeawayIds = ['topic-takeaways--age'];

		// dataset = app.

		// call setNodePositions
		app.nodes.setNodePositions(selection, positionFunction, duration, optionsForPositionFunction)
			.attr('r', nodeSize);

		// do context stuff
		app.nodes.changeNodesChartTopic(selection, dataset, activeContextIds, activeTakeawayIds);

	};
	

	/**
	* initialize the chart
	* @returns {undefined}
	*/
	const init = function() {
		let dataset = app.data.buckets.ageRound.dataset,
			unitChartObjId = 'age',// will be used to identify this unit chart on employee object
			chartContextSelector = '#nodes-chart-context--age',  
			options = {
				isHorizontal: false,
				margin: {
					top: 30,
					right: 10,
					bottom: 50,
					left: 30
				}
			};

		// we only want to show tick labels for ages that are a multiple of 5
		// so the css has to be something like nt-child(5n + x)
		// so we have to tell the css what the value of x should be
		let lowestAge = dataset[0].type,
			showTicks5nPlusX = 6 - lowestAge%5;
			if (showTicks5nPlusX === 6) {
				showTicks5nPlusX = 1;
			}

		chart = new UnitChart(dataset, chartContextSelector, unitChartObjId, options);
		document.querySelector(chartContextSelector+' .axis--x').setAttribute('data-tick-show-5n-plus-x', showTicks5nPlusX);
	};
	


	// define public methods that are available through app
	const publicMethodsAndProps = {
		activate,
		getChart,
		init
	};

	return publicMethodsAndProps;

})(jQuery);
