/*
 * UnitBarChart - chart consisting of a bar for every unit
 */

class UnitBarChart {

	/**
	* constructor function
	* @param {array} dataset The dataset we want to show, i.e. app.data.buckets.parttimePercentage.dataset
	* @param {string} chartSelector The selector for the svg-element to plot the chart context (labels, axes) in
	* @param {object} options {[sortFunction:function]}
	* @returns {undefined}
	*/
	constructor(dataset, chartSelector, options) {
		let defaults = {
			sortFunction: null,// assume datasets are usually already in right order
			margin: {
				top: 20,
				left: 20,
				bottom: 20,
				right: 20
			},
			isHorizontal: true,// the "bars" of the chart are horizontal
			barWidth: 2,
			barGap: 1
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
		this.chart = d3.select(chartSelector);
		this.width = 0;
		this.height = 0;
		this.countLabels = null;

		this.barCount = 0;
		this.maxValue = d3.max(this.originalDataset, function(elm) {
			return parseInt(elm.type, 10);
		});

		this.createChart();
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
		let sortedDataset = this._sortDataset(this.originalDataset),
			sortedFlattenedDataset = this.flattenDataset(sortedDataset);

		return sortedFlattenedDataset;
	};
	




	/**
	* If a sorting function was passed in, sort the dataset
	* @param {object} dataset A dataset
	* @returns {Object} the sorted or unaltered dataset
	*/
	_sortDataset(dataset) {
		let sortFunction = this.settings.sortFunction;
		if (sortFunction) {
			dataset = dataset.sort(sortFunction);
		}

		return dataset;

	};


	/**
	* calculate the total number of bars
	* @returns {undefined}
	*/
	_setBarCount() {
		this.originalDataset.forEach((obj) => {
			this.barCount += parseInt(obj.employees.length);
		});
	};
	



	/**
	* flatten the dataset to employee level,
	* so we can bind the inidiviual employees to 
	* @param {array} dataset The dataset to flatten
	* @returns {array} The flattened dataset
	*/
	flattenDataset(originalDataset = this.originalDataset) {
		let flatSet = [];

		for (var i=0, len=originalDataset.length; i<len; i++) {
			var employees = originalDataset[i].employees;
			for (var j=0, len2=employees.length; j<len2; j++) {
				let emp = employees[j],
					ucObj = emp.unitChartData;

				ucObj[this.id] = {
					typeIdx: i,
					employeeOfTypeIdx: j
				};
				flatSet.push(emp);
			}
		}

		return flatSet;
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
			barCount = this.barCount;

		let barsDirectionSize = barCount * settings.barWidth + (barCount - 1) * settings.barGap,
			valueDirectionSize = 200;

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
		let valueScaleSize;

		if (this.settings.isHorizontal) {
			valueScaleSize = this.width;
		} else {
			valueScaleSize = this.height;
		}

		console.log(this.maxValue, valueScaleSize);

		this.valueScale = d3.scaleLinear()
			.domain([0, this.maxValue])
			.rangeRound([valueScaleSize, 0]);
	};



	/**
	* create the axes for the chart
	* @returns {undefined}
	*/
	_createAxes() {
		// now set the proper scale for each axis
		let axis;

		if (this.settings.isHorizontal) {
			axis = d3.axisBottom(this.valueScale);
			this.chart.append('g')
				.attr('class', 'axis axis--x')
				.attr('transform', 'translate(' + this.settings.margin.left +',' + (this.settings.margin.top + this.height) +')')
				.call(axis);
		} else {
			axis = d3.axisLeft(this.valueScale);
			this.chart.append('g')
				.attr('class', 'axis axis--y')
				.attr('transform', 'translate(' + this.settings.margin.left + ',' + this.settings.margin.top + ')')
				.call(axis);
		}

	};




	/**
	* add the bars to the chart
	* @returns {undefined}
	*/
	_addBars() {
		const dx = this.settings.barWidth + this.settings.barGap,
			valueScale = this.valueScale;
			console.log('h:', this.height);
		// console.log(this.dataset);
		let eachBar = this.chart.append('g')
			.attr('transform', 'translate(' + this.settings.margin.left + ',' + this.settings.margin.top + ')')
			.selectAll('.bar')
			.data(this.dataset)
			.enter()
			.append('rect')
			.attr('class', window.app.util.getEmployeeClasses)
			.attr('width', this.settings.barWidth)
			.attr('height', (d) => {
				// console.log(d.hoursPerWeek, valueScale(d.hoursPerWeek));
				return this.height - valueScale(d.hoursPerWeek);
			})
			.attr('y', (d) => {
				return valueScale(d.hoursPerWeek);
			})
			.attr('x', (d, i) => {
				return i * dx;
			})
	};
	
	



	/**
	* create the chart context (i.e. everything but the nodes)
	* @returns {undefined}
	*/
	createChart() {
		this._setBarCount();
		this._initChart();
		this._createScales();
		this._createAxes();

		this._addBars();
		// this.addCountLabels();
	};



	/**
	* create the chart and add nodes
	* @returns {undefined}
	*/
	drawChart() {
		this.createChart();
		this.addNodes();
		this.addCountLabels();
	};
	
}
