window.app = window.app || {};

app.pieChart = (function($) {

	'use strict';


	/**
	* create a pie chart
	* @returns {undefined}
	*/
	var drawChart = function(dataset, id) {
		// console.log(dataset);
		var colorArray = app.util.randomizeArray(app.colors.band31.slice());//slice makes copy

		var dataAccessor = function(d) {
			return d.count;
		};
		
		var pie = d3.pie().value(dataAccessor)(dataset),
			svg = d3.select('#'+id)
				.append('svg')
				.attr('class', 'pie-chart'),
			outerRadius = parseInt(svg.style('width'), 10)/2,
			innerRadius = outerRadius/3,
			arc = d3.arc()
					.innerRadius(innerRadius)
					.outerRadius(outerRadius);

		var arcs = svg.selectAll('g.pie-segment')
			.data(pie)
			.enter()
			.append('g')
			// .attr('class', 'pie-segment')
			.attr('transform', 'translate(' + outerRadius + ',' + outerRadius + ')');

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
		var $chartBox = $('#'+id),
			info = '<p>' + dataset[0].type;
		for (var i=0, len=dataset.length; i<len; i++) {
			info += '<br>' + dataset[i].prop + ':' + dataset[i].count;
		}
		info += '</p>';
		$chartBox.append(info);

	};
	



	// define public methods that are available through app
	var publicMethodsAndProps = {
		drawChart: drawChart
	};

	return publicMethodsAndProps;

})(jQuery);