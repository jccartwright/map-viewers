//set the initial extent. may be overridden with request parameters
globals.initialExtentString = {
	"xmin":-3000000,
	"ymin":-3000000,
	"xmax":3000000,
	"ymax":3000000,
	"spatialReference":{"wkid":3995}
};

//define the function getInitialExtent to override default behavior
getInitialExtent = function(){
	globals.srid = 3995; //Arctic Polar Stereographic
	return new esri.geometry.Extent(globals.initialExtentString);
};

//Setup Proj4js parameters
globals.sourceProj = new Proj4js.Proj('EPSG:3995');
globals.destProj = new Proj4js.Proj('EPSG:4326');

//define globals.lods to override default behavior
globals.lods = [ 
	//{"level": 0, "resolution": 67733.46880027094, "scale": 256000000},
	//{"level": 1, "resolution": 33866.73440013547, "scale": 128000000},
	{"level": 2, "resolution": 16933.367200067736, "scale": 64000000},
	{"level": 3, "resolution": 8466.683600033868, "scale": 32000000},
	{"level": 4,"resolution": 4233.341800016934,"scale": 16000000},
	{"level": 5,"resolution": 2116.670900008467,"scale": 8000000},
	{"level": 6,"resolution": 1058.3354500042335,"scale": 4000000},
	{"level": 7,"resolution": 529.1677250021168,"scale": 2000000},
	{"level": 8,"resolution": 264.5838625010584,"scale": 1000000}
];

globals.firstZoomLevel = 2;
globals.scalebarZoomEnabled = 0;

function getMapServiceList(){
    var imageParametersPng32 = new esri.layers.ImageParameters();
    imageParametersPng32.format = "png32";
    var imageParametersJpg = new esri.layers.ImageParameters();
    imageParametersJpg.format = "jpg";
    
    globals.mapServices = [
    new esri.layers.ArcGISTiledMapServiceLayer(globals.publicAgsHost + "/rest/services/arctic_ps/arctic_basemap/MapServer", {
		id: "Arctic Basemap Overview",
		visible: true
	}),
	new esri.layers.ArcGISTiledMapServiceLayer(globals.publicAgsHost + "/rest/services/arctic_ps/arctic_basemap/MapServer", {
		id: "Arctic Basemap",
		visible: false
	}),
	new esri.layers.ArcGISTiledMapServiceLayer(globals.publicAgsHost + "/rest/services/arctic_ps/ibcao_contours/MapServer", {
		id: "Contours",
		opacity: 0.5,
		visible: false
	}),
	new esri.layers.ArcGISTiledMapServiceLayer(globals.publicAgsHost + "/rest/services/arctic_ps/sample_index/MapServer", {
		id: "Sample Index (tiled)",
	 	visible: true,
		imageParameters: imageParametersPng32
	}),
	new esri.layers.ArcGISDynamicMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/sample_index_dynamic/MapServer", {
	 	id: "Sample Index (dynamic)",
	 	visible: false,
	 	imageParameters: imageParametersPng32
	}),
	new esri.layers.ArcGISDynamicMapServiceLayer(globals.publicAgsHost + "/rest/services/arctic_ps/clipping_donut/MapServer", {
		id: "Clipping Donut",
	 	visible: true,
		imageParameters: imageParametersPng32
	}),
	new esri.layers.ArcGISDynamicMapServiceLayer(globals.publicAgsHost + "/rest/services/arctic_ps/graticule/MapServer", {
		id: "Graticule",
		visible: true,
		opacity: 0.7,
		imageParameters: imageParametersPng32
	}),
	new esri.layers.ArcGISDynamicMapServiceLayer(globals.publicAgsHost + "/rest/services/arctic_ps/reference/MapServer", {
	 	id: "Reference",
	 	visible: false,
		imageParameters: imageParametersPng32
	})
    ];
            
    return (globals.mapServices);
}

function initBasemapToolbar() {
    //console.log('inside initBasemapToolbar...');
    var basemapToolbar = new simple_basemap_toolbar.SimpleBasemapToolbar({
        basemaps: [
			{services: [{id: 'Arctic Basemap'}], label: 'IBCAO/GEBCO_08 Shaded Relief', boundariesEnabled: true}
        ],          
        overlays: [
			{services: [{id: 'Reference'}], label: 'Boundaries/Labels', visible: false},
			{services: [{id: 'Graticule'}], label: 'Graticule', visible: true},
			{services: [{id: 'Contours'}], label: 'Bathymetric Contours', visible: false}            		
        ],
        selectedBasemapIndex: 0
    });
    basemapToolbar.placeAt('basemapToolbar');
    basemapToolbar.startup();
    return(basemapToolbar);
}

//called after all layers added to map
function mapReadyCustom(theMap) {
    console.log('inside mapReadyCustom...');
    
    //construct PairedMapServiceLayers. Modifies the mapServiceList    
	new layers.PairedMapServiceLayer({
        id: "Sample Index",
        tiledServiceId: "Sample Index (tiled)",
        dynamicServiceId: "Sample Index (dynamic)",
        mapServiceList: globals.mapServices,
        visible: false,
        map: globals.map,
        cutoffZoom: 8
    });
    
    initBasemapToolbar();
	initIdentify();
	
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
		
	//Get the optional 'institutions' param from the queryString
	var queryParams = dojo.queryToObject(window.location.search.slice(1));
	if (queryParams.institution) {
		var visibleInst = queryParams.institution;
		dijit.byId(visibleInst).set('checked', true);
		selectInstitution(visibleInst);
	}
	else {
		selectInstitution('AllInst');
	}
	
	mapServiceById('Sample Index').show();
}