dojo.require("esri.map");
dojo.require("esri.dijit.OverviewMap");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.AccordionContainer");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.Toolbar");
dojo.require("dijit.form.Button");
dojo.require("esri.dijit.Scalebar");
dojo.require("esri.dijit.Legend");
dojo.require("simple_basemap_toolbar.SimpleBasemapToolbar");
dojo.require("banner.Banner");
dojo.require("identify.Identify");
dojo.require("help_panel.HelpPanel");
dojo.require("dijit.ToolbarSeparator");
dojo.require('layers.PairedMapServiceLayer');
dojo.require('bboxDialog.BoundingBoxDialog');
dojo.require("dojox.widget.Toaster");
dojo.require('bboxDialog.BoundingBoxDialog');
dojo.require("survey_select.MarineSurveySelectDialog");
dojo.require("survey_select.AeroSurveySelectDialog");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dojo.io.script");
dojo.require("dojo.DeferredList");

var globals = {}; //container for global variables

globals.debug = false;
globals.mapConfigLoaded = true;

globals.publicAgsHost = "http://maps.ngdc.noaa.gov/arcgis";
globals.privateAgsHost = "http://agsdevel.ngdc.noaa.gov:6080/arcgis";
globals.arcgisOnlineHost = "http://server.arcgisonline.com/ArcGIS";

//mandatory lifecycle methods
//called just before common initialization
function preInit() {
	//console.log("inside preInit...");
	
	var gotItems = function(items, request){
	  console.log("inside gotItems: Number of items located: " + items.length);
	};
	
	var mybanner = new banner.Banner({
		breadcrumbs: [
			{url: 'http://www.noaa.gov', label: 'NOAA'},
			{url: 'http://www.nesdis.noaa.gov', label: 'NESDIS'},
			{url: 'http://www.ngdc.noaa.gov', label: 'NGDC'},
			{url: 'http://maps.ngdc.noaa.gov/viewers', label: 'Maps'},
			{url: 'http://ngdc.noaa.gov/mgg/geodas/trackline.html', label: 'Geophysical Survey Data'}			
		],
		dataUrl: "http://ngdc.noaa.gov/mgg/geodas/trackline.html",
		image: "/images/geophysical_survey_viewer_logo.png"
	});
	mybanner.placeAt('banner');

	//create the dialog
	globals.coordDialog = new bboxDialog.BoundingBoxDialog({title:'Specify an Area of Interest', style: 'width:300px;'});
	
	esri.config.defaults.io.proxyUrl = "http://maps.ngdc.noaa.gov/proxy.jsp";
	//esri.config.defaults.io.proxyUrl = "http://agsdevel.ngdc.noaa.gov/viewers/proxy.php"; 
		
	var shipsStore = new dojo.data.ItemFileReadStore({
		url: "ships.json",
		urlPreventCache: true
	});
	
	var sourceInstStore = new dojo.data.ItemFileReadStore({
		url: "institutions.json",
		urlPreventCache: true
	});
	
	var surveysStore = null;
	// Don't load the surveysStore if in IE8 or earlier. In this case we're
	// using use a simple TextBox instead of a FilteringSelect.
	if (!dojo.isIE || (dojo.isIE > 8)) {
		surveysStore = new dojo.data.ItemFileReadStore({
			url: "surveys.json",
			urlPreventCache: true
		});
	}
		
	var jsonpArgs = {
		url : 'http://maps.ngdc.noaa.gov/mapviewer-support/aeromag/projects.groovy',	
		preventCache: true,
		callbackParamName: 'callback',
		handleAs: 'json',
		error : function(error) {
			console.log('Error retrieving aeromag projects json');
		}
	};
	var d1 = dojo.io.script.get(jsonpArgs);
		
	jsonpArgs = {
		url : 'http://maps.ngdc.noaa.gov/mapviewer-support/aeromag/surveys.groovy',	
		preventCache: true,
		callbackParamName: 'callback',
		handleAs: 'json',
		error : function(error) {
			console.log('Error retrieving aeromag surveys json');
		}
	};
	var d2 = dojo.io.script.get(jsonpArgs);
	
	var dList = new dojo.DeferredList([d1, d2]);
	dList.then(function(results) {
		var projectsStore = new dojo.data.ItemFileReadStore({data: results[0][1]});
		var aeromagSurveysStore = new dojo.data.ItemFileReadStore({data: results[1][1]});
		
		globals.marineSurveySelectDialog = new survey_select.MarineSurveySelectDialog({
			title: 'Find Marine Surveys',
			shipsStore: shipsStore, 
			surveysStore: surveysStore,
			sourceInstStore: sourceInstStore,		
			zoomToExtentEnabled: globals.srid == 3857 ? true : false		
		});
		globals.aeroSurveySelectDialog = new survey_select.AeroSurveySelectDialog({
			title: 'Find Airborne Surveys',
			projectsStore: projectsStore,
			surveysStore: aeromagSurveysStore,		
			zoomToExtentEnabled: globals.srid == 3857 ? true : false		
		});
	});
	
}

