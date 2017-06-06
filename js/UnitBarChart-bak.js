/*
 * UnitBarChart - chart consisting of a bar for every unit
 */

class UnitBarChart {

	/**
	* constructor function
	* @param {array} dataset The dataset we want to show, i.e. app.data.buckets.parttimePercentage.dataset
	* @param {string} chartContextSelector The selector for the svg-element to plot the chart context (labels, axes) in
	* @param {object} options {[sortFunction:function]}
	* @returns {undefined}
	*/
	constructor(dataset, chartContextSelector, options) {
		let defaults = {
			sortFunction: null,// assume datasets are usually already in right order
			margin: {
				top: 20,
				left: 20,
				bottom: 20,
				right: 20
			},
			isHorizontal: true,// the "bars" of the chart are horizontal
			radius: 4,
			barWidth: 3,
			barGap: 1,
			typeMargin: 10,
			employeeMargin: 2,
			showCountLabels: true
		};

		console.log(dataset);


		// setup stuff
		this.settings = Object.assign({}, defaults, options);
		// this.id = id;
		this.originalDataset = dataset;
		this.dataset = this.sortAndFlattenDataset();
		// this.originalDataset = this._sortDataset(dataset);
		// this.dataset = this.flattenDataset();

		// do chart stuff
		this.chart = d3.select(chartContextSelector);
		this.width = 0;
		this.height = 0;
		this.countLabels = null;

		this.barCount = 0;
		this.maxValue = d3.max(this.originalDataset, function(elm) {
			return parseInt(elm.type, 10);
		});

		this.createChartContext();
	}


	/**
	* return this chart's sorted and flattened dataset
	* when doing operations on employee-objects, these changes can affect
	* in other objects as well. So we need to re-sort and re-flatten to be sure...
	* @returns {array} the sorted and flattened dataset
	*/
	getDataset() {
		// return this.sortAndFlattenDataset();
	};


	/**
	* sort and flatten this chart's dataset
	* @returns {undefined}
	*/
	sortAndFlattenDataset() {
		// let sortedDataset = this._sortDataset(this.originalDataset),
		// 	sortedFlattenedDataset = this.flattenDataset(sortedDataset);

		// return sortedFlattenedDataset;
	};
	




	/**
	* If a sorting function was passed in, sort the dataset
	* @param {object} dataset A dataset
	* @returns {Object} the sorted or unaltered dataset
	*/
	_sortDataset(dataset) {
		// let sortFunction = this.settings.sortFunction;
		// if (sortFunction) {
		// 	dataset = dataset.sort(sortFunction);
		// }

		// return dataset;

	};



	/**
	* flatten the dataset to employee level,
	* so we can bind the inidiviual employees to 
	* @param {array} dataset The dataset to flatten
	* @returns {array} The flattened dataset
	*/
	flattenDataset(originalDataset = this.originalDataset) {
		// let flatSet = [];

		// for (var i=0, len=originalDataset.length; i<len; i++) {
		// 	var employees = originalDataset[i].employees;
		// 	for (var j=0, len2=employees.length; j<len2; j++) {
		// 		let emp = employees[j],
		// 			ucObj = emp.unitChartData;

		// 		ucObj[this.id] = {
		// 			typeIdx: i,
		// 			employeeOfTypeIdx: j
		// 		};
		// 		flatSet.push(emp);
		// 	}
		// }

		// return flatSet;
	};



	/**
	* initialize the chart
	* determine height and width etc
	* @returns {undefined}
	*/
	_initChart() {
		
		// calculate desired size based on dataset, radius and margin between units
		let originalDataset = this.originalDataset,
			settings = this.settings,
			numberOfTypes = originalDataset.length;

		originalDataset.forEach((obj) => {
			this.barCount += parseInt(obj.employees.length);
		});

		let barsDirectionSize = this.barCount * this.settings.barWidth + (this.barCount - 1) * this.settings.barGap,
			valueDirectionSize = 100;
			// valueDirectionSize = 2*settings.radius * numberOfTypes + settings.typeMargin * (numberOfTypes - 1);

		if (settings.isHorizontal) {
			this.width = valueDirectionSize;
			this.height = barsDirectionSize;
		} else {
			this.width = barsDirectionSize;
			this.height = valueDirectionSize;
		}

		let svgWidth = this.width + settings.margin.left + settings.margin.right,
			svgHeight = this.height + settings.margin.top + settings.margin.bottom;

		this.chart.attr('width', svgWidth)
			.attr('height', svgHeight);

			console.log('c:', this.chart);

	};
	
	

