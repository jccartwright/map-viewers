globals.scalebarZoomEnabled = 0;

//set the initial extent. may be overridden with request parameters
globals.initialExtentString = {
	"xmin":-3000000,
	"ymin":-3000000,
	"xmax":3000000,
	"ymax":3000000,
	"spatialReference":{"wkid":3031}
};

//define the function getInitialExtent to override default behavior
getInitialExtent = function(){
	globals.srid = 3031;
	return new esri.geometry.Extent(globals.initialExtentString);
};

//Setup Proj4js parameters
globals.sourceProj = new Proj4js.Proj('EPSG:3031');
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

function getMapServiceList(){
	var imageParametersPng32 = new esri.layers.ImageParameters();
	imageParametersPng32.format = "png32";
	var imageParametersJpg = new esri.layers.ImageParameters();
	imageParametersJpg.format = "jpg";
	
	var imageServiceParams = new esri.layers.ImageServiceParameters();
	imageServiceParams.interpolation = esri.layers.ImageServiceParameters.INTERPOLATION_BILINEAR;
	
	globals.mapServices = [	
	new esri.layers.ArcGISTiledMapServiceLayer(globals.publicAgsHost + "/rest/services/antarctic/antarctic_basemap/MapServer", {
		id: "Antarctic Basemap Overview",
		visible: true
	}),
	new esri.layers.ArcGISTiledMapServiceLayer(globals.publicAgsHost + "/rest/services/antarctic/antarctic_basemap/MapServer", {
		id: "Antarctic Basemap",
		visible: true
	}),
	new esri.layers.ArcGISDynamicMapServiceLayer(globals.publicAgsHost + "/rest/services/antarctic/graticule/MapServer", {
		id: "Graticule",
		visible: true,
		opacity: 0.7,
		imageParameters: imageParametersPng32
	}),
	new esri.layers.ArcGISDynamicMapServiceLayer(globals.publicAgsHost + "/rest/services/antarctic/reference/MapServer", {
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
			{services: [{id: 'Antarctic Basemap'}], label: 'Shaded Relief (IBCSO/GEBCO_08)', boundariesEnabled: true}
        ],          
        overlays: [
			{services: [{id: 'Reference'}], label: 'Boundaries/Labels', visible: false},
			{services: [{id: 'Graticule'}], label: 'Graticule', visible: true}
        ],		
        selectedBasemapIndex: 0
	});
	basemapToolbar.placeAt('basemapToolbar');
	basemapToolbar.startup();
	return(basemapToolbar);
}

function addFeatureLayers() {
	//FeatureLayer used for displaying lines every 2 degrees. Visible at all scales.
	globals.linesLayer = new esri.layers.FeatureLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/historical_declination/MapServer/4", {
		id: 'Isogonic Lines',
        mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
        outFields: ["CONTOUR"],
        tileHeight: 2048,
        tileWidth: 2048,
        visible: false
    });
	//FeatureLayer used for displaying intermediate lines, every 1 degree. Visible at larger scales
	globals.linesLayer2 = new esri.layers.FeatureLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/historical_declination/MapServer/4", {
		id: 'Isogonic Lines2',
        mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
        outFields: ["CONTOUR"],
        tileHeight: 2048,
        tileWidth: 2048,
        visible: false
        //TODO: set the visible scale for this layer. Only available in v3.1 of the API
    });
    globals.spLayer = new esri.layers.FeatureLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/historical_declination/MapServer/1", {
    	id: 'South Pole',
        mode: esri.layers.FeatureLayer.MODE_SNAPSHOT,
        visible: false
    });
    globals.npLayer = null;
    globals.map.addLayer(globals.linesLayer);
    globals.map.addLayer(globals.linesLayer2);
	globals.map.addLayer(globals.spLayer);
}