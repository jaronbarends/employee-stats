window.app = window.app || {};

app.bubbleChart = (function($) {

	'use strict';

	var $sgBody = $('body');
	
	// vars for graph's svg
	var sgBubbleChart,
		$sgBubbleChart,
		sgBubbleChartWidth,
		sgBubbleChartHeight,
		sgGroupTranslate = 'translate(0,0)';

	/**
	* create svg for graph
	* @returns {undefined}
	*/
	var init = function() {
		sgBubbleChart = d3.select('#bubble-chart');
		$sgBubbleChart = $('#bubble-chart');
		sgBubbleChartWidth = $sgBubbleChart.width();
		sgBubbleChartHeight = $sgBubbleChart.height();
	};



	// define public methods that are available through app
	var publicMethods = {
		init: init
	};

	return publicMethods;

})(jQuery);