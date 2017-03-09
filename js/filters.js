window.app = window.app || {};

app.filters = (function($) {

	'use strict';

	// filters variable naming:
	// for every [group] show [prop]

	var groups = {
		// use field name in .csv as property name
		// use the same property-names we use in app.data.sgEmployees
			gender: { guiName: 'Gender', dataset: []},
			discipline: { guiName: 'Discipline', dataset: []},
			organisationalUnit: { guiName: 'Organisational unit', dataset: []},
			office: { guiName: 'Office', dataset: []},
			parttimePercentage: { guiName: 'Parttime percentage', dataset: []},
		},
		props = {// props we want to show for filter group instances
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
		* create a chart for a type-instance of specific group-filter
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
		var createChartsByFilter = function(group, prop) {
			// we'll distinguish groups and types: a group consists of several types,
			// like the group offices consists of types utrecht, amersfoors, ...

			// remove any previous charts
			$('#filter-charts-container').empty();

			// set up chart for every group
			// console.log(group, prop, app.filters.groups[group]);
			var propDataset = app.filters.groups[prop].dataset;

			// check for which types we need to show charts
			// this is the "for every..." part
			group = app.filters.groups[group].dataset;
			var chartIdx = 0;

			// loop through every type in this group
			for (var i=0, len=group.length; i<len; i++) {
				

				var typeEmployees = group[i].employees;// array for all employees for a given type, like a specific discipline or office

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
						type: group[i].type,
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
			group = $form.find('#group-filter').val(),
			prop = $form.find('#employee-properties').val();

		// decide which type of chart to show
		createChartsByFilter(group, prop);
	};
	


	/**
	* initialize comparison tool
	* @returns {undefined}
	*/
	var initCompareTool = function() {
		var $groupSelect = $('#group-filter'),
			$propertiesSelect = $('#employee-properties'),
			groupOptions = '',
			propertyOptions = '';

		for (var groupName in app.filters.groups) {
			var guiName = app.filters.groups[groupName].guiName;
			// console.log(app.filters.groups[groupName]);

			groupOptions += '<option value="' + groupName + '">' + guiName + '</option>';
		}
		$groupSelect.append(groupOptions);


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
		groups: groups,
		props: props,
		init: init
	};

	return publicMethodsAndProps;

})(jQuery);