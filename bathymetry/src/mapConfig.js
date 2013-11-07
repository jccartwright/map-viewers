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
dojo.require("dijit.ToolbarSeparator");
dojo.require('layers.PairedMapServiceLayer');
dojo.require('bboxDialog.BoundingBoxDialog');
dojo.require("dojox.widget.Toaster");
dojo.require("checkBoxTreeTOC.CheckBoxTree");
dojo.require("bathymetry.CreditsPanel");
dojo.require("survey_select.SurveySelectDialog");

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

//define the function getInitialExtent to override default behavior

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
			{url: 'http://ngdc.noaa.gov/mgg/bathymetry/relief.html', label: 'Bathymetry'}			
		],
		dataUrl: "http://ngdc.noaa.gov/mgg/bathymetry/relief.html",
		image: "/images/bathymetry_viewer_logo.png"
	});
	mybanner.placeAt('banner');

	//create the dialog
	globals.coordDialog = new bboxDialog.BoundingBoxDialog({title:'Specify an Area of Interest', style: 'width:300px;'});
	
	esri.config.defaults.io.proxyUrl = "http://maps.ngdc.noaa.gov/proxy.jsp";
	//esri.config.defaults.io.proxyUrl = "http://agsdevel.ngdc.noaa.gov/proxy.php"; 
}

//called after common initialization
function postInit() {
	console.log("inside postInit...");
	globals.isCleared = true; //We start out with no selection applied
}

function getMapServiceList(){
	var imageParametersPng32 = new esri.layers.ImageParameters();
	imageParametersPng32.format = "png32";
	var imageParametersJpg = new esri.layers.ImageParameters();
	imageParametersJpg.format = "jpg";
	
	var imageServiceParams = new esri.layers.ImageServiceParameters();
	imageServiceParams.interpolation = esri.layers.ImageServiceParameters.INTERPOLATION_BILINEAR;
	
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
	new esri.layers.ArcGISTiledMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/dem_hillshades_mosaic/MapServer", {	
		id: "DEM Hillshades",
		visible: false,
		opacity: 1
	}),	
	new esri.layers.ArcGISTiledMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/bag_hillshades/MapServer", {
	 	id: "BAG Hillshades",
	 	visible: false
	}),	
	new esri.layers.ArcGISImageServiceLayer("http://egisws02.nos.noaa.gov/ArcGIS/rest/services/RNC/NOAA_RNC/ImageServer", {
	 	id: "RNC",
	 	visible: false,
	 	opacity: 0.5,
		imageServiceParameters: imageServiceParams
	}),	
	new esri.layers.ArcGISTiledMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/trackline_bathymetry/MapServer", {
		id: "Trackline Bathymetry (tiled)",
		visible: false,
		opacity: 1
	}),
	new esri.layers.ArcGISDynamicMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/trackline_combined_dynamic/MapServer", {
	 	id: "Trackline Bathymetry (dynamic)",
	 	visible: false,
	 	opacity: 1,
	 	imageParameters: imageParametersPng32
	}),
	new esri.layers.ArcGISDynamicMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/nos_hydro_dynamic/MapServer", {
	 	id: "NOS Hydro Non-Digital",
	 	visible: false,
	 	opacity: 0.9,
	 	imageParameters: imageParametersPng32
	}),
	new esri.layers.ArcGISTiledMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/nos_hydro/MapServer", {
	 	id: "NOS Hydro (tiled)",
	 	visible: false,
	 	opacity: 1
	}),
	new esri.layers.ArcGISDynamicMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/nos_hydro_dynamic/MapServer", {
	 	id: "NOS Hydro (dynamic)",
	 	visible: false,
	 	opacity: 1,
	 	imageParameters: imageParametersPng32
	}),	
	new esri.layers.ArcGISTiledMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/multibeam/MapServer", {
	 	id: "Multibeam (tiled)",
	 	visible: false,
	 	opacity: 1
	}),
	new esri.layers.ArcGISDynamicMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/multibeam_dynamic/MapServer", {
	 	id: "Multibeam (dynamic)",
	 	visible: false,
	 	opacity: 1,
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
		visible: false,
		opacity: 0.7,
		imageParameters: imageParametersPng32
	}),
	new esri.layers.ArcGISDynamicMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/dem_extents/MapServer", {
		id: "DEM Extents",
		visible: false,
		opacity: 1,
		imageParameters: imageParametersPng32
	})
	];
				
	return (globals.mapServices);
}

