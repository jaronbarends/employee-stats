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
	var drawMap = function(geojson) {
		var provinces = geojson.features;

		elements.sgProjection = d3.geoMercator().fitSize([app.nodes.elements.sgNodesChartWidth, app.nodes.elements.sgNodesChartHeight], geojson);
		elements.sgPath = d3.geoPath().projection(elements.sgProjection);

		elements.sgMap = app.nodes.elements.sgNodesChart.selectAll('#map-group')
			.attr('transform', app.nodes.elements.sgGroupTranslate);

		elements.sgMap.selectAll('.province')
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
	var addOffices = function() {
		elements.sgMap.selectAll('.office')
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
			})
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
	var init = function(mapData) {
		var geojson = topojson.feature(mapData, mapData.objects.collection);

		drawMap(geojson);
		addOffices();
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