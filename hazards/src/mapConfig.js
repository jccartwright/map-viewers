dojo.require("esri.map");
dojo.require("esri.dijit.OverviewMap");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.AccordionContainer");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.Toolbar");
dojo.require("dijit.form.Button");
dojo.require("esri.dijit.OverviewMap");
dojo.require("esri.dijit.Scalebar");
dojo.require("esri.dijit.Legend");
dojo.require("help_panel.HelpPanel");
dojo.require("simple_basemap_toolbar.SimpleBasemapToolbar");
dojo.require("banner.Banner");
dojo.require("haz_identify.HazIdentify");
//dojo.require("identify.Identify");
dojo.require("dijit.ToolbarSeparator");
dojo.require('layers.PairedMapServiceLayer');
dojo.require('bboxDialog.BoundingBoxDialog');
dojo.require("dojox.widget.Toaster");
dojo.require("dojox.layout.FloatingPane");
dojo.require("query_dialog.TsEventSearchDialog");
dojo.require("query_dialog.TsObsSearchDialog");
dojo.require("query_dialog.SignifEqSearchDialog");
dojo.require("query_dialog.VolEventSearchDialog");
dojo.require("query_dialog.DartSearchDialog");

var globals = {}; //container for global variables

globals.debug = false;
globals.mapConfigLoaded = true;
globals.scalebarZoomEnabled = 3;

globals.publicAgsHost = "http://maps.ngdc.noaa.gov/arcgis";
globals.privateAgsHost = "http://agsdevel.ngdc.noaa.gov:6080/arcgis";
globals.arcgisOnlineHost = "http://server.arcgisonline.com/ArcGIS";

//set the initial extent. may be overridden with request parameters
globals.initialExtentString = {
	"xmin": 30,
	"ymin": -70,
	"xmax": 390,
	"ymax": 70,
	"spatialReference":{"wkid":4326}
};

globals.hazLayerDefinitions = ['','','','','','','','','','','','',''];

globals.hazMapServiceID = 7;
globals.tsEventLayerID1 = 0;
globals.tsEventLayerID2 = 1;
globals.tsObsLayerID1 = 2;
globals.tsObsLayerID2 = 3;
globals.tsObsLayerID3 = 4;
globals.signifEqLayerID = 5;
globals.volEventLayerID = 6;
globals.volLocLayerID = 7;
globals.currentDartStationsLayerID = 8;
globals.retrospectiveDartStationsLayerID = 9;
globals.tideGaugesLayerID = 10;
globals.plateBoundariesLayerID = 11;

//mandatory lifecycle methods
//called just before common initialization
function preInit() {
	console.log("inside preInit...");
	//console.log(globals.surveysStore);
	
	var gotItems = function(items, request){
	  console.log("inside gotItems: Number of items located: " + items.length);
	};
	
	var mybanner = new banner.Banner({
		breadcrumbs: [
			{url: 'http://www.noaa.gov', label: 'NOAA'},
			{url: 'http://www.nesdis.noaa.gov', label: 'NESDIS'},
			{url: 'http://www.ngdc.noaa.gov', label: 'NGDC'},
			{url: 'http://maps.ngdc.noaa.gov/viewers', label: 'Maps'},
			{url: 'http://ngdc.noaa.gov/hazard/hazards.shtml', label: 'Hazards'}			
		],
		dataUrl: "http://ngdc.noaa.gov/hazard/hazards.shtml",
		image: "/images/viewer_logo.png"
	});
	mybanner.placeAt('banner');

	//create the dialog
	globals.coordDialog = new bboxDialog.BoundingBoxDialog({title:'Specify an Area of Interest', style: 'width:300px;'});
}

//called after common initialization
function postInit() {
//	console.log("inside postInit...");

}


function getMapServiceList(){
	var imageParametersPng32 = new esri.layers.ImageParameters();
	imageParametersPng32.format = "png32";
	var imageParametersJpg = new esri.layers.ImageParameters();
	imageParametersJpg.format = "jpg";
	
	globals.mapServices = [
	new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer", {
		id: "NatGeo Overview",
		visible: false,
		opacity: 1
	}), 	
	new esri.layers.ArcGISTiledMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/gebco08_hillshade/MapServer", {
	 	id: "GEBCO_08 (tiled)",
	 	visible: false,
	 	opacity: 1
	}),
	new esri.layers.ArcGISDynamicMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/gebco08_hillshade/MapServer", {
	 	id: "GEBCO_08 (dynamic)",
	 	visible: false,
	 	opacity: 1,
	 	imageParameters: imageParametersJpg
	}),
	new esri.layers.ArcGISTiledMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/etopo1_hillshade/MapServer", {
	 	id: "ETOPO1 (tiled)",
	 	visible: false,
	 	opacity: 1
	}),
	new esri.layers.ArcGISDynamicMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/etopo1_hillshade/MapServer", {
		id: "ETOPO1 (dynamic)",
		visible: false,
		opacity: 1,
		imageParameters: imageParametersJpg
	}),
	new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer", {
	 	id: "Light Gray",
	 	visible: false,
	 	opacity: 1
	}),
	new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer", {
		id: "World Imagery",
		visible: false,
		opacity: 1
	}),
	new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer", {
		id: "NatGeo Basemap",
		visible: false,
		opacity: 1
	}),	
	new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer", {
		id: "Ocean Basemap",
		visible: false,
		opacity: 1
	}),
	new esri.layers.ArcGISDynamicMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/hazards/MapServer", {
		id: "Hazards",
		visible: true,
		imageParameters: imageParametersPng32
	}),
	new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer", {
	 	id: "World Boundaries and Places",
	 	visible: false,
	 	opacity: 1
	}),
	new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer", {
	 	id: "Light Gray Reference",
	 	visible: false,
	 	opacity: 1
	}),
	new esri.layers.ArcGISDynamicMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/graticule/MapServer", {
		id: "Graticule",
		visible: true,
		opacity: 0.7,
		imageParameters: imageParametersPng32
	})
	];
				
	return (globals.mapServices);
}

