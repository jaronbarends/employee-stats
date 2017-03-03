window.app = window.app || {};

app.nodes = (function($) {

	'use strict';

	// vars for employee nodes
	var elements = {
		sgNodes: null,// d3 selection of all employee nodes
		sgDefaultNodeSize: 8,
		sgNodeSize: 8,
		sgDefaultNodeSpacing: 3,
		sgNodeSpacing: 3,
		sgInfoProp: '',// property to be shown when clicking on node
		sgNodesChart: null,
		sgNodesChart: null,
		sgNodesChartWidth: null,
		sgNodesChartHeight: null,
		sgGroupTranslate: 'translate(0,0)'
	};


	/**
	* get the position for a node on a grid (default 10x10)
	* @param {number} idx The index of the node
	* @param {object} options Config options for grid
	* @returns {Array} [x, y]
	*/
	var getNodeGridPosition = function(idx, options) {
		var defaults = {
			gridOrigin: {x: 140, y: 20 },
			gridSpacing: 8,
			gridSize: 10,// number of nodes in each row and col
			gridIsHorizontal: true,
		},
		col,
		row,
		x,
		y;

		var c = $.extend(defaults, options);// config object

		if (c.gridIsHorizontal) {
			col = idx % c.gridSize + ( c.gridSize + 0.5 ) * Math.floor( idx / (c.gridSize*c.gridSize) );
			row = Math.floor( idx / c.gridSize ) - c.gridSize * Math.floor( idx / (c.gridSize*c.gridSize) );
			x = ( 2 * elements.sgNodeSize + c.gridSpacing ) * col + c.gridOrigin.x;
			y = ( 2 * elements.sgNodeSize + c.gridSpacing ) * row + c.gridOrigin.y;
		} else {
			c.gridSpacing = elements.sgNodeSize;
			col = idx % c.gridSize;
			row = Math.floor(idx / c.gridSize) + 0.5 * Math.floor(idx / (c.gridSize*c.gridSize));
			x = ( 2 * elements.sgNodeSize + c.gridSpacing) * col + c.gridOrigin.x;
			y = ( 2 * elements.sgNodeSize + c.gridSpacing) * row + c.gridOrigin.y;
		}

		return [x,y];
	};
	


	/**
	* add nodes to screen
	* @returns {undefined}
	*/
	var addEmployeeNodes = function() {
		var employeeG = elements.sgNodesChart.selectAll('#employee-group')
				.attr('transform', elements.sgGroupTranslate);

		elements.sgNodes = employeeG.selectAll('.employee')
			.data(app.data.sgEmployees)
			.enter()
			.append('circle')
			.attr('class', function(d) {
				var clsNames = [
					'employee',
					'employee--'+d.gender.toLowerCase(),
					'employee--office-'+d.office.toLowerCase(),
					'employee--discipline-'+d.discipline.toLowerCase().replace(' ','-')
				],
				cls = clsNames.join(' ');

				return cls;
			})
			.attr('r', elements.sgNodeSize)
			.attr('cx', function(d, i) {
				var x = getNodeGridPosition(i)[0];
				d.x = x; 
				return x;
			})
			.attr('cy', function(d, i) {
				var y = getNodeGridPosition(i)[1];
				d.y = y;
				return y;
			})
			.attr('x', function(d, i) {
				return getNodeGridPosition(i)[0];
			})
			.attr('y', function(d, i) {
				return getNodeGridPosition(i)[1];
			})
			.on('click', function(d) {
				if (elements.sgInfoProp) {
					console.log(d[elements.sgInfoProp]);
				}
			})
	};


	/**
	* set size of employee nodes
	* @returns {undefined}
	*/
	var setNodeSize = function(size) {
		elements.sgNodeSize = size || elements.sgDefaultNodeSize;
		elements.sgNodesChart.selectAll('.employee')
			.attr('r', elements.sgNodeSize);
	};


	/**
	* set spacing between employee nodes
	* @returns {undefined}
	*/
	var setNodeSpacing = function(spacing) {
		if (typeof spacing === 'undefined') {
			spacing = elements.sgDefaultNodeSpacing;
		}
		elements.sgNodeSpacing = spacing;
	};

	/**
	* 
	* @returns {undefined}
	*/
	var init = function() {
		addEmployeeNodes();
	};



	// define public methods that are available through app
	var publicMethodsAndPropsAndProps = {
		elements: elements,
		init: init,
		setNodeSize: setNodeSize,
		setNodeSpacing: setNodeSpacing,
		getNodeGridPosition: getNodeGridPosition,
	};

	return publicMethodsAndPropsAndProps;

})(jQuery);