dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.AccordionContainer");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dojox.grid.DataGrid");
dojo.require("dojox.grid.EnhancedGrid");
//dojo.require("dojox.grid.enhanced.plugins.Filter");
dojo.require("dojox.grid.enhanced.plugins.IndirectSelection");

dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dijit.Toolbar");
dojo.require("dijit.form.Button");
dojo.require('dojo.io.script');
dojo.require("dijit.form.FilteringSelect");
dojo.require("dijit.ToolbarSeparator");
dojo.require("dojo.string");
dojo.require("dojox.widget.Toaster");
dojo.require("esri.map");
dojo.require("esri.dijit.OverviewMap");
//dojo.require("esri.dijit.Scalebar");
dojo.require("esri.dijit.Legend");
dojo.require("esri.layers.wms");
dojo.require("help_panel.HelpPanel");
dojo.require("simple_basemap_toolbar.SimpleBasemapToolbar");
//		dojo.require("banner.Banner");
//		dojo.require('layers.PairedMapServiceLayer');
		//TODO define w/in the dialog
dojo.require('bboxDialog.BoundingBoxDialog');
dojo.require('gcv4.CreditsPanel');
dojo.require('gcv4.WCSPanel');
dojo.require("dijit.Dialog");


//console.log('loading mapConfig...');

var globals = {}; //container for global variables
globals.mapConfigLoaded = false;

globals.debug = false;

//set the initial extent. may be overridden with request parameters
globals.initialExtentString = {
	"xmin":-126,
	"ymin":24,
	"xmax":-65,
	"ymax":49,
	"spatialReference":{"wkid":4326}
};

//define the function getInitialExtent to override default behavior

//define globals.lods to override default behavior

//Set to the index of the first enabled zoom level. Should be set to 3 for new ESRI jsapi
//TODO: clarify?
globals.zoomModifier = 3;

globals.srid = 4326;

globals.lods = [
{"level": 0, "resolution": 0.3515625,         "scale": 147748799.285417},
{"level": 1, "resolution": 0.17578125,        "scale": 73874399.6427087},
{"level": 2, "resolution": 0.087890625,       "scale": 36937199.8213544},
{"level": 3, "resolution": 0.0439453125,      "scale": 18468599.9106772},
{"level": 4, "resolution": 0.02197265625,     "scale": 9234299.95533859},
{"level": 5, "resolution": 0.010986328125,    "scale": 4617149.97766929},
{"level": 6, "resolution": 0.0054931640625,   "scale": 2308574.98883465},
{"level": 7, "resolution": 0.00274658203125,  "scale": 1154287.49441732},
{"level": 8, "resolution": 0.001373291015625, "scale": 577143.747208662}
];


//mandatory lifecycle methods
//called just before common initialization
function preInit() {
	if (globals.debug) { console.log("inside preInit..."); }

	globals.imageStore = new dojo.data.ItemFileReadStore({url: "images.json"});
	dijit.byId('searchResults').setStore(globals.imageStore);	
	dojo.connect(dijit.byId('searchResults'),'onRowClick', rowClickHandler);
	dojo.connect(dijit.byId('searchResults'),'onRowDblClick', rowClickHandler);
	
	//TODO build years, satellite, product lists dynamically
	globals.satelliteStore = new dojo.data.ItemFileReadStore({url: "satellites.json"});
	globals.productStore = new dojo.data.ItemFileReadStore({url: "products.json"});
	globals.yearStore = new dojo.data.ItemFileReadStore({url: "years.json"});
	
	dijit.byId('satelliteSelect').store = globals.satelliteStore;
	dijit.byId('satelliteSelect').setValue('All Satellites');
	dijit.byId('yearSelect').store = globals.yearStore;
	dijit.byId('yearSelect').setValue('All Years');
	dijit.byId('productSelect').store = globals.productStore;
	dijit.byId('productSelect').setValue('All Products');
	dojo.connect(dijit.byId('satelliteSelect'), "onChange", filterTable);
	dojo.connect(dijit.byId('yearSelect'), "onChange", filterTable);
	dojo.connect(dijit.byId('productSelect'), "onChange", filterTable);

	dojo.connect(dijit.byId('slider'), 'onChange', function(value) {
		value = value / 100;  //opacity ranges from 0 to 1
		if (globals.wmsLayer) {
			globals.wmsLayer.setOpacity(value);
		} else {
			console.warn('WMS Layer has not been set');
		}
	});
	
	//create the dialog
	globals.coordDialog = new bboxDialog.BoundingBoxDialog({title:'Specify an Area of Interest', style: 'width:300px;'}); 
}


//called after common initialization
function postInit() {
	if (globals.debug) { console.log("inside postInit..."); }

	dojo.connect(globals.map,'onExtentChange',function(extent){
		//convert to geo
		//TODO currently assumes web_mercator
		var geoExtent = esri.geometry.webMercatorToGeographic(extent);
				
		//publish new event
		dojo.publish('/extent/change',[geoExtent]);
	});

	
	dojo.subscribe('/ngdc/BoundingBoxDialog', this, function(data) {
		var geometry = new esri.geometry.Extent(data.minx, data.miny, data.maxx, data.maxy, new esri.SpatialReference({wkid: 4326}));
		addToMap(geometry);
		globals.map.setExtent(geometry, true);
	});
	//globals.downloadDialog = new dijit.Dialog({title:'Download Image'},'downloadDialogNode');
	//globals.downloadDialog.startup();
}


