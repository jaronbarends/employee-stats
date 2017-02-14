(function($) {

	'use strict';

	// vars for graph's svg
	var sgGraph,
		$sgGraph = $('#chart'),
		sgGraphWidth = $sgGraph.width(),
		sgGraphHeight = $sgGraph.height();

	// vars for bubble nodes
	var sgBubbleNodes,
		sgBgBubbleNodes,
		sgBubbleNodeSize,
		sgBubbleNodeSpacing = 4;

	var $sgElementLib;

	// vars for simulation
	var sgSimulation,
		sgForceStrength = 0.04,
		sgAlphaTarget = 0.4;



	var forceXSplitGender = d3.forceX(function(d) {
		var x = sgGraphWidth/3;
		if (d.gender === 'male') {
			x = 2*sgGraphWidth/3;
		}
		return x;
	}).strength(sgForceStrength);

	var forceXSplitDiscipline = d3.forceX(function(d) {
		var x = sgGraphWidth/4;
		if (d.discipline === 'frontend development' || d.discipline === 'visual design' || d.discipline === 'interaction design') {
			x = sgGraphWidth/2;
		} else if (d.discipline === 'backend development') {
			x = 4*sgGraphWidth / 5;
		}
		return x;
	}).strength(sgForceStrength);

	var forceXCombined = d3.forceX(sgGraphWidth / 2).strength(sgForceStrength);


	/**
	* set reference to chart
	* @returns {undefined}
	*/
	var setChart = function() {
		sgGraph = d3.select('#chart');
		$sgGraph = $('#chart');
	};


	/**
	* read properties from html elements that we want to use in js
	* @returns {undefined}
	*/
	var readElementProps = function() {
		$sgElementLib = $('#element-lib');
		var $refBubbleNode = $sgElementLib.find('.bubble');
		sgBubbleNodeSize = 0.5 * $refBubbleNode.width();
	};
	


	/**
	* initialize the simulation
	* @returns {undefined}
	*/
	var initSimulation = function() {
		 sgSimulation = d3.forceSimulation()
			.force('forceX', forceXCombined)
			.force('forceY', d3.forceY(sgGraphHeight / 2).strength(sgForceStrength))
			.force('collide', d3.forceCollide(sgBubbleNodeSize + sgBubbleNodeSpacing));
	};




	/**
	* add nodes to screen
	* @returns {undefined}
	*/
	var addBubbleNodes = function(datapoints) {
		sgBubbleNodes = sgGraph.selectAll('.bubble')
			.data(datapoints)
			.enter()
			.append('div')
			.attr('class', 'bubble')
			// .attr('style', function(d) {
			// 	var backgroundImage = 'background-image: url("images/'+d.imageUrl+'");';
			// 	return backgroundImage;
			// })
			.attr('data-name', function(d) {
				var name = d.firstName;
				name += d.preposition ? ' ' + d.preposition : '';
				name += ' ' + d.lastName;
				return name;
			})
			// .on('mouseover', function(d) {
			// 	var name = d.firstName;
			// 	name += d.preposition ? ' ' + d.preposition : '';
			// 	name += ' ' + d.lastName
			// 	console.log(name);
			// });

		// for each bubble, also add a background element
		sgBgBubbleNodes = sgGraph.selectAll('.bubble__bg')
			.data(datapoints)
			.enter()
			.append('div')
			.attr('class', 'bubble__bg');
	};



	/**
	* define what happens on simulation's ticked event
	* @returns {undefined}
	*/
	var simulationTickHandler = function() {
		sgBubbleNodes
			.style('left', function(d) {
				return d.x + 'px';
			})
			.style('top', function(d) {
				return d.y + 'px';
			});
		sgBgBubbleNodes
			.style('left', function(d) {
				return d.x + 'px';
			})
			.style('top', function(d) {
				return d.y + 'px';
			});
	};


	/**
	* change a simulation force
	* @returns {undefined}
	*/
	var changeForce = function(forceId, newForce) {
		sgSimulation
			.force(forceId, newForce)
			.alphaTarget(sgAlphaTarget)
			.restart();
	};
	


	/**
	* initialize buttons
	* @returns {undefined}
	*/
	var initButtons = function() {
		
		d3.select('#split-by-gender').on('click', function() {
			changeForce('forceX', forceXSplitGender);
		});
		
		d3.select('#split-by-discipline').on('click', function() {
			changeForce('forceX', forceXSplitDiscipline);
		});

		d3.select('#combined').on('click', function() {
			changeForce('forceX', forceXCombined);
		});
	};
	
	

		// add defs
	function loadHandler(error, datapoints) {
		// addImageDefinitions(datapoints);

		// add shapes for nodes
		addBubbleNodes(datapoints);

		sgSimulation.nodes(datapoints)
			.on('tick', simulationTickHandler);
	}// loadHandler


	/**
	* load data and kick off rendering
	* @returns {undefined}
	*/
	var loadData = function() {
		d3.queue()
			.defer(d3.csv, 'data/employees.csv')
			.await(loadHandler);
	};



	// load data and kick things off

	/**
	* initialize all
	* @returns {undefined}
	*/
	var init = function() {
		setChart();
		readElementProps();

		initSimulation();
		initButtons();

		// load data and kick things off
		loadData();
	};
	
	$(document).ready(init);

})(jQuery);