function initIdentify(){
	console.log('inside initIdentify...');
	var demAttributes = ['Name', 'Cell Size', 'Category', 'Source', 'Project', 'Vertical Datum', 'Status', 'Type', 'Coverage', 'Completion Date'];
	
	globals.demAppHost = "http://www.ngdc.noaa.gov/dem";	
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
			name: "NOS Hydrographic Surveys",
			service: mapServiceById('NOS Hydrographic Surveys'),
			displayOptions: {
				0: {
					layerAlias: "NOS Hydrographic Surveys with BAGs",
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
				1: {
					layerAlias: "NOS Hydrographic Surveys with Digital Sounding Data",
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
			id: "NOS Hydro Non-Digital",
			name: "NOS Hydro Non-Digital",
			service: mapServiceById('NOS Hydro Non-Digital'),
			displayOptions: {
				2: {
					layerAlias: "NOS Hydrographic Surveys without Digital Sounding Data",
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
			service: mapServiceById('Trackline Bathymetry'),
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
		lineSymbol: new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 255, 255]), 2),
		fillSymbol: new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([64, 64, 64, 1]), 2), new dojo.Color([0, 255, 255, 0.5])),
		geometryService: globals.geometryService
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
			checkbox: multibeamVisible,
			leaf: true,
			icon: 'blank'
		},
		{
			name: 'Trackline Bathymetry Surveys',
			service: 'Trackline Bathymetry',
			subLayers: [],
			type: 'item',
			checkbox: tracklineVisible,
			leaf: true,
			icon: 'blank'
		}, 
		{
			name: 'NOS Hydrographic Surveys',
			id: 'NOS Hydrographic Surveys',
			type: 'item',
			checkbox: nosHydroVisible,
			leaf: false,
			icon: 'folder',
			children: [
			{_reference: 'Surveys with Digital Sounding Data'}, 
			{_reference: 'Surveys with BAGs (Bathymetric Attributed Grids)'}, 
			{_reference: 'BAG Hillshades'},
			{_reference: 'Surveys without Digital Sounding Data'}] 
		}, 
		{
			name: 'Surveys with Digital Sounding Data',
			service: 'NOS Hydrographic Surveys',
			subLayers: [1],
			type: 'child',
			checkbox: nosHydroVisible,
			leaf: true,
			icon: 'blank'
		},
		{
			name: 'Surveys with BAGs (Bathymetric Attributed Grids)',
			service: 'NOS Hydrographic Surveys',
			subLayers: [0],
			type: 'child',
			checkbox: nosHydroVisible,
			leaf: true,
			icon: 'blank'
		},
		{
			name: 'Surveys without Digital Sounding Data',
			service: 'NOS Hydro Non-Digital',
			subLayers: [2],
			type: 'child',
			checkbox: nosHydroVisible,
			leaf: true,
			icon: 'blank'
		},
		{
			name: 'BAG Hillshades',
			service: 'BAG Hillshades',
			subLayers: [],
			type: 'child',
			checkbox: nosHydroVisible,
			leaf: true,
			icon: 'blank'
		},		
		{
			name: 'Digital Elevation Models',
			service: 'DEM Extents',
			subLayers: [12],
			type: 'item',
			checkbox: demVisible,
			leaf: true,
			icon: 'blank'
		},
		{
			name: 'DEM Hillshades',
			service: 'DEM Hillshades',
			subLayers: [],
			type: 'item',
			checkbox: demVisible,
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
	//var tree = new dijit.Tree({
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
			{services: [{id: 'RNC', subLayers: [3]}], label: 'NOAA Raster Nautical Charts', visible: false}
        ],		
        selectedBasemapIndex: 0
	});
		
	basemapToolbar.placeAt('basemapToolbar');
	basemapToolbar.startup();
	return(basemapToolbar);
}

