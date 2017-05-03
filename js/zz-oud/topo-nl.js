//https://www.youtube.com/watch?v=aNbgrqRuoiE&t=392s
(function() {

	'use strict';

	var margin = {
			top: 20, 
			left: 20,
			right: 20,
			bottom: 20
		},
		height = 600 - margin.top - margin.bottom,
		width = 500 - margin.left - margin.right;

	var svg = d3.select('#map')
		.append('svg')
		.attr('height', height + margin.top + margin.bottom)
		.attr('width', width + margin.left + margin.right)
		.append('g')
		.attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');



	/**
	* create a projection for the map
	* @returns {undefined}
	*/
	// var createProjection = function() {
		var projection = d3.geoMercator()
			.translate([width/5, height*4.5])
			.scale(2200);

	// };

	var path = d3.geoPath()
		.projection(projection);

	var sgProjection,
		sgPath;
	

	/**
	* draw map of The Netherlands
	* @returns {undefined}
	*/
	var drawMap = function(geojson) {
		var provinces = geojson.features;

		sgProjection = d3.geoMercator().fitSize([width, height], geojson);
		sgPath = d3.geoPath().projection(sgProjection);

		svg.selectAll('.province')
			.data(provinces)
			.enter()
			.append('path')
			.attr('class', 'province')
			.attr('d', sgPath)
			.on('click', function(d) {
				// console.log(d.properties.OMSCHRIJVI);
				// console.log(d.properties.name);
			})
	};



	/**
	* get a radius based on population
	* @returns {undefined}
	*/
	var getRadiusByPopulation = function(population) {
		var r = Math.round(population / 1000000);
		r = Math.max(2, r);

		return r;
	};
	

	/**
	* add circles for offices
	* @returns {undefined}
	*/
	var addOffices = function(offices) {
		svg.selectAll('.office')
			.data(offices)
			.enter()
			.append('circle')
			.attr('class', 'office')
			// .attr('r', function(d) {
			// 	return getRadiusByPopulation(100000)
			// })
			.attr('r', 10)
			.attr('cx', function(d) {
				var coords = sgProjection([d.Longitude, d.Latitude]);
				return coords[0];
			})
			.attr('cy', function(d) {
				var coords = sgProjection([d.Longitude, d.Latitude]);
				return coords[1];
			})
	};
	
	

	var ready = function(error, mapData, offices) {
		// console.log(mapData);

		// console.log(mapData.objects.collection);

		var geojson = topojson.feature(mapData, mapData.objects.collection);

		drawMap(geojson);
		addOffices(offices);
	};

	var loadJson = function() {
		d3.queue()
			.defer(d3.json, 'data/provinces.topojson')
			.defer(d3.csv, 'data/offices-netherlands.csv')
			.await(ready);
	};


	/**
	* initialize all
	* @returns {undefined}
	*/
	var init = function() {
		loadJson();
	};
	


	$(document).ready(init);

})();