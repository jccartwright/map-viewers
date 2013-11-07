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
dojo.require("identify.Identify");
//dojo.require('dojo.io.script');
//dojo.require("dijit.form.FilteringSelect");
dojo.require("dijit.ToolbarSeparator");
dojo.require('layers.PairedMapServiceLayer');
dojo.require("dojox.widget.Toaster");
dojo.require("checkBoxTreeTOC.CheckBoxTree");
dojo.require("bathymetry.CreditsPanel");
dojo.require("survey_select.SurveySelectDialog");

var globals = {}; //container for global variables

globals.debug = false;
globals.mapConfigLoaded = true;
globals.scalebarZoomEnabled = 0;

globals.publicAgsHost = "http://maps.ngdc.noaa.gov/arcgis";
globals.privateAgsHost = "http://agsdevel.ngdc.noaa.gov:8399/arcgis";
globals.arcgisOnlineHost = "http://server.arcgisonline.com/ArcGIS";

//set the initial extent. may be overridden with request parameters
globals.initialExtentString = {
	"xmin":-4000000,
	"ymin":-4000000,
	"xmax":4000000,
	"ymax":4000000,
	"spatialReference":{"wkid":3572}
};

//define the function getInitialExtent to override default behavior
getInitialExtent = function(){
	globals.srid = 3572; //Web Mercator 
	return new esri.geometry.Extent(globals.initialExtentString);
};

globals.sourceProj = new Proj4js.Proj('EPSG:3572');
globals.destProj = new Proj4js.Proj('EPSG:4326');

//define globals.lods to override default behavior
globals.lods = [ 
	//{"level": 0, "resolution": 39135.759990686645,"scale": 1.479143876E8},
	{"level": 1, "resolution": 19567.880000634977, "scale": 7.39571938199999E7},
	{"level": 2,"resolution": 9783.9400003175,"scale": 3.697859691E7},
	{"level": 3,"resolution": 4891.969998835831,"scale": 1.848929845E7},
	{"level": 4,"resolution": 2445.9849999470835,"scale": 9244649.227},
	{"level": 5,"resolution": 1222.9925001058336,"scale": 4622324.614},
	{"level": 6,"resolution": 611.4962500529168,"scale": 2311162.307},
	{"level": 7,"resolution": 305.74812489416644,"scale": 1155581.153}
	//{"level": 8,"resolution": 152.8740625,"scale": 577790.5767}
	//{"level": 9,"resolution": 76.4370312632292,"scale": 288895.2884}
];

//dojo.subscribe("/Identify/getData", openGetDataWindow);

