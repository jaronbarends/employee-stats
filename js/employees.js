(function($) {

	'use strict';

	var $sgBody = $('body');
	
	// vars for graph's svg
	var sgBubbleChart,
		$sgBubbleChart,
		sgBubbleChartWidth,
		sgBubbleChartHeight,
		sgGroupTranslate = 'translate(0,0)';

	// vars for svg-groups
	var sgEmployeesG,
		sgGeoG;

	// vars for employee nodes
	var sgNodes,
		sgDefaultNodeSize = 8,
		sgNodeSize = sgDefaultNodeSize,
		sgDefaultNodeSpacing = 3,
		sgNodeSpacing = sgDefaultNodeSpacing,
		sgInfoProp;// property to be shown when clicking on node

	// vars for datasets
	var sgEmployees,
		sgEmployeeProps = [],
		sgOffices,
		sgHometowns = [],
		sgBirthPlaces = [],
		sgPlacesWithoutGeoData = [],
		sgLevels = ['senior', 'stagiair', 'junior'],
		sgOrganisationalUnits = [],
		sgBirthdays = [],
		sgAges = [],
		sgAvarageAge,
		sgStartDates = [],
		sgNationalities;

	var sgFilterGroups,
		sgFilterProps;

	// vars for geo stuff
	var sgProjection,
		sgPath,
		sgMap;

	// vars for simulation
	var sgSimulation,
		sgForceStrength = 0.04,
		sgAlphaTarget = 0.4;

	var sgColors = ['#fecc00','#fbbd18','#f9ae24','#f59f2c','#f18f32','#ee7f36','#e96e3a','#e55d3d','#e0493f','#db3241','#d60042','#d23352','#cd4a64','#c75c75','#bf6d86','#b57b99','#a889ac','#9798c0','#80a4d3','#60b0e6','#00bdfa','#45c1f9','#65c6f8','#7dcbf7','#90d0f6','#a0d5f4','#b1daf3','#c1def2','#d0e3f1','#dfe8ef','#ecedee'];




	/**
	* create svg for graph
	* @returns {undefined}
	*/
	var initSvg = function() {
		sgBubbleChart = d3.select('#bubble-chart');
		$sgBubbleChart = $('#bubble-chart');
		sgBubbleChartWidth = $sgBubbleChart.width();
		sgBubbleChartHeight = $sgBubbleChart.height();
	};


	//-- Start force / simulation functions


		//-- Start force definitions


			/**
			* get a force function for a location
			* @param {ob} coordsProp The object containing the coordinates for the location
			* @returns {function} a force-function
			*/
			var getGeoForce = function(xOrY, coordsProp, defaultValue) {
				var forceFunction = function(d) {
					var xOrYValue = d[coordsProp][xOrY] || defaultValue;
					return xOrYValue;
				};
				return forceFunction;
			};
		

			/**
			* x-force for filter by gender
			* @returns {number}	the x coordinate to move to
			* @param {object} d current object's data
			*/
			var forceXGender = function(d) {
				var x = sgBubbleChartWidth/4;
				if (d.gender.toLowerCase() === 'man') {
					x = 3*sgBubbleChartWidth/4;
				}
				return x;
			};


			/**
			* x-force for filtering by discipline
			* @returns {number}	the x coordinate to move to
			* @param {object} d current object's data
			*/
			var forceXDiscipline = function(d) {
				var x = sgBubbleChartWidth/4;
				if (d.discipline === 'frontend development' || d.discipline === 'visual design' || d.discipline === 'interaction design') {
					x = sgBubbleChartWidth/2;
				} else if (d.discipline === 'backend development') {
					x = 4*sgBubbleChartWidth / 5;
				}
				return x;
			};


			/**
			* x-force for positioning all nodes on a grid
			* @returns {undefined}
			*/
			var forceXGrid = function(d, i) {
				return getNodeGridPosition(i)[0];
			};


			/**
			* y-force for positioning all nodes on a grid
			* @returns {undefined}
			*/
			var forceYGrid = function(d, i) {
				return getNodeGridPosition(i)[1];
			};
			


			/**
			* x-force for all nodes centered
			* @returns {number}	the x coordinate to move to
			* @param {object} d current object's data
			*/
			var forceXCenter = function(d) {
				return sgBubbleChartWidth / 2;
			};


			/**
			* y-force for all nodes centered
			* @returns {number}	the y coordinate to move to
			* @param {object} d current object's data
			*/
			var forceYCenter = function(d) {
				return sgBubbleChartHeight / 2;
			};

		//-- Start force definitions
		


		/**
		* get an x-force definition
		* @param {function} forceFunction The force function to apply
		* @returns {force}
		*/
		var xForce = function(forceFunction) {
			return d3.forceX(forceFunction).strength(sgForceStrength);
		};
		


		/**
		* get an y-force definition
		* @param {function} forceFunction The force function to apply
		* @returns {force}
		*/
		var yForce = function(forceFunction) {
			return d3.forceY(forceFunction).strength(sgForceStrength);
		};



		/**
		* reset the collision force
		* @returns {d3 simulation} the simulation object
		*/
		var setDefaultCollisionForce = function() {
			return sgSimulation.force('collide', d3.forceCollide(sgNodeSize + sgNodeSpacing));
		};


		/**
		* initialize the simulation
		* @returns {undefined}
		*/
		var initSimulation = function() {
			sgSimulation = d3.forceSimulation()
				.force('forceX', xForce(forceXGrid))
				.force('forceY', yForce(forceYGrid))
				// .force('forceX', xForce(forceXCenter))
				// .force('forceY', yForce(forceYCenter))
				// .force('charge', d3.forceManyBody().strength(0.5))
				// .force('center', d3.forceCenter(200,200))
			setDefaultCollisionForce()
				.nodes(sgEmployees);	
		}
;

	//-- End force / simulation functions



	/**
	* get the position for a node on a grid (default 10x10)
	* @param {number} idx The index of the node
	* @param {object} options Config options for grid
	* @returns {Array} [x, y]
	*/
	var getNodeGridPosition = function(idx, options) {
		var defaults = {
			gridOrigin: {x: 140, y: 20 },
			gridSpacing: sgNodeSize,
			gridSize: 10,// number of nodes in each row and col
			gridIsHorizontal: true,
		},
		col,
		row,
		x,
		y;

		var c = $.extend(defaults, options);// config object

		if (c.gridIsHorizontal) {
			col = idx % c.gridSize + ( c.gridSize + 0.5 ) * Math.floor( idx / (c.gridSize*c.gridSize) );
			row = Math.floor( idx / c.gridSize ) - c.gridSize * Math.floor( idx / (c.gridSize*c.gridSize) );
			x = ( 2 * sgNodeSize + c.gridSpacing ) * col + c.gridOrigin.x;
			y = ( 2 * sgNodeSize + c.gridSpacing ) * row + c.gridOrigin.y;
		} else {
			c.gridSpacing = sgNodeSize;
			col = idx % c.gridSize;
			row = Math.floor(idx / c.gridSize) + 0.5 * Math.floor(idx / (c.gridSize*c.gridSize));
			x = ( 2 * sgNodeSize + c.gridSpacing) * col + c.gridOrigin.x;
			y = ( 2 * sgNodeSize + c.gridSpacing) * row + c.gridOrigin.y;
		}

		return [x,y];
	};
	


	/**
	* add nodes to screen
	* @returns {undefined}
	*/
	var addEmployeeNodes = function() {
		var employeeG = sgBubbleChart.selectAll('#employee-group')
				.attr('transform', sgGroupTranslate);

		sgNodes = employeeG.selectAll('.employee')
			.data(sgEmployees)
			.enter()
			.append('circle')
			.attr('class', function(d) {
				var clsNames = [
					'employee',
					'employee--'+d.gender.toLowerCase(),
					'employee--office-'+d.office.toLowerCase(),
					'employee--discipline-'+d.discipline.toLowerCase().replace(' ','-')
				],
				cls = clsNames.join(' ');

				return cls;
			})
			.attr('r', sgNodeSize)
			.attr('cx', function(d, i) {
				var x = getNodeGridPosition(i)[0];
				d.x = x; 
				return x;
			})
			.attr('cy', function(d, i) {
				var y = getNodeGridPosition(i)[1];
				d.y = y;
				return y;
			})
			.attr('x', function(d, i) {
				return getNodeGridPosition(i)[0];
			})
			.attr('y', function(d, i) {
				return getNodeGridPosition(i)[1];
			})
			.on('click', function(d) {
				if (sgInfoProp) {
					console.log(d[sgInfoProp]);
				}
			})
	};


	/**
	* set size of employee nodes
	* @returns {undefined}
	*/
	var setNodeSize = function(size) {
		sgNodeSize = size || sgDefaultNodeSize;
		sgBubbleChart.selectAll('.employee')
			.attr('r', sgNodeSize);
	};


	/**
	* set spacing between employee nodes
	* @returns {undefined}
	*/
	var setNodeSpacing = function(spacing) {
		if (typeof spacing === 'undefined') {
			spacing = sgDefaultNodeSpacing;
		}
		sgNodeSpacing = spacing;
	};
	


	/**
	* define what happens on simulation's ticked event
	* @returns {undefined}
	*/
	var simulationTickHandler = function() {
		sgNodes
			.attr('cx', function(d) {
				return d.x;
			})
			.attr('cy', function(d) {
				return d.y;
			})
	};


	/**
	* change a simulation force
	* @returns {undefined}
	*/
	var changeForce = function(forceId, newForce) {
		sgSimulation
			.force(forceId, newForce)
			.alphaTarget(sgAlphaTarget)
			.alphaDecay(0.4)
			.restart();
	};


	/**
	* enable the default view for filters (hide map, set collision etc)
	* @returns {undefined}
	*/
	var enableDefaultFilterView = function() {
		hideMap();
		setNodeSize();
		setNodeSpacing();
		setDefaultCollisionForce();
	};
	
	


	/**
	* initialize links for sorting nodes
	* @returns {undefined}
	*/
	var initSortingLinks = function() {
		
		$('#sort-by-gender').on('click', function(e) {
			e.preventDefault();
			enableDefaultFilterView();
			changeForce('forceX', xForce(forceXGender));
			changeForce('forceY', yForce(forceYCenter));
		});
		
		$('#sort-by-discipline').on('click', function(e) {
			e.preventDefault();
			enableDefaultFilterView();
			changeForce('forceX', xForce(forceXDiscipline));
			changeForce('forceY', yForce(forceYCenter));
		});

		// geo sorting
		$('[data-geo-sort]').on('click', function(e) {
			e.preventDefault();
			setNodeSize(2);
			setNodeSpacing(0);
			showMap();
			var $tgt = $(e.currentTarget),
				coordsProp = $tgt.attr('data-geo-sort');
			sgInfoProp = $tgt.attr('data-info-property');

			changeForce('forceX', xForce(getGeoForce('x', coordsProp, 120)));
			changeForce('forceY', yForce(getGeoForce('y', coordsProp, 20)));
			setDefaultCollisionForce();
		});
		

		$('#no-sorting').on('click', function(e) {
			e.preventDefault();
			enableDefaultFilterView();
			changeForce('forceX', xForce(forceXGrid));
			changeForce('forceY', yForce(forceYGrid));
			// changeForce('forceX', xForce(forceXCenter));
			// changeForce('forceY', yForce(forceYCenter));
		});
	};
	
	


	/**
	* remove classes from the body element based on a pattern
	* @returns {undefined}
	*/
	var removeBodyClasses = function(pattern) {
		var classStr = $sgBody.attr('class');

		if (classStr) {
			var classes = classStr.split(' ');
			for (var i=classes.length-1; i>=0; i--) {
				var clss = classes[i];
				if (clss.match(pattern)) {
					$sgBody.removeClass(clss);
					classes.splice(i, 1);
				}
			}

		}
	};


	/**
	* remove all highlight classes from the body element
	* @returns {undefined}
	*/
	var removeHighlightClasses = function() {
		removeBodyClasses(/^highlight-/);
	};
	
	


	/**
	* initialize links for highlighting nodes
	* @returns {undefined}
	*/
	var initHighlightLinks = function() {
		$('#highlight-gender').on('click', function(e) {
			e.preventDefault();
			removeHighlightClasses();
			$sgBody.addClass('highlight-gender');
		});

		$('#no-highlight').on('click', function(e) {
			e.preventDefault();
			removeHighlightClasses();
		});
	};
	
	



	//-- Start geo functions --



		/**
		* draw map of The Netherlands
		* @returns {undefined}
		*/
		var drawMap = function(geojson) {
			var provinces = geojson.features;

			sgProjection = d3.geoMercator().fitSize([sgBubbleChartWidth, sgBubbleChartHeight], geojson);
			sgPath = d3.geoPath().projection(sgProjection);

			sgMap = sgBubbleChart.selectAll('#geo-group')
				.attr('transform', sgGroupTranslate);

			sgMap.selectAll('.province')
				.data(provinces)
				.enter()
				.append('path')
				.attr('class', 'province')
				.attr('d', sgPath);
		};


		/**
		* show the map
		* @returns {undefined}
		*/
		var showMap = function() {
			$sgBody.addClass('map-view');
		};


		/**
		* hide the map
		* @returns {undefined}
		*/
		var hideMap = function() {
			$sgBody.removeClass('map-view');
		};
		


		/**
		* add circles for offices
		* @returns {undefined}
		*/
		var addOffices = function() {
			sgMap.selectAll('.office')
				.data(sgOffices)
				.enter()
				.append('circle')
				.attr('class', 'office')
				.attr('r', 20)
				.attr('cx', function(d) {
					var coords = sgProjection([d.long, d.lat]);
					return coords[0];
				})
				.attr('cy', function(d) {
					var coords = sgProjection([d.long, d.lat]);
					return coords[1];
				})
		};
	
	

		/**
		* initialize geo stuff
		* @returns {undefined}
		*/
		var initGeo = function(mapData) {
			
			var geojson = topojson.feature(mapData, mapData.objects.collection);

			drawMap(geojson);
			addOffices();
		};
	

	//-- End geo functions --




	/**
	* match employees with a set of locations (hometowns, birthplaces, offices)
	* enrich location-dataset:
	*	- add prop employeeCount to every location
	* enrich every employee-object:
	*	- add object with location coords to every employee object
	* 
	* @param {array} dataset The dataset containing the locations
	* @returns {undefined}
	*/
	var matchEmployeesWithLocations = function(options) {
		var locationData = options.locationData,
			datasetLocationProp = options.datasetLocationProp,
			employeeLocationProp = options.employeeLocationProp,
			locationCoordsProp = options.locationCoordsProp,
			unknownPlaces = [];

		// enrich location-data: add prop for employee count to every location
		for (var i=0, locationCount=locationData.length; i<locationCount; i++) {
			locationData[i].employeeCount = 0;
		}

		// enrich employee-data
		for (var j=0, len=sgEmployees.length; j<len; j++) {
			var employee = sgEmployees[j],
				locationName = employee[employeeLocationProp].toLowerCase(),
				locationFound = false;

			// create a coordinates object
			employee[locationCoordsProp] = {};

			// check if location is within dataset
			// if so, get its lat/long and augment its employeeCount
			for (var k=0; k<locationCount; k++) {
				var location = locationData[k];

				if (location[datasetLocationProp].toLowerCase() === locationName) {
					// calculate the location's coords in the map projection
					var coords = sgProjection([location.long, location.lat]);
					employee[locationCoordsProp] = {
						x: coords[0],
						y: coords[1]
					};

					locationFound = true;

					// keep track of # of employees per location
					location.employeeCount++;

					break;
				}
			}

			if (!locationFound) {
				sgPlacesWithoutGeoData.push(employee[employeeLocationProp]);
			}
		}

		// now order location by # of employees
		locationData.sort(function(a, b) {
			return b.employeeCount - a.employeeCount;
		});

	};
	


	/**
	* process hometown data
	* @returns {undefined}
	*/
	var processHometownData = function() {
		var options = {
			locationData: sgHometowns,
			datasetLocationProp: 'name',
			employeeLocationProp: 'hometown',
			locationCoordsProp: 'hometownCoords'
		};
		matchEmployeesWithLocations(options);

		var $list = $('#hometown-list'),
			items = '';
		for (var i=0; i<5; i++) {
			var hometown = sgHometowns[i];
			items += '<li>'+hometown.name + '(' + hometown.employeeCount + ')</li>';
		}

		$list.append(items);
	};


	/**
	* process birthplace data
	* @returns {undefined}
	*/
	var processBirthplaceData = function() {
		var options = {
			locationData: sgHometowns,
			datasetLocationProp: 'name',
			employeeLocationProp: 'birthplace',
			locationCoordsProp: 'birthplaceCoords'
		};
		matchEmployeesWithLocations(options);
	};


	/**
	* process hometown data
	* @returns {undefined}
	*/
	var processOfficeData = function() {
		var officeOptions = {
			locationData: sgOffices,
			datasetLocationProp: 'city',
			employeeLocationProp: 'office',
			locationCoordsProp: 'officeCoords'
		};
		matchEmployeesWithLocations(officeOptions);

		var $list = $('#office-list'),
			items = '';
		for (var i=0, len=sgOffices.length; i<len; i++) {
			var office = sgOffices[i];
			items += '<li>'+office.city + '(' + office.employeeCount + ')</li>';
		}

		$list.append(items);
	};


	/**
	* process data about locations
	* @returns {undefined}
	*/
	var processGeoData = function() {
		processHometownData();
		processBirthplaceData();
		processOfficeData();
	};


	/**
	* put comparable employee properties into array
	* @returns {undefined}
	*/
	var initEmployeeProperties = function() {
		for (var prop in sgEmployees[0]) {
			sgEmployeeProps.push(prop);
		}
	};
	


	/**
	* handle an employee's discipline data
	* - fill disciplines array
	* - put level into separate field
	* @returns {undefined}
	*/
	var processEmployeeDisciplines = function() {
		for (var i=0, len=sgEmployees.length; i<len; i++) {
			var emp = sgEmployees[i],
				discipline = emp.disciplineWithLevel,
				disciplineFound = false,
				level = '';

			// cut off level
			for (var lv=0, lvLen = sgLevels.length; lv<lvLen; lv++) {
				var currLevel = sgLevels[lv];
				
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

		for (var i=0, len=sgEmployees.length; i<len; i++) {
			var emp = sgEmployees[i];

			// process age data
			sgBirthdays.push(emp.birthday);
			var age = getYearsUntilToday(emp.birthday),
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
			sgAges.push({
				age: currAge,
				employeeCount: ages[currAge] || 0
			});
		}

		// calculate avarage age
		sgAvarageAge = ageSum / sgEmployees.length;
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
			dataset = sgFilterGroups[groupName].dataset;

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
		for (var i=0, len=sgEmployees.length; i<len; i++) {
			var employee = sgEmployees[i];

			// loop through employee groups and add this employee's data
			for (var groupName in sgFilterGroups) {
				addEmployeeToGroup(employee, groupName);
			}
		}

		console.log(sgFilterGroups['discipline']);

	};


	/**
	* define groups we want to distinguish employees in and props to compare
	* @returns {undefined}
	*/
	var defineFilterGroupsAndProps = function() {
		// use field name in .csv as property name
		// use the same property-names we use in sgEmployees
		sgFilterGroups = {
			gender: { guiName: 'Gender', dataset: []},
			discipline: { guiName: 'Discipline', dataset: []},
			organisationalUnit: { guiName: 'Organisational unit', dataset: []},
			office: { guiName: 'Office', dataset: []},
			parttimePercentage: { guiName: 'Parttime percentage', dataset: []},
		};

		// props we want to show for filter group instances
		sgFilterProps = {
			age: { guiName: 'Age'},
			startDate: { guiName: 'Start date'},
			gender: { guiName: 'Gender'},
			discipline: { guiName: 'Discipline'},
			organisationalUnit: { guiName: 'Organisational unit'},
			office: { guiName: 'Office'},
			parttimePercentage: { guiName: 'Parttime percentage'},
		};
	};
	


	//-- Start age fucntions --



		/**
		* create chart for age
		* @returns {undefined}
		*/
		var createAgeChart = function() {
			var ageChart = d3.select('#age-chart'),
				w = parseInt(ageChart.style('width'), 10),
				h = parseInt(ageChart.style('height'), 10),
				margin = {
					top: 10,
					right: 10,
					bottom: 30,
					left: 50
				},
				chartW = w - margin.left - margin.right,
				chartH = h - margin.top - margin.bottom,
				minAge = d3.min(sgAges, function(obj) {
					return obj.age;
				}),
				maxAge = d3.max(sgAges, function(obj) {
					return obj.age + 1;// op de een of andere manier moet dit +1 zijn, anders komt laatste bar niet in schaal
				});


			var xScale = d3.scaleBand()
					// .domain(d3.range(sgAges.length))
					.domain(d3.range(minAge, maxAge))
					.rangeRound([0, chartW])
					.padding(0.1);

					// console.log('ages:', sgAges);

			var yScale = d3.scaleLinear()
					.domain([0, d3.max(sgAges, function(obj) {
							return obj.employeeCount;
						})])
					.range([chartH, 0]);

			var xAxis = d3.axisBottom(xScale)
					.tickValues([25, 30, 35, 40, 45]),
				yAxis = d3.axisLeft(yScale)
					.ticks(3);

			// render bars
			ageChart.append('g')
				.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
				.selectAll('.age-bar')
				.data(sgAges)
				.enter()
				.append('rect')
				.attr('x', function(d, i) {
					return xScale(d.age);
				})
				.attr('y', function(d) {
					return yScale(d.employeeCount);
				})
				.attr('width', xScale.bandwidth())
				.attr('height', function(d) {
					return chartH - yScale(d.employeeCount);
				});

			// render axes
			ageChart.append('g')
				.attr('class', 'axis')
				.attr('transform', 'translate(' + margin.left +',' + (margin.top + chartH) +')')
				.call(xAxis);

			ageChart.append('g')
				.attr('class', 'axis')
				.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
				.call(yAxis);
		};


		/**
		* calculate and show age info
		* @returns {undefined}
		*/
		var calculateAgeInfo = function() {
			var avgYears = Math.floor(sgAvarageAge),
				avgMonths = Math.floor(12 * (sgAvarageAge % avgYears));

			$('#age-info').find('.age-years')
				.text(avgYears)
				.end()
				.find('.age-months').text(avgMonths);
		};


		/**
		* calculate the years passed between a certain date and today
		* @param {string} pastDateStr Date in the past, format d/m/y
		* @returns {number} The number of years (not rounded)
		*/
		var getYearsUntilToday = function(pastDateStr) {
			var now = new Date(),
				dateArr = pastDateStr.split('/'),
				pastDate = new Date(dateArr[2], dateArr[1]-1, dateArr[0]),// month is 0-based, hence -1
				nowMsecs = now.getTime(),
				pastDateMsecs = pastDate.getTime(),
				diffMsecs = nowMsecs - pastDateMsecs,// diff between dates in milliseconds
				diffYear = diffMsecs / (1000 * 60 * 60 * 24 * 365);// not entirely accurate (no leap years) but good enough for now

			return diffYear;
		};


	//-- End age functions --

	



	//-- Start Pie chart fucntions --


		/**
		* create a pie chart
		* @returns {undefined}
		*/
		var createPieChart = function(dataset, id) {
			// console.log(dataset);
			var colorArray = randomizeArray(sgColors.slice());//slice makes copy

			var dataAccessor = function(d) {
				return d.count;
			};
			
			var pie = d3.pie().value(dataAccessor)(dataset),
				svg = d3.select('#'+id)
					.append('svg')
					.attr('class', 'pie-chart'),
				innerRadius = 0,
				outerRadius = parseInt(svg.style('width'), 10)/2,
				arc = d3.arc()
						.innerRadius(innerRadius)
						.outerRadius(outerRadius);

			var arcs = svg.selectAll('g.pie-segment')
				.data(pie)
				.enter()
				.append('g')
				// .attr('class', 'pie-segment')
				.attr('transform', 'translate(' + outerRadius + ',' + outerRadius + ')');

			arcs.append('path')
				.attr('class', function(d) {
					// console.log(d.data);
					return 'pie-segment pie-segment--'+ convertToClassName(d.data.prop);
				})
				.attr('d', arc)
				.attr('fill', function(d,i) {
					var idx = i % colorArray.length;
					return colorArray[idx];
				})

			// now add some info
			var $chartBox = $('#'+id),
				info = '<p>' + dataset[0].type;
			for (var i=0, len=dataset.length; i<len; i++) {
				info += '<br>' + dataset[i].prop + ':' + dataset[i].count;
			}
			info += '</p>';
			$chartBox.append(info);

		};


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
				createPieChart(dataset, id);
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
			// console.log(group, prop, sgFilterGroups[group]);
			var propDataset = sgFilterGroups[prop].dataset;

			// check for which types we need to show charts
			// this is the "for every..." part
			group = sgFilterGroups[group].dataset;
			var chartIdx = 0;

			// loop through every type in this group
			for (var typeName in group) {

				var typeEmployees = group[typeName];// array for all employees for a given type, like a specific office

				// now we have arrays for all employees for a given type, like a specific office
				// loop through those employees and sort them into the different prop-types
				var employeesPerProp = [];

				for (var i=0, empLen=typeEmployees.length; i<empLen; i++) {

					// for every employee in this type, check which chosen prop he has
					var employee = typeEmployees[i],
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
						type: typeName,
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
		


		/**
		* create a pie chart for gender
		* @returns {undefined}
		*/
		var createGenderPieChart = function() {
			var maleCount = 0,
				femaleCount = 0,
				malePerc,
				femalePerc;

			for (var i=0, len=sgEmployees.length; i<len; i++) {
				var g = sgEmployees[i].gender.toLowerCase();

				if (g === 'vrouw') {
					femaleCount++;
				} else {
					maleCount++;
				}
			}

			var femalePerc = 100*femaleCount / len,
				malePerc = 100*maleCount / len;

			var dataset = [
				{ count: femaleCount, className:'female', percentage: femalePerc},
				{ count: maleCount, className:'male', percentage: malePerc}
			];
			// createPieChart(dataset);
		};
		
		

	//-- End Pie chart fucntions --



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

		for (var groupName in sgFilterGroups) {
			var guiName = sgFilterGroups[groupName].guiName;
			// console.log(sgFilterGroups[groupName]);

			groupOptions += '<option value="' + groupName + '">' + guiName + '</option>';
		}
		$groupSelect.append(groupOptions);


		// generate props to show
		console.log(sgFilterProps);
		for (var propName in sgFilterProps) {
			propertyOptions += '<option value="' + propName + '">' + sgFilterProps[propName].guiName + '</option>';	
		}
		$propertiesSelect.append(propertyOptions);

		$('#pie-chart-form').on('submit', showComparison);
	};


	//-- Start helper functions --


		/**
		* convert a string to format that can be used as classname
		* @returns {undefined}
		*/
		var convertToClassName = function(str) {
			str = str.toLowerCase().replace(/[ \.]/, '-');

			return str;
		};



		/**
		* randomize the objects in an array
		* @param {array} arr The array to randomize
		* @returns {array} The randomized array
		*/
		var randomizeArray = function(arr) {
			var randomArr = [],
				len = arr.length;
			
			while(arr.length) {
				var idx = Math.floor(arr.length*Math.random());
				randomArr.push(arr.splice(idx,1)[0]);
			}

			return randomArr;
		};


	
	
	//-- End helper functions --
	

	/**
	* set the total number of employees
	* @returns {undefined}
	*/
	var setEmployeeCount = function() {
		var $box = $('#info-box--employees-general'),
			$value = $box.find('.value--primary'),
			numEmployees = sgEmployees.length;

		$value.text(numEmployees);
	};
	


	//-- Start debugging functions


		/**
		* report missing data in the dataset
		* @returns {undefined}
		*/
		var reportMissingData = function() {
			
			Array.prototype.unique = function() {
			  return this.filter(function (value, index, self) { 
			    return self.indexOf(value) === index;
			  });
			};

			var uniqueUnknown = sgPlacesWithoutGeoData.unique(),
				str = '\n\n';

			for (var i=0, len=uniqueUnknown.length; i<len; i++) {
				str += uniqueUnknown[i] + '\n';
			}

			console.log(str);
		};


	//-- End debugging functions
	
	
	

	/**
	* handle loading of all data
	* @returns {undefined}
	* @param {object} error Error object
	* @param {object} employees Employee data
	* @param {object} mapData Geodata for map
	* @param {object} offices Data for offices (lat long etc)
	* @param {object} cities Data for cities (lat long etc)
	*/
	var loadHandler = function(error, employees, mapData, offices, cities) {
		// create semi globals for datasets
		sgEmployees = employees;
		sgOffices = offices;
		sgHometowns = cities;

		// put original employee properties into array before we add all kind of helper props
		initEmployeeProperties()

		// initialize geo stuff
		initGeo(mapData);

		// process all geo-related data
		processGeoData();

		// process employee data (disciplines)
		setEmployeeCount();
		defineFilterGroupsAndProps();
		processEmployeeData();


		// add shapes for nodes
		addEmployeeNodes();

		createAgeChart();
		calculateAgeInfo();

		// initialize force simulation
		initSimulation();
		// setTimeout(function() {
			// this kicks off the animation
			sgSimulation.on('tick', simulationTickHandler);
		// }, 1000);

		createGenderPieChart();

		initCompareTool();

		// report data missing in dataset (for dev purposes only)
		// reportMissingData();

	}// loadHandler


	/**
	* load data and kick off rendering
	* @returns {undefined}
	*/
	var loadData = function() {
		d3.queue()
			.defer(d3.csv, 'data/employees.csv')
			// .defer(d3.csv, 'data/employees-excerpt.csv')
			.defer(d3.json, 'data/provinces.topojson')
			.defer(d3.csv, 'data/offices-netherlands.csv')
			.defer(d3.csv, 'data/hometowns-and-birthplaces.csv')
			.await(loadHandler);
	};



	// load data and kick things off

	/**
	* initialize all
	* @returns {undefined}
	*/
	var init = function() {
		initSvg();
		// initSimulation();
		initSortingLinks();
		initHighlightLinks();

		// defineFilterGroupsAndProps();

		// load data and kick things off
		loadData();
	};
	
	$(document).ready(init);

})(jQuery);