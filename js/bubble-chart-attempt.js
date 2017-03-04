window.app = window.app || {};

app.bubbleChart = (function($) {

	'use strict';

	var $sgBody = $('body');


	// vars for simulation
	var sgSimulation,
		sgForceStrength = 0.04,
		sgAlphaTarget = 0.4,
		sgForces = {},
		sgGeoCoordsProp;// employee property to use for geo force
	

	//-- Start force / simulation functions


		//-- Start force definitions


			/**
			* get a force function for a location
			* @param {ob} coordsProp The object containing the coordinates for the location
			* @returns {function} a force-function
			*/
			var getGeoForce = function(xOrY, coordsProp, defaultValue) {
				console.log(coordsProp);
				var forceFunction = function(d) {
					return 150;
					var xOrYValue = d[coordsProp][xOrY] || defaultValue;
					return xOrYValue;
				};
				return forceFunction;
			};
		

			/**
			* x-force for filter by gender
			* @returns {number}	the x coordinate to move to
			* @param {object} d current object's data
			*/
			var forceXGender = function(d) {
				var x = app.nodes.elements.sgNodesChartWidth/4;
				if (d.gender.toLowerCase() === 'man') {
					x = 3*app.nodes.elements.sgNodesChartWidth/4;
				}
				return x;
			};


			/**
			* x-force for filtering by discipline
			* @returns {number}	the x coordinate to move to
			* @param {object} d current object's data
			*/
			var forceXDiscipline = function(d) {
				var x = app.nodes.elements.sgNodesChartWidth/4;
				if (d.discipline === 'frontend development' || d.discipline === 'visual design' || d.discipline === 'interaction design') {
					x = app.nodes.elements.sgNodesChartWidth/2;
				} else if (d.discipline === 'backend development') {
					x = 4*app.nodes.elements.sgNodesChartWidth / 5;
				}
				return x;
			};


			/**
			* x-force for positioning all nodes on a grid
			* @returns {undefined}
			*/
			var forceXGrid = function(d, i) {
				return app.nodes.getNodeGridPosition(i)[0];
			};


			/**
			* y-force for positioning all nodes on a grid
			* @returns {undefined}
			*/
			var forceYGrid = function(d, i) {
				return app.nodes.getNodeGridPosition(i)[1];
			};
			


			/**
			* x-force for all nodes centered
			* @returns {number}	the x coordinate to move to
			* @param {object} d current object's data
			*/
			var forceXCenter = function(d) {
				return app.nodes.elements.sgNodesChartWidth / 2;
			};


			/**
			* y-force for all nodes centered
			* @returns {number}	the y coordinate to move to
			* @param {object} d current object's data
			*/
			var forceYCenter = function(d) {
				return app.nodes.elements.sgNodesChartHeight / 2;
			};


			/**
			* 
			* @returns {undefined}
			*/
			var defineForces = function() {
				sgForces = {
					default: [forceXGrid, forceYGrid],
					discipline: [forceXDiscipline, forceYCenter],
					gender: [forceXGender, forceYCenter],
					// geo: [getGeoForce('x', sgGeoCoordsProp, 120), getGeoForce('y', sgGeoCoordsProp, 20)],
				};
			};
			

		//-- End force definitions
		


		/**
		* get an x-force definition
		* @param {function} forceFunction The force function to apply
		* @returns {force}
		*/
		var xForce = function(forceFunction) {
			return d3.forceX(forceFunction).strength(sgForceStrength);
		};
		


		/**
		* get an y-force definition
		* @param {function} forceFunction The force function to apply
		* @returns {force}
		*/
		var yForce = function(forceFunction) {
			return d3.forceY(forceFunction).strength(sgForceStrength);
		};



		/**
		* reset the collision force
		* @returns {d3 simulation} the simulation object
		*/
		var setDefaultCollisionForce = function() {
			return sgSimulation.force('collide', d3.forceCollide(app.nodes.elements.sgNodeSize + app.nodes.elements.sgNodeSpacing));
		};


		/**
		* initialize the simulation
		* @returns {undefined}
		*/
		var initSimulation = function() {
			sgSimulation = d3.forceSimulation()
				.force('forceX', xForce(forceXGrid))
				.force('forceY', yForce(forceYGrid));

				console.log(setDefaultCollisionForce());

			setDefaultCollisionForce()
				.nodes(app.data.sgEmployees);

			console.log('e:', app.data.sgEmployees);

			// sgSimulation.on('tick', simulationTickHandler);
		}


		/**
		* define what happens on simulation's ticked event
		* @returns {undefined}
		*/
		var simulationTickHandler = function() {
			app.nodes.elements.sgNodes
				.attr('cx', function(d) {
					return d.x;
				})
				.attr('cy', function(d) {
					return d.y;
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
				.alphaDecay(0.4)
				.restart();
		};


		/**
		* change both x and y forces for simulation
		* @returns {undefined}
		*/
		var changeForces = function(forceName) {
			var newXForce,
				newYForce;

			if (forceName === 'geo') {
				console.log('geo', sgGeoCoordsProp);
				// console.log('geo', geoCoordsProp);
				// geo: [getGeoForce('x', sgGeoCoordsProp, 120), getGeoForce('y', sgGeoCoordsProp, 20)],
				newXForce = getGeoForce('x', sgGeoCoordsProp, 120);
				newYForce = getGeoForce('y', sgGeoCoordsProp, 20);
				console.log(typeof newXForce);
			} else {
				newXForce = sgForces[forceName][0];
				newYForce = sgForces[forceName][1];
			}

			changeForce('forceX', newXForce);
			changeForce('forceY', newYForce);
		};
		

	//-- End force / simulation functions


	/**
	* set the type of geo data to show
	* @returns {undefined}
	*/
	var setGeoType = function(geoType) {
		console.log(geoType);
		sgGeoCoordsProp = geoType;
	};
	



	/**
	* create svg for graph
	* @returns {undefined}
	*/
	var init = function() {
		app.nodes.elements.sgNodesChart = d3.select('#bubble-chart');
		app.nodes.elements.$sgNodesChart = $('#bubble-chart');
		app.nodes.elements.sgNodesChartWidth = app.nodes.elements.$sgNodesChart.width();
		app.nodes.elements.sgNodesChartHeight = app.nodes.elements.$sgNodesChart.height();

		defineForces();
	};



	// define public methods that are available through app
	var publicMethodsAndProps = {
		init: init,
		initSimulation: initSimulation,
		// changeForce: changeForce,
		changeForces: changeForces,
		setDefaultCollisionForce: setDefaultCollisionForce,
		geoCoordsProp: sgGeoCoordsProp,
		setGeoType: setGeoType,
		sgSimulation: sgSimulation,
		simulationTickHandler: simulationTickHandler,
	};

	return publicMethodsAndProps;

})(jQuery);