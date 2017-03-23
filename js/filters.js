window.app = window.app || {};

window.app.filters = (function($) {

	'use strict';

	var app = window.app;

	// filters variable naming:
	// for every [bucket] show [prop]
	var props = {// props we want to show for filter bucket instances
			age: { guiName: 'Age'},
			startDate: { guiName: 'Start date'},
			gender: { guiName: 'Gender'},
			discipline: { guiName: 'Discipline'},
			organisationalUnit: { guiName: 'Organisational unit'},
			office: { guiName: 'Office'},
			parttimePercentage: { guiName: 'Parttime percentage'},
		};



	//-- Start chart fucntions --

		/**
		* create a chart for a type-instance of specific bucket-filter
		* @param {array} dataset The dataset to draw a chart for
		* @param {object} options {chartType:like pieChart, chartIdx, extent:[]}
		* @returns {undefined}
		*/
		var createFilterChart = function(dataset, options) {
			var $container = $('#filter-charts-container'),
				containerId = 'chart-box-' + options.chartIdx,
				html = '<div id="' + containerId +'" class="chart-box chart-box--' + options.chartType + '"></div>';

			$container.append(html);

			if (options.chartType === 'pie') {
				var typeCount = dataset[0].typeCount,
					maxCount = options.extent[1],
					relativeSize = typeCount/maxCount;

				app.pieChart.drawChart(dataset, containerId, relativeSize);
			}

		};


		/**
		* join data from bucket and property
		* @param {string} bucketName The name of the bucket to use for the comparison (e.g. offices, disciplines)
		* @param {string} propName The property to show for every type in the bucket (e.g. gender, unit)
		* @returns {undefined}
		*/
		var joinBucketAndPropData = function(bucketName, propName) {
			
			var joinedDatasets = [],// array containing joined datasets
				bucketDataset = app.data.buckets[bucketName].dataset,// this is the "for every..." part
				propDataset = app.data.buckets[propName].dataset;// this is the "show ..." part
			// console.log(bucket, prop, app.data.buckets[bucket]);

			// loop through every type in this bucket
			for (var i=0, len=bucketDataset.length; i<len; i++) {

				var typeEmployees = bucketDataset[i].employees,// array for all employees for a given type, like a specific discipline or office
					typeEmployeesCount = typeEmployees.length;

				// now we have arrays for all employees for a given type, like a specific office
				// loop through those employees and sort them into the different prop-types
				var employeesPerProp = [];

				for (var j=0, empLen=typeEmployees.length; j<empLen; j++) {

					// for every employee in this type, check which chosen prop he has
					var employee = typeEmployees[j],
						propType = employee[propName];

					if (!(propType in employeesPerProp)) {
						employeesPerProp[propType] = 0;
					}
					employeesPerProp[propType]++;

				}// end looping through employees

				// now create dataset for this type
				var dataset = [];
				for (var p in employeesPerProp) {
					var obj = {
						type: bucketDataset[i].type,
						prop: p,
						count: employeesPerProp[p],
						typeCount: typeEmployeesCount
					};
					dataset.push(obj);
				}

				joinedDatasets.push(dataset);

			}// end looping through types

			return joinedDatasets;
		};
		
		



		/**
		* create charts based upon filters
		* @param {string} bucketName The name of the bucket to use for the comparison (e.g. offices, disciplines)
		* @param {string} propName The property to show for every type in the bucket (e.g. gender, unit)
		* @returns {undefined}
		*/
		var createChartsByFilter = function(bucketName, propName) {
			// we'll distinguish buckets and types: a bucket consists of several types,
			// like the bucket offices consists of types utrecht, amersfoors, ...

			// remove any previous charts
			$('#filter-charts-container').empty();

			var joinedDatasets = joinBucketAndPropData(bucketName, propName);

			// now loop through the bucket-types again and draw charts

			// create right type of chart based on prop
			var chartType = 'pie';

			// determine extent of the number of employees per type
			var extent = d3.extent(joinedDatasets, function(arr) {
				return arr[0].typeCount;
			});
 			for (var i=0, len=joinedDatasets.length; i<len; i++) {
				var dataset = joinedDatasets[i],
					options = {
						chartType,
						chartIdx: i,
						extent
					};

				createFilterChart(dataset, options);
			}


		};
		


	//-- End chart fucntions --



	/**
	* show a new comparison
	* @returns {undefined}
	*/
	var showComparison = function(e) {
		e.preventDefault();

		var $form = $(e.currentTarget),
			bucketName = $form.find('#bucket-filter').val(),
			propName = $form.find('#employee-properties').val();

		// decide which type of chart to show
		createChartsByFilter(bucketName, propName);
	};
	


	/**
	* initialize comparison tool
	* @returns {undefined}
	*/
	var initCompareTool = function() {
		var $bucketSelect = $('#bucket-filter'),
			$propertiesSelect = $('#employee-properties'),
			bucketOptions = '',
			propertyOptions = '';

		for (var bucketName in app.data.buckets) {
			var guiName = app.data.buckets[bucketName].guiName;

			bucketOptions += '<option value="' + bucketName +'"';
			if (bucketName === 'office') {
				bucketOptions += ' selected="selected"'
			}
			bucketOptions += '>' + guiName + '</option>';
		}
		$bucketSelect.append(bucketOptions);


		// generate props to show
		// console.log(app.filters.props);
		for (var propName in app.filters.props) {
			propertyOptions += '<option value="' + propName + '"';
			if (propName === 'gender') {
				propertyOptions += ' selected="selected"';
			}
			propertyOptions += '>' + app.filters.props[propName].guiName + '</option>';	
		}
		$propertiesSelect.append(propertyOptions);

		$('#filter-chart-form').on('submit', showComparison).trigger('submit');
	};

	/**
	* 
	* @returns {undefined}
	*/
	var init = function() {
		initCompareTool();
	};



	// define public methods that are available through app
	var publicMethodsAndProps = {
		props,
		init
	};

	return publicMethodsAndProps;

})(jQuery);