//called after common initialization
function postInit() {
//	console.log("inside postInit...");
	
	globals.isCleared = true; //We start out with no selection applied
	
	//Reduce the refresh rate of the zoom animation to improve performance in IE8 or earlier
	if (dojo.isIE <= 8) {
		esriConfig.defaults.map.panRate = 250; //refresh rate of zoom animation; default panRate:25
		esriConfig.defaults.map.zoomRate = 250; //refresh rate of zoom animation; default is 25
	}
	
	dojo.subscribe("/Identify/getData", openGetDataWindow);

	//globals.geometryService = new esri.tasks.GeometryService("http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");	
	globals.geometryService = new esri.tasks.GeometryService("http://maps.ngdc.noaa.gov/arcgis/rest/services/Utilities/Geometry/GeometryServer");	
	
	globals.visibleGeodasLayers = [
		{name: "All Parameters", visible: false},
		{abbrev: 'BATH', name: "Bathymetry", visible: false},
    	{abbrev: 'GRAV', name: "Gravity", visible: false},
    	{abbrev: 'MAG', name: "Magnetics", visible: false},
    	{abbrev: 'SCSEIS', name: "Single-Channel Seismics", visible: false},
    	{abbrev: 'CDP', name: "CDP Seismics", visible: false},
    	{abbrev: 'SSCAN', name: "Side Scan Sonar", visible: false},
    	{abbrev: 'REFRAC', name: "Seismic Refraction", visible: false},
    	{abbrev: 'SHOT', name: "Shot-Point Navigation", visible: false},
    	{abbrev: 'SUBBOTTOM', name: "Subbottom Profile", visible: false},
    	{abbrev: 'AEROMAG', name: "Aeromag", visible: false}
	];
	
	globals.tracklineLayerDefinitions = []; //Global object containing the current layer definitions for all sublayers of the "Trackline Combined" service.	
}

//called on Map onLoad event
function mapInitializedCustom(theMap) {
	//console.log('inside mapInitializedCustom...');
	
}

/**
 * open the Survey Select dialog
 */
function showMarineSurveySelectDialog(){
	globals.marineSurveySelectDialog.show();	
}

function showAeroSurveySelectDialog(){
	globals.aeroSurveySelectDialog.show();	
}

/**
 * called when SurveySelectDialog returns. Sets the layer definition for
 * the dynamic layer
 *
 *
 * GLOBALS: services[], surveysStore, map, initialExtent, query, queryTask,
 * surveyShip, sourceInst, surveyName, surveyYear, isCleared
 *
 * @param {Object} values
 */
