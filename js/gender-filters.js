window.app = window.app || {};

window.app.genderFilters = (function($) {

	'use strict';

	let app = window.app;

	/**
	* 
	* @returns {undefined}
	*/
	const init = function() {
		// call filters.init for this type
		// define which props to include for comparison
		const options = {
			formId: 'gender-charts-form',
			bucketNames: [
				'office',
				'discipline',
				'organisationalUnit'
			],
			propNames: [
				'gender'
			]
		};

		app.filters.initCompareToolGeneric(options);
	};



	// define public methods that are available through app
	const publicMethodsAndProps = {
		init
	};

	return publicMethodsAndProps;

})(jQuery);