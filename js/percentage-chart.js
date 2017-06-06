window.app = window.app || {};

window.app.percentageChart = (function($) {

	'use strict';

	let app = window.app,
		chart;

	/**
	* 
	* @returns {undefined}
	*/
	const init = function() {
		const dataset = app.data.buckets.hoursPerWeek.dataset,
			chartSelector = '#unit-bar-chart--hours-per-week',
			barsGroupSelector = '#unit-bar-chart__bars--hours-per-week';

		const options = {
			isHorizontal: false
		};

		chart = new UnitBarChart(dataset, chartSelector, options);
	};



	// define public methods that are available through app
	const publicMethodsAndProps = {
		init
	};

	return publicMethodsAndProps;

})(jQuery);