//mandatory lifecycle methods
//called just before common initialization
function preInit() {
	console.log("inside preInit...");
	
	var gotItems = function(items, request){
	  console.log("inside gotItems: Number of items located: " + items.length);
	};
	
	var mybanner = new banner.Banner({
		breadcrumbs: [
			{url: 'http://www.noaa.gov', label: 'NOAA'},
			{url: 'http://www.nesdis.noaa.gov', label: 'NESDIS'},
			{url: 'http://www.ngdc.noaa.gov', label: 'NGDC'},
			{url: 'http://maps.ngdc.noaa.gov/viewers', label: 'Maps'},
			{url: 'http://ngdc.noaa.gov/mgg/bathymetry/relief.html', label: 'Bathymetry'}			
		],
		dataUrl: "http://ngdc.noaa.gov/mgg/bathymetry/relief.html",
		image: "/images/bathymetry_viewer_logo.png"
	});
	mybanner.placeAt('banner');
	
	esri.config.defaults.io.proxyUrl = "http://maps.ngdc.noaa.gov/proxy.jsp";
	//esri.config.defaults.io.proxyUrl = "http://agsdevel.ngdc.noaa.gov/proxy.php";
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
	new esri.layers.ArcGISTiledMapServiceLayer(globals.publicAgsHost + "/rest/services/arctic/bathy_hillshade/MapServer", {
		id: "Bathy Hillshade",
		visible: true,
		opacity: 1
	}),
	new esri.layers.ArcGISTiledMapServiceLayer(globals.publicAgsHost + "/rest/services/arctic/bathy_hillshade/MapServer", {
		id: "Bathy Hillshade2",
		visible: false,
		opacity: 1,
		imageParameters: imageParametersJpg
	}),
	new esri.layers.ArcGISTiledMapServiceLayer(globals.publicAgsHost + "/rest/services/arctic/gshhs/MapServer", {
	 	id: "GSHHS",
	 	visible: false,
	 	opacity: 1
	}),
	new esri.layers.ArcGISDynamicMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/dem_hillshades_mosaic/MapServer", {
	 	id: "DEM Hillshades",
	 	visible: false,
	 	opacity: 1,
	 	imageParameters: imageParametersPng32
	}),
	new esri.layers.ArcGISDynamicMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/nos_hydro_dynamic/MapServer", {
	 	id: "NOS Hydrographic Surveys",
	 	visible: true,
	 	opacity: 1,
		imageParameters: imageParametersPng32
	}),
	new esri.layers.ArcGISDynamicMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/trackline_combined_dynamic/MapServer", {
	 	id: "Trackline Combined",
	 	visible: false,
	 	opacity: 1,
	 	imageParameters: imageParametersPng32
	}),	
	new esri.layers.ArcGISTiledMapServiceLayer(globals.publicAgsHost + "/rest/services/arctic/multibeam/MapServer", {
	 	id: "Multibeam (tiled)",
	 	visible: true,
	 	opacity: 1
	}),
	new esri.layers.ArcGISDynamicMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/multibeam_dynamic/MapServer", {
	 	id: "Multibeam (dynamic)",
	 	visible: false,
	 	opacity: 1,
	 	imageParameters: imageParametersPng32
	}),	
	new esri.layers.ArcGISTiledMapServiceLayer(globals.publicAgsHost + "/rest/services/arctic/world_reference_map/MapServer", {
	 	id: "World Reference Map",
	 	visible: false,
	 	opacity: 1
	}),
	new esri.layers.ArcGISDynamicMapServiceLayer(globals.publicAgsHost + "/rest/services/arctic/graticule/MapServer", {
		id: "Graticule",
		visible: true,
		opacity: 0.7,
		imageParameters: imageParametersPng32
	}),
	new esri.layers.ArcGISDynamicMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/dem_extents/MapServer", {
		id: "DEM Extents",
		visible: false,
		opacity: 1,
		imageParameters: imageParametersPng32
	}),
	new esri.layers.ArcGISTiledMapServiceLayer(globals.publicAgsHost + "/rest/services/arctic/clipping_donut/MapServer", {
		id: "Clipping Donut",
	 	visible: true,
	 	opacity: 1
	})
	];

	return (globals.mapServices);
}

