window.app = window.app || {};

window.app.disciplinesNodesChart = (function($) {

	'use strict';

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

		let unitChartObject = app.disciplinesNodesChart.getChart(),
			dataset = unitChartObject.getDataset(),
			selection = app.nodes.elements.nodes,
			positionFunction = unitChartObject.getNodePosition,
			duration = 1000,
			nodeSize = 4,
			optionsForPositionFunction = {
				ths: unitChartObject,
				addChartMargins: true
			},
			activeContextIds = ['nodes-chart-context--discipline'],
			activeTakeawayIds = ['topic-takeaways--discipline'];

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
		let dataset = app.data.buckets.discipline.dataset,
			chartSelector = '#nodes-chart-context--discipline',  
			options = {
				margin: {
					top: 10,
					right: 30,
					bottom: 30,
					left: 200
				}
			};

		chart = new UnitChart(dataset, chartSelector, options);
	};
	


	// define public methods that are available through app
	const publicMethodsAndProps = {
		activate,
		getChart,
		init
	};

	return publicMethodsAndProps;

})(jQuery);
