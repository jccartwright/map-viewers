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
dojo.require("marine_geology.CreditsPanel");
dojo.require("simple_basemap_toolbar.SimpleBasemapToolbar");
dojo.require("banner.Banner");
dojo.require("identify.Identify");
//dojo.require('dojo.io.script');
//dojo.require("dijit.form.FilteringSelect");
dojo.require("dijit.ToolbarSeparator");
dojo.require('layers.PairedMapServiceLayer');
dojo.require('bboxDialog.BoundingBoxDialog');
dojo.require("dojox.widget.Toaster");
dojo.require("checkBoxTreeTOC.CheckBoxTree");

var globals = {}; //container for global variables

globals.debug = false;
globals.mapConfigLoaded = true;
globals.scalebarZoomEnabled = 3;

globals.publicAgsHost = "http://maps.ngdc.noaa.gov/arcgis";
globals.privateAgsHost = "http://agsdevel.ngdc.noaa.gov:6080/arcgis";
globals.arcgisOnlineHost = "http://server.arcgisonline.com/ArcGIS";

//set the initial extent. may be overridden with request parameters
globals.initialExtentString = {
	"xmin": -179.9,
	"ymin": -70,
	"xmax": 179.9,
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
			{url: 'http://www.ngdc.noaa.gov/mgg/geology/geology.html', label: 'Marine Geology'}			
		],
		dataUrl: "http://www.ngdc.noaa.gov/mgg/geology/geology.html",
		image: "/images/MarineGeologyRight.gif"
	});
	mybanner.placeAt('banner');

	//create the dialog
	globals.coordDialog = new bboxDialog.BoundingBoxDialog({title:'Specify an Area of Interest', style: 'width:300px;'});
	
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
	new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer", {
		id: "NatGeo Overview",
		visible: false
	}), 	
	new esri.layers.ArcGISTiledMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/gebco08_hillshade/MapServer", {
	 	id: "GEBCO_08",
	 	visible: false
	}),
	new esri.layers.ArcGISTiledMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/etopo1_hillshade/MapServer", {
	 	id: "ETOPO1",
	 	visible: false
	}),
	new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer", {
	 	id: "Light Gray",
	 	visible: false
	}),	
	new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer", {
		id: "World Imagery",
		visible: false
	}),
	new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer", {
	 	id: "NatGeo Basemap",
	 	visible: false
	}),
	new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer", {
		id: "Ocean Basemap",
		visible: false
	}),
	new esri.layers.ArcGISTiledMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/dem_hillshades_mosaic/MapServer", {	
		id: "DEM Hillshades",
		visible: false
	}),
	new esri.layers.ArcGISTiledMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/marine_geology/MapServer", {
	 	id: "Datasets/Reports (tiled)",
	 	visible: false
	}),
	new esri.layers.ArcGISDynamicMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/marine_geology_dynamic/MapServer", {
	 	id: "Datasets/Reports (dynamic)",
	 	visible: false,
	 	imageParameters: imageParametersPng32
	}),
	new esri.layers.ArcGISTiledMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/sample_index/MapServer", {
	 	id: "Sample Index (tiled)",
	 	visible: false
	}),
	new esri.layers.ArcGISDynamicMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/sample_index_dynamic/MapServer", {
	 	id: "Sample Index (dynamic)",
	 	visible: false,
	 	imageParameters: imageParametersPng32
	}),
	new esri.layers.ArcGISTiledMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/nos_seabed/MapServer", {
	 	id: "NOS Seabed Descriptions (tiled)",
	 	visible: false
	}),
	new esri.layers.ArcGISDynamicMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/nos_seabed_dynamic/MapServer", {
	 	id: "NOS Seabed Descriptions (dynamic)",
	 	visible: false,
	 	imageParameters: imageParametersPng32
	}),
	new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer", {
	 	id: "World Boundaries and Places",
	 	visible: false
	}),
	new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer", {
	 	id: "Light Gray Reference",
	 	visible: false
	}),
	new esri.layers.ArcGISDynamicMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/graticule/MapServer", {
		id: "Graticule",
		visible: false,
		opacity: 0.7,
		imageParameters: imageParametersPng32
	})
	];
				
	return (globals.mapServices);
}