function getMapServiceList(){
	if (globals.debug) {console.log('inside getMapServiceList...'); }
	
	var imageParametersPng32 = new esri.layers.ImageParameters();
	imageParametersPng32.format = "png32";
	var imageParametersJpg = new esri.layers.ImageParameters();
	imageParametersJpg.format = "jpg";
	
	globals.mapServices = [
	new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/ESRI_StreetMap_World_2D/MapServer", {
		id: "Street Map",
		visible: false,
		opacity: 1
	}), 
	new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/ESRI_Imagery_World_2D/MapServer", {
		id: "Imagery",
		visible: false,
		opacity: 1
	}),
	new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/ESRI_ShadedRelief_World_2D/MapServer", {
		id: "Shaded Relief",
		visible: false,
		opacity: 1
	}),	 
	new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/rest/services/web_mercator/graticule/MapServer", {
		id: "Graticule",
		visible: true,
		opacity: 0.5,
		imageParameters: imageParametersPng32
	})];
	
	return (globals.mapServices);
}


function initBasemapToolbar() {
	if (globals.debug) { console.log('inside initBasemapToolbar...'); }
	
	var basemapToolbar = new simple_basemap_toolbar.SimpleBasemapToolbar({
		overlays: [null,globals.mapServices[3]],
		basemaps: [globals.mapServices[2],globals.mapServices[0],globals.mapServices[1]],
		basemapText: ['Terrain','Political','Imagery'],
        selectedBasemapIndex: 1
	});
	basemapToolbar.placeAt('basemapToolbar');
	basemapToolbar.startup();
	return(basemapToolbar);
}


//called on Map onLoad event
function mapInitializedCustom(theMap) {
	if (globals.debug) { console.log('inside mapInitializedCustom...'); }
}

//called after all layers added to map
function mapReadyCustom(theMap) {
	if (globals.debug) { console.log('inside mapReadyCustom...'); }
	
	//construct PairedMapServiceLayers. Modifies the mapServiceList				
}

/*
 * Application-specific functions
 */
function filterTable() {
	//console.log('inside filterTable...');
	var satellite = dijit.byId("satelliteSelect").get('value');
	var year = dijit.byId("yearSelect").get('value');
	var product = dijit.byId("productSelect").get('value');

	var filter = {satellite: '*', year: '*', product: '*'}
	if (satellite !== 'All Satellites') {
		filter.satellite = satellite;
	}
	if (year !== 'All Years') {
		filter.year = year;
	}
	if (product !== 'All Products') {
		filter.product = product;
	}
	//console.log(filter);
	dijit.byId('searchResults').filter(filter,true);
}


function rowClickHandler(/*Event*/ e) {
	//console.log('inside rowClickHandler...');
	var filename = e.grid.getItem(e.rowIndex).filename[0];
	dojo.publish('/ngdc/imageSelected',[filename]);
	addWMSLayer(filename);
}

function doubleClickHandler(/*Event*/ e) {
	//console.log('inside doubleClickHandler...');
	//var filename = e.grid.getItem(e.rowIndex).filename[0]
	//addWMSLayer(filename);
}

function radioBtnHandler(arg) {
	//console.log('inside radioBtnHandler with ',arg);
	dojo.publish('/ngdc/imageSelected',[arg]);
	addWMSLayer(arg);
}

function formatFilename(input) {
	var str = '<input type="radio" name="filename" onclick="radioBtnHandler(this.value);" class="filenameRadioBtn" value="'+input+'"/>';
	return(str);
}


function addWMSLayer(arg) {
	//console.log('inside addWMSLayer with ',arg);
	var opacity = dijit.byId('slider').get('value') / 100;

	//TODO show loading message
	
	var wmsURL = "https://gis.ngdc.noaa.gov/cgi-bin/public/gcv4?";

	if (globals.wmsLayer) {
		//stash the current layer so we can remove it when the new one is loaded
		globals.prevWmsLayer = globals.wmsLayer;
	}
	  			
	var layerInfo = new esri.layers.WMSLayerInfo({name:arg, title:arg});
	var resourceInfo = {
	  extent: new esri.geometry.Extent(-180,-65,180,75,{wkid: 4326}),
	  layerInfos: [layerInfo]
	}; 
	
	globals.wmsLayer = new esri.layers.WMSLayer(wmsURL,
		{resourceInfo: resourceInfo,
		visibleLayers: [arg]}
	);

	dojo.connect(globals.wmsLayer, "onUpdateStart", layerUpdateStarted);
	dojo.connect(globals.wmsLayer, "onUpdateEnd", layerUpdateCompleted);
	globals.wmsLayer.setOpacity(opacity);
	globals.map.addLayer(globals.wmsLayer);
	
}

function layerUpdateStarted(arg) {
	//TODO show loading
	//console.log("Update started...",arg);
} 

function layerUpdateCompleted(error) {
	if (error) {
		console.warn("Update completed with error: ", error);
		//TODO popup toaster
	}
	//console.log("Update completed...");
	if (globals.prevWmsLayer) {
		//console.log('removing WMS Layer ');
		//TODO disconnect any handlers from any previous WMSLayer?
		globals.map.removeLayer(globals.prevWmsLayer);
	}

	//TODO hide loading message
} 


//console.log('mapConfig loaded.');

globals.mapConfigLoaded = true;
