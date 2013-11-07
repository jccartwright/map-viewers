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
dojo.require("fishmaps.CreditsPanel");

var globals = {}; //container for global variables

globals.debug = false;
globals.mapConfigLoaded = true;
globals.scalebarZoomEnabled = 3;

globals.publicAgsHost = "http://maps.ngdc.noaa.gov/arcgis";
globals.privateAgsHost = "http://mapdevel.ngdc.noaa.gov:6080/arcgis";
globals.arcgisOnlineHost = "http://server.arcgisonline.com/ArcGIS";

//set the initial extent. may be overridden with request parameters
globals.initialExtentString = {
	"xmin":-126,
	"ymin":24,
	"xmax":-65,
	"ymax":49,
	"spatialReference":{"wkid":4326}
};

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
			{url: 'http://ngdc.noaa.gov/mgg/bathymetry/maps/nos_intro.html', label: 'U.S. Bathymetric and Fishing Maps'}			
		],
		dataUrl: "http://ngdc.noaa.gov/mgg/bathymetry/maps/nos_intro.html",
		image: "/images/fishmaps_viewer_logo.png"
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
	new esri.layers.ArcGISDynamicMapServiceLayer('http://maps.ngdc.noaa.gov/rest/services/web_mercator/fishmaps/MapServer', {
		id: "Fishmaps",
		imageParameters: imageParametersPng32,
		visible: true
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
	})
	];
				
	return (globals.mapServices);
}

function initIdentify(){
	console.log('inside initIdentify...');
	var attributes = ['Map Name', 'Type', 'NOAA Map Number', 'NOAA Map Number 2', 'NOAA Map Number 3', 'USGS Map Number', 'Year Compiled', 'Map Scale', 'Contour Unit', 'Format', 'Cost', 'North', 'South', 'West', 'East'];
	
	var fieldUrls = {
		'NOAA Map Number 2': {
			prefix: 'http://www.ngdc.noaa.gov/mgg/bathymetry/maps/previews/',
			urlField: 'NOAA Map Number 3',						
			postfix: '.pdf',
			linkText: 'PDF Preview'
		},
		'NOAA Map Number 3': {
			prefix: 'http://www.ngdc.noaa.gov/mgg/bathymetry/maps/finals/',
			urlField: 'NOAA Map Number 3',
			postfix: '',
			linkText: 'Full-Size Map Download'
		}	
	};
	var fieldAliases = {'NOAA Map Number 2': 'Preview', 'NOAA Map Number 3': 'Download'};
	
	globals.identifyDijit = new identify.Identify({
		map: globals.map,
		label: "Identify",
		defaultTolerance: 2,
		showGetDataButton: false,
		mapServices: [
		{
			id: "Fishmaps",
			name: "Fishmaps",
			service: mapServiceById('Fishmaps'),
			displayOptions: {
				0: {displayFieldName: 'Map Name', attributes: attributes, fieldUrls: fieldUrls, fieldAliases: fieldAliases, layerAlias: "Fishing Maps", visible: false},
				1: {displayFieldName: 'Map Name', attributes: attributes, fieldUrls: fieldUrls, fieldAliases: fieldAliases, layerAlias: "Topo/Bathy Maps", visible: false},
				2: {displayFieldName: 'Map Name', attributes: attributes, fieldUrls: fieldUrls, fieldAliases: fieldAliases, layerAlias: "Bathymetry Maps", visible: false},
				3: {displayFieldName: 'Map Name', attributes: attributes, fieldUrls: fieldUrls, fieldAliases: fieldAliases, layerAlias: "Preliminary Maps", visible: false}
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
		
	var tocData = {
		identifier: 'name',
		label: 'name',
		items: [ 
			{
				name: 'Fishing Maps',
				service: 'Fishmaps',
				subLayers: [0],
				type: 'item',
				checkbox: true,
				leaf: true,
				icon: 'blank'
			},
			{
				name: 'Topo/Bathy Maps',
				service: 'Fishmaps',
				subLayers: [1],
				type: 'item',
				checkbox: true,
				leaf: true,
				icon: 'blank'
			},	
			{
				name: 'Bathymetry Maps',
				service: 'Fishmaps',
				subLayers: [2],
				type: 'item',
				checkbox: true,
				leaf: true,
				icon: 'blank'
			},	
			{
				name: 'Preliminary Maps',
				service: 'Fishmaps',
				subLayers: [3],
				type: 'item',
				checkbox: true,
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
			{services: [{id: 'Graticule'}], label: 'Graticule', visible: false}
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
		
	//globals.geometryService = new esri.tasks.GeometryService("http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");//new esri.tasks.GeometryService("http://maps.ngdc.noaa.gov/rest/services/Geometry/GeometryServer");
	globals.geometryService = new esri.tasks.GeometryService("http://maps.ngdc.noaa.gov/arcgis/rest/services/Geometry/GeometryServer");
			
	initBasemapToolbar();	
	initTOC();
	initIdentify(theMap);
	
	globals.scalebar = new esri.dijit.Scalebar({map: globals.map, scalebarUnit: "metric"}, dojo.byId("scalebar"));
	globals.scalebar.show(); 
	
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
			{layer:mapServiceById('Fishmaps'), title: "U.S. Bathymetric and Fishing Maps"}
		]}, "legend");
	globals.legend.startup();
}