function initIdentify(){
	console.log("inside initIdentify...");
	
	globals.identifyDijit = new haz_identify.HazIdentify({
		map: globals.map,
		label: "Identify",
		defaultTolerance: 2,
		mapServices: [
		{
			id: "Hazards",
			service: mapServiceById('Hazards'),
			name: "Hazards",
			displayOptions: {
				0: {
					layerAlias: "Tsunami Event",
					attributes: ['ID','Date String','Latitude','Longitude','Location Name','Area','Country','Cause','Event Validity','Earthquake Magnitude',
						'Earthquake Depth','Max Event Runup','Tsunami Intensity','Comments','Damage in millions of dollars','Damage Description','Houses Destroyed','Houses Destroyed Description',
						'Deaths','Deaths Description','Injuries','Injuries Description','Missing','Missing Description','Number of Observations'],
					fieldAliases: {
						'ID': 'Link to Additional Info',
						'Date String': 'Date'				
					},
					displayFieldNames: ['Location Name', 'Date String'],
					displayFieldDelimiters: {
						'Location Name': ': ',
						'Date String': ''
					},
					fieldUrls: {
						'ID': {
							prefix: 'http://www.ngdc.noaa.gov/nndc/struts/results?EQ_0=',
							postfix: '&t=101650&s=9&d=99,91,95,93&nd=display',
							linkText: 'Additional Info'
						}
					},
					visible: true			
				},
				1: {
					layerAlias: "Tsunami Event",
					attributes: ['ID','Date String','Latitude','Longitude','Location Name','Area','Country','Cause','Event Validity','Earthquake Magnitude',
						'Earthquake Depth','Max Event Runup','Tsunami Intensity','Comments','Damage in millions of dollars','Damage Description','Houses Destroyed','Houses Destroyed Description',
						'Deaths','Deaths Description','Injuries','Injuries Description','Missing','Missing Description','Number of Observations'],
					fieldAliases: {
						'ID': 'Link to Additional Info',
						'Date String': 'Date'				
					},
					displayFieldNames: ['Location Name', 'Date String'],
					displayFieldDelimiters: {
						'Location Name': ': ',
						'Date String': ''
					},
					fieldUrls: {
						'ID': {
							prefix: 'http://www.ngdc.noaa.gov/nndc/struts/results?EQ_0=',
							postfix: '&t=101650&s=9&d=99,91,95,93&nd=display',
							linkText: 'Additional Info'
						}
					},
					visible: true						
				},
				2: {
					layerAlias: "Tsunami Observation",
					attributes: ['ID','Location Name','Country','Area','Water Height','Type of Measurement','Date String','Arrival Day','Arrival Hour','Arrival Minute','Travel Time Hours','Travel Time Minutes',
						'Period','First Motion','Latitude','Longitude','Inundation Distance','Comments','Damage in Millions of Dollars','Damage Description','Deaths','Deaths Description',
						'Injuries','Injuries Description','Houses Destroyed','Houses Destroyed Description','Distance From Source','Doubtful'],
					fieldAliases: {
						'ID': 'Link to Additional Info',
						'Date String': 'Date',
						'Water Height': 'Water Height (m)',
						'Distance From Source': 'Distance From Source (km)'
					},
					displayFieldNames: ['Location Name', 'Date String'],
					displayFieldDelimiters: {
						'Location Name': ': ',
						'Date String': ''
					},
					fieldUrls: {
						'ID': {
							prefix: 'http://www.ngdc.noaa.gov/nndc/struts/results?EQ_0=',
							postfix: '&t=101650&s=10&d=99,185,186,76,78&nd=display',
							linkText: 'Additional Info'
						}
					},
					visible: true										
				},
				3: {
					layerAlias: "Tsunami Observation",
					attributes: ['ID','Location Name','Country','Area','Water Height','Type of Measurement','Date String','Arrival Day','Arrival Hour','Arrival Minute','Travel Time Hours','Travel Time Minutes',
						'Period','First Motion','Latitude','Longitude','Inundation Distance','Comments','Damage in Millions of Dollars','Damage Description','Deaths','Deaths Description',
						'Injuries','Injuries Description','Houses Destroyed','Houses Destroyed Description','Distance From Source','Doubtful'],
					fieldAliases: {
						'ID': 'Link to Additional Info',
						'Date String': 'Date',
						'Water Height': 'Water Height (m)',
						'Distance From Source': 'Distance From Source (km)'
					},
					displayFieldNames: ['Location Name', 'Date String'],
					displayFieldDelimiters: {
						'Location Name': ': ',
						'Date String': ''
					},
					fieldUrls: {
						'ID': {
							prefix: 'http://www.ngdc.noaa.gov/nndc/struts/results?EQ_0=',
							postfix: '&t=101650&s=10&d=99,185,186,76,78&nd=display',
							linkText: 'Additional Info'
						}
					},
					visible: true													
				},
				4: {
					layerAlias: "Tsunami Observation",
					attributes: ['ID','Location Name','Country','Area','Water Height','Type of Measurement','Date String','Arrival Day','Arrival Hour','Arrival Minute','Travel Time Hours','Travel Time Minutes',
						'Period','First Motion','Latitude','Longitude','Inundation Distance','Comments','Damage in Millions of Dollars','Damage Description','Deaths','Deaths Description',
						'Injuries','Injuries Description','Houses Destroyed','Houses Destroyed Description','Distance From Source','Doubtful'],
					fieldAliases: {
						'ID': 'Link to Additional Info',
						'Date String': 'Date',
						'Water Height': 'Water Height (m)',
						'Distance From Source': 'Distance From Source (km)'
					},
					displayFieldNames: ['Location Name', 'Date String'],
					displayFieldDelimiters: {
						'Location Name': ': ',
						'Date String': ''
					},
					fieldUrls: {
						'ID': {
							prefix: 'http://www.ngdc.noaa.gov/nndc/struts/results?EQ_0=',
							postfix: '&t=101650&s=10&d=99,185,186,76,78&nd=display',
							linkText: 'Additional Info'
						}
					},
					visible: true									
				},
				5: {
					layerAlias: "Significant Earthquake",
					attributes: ['ID','Date String','Latitude','Longitude','Location Name','Area','Country','Region','Earthquake Depth','Earthquake Magnitude','Intensity','Comments',
						 'Damage in Millions of Dollars','Damage Description','Deaths','Deaths Description','Injuries','Injuries Description','Missing','Missing Description',
						 'Houses Destroyed','Houses Destroyed Description','Houses Damaged','Houses Damaged Description','Tsunami Associated?','Volcano Event Associated?'],
					fieldAliases: {
						'ID': 'Link to Additional Info',
						'Date String': 'Date'				
					},
					displayFieldNames: ['Location Name', 'Date String'],
					displayFieldDelimiters: {
						'Location Name': ': ',
						'Date String': ''
					},
					fieldUrls: {
						'ID': {
							prefix: 'http://www.ngdc.noaa.gov/nndc/struts/results?eq_0=',
							postfix: '&t=101650&s=13&d=22,26,13,12&nd=display',
							linkText: 'Additional Info'
						}
					},
					visible: true		
				},
				6: {
					layerAlias: "Significant Volcanic Eruption",
					attributes: ['Event ID','Name','Year','Month','Day','Location','Country','Latitude','Longitude',/*'Event Date','Start Date','End Date',*/'VEI','Comments','Damage in Millions of Dollars','Damage Description',
						 'Deaths','Deaths Description','Injuries','Injuries Description','Missing','Missing Description','Houses Destroyed','Houses Destroyed Description'],
					fieldAliases: {
						'Event ID': 'Link to Additional Info'			
					},
					displayFieldNames: ['Name', 'Year'],
					displayFieldDelimiters: {
						'Name': ': ',
						'Year': ''	
					},
					fieldUrls: {
						'Event ID': {
							prefix: 'http://www.ngdc.noaa.gov/nndc/struts/results?eq_0=',
							postfix: '&t=102557&s=1&d=140,145,175,180&nd=display',
							linkText: 'Additional Info'
						}
					},	
					visible: true				
				},
				7: {
					layerAlias: "Volcano",
					displayFieldName: 'Name',
					attributes: ['Name','Location','Latitude','Longitude','Country','Elevation','Morphology','Status','Time of Last Eruption'],
					fieldUrls: {
						'Name': {
							prefix: 'http://www.ngdc.noaa.gov/nndc/struts/results?type_0=Like&query_0=',
							postfix: '&op_8=eq&v_8=&type_10=EXACT&query_10=None+Selected&le_2=&ge_3=&le_3=&ge_2=&op_5=eq&v_5=&op_6=eq&v_6=&op_7=eq&v_7=&t=102557&s=5&d=5'
						}
					},	
					visible: true				
				},
				8: {
					layerAlias: "Current DART Station",
					displayFieldName: 'Station',	
					attributes: ['Station', 'Description', 'Latitude', 'Longitude', 'Depth', 'Deployment Date', 'Type'],
					fieldUrls: {
						'Station': {
							prefix: 'http://www.ndbc.noaa.gov/station_page.php?station=',
							postfix: ''
						}
					},
					visible: true
				},
				9: {
					layerAlias: "Retrospective DART Station",
					displayFieldName: 'Station ID',
					attributes: ['Station ID', 'Data URL', 'Latitude', 'Longitude', 'Depth', 'Deployment Date', 'Recovery Date', 'Data Start Date', 'Data End Date'],
					fieldAliases: {
						'Station ID': 'Station ID (metadata link)',
						'DATA_URL': 'Data Link'
					},
					displayFieldName: 'Station ID',
					fieldUrls: {
						'Data URL': {
							prefix: '',
							postfix: '',
							linkText: 'Data URL'
						},
						'Station ID': {
							prefix: 'http://www.ngdc.noaa.gov/nmmrview/fgdc.jsp?id=gov.noaa.ngdc.dart_bpr:',
							postfix: '&view=classic'
						}
					},	
					visible: true				
				},
				10: {
					layerAlias: "Tsunami Tide Gauge",
					displayFieldName: 'Station',
					attributes: ['Station', 'Name', 'State', 'Latitude', 'Longitude'],
					fieldUrls: {
						'Station': {
							prefix: 'http://tidesandcurrents.noaa.gov/cgi-bin/tsunami_graphload.cgi?stnid=',
							postfix: ''
						}
					},
					visible: true				
				},				
				11: {
					layerAlias: "Plate Boundary",
					displayFieldName: 'Description',
					attributes: ['Description', 'Type'],
					visible: true				
				}
			},
			
			sortFunction: function(a, b) {				
				if (a.layerId == b.layerId) {
					//Sort tsEvents, observations, and signif EQs by date, descending
					if (a.layerId == globals.tsObsLayerID1 || a.layerId == globals.tsObsLayerID2 || a.layerId == globals.tsObsLayerID3 ||
						a.layerId == globals.tsEventLayerID1 || a.layerId == globals.tsEventLayerID2 || a.layerId == globals.signifEqLayerID)
						return a.feature.attributes['Date String'] >= b.feature.attributes['Date String'] ? -1 : 1;
																																			
					if (a.layerId == globals.volEventLayerID)
						return dojo.string.pad(a.feature.attributes['Year'], 4, '0') >= dojo.string.pad(b.feature.attributes['Year'], 4, '0') ? -1 : 1;
					if (a.layerId == globals.volLocLayerID)
						return a.feature.attributes['Name'] <= b.feature.attributes['Name'] ? -1 : 1;
						
					if (a.layerId == globals.currentDartStationsLayerID)
						return a.feature.attributes['Station'] <= b.feature.attributes['Station'] ? -1 : 1;
					if (a.layerId == globals.retrospectiveDartStationsLayerID)
						return a.feature.attributes['Station ID'] <= b.feature.attributes['Station ID'] ? -1 : 1;
					if (a.layerId == globals.tsunamiTideGaugesLayerID)
						return a.feature.attributes['Station'] <= b.feature.attributes['Station'] ? -1 : 1;																		
				}
				//Sort by mapservice sublayer ID
				return a.layerId <= b.layerId ? -1 : 1;	
			}						
		}
		],
		lineSymbol: new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 255, 0]), 2),
		fillSymbol: new esri.symbol.SimpleFillSymbol(
     		esri.symbol.SimpleFillSymbol.STYLE_SOLID, 
     		new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([ 64, 64, 64, 1 ]), 2), 
     		new dojo.Color([ 255, 255, 0, 0.5 ]))
	});
	
	globals.identifyDijit.startup();
}