function filterMarineSurveys(values) {
	//console.log('inside filterMarineSurveys: surveyIds='+values.surveyIds+'; startYear='+values.startYear+'; ships='+values.ships+'; inst='+values.institutions+'; startDateAdded='+values.startDateAdded);
	globals.dialogValues = values;
	var layerDefinitions;
	var sql = [];
	var i;
	
	if ((!values.ships || values.ships.length == 0) && 
		(!values.institutions || values.institutions.length == 0) && 
		!values.startYear && !values.endYear && 
		!values.startDateAdded && !values.endDateAdded && 		
		!values.surveyIds) {
		//Dialog contains default values. Clear any selection, and return.
		clearSelection();
		return;
	}
	globals.isCleared = false;
	
	//survey_name takes precedence over ship, year, institution
	if (!values.surveyIds) {
		if (values.ships && values.ships.length > 0) {			
			var ships = '';
			//Create a comma-separated list of ships
			for (i = 0; i < values.ships.length; i++) {
				//Escape single quotes in the ship name (i.e. Jeanne D'Arc) with 2 single quotes
				ships += "'" + values.ships[i].toUpperCase().replace("'", "''") + "'";
				if (i < values.ships.length - 1) {
					ships += ',';
				}	
			}
			sql.push("UPPER(PLATFORM) IN (" + ships + ")");					
		}
			
		if (values.institutions && values.institutions.length > 0) {
			var institutions = '';
			//Create a comma-separated list of institutions
			for (i = 0; i < values.institutions.length; i++) {
				institutions += "'" + values.institutions[i].toUpperCase().replace("'", "''") + "'";
				if (i < values.institutions.length - 1) {
					institutions += ',';
				}
			}
			sql.push("UPPER(INST_SHORT) IN (" + institutions + ")");		
		}		
		
		//only present if omitDate is false
		if (values.startYear) {
			sql.push("END_YR >= " + values.startYear);
		}
		
		if (values.endYear) {
			sql.push("START_YR <= " + values.endYear);
		}
		
		if (values.startDateAdded) {
			sql.push("DATE_ADDED >= TO_DATE('" + toDateString2(values.startDateAdded) + "','MM-DD-YYYY')");
		}
		
		if (values.endDateAdded) {
			sql.push("DATE_ADDED <= TO_DATE('" + toDateString2(values.endDateAdded) + "','MM-DD-YYYY')");				
		}	
	}
	else {
		var ids = '';
		//Create a comma-separated list of survey IDs
		for (i = 0; i < values.surveyIds.length; i++) {
			ids += "'" + values.surveyIds[i] + "'";
			if (i < values.surveyIds.length - 1) {
				ids += ',';
			}
		}
		sql.push("SURVEY_ID IN (" + ids + ")");
	}
		
	//console.log(sql);
	layerDefinitions = sql.join(' and ');
	//console.log(layerDefinitions);
	
	//var allLayerDefinitions = [];
	//Setup the layer definition for all 9 marine sublayers at once
	for (var i = 0; i < 10; i++) {
		globals.tracklineLayerDefinitions[i] = layerDefinitions;		
	}
	
	//For each of the trackline map services, apply the layer definition
	for (var i = globals.firstTracklineServiceIndex; i <= globals.lastTracklineServiceIndex; i++) {
		var layerDefs = [];
		globals.mapServices[i].setLayerDefinitions(globals.tracklineLayerDefinitions);		
	}
		
	//close any InfoWindow that may be displayed
	globals.map.infoWindow.hide();
	
	//Update the display w/ filter criteria.
	//Truncate long lists of surveys, ships, or institutions to 5, appending '...'
	var txt = '';
	var firstFive = [];
	if (values.surveyIds) {
		var numSurveys = values.surveyIds.length;	
		
		firstFive = values.surveyIds;
		if (numSurveys > 5) {
			firstFive = values.surveyIds.slice(0, 5);
		}
		txt += 'Survey: ' + firstFive.join(', ');	
		if (numSurveys > 5) {
			txt += ', ...';
		}
		txt += '<br>';
	}
	else {		
		if (values.institutions && values.institutions.length > 0) {
			var numInst = values.institutions.length;	
			firstFive = values.institutions;
			if (numInst > 5) {				
				firstFive = values.institutions.slice(0, 5);
			}
			txt += 'Institution: ' + firstFive.join(', ');	
			if (numInst > 5) {
				txt += ', ...';
			}
			txt += '<br>';
		}		
	 	if (values.ships && values.ships.length > 0) {
			var numShips = values.ships.length;	
			firstFive = values.ships;
			if (numShips > 5) {
				firstFive = values.ships.slice(0, 5);
			}
			txt += 'Ship: ' + firstFive.join(', ');	
			if (numShips > 5) {
				txt += ', ...';
			}						
		} else {
			txt += 'All Ships';
		}
	 	if (values.startYear && !values.endYear) {
			txt += ' ' + values.startYear + '-present';
		} else if (values.startYear && values.endYear) {
			txt += ' ' + values.startYear + '-' + values.endYear + '';
		} else if (!values.startYear && values.endYear) {
			txt += ' ' + values.endYear + ' and earlier';
		}	
				
		if (values.startDateAdded && !values.endDateAdded) {
			txt += '<br>Date Added: ' + toDateString(values.startDateAdded) + '-present';
		} else if (values.startDateAdded && values.endDateAdded) {
			txt += '<br>Date Added: ' + toDateString(values.startDateAdded) + '-' + toDateString(values.endDateAdded) + '';
		} else if (!values.startDateAdded && values.endDateAdded) {
			txt += '<br>Date Added: ' + toDateString(values.endDateAdded) + ' and earlier';
		}				 	
	}
	dojo.byId('marineFilterDiv').innerHTML = '<b>Current filter:</b><br/> ' + txt;
	
	updateSurveyCounts(); //Update the number of surveys reported in the TOC
	
	if (values.zoomToSelection) {
		zoomToMarineSelection();
	}
}

