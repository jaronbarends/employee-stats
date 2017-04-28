window.app = window.app || {};

window.app.map = (function($) {

	'use strict';

	var app = window.app;

	// vars for map stuff
	var elements = {
		sgProjection: null,
		sgPath: null,
		sgMap: null
	};

	var $sgBody = $('body');



	/**
	* draw map of The Netherlands
	* @returns {undefined}
	*/
	var drawMap = function(geojson, map) {
		var provinces = geojson.features;

		elements.sgProjection = d3.geoMercator().fitSize([app.nodes.elements.sgNodesSvgWidth, app.nodes.elements.sgNodesSvgHeight], geojson);
		elements.sgPath = d3.geoPath().projection(elements.sgProjection);

		// elements.sgMap = app.nodes.elements.sgNodesSvg.selectAll('#map-group')
		map.attr('transform', app.nodes.elements.sgGroupTranslate);

		map.selectAll('.province')
			.data(provinces)
			.enter()
			.append('path')
			.attr('class', 'province')
			.attr('d', elements.sgPath);
	};


	/**
	* show the map
	* @returns {undefined}
	*/
	var show = function() {
		$sgBody.addClass('map-view');
	};


	/**
	* hide the map
	* @returns {undefined}
	*/
	var hide = function() {
		$sgBody.removeClass('map-view');
	};
	


	/**
	* add circles for offices
	* @returns {undefined}
	*/
	var addOffices = function(map) {
		map.selectAll('.office')
			.data(app.data.sgOffices)
			.enter()
			.append('circle')
			.attr('class', 'office')
			.attr('r', 20)
			.attr('cx', function(d) {
				var coords = elements.sgProjection([d.long, d.lat]);
				return coords[0];
			})
			.attr('cy', function(d) {
				var coords = elements.sgProjection([d.long, d.lat]);
				return coords[1];
			});
	};



	/**
	* initialize map stuff
	* @returns {undefined}
	*/
	var initMap = function(mapData) {
	};




	/**
	* 
	* @returns {undefined}
	* @param {json object} mapData mapData from csv file
	*/
	var init = function(mapData, svg, mapGroupSelector) {
		let geojson = topojson.feature(mapData, mapData.objects.collection),
			map = svg.selectAll(mapGroupSelector);

		drawMap(geojson, map);
		// addOffices(map);
	};



	// define public methods that are available through app
	var publicMethodsAndProps = {
		elements,
		init,
		show,
		hide
	};

	return publicMethodsAndProps;

})(jQuery);