function initBasemapToolbar() {
	//console.log('inside initBasemapToolbar...');
	var basemapToolbar = new simple_basemap_toolbar.SimpleBasemapToolbar({
		basemaps: [
			{services: [{id: 'Ocean Basemap'}], label: 'Ocean Basemap (Esri)', boundariesEnabled: false},       
			{services: [{id: 'GEBCO_08'}], label: 'Shaded Relief (GEBCO_08)', boundariesEnabled: true},
			{services: [{id: 'ETOPO1'}], label: 'Shaded Relief (ETOPO1)', boundariesEnabled: true},
			{services: [{id: 'Light Gray'}, {id: 'Light Gray Reference'}], label: 'Light Gray (Esri)', boundariesEnabled: false},			
            {services: [{id: 'World Imagery'}], label: 'Imagery (Esri)', boundariesEnabled: true},
			{services: [{id: 'NatGeo Basemap'}], label: 'National Geographic (Esri)', boundariesEnabled: false}
		],			
		overlays: [
			{services: [{id: 'World Boundaries and Places'}], label: 'Boundaries/Labels', visible: true},
			{services: [{id: 'Graticule'}], label: 'Graticule', visible: false},
			{services: [{id: 'Hazards', subLayers: [11]}], label: 'Plate Boundaries (<a href="#" onclick="dijit.byId(\'plateBoundariesLegendPane\').show();">Legend</a>)', visible: true},
			{services: [{id: 'Hazards', subLayers: [7]}], label: 'Volcanoes <img src="images/tan_triangle.png"/>', visible: false}			
		],
        selectedBasemapIndex: 5
	});
	basemapToolbar.placeAt('basemapToolbar');
	basemapToolbar.startup();
	return(basemapToolbar);
}

