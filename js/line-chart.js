window.app = window.app || {};

app.lineChart = (function($) {

	'use strict';


	/**
	* 
	* @returns {undefined}
	*/
	var init = function() {
		var svg = d3.select('#line-chart'),
			width = 600,
			height = 400,
			g = svg.append('g');

		var parseTime = d3.timeParse('%d-%b-%y');

		var xScale = d3.scaleTime()
				.rangeRound([0, width]);

		var yScale = d3.scaleLinear()
				.rangeRound([height, 0]);

		var line = d3.line()
				.x(function(d) {
					return xScale(d.year);
				})
				.y(function(d) {
					return yScale(d.count)
				});

		var data = app.data.employeeHistory;

		xScale.domain(d3.extent(data, function(d) {
			console.log(d);
			return d.year;
		}));
		yScale.domain(d3.extent(data, function(d) {
			return d.count;
		}));

		g.append('g')
			.call(d3.axisLeft(yScale))
			.append('text');

		g.append('path')
			.datum(data)
			.attr('fill', 'none')
			.attr('stroke', 'steelblue')
			.attr('stroke-linejoin', 'round')
			.attr('stroke-linecap', 'round')
			.attr('stroke-width', 1.5)
			.attr('d', line);
	};





	/**
	* 
	* @returns {undefined}
	*/
	var init2 = function() {
		var svg = d3.select("#line-chart"),
		    margin = {top: 20, right: 20, bottom: 30, left: 50},
		    width = +svg.attr("width") - margin.left - margin.right,
		    height = +svg.attr("height") - margin.top - margin.bottom,
		    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		var parseTime = d3.timeParse("%d-%b-%y");

		var x = d3.scaleTime()
		    .rangeRound([0, width]);

		var y = d3.scaleLinear()
		    .rangeRound([height, 0]);

		var line = d3.line()
		    .x(function(d) { return x(d.date); })
		    .y(function(d) { return y(d.close); });

		d3.csv("data/close.csv", function(d) {
		  d.date = parseTime(d.date);
		  d.close = +d.close;
		  return d;
		}, function(error, data) {
		  if (error) throw error;

		  x.domain(d3.extent(data, function(d) { return d.date; }));
		  y.domain(d3.extent(data, function(d) { return d.close; }));

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
		      .text("Price ($)");

		  g.append("path")
		      .datum(data)
		      .attr("fill", "none")
		      .attr("stroke", "steelblue")
		      .attr("stroke-linejoin", "round")
		      .attr("stroke-linecap", "round")
		      .attr("stroke-width", 1.5)
		      .attr("d", line);
		});
	};
	



	// define public methods that are available through app
	var publicMethodsAndProps = {
		init: init,
		init2: init2,
	};

	return publicMethodsAndProps;

})(jQuery);