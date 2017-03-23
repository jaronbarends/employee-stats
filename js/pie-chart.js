window.app = window.app || {};

window.app.pieChart = (function($) {

	'use strict';

	var app = window.app;

	/**
	* create a pie chart
	* @param {array} dataset The set to draw the chart for
	* @param {string} containerId The id of the element in the html containing the chart's svg
	* @returns {undefined}
	*/
	var drawChart = function(dataset, containerId, relativeSize, zup) {
		// console.log(dataset);
		var colorArray = app.util.randomizeArray(app.colors.band31.slice());//slice makes copy

		var dataAccessor = function(d) {
			return d.count;
		};

		if (typeof relativeSize === 'undefined') {
			relativeSize = 1;
		}

		var pie = d3.pie().value(dataAccessor)(dataset),
			svg = d3.select('#'+containerId)
				.append('svg')
				.attr('class', 'pie-chart'),
			svgWidth = parseInt(svg.style('width'), 10),
			maxRadius = svgWidth/2,
			outerRadius = maxRadius * Math.sqrt(relativeSize),
			innerRadius = 0,
			arc = d3.arc()
					.innerRadius(innerRadius)
					.outerRadius(outerRadius);

		var arcs = svg.selectAll('g.pie-segment')
			.data(pie)
			.enter()
			.append('g')
			.attr('transform', 'translate(' + svgWidth/2 + ',' + svgWidth/2 + ')');

		arcs.append('path')
			.attr('class', function(d) {
				// console.log(d.data);
				return 'pie-segment pie-segment--'+ app.util.convertToClassName(d.data.prop);
			})
			.attr('d', arc)
			.attr('fill', function(d,i) {
				var idx = i % colorArray.length;
				return colorArray[idx];
			})

		// now add some info
		var $chartBox = $('#'+containerId),
			info = '<h4>' + dataset[0].type + '</h4>';

		info += '<dl>';
		for (var i=0, len=dataset.length; i<len; i++) {
			info += '<dt>' + dataset[i].prop + '</dt><dd>' + dataset[i].count + '</dd>';
		}
		info += '</dl>';
		$chartBox.append(info);

	};
	



	// define public methods that are available through app
	var publicMethodsAndProps = {
		drawChart
	};

	return publicMethodsAndProps;

})(jQuery);