//called on Map onLoad event
function mapInitializedCustom(theMap) {
	//console.log('inside mapInitializedCustom...');
}

//called after all layers added to map
function mapReadyCustom(theMap) {
	console.log('inside mapReadyCustom...');
	
	//construct PairedMapServiceLayers. Modifies the mapServiceList				
	new layers.PairedMapServiceLayer({
		id: "GEBCO_08",
		tiledServiceId: "GEBCO_08 (tiled)",
		dynamicServiceId: "GEBCO_08 (dynamic)",
		mapServiceList: globals.mapServices,
		visible: false,
		map: globals.map,
		cutoffZoom: 7 - globals.firstZoomLevel
	});
	new layers.PairedMapServiceLayer({
		id: "ETOPO1",
		tiledServiceId: "ETOPO1 (tiled)",
		dynamicServiceId: "ETOPO1 (dynamic)",
		mapServiceList: globals.mapServices,
		visible: false,
		map: globals.map,
		cutoffZoom: 7 - globals.firstZoomLevel
	});
					
	initBasemapToolbar();	
	//initIdentify(theMap);
	
	globals.scalebar = new esri.dijit.Scalebar({map: globals.map, scalebarUnit: "metric"}, dojo.byId("scalebar"));
	globals.scalebar.hide(); // scalebar is hidden by default at small scales
	
	//Override the close() method on the legend dojox.layout.FloatingPanes so that they don't get destroyed when clicking their close icons
	dijit.byId("tsEventLegendPane").close = dijit.byId("tsEventLegendPane").minimize;
	dijit.byId("tsObsLegendPane1").close = dijit.byId("tsObsLegendPane1").minimize;
	dijit.byId("tsObsLegendPane2").close = dijit.byId("tsObsLegendPane2").minimize;
	dijit.byId("signifEqLegendPane").close = dijit.byId("signifEqLegendPane").minimize;
	dijit.byId("dartLegendPane").close = dijit.byId("dartLegendPane").minimize;
	dijit.byId("plateBoundariesLegendPane").close = dijit.byId("plateBoundariesLegendPane").minimize;
	
	//Reposition the legend FloatingPanes on browser resize.
	dojo.connect(dijit.byId('mapDiv'), 'resize', function() {
		dojo.style(dijit.byId("tsEventLegendPane"), {left: '50%', top: '50%'});
		dojo.style(dijit.byId("tsObsLegendPane1"), {left: '50%', top: '50%'});
		dojo.style(dijit.byId("tsObsLegendPane2"), {left: '50%', top: '50%'});
		dojo.style(dijit.byId("signifEqLegendPane"), {left: '50%', top: '50%'});
		dojo.style(dijit.byId("dartLegendPane"), {left: '50%', top: '50%'});
		dojo.style(dijit.byId("plateBoundariesLegendPane"), {left: '70%', top: '20%'});
	});
	
	globals.hazMapService = mapServiceById('Hazards');
	esri.config.defaults.geometryService = new esri.tasks.GeometryService("http://maps.ngdc.noaa.gov/arcgis/rest/services/Geometry/GeometryServer");
		
	initIdentify(); //Initialize Identify dijit
	
	toggleTsEventVisibility();
	toggleTsObsVisibility();
	toggleSignifEqVisibility();
			
	//esri.config.defaults.io.proxyUrl = "http://agsdevel.ngdc.noaa.gov/proxy.php";
	esri.config.defaults.io.proxyUrl = "http://maps.ngdc.noaa.gov/proxy.jsp";
	
	dojo.subscribe("/query_dialog/TsEventSearch",filterTsEvents);
	dojo.subscribe("/query_dialog/ResetTsEventSearch",resetTsEvents);
	dojo.subscribe("/query_dialog/TsObsSearch",filterTsObs);
	dojo.subscribe("/query_dialog/ResetTsObsSearch",resetTsObs);
	dojo.subscribe("/query_dialog/SignifEqSearch",filterSignifEq);
	dojo.subscribe("/query_dialog/ResetSignifEqSearch",resetSignifEq);
	dojo.subscribe("/query_dialog/VolEventSearch",filterVolEvents);
	dojo.subscribe("/query_dialog/ResetVolEventSearch",resetVolEvents);
	dojo.subscribe("/query_dialog/DartSearch",filterDarts);
	dojo.subscribe("/query_dialog/ResetDartSearch",resetDarts);
	dojo.subscribe("/Identify/showTsObs", showTsObsForEvent);
	dojo.subscribe("/Identify/showTsEvent", showTsEventForObs);	
	dojo.subscribe("/basemapToolbar/plateBoundaries", togglePlateBoundaries);
	dojo.subscribe("/basemapToolbar/volcanoes", toggleVolcanoes);

	//QueryTasks for retrieving collections of points from the mapservice for the zoom-to operation
	globals.tsEventQueryTask = new esri.tasks.QueryTask(globals.hazMapService.url+"/" + globals.tsEventLayerID1);
	globals.tsEventQuery = new esri.tasks.Query();
	globals.tsEventQuery.returnGeometry = true;
	globals.tsEventQuery.outFields = [];
	dojo.connect(globals.tsEventQueryTask, "onComplete", zoomToExtentOfPoints);	
	
	globals.tsObsQueryTask = new esri.tasks.QueryTask(globals.hazMapService.url+"/" + globals.tsObsLayerID3);
	globals.tsObsQuery = new esri.tasks.Query();
	globals.tsObsQuery.returnGeometry = true;
	globals.tsObsQuery.outFields = [];
	dojo.connect(globals.tsObsQueryTask, "onComplete", zoomToExtentOfPoints);
	
	dojo.connect(globals.map, "onZoomEnd", function(level){
		if (level <= globals.scalebarZoomEnabled - globals.firstZoomLevel) {
			globals.scalebar.hide();
			if (dojo.byId("bottomBar")) 
				dojo.byId("bottomBar").style.width = "auto";
		} else {
			globals.scalebar.show();
			if (dojo.byId("bottomBar")) 
				dojo.byId("bottomBar").style.width = "340px";
		}
	});
			
	globals.navToolbar = new esri.toolbars.Navigation(globals.map);
	
	globals.tsEventSearchDialog = new query_dialog.TsEventSearchDialog({title: 'Tsunami Events Search'});	
	globals.tsObsSearchDialog = new query_dialog.TsObsSearchDialog({title: 'Tsunami Observations Search'});	
	globals.signifEqSearchDialog = new query_dialog.SignifEqSearchDialog({title: 'Significant Earthquakes Search'});
	globals.volEventSearchDialog = new query_dialog.VolEventSearchDialog({title: 'Significant Volcanic Eruptions Search'});
	globals.dartSearchDialog = new query_dialog.DartSearchDialog({title: 'DART Stations Search'});
	
	resetTsEvents();
	
	//Get the optional 'institutions' param from the queryString
	var queryParams = dojo.queryToObject(window.location.search.slice(1));
	var visibleLayers = [];
	if (queryParams.layers) {
		visibleLayers = queryParams.layers.split(',');		
	}
	if (dojo.indexOf(visibleLayers, '0') != -1) {
		dijit.byId('checkTsEvents').attr('checked', true);
		toggleTsEventVisibility();
	}
	if (dojo.indexOf(visibleLayers, '1') != -1) {
		dijit.byId('checkTsObs').attr('checked', true);
		toggleTsObsVisibility();
	}
	if (dojo.indexOf(visibleLayers, '2') != -1) {
		dijit.byId('checkSignifEq').attr('checked', true);
		toggleSignifEqVisibility();
	}
	if (dojo.indexOf(visibleLayers, '3') != -1) {
		dijit.byId('checkVolEvent').attr('checked', true);
		toggleVolEventVisibility();
	}
	if (dojo.indexOf(visibleLayers, '4') != -1) {
		dijit.byId('checkDart').attr('checked', true);
		toggleDartVisibility();
	}
	if (dojo.indexOf(visibleLayers, '5') != -1) {
		dijit.byId('checkTideGauges').attr('checked', true);
		toggleTideGaugeVisibility();
	}
	
	if (queryParams.tsEvent) {
		var queryTask = new esri.tasks.QueryTask(globals.hazMapService.url + "/" + globals.tsEventLayerID1);
		var query = new esri.tasks.Query();
		query.returnGeometry = true;
		query.outFields = [];
		query.where = 'ID=' + queryParams.tsEvent;
		dojo.connect(queryTask, "onComplete", function(fset){
			var point = new esri.geometry.Point(fset.features[0].geometry.x, fset.features[0].geometry.y, new esri.SpatialReference({ wkid:102100 }));
			showTsObsForEvent({tsEventID: queryParams.tsEvent, geometry: point});
		});
		queryTask.execute(query);
	}
}

