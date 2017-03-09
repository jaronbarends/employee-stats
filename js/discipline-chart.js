window.app = window.app || {};

app.disciplineChart = (function($) {

	'use strict';

	/**
	* create chart for age
	* @returns {undefined}
	*/
	var createDisciplineChart = function(dataset) {
		var dataset2 = [];

		// for (var prop in dataset) {
		// 	dataset2.push({name: prop, employees: dataset[prop]});
		// }
		// dataset = dataset2;
		// console.log(dataset);

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

		var yScale = d3.scaleBand()
				.domain(d3.range(dataset.length))
				.rangeRound([0, height])
				.padding(0.1);

		var xScale = d3.scaleLinear()
				.domain([0, d3.max(dataset, function(d) {
						return d.employees.length;
					})])
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
			.attr('width', function(d) {
				return xScale(d.employees.length);
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
		var dataset = app.filters.buckets.discipline.dataset;
		createDisciplineChart(dataset);
	};



	// define public methods that are available through app
	var publicMethodsAndProps = {
		init: init
	};

	return publicMethodsAndProps;

})(jQuery);