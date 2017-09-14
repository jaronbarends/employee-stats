window.app = window.app || {};

window.app.hoursPerWeekChart = (function($) {

	'use strict';

	let app = window.app,
		chart,
		dataset;

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
	* calculate the total hours per week all employees work toghether
	* @returns {number}
	*/
	const calculateTotalHoursPerWeek = function() {
		let totalHoursPerWeek = 0,
			employeeCount = 0;

		dataset.forEach( (group) => {
			let groupEmployeeCount = group.employees.length,
				groupHours = group.type,
				groupTotalHoursPerWeek = groupEmployeeCount * groupHours;

			employeeCount += groupEmployeeCount;
			totalHoursPerWeek += groupTotalHoursPerWeek;
		});

		// now let's try to subtract vacation days
		const avgHoursPerWeek = totalHoursPerWeek / employeeCount,
			avgFTE = avgHoursPerWeek / 40,
			avgHoursPerDay = avgHoursPerWeek / 5,
			publicHolidays = 7,// 1-1, paasmaandag, koningsdag, hemelvaart, 2e pinsterdag, 2*kerst
			vacationDays = 25,
			grossWorkableDaysPerYear = 260;
			
		const netWorkableDaysPerYear = grossWorkableDaysPerYear - vacationDays - publicHolidays,
			avgWeeksPerYear = 365 / 7,
			avgWorkingDaysPerWeek = netWorkableDaysPerYear / avgWeeksPerYear;

		const avgWorkingHoursPerWeek = avgWorkingDaysPerWeek * avgHoursPerDay,
			netTotalHoursPerWeek = employeeCount * avgWorkingHoursPerWeek;

		return netTotalHoursPerWeek;
	};
	


	/**
	* initialize takeaways
	* @returns {undefined}
	*/
	const initTakeaways = function() {
		// calculate total hours per week
		const totalHours = calculateTotalHoursPerWeek(),
			roundedHours = 100*Math.round(totalHours/100),
			thousands = Math.floor(roundedHours/1000),
			hundreds = roundedHours - 1000 * thousands,
			formattedRoundedHours = thousands + ',' + hundreds;
		
		document.getElementById('total-hours-per-week').textContent = formattedRoundedHours;
	};
	


	/**
	* initialize the chart for hours per week
	* @returns {undefined}
	*/
	const initChart = function() {
		const chartSelector = '#unit-bar-chart--hours-per-week',
			primarySortProperty = {name: 'hoursPerWeek'},
			sortProperties = [
				primarySortProperty,
				{name: 'gender', order: 'desc'},// we want women first, and in dataset the values are dutch: 'man' and 'vrouw'
				{name: 'office'}
			],
			sortFunction = app.util.getEmployeeSortFunction(sortProperties);
		const options = {
			isHorizontal: false,
			primarySortProperty,
			sortFunction,
			margin: {
				top: 10,
				right: 0,
				bottom: 30,
				left: 40
			}
		};

		dataset = app.data.buckets.hoursPerWeek.dataset,

		chart = new UnitBarChart(dataset, chartSelector, options);
	};
	


	/**
	* initialize the chart and takeaways
	* @returns {undefined}
	*/
	const init = function() {
		initChart();
		initTakeaways();
	};



	// define public methods that are available through app
	const publicMethodsAndProps = {
		init
	};

	return publicMethodsAndProps;

})(jQuery);