function initIdentify(){
	//console.log('inside initIdentify...');
	var demAttributes = ['Name', 'Cell Size', 'Category', 'Source', 'Project', 'Vertical Datum', 'Status', 'Type', 'Coverage', 'Completion Date'];
				
	var demFieldUrls = {
		'Name': {
			prefix: '',
			urlField: 'DEMURL',
			postfix: ''
		}		
	};
	
	globals.identifyDijit = new identify.Identify({
		map: globals.map,
		label: "Identify",
		defaultTolerance: 2,
		showGetDataButton: false,
		mapServices: [
		{
			id: "Multibeam Bathymetry Surveys",
			name: "Multibeam Bathymetry Surveys",
			service: mapServiceById('Multibeam'),
			displayOptions: {
				0: {
					attributes: ['NGDC ID', 'Survey Name', 'Ship Name', 'Survey Year', 'Chief Scientist', 'Instrument', 'File Count', 'Track Length (km)', 'Total Time (hrs)', 'Bathymetry Beams', 'Amplitude Beams', 'Sidescan' ],
					fieldAliases: {'NGDC ID': 'Link to Data', 'Sidescan': 'Sidescan (pixels)'},
					fieldUrls: {
						'NGDC ID': {
							prefix: 'http://www.ngdc.noaa.gov/nndc/struts/results?op_0=eq&t=101378&s=8&d=70&d=75&d=76&d=91&d=74&d=73&d=72&d=81&d=82&d=85&d=86&d=79&no_data=suppress&v_0=',
							postfix: '',
							linkText: 'Cruise File List'
						}
					},
					layerAlias: "Multibeam Bathymetry Surveys",
					displayFieldNames: ['Survey Name', 'Survey Year'],
					displayFieldDelimiters: {
						'Survey Name': ' (',
						'Survey Year': ')'						
					},	
					visible: false				
				}
			},			
			sortFunction: function(a, b) {
				//Sort by year descending, then alphabetical by survey ID
				if (a.feature.attributes['Survey Year'] == b.feature.attributes['Survey Year']) {
					return a.feature.attributes['Survey Name'] <= b.feature.attributes['Survey Name'] ? -1 : 1;
				}
				return a.feature.attributes['Survey Year'] < b.feature.attributes['Survey Year'] ? 1 : -1;
			}
		},
		{
			id: "NOS Hydrographic Surveys",
			url: globals.publicAgsHost + "/rest/services/web_mercator/nos_hydro/MapServer",
			name: "NOS Hydrographic Surveys",
			service: mapServiceById('NOS Hydrographic Surveys'),
			displayOptions: {
				0: {
					layerAlias: "NOS Hydrographic Surveys: BAG",
					visible: false,
					attributes: ['Survey ID', 'BAG ID'],
					fieldUrls: {
						'Survey ID': {
							prefix: 'http://www.ngdc.noaa.gov/nndc/struts/results?op_0=eq&t=101523&s=3&d=5&d=8&d=23&d=10&d=26&d=29&d=40&d=41&d=24&d=11&d=9&d=28&d=12&d=13&d=14&d=15&d=16&d=17&d=18&d=20&d=21&d=19&no_data=suppress&v_0=',
							postfix: ''
						}
					}
				},
				1: {
					layerAlias: "NOS Hydrographic Surveys With Digital Sounding Data",
					visible: false,
					attributes: ['Survey ID', 'Year', 'Locality', 'Field Unit'],
					fieldUrls: {
						'Survey ID': {
							prefix: 'http://www.ngdc.noaa.gov/nndc/struts/results?op_0=eq&t=101523&s=3&d=5&d=8&d=23&d=10&d=26&d=29&d=40&d=41&d=24&d=11&d=9&d=28&d=12&d=13&d=14&d=15&d=16&d=17&d=18&d=20&d=21&d=19&no_data=suppress&v_0=',
							postfix: ''
						}
					},
					displayFieldNames: ['Survey ID', 'Year'],
					displayFieldDelimiters: {
						'Survey ID': ' (',
						'Year': ')'
					}
				},
				2: {
					layerAlias: "NOS Hydrographic Surveys Without Digital Sounding Data",
					visible: false,
					attributes: ['Survey ID', 'Year', 'Locality', 'Field Unit'],
					fieldUrls: {
						'Survey ID': {
							prefix: 'http://www.ngdc.noaa.gov/nndc/struts/results?op_0=eq&t=101523&s=3&d=5&d=8&d=23&d=10&d=26&d=29&d=40&d=41&d=24&d=11&d=9&d=28&d=12&d=13&d=14&d=15&d=16&d=17&d=18&d=20&d=21&d=19&no_data=suppress&v_0=',
							postfix: ''
						}
					},
					displayFieldNames: ['Survey ID', 'Year'],
					displayFieldDelimiters: {
						'Survey ID': ' (',
						'Year': ')'
					}
				}
			},
			sortFunction: function(a, b){
				//Sort by layer ID: BAGs, Digital, Non-Digital, then alphabetical for BAGs, or by year descending (nulls last) then alphabetical for hydro surveys.
				if (a.layerId == b.layerId) {
					if (a.layerId == 0) 
						return a.feature.attributes['BAG ID'] <= b.feature.attributes['BAG ID'] ? -1 : 1;
					
					if (a.feature.attributes['Year'] == 'Null') 
						return 1;
					if (b.feature.attributes['Year'] == 'Null') 
						return -1;
					
					if (a.feature.attributes['Year'] == b.feature.attributes['Year']) {
						return a.feature.attributes['Survey ID'] <= b.feature.attributes['Survey ID'] ? -1 : 1;
					}
					return a.feature.attributes['Year'] < b.feature.attributes['Year'] ? 1 : -1;
				}
				return a.layerId <= b.layerId ? -1 : 1;
			}
		},		
		{
			id: "DEM Extents",
			url: globals.publicAgsHost + "/rest/services/web_mercator/dem_extents/MapServer",
			name: "DEM Extents",
			service: mapServiceById('DEM Extents'),
			displayOptions: {
				12: {
					displayFieldName: 'Name',
					attributes: demAttributes,
					fieldUrls: demFieldUrls,
					layerAlias: "Digital Elevation Models",
					visible: false				
				}
			},
			sortFunction: function(a, b) {
				//Sort alphabetically, but Global relief (e.g. ETOPO1) should be at the end of the list
				if (a.feature.attributes['Category'] == 'Global Relief')
					return 1;
				if (b.feature.attributes['Category'] == 'Global Relief')
					return -1;
				return a.feature.attributes['Name'] <= b.feature.attributes['Name'] ? -1 : 1;				
			}
		},
		{
			id: "Trackline Bathymetry Surveys",
			name: "Trackline Bathymetry Surveys",
			service: mapServiceById('Trackline Combined'),
			displayOptions: {
				1: {
					layerAlias: "Trackline Bathymetry Surveys",
					visible: false,
					displayFieldName: 'Survey ID',
					attributes: ['Survey ID', 'Survey Type', 'Platform Name', 'Survey Start Year', 'Survey End Year', 'Source Institution', 'Project', 'Country', 'Chief Scientist', 'Date Added'],
					fieldUrls: {
						'Survey ID': {
							prefix: 'http://www.ngdc.noaa.gov/cgi-bin/mgg/gdas_tsea?RUNTYPE=www-ge&SURVS=',
							postfix: ''
						}
					},
					displayFieldNames: ['Survey ID', 'Survey Start Year'],
					displayFieldDelimiters: {
						'Survey ID': ' (',
						'Survey Start Year': ')'						
					}
				}				
			},
			sortFunction: function(a, b) {
				//Sort by year descending, then alphabetical by survey ID
				if (a.feature.attributes['Survey Start Year'] == b.feature.attributes['Survey Start Year']) {
					return a.feature.attributes['Survey ID'] <= b.feature.attributes['Survey ID'] ? -1 : 1;
				}
				return a.feature.attributes['Survey Start Year'] < b.feature.attributes['Survey Start Year'] ? 1 : -1;
			}
		}			
		],		
		lineSymbol: new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 255, 0]), 2),
		fillSymbol: new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([64, 64, 64, 1]), 2), new dojo.Color([255, 255, 0, 0.3]))
	});
	globals.identifyDijit.startup();
}


