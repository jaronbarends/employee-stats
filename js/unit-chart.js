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
		defaults = {
			margin: {
				top: 20,
				left: 20,
				bottom: 20,
				right: 20
			},
			isHorizontal: true,
			radius: 4,
			typeMargin: 10,
			employeeMargin: 2,
			showCountLabels: true
		},
		settings;


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
	const initChart = function() {
		
		// let svgWidth = parseInt(sgChart.style('width'), 10),
		// 	svgHeight = parseInt(sgChart.style('height'), 10);

		// calculate desired size based on dataset, radius and margin between units
		let numberOfTypes = sgDataset.length,
			maxCount = d3.max(sgDataset, function(elm) {
				return elm.employees.length;
			});

		let countDirectionSize = 2*settings.radius * maxCount + settings.employeeMargin * (maxCount - 1),
			typeDirectionSize = 2*settings.radius * numberOfTypes + settings.typeMargin * (numberOfTypes - 1);

		// console.log('numberOfTypes:', numberOfTypes, 'maxCount:', maxCount);


		// sgWidth = svgWidth - settings.margin.left - settings.margin.right,
		// sgHeight = svgHeight - settings.margin.top - settings.margin.bottom;

		if (settings.isHorizontal) {
			sgWidth = countDirectionSize;
			sgHeight = typeDirectionSize;
		} else {
			sgWidth = typeDirectionSize;
			sgHeight = countDirectionSize;
		}

		let svgWidth = sgWidth + settings.margin.left + settings.margin.right,
			svgHeight = sgHeight + settings.margin.top + settings.margin.bottom;

		sgChart.attr('width', svgWidth)
			.attr('height', svgHeight);

		// console.log()
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
	const createScales = function() {
		// we have a few different scales:
		// the type scale is a numeric scale to calculate positions for the type-data
		// the type label scale is a scale that can return the proper type name
		// the employee count scale is the scale for the number of employees
		// both the type and the employee count can be used vertically or horizontally
		// so we can't name them xScale and yScale

		// first determine which propery (width or height) to use for each scale
		let typeScaleHeightOrWidth,
			employeeCountHeightOrWidth;

		if (settings.isHorizontal) {
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

		if (settings.isHorizontal) {
			sgEmployeeCountScale.range([0, employeeCountHeightOrWidth]);
		} else {
			sgEmployeeCountScale.range([employeeCountHeightOrWidth, 0]);
		}
	};
	
	
	/**
	* create the axes
	* @returns {undefined}
	*/
	const createAxes = function() {
		// now set the proper scale for each axis
		let xScale,
			xTicksScale,
			yScale,
			yTicksScale;

		if (settings.isHorizontal) {
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
			.attr('transform', 'translate(' + settings.margin.left +',' + (settings.margin.top + sgHeight) +')')
			.call(xAxis);

		sgChart.append('g')
			.attr('class', 'axis axis--y')
			.attr('transform', 'translate(' + settings.margin.left + ',' + settings.margin.top + ')')
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
		r = settings.radius;
		let eachCircle = sgChart.append('g')
			.attr('transform', 'translate(' + settings.margin.left + ',' + settings.margin.top + ')')
			.selectAll('.unit')
			.data(sgFlatSet)
			.enter()
			.append('circle')
			.attr('class', app.util.getEmployeeClasses)
			.attr('r', r);

		return eachCircle;
	};


	/**
	* add labels with employee count for every type
	* @returns {undefined}
	*/
	const addCountLabels = function() {
		// add labels for count
		if (settings.showCountLabels) {
			let typeAmounts = [];
			sgDataset.forEach(function(typeObj) {
				typeAmounts.push(typeObj.employees.length);
			});

			// now add text to svg
			sgChart.append('g')
				.attr('transform', 'translate(' + settings.margin.left +',' + settings.margin.top +')')
				.selectAll('.count-label')
				.data(typeAmounts)
				.enter()
				.append('text')
				.attr('class', 'count-label')
				.text(function(d) {
					return d;
				})
				.attr('x', function(d) {
					return sgEmployeeCountScale(d);
				})
				.attr('y', function(d, i) {
					return sgTypeScale(i);
				})
				.attr('dy', '0.8em');
		}
	};
	
	
	


	/**
	* create the chart
	* @param {object} options {dataset:array, chartSelector:string[, sortFunction:function]}
	* @returns {undefined}
	*/
	const drawChart = function(dataset, chartSelector, options) {
		prepareDataset(dataset, options.sortFunction);

		settings = Object.assign({}, defaults, options);

		sgChart = d3.select(chartSelector);
		initChart();

		createScales();
		createAxes();


		// render units
		let eachCircle = addEachCircle(),
			cMargin = Math.ceil(sgTypeScale.bandwidth()/2),
			cxOrCyForType,
			cxOrCyForEmployeeCount;

		if (settings.isHorizontal) {
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

		addCountLabels();

	};



	// define public methods that are available through app
	let publicMethodsAndProps = {
		drawChart
	};

	return publicMethodsAndProps;

})(jQuery);