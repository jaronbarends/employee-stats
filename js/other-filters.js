window.app = window.app || {};

window.app.otherFilters = (function($) {

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
			formId: 'filter-charts-form',
			bucketNames: [
				'office',
				'gender',
				'discipline',
				'organisationalUnit',
				'parttimePercentage'
			],
			propNames: [
				'discipline',
				'office',
				'gender',
				'organisationalUnit',
				'parttimePercentage'
			],
			selectedBucket: 'office',
			selectedProp: 'discipline'
		};

		app.filters.init(options);
	};



	// define public methods that are available through app
	const publicMethodsAndProps = {
		init
	};

	return publicMethodsAndProps;

})(jQuery);