function initTOC(){
	
	//Get the optional 'layers' parameter from the URL querystring. Can be 'multibeam', 'trackline', 'nos_hydro', or 'dem'
	var visibleLayers, multibeamVisible = false, tracklineVisible = false, nosHydroVisible = false, demVisible = false;
	var queryParams = dojo.queryToObject(window.location.search.slice(1));
	if (queryParams.layers) {
		visibleLayers = queryParams.layers.split(',');
		
		if (dojo.indexOf(visibleLayers, 'multibeam') != -1) {
			multibeamVisible = true;
		}
		if (dojo.indexOf(visibleLayers, 'trackline') != -1) {
			tracklineVisible = true;
		}
		if (dojo.indexOf(visibleLayers, 'nos_hydro') != -1) {
			nosHydroVisible = true;
		}
		if (dojo.indexOf(visibleLayers, 'dem') != -1) {
			demVisible = true;
		}
	}
	else {
		multibeamVisible = true; //Multibeam should be visible when starting the viewer without the 'layers' param
	}
	
	var tocData = {
		identifier: 'name',
		label: 'name',
		items: [ 
		{
			name: 'Multibeam Bathymetry Surveys',
			service: 'Multibeam',
			subLayers: [],
			type: 'item',
			checkbox: true,
			leaf: true,
			icon: 'blank'
		},
		{
			name: 'Trackline Bathymetry Surveys',
			service: 'Trackline Combined',
			subLayers: [1],
			type: 'item',
			checkbox: false,
			leaf: true,
			icon: 'blank'
		},
		{
			name: 'NOS Hydrographic Surveys',
			id: 'NOS Hydrographic Surveys',
			type: 'item',
			checkbox: false,
			leaf: false,
			icon: 'folder',
			children: [
			{_reference: 'Surveys with Digital Sounding Data'}, 
			{_reference: 'Surveys with BAGs (Bathymetric Attributed Grids)'},
			{_reference: 'Surveys without Digital Sounding Data'}]
		}, 
		{
			name: 'Surveys with Digital Sounding Data',
			service: 'NOS Hydrographic Surveys',
			subLayers: [1],
			type: 'child',
			checkbox: false,
			leaf: true,
			icon: 'blank'
		},
		{
			name: 'Surveys with BAGs (Bathymetric Attributed Grids)',
			service: 'NOS Hydrographic Surveys',
			subLayers: [0],
			type: 'child',
			checkbox: false,
			leaf: true,
			icon: 'blank'
		},	
		{
			name: 'Surveys without Digital Sounding Data',
			service: 'NOS Hydrographic Surveys',
			subLayers: [2],
			type: 'child',
			checkbox: false,
			leaf: true,
			icon: 'blank'
		},	
		{
			name: 'Digital Elevation Models',
			service: 'DEM Extents',
			subLayers: [12],
			type: 'item',
			checkbox: false,
			leaf: true,
			icon: 'blank'
		},
		{
			name: 'DEM Hillshades',
			service: 'DEM Hillshades',
			subLayers: [],
			type: 'item',
			checkbox: false,
			leaf: true,
			icon: 'blank'
		}
		]

	};
	
	var store = new dojo.data.ItemFileWriteStore({
		data: tocData,
		//url: "toc.json",
		jsId: "jsonStore"
	});
	var model = new checkBoxTreeTOC.CheckBoxStoreModel({
		store: store,
		query: {
			type: 'item'
		},
		checkboxAll: true,
		checkboxRoot: false,
		checkboxState: true,
		checkboxStrict: true
	});
	var tree = new checkBoxTreeTOC.CheckBoxTree({
		model: model,
		showRoot: false,
		allowMultiState: true,
		//branchIcons: true,
		//nodeIcons: true,
		autoExpand: true
	});
	tree.placeAt("toc");
}

