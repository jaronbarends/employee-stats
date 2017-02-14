;(function() {

'use strict';

// (optional) tell jshint about globals (they should remain commented out)
/* globals d3 */ //Tell jshint someGlobalVar exists as global vard3.select('body').append('p').text('yay');

var sgData;


/**
* make graphic
* @returns {undefined}
*/
var makeGraph = function() {
	console.log('data:', sgData);
	// sgData = [5,10,15,20,25];

	d3.select('body').selectAll('p')
		.data(sgData)
		.enter()
		.append('p')
		.text(function(d) {
			return d;
		});

};



/**
* load csv data
* @returns {undefined}
*/
var loadCsvData = function() {
	d3.csv('data/starwars-characters.csv', function(error, data) {
		if (error) {

		} else {
			sgData = data;
			makeGraph();
		}
	});
};


/**
* load json data
* @returns {undefined}
*/
var loadJSONData = function() {
	d3.csv('data/starwars-characters.json', function(error, data) {
		if (error) {
			console.log(error);
		} else {
			// sgData = (data);
			sgData = JSON.parse(data);
			makeGraph();
		}
	});
};



/**
* init all
* @returns {undefined}
*/
var init = function() {
	loadCsvData();
	// loadJSONData();
};

init();

/////
})();