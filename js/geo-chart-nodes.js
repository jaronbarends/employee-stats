window.app = window.app || {};

window.app.geoChartNodes = (function($) {

	'use strict';

	let app = window.app;


	/**
	* 
	* @returns {undefined}
	*/
	var addNodes = function(svgGroup, coordsProp, r, fill) {
		let nodes = svgGroup.selectAll('.employee')
			.data(app.data.employees)
			.enter()
			.append('circle')
			.attr('class', app.util.getEmployeeClasses)
			.attr('r', r)
			.attr('fill', fill)
			// .attr('stroke', 'black')
			.attr('stroke-width', 1)
			.attr('cx', function(d, i) {
				let x = d[coordsProp].x;
				return x;
			})
			.attr('cy', function(d, i) {
				let y = d[coordsProp].y;
				return y;
			});
		
	};


	/**
	* 
	* @returns {undefined}
	*/
	const addLines = function(placesChartSvg) {
		let svgGroup = placesChartSvg.selectAll('.geo-lines-group'),
			lines = svgGroup.selectAll('.line')
				.data(app.data.employees)
				.enter()
				.append('line')
				.attr('x1', function(d) {
					return d.officeCoords.x;
				})
				.attr('y1', function(d) {
					return d.officeCoords.y;
				})
				.attr('x2', function(d) {
					return d.hometownCoords.x;
				})
				.attr('y2', function(d) {
					return d.hometownCoords.y;
				})
				.attr('stroke', 'rgba(0,0,0,0.3')
				.attr('stroke-width', 1)
	};
	
	


	/**
	* 
	* @returns {undefined}
	*/
	const addOfficeNodes = function(placesChartSvg) {
		let officesGroup = placesChartSvg.selectAll('.offices-group'),
			r = 6,
			fill = 'rgba(0,0,0,0.1)';
		addNodes(officesGroup, 'officeCoords', r, fill);
	};


	/**
	* 
	* @returns {undefined}
	*/
	const addHometownNodes = function(placesChartSvg) {
		let hometownsGroup = placesChartSvg.selectAll('.hometowns-group'),
			r = 2,
			fill = 'rgba(0,0,255,0.1)';

		fill = 'yellow';
		addNodes(hometownsGroup, 'hometownCoords', r, fill);
	};
	

	// let birthplacesGroup = placesChartSvg.selectAll('.birthplaces-group');
	// r = 2;
	// fill = 'rgba(255,0,0,0.1)';
	// fill = 'red';
	// addNodes(birthplacesGroup, 'birthplaceCoords', r, fill);
	

	/**
	* 
	* @returns {undefined}
	*/
	const init = function(placesChartSvg) {
		// addOfficeNodes(placesChartSvg);
		addHometownNodes(placesChartSvg);
		addLines(placesChartSvg);
	};



	// define public methods that are available through app
	const publicMethodsAndProps = {
		init
	};

	return publicMethodsAndProps;

})(jQuery);