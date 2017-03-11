window.app = window.app || {};

app.lineChart = (function($) {

	'use strict';

	/**
	* 
	* @returns {undefined}
	*/
	var init = function() {
		var lineChart = d3.select("#line-chart"),
			svgWidth = parseInt(lineChart.style("width"), 10),
			svgHeight = parseInt(lineChart.style("height"), 10),
			margin = {top: 20, right: 20, bottom: 30, left: 50},
			width = svgWidth - margin.left - margin.right,
			height = svgHeight - margin.top - margin.bottom,
			g = lineChart.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		var parseTime = d3.timeParse('%d/%m/%Y');

		var xScale = d3.scaleTime()
				.rangeRound([0, width]);

		var yScale = d3.scaleLinear()
				.rangeRound([height, 0]);

		var line = d3.line()
				.curve(d3.curveCardinal)
				.x(function(d) { return xScale(d.year); })
				.y(function(d) { return yScale(d.count); }),
			line2 = d3.line()
				.curve(d3.curveCardinal)
				.x(function(d) { return xScale(d.year); })
				.y(function(d) { return yScale(d.countCumulative); });

		var totalData = app.data.employeesPerYear,
			startedData = app.data.employeesStartedPerYear;
		
		 // process data for totals
		for (var i=0; i<totalData.length; i++) {
			var d = totalData[i];
			d.year = parseTime(d.year);
			d.count = +d.count;
		}

		xScale.domain(d3.extent(totalData, function(d) { return d.year; }));
		yScale.domain(d3.extent(totalData, function(d) { return d.count; }));
		yScale.domain([0, d3.max(totalData, function(d) { return d.count; })]);

		g.append("g")
			.attr('class', 'axis--bottom')
			.attr("transform", "translate(0," + height + ")")
			.call(d3.axisBottom(xScale));

		g.append("g")
			.attr('class', 'axis--left')
			.call(d3.axisLeft(yScale))
			.append("text")
			.attr("fill", "#000")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", "0.71em")
			.attr("text-anchor", "end")
			.text("Number of employees");

		g.append("path")
			.datum(totalData)
			.attr('class', 'chart-path')
			.attr("d", line);

		 g.append('g')
		 	.selectAll('circle')
		 	.data(totalData)
		 	.enter()
		 	.append('circle')
		 	.attr('cx', function(d) {
		 		return xScale(d.year);
		 	})
		 	.attr('cy', function(d) {
		 		return yScale(d.count);
		 	});

		 // now add data for start year
		 g.append('path')
		 	.datum(startedData)
		 	.attr('class', 'chart-path secondary')
		 	.attr('d', line2);

		 g.append('g')
		 	.attr('class', 'secondary')
		 	.selectAll('circle')
		 	.data(startedData)
		 	.enter()
		 	.append('circle')
		 	.attr('cx', function(d) {
		 		return xScale(d.year);
		 	})
		 	.attr('cy', function(d) {
		 		return yScale(d.countCumulative);
		 	})
		 	.attr('r', 5);
	};


	// define public methods that are available through app
	var publicMethodsAndProps = {
		init: init
	};

	return publicMethodsAndProps;

})(jQuery);