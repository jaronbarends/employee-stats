window.app = window.app || {};

app.unitChart = (function($) {

	'use strict';


	/**
	* flatten the dataset to employee level,
	* so we can bind the inidiviual employees to 
	* @param {array} dataset The dataset to flatten
	* @returns {array} The flattened dataset
	*/
	var flattenDataset = function(dataset) {
		var flatSet = [];

		for (var i=0, len=dataset.length; i<len; i++) {
			var employees = dataset[i].employees;
			for (var j=0, len2=employees.length; j<len2; j++) {
				var emp = employees[j];
				emp.typeIdx = i;
				emp.employeeOfTypeIdx = j;
				flatSet.push(emp);
			}
		}

		return flatSet;
	};
	

	/**
	* create chart for disciplines
	* @returns {undefined}
	*/
	var createUnitChart = function(dataset) {
		var chart = d3.select('#discipline-chart2'),
			svgWidth = parseInt(chart.style('width'), 10),
			svgHeight = parseInt(chart.style('height'), 10),
			margin = {
				top: 10,
				right: 10,
				bottom: 30,
				left: 200
			},
			width = svgWidth - margin.left - margin.right,
			height = svgHeight - margin.top - margin.bottom;

		dataset = dataset.sort(function(a,b) {
			return b.employees.length - a.employees.length;
		});

		var flatSet = flattenDataset(dataset);
		// console.log(flatSet);

		var yScale = d3.scaleBand()
				.domain(d3.range(dataset.length))
				.rangeRound([0, height])
				.padding(0.1);

		var xScale = d3.scaleLinear()
				.domain([0, d3.max(dataset, function(d) {
						return d.employees.length;
					})])
				.range([0, width]);

		var disciplineScale = d3.scaleBand()
				.domain(dataset.map(function(d) {return d.type;}))
				.rangeRound([0, height])
				.padding(0.1);

		var xAxis = d3.axisBottom(xScale),
			yAxis = d3.axisLeft(disciplineScale);
			// yAxis = d3.axisLeft(yScale)

		var r = xScale(0.4),
			marginTop = Math.ceil(yScale.bandwidth()/2);

		// render units
		chart.append('g')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
			.selectAll('.unit')
			.data(flatSet)
			.enter()
			.append('circle')
			.attr('cy', function(d) {
				return yScale(d.typeIdx) + marginTop;
			})
			.attr('cx', function(d) {
				return xScale(d.employeeOfTypeIdx);
			})
			.attr('r', r)


		// render axes
		chart.append('g')
			.attr('class', 'axis axis--x')
			.attr('transform', 'translate(' + margin.left +',' + (margin.top + height) +')')
			.call(xAxis);

		chart.append('g')
			.attr('class', 'axis axis--y')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
			.call(yAxis);
	};


	/**
	* 
	* @returns {undefined}
	*/
	var init = function() {
		var dataset = app.data.buckets.discipline.dataset;
		createUnitChart(dataset);
	};



	// define public methods that are available through app
	var publicMethodsAndProps = {
		init: init
	};

	return publicMethodsAndProps;

})(jQuery);