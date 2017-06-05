window.app = window.app || {};

window.app.percentageChart = (function($) {

	'use strict';

	let app = window.app;

	/**
	* 
	* @returns {undefined}
	*/
	const init = function() {
		let dataset = app.data.buckets.parttimePercentage;
		console.log(dataset);
	};



	// define public methods that are available through app
	const publicMethodsAndProps = {
		init
	};

	return publicMethodsAndProps;

})(jQuery);