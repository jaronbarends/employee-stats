window.app = window.app || {};

app.bubbleChart = (function($) {

	'use strict';

	var $sgBody = $('body');

	var sgSimulation,
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

			setDefaultCollisionForce()
				.nodes(app.data.sgEmployees);	
		}

		var getSimulation = function() {
			return sgSimulation;
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
		* 
		* @returns {undefined}
		*/
		var changeForces = function(forceName) {
			if (forceName === 'geo') {
				
			}
		};
		

	//-- End force / simulation functions
	



	// define public methods that are available through app
	var publicMethodsAndProps = {
		// init: init
		getGeoForce: getGeoForce,
		forceXGender: forceXGender,
		forceXDiscipline: forceXDiscipline,
		forceXGender: forceXGender,
		forceYGrid: forceYGrid,
		forceXCenter: forceXCenter,
		forceYCenter: forceYCenter,
		xForce: xForce,
		yForce: yForce,
		setDefaultCollisionForce: setDefaultCollisionForce,
		initSimulation: initSimulation,
		getSimulation: getSimulation,
		simulationTickHandler: simulationTickHandler,
		changeForce: changeForce,

		sgSimulation: sgSimulation,
		sgForceStrength: sgForceStrength,
		sgAlphaTarget: sgAlphaTarget,
	};

	return publicMethodsAndProps;

})(jQuery);