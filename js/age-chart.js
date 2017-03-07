window.app = window.app || {};

app.ageChart = (function($) {

	'use strict';

	/**
	* create chart for age
	* @returns {undefined}
	*/
	var createAgeChart = function() {
		var ageChart = d3.select('#age-chart'),
			svgWidth = parseInt(ageChart.style('width'), 10),
			svgHeight = parseInt(ageChart.style('height'), 10),
			margin = {
				top: 10,
				right: 10,
				bottom: 30,
				left: 50
			},
			width = svgWidth - margin.left - margin.right,
			height = svgHeight - margin.top - margin.bottom,
			minAge = d3.min(app.data.sgAges, function(obj) {
				return obj.age;
			}),
			maxAge = d3.max(app.data.sgAges, function(obj) {
				return obj.age + 1;// op de een of andere manier moet dit +1 zijn, anders komt laatste bar niet in schaal
			});


		var xScale = d3.scaleBand()
				// .domain(d3.range(app.data.sgAges.length))
				.domain(d3.range(minAge, maxAge))
				.rangeRound([0, width])
				.padding(0.1);

				// console.log('ages:', app.data.sgAges);

		var yScale = d3.scaleLinear()
				.domain([0, d3.max(app.data.sgAges, function(obj) {
						return obj.employeeCount;
					})])
				.range([height, 0]);

		var xAxis = d3.axisBottom(xScale)
				.tickValues([25, 30, 35, 40, 45]),
			yAxis = d3.axisLeft(yScale)
				.ticks(3);

		// render bars
		ageChart.append('g')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
			.selectAll('.age-bar')
			.data(app.data.sgAges)
			.enter()
			.append('rect')
			.attr('x', function(d, i) {
				return xScale(d.age);
			})
			.attr('y', function(d) {
				return yScale(d.employeeCount);
			})
			.attr('width', xScale.bandwidth())
			.attr('height', function(d) {
				return height - yScale(d.employeeCount);
			});

		// render axes
		ageChart.append('g')
			.attr('class', 'axis')
			.attr('transform', 'translate(' + margin.left +',' + (margin.top + height) +')')
			.call(xAxis);

		ageChart.append('g')
			.attr('class', 'axis')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
			.call(yAxis);
	};


	/**
	* 
	* @returns {undefined}
	*/
	var init = function() {
		createAgeChart();
	};



	// define public methods that are available through app
	var publicMethodsAndProps = {
		init: init
	};

	return publicMethodsAndProps;

})(jQuery);