function togglePlateBoundaries(state) {
	dojo.publish("/toc/layer/show", [{name: 'Hazards', service: 'Hazards', subLayers: [globals.plateBoundariesLayerID], state: state}]);		
}

function toggleVolcanoes(state) {
	dojo.publish("/toc/layer/show", [{name: 'Hazards', service: 'Hazards', subLayers: [globals.volLocLayerID], state: state}]);		
}

function showTsEventSearchDialog() {
	globals.tsEventSearchDialog.show();
}

function showTsObsSearchDialog() {
	globals.tsObsSearchDialog.show();
}

function showSignifEqSearchDialog() {
	globals.signifEqSearchDialog.show();
}

function showVolEventSearchDialog() {
	globals.volEventSearchDialog.show();
}

function showDartSearchDialog() {
	globals.dartSearchDialog.show();
}

function toggleTsEventVisibility() {
	if (dijit.byId('checkTsEvents').attr('checked') == true) {
		//console.log('tsEvents true');
		dijit.byId('radioTsEvents1').attr('disabled', false);
		dijit.byId('radioTsEvents2').attr('disabled', false);
		setTsEventVisibility(dijit.byId('radioTsEvents1').attr('checked') ? 1 : 2);
	}
	else {
		//console.log('tsEvents false');
		dijit.byId('radioTsEvents1').attr('disabled', true);
		dijit.byId('radioTsEvents2').attr('disabled', true);	
		setTsEventVisibility(0);
	}
}

function toggleTsObsVisibility() {
	if (dijit.byId('checkTsObs').attr('checked') == true) {
		//console.log('tsObs true');
		dijit.byId('radioTsObs1').attr('disabled', false);
		dijit.byId('radioTsObs2').attr('disabled', false);
		setTsObsVisibility(dijit.byId('radioTsObs1').attr('checked') ? 1 : 2);
	}
	else {
		//console.log('tsObs false');
		dijit.byId('radioTsObs1').attr('disabled', true);
		dijit.byId('radioTsObs2').attr('disabled', true);	
		setTsObsVisibility(0);
	}
}

function toggleSignifEqVisibility() {
	if (dijit.byId('checkSignifEq').attr('checked') == true) {
		dojo.publish("/toc/layer/show", [{name: 'Hazards', service: 'Hazards', subLayers: [globals.signifEqLayerID], state: true}]);
	}
	else {
		dojo.publish("/toc/layer/show", [{name: 'Hazards', service: 'Hazards', subLayers: [globals.signifEqLayerID], state: false}]);
	}
}

function toggleVolEventVisibility() {
	if (dijit.byId('checkVolEvent').attr('checked') == true) {
		dojo.publish("/toc/layer/show", [{name: 'Hazards', service: 'Hazards', subLayers: [globals.volEventLayerID], state: true}]);
	}
	else {
		dojo.publish("/toc/layer/show", [{name: 'Hazards', service: 'Hazards', subLayers: [globals.volEventLayerID], state: false}]);
	}
}

function toggleDartVisibility() {
	if (dijit.byId('checkDart').attr('checked') == true) {
		dojo.publish("/toc/layer/show", [{name: 'Hazards', service: 'Hazards', subLayers: [globals.currentDartStationsLayerID, globals.retrospectiveDartStationsLayerID], state: true}]);
	}
	else {
		dojo.publish("/toc/layer/show", [{name: 'Hazards', service: 'Hazards', subLayers: [globals.currentDartStationsLayerID, globals.retrospectiveDartStationsLayerID], state: false}]);
	}
}

function toggleTideGaugeVisibility() {
	if (dijit.byId('checkTideGauges').attr('checked') == true) {
		dojo.publish("/toc/layer/show", [{name: 'Hazards', service: 'Hazards', subLayers: [globals.tideGaugesLayerID], state: true}]);
	}
	else {
		dojo.publish("/toc/layer/show", [{name: 'Hazards', service: 'Hazards', subLayers: [globals.tideGaugesLayerID], state: false}]);
	}
}

function setTsEventVisibility(index) {
	if (index == 0) {
		dojo.publish("/toc/layer/show", [{name: 'Hazards', service: 'Hazards', subLayers: [globals.tsEventLayerID1,globals.tsEventLayerID2], state: false}]);
	}
	else if (index == 1) {
		dojo.publish("/toc/layer/show", [{name: 'Hazards', service: 'Hazards', subLayers: [globals.tsEventLayerID1], state: false}]);
		dojo.publish("/toc/layer/show", [{name: 'Hazards', service: 'Hazards', subLayers: [globals.tsEventLayerID2], state: true}]);
	}
	else {
		dojo.publish("/toc/layer/show", [{name: 'Hazards', service: 'Hazards', subLayers: [globals.tsEventLayerID1], state: true}]);
		dojo.publish("/toc/layer/show", [{name: 'Hazards', service: 'Hazards', subLayers: [globals.tsEventLayerID2], state: false}]);
	}
}