function filterAeroSurveys(values) {
	console.log('inside filterAeroSurveys ' + values);
	
	//globals.dialogValues = values;
	var layerDefinitions;
	var sql = [];
	var i;
	
	if ((!values.projects || values.projects.length == 0) && 
		(!values.aeroParams || values.aeroParams.length == 0) && 
		!values.startYear && !values.endYear && 
		!values.startDateAdded && !values.endDateAdded && 		
		!values.surveyIds) {
		//Dialog contains default values. Clear any selection, and return.
		clearSelection();
		return;
	}
	globals.isCleared = false;
	
	//survey_name takes precedence over ship, year, institution
	if (!values.surveyIds) {
		if (values.projects && values.projects.length > 0) {			
			var projects = '';
			//Create a comma-separated list of projects
			for (i = 0; i < values.projects.length; i++) {
				//Escape single quotes in the ship name (i.e. Jeanne D'Arc) with 2 single quotes
				projects += "'" + values.projects[i].toUpperCase().replace("'", "''") + "'";
				if (i < values.projects.length - 1) {
					projects += ',';
				}	
			}
			sql.push("UPPER(PROJECT_ID) IN (" + projects + ")");					
		}
		
		if (values.aeroParams && values.aeroParams.length > 0) {			
			var params = [];
			for (i = 0; i < values.aeroParams.length; i++) {
				var aeroParam = values.aeroParams[i];
				if (aeroParam === 'T') {
					params.push("PARAM_T = 'Y'");
				} else if (aeroParam === 'R') {
					params.push("PARAM_R = 'Y'");
				} else if (aeroParam === 'X') {
					params.push("PARAM_X = 'Y'");
				} else if (aeroParam === 'Y') {
					params.push("PARAM_Y = 'Y'");
				} else if (aeroParam === 'Z') {
					params.push("PARAM_Z = 'Y'");
				} else if (aeroParam === 'D') {
					params.push("PARAM_D = 'Y'");
				} else if (aeroParam === 'H') {
					params.push("PARAM_H = 'Y'");
				} else if (aeroParam === 'I') {
					params.push("PARAM_I = 'Y'");
				} else if (aeroParam === 'E') {
					params.push("PARAM_E = 'Y'");
				} else if (aeroParam === 'O') {
					params.push("PARAM_O = 'Y'");
				}
			}
			var paramsClause = '(' + params.join(' or ') + ')';
			sql.push(paramsClause);					
		}
			
		//only present if omitDate is false
		if (values.startYear) {
			sql.push("END_YR >= " + values.startYear);
		}		
		if (values.endYear) {
			sql.push("START_YR <= " + values.endYear);
		}		
		if (values.startDateAdded) {
			sql.push("DATE_ADDED >= TO_DATE('" + toDateString2(values.startDateAdded) + "','MM-DD-YYYY')");
		}		
		if (values.endDateAdded) {
			sql.push("DATE_ADDED <= TO_DATE('" + toDateString2(values.endDateAdded) + "','MM-DD-YYYY')");				
		}	
	}
	else {
		var ids = '';
		//Create a comma-separated list of survey IDs
		for (i = 0; i < values.surveyIds.length; i++) {
			ids += "'" + values.surveyIds[i] + "'";
			if (i < values.surveyIds.length - 1) {
				ids += ',';
			}
		}
		sql.push("SURVEY_ID IN (" + ids + ")");
	}
	
	//When in Arctic projection, exclude the projects that exist near the South Pole. Prevents erroneous lines from being drawn across the map.
	if (globals.srid === 3572) {
		sql.push(globals.arcticExcludedProjects);
	}
	
	layerDefinitions = sql.join(' and ');
	
	globals.tracklineLayerDefinitions[10] = layerDefinitions;		
	
	mapServiceById('Trackline Combined').setLayerDefinitions(globals.tracklineLayerDefinitions);		
	
	//close any InfoWindow that may be displayed
	globals.map.infoWindow.hide();
	
	updateSurveyCounts(); //Update the number of surveys reported in the TOC
	
	//Update the display w/ filter criteria.
	//Truncate long lists of surveys, ships, or institutions to 5, appending '...'
	var txt = '';
	var firstFive = [];
	if (values.surveyIds) {
		var numSurveys = values.surveyIds.length;	
		
		firstFive = values.surveyIds;
		if (numSurveys > 5) {
			firstFive = values.surveyIds.slice(0, 5);
		}
		txt += 'Survey: ' + firstFive.join(', ');	
		if (numSurveys > 5) {
			txt += ', ...';
		}
		txt += '<br>';
	}
	else {		
		if (values.projects && values.projects.length > 0) {
			var numProjects = values.projects.length;	
			firstFive = values.projects;
			if (numProjects > 5) {				
				firstFive = values.projects.slice(0, 5);
			}
			txt += 'Project: ' + firstFive.join(', ');	
			if (numProjects > 5) {
				txt += ', ...';
			}
			txt += '<br>';
		} 
		
	 	if (values.startYear && !values.endYear) {
			txt += ' ' + values.startYear + '-present';
		} else if (values.startYear && values.endYear) {
			txt += ' ' + values.startYear + '-' + values.endYear + '';
		} else if (!values.startYear && values.endYear) {
			txt += ' ' + values.endYear + ' and earlier';
		}	
	 	if (values.aeroParams && values.aeroParams.length > 0) {
			txt += 'Aeromag Params: ' + values.aeroParams.join(',');
		}
				
		if (values.startDateAdded && !values.endDateAdded) {
			txt += '<br>Date Added: ' + toDateString(values.startDateAdded) + '-present';
		} else if (values.startDateAdded && values.endDateAdded) {
			txt += '<br>Date Added: ' + toDateString(values.startDateAdded) + '-' + toDateString(values.endDateAdded) + '';
		} else if (!values.startDateAdded && values.endDateAdded) {
			txt += '<br>Date Added: ' + toDateString(values.endDateAdded) + ' and earlier';
		}				 	
	}
	dojo.byId('aeroFilterDiv').innerHTML = '<b>Current filter:</b></br> ' + txt;
	
	if (values.zoomToSelection) {
		zoomToAeroSelection();
	}
}

