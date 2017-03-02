window.app = window.app || {};

app.util = (function($) {

	'use strict';

	var $sgBody = $('body'); 


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


	
	// define public methods that are available through app
	var publicMethods = {
		removeBodyClasses: removeBodyClasses,
		convertToClassName: convertToClassName,
		randomizeArray: randomizeArray,
	};

	return publicMethods;

})(jQuery);