function setTsObsVisibility(index) {
	if (index == 0) {
		dojo.publish("/toc/layer/show", [{name: 'Hazards', service: 'Hazards', subLayers: [globals.tsObsLayerID1,globals.tsObsLayerID2,globals.tsObsLayerID3], state: false}]);
	}
	else if (index == 1) {
		dojo.publish("/toc/layer/show", [{name: 'Hazards', service: 'Hazards', subLayers: [globals.tsObsLayerID3], state: false}]);
		dojo.publish("/toc/layer/show", [{name: 'Hazards', service: 'Hazards', subLayers: [globals.tsObsLayerID1,globals.tsObsLayerID2], state: true}]);
	}
	else {
		dojo.publish("/toc/layer/show", [{name: 'Hazards', service: 'Hazards', subLayers: [globals.tsObsLayerID3], state: true}]);
		dojo.publish("/toc/layer/show", [{name: 'Hazards', service: 'Hazards', subLayers: [globals.tsObsLayerID1,globals.tsObsLayerID2], state: false}]);
	}
}

function filterTsEvents(values) {
	var layerDefinitions;
	var sql = [];
	
	if (!isNaN(values.startYear)) {
		sql.push("YEAR>=" + values.startYear);
	}
	if (!isNaN(values.endYear)) {
		sql.push("YEAR<=" + values.endYear);
	}
	if (values.sourceLocationName != '') {
		sql.push("UPPER(LOCATION_NAME) LIKE '%" + values.sourceLocationName.toUpperCase() + "%'");	
	}
	if (values.sourceRegion != 'none selected') {
		sql.push("REGION_CODE=" + values.sourceRegion);	
	}
	if (values.sourceCountry != 'none selected') {
		sql.push("COUNTRY='" + values.sourceCountry + "'");	
	}
	if (values.sourceCause != '') {
		sql.push("CAUSE_CODE IN (" + values.sourceCause + ")");
	}
	if (values.minDeaths) {
		sql.push("DEATHS_AMOUNT_ORDER>=" + values.minDeaths);
	}
	if (values.maxDeaths) {
		sql.push("DEATHS_AMOUNT_ORDER<=" + values.maxDeaths);
	}
	if (values.minDamage) {
		sql.push("DAMAGE_AMOUNT_ORDER>=" + values.minDamage);
	}
	if (values.maxDamage) {
		sql.push("DAMAGE_AMOUNT_ORDER<=" + values.maxDamage);
	}
	if (values.minEventValidity) {
		sql.push("EVENT_VALIDITY_CODE>=" + values.minEventValidity);
	}
	if (values.maxEventValidity) {
		sql.push("EVENT_VALIDITY_CODE<=" + values.maxEventValidity);
	}
	
	//console.log(sql);
	layerDefinitions = sql.join(' and ');
	globals.hazLayerDefinitions[globals.tsEventLayerID1] = layerDefinitions;
	globals.hazLayerDefinitions[globals.tsEventLayerID2] = layerDefinitions;
	
	globals.hazMapService.setLayerDefinitions(globals.hazLayerDefinitions);
	
	dijit.byId('checkTsEvents').attr('checked', true);
	toggleTsEventVisibility();
	dojo.byId("tsEventsFlag").innerHTML = "*";
	dijit.byId("tsEventResetButton").attr("disabled", false);
}

function resetTsEvents() {
	globals.hazLayerDefinitions[globals.tsEventLayerID1] = 'EVENT_VALIDITY_CODE>0';
	globals.hazLayerDefinitions[globals.tsEventLayerID2] = 'EVENT_VALIDITY_CODE>0';
	
	globals.hazMapService.setLayerDefinitions(globals.hazLayerDefinitions);
	
	dojo.byId("tsEventsFlag").innerHTML = "";
	dijit.byId("tsEventResetButton").attr("disabled", true);
	globals.tsEventSearchDialog.resetForm();
}

function showTsObsForEvent(params) {
	var tsEventID = params.tsEventID;
	var geometry = params.geometry;
	//console.log('inside showTsObsForEvent: ' + params);
	
	var tsEventLayerDefinitions = "ID=" + tsEventID;
	globals.hazLayerDefinitions[globals.tsEventLayerID1] = tsEventLayerDefinitions;
	globals.hazLayerDefinitions[globals.tsEventLayerID2] = tsEventLayerDefinitions;
	
	var tsObsLayerDefinitions = "TSEVENT_ID=" + tsEventID;
	globals.hazLayerDefinitions[globals.tsObsLayerID1] = tsObsLayerDefinitions;
	globals.hazLayerDefinitions[globals.tsObsLayerID2] = tsObsLayerDefinitions;
	globals.hazLayerDefinitions[globals.tsObsLayerID3] = tsObsLayerDefinitions;		
	
	globals.hazMapService.setLayerDefinitions(globals.hazLayerDefinitions);
	
	dijit.byId('checkTsEvents').attr('checked', true);
	toggleTsEventVisibility();
	dojo.byId("tsEventsFlag").innerHTML = "*";
	dijit.byId("tsEventResetButton").attr("disabled", false);
	
	dijit.byId('checkTsObs').attr('checked', true);
	toggleTsObsVisibility();
	dojo.byId("tsObsFlag").innerHTML = "*";
	dijit.byId("tsObsResetButton").attr("disabled", false);
	
	//Zoom to results
	zoomToTsEventAndObservations(tsEventID, geometry);
}

function showTsEventForObs(params) {
	var tsEventID = params.tsEventID;
	var geometry = params.geometry;
	//console.log('inside showTsEventForObs: ' + tsEventID);
	
	var layerDefinitions = "ID=" + tsEventID;
	globals.hazLayerDefinitions[globals.tsEventLayerID1] = layerDefinitions;
	globals.hazLayerDefinitions[globals.tsEventLayerID2] = layerDefinitions;
		
	globals.hazMapService.setLayerDefinitions(globals.hazLayerDefinitions);
	
	dijit.byId('checkTsEvents').attr('checked', true);
	toggleTsEventVisibility();
	dojo.byId("tsEventsFlag").innerHTML = "*";
	dijit.byId("tsEventResetButton").attr("disabled", false);
	
	//Zoom to results
	zoomToTsEventForObservation(tsEventID, geometry);
}

