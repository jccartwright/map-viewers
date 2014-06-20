dojo.require("esri.map");
dojo.require("esri.dijit.OverviewMap");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.AccordionContainer");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.Toolbar");
dojo.require("dijit.form.Button");
dojo.require("esri.dijit.OverviewMap");
dojo.require("esri.dijit.Scalebar");
dojo.require("help_panel.HelpPanel");
dojo.require("simple_basemap_toolbar.SimpleBasemapToolbar");
dojo.require("banner.Banner");
globals.scalebarZoomEnabled = 3;

globals.srid = 3857;

//set the initial extent. may be overridden with request parameters
globals.initialExtentString = {
    "xmin": -340,
    "ymin": -70,
    "xmax": 20,
    "ymax": 70,
    "spatialReference":{"wkid":4326}
};

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
        visible: false,
        opacity: 1
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
    new esri.layers.ArcGISTiledMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/gebco08_contours/MapServer", {
		id: "Contours",
		opacity: 0.5,
		visible: false
	}),
    new esri.layers.ArcGISTiledMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/sample_index/MapServer", {
        id: "Sample Index (tiled)",
        visible: false,
		imageParameters: imageParametersPng32
    }),
    new esri.layers.ArcGISDynamicMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/sample_index_dynamic/MapServer", {
        id: "Sample Index (dynamic)",
        visible: false,
        imageParameters: imageParametersPng32
    }),
    new esri.layers.ArcGISDynamicMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/poles_mask/MapServer", {
        id: "Poles Mask",
        visible: true,
        imageParameters: imageParametersPng32
    }),
    new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer", {
	 	id: "World Boundaries and Places",
	 	visible: false,
	}),
	new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer", {
	 	id: "Light Gray Reference",
	 	visible: false
	}),
    new esri.layers.ArcGISDynamicMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/graticule/MapServer", {
        id: "Graticule",
        visible: false,
        opacity: 0.5,
        imageParameters: imageParametersPng32
    })
    ];
            
    return (globals.mapServices);
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
			{services: [{id: 'DEM Hillshades'}], label: 'U.S. Coastal Shaded Relief', visible: false},
			{services: [{id: 'Contours'}], label: 'Bathymetric Contours (GEBCO_08)', visible: false}
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
        
	new layers.PairedMapServiceLayer({
        id: "Sample Index",
        tiledServiceId: "Sample Index (tiled)",
        dynamicServiceId: "Sample Index (dynamic)",
        mapServiceList: globals.mapServices,
        visible: false,
        map: globals.map,
        cutoffZoom: 8 - globals.firstZoomLevel
    });
	            
    initBasemapToolbar();
	initIdentify();
	
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