//called on Map onLoad event
function mapInitializedCustom(theMap) {
	console.log('inside mapInitializedCustom...');
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
		
	if (!values.startYear && !values.endYear && !values.survey && !values.ship) {
		clearSelection();
		return;
	}
	
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
	mapServiceById('Trackline Bathymetry').setLayerDefinitions(allLayerDefinitions);
	
	
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
	allLayerDefinitions[2] = layerDefinitions;		
	mapServiceById('NOS Hydrographic Surveys').setLayerDefinitions(allLayerDefinitions);
	mapServiceById('NOS Hydro Non-Digital').setLayerDefinitions(allLayerDefinitions);	
		
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
		mapServiceById('Trackline Bathymetry').setLayerDefinitions([]);
		mapServiceById('NOS Hydrographic Surveys').setLayerDefinitions([]);
		mapServiceById('NOS Hydro Non-Digital').setLayerDefinitions([]);
		mapServiceById('DEM Extents').setLayerDefinitions([]);
	}
	dojo.byId('filterDiv').innerHTML = "<b>All Surveys</b>";
	globals.surveySelectDialog.reset(); //Reset to defaults in the Survey Select Dialog
	globals.isCleared = true;
}

//called after all layers added to map
function mapReadyCustom(theMap) {
	console.log('inside mapReadyCustom...');
	
	//construct PairedMapServiceLayers. Modifies the mapServiceList				
	new layers.PairedMapServiceLayer({
		id: "Multibeam",
		tiledServiceId: "Multibeam (tiled)",
		dynamicServiceId: "Multibeam (dynamic)",
		mapServiceList: globals.mapServices,
		visible: true,
		map: globals.map,
		cutoffZoom: 7 - globals.firstZoomLevel
	});
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
	new layers.PairedMapServiceLayer({
		id: "NOS Hydrographic Surveys",
		tiledServiceId: "NOS Hydro (tiled)",
		dynamicServiceId: "NOS Hydro (dynamic)",
		mapServiceList: globals.mapServices,
		visible: false,
		map: globals.map,
		cutoffZoom: 7 - globals.firstZoomLevel
	});
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
	
	mapServiceById('DEM Extents').setVisibleLayers([9999]); //Manually set all the sublayers to invisible for "DEM Extents"
	mapServiceById('NOS Hydrographic Surveys').setVisibleLayers([9999]); //Manually set all the sublayers to invisible for "NOS Hydro"
	mapServiceById('NOS Hydro Non-Digital').setVisibleLayers([9999]);
	
	//globals.geometryService = new esri.tasks.GeometryService("http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");//new esri.tasks.GeometryService("http://maps.ngdc.noaa.gov/rest/services/Geometry/GeometryServer");
	globals.geometryService = new esri.tasks.GeometryService("http://maps.ngdc.noaa.gov/arcgis/rest/services/Geometry/GeometryServer");
			
	initBasemapToolbar();	
	initTOC();
	initIdentify(theMap);
	
	globals.scalebar = new esri.dijit.Scalebar({map: globals.map, scalebarUnit: "metric"}, dojo.byId("scalebar"));
	globals.scalebar.hide(); // scalebar is hidden by default at small scales
	
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
	
	globals.surveySelectDialog = new survey_select.SurveySelectDialog({title: 'Search for Surveys'});
	
	dojo.subscribe("/survey_select/SurveySelectDialog", dialogHandler);
}