function filterTsObs(values) {
	var layerDefinitions;
	var sql = [];
	
	if (!isNaN(values.startYear)) {
		sql.push("YEAR>=" + values.startYear);
	}
	if (!isNaN(values.endYear)) {
		sql.push("YEAR<=" + values.endYear);
	}
	if (values.sourceRegion != 'none selected') {
		sql.push("EVENT_REGION_CODE=" + values.sourceRegion);
	}		
	if (values.observationRegion != 'none selected') {
		sql.push("REGION_CODE=" + values.observationRegion);
	}
	if (values.observationLocationName != '') {
		sql.push("UPPER(LOCATION_NAME) LIKE '%" + values.observationLocationName.toUpperCase() + "%'");
	}			
	if (values.country != 'none selected') {
		sql.push("COUNTRY='" + values.country + "'");
	}	
	if (values.measurementType != '') {
		sql.push("TYPE_MEASUREMENT_ID IN(" + values.measurementType + ")");
	}	
	if (values.minWaterHeight) {
		sql.push("RUNUP_HT>=" + values.minWaterHeight);
	}
	if (values.maxWaterHeight) {
		sql.push("RUNUP_HT<=" + values.maxWaterHeight);
	}
	if (values.minDist) {
		sql.push("DIST_FROM_SOURCE>=" + values.minDist);
	}
	if (values.maxDist) {
		sql.push("DIST_FROM_SOURCE<=" + values.maxDist);
	}
	if (values.minDeaths) {
		sql.push("DEATHS_AMOUNT_ORDER>=" + values.minDeaths);
	}
	if (values.maxDeaths) {
		sql.push("DEATHS_AMOUNT_ORDER<=" + values.maxDeaths);
	}
	if (values.minDamage) {
		sql.push("DAMAGE_AMOUNT_ORDER>=" + values.minDamage);
	}
	if (values.maxDamage) {
		sql.push("DAMAGE_AMOUNT_ORDER<=" + values.maxDamage);
	}
	
	//console.log(sql);
	layerDefinitions = sql.join(' and ');
	globals.hazLayerDefinitions[globals.tsObsLayerID1] = layerDefinitions;
	globals.hazLayerDefinitions[globals.tsObsLayerID2] = layerDefinitions;
	globals.hazLayerDefinitions[globals.tsObsLayerID3] = layerDefinitions;

	globals.hazMapService.setLayerDefinitions(globals.hazLayerDefinitions);
		
	dijit.byId('checkTsObs').attr('checked', true);
	toggleTsObsVisibility();
	dojo.byId("tsObsFlag").innerHTML = "*";
	dijit.byId("tsObsResetButton").attr("disabled", false);
}

function resetTsObs() {
	globals.hazLayerDefinitions[globals.tsObsLayerID1] = '';
	globals.hazLayerDefinitions[globals.tsObsLayerID2] = '';
	globals.hazLayerDefinitions[globals.tsObsLayerID3] = '';

	globals.hazMapService.setLayerDefinitions(globals.hazLayerDefinitions);
	
	dojo.byId("tsObsFlag").innerHTML = "";
	dijit.byId("tsObsResetButton").attr("disabled", true);	
	globals.tsObsSearchDialog.resetForm();
}

function filterSignifEq(values) {
	var layerDefinitions;
	var sql = [];
	
	if (!isNaN(values.startYear))
		sql.push("YEAR>=" + values.startYear);
	if (!isNaN(values.endYear))
		sql.push("YEAR<=" + values.endYear);
	if (values.region != 'none selected') 
		sql.push("REGION_CODE=" + values.region);	
	if (values.country != 'none selected') 
		sql.push("COUNTRY='" + values.country + "'");	
	if (values.minMagnitude)
		sql.push("EQ_MAGNITUDE>=" + values.minMagnitude);
	if (values.maxMagnitude)
		sql.push("EQ_MAGNITUDE<=" + values.maxMagnitude);
	if (values.minIntensity)
		sql.push("INTENSITY>=" + values.minIntensity);
	if (values.maxIntensity)
		sql.push("INTENSITY<=" + values.maxIntensity);
	if (values.minDepth)
		sql.push("EQ_DEPTH>=" + values.minDepth);
	if (values.maxDepth)
		sql.push("EQ_DEPTH<=" + values.maxDepth);
	if (values.minDeaths)
		sql.push("DEATHS_AMOUNT_ORDER>=" + values.minDeaths);
	if (values.maxDeaths)
		sql.push("DEATHS_AMOUNT_ORDER<=" + values.maxDeaths);
	if (values.minDamage)
		sql.push("DAMAGE_AMOUNT_ORDER>=" + values.minDamage);
	if (values.maxDamage)
		sql.push("DAMAGE_AMOUNT_ORDER<=" + values.maxDamage);
	if (values.tsunamiAssoc)
		sql.push("FLAG_TSUNAMI=1");
	if (values.volEventAssoc)
		sql.push("FLAG_VOL_EVENT=1");
	
	//console.log(sql);
	layerDefinitions = sql.join(' and ');
	globals.hazLayerDefinitions[globals.signifEqLayerID] = layerDefinitions;	

	globals.hazMapService.setLayerDefinitions(globals.hazLayerDefinitions);
	
	dojo.byId("signifEqFlag").innerHTML = "*";
	dijit.byId('checkSignifEq').attr('checked', true);
	toggleSignifEqVisibility();
	dijit.byId("signifEqResetButton").attr("disabled", false);
}

function resetSignifEq() {
	globals.hazLayerDefinitions[globals.signifEqLayerID] = '';
	
	globals.hazMapService.setLayerDefinitions(globals.hazLayerDefinitions);
		
	dojo.byId("signifEqFlag").innerHTML = "";
	dijit.byId("signifEqResetButton").attr("disabled", true);
	globals.signifEqSearchDialog.resetForm();
}

function filterVolEvents(values) {
	var sql = [];
	
	if (values.volcanoName)
	 	sql.push("UPPER(NAME) LIKE '%" + values.volcanoName.toUpperCase() + "%'");
	if (values.country)
		sql.push("COUNTRY='" + values.country + "'");
	if (values.morphology)
		sql.push("MORPHOLOGY='" + values.morphology + "'");
	if (values.timeOfEruption)
		sql.push("TIME_ERUPT='" + values.timeOfEruption + "'");
	if (!isNaN(values.startYear))
		sql.push("YEAR>=" + values.startYear);
	if (!isNaN(values.endYear))
		sql.push("YEAR<=" + values.endYear);
	if (values.minVei)
		sql.push("VEI>=" + values.minVei);
	if (values.maxVei)
		sql.push("VEI<=" + values.maxVei); 
	if (values.minDeaths)
		sql.push("DEATHS_AMOUNT_ORDER>=" + values.minDeaths);
	if (values.maxDeaths)
		sql.push("DEATHS_AMOUNT_ORDER<=" + values.maxDeaths); 
	if (values.minDamage)
		sql.push("DAMAGE_AMOUNT_ORDER>=" + values.minDamage);
	if (values.maxDamage)
		sql.push("DAMAGE_AMOUNT_ORDER<=" + values.maxDamage); 
	if (values.tsunamiAssoc)
		sql.push("TSU_ID IS NOT NULL");
	
	//console.log(sql);
		
	var layerDefinitions = sql.join(' and ');
	globals.hazLayerDefinitions[globals.volEventLayerID] = layerDefinitions;	

	globals.hazMapService.setLayerDefinitions(globals.hazLayerDefinitions);
		
	dijit.byId('checkVolEvent').attr('checked', true);
	toggleVolEventVisibility();
	dojo.byId("volEventFlag").innerHTML = "*";
	dijit.byId("volEventResetButton").attr("disabled", false);
}