function clearSelection() {
	console.log("inside clearSelection()");		

	if (!globals.isCleared) {
		globals.tracklineLayerDefinitions = [];
		for (var i = globals.firstTracklineServiceIndex; i <= globals.lastTracklineServiceIndex; i++) {
			globals.mapServices[i].setLayerDefinitions(globals.tracklineLayerDefinitions);
		}
		updateSurveyCounts(); //Update the number of surveys reported in the TOC
	}
	dojo.byId('marineFilterDiv').innerHTML = '';
	dojo.byId('aeroFilterDiv').innerHTML = '';
	globals.marineSurveySelectDialog.reset(); //Reset to defaults in the Survey Select Dialog
	globals.aeroSurveySelectDialog.reset(); //Reset to defaults in the Survey Select Dialog	
	globals.isCleared = true;
}

function zoomToMarineSelection() {
	globals.marineQuery.where = globals.tracklineMapService.layerDefinitions[0];
	
	//First, get the count of features that meet the criteria
	globals.marineQueryTask.executeForCount(globals.marineQuery, function(count){		
		//Optimization: if 200 or fewer features, execute a QueryTask to get the geometries.
		//Otherwise zoom to global extent
		if (count <= 200) {
			globals.marineQueryTask.execute(globals.marineQuery); //Calls calcBbox on return
			showLoading();
		} else {
			globals.map.setExtent(getInitialExtent(), true);
		}
	}, function(error){
		console.log(error);
	});	
} 

function zoomToMarineSelectionCrossing180() {
	globals.marineQueryCrossing180.where = globals.tracklineMapService.layerDefinitions[0];
	globals.marineQueryTaskCrossing180.execute(globals.marineQueryCrossing180); //Calls calcBboxCrossing180 on return
	showLoading();
}

function zoomToAeroSelection() {
	globals.aeroQuery.where = globals.tracklineMapService.layerDefinitions[10];
	
	//First, get the count of features that meet the criteria
	globals.aeroQueryTask.executeForCount(globals.aeroQuery, function(count){		
		//Optimization: if 200 or fewer features, execute a QueryTask to get the geometries.
		//Otherwise zoom to global extent
		if (count <= 200) {
			globals.aeroQueryTask.execute(globals.aeroQuery); //Calls calcBbox on return
			showLoading();
		} else {
			globals.map.setExtent(getInitialExtent(), true);
		}
	}, function(error){
		console.log(error);
	});	
} 

function zoomToAeroSelectionCrossing180() {
	globals.aeroQueryCrossing180.where = globals.tracklineMapService.layerDefinitions[0];
	globals.aeroQueryTaskCrossing180.execute(globals.aeroQueryCrossing180); //Calls calcBboxCrossing180 on return
	showLoading();
}

function calcBbox(fset){
	//console.log('inside calcBbox...');
	var bbox = null;
	if (fset.features.length == 0) {
		dojo.publish('/toaster/show', ['No features found']);
		return bbox;
	}
	
	//Calculate the bounding box of the features returned.
	bbox = fset.features[0].geometry.getExtent();
	dojo.forEach(fset.features, function(i){
		bbox = bbox.union(i.geometry.getExtent());
	});
	
	if ((bbox.spatialReference.wkid === 102100 || bbox.spatialReference.wkid === 3857) && 
		(bbox.xmin == -20037497.257867113 || bbox.xmax == 20037497.257867113)) {		
		//Bounding box crosses the entire world (assuming Web Mercator coords). 
		//It's likely the geometries cross the antimeridian.
		//Perform the zoom operation again in 180-centered coordinates.
		zoomToSelectionCrossing180();
	}
	else {
		globals.map.setExtent(bbox, true);
		hideLoading();
	}
}

