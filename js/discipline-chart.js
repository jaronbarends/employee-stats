window.app = window.app || {};

app.disciplineChart = (function($) {

	'use strict';

	/**
	* create chart for age
	* @returns {undefined}
	*/
	var createDisciplineChart = function(dataset) {
		console.log(dataset);
		var chart = d3.select('#discipline-chart'),
			svgWidth = parseInt(chart.style('width'), 10),
			svgHeight = parseInt(chart.style('height'), 10),
			margin = {
				top: 10,
				right: 10,
				bottom: 30,
				left: 50
			},
			width = svgWidth - margin.left - margin.right,
			height = svgHeight - margin.top - margin.bottom;

		dataset = [10,20,30,40,50];


		var yScale = d3.scaleBand()
				// .domain(d3.range(minAge, maxAge))
				.domain(d3.range(dataset.length))
				.rangeRound([0, height])
				.padding(0.1);

		var max = d3.max(dataset, function(d) {
						return d.length;
					});
				console.log('max:', max);

		var xScale = d3.scaleLinear()
				// .domain([0, d3.max(dataset, function(d) {
				// 		return d.length;
				// 	})])
				.domain([0, 50])
				.range([0, width]);

		var xAxis = d3.axisBottom(xScale),
				// .tickValues([25, 30, 35, 40, 45]),
			yAxis = d3.axisLeft(yScale)
				// .ticks(3);

		// render bars
		chart.append('g')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
			.selectAll('.bar')
			.data(dataset)
			.enter()
			.append('rect')
			.attr('y', function(d, i) {
				return yScale(i);
			})
			.attr('x', 0)
			.attr('height', yScale.bandwidth())
			// .attr('width', 18)
			.attr('width', function(d) {
				// return 100;
				return xScale(d);
				return xScale(d.length);
			});

		// render axes
		chart.append('g')
			.attr('class', 'axis')
			.attr('transform', 'translate(' + margin.left +',' + (margin.top + height) +')')
			.call(xAxis);

		chart.append('g')
			.attr('class', 'axis')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
			.call(yAxis);
	};


	/**
	* 
	* @returns {undefined}
	*/
	var init = function() {
		var dataset = app.filters.groups.discipline.dataset;
		createDisciplineChart(dataset);
	};



	// define public methods that are available through app
	var publicMethodsAndProps = {
		init: init
	};

	return publicMethodsAndProps;

})(jQuery);