function initIdentify(){
	//console.log('inside initIdentify...');

	var sampleIndexAttributes = [ 'Data Link', 'Repository', 'Platform',
			'Cruise or Leg', 'Alternate Cruise or Leg', 'Sample ID', 'Device',
			'Date Collected', 'End Date of Collection', 'Latitude',
			'Longitude', 'End Latitude', 'End Longitude', 'Water Depth (m)',
			'End Water Depth (m)', 'Storage Method', 'Core Length (cm)',
			'Core Diameter (cm)', 'PI', 'Province', 'Lake',
			'Date Information Last Updated', 'IGSN', 'Sample Comments', 'IMLGS' ];

	var sampleIndexFieldUrls = {
		'Data Link' : {
			prefix : '',
			postfix : '',
			linkText : 'Data and Images'
		},
		'Cruise or Leg' : {
			prefix : 'http://www.ngdc.noaa.gov/geosamples/leg.jsp?leg=',
			postfix : ''
		},
		'Alternate Cruise or Leg' : {
			prefix : 'http://www.ngdc.noaa.gov/geosamples/leg.jsp?leg=',
			postfix : ''
		},
		'Repository' : {
			prefix : 'http://www.ngdc.noaa.gov/geosamples/displayfacility.jsp?fac=',
			postfix : ''
		}
	};
	
	globals.identifyDijit = new identify.Identify({
		map: globals.map,
		label: "Identify",
		defaultTolerance: 2,
		showGetDataButton: false,
		mapServices: [
		{
			id: "Sample Index",
			service: mapServiceById('Sample Index'),
			name: "Sample Index",
			displayOptions: {
				0: {
					layerAlias: "Sample Index",
					attributes: sampleIndexAttributes,
					fieldUrls: sampleIndexFieldUrls,
					visible: false,
					displayFieldNames: ['Cruise or Leg', 'Sample ID', 'Device', 'Repository'],
					displayFieldDelimiters: {
						'Cruise or Leg': ':',
						'Sample ID': ':',
						'Device': ' (',
						'Repository': ')'
					}
				}
			},
			sortFunction: function(a, b) {
				//Sort by Cruise, Sample ID, Device				
				if (a.feature.attributes['Cruise or Leg'] == b.feature.attributes['Cruise or Leg']) {
					if (a.feature.attributes['Sample ID'] == b.feature.attributes['Sample ID']) {
						return a.feature.attributes['Device'] <= b.feature.attributes['Device'] ? -1 : 1;
					}
					return a.feature.attributes['Sample ID'] <= b.feature.attributes['Sample ID'] ? -1 : 1;
				}
				return a.feature.attributes['Cruise or Leg'] <= b.feature.attributes['Cruise or Leg'] ? -1 : 1;				
			}
		},
		{
			id: "Datasets/Reports",
			service: mapServiceById('Datasets/Reports'),
			name: "Datasets/Reports",
			displayOptions: {
				0: {
					layerAlias: "Datasets/Reports",
					displayFieldName: 'Dataset Title',
					attributes: ['Dataset Title', 'MGGID', 'Cruise', 'Platform', 'Hole/Sample ID', 'Device', 'Collection Date', 'Latitude', 'Longitude', 'Metadata gov.noaa.ngdc.mgg:'],
					fieldUrls: {
						'Dataset Title': {
							prefix: 'http://www.ngdc.noaa.gov/nndc/struts/results?op_28=eq&v_28=',
							urlField: 'MGGID',
							postfix: '&t=101477&s=1&d=2'
						},
						'Metadata gov.noaa.ngdc.mgg:': {
							prefix: 'http://www.ngdc.noaa.gov/geosamples/metadata.jsp?g=',
							postfix: ''
						}	
					}
				}
			},
			sortFunction: function(a, b) {				
				return a.feature.attributes['MGGID'] <= b.feature.attributes['MGGID'] ? -1 : 1;																											
			}				
		},	
		{
			id: "NOS Seabed Descriptions",
			service: mapServiceById('NOS Seabed Descriptions'),
			name: "NOS Seabed Descriptions",
			displayOptions: {
				0: {
					displayFieldNames: ['NOS Survey ID', 'Sample ID'],
					displayFieldDelimiters: {
						'NOS Survey ID': ' (Sample: ',
						'Sample ID': ')'
					},
					layerAlias: "NOS Seabed Descriptions",
					attributes: ['NOS Survey ID', 'Sample ID', 'Latitude', 'Longitude', 'Begin Observation Time', 'Description', 'Color',
					             'Nature of the Surface', 'Qualifying Terms', 'Data Source'],
					fieldUrls: {
						'NOS Survey ID': {
							prefix: 'http://www.ngdc.noaa.gov/nndc/struts/results?op_0=eq&t=101523&s=3&d=5&d=8&d=23&d=10&d=26&d=29&d=40&d=41&d=24&d=11&d=9&d=28&d=12&d=13&d=14&d=15&d=16&d=17&d=18&d=20&d=21&d=19&no_data=suppress&v_0=',
							urlField: 'NOS Survey ID',
							postfix: ''
						}	
					}
				}
			},
			sortFunction: function(a, b) { //Sort by NOS Survey ID, then Sample ID within surveys
				if (a.feature.attributes['NOS Survey ID'] == b.feature.attributes['NOS Survey ID']) {					
					return a.feature.attributes['Sample ID'] <= b.feature.attributes['Sample ID'] ? -1 : 1;
				}
				return a.feature.attributes['NOS Survey ID'] <= b.feature.attributes['NOS Survey ID'] ? -1 : 1;		
			}
		}	
		],
		lineSymbol: new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 255, 0]), 2),
		fillSymbol: new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([64, 64, 64, 1]), 2), new dojo.Color([255, 255, 0, 0.3])),
		geometryService: globals.geometryService
	});
	globals.identifyDijit.startup();
}