function initBasemapToolbar() {
	//console.log('inside initBasemapToolbar...');	
	var basemapToolbar = new simple_basemap_toolbar.SimpleBasemapToolbar({
		basemaps: [
			{services: [{id: 'Bathy Hillshade2'}], label: 'Shaded Relief', boundariesEnabled: true},
			{services: [{id: 'GSHHS'}], label: 'Simple', boundariesEnabled: true}           
        ],          
        overlays: [
			{services: [{id: 'World Reference Map'}], label: 'Boundaries/Labels', visible: true},
			{services: [{id: 'Graticule'}], label: 'Graticule', visible: true}
        ],
        selectedBasemapIndex: 0
	});
	basemapToolbar.placeAt('basemapToolbar');
	basemapToolbar.startup();
	return(basemapToolbar);
}

//called on Map onLoad event
function mapInitializedCustom(theMap) {
	//console.log('inside mapInitializedCustom...');
}

/**
 * open the Survey Select dialog
 */
function showSurveySelectDialog(){
	globals.surveySelectDialog.show();	
}

function dialogHandler(values){
	globals.dialogValues = values;
	var layerDefinitions;
	var sql = [];
	var i;
	
	globals.isCleared = false;
	
	//Multibeam
	if (values.startYear) {
		sql.push("SURVEY_YEAR >= " + values.startYear);
	}	
	if (values.endYear) {
		sql.push("SURVEY_YEAR <= " + values.endYear);
	}
	if (values.survey) {
		sql.push("UPPER(SURVEY_NAME) = '" + values.survey.toUpperCase() + "'");
	}
	if (values.ship) {
		sql.push("UPPER(SHIP_NAME) LIKE '%" + values.ship.toUpperCase() + "%'");
	}
	layerDefinitions = sql.join(' and ');
	console.log(layerDefinitions);
	mapServiceById('Multibeam').setLayerDefinitions([layerDefinitions]);
	
	
	//Trackline Bathymetry
	sql = [];
	if (values.startYear) {
		sql.push("END_YR >= " + values.startYear);
	}		
	if (values.endYear) {
		sql.push("START_YR <= " + values.endYear);
	}
	if (values.survey) {
		sql.push("UPPER(SURVEY_ID) = '" + values.survey.toUpperCase() + "'");
	}
	if (values.ship) {
		sql.push("UPPER(PLATFORM) LIKE '%" + values.ship.toUpperCase() + "%'");
	}
	layerDefinitions = sql.join(' and ');
	console.log(layerDefinitions);
	var allLayerDefinitions = [];
	allLayerDefinitions[0] = layerDefinitions;
	allLayerDefinitions[1] = layerDefinitions;
	mapServiceById('Trackline Combined').setLayerDefinitions(allLayerDefinitions);
	
	
	//NOS Hydro	
	sql = [];
	if (values.startYear) {
		sql.push("YEAR >= " + values.startYear);
	}		
	if (values.endYear) {
		sql.push("YEAR <= " + values.endYear);
	}
	if (values.survey) {
		sql.push("UPPER(SURVEY) = '" + values.survey.toUpperCase() + "'");
	}
	if (values.ship) {
		sql.push("UPPER(FIELD_UNIT) LIKE '%" + values.ship.toUpperCase() + "%'");
	}
	layerDefinitions = sql.join(' and ');
	console.log(layerDefinitions);
	var allLayerDefinitions = [];
	allLayerDefinitions[0] = layerDefinitions;
	allLayerDefinitions[1] = layerDefinitions;		
	mapServiceById('NOS Hydrographic Surveys').setLayerDefinitions(allLayerDefinitions);	
		
	var txt = '';
	if (values.startYear && !values.endYear) {
		txt += '<b>Survey Year:</b> ' + values.startYear + '-present';
	} else if (values.startYear && values.endYear) {
		txt += '<b>Survey Year:</b> ' + values.startYear + '-' + values.endYear + '';
	} else if (!values.startYear && values.endYear) {
		txt += '<b>Survey Year:</b> ' + values.endYear + ' and earlier';
	}
	
	if (values.survey) {
		if (txt.length > 0) {
			txt += '<br/>';
		}
		txt += '<b>Survey ID:</b> ' + values.survey.toUpperCase();
	}
	if (values.ship) {
		if (txt.length > 0) {
			txt += '<br/>';
		}
		txt += '<b>Ship Name includes:</b> ' + values.ship.toUpperCase();
	}
	dojo.byId('filterDiv').innerHTML = txt;
}

