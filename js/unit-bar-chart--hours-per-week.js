window.app = window.app || {};

window.app.hoursPerWeekChart = (function($) {

	'use strict';

	let app = window.app,
		chart;

	/**
	* sorting function to sort the types in a bucket array by the number of employees
	* this function will be passed to the bucket array's sort function
	* @returns {number} a number which determines the sorting behavior
	*/
	const sortBucketByHoursPerWeek = function(a, b) {
		let result = b.hoursPerWeek - a.hoursPerWeek;

		// when count is equal, sort by gender
		if (result === 0 && a.gender && b.gender) {
			if (a.gender > b.gender) {
				result = 1;
			} else {
				result = -1;
			}
		}
		return result;
	};


	/**
	* 
	* @returns {undefined}
	*/
	const init = function() {
		const dataset = app.data.buckets.hoursPerWeek.dataset,
			chartSelector = '#unit-bar-chart--hours-per-week',
			barsGroupSelector = '#unit-bar-chart__bars--hours-per-week',
			sortProperties = [
				{name: 'hoursPerWeek'},
				{name: 'gender', order: 'desc'},// we want women first, and in dataset the values are dutch: 'man' and 'vrouw'
				{name: 'office'}
			],
			sortFunction = app.util.getEmployeeSortFunction(sortProperties);

		const options = {
			isHorizontal: false,
			sortFunction: sortFunction,
			margin: {
				top: 10,
				right: 0,
				bottom: 30,
				left: 40
			}
		};

		chart = new UnitBarChart(dataset, chartSelector, options);
	};



	// define public methods that are available through app
	const publicMethodsAndProps = {
		init
	};

	return publicMethodsAndProps;

})(jQuery);