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
		return b.employees.length - a.employees.length;
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


	
	// define public methods that are available through app
	var publicMethodsAndProps = {
		removeBodyClasses,
		convertToClassName,
		randomizeArray,
		sortBucketByEmployeeCount,
		getYearsUntilToday,
		getEmployeeClasses
	};

	return publicMethodsAndProps;

})(jQuery);