function clearSelection() {
	//console.log("inside clearSelection()");		

	if (!globals.isCleared) {
		mapServiceById('Multibeam').setLayerDefinitions([]);
		mapServiceById('Trackline Combined').setLayerDefinitions([]);
		mapServiceById('NOS Hydrographic Surveys').setLayerDefinitions([]);
	}
	dojo.byId('filterDiv').innerHTML = "<b>All Surveys</b>";
	globals.surveySelectDialog.reset(); //Reset to defaults in the Survey Select Dialog
	globals.isCleared = true;
}

//called after all layers added to map
function mapReadyCustom(theMap) {
	console.log('inside mapReadyCustom...');
	
	new layers.PairedMapServiceLayer({
		id: "Multibeam",
		tiledServiceId: "Multibeam (tiled)",
		dynamicServiceId: "Multibeam (dynamic)",
		mapServiceList: globals.mapServices,
		visible: true,
		map: globals.map,
		cutoffZoom: 7 - globals.firstZoomLevel
	});
	/*
	new layers.PairedMapServiceLayer({
		id: "Trackline Bathymetry",
		tiledServiceId: "Trackline Bathymetry (tiled)",
		dynamicServiceId: "Trackline Bathymetry (dynamic)",
		mapServiceList: globals.mapServices,
		visible: false,
		map: globals.map,
		cutoffZoom: 7 - globals.firstZoomLevel,
		defaultVisibleLayers: [1]
	});
	*/
	
	mapServiceById('DEM Extents').setVisibleLayers([9999]); //Manually set all the sublayers to invisible for "DEM Extents"
	mapServiceById('NOS Hydrographic Surveys').setVisibleLayers([9999]); //Manually set all the sublayers to invisible for "NOS Hydro"
	mapServiceById('Trackline Combined').setVisibleLayers([1]);

		
	//globals.geometryService = new esri.tasks.GeometryService("http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");//new esri.tasks.GeometryService("http://maps.ngdc.noaa.gov/rest/services/Geometry/GeometryServer");
	globals.geometryService = new esri.tasks.GeometryService("http://maps.ngdc.noaa.gov/arcgis/rest/services/Geometry/GeometryServer");	
			
	initBasemapToolbar();	
	initTOC();
	initIdentify(theMap);
	
	globals.scalebar = new esri.dijit.Scalebar({map: globals.map, scalebarUnit: "metric"}, dojo.byId("scalebar"));
	globals.scalebar.show();
	if (dojo.byId("bottomBar")) {
		dojo.byId("bottomBar").style.width = "340px";
	}

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
	
	globals.surveySelectDialog = new survey_select.SurveySelectDialog({title: 'Filter Data by Year'});
	
	dojo.subscribe("/survey_select/SurveySelectDialog", dialogHandler);
}

//Return the map service with the specified id
function mapServiceById(id) {
	var i;
	for (i = 0; i < globals.mapServices.length; i++) {
		if (globals.mapServices[i].id === id) {
			return globals.mapServices[i];
		}
	}
	return null;
}