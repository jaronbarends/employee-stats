window.app = window.app || {};

window.app.disciplinesNodesChart = (function($) {

	'use strict';

	let app = window.app,
		chart;

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


	/**
	* get the disciplines chart
	* @returns {undefined}
	*/
	const getChart = function() {
		return chart;
	};
	


	// define public methods that are available through app
	const publicMethodsAndProps = {
		getChart,
		init
	};

	return publicMethodsAndProps;

})(jQuery);