	/**
	* create scales for number of nodes and proper type name
	* @returns {undefined}
	*/
	_createScales() {
		// we have a few different scales:
		// the value scale is a numeric scale for the values
		// the type label scale is a scale that can return the proper type name
		// the bar position scale is the scale for employee-bars
		// both the values and the bars can be used vertically or horizontally
		// so we can't name them xScale and yScale

		// first determine which propery (width or height) to use for each scale
		let valueScaleHeightOrWidth,
			barPositionHeightOrWidth;

		if (this.settings.isHorizontal) {
			valueScaleHeightOrWidth = this.height;
			barPositionHeightOrWidth = this.width;
		} else {
			valueScaleHeightOrWidth = this.width;
			barPositionHeightOrWidth = this.height;
		}

		this.valueScale = d3.scaleBand()
			.domain(d3.range(this.maxValue))
			.rangeRound([0, valueScaleHeightOrWidth]);
			// .padding(0.1);

		// this.typeLabelScale = d3.scaleBand()
		// 	.domain(this.originalDataset.map(function(d) {return d.type;}))
		// 	.rangeRound([0, valueScaleHeightOrWidth])
		// 	.padding(0.1);

		this.barPositionScale = d3.scaleLinear()
			.domain([0, this.barCount]);

		if (this.settings.isHorizontal) {
			this.barPositionScale.range([0, barPositionHeightOrWidth]);
		} else {
			this.barPositionScale.range([barPositionHeightOrWidth, 0]);
		}
	};



	/**
	* create the axes for the chart
	* @returns {undefined}
	*/
	_createAxes() {
		// now set the proper scale for each axis
		let xScale,
			xTicksScale,
			yScale,
			yTicksScale;

		if (this.settings.isHorizontal) {
			xScale = this.barPositionScale;
			xTicksScale = xScale;
			yScale = this.valueScale;
			yTicksScale = this.valueScale;
			// yTicksScale = this.typeLabelScale;
		} else {
			xScale = this.valueScale;
			// xTicksScale = this.typeLabelScale;
			xTicksScale = this.valueScale;
			yScale = this.barPositionScale;
			yTicksScale = yScale;
		}

		let xAxis = d3.axisBottom(xTicksScale),
			yAxis = d3.axisLeft(yTicksScale)
						.tickPadding(10);


		// render axes
		this.chart.append('g')
			.attr('class', 'axis axis--x')
			.attr('transform', 'translate(' + this.settings.margin.left +',' + (this.settings.margin.top + this.height) +')')
			.call(xAxis);

		this.chart.append('g')
			.attr('class', 'axis axis--y')
			.attr('transform', 'translate(' + this.settings.margin.left + ',' + this.settings.margin.top + ')')
			.call(yAxis);

			console.log('done');
	};
	


	/**
	* 
	* @returns {undefined}
	*/
	_addEachCircle() {
		// let eachCircle = this.chart.append('g')
		// 	.attr('transform', 'translate(' + this.settings.margin.left + ',' + this.settings.margin.top + ')')
		// 	.selectAll('.unit')
		// 	.data(this.dataset)
		// 	.enter()
		// 	.append('circle')
		// 	.attr('class', window.app.util.getEmployeeClasses)
		// 	.attr('r', this.settings.radius);

		// return eachCircle;
	};



	/**
	* circles need to be placed in the center of a scale's band
	* so calculate the offset for that
	* @returns {undefined}
	*/
	_getOffsetToScaleBandCenter() {
		// return Math.ceil(this.valueScale.bandwidth()/2);
	};


