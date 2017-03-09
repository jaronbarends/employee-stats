window.app = window.app || {};

app.dataprocessorEmployees = (function($) {

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
	* @param {object} emp The current employee's data-object
	* @returns {undefined}
	*/
	var processDiscipline = function(emp) {
		var discipline = emp.disciplineWithLevel,
			disciplineFound = false,
			level = '';

		// cut off level
		for (var lv=0, lvLen = app.data.sgLevels.length; lv<lvLen; lv++) {
			var currLevel = app.data.sgLevels[lv];
			
			if (discipline.toLowerCase().indexOf(currLevel) === 0) {
				discipline = discipline.substr(currLevel.length + 1);
				// make first letter uppercase if it isn't already
				var firstLetter = discipline.charAt(0);
				if (firstLetter.toUpperCase() !== firstLetter) {
					discipline = firstLetter.toUpperCase() + discipline.substr(1, discipline.length-1);
				}
				level = currLevel;

				// stagiairs often don't have discipline in their data
				// And I prefer not to count them within discipline anyhow
				if (level === 'stagiair') {
					discipline = 'Stagiair';
				}
				break;
			}
		}

		// we've looped through the levels, so any level is cut of now
		// add the cleaned (or unchanged) discipline as a new property
		emp.discipline = discipline;
		emp.level = level;
	};


	/**
	* handle an employee's organisational unit data
	* - cut of office name and "eFocus"
	* - fill orgnisational units array
	* in dataset, values may look like "Marketing & Communicatie", "Development Utrecht eFocus" or just "eFocus" (mt)
	* @param {object} emp The current employee's data-object
	* @returns {undefined}
	*/
	var processOrganisationalUnit = function(emp) {
		var unit = emp.organisationalUnit,
			unitLc = unit.toLowerCase(),
			unitFound = false;

		// rename just eFocus to Management Team
		if (unitLc === 'efocus') {
			unit = 'Management Team';
			// emp.organisationalUnit = unit;

		}

		// check if unit includes an office name
		// when not on its own, eFocus is always preceded by office name, so it will be cut off as well
		for (var i=0, len=app.data.sgOffices.length; i<len; i++) {
			var office = app.data.sgOffices[i].city.toLowerCase(),
				oIdx = unitLc.indexOf(' '+office);

			if (oIdx > 0) {
				unit = unit.substr(0, oIdx);
				break;
			}
		}
		emp.organisationalUnit = unit;
		
	};


	/**
	* Associate MD's with the correct office (now, they're all associated with Utr)
	* @returns {undefined}
	*/
	var correctMDOffice = function(emp) {
		if (emp.disciplineWithLevel.toLowerCase() === 'managing director') {
			var office = 'Utrecht';
			switch (emp.birthplace.toLowerCase()){
				case 'heerlen':
					office = 'Eindhoven';
					break;
				case 'nijmegen':
					office = 'Amersfoort';
					break;
				case 'rijswijk':
					office = 'Amsterdam';
					break;
				// no need to handle Utrecht MD
			}
			emp.office = office;
		}
	};
	
	


	/**
	* handle an employee's discipline data
	* - fill disciplines array
	* - put level into separate field
	* @returns {undefined}
	*/
	var processDisciplinesEtc = function() {
		// console.log(app.data.sgOffices);
		for (var i=0, len=app.data.sgEmployees.length; i<len; i++) {

			var emp = app.data.sgEmployees[i];

			correctMDOffice(emp);
			processDiscipline(emp);
			processOrganisationalUnit(emp);
		}
	};
	


	/**
	* process age and startdate data of employee
	* @returns {undefined}
	*/
	var processAges = function() {
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

			// put age data into age array
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
		// check if this group already contains this employee's type
		var type = employee[groupName],
			dataset = app.filters.groups[groupName].dataset,// like disciplines dataset
			typeExists = false;


		for (var i=0, len=dataset.length; i<len; i++) {
			var group = dataset[i];
			if (group.type === type) {
				typeExists = true;
				group.employees.push(employee);
				break;
			}
		}

		// if no object exists for this type, create one and push it
		if (!typeExists) {
			var typeObj = {
				type: type,
				employees: [employee]
			}
			dataset.push(typeObj);
		}
	};


	/**
	* process data of employees (like fetching disciplines)
	* @returns {undefined}
	*/
	var processEmployeeData = function() {
		// process data we want to manipulate before use
		processDisciplinesEtc();
		processAges();

		// now popuplate filterGroups (buckets of employees with shared property)
		for (var i=0, len=app.data.sgEmployees.length; i<len; i++) {
			var employee = app.data.sgEmployees[i];

			// loop through employee groups (like gender, discipline) and add this employee's data
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
		// put original employee properties into array before we add all kind of helper props
		initEmployeeProperties();
		// process employee data (disciplines etc)
		processEmployeeData();
	};



	// define public methods that are available through app
	var publicMethodsAndProps = {
		init: init
	};

	return publicMethodsAndProps;

})(jQuery);