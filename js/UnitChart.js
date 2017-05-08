class UnitChart {

	/**
	* constructor function
	* @param {object} options {dataset:array, chartSelector:string[, sortFunction:function]}
	* @returns {undefined}
	*/
	constructor(dataset, chartSelector, options) {
		let defaults = {
			margin: {
				top: 20,
				left: 20,
				bottom: 20,
				right: 20
			},
			isHorizontal: true,// the "bars" of the chart are horizontal
			radius: 4,
			typeMargin: 10,
			employeeMargin: 2,
			showCountLabels: true
		};

		// setup stuff
		this.settings = Object.assign({}, defaults, options);
		this.dataset = this._sortDataset(dataset);
		this.flatSet = this._flattenDataset();

		// do chart stuff
		this.chart = d3.select(chartSelector);
		this.width = 0;
		this.height = 0;

		this.createChartContext();
	}



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
	* flatten the dataset to employee level,
	* so we can bind the inidiviual employees to 
	* @param {array} dataset The dataset to flatten
	* @returns {array} The flattened dataset
	*/
	_flattenDataset() {
		let dataset = this.dataset,
			flatSet = [];

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
	* determine height and width etc
	* @returns {undefined}
	*/
	_initChart() {
		
		// calculate desired size based on dataset, radius and margin between units
		let dataset = this.dataset,
			settings = this.settings,
			numberOfTypes = dataset.length,
			maxCount = d3.max(dataset, function(elm) {
				return elm.employees.length;
			});

		let countDirectionSize = 2*settings.radius * maxCount + settings.employeeMargin * (maxCount - 1),
			typeDirectionSize = 2*settings.radius * numberOfTypes + settings.typeMargin * (numberOfTypes - 1);

		if (settings.isHorizontal) {
			this.width = countDirectionSize;
			this.height = typeDirectionSize;
		} else {
			this.width = typeDirectionSize;
			this.height = countDirectionSize;
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
		// the type scale is a numeric scale to calculate positions for the type-data
		// the type label scale is a scale that can return the proper type name
		// the employee count scale is the scale for the number of employees
		// both the type and the employee count can be used vertically or horizontally
		// so we can't name them xScale and yScale

		// first determine which propery (width or height) to use for each scale
		let typeScaleHeightOrWidth,
			employeeCountHeightOrWidth;

		if (this.settings.isHorizontal) {
			typeScaleHeightOrWidth = this.height;
			employeeCountHeightOrWidth = this.width;
		} else {
			typeScaleHeightOrWidth = this.width;
			employeeCountHeightOrWidth = this.height;
		}

		this.typeScale = d3.scaleBand()
			.domain(d3.range(this.dataset.length))
			.rangeRound([0, typeScaleHeightOrWidth])
			.padding(0.1);

		this.typeLabelScale = d3.scaleBand()
			.domain(this.dataset.map(function(d) {return d.type;}))
			.rangeRound([0, typeScaleHeightOrWidth])
			.padding(0.1);

		this.employeeCountScale = d3.scaleLinear()
			.domain([0, d3.max(this.dataset, function(d) {
					return d.employees.length;
				})]);

		if (this.settings.isHorizontal) {
			this.employeeCountScale.range([0, employeeCountHeightOrWidth]);
		} else {
			this.employeeCountScale.range([employeeCountHeightOrWidth, 0]);
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
			xScale = this.employeeCountScale;
			xTicksScale = xScale;
			yScale = this.typeScale;
			yTicksScale = this.typeLabelScale;
		} else {
			xScale = this.typeScale;
			xTicksScale = this.typeLabelScale;
			yScale = this.employeeCountScale;
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
	};
	


	/**
	* 
	* @returns {undefined}
	*/
	_addEachCircle() {
		// determine radius of unit-circles by checking at which axis one unit is the smallest
		// let unitSizeAxis1 = this.typeScale.bandwidth(),// this already includes padding
		// 	unitSizeAxis2 = this.employeeCountScale(1) * 0.8,// multiply by 0.8 to create padding
		// 	r = Math.min(unitSizeAxis2, unitSizeAxis1)/2;

		let eachCircle = this.chart.append('g')
			.attr('transform', 'translate(' + this.settings.margin.left + ',' + this.settings.margin.top + ')')
			.selectAll('.unit')
			.data(this.flatSet)
			.enter()
			.append('circle')
			.attr('class', window.app.util.getEmployeeClasses)
			.attr('r', this.settings.radius);

		return eachCircle;
	};



	/**
	* circles need to be placed in the center of a scale's band
	* so calculate the offset for that
	* @returns {undefined}
	*/
	_getOffsetToScaleBandCenter() {
		return Math.ceil(this.typeScale.bandwidth()/2);
	};


	/**
	* get the position for a node in the chart
	* @returns {undefined}
	*/
	getNodePosition(d, i, options = {ths:this}) {
		let x,
			y,
			ths = options.ths;
			// console.log(ths);
			// console.log(d, i);
			// return[0,0];

		if (ths.settings.isHorizontal) {
			x = ths.employeeCountScale(d.employeeOfTypeIdx + 1);// employeeOfTypeIdx = 0-based
			y = ths.typeScale(d.typeIdx) + ths._getOffsetToScaleBandCenter();// put center in center of band
		} else {
			x = ths.typeScale(d.typeIdx) + ths._getOffsetToScaleBandCenter();// put center in center of band
			y = ths.employeeCountScale(d.employeeOfTypeIdx + 1);// employeeOfTypeIdx = 0-based
		}

		return [x,y];

	};
	
	
	

	/**
	* add all data-nodes
	* @returns {undefined}
	*/
	addNodes() {
		// render units
		let eachCircle = this._addEachCircle(),
			cxOrCyForType,
			cxOrCyForEmployeeCount;

		eachCircle.attr('cx', (d, i) => {
				// yay! arrow function's this is this class's this :)
				return this.getNodePosition(d)[0];
			})
			.attr('cy', (d, i) => {
				return this.getNodePosition(d)[1];
			});
	};



	/**
	* add labels with employee count for every type
	* @returns {undefined}
	*/
	addCountLabels() {
		if (this.settings.showCountLabels) {
			let typeAmounts = [];
			this.dataset.forEach(function(typeObj) {
				typeAmounts.push(typeObj.employees.length);
			});

			// now add text to svg
			let eachCountLabel = this.chart.append('g')
				.attr('transform', 'translate(' + this.settings.margin.left +',' + this.settings.margin.top +')')
				.selectAll('.count-label')
				.data(typeAmounts)
				.enter()
				.append('text')
				.attr('class', 'count-label')
				.text(function(d) {
					return d;
				});

			if (this.settings.isHorizontal) {
				eachCountLabel.attr('x', (d, i) => {
						return this.employeeCountScale(d+1);// put label where next unit would be
					})
					.attr('y', (d, i) => {
						return this.typeScale(i) + this._getOffsetToScaleBandCenter();
					})
					.attr('dy', '0.3em');
			} else {
				eachCountLabel.attr('x', (d, i) => {
							return this.typeScale(i) + this._getOffsetToScaleBandCenter();
					})
					.attr('y', (d, i) => {
							return this.employeeCountScale(d+1);// put label where next unit would be
					})
					.attr('dy', 0)
					.attr('text-anchor', 'middle');
			}

		}
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
		// this.addCountLabels();
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
