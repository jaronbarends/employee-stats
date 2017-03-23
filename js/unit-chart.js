window.app = window.app || {};

window.app.unitChart = (function($) {

	'use strict';

	var app = window.app;


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
	* create the chart
	* @param {object} options {dataset:array, chartSelector:string[, sortFunction:function]}
	* @returns {undefined}
	*/
	const drawChart = function({dataset, chartSelector, sortFunction, isHorizontal = true}) {
		let chart = d3.select(chartSelector),
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

		// when a sorting function has been passed, sort the array
		if (sortFunction) {
			dataset = dataset.sort(sortFunction);
		}

		let flatSet = flattenDataset(dataset);

		// we have a few different scales:
		// the type scale is a numeric scale to calculate positions for the type-data
		// the type label scale is a scale that can return the proper type name
		// the employee count scale is the scale for the number of employees
		// both the type and the employee count can be used vertically or horizontally
		// so we can't name them xScale and yScale

		// first determine which propery (width or height) to use for each scale
		let typeScaleHeightOrWidth,
			employeeCountHeightOrWidth;

		if (isHorizontal) {
			typeScaleHeightOrWidth = height;
			employeeCountHeightOrWidth = width;
		} else {
			typeScaleHeightOrWidth = width;
			employeeCountHeightOrWidth = height;
		}

		let typeScale = d3.scaleBand()
				.domain(d3.range(dataset.length))
				.rangeRound([0, typeScaleHeightOrWidth])
				.padding(0.1);

		let typeLabelScale = d3.scaleBand()
				.domain(dataset.map(function(d) {return d.type;}))
				.rangeRound([0, typeScaleHeightOrWidth])
				.padding(0.1);

		let employeeCountScale = d3.scaleLinear()
				.domain([0, d3.max(dataset, function(d) {
						return d.employees.length;
					})])
				.range([0, employeeCountHeightOrWidth]);

		// now set the proper scale for each axis
		let xScale,
			xTicksScale,
			yScale,
			yTicksScale;

		if (isHorizontal) {
			xScale = employeeCountScale;
			xTicksScale = xScale;
			yScale = typeScale;
			yTicksScale = typeLabelScale;
		} else {
			xScale = typeScale;
			xTicksScale = typeLabelScale;
			yScale = employeeCountScale;
			yTicksScale = yScale;
		}

		let xAxis = d3.axisBottom(xTicksScale),
			yAxis = d3.axisLeft(yTicksScale)
						.tickPadding(10);

		// determine radius of unit-circles by checking at which axis one unit is the smallest
		let unitSizeAxis1 = typeScale.bandwidth(),// this already includes padding
			unitSizeAxis2 = employeeCountScale(1) * 0.8,// multiply by 0.8 to create padding
			r = Math.min(unitSizeAxis2, unitSizeAxis1)/2,
			cMargin = Math.ceil(typeScale.bandwidth()/2);

		// TODO For the axis which does not dictate the unit size, you would want to recalculate the
		// height the svg (or the input domain) should have to prevent units too far apart

		// render units
		let circle = chart.append('g')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
			.selectAll('.unit')
			.data(flatSet)
			.enter()
			.append('circle')
			.attr('r', r);

		if (isHorizontal) {
			circle.attr('cy', function(d) {
					return typeScale(d.typeIdx) + cMargin;
				})
				.attr('cx', function(d) {
					return employeeCountScale(d.employeeOfTypeIdx);
				});
		} else {
			circle.attr('cx', function(d) {
					return typeScale(d.typeIdx) + cMargin;
				})
				.attr('cy', function(d) {
					return height - employeeCountScale(d.employeeOfTypeIdx);
				});
		}
			


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



	// define public methods that are available through app
	var publicMethodsAndProps = {
		drawChart
	};

	return publicMethodsAndProps;

})(jQuery);