function calcBboxCrossing180(fset) {
	//console.log('inside calcBboxCrossing180...');
	var bbox = null;
	if (fset.features.length == 0) {
		dojo.publish('/toaster/show', ['No features found']);
		return bbox;
	}
	
	//Calculate the bounding box of the features returned.
	bbox = fset.features[0].geometry.getExtent();
	dojo.forEach(fset.features, function(i){
		bbox = bbox.union(i.geometry.getExtent());
	});
	
	//Convert the bounding box back to Web Mercator. It may extend off the western edge of the map. This is what we want. 
	var webMercExtent = new esri.geometry.Extent(bbox.xmin - 20037507.067161795, bbox.ymin, bbox.xmax - 20037507.067161795, bbox.ymax, new esri.SpatialReference({wkid: 3857}));
	globals.map.setExtent(webMercExtent, true);
	hideLoading();
}

/**
 * Update the counts displayed in the TOC of how many surveys fit the filter criteria
 */
function updateSurveyCounts() {
	if (globals.tracklineMapService.layerDefinitions.length > 0) {
		if (globals.tracklineMapService.layerDefinitions[0]) {
			globals.marineQuery.where = globals.tracklineMapService.layerDefinitions[0];
			
		} else {
			globals.marineQuery.where = '1 = 1';
		}
		if (globals.tracklineMapService.layerDefinitions[10]) {
			globals.aeroQuery.where = globals.tracklineMapService.layerDefinitions[10];
			
		} else {
			globals.aeroQuery.where = '1 = 1';
		}
	} else {
		globals.marineQuery.where = '1 = 1';
		globals.aeroQuery.where = '1 = 1';
	}
	
	var queryTask0 = new esri.tasks.QueryTask(globals.tracklineMapService.url+"/0");
	var queryTask1 = new esri.tasks.QueryTask(globals.tracklineMapService.url+"/1");
	var queryTask2 = new esri.tasks.QueryTask(globals.tracklineMapService.url+"/2");
	var queryTask3 = new esri.tasks.QueryTask(globals.tracklineMapService.url+"/3");
	var queryTask4 = new esri.tasks.QueryTask(globals.tracklineMapService.url+"/4");
	var queryTask5 = new esri.tasks.QueryTask(globals.tracklineMapService.url+"/5");
	var queryTask6 = new esri.tasks.QueryTask(globals.tracklineMapService.url+"/6");
	var queryTask7 = new esri.tasks.QueryTask(globals.tracklineMapService.url+"/7");
	var queryTask8 = new esri.tasks.QueryTask(globals.tracklineMapService.url+"/8");
	var queryTask9 = new esri.tasks.QueryTask(globals.tracklineMapService.url+"/9");
	var queryTask10 = new esri.tasks.QueryTask(globals.tracklineMapService.url+"/10");
	
	queryTask0.executeForCount(globals.marineQuery, function(count){
		dojo.byId('countLayer0').innerHTML = '<i>(' + count + ' surveys)</i>';
	}, function(error){ console.log(error);});
	
	queryTask1.executeForCount(globals.marineQuery, function(count){
		dojo.byId('countLayer1').innerHTML = '<i>(' + count + ' surveys)</i>';
	}, function(error){ console.log(error);});	
	
	queryTask2.executeForCount(globals.marineQuery, function(count){
		dojo.byId('countLayer2').innerHTML = '<i>(' + count + ' surveys)</i>';
	}, function(error){ console.log(error);});	
	
	queryTask3.executeForCount(globals.marineQuery, function(count){
		dojo.byId('countLayer3').innerHTML = '<i>(' + count + ' surveys)</i>';
	}, function(error){ console.log(error);});	
	
	queryTask4.executeForCount(globals.marineQuery, function(count){
		dojo.byId('countLayer4').innerHTML = '<i>(' + count + ' surveys)</i>';
	}, function(error){ console.log(error);});	
	
	queryTask5.executeForCount(globals.marineQuery, function(count){
		dojo.byId('countLayer5').innerHTML = '<i>(' + count + ' surveys)</i>';
	}, function(error){ console.log(error);});	
	
	queryTask6.executeForCount(globals.marineQuery, function(count){
		dojo.byId('countLayer6').innerHTML = '<i>(' + count + ' surveys)</i>';
	}, function(error){ console.log(error);});	
	
	queryTask7.executeForCount(globals.marineQuery, function(count){
		dojo.byId('countLayer7').innerHTML = '<i>(' + count + ' surveys)</i>';
	}, function(error){ console.log(error);});
		
	queryTask8.executeForCount(globals.marineQuery, function(count){
		dojo.byId('countLayer8').innerHTML = '<i>(' + count + ' surveys)</i>';
	}, function(error){ console.log(error);});
		
	queryTask9.executeForCount(globals.marineQuery, function(count){
		dojo.byId('countLayer9').innerHTML = '<i>(' + count + ' surveys)</i>';
	}, function(error){ console.log(error);});	
	
	queryTask10.executeForCount(globals.aeroQuery, function(count){
		dojo.byId('countLayer10').innerHTML = '<i>(' + count + ' surveys)</i>';
	}, function(error){ console.log(error);});
}