	/**
	* get the position for a node in the chart
	* @returns {undefined}
	*/
	getNodePosition(d, i, options) {
		// let x,
		// 	y;

		// let defaults = {
		// 	ths: this,
		// 	addChartMargins: false
		// };

		// let settings = Object.assign({}, defaults, options),
		// 	ths = settings.ths;

		// let ucData = d.unitChartData[settings.id];

		// if (ths.settings.isHorizontal) {
		// 	x = ths.barPositionScale(ucData.employeeOfTypeIdx + 1);// employeeOfTypeIdx = 0-based
		// 	y = ths.valueScale(ucData.typeIdx) + ths._getOffsetToScaleBandCenter();// put center in center of band
		// } else {
		// 	x = ths.valueScale(ucData.typeIdx) + ths._getOffsetToScaleBandCenter();// put center in center of band
		// 	y = ths.barPositionScale(ucData.employeeOfTypeIdx + 1);// employeeOfTypeIdx = 0-based
		// }

		// if (settings.addChartMargins) {
		// 	x += ths.settings.margin.left;
		// 	y += ths.settings.margin.top;
		// }

		// return [x,y];

	};
	
	
	

	/**
	* add all data-nodes
	* @returns {undefined}
	*/
	addNodes() {
		// render units
		// let eachCircle = this._addEachCircle(),
		// 	cxOrCyForType,
		// 	cxOrCyForbarPosition;

		// let options = {
		// 	id: this.id
		// };

		// eachCircle.attr('cx', (d, i) => {
		// 		// yay! arrow function's this is this class's this :)
		// 		return this.getNodePosition(d, i, options)[0];
		// 	})
		// 	.attr('cy', (d, i) => {
		// 		return this.getNodePosition(d, i, options)[1];
		// 	});
	};



	/**
	* add labels with employee count for every type
	* @returns {undefined}
	*/
	addCountLabels() {
		// if (this.settings.showCountLabels) {
		// 	let typeAmounts = [];
		// 	this.originalDataset.forEach(function(typeObj) {
		// 		typeAmounts.push(typeObj.employees.length);
		// 	});

		// 	// now add text to svg
		// 	let eachCountLabel = this.chart.append('g')
		// 		.attr('class', 'count-labels')
		// 		.attr('transform', 'translate(' + this.settings.margin.left +',' + this.settings.margin.top +')')
		// 		.selectAll('.count-label')
		// 		.data(typeAmounts)
		// 		.enter()
		// 		.append('text')
		// 		.attr('class', 'count-label')
		// 		.text(function(d) {
		// 			return d;
		// 		});

		// 	if (this.settings.isHorizontal) {
		// 		eachCountLabel.attr('x', (d, i) => {
		// 				return this.barPositionScale(d+1);// put label where next unit would be
		// 			})
		// 			.attr('y', (d, i) => {
		// 				return this.valueScale(i) + this._getOffsetToScaleBandCenter();
		// 			})
		// 			.attr('dy', '0.3em');
		// 	} else {
		// 		eachCountLabel.attr('x', (d, i) => {
		// 					return this.valueScale(i) + this._getOffsetToScaleBandCenter();
		// 			})
		// 			.attr('y', (d, i) => {
		// 					return this.barPositionScale(d+1);// put label where next unit would be
		// 			})
		// 			.attr('dy', 0)
		// 			.attr('text-anchor', 'middle');
		// 	}

		// 	this.countLabels = eachCountLabel;

		// }
	};



	/**
	* create the chart context (i.e. everything but the nodes)
	* @returns {undefined}
	*/
	createChartContext() {
		this._initChart();
		this._createScales();
		this._createAxes();

		// this.addNodes();
		this.addCountLabels();
	};



	/**
	* create the chart and add nodes
	* @returns {undefined}
	*/
	drawChart() {
		this.createChartContext();
		this.addNodes();
		this.addCountLabels();
	};
	
}
