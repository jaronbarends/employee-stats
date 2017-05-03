window.app = window.app || {};

window.app.simulation = (function($) {

	'use strict';

	let app = window.app,
		sgSimulation,
		sgForceStrength = 0.04,
		sgAlphaTarget = 0.4;

	//-- Start force / simulation functions


		//-- Start force definitions


			/**
			* get a force function for a location
			* @param {ob} coordsProp The object containing the coordinates for the location
			* @returns {function} a force-function
			*/
			var getGeoForce = function(xOrY, coordsProp, defaultValue) {
				var forceFunction = function(d) {
					var xOrYValue = d[coordsProp][xOrY] || defaultValue;
					return xOrYValue;
				};
				return forceFunction;
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
				return app.nodes.elements.nodesSvgWidth / 2;
			};


			/**
			* y-force for all nodes centered
			* @returns {number}	the y coordinate to move to
			* @param {object} d current object's data
			*/
			var forceYCenter = function(d) {
				return app.nodes.elements.nodesSvgHeight / 2;
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
			return sgSimulation.force('collide', d3.forceCollide(app.nodes.elements.nodeSize + app.nodes.elements.nodeSpacing));
		};


		/**
		* initialize the simulation
		* @returns {undefined}
		*/
		var initSimulation = function() {
			sgSimulation = d3.forceSimulation()
				.force('forceX', xForce(forceXGrid))
				.force('forceY', yForce(forceYGrid));

			setDefaultCollisionForce()
				.nodes(app.data.employees);	
		}

		var getSimulation = function() {
			return sgSimulation;
		}


		/**
		* define what happens on simulation's ticked event
		* @returns {undefined}
		*/
		var simulationTickHandler = function() {
			app.nodes.elements.nodes
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
		

	//-- End force / simulation functions
	



	// define public methods that are available through app
	var publicMethodsAndProps = {
		getGeoForce,
		forceYGrid,
		forceXCenter,
		forceYCenter,
		xForce,
		yForce,
		setDefaultCollisionForce,
		initSimulation,
		getSimulation,
		simulationTickHandler,
		changeForce,
		sgSimulation,
		sgForceStrength,
		sgAlphaTarget,
	};

	return publicMethodsAndProps;

})(jQuery);