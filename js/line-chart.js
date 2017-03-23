window.app = window.app || {};

window.app.lineChart = (function($) {

	'use strict';

	var app = window.app;

	var sgChartGroup,
		sgWidth,
		sgHeight,
		sgXScale,
		sgYScale,
		sgTotalData,
		sgStartedData;



	/**
	* initialize chart
	* @returns {undefined}
	*/
	var initChart = function() {
		var lineChart = d3.select("#line-chart"),
			svgWidth = parseInt(lineChart.style("width"), 10),
			svgHeight = parseInt(lineChart.style("height"), 10),
			margin = {top: 20, right: 20, bottom: 30, left: 50};

		sgWidth = svgWidth - margin.left - margin.right,
		sgHeight = svgHeight - margin.top - margin.bottom;

		sgChartGroup = lineChart.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	};
	


	/**
	* 
	* @returns {undefined}
	*/
	var initData = function() {
		var parseTime = d3.timeParse('%d/%m/%Y');

		sgTotalData = app.data.employeesPerYear;
		sgStartedData = app.data.employeesStartedPerYear;
		
		 // process data for totals
		for (var i=0; i<sgTotalData.length; i++) {
			var d = sgTotalData[i];
			d.year = parseTime(d.year);
			d.count = +d.count;
		}
	};



	/**
	* 
	* @returns {undefined}
	*/
	var initScales = function() {
		// first determine the extent of our datasets
		var totalYearExtent = d3.extent(sgTotalData, function(d) { return d.year; }),
			totalCountExtent = d3.extent(sgTotalData, function(d) { return d.count; }),
			startedYearExtent = d3.extent(sgStartedData, function(d) { return d.year; }),
			startedCountExtent = d3.extent(sgStartedData, function(d) { return d.countCumulative; }),
			xMin = Math.min(totalYearExtent[0], startedYearExtent[0]),
			xMax = Math.max(totalYearExtent[1], startedYearExtent[1]),
			yMax = Math.max(totalCountExtent[1], startedCountExtent[1]);

		// now create scales
		sgXScale = d3.scaleTime()
			.rangeRound([0, sgWidth])
			.domain([xMin, xMax]);

		sgYScale = d3.scaleLinear()
			.rangeRound([sgHeight, 0])
			.domain([0, yMax]);
	};


	/**
	* 
	* @returns {undefined}
	*/
	var createAxes = function() {
		sgChartGroup.append("g")
			.attr('class', 'axis--bottom')
			.attr("transform", "translate(0," + sgHeight + ")")
			.call(d3.axisBottom(sgXScale));

		sgChartGroup.append("g")
			.attr('class', 'axis--left')
			.call(d3.axisLeft(sgYScale))
			.append("text")
			.attr("fill", "#000")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", "0.71em")
			.attr("text-anchor", "end")
			.text("Number of employees");
	};
	
		

	/**
	* draw a line
	* @param {object} dataset The dataset to use for this line
	* @param {yProp} string	The dataset-property to use for the y-value
	* @param {string} additionalClasses Additional classes to add to the path
	* @returns {undefined}
	*/
	var drawLine = function(dataset, yProp, additionalClasses) {
		var cls = 'chart-path';
		if (additionalClasses) {
			cls += ' '+additionalClasses;
		}

		var line = d3.line()
				.curve(d3.curveCardinal)
				.x(function(d) { return sgXScale(d.year); })
				.y(function(d) { return sgYScale(d[yProp]); });

		sgChartGroup.append("path")
			.datum(dataset)
			.attr('class', cls)
			.attr("d", line);
	};
	
		

	/**
	* draw markers
	* @param {object} dataset The dataset to use for these markers
	* @param {yProp} string	The dataset-property to use for the y-value
	* @param {string} additionalClasses Additional classes to add to the group
	* @returns {undefined}
	*/
	var drawMarkers = function(dataset, yProp, additionalClasses) {
		var cls = 'chart-path';
		if (additionalClasses) {
			cls += ' '+additionalClasses;
		}

		sgChartGroup.append('g')
			.attr('class', cls)
			.selectAll('circle')
			.data(dataset)
			.enter()
			.append('circle')
			.attr('cx', function(d) {
				return sgXScale(d.year);
			})
			.attr('cy', function(d) {
				return sgYScale(d[yProp]);
			});
	};
	

	/**
	* initialize the chart
	* @returns {undefined}
	*/
	var init = function() {
		initChart();
		initData();
		initScales();
		createAxes();

		drawLine(sgTotalData, 'count');
		drawMarkers(sgTotalData, 'count');
		drawLine(sgStartedData, 'countCumulative', 'secondary');
		drawMarkers(sgStartedData, 'countCumulative', 'secondary');
	};


	// define public methods that are available through app
	var publicMethodsAndProps = {
		init
	};

	return publicMethodsAndProps;

})(jQuery);