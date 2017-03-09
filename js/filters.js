window.app = window.app || {};

app.filters = (function($) {

	'use strict';

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
		* @returns {undefined}
		*/
		var createFilterChart = function(dataset, chartType, chartIdx) {
			var $container = $('#filter-charts-container'),
				id = 'chart-box-' + chartIdx,
				html = '<div id="' + id +'" class="chart-box chart-box--' + chartType + '"></div>';

			$container.append(html);

			if (chartType === 'pie') {
				app.pieChart.drawChart(dataset, id);
			}

		};
		



		/**
		* create charts based upon filters
		* @returns {undefined}
		*/
		var createChartsByFilter = function(bucket, prop) {
			// we'll distinguish buckets and types: a bucket consists of several types,
			// like the bucket offices consists of types utrecht, amersfoors, ...

			// remove any previous charts
			$('#filter-charts-container').empty();

			// set up chart for every bucket
			// console.log(bucket, prop, app.data.buckets[bucket]);
			var propDataset = app.data.buckets[prop].dataset;

			// check for which types we need to show charts
			// this is the "for every..." part
			bucket = app.data.buckets[bucket].dataset;
			var chartIdx = 0;

			// loop through every type in this bucket
			for (var i=0, len=bucket.length; i<len; i++) {
				

				var typeEmployees = bucket[i].employees;// array for all employees for a given type, like a specific discipline or office

				// now we have arrays for all employees for a given type, like a specific office
				// loop through those employees and sort them into the different prop-types
				var employeesPerProp = [];

				for (var j=0, empLen=typeEmployees.length; j<empLen; j++) {

					// for every employee in this type, check which chosen prop he has
					var employee = typeEmployees[j],
						propType = employee[prop];

					if (!(propType in employeesPerProp)) {
						employeesPerProp[propType] = 0;
					}
					employeesPerProp[propType]++;

				}// end looping through employees

				// now create dataset to send to chart
				var dataset = [];
				for (var p in employeesPerProp) {
					var obj = {
						type: bucket[i].type,
						prop: p,
						count: employeesPerProp[p]
					};
					dataset.push(obj);
				}

				// create right type of chart based on prop
				var chartType = 'pie';
				createFilterChart(dataset, chartType, chartIdx);
				chartIdx++;


			}// end looping through types


		};
		



	//-- End chart fucntions --



	/**
	* show a new comparison
	* @returns {undefined}
	*/
	var showComparison = function(e) {
		e.preventDefault();

		var $form = $(e.currentTarget),
			bucket = $form.find('#bucket-filter').val(),
			prop = $form.find('#employee-properties').val();

		// decide which type of chart to show
		createChartsByFilter(bucket, prop);
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
			// console.log(app.data.buckets[bucketName]);

			bucketOptions += '<option value="' + bucketName + '">' + guiName + '</option>';
		}
		$bucketSelect.append(bucketOptions);


		// generate props to show
		// console.log(app.filters.props);
		for (var propName in app.filters.props) {
			propertyOptions += '<option value="' + propName + '">' + app.filters.props[propName].guiName + '</option>';	
		}
		$propertiesSelect.append(propertyOptions);

		$('#filter-chart-form').on('submit', showComparison);
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
		props: props,
		init: init
	};

	return publicMethodsAndProps;

})(jQuery);