function initTOC(layer0Visible, layer1Visible, layer2Visible){
	var tocData = {
		identifier: 'name',
		label: 'name',
		items: [ 
		{
			name: 'Datasets/Reports',
			service: 'Datasets/Reports',
			subLayers: [],
			type: 'item',
			checkbox: layer0Visible,
			leaf: true,
			icon: 'blank'
		},
		{
			name: 'Sample Index',
			service: 'Sample Index',
			subLayers: [],
			type: 'item',
			checkbox: layer1Visible,
			leaf: true,
			icon: 'blank'
		},
		{
			name: 'NOS Seabed Descriptions',
			service: 'NOS Seabed Descriptions',
			subLayers: [],
			type: 'item',
			checkbox: layer2Visible,
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
			{services: [{id: 'DEM Hillshades'}], label: 'U.S. Coastal Shaded Relief', visible: false}
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

//called after all layers added to map
function mapReadyCustom(theMap) {
	console.log('inside mapReadyCustom...');
	
	//construct PairedMapServiceLayers. Modifies the mapServiceList				
	new layers.PairedMapServiceLayer({
		id: "Datasets/Reports",
		tiledServiceId: "Datasets/Reports (tiled)",
		dynamicServiceId: "Datasets/Reports (dynamic)",
		mapServiceList: globals.mapServices,
		visible: false,
		map: globals.map,
		cutoffZoom: 7 - globals.firstZoomLevel
	});	
	new layers.PairedMapServiceLayer({
		id: "Sample Index",
		tiledServiceId: "Sample Index (tiled)",
		dynamicServiceId: "Sample Index (dynamic)",
		mapServiceList: globals.mapServices,
		visible: false,
		map: globals.map,
		cutoffZoom: 8 - globals.firstZoomLevel
	});	
	new layers.PairedMapServiceLayer({
		id: "NOS Seabed Descriptions",
		tiledServiceId: "NOS Seabed Descriptions (tiled)",
		dynamicServiceId: "NOS Seabed Descriptions (dynamic)",
		mapServiceList: globals.mapServices,
		visible: false,
		map: globals.map,
		cutoffZoom: 10 - globals.firstZoomLevel
	});		
		
	//globals.geometryService = new esri.tasks.GeometryService("http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");//new esri.tasks.GeometryService("http://maps.ngdc.noaa.gov/rest/services/Geometry/GeometryServer");
	globals.geometryService = new esri.tasks.GeometryService("http://maps.ngdc.noaa.gov/rest/services/Geometry/GeometryServer");
	
	var layer0Visible = false;
	var layer1Visible = false;
	var layer2Visible = false;
	var queryParams = dojo.queryToObject(window.location.search.slice(1));
	var visibleLayers = [];
	if (queryParams.layers) {
		visibleLayers = queryParams.layers.split(',');		
	}
	if (dojo.indexOf(visibleLayers, '0') != -1) {
		layer0Visible = true;
	}
	if (dojo.indexOf(visibleLayers, '1') != -1) {
		layer1Visible = true;
	}
	if (dojo.indexOf(visibleLayers, '2') != -1) {
		layer2Visible = true;
	}
			
	initBasemapToolbar();	
	initTOC(layer0Visible, layer1Visible, layer2Visible);
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
	
	globals.legend = new esri.dijit.Legend({map:globals.map,
		layerInfos:[
			{layer:mapServiceById('Datasets/Reports')._tiledService, title: "Datasets/Reports"},
			{layer:mapServiceById('Datasets/Reports')._dynamicService, title: "Datasets/Reports"},
			{layer:mapServiceById('Sample Index')._tiledService, title: "Sample Index"},
			{layer:mapServiceById('Sample Index')._dynamicService, title: "Sample Index"}
		]}, "legend");
	globals.legend.startup();
	
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