function openGetDataWindow(geometry) {
	var normalizedGeometry;
	
	var surveyIds = [];

	//Get the current list of survey IDs from the Identify dijit's featureGrid store. Duplicates are ignored.
	globals.identifyDijit._featureGrid.store.fetch({
		onComplete: function (items) {
			dojo.forEach(items, function (item, index) {
				var surveyId = item.ref[0].attributes['Survey ID'];
				if (dojo.indexOf(surveyIds, surveyId) == -1) {
					surveyIds.push(surveyId);
				}
			});
		}
	});	
	var surveyIdString = surveyIds.join('%0D'); //Separate Survey IDs with a carriage return character
		
	var postParams = {};
	//var queryString = '';
	postParams.RUNTYPE = 'www-ims';
	postParams.SURVS = surveyIdString;
		
	//Append the visible layer flags
	//If "All Parameters" layer visible, set all parameters to 'on' 
	if (globals.visibleGeodasLayers[0].visible) {
		postParams.BATH = 'on';
		postParams.GRAV = 'on';
		postParams.MAG = 'on';
		postParams.SCSEIS = 'on';
		postParams.CDP = 'on';
		postParams.SSCAN = 'on';
		postParams.REFRAC = 'on';
		postParams.SHOT = 'on';
		postParams.SUBBOTTOM = 'on';
	}
	else {
		if (globals.visibleGeodasLayers[1].visible) {
			postParams.BATH = 'on';
		}
		if (globals.visibleGeodasLayers[2].visible) {
			postParams.GRAV = 'on';
		}
		if (globals.visibleGeodasLayers[3].visible) {
			postParams.MAG = 'on';
		}
		if (globals.visibleGeodasLayers[4].visible) {
			postParams.SCSEIS = 'on';
		}
		if (globals.visibleGeodasLayers[5].visible) {
			postParams.CDP = 'on';
		}
		if (globals.visibleGeodasLayers[6].visible) {
			postParams.SSCAN = 'on';
		}
		if (globals.visibleGeodasLayers[7].visible) {
			postParams.REFRAC = 'on';
		}
		if (globals.visibleGeodasLayers[8].visible) {
			postParams.SHOT = 'on';
		}
		if (globals.visibleGeodasLayers[9].visible) {
			postParams.SUBBOTTOM = 'on';
		}		
	}
	
	//Only append the ENVELOPE parameter if in Web Mercator
	if (globals.map.spatialReference.wkid == 102100 || globals.map.spatialReference.wkid == 3857) {
		//Normalize the geometry if it extends beyond the antimeridian. May result in a polygon with 2 rings.
		esri.geometry.normalizeCentralMeridian([geometry], globals.geometryService, function (geometries) {
			normalizedGeometry = geometries[0];
		}, function () {
			console.log("normalize error;")
		});
		var latLonGeometry = esri.geometry.webMercatorToGeographic(normalizedGeometry);
		
		//Add the ENVELOPE parameter if current geometry is polygon or extent.	
		if (latLonGeometry instanceof esri.geometry.Polygon) {
			var extent;
			if (latLonGeometry.rings.length == 1) {
				extent = latLonGeometry.getExtent();
			}
			else {
				//Polygon crosses the antimeridian and contains 2 rings. Construct a new Extent with xmin on the left side of the antimeridian, and xmax on the right. 
				var polygon1 = new esri.geometry.Polygon({"rings": [latLonGeometry.rings[0]],"spatialReference": {"wkid": 4326}});
				var polygon2 = new esri.geometry.Polygon({"rings": [latLonGeometry.rings[1]],"spatialReference": {"wkid": 4326}});
				var extent1 = polygon1.getExtent();
				var extent2 = polygon2.getExtent();
				extent = new esri.geometry.Extent(
						extent1.xmin > extent2.xmin ? extent1.xmin : extent2.xmin, extent1.ymin, 
								extent1.xmax < extent2.xmax ? extent1.xmax : extent2.xmax, extent1.ymax,
										new esri.SpatialReference({wkid: 4326}));
			}
				
			postParams.shape = "ENVELOPE((" + extent.xmin + " " + extent.ymin + ", " + extent.xmax + " " + extent.ymax + "))";
		}
		else if (latLonGeometry instanceof esri.geometry.Extent) {
			postParams.shape = "ENVELOPE((" + latLonGeometry.xmin + " " + latLonGeometry.ymin + ", " + latLonGeometry.xmax + " " + latLonGeometry.ymax + "))";
		}
		/*
		else if (latLonGeometry instanceof esri.geometry.Point) {
		//create a 1-degree box around the point
			var extent = new esri.geometry.Extent(latLonGeometry.x-0.5, latLonGeometry.y-0.5, 
				latLonGeometry.x+0.5, latLonGeometry.y+0.5, new esri.SpatialReference({wkid: 4326}));
			postParams.shape = "ENVELOPE((" + extent.xmin + " " + extent.ymin + ", " + extent.xmax + " " + extent.ymax + "))";
		}
		*/		
	}
	
	//Add the search dialog values min/max year, ship(s), institution(s), date added to database	
	var values = globals.dialogValues;
	if (values) {
		if (values.ships) {
			postParams.ships = values.ships.join('%0D');
		}
		if (values.institutions) {
			postParams.institutions = values.institutions.join('%0D');
		}
		if (values.startYear) {
			postParams.startYear = values.startYear;
		}
		if (values.endYear) {
			postParams.endYear = values.endYear;
		}
		if (values.startDateAdded) {
			postParams.startDateAdded = values.startDateAdded;
		}
		if (values.endDateAdded) {
			postParams.endDateAdded = values.endDateAdded;
		}
	}
	
	var xhrArgs = {
		url : "http://maps.ngdc.noaa.gov/mapviewer-support/geophysics/proxy.groovy",
		//url : "http://agsdevel.ngdc.noaa.gov/mapviewer-support/geophysics/proxy.groovy",			
		content: postParams,				
		handleAs : "text",
		sync: true,
		load : function(data) {
			var displayWindow = window.open('', 'geodasSearch'+Math.floor(Math.random()*1001));
			displayWindow.document.writeln(data);
			displayWindow.document.close();
			console.debug("Message posted.");
			dojo.byId("getDataButton").innerHTML = 'Get Marine Data';
		},
		error : function(error) {
			console.debug("xhrPost error" + error);
			alert("xhrPost error: " + error);
			dojo.byId("getDataButton").innerHTML = 'Get Marine Data';
		}
	}
	console.debug("Message being sent...");
	// Call the asynchronous xhrPost
	dojo.byId("getDataButton").innerHTML = 'Please wait...';
	var deferred = dojo.rawXhrPost(xhrArgs);
}

