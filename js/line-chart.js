window.app = window.app || {};

app.lineChart = (function($) {

	'use strict';



	/**
	* 
	* @returns {undefined}
	*/
	var init = function() {
		var svg = d3.select("#line-chart"),
		    margin = {top: 20, right: 20, bottom: 30, left: 50},
		    width = +svg.attr("width") - margin.left - margin.right,
		    height = +svg.attr("height") - margin.top - margin.bottom,
		    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		// var parseTime = d3.timeParse("%d-%b-%y");
		var parseTime = d3.timeParse('%Y');

		var x = d3.scaleTime()
		    .rangeRound([0, width]);

		var y = d3.scaleLinear()
		    .rangeRound([height, 0]);

		var line = d3.line()
		    .x(function(d) { return x(d.year); })
		    .y(function(d) { return y(d.count); });

	   // process data
		var data = app.data.employeeHistory;
		  for (var i=0; i<data.length; i++) {
		  	var d = data[i];
			d.year = parseTime(d.year);
			d.count = +d.count;
		  }

		  x.domain(d3.extent(data, function(d) { return d.year; }));
		  y.domain(d3.extent(data, function(d) { return d.count; }));

		  g.append("g")
		      .attr("transform", "translate(0," + height + ")")
		      .call(d3.axisBottom(x))
		    .select(".domain")
		      .remove();

		  g.append("g")
		      .call(d3.axisLeft(y))
		    .append("text")
		      .attr("fill", "#000")
		      .attr("transform", "rotate(-90)")
		      .attr("y", 6)
		      .attr("dy", "0.71em")
		      .attr("text-anchor", "end")
		      .text("Employees");

		  g.append("path")
		      .datum(data)
		      .attr("fill", "none")
		      .attr("stroke", "steelblue")
		      .attr("stroke-linejoin", "round")
		      .attr("stroke-linecap", "round")
		      .attr("stroke-width", 3)
		      .attr("d", line);
	};


	// define public methods that are available through app
	var publicMethodsAndProps = {
		init: init
	};

	return publicMethodsAndProps;

})(jQuery);