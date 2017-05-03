window.app = window.app || {};

window.app.nodes = (function($) {

	'use strict';

	let app = window.app;

	// vars for employee nodes
	let elements = {
		nodes: null,// d3 selection of all employee nodes
		defaultNodeSize: 8,
		nodeSize: 8,
		defaultNodeSpacing: 3,
		nodeSpacing: 3,
		infoProp: '',// property to be shown when clicking on node
		nodesSvg: null,
		nodesSvgWidth: null,
		nodesSvgHeight: null,
		groupTranslate: 'translate(0,0)'
	};


	/**
	* get the position for a node on a grid (default 10x10)
	* @param {number} idx The index of the node
	* @param {object} options Config options for grid
	* @returns {Array} [x, y]
	*/
	var getNodeGridPosition = function(idx, options) {
		var defaults = {
			gridOrigin: {x: 20, y: 20 },
			gridSpacing: 8,
			gridSize: 10,// number of nodes in each row and col
			gridIsHorizontal: true,
			nodeSize: elements.nodeSize
		},
		col,
		row,
		x,
		y;

		var c = $.extend(defaults, options);// config object

		if (c.gridIsHorizontal) {
			col = idx % c.gridSize + ( c.gridSize + 0.5 ) * Math.floor( idx / (c.gridSize*c.gridSize) );
			row = Math.floor( idx / c.gridSize ) - c.gridSize * Math.floor( idx / (c.gridSize*c.gridSize) );
			x = ( 2 * c.nodeSize + c.gridSpacing ) * col + c.gridOrigin.x;
			y = ( 2 * c.nodeSize + c.gridSpacing ) * row + c.gridOrigin.y;
		} else {
			c.gridSpacing = c.nodeSize;
			col = idx % c.gridSize;
			row = Math.floor(idx / c.gridSize) + 0.5 * Math.floor(idx / (c.gridSize*c.gridSize));
			x = ( 2 * c.nodeSize + c.gridSpacing) * col + c.gridOrigin.x;
			y = ( 2 * c.nodeSize + c.gridSpacing) * row + c.gridOrigin.y;
		}

		return [x,y];
	};
	


	/**
	* add nodes to screen
	* @returns {undefined}
	*/
	var addEmployeeNodes = function() {
		let employeeG = elements.nodesSvg.selectAll('#employee-nodes-group')
				.attr('transform', elements.groupTranslate);

		elements.nodes = employeeG.selectAll('.employee')
			.data(app.data.employees)
			.enter()
			.append('circle')
			.attr('class', app.util.getEmployeeClasses)
			.attr('r', 0);

		setNodePositions(elements.nodes, getNodeGridPosition)
			.on('click', function(d) {
				if (elements.infoProp) {
					console.log(d[elements.infoProp]);
				}
			});
	};


	/**
	* sets the x, y, cx and cy attribute of all nodes in a selection
	* and returns the selection for chaining
	*
	* @param {d3 selection} selection The d3 selection on whose nodes to set the position
	* @param {function} positionFunction The function to call for each node; has to return [x,y]
	* @returns {d3 selection} The modified d3 selection
	*/
	const setNodePositions = function(selection, positionFunction, duration = 0, optionsForPositionFunction) {
		if (duration) {
			selection = selection
				.transition()
				.duration(duration);
		}
		selection
			.attr('cx', function(d, i) {
				var x = positionFunction(i, optionsForPositionFunction)[0];
				d.x = x; 
				return x;
			}).attr('cy', function(d, i) {
				var y = positionFunction(i, optionsForPositionFunction)[1];
				d.y = y;
				return y;
			})
			.attr('x', function(d, i) {
				return positionFunction(i, optionsForPositionFunction)[0];
			})
			.attr('y', function(d, i) {
				return positionFunction(i, optionsForPositionFunction)[1];
			});

		return selection;
	};
	


	/**
	* reveal all employee nodes
	* @returns {undefined}
	*/
	const revealNodes = function() {
		let $body = $('body'),
			numEmployees = app.data.employees.length,
			// firstDelay = 400,
			firstDelay = 4,
			timeoutsAndDelays = app.util.getTimeoutsAndDelays(numEmployees, firstDelay),
			delays = timeoutsAndDelays.cumulativeDelays,
			animationDuration = 100;

		elements.nodes
			.transition()
			.on('end', function(d, i) {
				$body.trigger('nodeRevealed', {revealed: i+1});
			})
			.ease(d3.easeBackOut)
			.duration(animationDuration)
			.delay(function(d, i) {
				return delays[i];
			})
			.attr('r', elements.nodeSize);
	};

	//d3.easeLinearIn
	


	/**
	* set size of employee nodes
	* @returns {undefined}
	*/
	var setNodeSize = function(size = elements.defaultNodeSize, duration = 1000) {
		elements.nodeSize = size;
		elements.nodesSvg.selectAll('.employee')
			.transition()
			.duration(duration)
			.attr('r', elements.nodeSize);
	};


	/**
	* set spacing between employee nodes
	* @returns {undefined}
	*/
	var setNodeSpacing = function(spacing) {
		if (typeof spacing === 'undefined') {
			spacing = elements.defaultNodeSpacing;
		}
		elements.nodeSpacing = spacing;
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
		elements,
		getNodeGridPosition,
		init,
		revealNodes,
		setNodePositions,
		setNodeSize,
		setNodeSpacing,
	};

	return publicMethodsAndPropsAndProps;

})(jQuery);