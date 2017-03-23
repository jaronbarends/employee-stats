window.app = window.app || {};

window.app.dataprocessorEmployees = (function($) {

	'use strict';

	var app = window.app;

	var sgAges = [],
		sgAgeMin = 1000,
		sgAgeMax = 0,
		sgAgeSum = 0;


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
		// for (var i=0, len=app.data.sgOffices.length; i<len; i++) {
		for (let office of app.data.sgOffices) {
			office = office.city.toLowerCase();
			var oIdx = unitLc.indexOf(' '+office);

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
	* process an employee's age data: push all birthdays into array
	* and start creating groups per age
	* @returns {undefined}
	*/
	var processAge = function(emp) {
		// process age data
		var age = app.util.getYearsUntilToday(emp.birthday),
			ageRound = Math.floor(age);


		emp.ageRound = ageRound;
		emp.ageExact = age;

		// addEmployeeToBucket(emp, 'age')


		// keep track of min and max ages, and the sum
		sgAgeMin = Math.min(ageRound, sgAgeMin);
		sgAgeMax = Math.max(ageRound, sgAgeMax);
		sgAgeSum += age;

		// put age data into age array
		if (!sgAges[ageRound]) {
			sgAges[ageRound] = 1;
			// this creates an array like sgAges[22], sgAges[15]
			// this is somehow different from a normal array like sgAges[0], [1] etc
			// my guess is that the array is converted to an object, with the numbers as property names
		} else {
			sgAges[ageRound]++;
		}
	};



	/**
	* process the employee's start date
	* put them into bucket for starting year
	* calculate how long they've been working at Valtech
	* calculate their age when they started
	* @returns {undefined}
	*/
	var processStartDate = function(emp) {
		var startDate = emp.startDate,
			parseTime = d3.timeParse('%d/%m/%Y'),
			yearStr = '31/12/' + startDate.split('/')[2],
			year = parseTime(startDate);

		var espy = app.data.employeesStartedPerYear,
			yearFound = false;

		for (var i=0, len=espy.length; i<len; i++) {
			var yearObj = espy[i]
			if (yearObj.yearStr === yearStr) {
				app.data.employeesStartedPerYear[i].count++;
				yearFound = true;
			}
		}

		if (!yearFound) {
			yearObj = {
				yearStr,
				year,
				count: 1
			};
			app.data.employeesStartedPerYear.push(yearObj);
		}

	};
	
	
	
	/**
	* sort the employeesStartedPerYear array
	* and add info: missing years and cumulative count
	* @returns {undefined}
	*/
	var sortAndCompleteStartYearArray = function() {
		var getYear = function(yearStr) {
			return +yearStr.split('/')[2];
		};

		var arr = app.data.employeesStartedPerYear;
		arr.sort(function(a, b) {
			return ( getYear(a.yearStr) - getYear(b.yearStr));
		});

		// now we have a sorted array, which may not contain every year
		var firstYear = getYear(arr[0].yearStr),
			lastYear = getYear(arr[arr.length-1].yearStr),
			currYear = firstYear,
			range = lastYear - firstYear,
			countCumulative = 0,
			prevYear = firstYear - 1,
			idx = 0,
			newArr = [];

		while (currYear <= lastYear) {
			var yearObj = arr[idx];

			if (getYear(yearObj.yearStr) > currYear) {
				// at least 1 year is missing - create a new obj
				var newYearStr = '31/12/'+currYear;
				yearObj = {
					yearStr: newYearStr,
					year: d3.timeParse('%d/%m/%Y')(newYearStr),
					count: 0
				};
			} else {
				idx++
			}
			countCumulative += yearObj.count;
			yearObj.countCumulative = countCumulative;

			newArr.push(yearObj);
			currYear++;
		}

		app.data.employeesStartedPerYear = newArr;
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
			processAge(emp);
			processStartDate(emp);
		}

		sortAndCompleteStartYearArray();
		// console.log(app.data.employeesStartedPerYear);
		var arr = app.data.employeesStartedPerYear,
			total = 0;
		for (var j=0, len=arr.length; j<len; j++) {
			// console.log(arr[j].yearStr, arr[j].count);
			total += arr[j].count;
		}
		// console.log(total);
	};
	


	/**
	* process age data we collected while looping through employees
	* @returns {undefined}
	*/
	var processAgeData = function() {

		// check if every age between min and max is present
		var ageRange = sgAgeMax - sgAgeMin;
		for (var a = 0; a <= ageRange; a++) {
			var currAge = sgAgeMin + a;
			app.data.sgAges.push({
				age: currAge,
				employeeCount: sgAges[currAge] || 0
			});
		}

		// calculate avarage age
		app.data.sgAverageAge = sgAgeSum / app.data.sgEmployees.length;
	};


	/**
	* sort buckets with time-based data like age
	* @returns {undefined}
	*/
	var sortTimeBuckets = function() {
		var buckets = [
				app.data.buckets.ageRound
			];
		
		for (var i=0, len=buckets.length; i<len; i++) {
			buckets[i].dataset.sort(function(a,b) {
				return a.type - b.type;
			});	
		}

	};



	/**
	* add employee to bucket which specific prop
	* @param {string} employee The current employee
	* @param {string} bucketName The property-name of the bucket
	* @returns {undefined}
	*/
	var addEmployeeToBucket = function(employee, bucketName) {
		// check if this bucket already contains this employee's type
		var type = employee[bucketName],
			dataset = app.data.buckets[bucketName].dataset,// like disciplines dataset
			typeExists = false;

		for (var i=0, len=dataset.length; i<len; i++) {
			var bucket = dataset[i];
			if (bucket.type === type) {
				typeExists = true;
				bucket.employees.push(employee);
				break;
			}
		}

		// if no object exists for this type, create one and push it
		if (!typeExists) {
			var typeObj = {
				type,
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
		processAgeData();

		// now popuplate filterBuckets (buckets of employees with shared property)
		for (var i=0, len=app.data.sgEmployees.length; i<len; i++) {
			var employee = app.data.sgEmployees[i];

			// loop through employee buckets (like gender, discipline) and add this employee's data
			for (var bucketName in app.data.buckets) {
				addEmployeeToBucket(employee, bucketName);
			}
		}

		sortTimeBuckets();

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
		init
	};

	return publicMethodsAndProps;

})(jQuery);