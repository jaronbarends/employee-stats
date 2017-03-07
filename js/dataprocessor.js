window.app = window.app || {};

app.dataprocessor = (function($) {

	'use strict';


	/**
	* put comparable employee properties into array
	* @returns {undefined}
	*/
	var initEmployeeProperties = function() {
		for (var prop in app.data.sgEmployees[0]) {
			app.data.sgEmployeeProps.push(prop);
		}
	};
	/**
	* handle an employee's discipline data
	* - fill disciplines array
	* - put level into separate field
	* @returns {undefined}
	*/
	var processEmployeeDisciplines = function() {
		for (var i=0, len=app.data.sgEmployees.length; i<len; i++) {
			var emp = app.data.sgEmployees[i],
				discipline = emp.disciplineWithLevel,
				disciplineFound = false,
				level = '';

			// cut off level
			for (var lv=0, lvLen = app.data.sgLevels.length; lv<lvLen; lv++) {
				var currLevel = app.data.sgLevels[lv];
				
				if (discipline.toLowerCase().indexOf(currLevel) === 0) {
					discipline = discipline.substr(currLevel.length + 1);
					level = currLevel;

					// stagiairs often don't have discipline in their data
					// And I prefer not to count them within discipline anyhow
					if (level === 'stagiair') {
						discipline = 'stagiair';
					}
					break;
				}
			}

			// we've looped through the levels, so any level is cut of now
			// add the cleaned (or unchanged) discipline as a new property
			emp.discipline = discipline;
			emp.level = level;
		}
	};


	/**
	* process age and startdate data of employee
	* @returns {undefined}
	*/
	var processEmployeeAges = function() {
		var ages = [],
			ageMin = 1000,
			ageMax = 0,
			ageSum = 0;

		for (var i=0, len=app.data.sgEmployees.length; i<len; i++) {
			var emp = app.data.sgEmployees[i];

			// process age data
			app.data.sgBirthdays.push(emp.birthday);
			var age = app.util.getYearsUntilToday(emp.birthday),
				ageRound = Math.floor(age);


			// keep track of min and max ages, and the sum
			ageMin = Math.min(ageRound, ageMin);
			ageMax = Math.max(ageRound, ageMax);
			ageSum += age;

			// put age data into array
			if (!ages[ageRound]) {
				ages[ageRound] = 1;
				// this creates an array like ages[22], ages[15]
				// this is somehow different from a normal array like ages[0], [1] etc
			} else {
				ages[ageRound]++;
			}
		
		}// end loop employees

		// check if every age between min and max is present
		var ageRange = ageMax - ageMin;
		for (var a = 0; a <= ageRange; a++) {
			var currAge = ageMin + a;
			app.data.sgAges.push({
				age: currAge,
				employeeCount: ages[currAge] || 0
			});
		}

		// calculate avarage age
		app.data.sgAverageAge = ageSum / app.data.sgEmployees.length;
	};



	/**
	* add employee to group which specific prop
	* @param {string} employee The current employee
	* @param {string} groupName The property-name of the group
	* @returns {undefined}
	*/
	var addEmployeeToGroup = function(employee, groupName) {
		if (groupName === 'discipline') {
			// separate discipline and functionLevel
		}

		// check if this group already contains this employee's type
		var type = employee[groupName],
			dataset = app.filters.groups[groupName].dataset;

		if (! (type in dataset)) {
			dataset[type] = [];
		}
		dataset[type].push(employee);
	};


	/**
	* process data of employees (like fetching disciplines)
	* @returns {undefined}
	*/
	var processEmployeeData = function() {
		// process data we want to manipulate before use
		processEmployeeDisciplines();
		processEmployeeAges();

		// now popuplate filterGroups
		for (var i=0, len=app.data.sgEmployees.length; i<len; i++) {
			var employee = app.data.sgEmployees[i];

			// loop through employee groups and add this employee's data
			for (var groupName in app.filters.groups) {
				addEmployeeToGroup(employee, groupName);
			}
		}

	};


	/**
	* 
	* @returns {undefined}
	*/
	var init = function() {
		initEmployeeProperties();
		processEmployeeData();
	};



	// define public methods that are available through app
	var publicMethodsAndProps = {
		init: init
	};

	return publicMethodsAndProps;

})(jQuery);