function resetVolEvents() {
	globals.hazLayerDefinitions[globals.volLocLayerID] = '';
	globals.hazLayerDefinitions[globals.volEventLayerID] = '';

	globals.hazMapService.setLayerDefinitions(globals.hazLayerDefinitions);
		
	dojo.byId("volEventFlag").innerHTML = "";
	dijit.byId("volEventResetButton").attr("disabled", true);	
	globals.volEventSearchDialog.resetForm();
}

function filterDarts(values) {
	var currentDartSql = [];
	var retrospectiveDartSql = [];
	var startDate, endDate;

	if (!values.showCurrentDarts)
		currentDartSql = ["STATION='None Selected'"];
	if (!values.showRetrospectiveDarts)
		retrospectiveDartSql = ["STATION='None Selected'"];
		
	if (!values.startDate)
		startDate = new Date(1900, 0, 1);
	else
		startDate = values.startDate;
	if (!values.endDate)
		endDate = new Date(); //current date
	else
		endDate = values.endDate;
	
	retrospectiveDartSql.push(
		"DEPLOYMENT_DATE<=TO_DATE('" + toDateString(endDate) + "','YYYYMMDD') AND " +
		"RECOVERY_DATE>=TO_DATE('" + toDateString(startDate) + "','YYYYMMDD')");
						
	//console.log(currentDartSql);
	//console.log(retrospectiveDartSql);
	
	var currentDartLayerDefinitions = currentDartSql.join(' and ');
	globals.hazLayerDefinitions[globals.currentDartStationsLayerID] = currentDartLayerDefinitions;	
	var retrospectiveDartLayerDefinitions = retrospectiveDartSql.join(' and ');
	globals.hazLayerDefinitions[globals.retrospectiveDartStationsLayerID] = retrospectiveDartLayerDefinitions;	

	globals.hazMapService.setLayerDefinitions(globals.hazLayerDefinitions);
		
	dijit.byId('checkDart').attr('checked', true);
	toggleDartVisibility();
	dojo.byId("dartFlag").innerHTML = "*";
	dijit.byId("dartResetButton").attr("disabled", false);
}

function resetDarts() {
	globals.hazLayerDefinitions[globals.currentDartStationsLayerID] = '';
	globals.hazLayerDefinitions[globals.retrospectiveDartStationsLayerID] = '';

	globals.hazMapService.setLayerDefinitions(globals.hazLayerDefinitions);
		
	dojo.byId("dartFlag").innerHTML = "";
	dijit.byId("dartResetButton").attr("disabled", true);	
	globals.dartSearchDialog.resetForm();
}


function zoomToTsEventAndObservations(tsEventID, geometry) {
	globals.currentPoint = geometry;
	globals.tsObsQuery.where = 'TSEVENT_ID=' + tsEventID;
	globals.tsObsQueryTask.execute(globals.tsObsQuery);
	globals.tsObsSearchDialog.resetForm();
}

function zoomToTsEventForObservation(tsEventID, geometry) {
	globals.currentPoint = geometry;
	globals.tsEventQuery.where = 'ID=' + tsEventID;
	globals.tsEventQueryTask.execute(globals.tsEventQuery);	
	globals.tsEventSearchDialog.resetForm();
}

function zoomToExtentOfPoints(fset) {
	/*
	 * Populate 2 multipoint objects: one in Web Mercator and one in 180-centered Mercator.
	 * (Add a constant of 20037507.067161795 to the x-coordinate to convert to 180-centered)
	 * Each multipoint will contain either:
	 * -The tsunami event and its set of observations, or
	 * -A tsunami observation and its corresponding event point
	 * Zoom to the multipoint with the smaller area (either the Web Mercator or 180-centered).
	*/
	
	//console.log("zoomToExtentOfPoints");
	
	var pacProj = new esri.SpatialReference({wkt: "PROJCS[\"WGS_1984_Web_Mercator_Auxiliary_Sphere\",GEOGCS[\"GCS_WGS_1984\",DATUM[\"D_WGS_1984\",SPHEROID[\"WGS_1984\",6378137.0,298.257223563]],PRIMEM[\"Greenwich\",0.0],UNIT[\"Degree\",0.0174532925199433]],PROJECTION[\"Mercator_Auxiliary_Sphere\"],PARAMETER[\"False_Easting\",0.0],PARAMETER[\"False_Northing\",0.0],PARAMETER[\"Central_Meridian\",180],PARAMETER[\"Standard_Parallel_1\",0.0],PARAMETER[\"Auxiliary_Sphere_Type\",0.0],UNIT[\"Meter\",1.0]]"}); 
	var multipoint = new esri.geometry.Multipoint(new esri.SpatialReference({ wkid:102100 })); //Multipoint in Web Mercator projection
	var multipoint2 = new esri.geometry.Multipoint(pacProj); //Multipoint in 180-centered Mercator projection

	if (fset.features.length == 0) {
		return;
	}
	dojo.forEach(fset.features, function(feature) {
		multipoint.addPoint(feature.geometry);
		var x = feature.geometry.x + 20037507.067161795;
		if (x > 20037507.067161795)
			x -= 40075014.13432359;
		multipoint2.addPoint(new esri.geometry.Point(x, feature.geometry.y, pacProj));
	});
	multipoint.addPoint(globals.currentPoint);
	var x = globals.currentPoint.x + 20037507.067161795;
	if (x > 20037507.067161795)
		x -= 40075014.13432359;
	multipoint2.addPoint(new esri.geometry.Point(x, globals.currentPoint.y, pacProj));
	
	var extent = multipoint.getExtent();
	var extent2 = multipoint2.getExtent();	
	
	if (extent.getWidth() * extent.getHeight() < extent2.getWidth() * extent2.getHeight()) 
	 	globals.map.setExtent(extent, true);
	else {
		var webMercExtent = new esri.geometry.Extent(extent2.xmin - 20037507.067161795, extent2.ymin, extent2.xmax - 20037507.067161795, extent2.ymax, new esri.SpatialReference({wkid: 3857}));
	 	globals.map.setExtent(webMercExtent, true);
	}
}