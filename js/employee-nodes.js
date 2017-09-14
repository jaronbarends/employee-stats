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
	var getNodeGridPosition = function(d, idx, options) {
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
				// if (elements.infoProp) {
				// 	console.log(d[elements.infoProp]);
				// }
				console.log(d, 'typeIdx:', d.typeIdx, 'employeeOfTypeIdx:', d.employeeOfTypeIdx);
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
				var x = positionFunction(d, i, optionsForPositionFunction)[0];
				d.x = x; 
				return x;
			})
			.attr('cy', function(d, i) {
				// console.log('cy; d=1:', d);
				var y = positionFunction(d, i, optionsForPositionFunction)[1];
				d.y = y;
				// console.log(i, y);
				return y;
			})
			.attr('x', function(d, i) {
				return positionFunction(d, i, optionsForPositionFunction)[0];
			})
			.attr('y', function(d, i) {
				return positionFunction(d, i, optionsForPositionFunction)[1];
			});

		// ? does not always return proper selection?!
		return selection;
	};
	


	/**
	* reveal all employee nodes
	* @returns {undefined}
	*/
	const revealNodes = function(firstDelay = 400, devMode = false) {
		let $body = $('body'),
			numEmployees = app.data.employees.length,
			timeoutsAndDelays = app.util.getTimeoutsAndDelays(numEmployees, firstDelay),
			delays = timeoutsAndDelays.cumulativeDelays,
			animationDuration = 100;

		if (devMode) {
			animationDuration = 1;	
		}

		elements.nodes
			.transition()
			.on('end', function(d, i) {
				$body.trigger('nodeRevealed', {revealed: i+1});
			})
			.ease(d3.easeBackOut)
			.duration(animationDuration)
			.delay(function(d, i) {
				if (devMode) {
					return 0;
				}
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
	* show active elements for the nodes-chart (context, takeaways)
	* @returns {undefined}
	*/
	const showActiveElements = function(allElements, activeIds, activeClass, inactiveClass) {
		allElements = Array.from(allElements);
		allElements.forEach((elm) => {
			const id = elm.getAttribute('id');
			if (activeIds.indexOf(id) > -1) {
				elm.classList.add(activeClass);
				if (inactiveClass) {
					elm.classList.remove(inactiveClass);
				}
			} else {
				elm.classList.remove(activeClass);
				if (inactiveClass) {
					elm.classList.add(inactiveClass);
				}
			}
		});
	};
	


	/**
	* show the active chart-context(s) for the nodes-chart and hide the others
	* i.e. show correct axes etc
	* @param {array} activeContextIds Ids of the context-elements to show
	* @returns {undefined}
	*/
	const showActiveContexts = function(activeContextIds = []) {
		const allElements = document.querySelectorAll('.nodes-chart-context'),
			activeClass = 'nodes-chart-context--is-active',
			inactiveClass = 'nodes-chart-context--is-inactive';

		showActiveElements(allElements, activeContextIds, activeClass, inactiveClass);
	};


	/**
	* show the active chart's takeaways and hide the others
	* @param {array} activeTakeawayIds Ids of the takeaway-elements to show
	* @returns {undefined}
	*/
	const showActiveTakeaways = function(activeTakeawayIds = []) {
		const allElements = document.querySelectorAll('#topic-section--nodes-chart .topic-takeaways'),
			activeClass = 'topic-takeaways--is-active',
			inactiveClass = 'topic-takeaways--is-inactive';

		showActiveElements(allElements, activeTakeawayIds, activeClass, inactiveClass);
	};
	


	/**
	* change the topic of the nodes chart (i.e. office, discipline, ...)
	* i.e. show correct axes etc, bind correct dataset.
	* @returns {undefined}
	*/
	const changeNodesChartTopic = function(selection, dataset, activeContextIds, activeTakeawayIds) {
		// set class nodes-chart-context--is-active on active context(s)
		// selection.data(dataset);// we should NOT rebind data: we want every node to remain representing the same employee!
		showActiveContexts(activeContextIds);
		showActiveTakeaways(activeTakeawayIds);
	};


	/**
	* highlight the employee's ages
	* @returns {undefined}
	*/
	const addAgeHighlighting = function() {
		const ageSet = app.data.buckets.ageRound.dataset,
			minAge = ageSet[0].type,
			maxAge = ageSet[ageSet.length-1].type,
			blueToDarkGrey30 = ['#00bdfa','#15b8f2','#1fb3eb','#27aee3','#2ca8dc','#30a4d4','#349fcd','#379ac6','#3995c0','#3b91b9','#3d8cb1','#3f86aa','#4082a3','#417d9c','#417896','#42738e','#426f87','#426a81','#42657a','#416274','#415c6d','#405867','#3f5460','#3e505a','#3d4c55','#3c474d','#3b4248','#393f42','#383a3c','#363636'],
			blueToDarkGrey10 = ['#00bdfa','#28ace2','#359dca','#3d8db3','#407e9d','#426f87','#415f71','#3f525d','#3b4449','#363636'],
			blueToDarkGrey5 = ['#00bdfa','#3898c4','#417692','#3f5562','#363636'],
			blueToDarkGrey3 = ['#00bdfa','#417692','#363636'],
			ageScale = d3.scaleOrdinal()
				.domain([minAge, maxAge])
				.range(blueToDarkGrey10);

		elements.nodes
			.style('fill', d => ageScale(parseInt(d.age, 10)));
	};


	/**
	* 
	* @returns {undefined}
	*/
	const removeNodeBackgrounds = function() {
		elements.nodes.style('fill', null);
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
		addAgeHighlighting,
		changeNodesChartTopic,
		elements,
		getNodeGridPosition,
		init,
		removeNodeBackgrounds,
		revealNodes,
		setNodePositions,
		setNodeSize,
		setNodeSpacing,
	};

	return publicMethodsAndPropsAndProps;

})(jQuery);