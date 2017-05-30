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
				addChartMargins: true,
				id: 'discipline'
			},
			activeContextIds = ['nodes-chart-context--discipline'],
			activeTakeawayIds = ['topic-takeaways--discipline'];

		// do context stuff
		app.nodes.changeNodesChartTopic(selection, dataset, activeContextIds, activeTakeawayIds);

		// call setNodePositions
		app.nodes.setNodePositions(selection, positionFunction, duration, optionsForPositionFunction)
			.attr('r', nodeSize);

	};
	

	/**
	* initialize the chart
	* @returns {undefined}
	*/
	const init = function() {
		let dataset = app.data.buckets.discipline.dataset,
			unitChartObjId = 'discipline',// will be used to identify this unit chart on employee object
			chartSelector = '#nodes-chart-context--discipline',
			sortProps = [{name: 'length', order: 'desc'}, {name: 'discipline'}],
			options = {
				sortFunction: app.util.sortBucketByEmployeeCount,
				margin: {
					top: 10,
					right: 30,
					bottom: 30,
					left: 200
				}
			}; 

		chart = new UnitChart(dataset, chartSelector, unitChartObjId, options);
	};
	


	// define public methods that are available through app
	const publicMethodsAndProps = {
		activate,
		getChart,
		init
	};

	return publicMethodsAndProps;

})(jQuery);
