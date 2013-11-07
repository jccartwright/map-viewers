globals.scalebarZoomEnabled = 3;

//set the initial extent.
globals.initialExtentString = {
	"xmin": -179.9,
	"ymin": -70,
	"xmax": 179.9,
	"ymax": 70,
	"spatialReference":{"wkid":4326}
};

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
		visible: false
	}),
	new esri.layers.ArcGISTiledMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/gebco08_hillshade/MapServer", {
		id: "GEBCO_08",
		opacity: 0.7,
		visible: false
	}),
	new esri.layers.ArcGISTiledMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/etopo1_hillshade/MapServer", {
		id: "ETOPO1",
		opacity: 0.5,
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


function initBasemapToolbar() {
	//console.log('inside initBasemapToolbar...');
	
	var basemapToolbar = new simple_basemap_toolbar.SimpleBasemapToolbar({
		basemaps: [
			{services: [{id: 'GEBCO_08'}], label: 'Shaded Relief (GEBCO_08)', boundariesEnabled: true},
			{services: [{id: 'ETOPO1'}], label: 'Shaded Relief (ETOPO1)', boundariesEnabled: true},
			{services: [{id: 'Ocean Basemap'}], label: 'Ocean Basemap (Esri)', boundariesEnabled: false},   
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

function addFeatureLayers() {
	//FeatureLayer used for displaying lines every 2 degrees. Visible at all scales.
	globals.linesLayer = new esri.layers.FeatureLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/historical_declination/MapServer/2", {
		id: 'Isogonic Lines',
        mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
        outFields: ["CONTOUR"],
        tileHeight: 2048,
        tileWidth: 2048,
        visible: false
    });
	//FeatureLayer used for displaying intermediate lines, every 1 degree. Visible at larger scales
	globals.linesLayer2 = new esri.layers.FeatureLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/historical_declination/MapServer/2", {
		id: 'Isogonic Lines2',
        mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
        outFields: ["CONTOUR"],
        tileHeight: 2048,
        tileWidth: 2048,
        visible: false
        //TODO: set the visible scale for this layer. Only available in v3.1 of the API
    });
    globals.npLayer = new esri.layers.FeatureLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/historical_declination/MapServer/0", {
    	id: 'North Pole',
        mode: esri.layers.FeatureLayer.MODE_SNAPSHOT,
        visible: false
    });
    globals.spLayer = new esri.layers.FeatureLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/historical_declination/MapServer/1", {
    	id: 'South Pole',
    	mode: esri.layers.FeatureLayer.MODE_SNAPSHOT,
    	visible: false
    });
    globals.map.addLayer(globals.linesLayer);
    globals.map.addLayer(globals.linesLayer2);
	globals.map.addLayer(globals.npLayer);
	globals.map.addLayer(globals.spLayer);
}



