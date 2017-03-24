window.app = window.app || {};

window.app.unitChart = (function($) {

	'use strict';

	var app = window.app;

	var sgDataset,
		sgFlatSet = [],
		sgChart,
		sgWidth,
		sgHeight,
		sgTypeScale,
		sgTypeLabelScale,
		sgEmployeeCountScale,
		sgXAxis,
		sgYAxis;


	/**
	* flatten the dataset to employee level,
	* so we can bind the inidiviual employees to 
	* @param {array} dataset The dataset to flatten
	* @returns {array} The flattened dataset
	*/
	const flattenDataset = function(dataset) {
		let flatSet = [];

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
	* initialize the chart
	* determine height and width, prepare data etc
	* @returns {undefined}
	*/
	const initChart = function(margin) {
		
		let svgWidth = parseInt(sgChart.style('width'), 10),
			svgHeight = parseInt(sgChart.style('height'), 10);

		sgWidth = svgWidth - margin.left - margin.right,
		sgHeight = svgHeight - margin.top - margin.bottom;
	};
	


	/**
	* prepare the dataset
	* @returns {undefined}
	*/
	const prepareDataset = function(dataset, sortFunction) {
		sgDataset = dataset;
		
		// when a sorting function has been passed, sort the array
		if (sortFunction) {
			sgDataset = sgDataset.sort(sortFunction);
		}

		sgFlatSet = flattenDataset(sgDataset);
	};



	/**
	* create scales
	* @returns {undefined}
	*/
	const createScales = function(isHorizontal = true) {
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
			typeScaleHeightOrWidth = sgHeight;
			employeeCountHeightOrWidth = sgWidth;
		} else {
			typeScaleHeightOrWidth = sgWidth;
			employeeCountHeightOrWidth = sgHeight;
		}

		sgTypeScale = d3.scaleBand()
			.domain(d3.range(sgDataset.length))
			.rangeRound([0, typeScaleHeightOrWidth])
			.padding(0.1);

		sgTypeLabelScale = d3.scaleBand()
			.domain(sgDataset.map(function(d) {return d.type;}))
			.rangeRound([0, typeScaleHeightOrWidth])
			.padding(0.1);

		sgEmployeeCountScale = d3.scaleLinear()
			.domain([0, d3.max(sgDataset, function(d) {
					return d.employees.length;
				})]);

		if (isHorizontal) {
			sgEmployeeCountScale.range([0, employeeCountHeightOrWidth]);
		} else {
			sgEmployeeCountScale.range([employeeCountHeightOrWidth, 0]);
		}
	};
	
	
	/**
	* create the axes
	* @returns {undefined}
	*/
	const createAxes = function(isHorizontal, margin) {
		// now set the proper scale for each axis
		let xScale,
			xTicksScale,
			yScale,
			yTicksScale;

		if (isHorizontal) {
			xScale = sgEmployeeCountScale;
			xTicksScale = xScale;
			yScale = sgTypeScale;
			yTicksScale = sgTypeLabelScale;
		} else {
			xScale = sgTypeScale;
			xTicksScale = sgTypeLabelScale;
			yScale = sgEmployeeCountScale;
			yTicksScale = yScale;
		}

		let xAxis = d3.axisBottom(xTicksScale),
			yAxis = d3.axisLeft(yTicksScale)
						.tickPadding(10);
						

		// render axes
		sgChart.append('g')
			.attr('class', 'axis axis--x')
			.attr('transform', 'translate(' + margin.left +',' + (margin.top + sgHeight) +')')
			.call(xAxis);

		sgChart.append('g')
			.attr('class', 'axis axis--y')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
			.call(yAxis);
	};


	/**
	* 
	* @returns {undefined}
	*/
	const addEachCircle = function(margin) {
		// determine radius of unit-circles by checking at which axis one unit is the smallest
		let unitSizeAxis1 = sgTypeScale.bandwidth(),// this already includes padding
			unitSizeAxis2 = sgEmployeeCountScale(1) * 0.8,// multiply by 0.8 to create padding
			r = Math.min(unitSizeAxis2, unitSizeAxis1)/2;

		// radius calculation doesn't always turn out well
		r = 4;

		let eachCircle = sgChart.append('g')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
			.selectAll('.unit')
			.data(sgFlatSet)
			.enter()
			.append('circle')
			.attr('r', r);

		return eachCircle;
	};
	
	


	/**
	* create the chart
	* @param {object} options {dataset:array, chartSelector:string[, sortFunction:function]}
	* @returns {undefined}
	*/
	const drawChart = function({dataset, chartSelector, sortFunction, margin, isHorizontal = true}) {
		prepareDataset(dataset, sortFunction);

		sgChart = d3.select(chartSelector);
		initChart(margin);

		createScales(isHorizontal);
		createAxes(isHorizontal, margin);


		// render units
		let eachCircle = addEachCircle(margin),
			cMargin = Math.ceil(sgTypeScale.bandwidth()/2),
			cxOrCyForType,
			cxOrCyForEmployeeCount;

		if (isHorizontal) {
			cxOrCyForType = 'cy';
			cxOrCyForEmployeeCount = 'cx';
		} else {
			cxOrCyForType = 'cx';
			cxOrCyForEmployeeCount = 'cy';
		}

		eachCircle.attr(cxOrCyForType, function(d) {
				return sgTypeScale(d.typeIdx) + cMargin;
			})
			.attr(cxOrCyForEmployeeCount, function(d) {
				return sgEmployeeCountScale(d.employeeOfTypeIdx + 1);// employeeOfTypeIdx = 0-based
			});

	};



	// define public methods that are available through app
	let publicMethodsAndProps = {
		drawChart
	};

	return publicMethodsAndProps;

})(jQuery);