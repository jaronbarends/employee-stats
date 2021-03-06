window.app = window.app || {};

window.app.util = (function($) {

	'use strict';

	var app = window.app;

	var $sgBody = $('body'); 


	/**
	* get the classes to put onto an employee node
	* @returns {undefined}
	*/
	const getEmployeeClasses = function(d) {
		let clsNames = [
			'employee',
			'employee--'+d.gender.toLowerCase(),
			'employee--office-'+d.office.toLowerCase(),
			'employee--discipline-'+d.discipline.toLowerCase().replace(' ','-')
		],
		cls = clsNames.join(' ');

		return cls;
	};
	


	/**
	* remove classes from the body element based on a pattern
	* @returns {undefined}
	*/
	var removeBodyClasses = function(pattern) {
		var classStr = $sgBody.attr('class');

		if (classStr) {
			var classes = classStr.split(' ');
			for (var i=classes.length-1; i>=0; i--) {
				var clss = classes[i];
				if (clss.match(pattern)) {
					$sgBody.removeClass(clss);
					classes.splice(i, 1);
				}
			}

		}
	};


	/**
	* convert a string to format that can be used as classname
	* @returns {undefined}
	*/
	var convertToClassName = function(str) {
		str = str.toLowerCase().replace(/[ \.]/, '-');

		return str;
	};



	/**
	* randomize the objects in an array
	* @param {array} arr The array to randomize
	* @returns {array} The randomized array
	*/
	var randomizeArray = function(arr) {
		var randomArr = [],
			len = arr.length;
		
		while(arr.length) {
			var idx = Math.floor(arr.length*Math.random());
			randomArr.push(arr.splice(idx,1)[0]);
		}

		return randomArr;
	};



	/**
	* sorting function to sort the types in a bucket array by the number of employees
	* this function will be passed to the bucket array's sort function
	* @returns {number} a number which determines the sorting behavior
	*/
	var sortBucketByEmployeeCount = function(a, b) {
		let result = b.employees.length - a.employees.length;

		// when count is equal, sort by type
		if (result === 0 && a.type && b.type) {
			if (a.type > b.type) {
				result = 1;
			} else {
				result = -1;
			}
		}
		return result;
	};


	/**
	* get a function you can pass to Array.sort to sort employees on multiple properties
	* for every property you need to specify the property name and optionally ASC(default) or DESC
	* @param {array} props Array of properties [{name:'propertyName', order: 'ASC|DESC'}, {...}, {...}]
	* @returns {function} The sort function to pass to Array.sort
	*/
	const getEmployeeSortFunction = function(props) {

		// define recursive comparison function we'll call multiple times
		const recursiveSort = function(a, b, i) {
			const prop = props[i],
				propName = prop.name,
				order = prop.order || 'ASC';
			let result = 0;

			// actual comparison
			if (a[propName] > b[propName]) {
				result = 1;
			} else if (a[propName] < b[propName]) {
				result = -1;
			}

			// if we want desc, invert the result
			if (result !== 0 && order.toLowerCase() === 'desc') {
				result = -result;
			}

			// if values are equal, and there are sorting properties left, call function again
			if (result === 0 && props[i+1]) {
				i++;
				result = recursiveSort(a, b, i);
			}

			return result;
		}

		// define function we'll call on array
		const sortFunction = function(a, b) {
			let i = 0;
			return recursiveSort(a, b, i);
		};

		return sortFunction;
	};
	



	/**
	* get sorting order (ascending or descending)
	* @returns {undefined}
	*/
	const getOrder = function(orderStr) {
		let order = 1;// ascending
		if (orderStr === 'desc') {
			order = -1;
		}

		return order;
	};
	


	/**
	* calculate the years passed between a certain date and today
	* @param {string} pastDateStr Date in the past, format d/m/y
	* @returns {number} The number of years (not rounded)
	*/
	var getYearsUntilToday = function(pastDateStr) {
		var now = new Date(),
			dateArr = pastDateStr.split('/'),
			pastDate = new Date(dateArr[2], dateArr[1]-1, dateArr[0]),// month is 0-based, hence -1
			nowMsecs = now.getTime(),
			pastDateMsecs = pastDate.getTime(),
			diffMsecs = nowMsecs - pastDateMsecs,// diff between dates in milliseconds
			diffYear = diffMsecs / (1000 * 60 * 60 * 24 * 365);// not entirely accurate (no leap years) but good enough for now

		return diffYear;
	};



	/**
	* get timing info for an iteration
	* for each iteration: what is its timeout
	* what is its cumulative delay from the start of the iteration
	*
	* @param {number} totalCount The total number of iterations
	* @param {number} firstDelay The delay of the first iteration (msec)
	* @returns {object} {timeouts, cumulativeDelays, relativeTotalDuration}
	*/
	const getTimeoutsAndDelays = function(totalCount, firstDelay, decay=0.98) {
		// dt[i] = dt[0]*Math.pow(decay, i)
		let power = 2,
			relativeTotalDuration = 0,// total duration relative to first delay (n*firstDelay)
			minTimeout = 10,
			timeouts = [],
			cumulativeDelays = [];

		// do a dry run to calculate all timeouts and cumulative delays
		for (let i=0; i<totalCount; i++) {
			let dt = firstDelay * Math.pow(decay, i*power),
				cumulativeDelay;

			dt = Math.max(dt, minTimeout);

			timeouts.push(dt);
			if (i === 0) {
				cumulativeDelay = 0;
			} else {
				cumulativeDelay = cumulativeDelays[i-1] + timeouts[i-1];
			}
			cumulativeDelays.push(cumulativeDelay);
			relativeTotalDuration += dt;
		}

		return {
			timeouts,
			cumulativeDelays,
			relativeTotalDuration
		};
	};


	/**
	 * A helper function that creates and returns an alphanumeric string that can be used in ID attributes
	 * 
	 * @param {number} [length=12] - Optional length of returned string
	 * @returns {string} - Generated alphanumeric string
	 */
	const getRandomId = (length=12) => {
	    let str = Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
	    return str;
	};


	// define public methods that are available through app
	var publicMethodsAndProps = {
		convertToClassName,
		getEmployeeClasses,
		getEmployeeSortFunction,
		getRandomId,
		getTimeoutsAndDelays,
		getYearsUntilToday,
		randomizeArray,
		removeBodyClasses,
		sortBucketByEmployeeCount,
	};

	return publicMethodsAndProps;

})(jQuery);