function launchViewer(name) {
	var visibleLayers = getVisibleLayers();
	
	if (name === 'Mercator') {
		window.open('index.html?layers=' + visibleLayers.join(','), 'geophysics');
	} else if (name === 'Arctic') {
		window.open('index_arctic.html?layers=' + visibleLayers.join(','), 'geophysics_arctic');
	} else { //Antarctic
		window.open('index_antarctic.html?layers=' + visibleLayers.join(','), 'geophysics_antarctic');
	}
}

function getVisibleLayers() {
	var visibleLayers = [];
	for (var i = 0; i < globals.visibleGeodasLayers.length; i++) {
		if (globals.visibleGeodasLayers[i].visible) {
			visibleLayers.push(i);
		}
	}
	return visibleLayers;
}

function toggleVisibleLayers() {
	var visibleLayers;
	var queryParams = dojo.queryToObject(window.location.search.slice(1));
	if (queryParams.layers !== undefined) {
		visibleLayers = queryParams.layers.split(',');
		
		var layerId;
		for (var i = 0; i < visibleLayers.length; i++) {
			layerId = parseInt(visibleLayers[i]);
			if (!isNaN(layerId)) {
				dijit.byId('chkLayer' + layerId).set('checked', true);
				toggleLayer(layerId);
			}
		}
		toggleLayer(0);
	} else {
		dijit.byId('chkLayer0').set('checked', true);
		toggleLayer(0);
	}
}

//Format a date in the form mm/dd/yyyy
function toDateString(date) {
	return date.getMonth()+1 + '/' + date.getDate() + '/' + date.getFullYear();
}

//Format a date in the form mm-dd-yyyy
function toDateString2(date) {
	return padDigits(date.getMonth()+1,2) + '-' + padDigits(date.getDate(),2) + '-' + date.getFullYear();
}

//Format a date in the form yyyymmdd
function toDateString3(date) {
	return date.getFullYear() + padDigits(date.getMonth()+1,2) + padDigits(date.getDate(),2);
}

function padDigits(n, totalDigits){
	n = n.toString();
	var pd = '';
	if (totalDigits > n.length) {
		for (i = 0; i < (totalDigits - n.length); i++) {
			pd += '0';
		}
	}
	return pd + n.toString();
}

/**
 * show error messages
 * @param {Object} msg
 */
function showToaster(msg){
	dojo.publish("infoMessage", [{
		message: msg,
		type: "error",
		duration: 5000
	}]);
}

/**
 * hide error messages
 * @param {Object} msg
 */
function hideToaster(){
	//simulate user click to dismiss toaster
	dijit.byId('toaster').onSelect();
}
