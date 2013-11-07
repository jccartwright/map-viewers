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
	new esri.layers.ArcGISTiledMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/trackline_all_parameters/MapServer", {
	 	id: "All Parameters (tiled)",
	 	visible: false,
	 	opacity: 1
	}),
	new esri.layers.ArcGISDynamicMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/trackline_combined_dynamic/MapServer", {
	 	id: "All Parameters (dynamic)",
	 	visible: false,
	 	opacity: 1,
	 	imageParameters: imageParametersPng32
	}),	
	new esri.layers.ArcGISTiledMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/trackline_bathymetry/MapServer", {
	 	id: "Bathymetry (tiled)",
	 	visible: false,
	 	opacity: 1
	}),
	new esri.layers.ArcGISDynamicMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/trackline_combined_dynamic/MapServer", {
	 	id: "Bathymetry (dynamic)",
	 	visible: false,
	 	opacity: 1,
	 	imageParameters: imageParametersPng32
	}),
	new esri.layers.ArcGISTiledMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/trackline_gravity/MapServer", {
	 	id: "Gravity (tiled)",
	 	visible: false,
	 	opacity: 1
	}),
	new esri.layers.ArcGISDynamicMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/trackline_combined_dynamic/MapServer", {
	 	id: "Gravity (dynamic)",
	 	visible: false,
	 	opacity: 1,
	 	imageParameters: imageParametersPng32
	}),
	new esri.layers.ArcGISTiledMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/trackline_magnetics/MapServer", {
	 	id: "Magnetics (tiled)",
	 	visible: false,
	 	opacity: 1
	}),
	new esri.layers.ArcGISDynamicMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/trackline_combined_dynamic/MapServer", {
	 	id: "Magnetics (dynamic)",
	 	visible: false,
	 	opacity: 1,
	 	imageParameters: imageParametersPng32
	}),	
	new esri.layers.ArcGISTiledMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/trackline_single_channel_seismics/MapServer", {
	 	id: "Single Channel Seismics (tiled)",
	 	visible: false,
	 	opacity: 1
	}),
	new esri.layers.ArcGISDynamicMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/trackline_combined_dynamic/MapServer", {
	 	id: "Single Channel Seismics (dynamic)",
	 	visible: false,
	 	opacity: 1,
	 	imageParameters: imageParametersPng32
	}),
	new esri.layers.ArcGISDynamicMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/trackline_combined_dynamic/MapServer", {
	 	id: "Trackline Combined",
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
		visible: true,
		opacity: 0.7,
		imageParameters: imageParametersPng32
	})
	];
	
	globals.firstTracklineServiceIndex = 7;
	globals.lastTracklineServiceIndex = 12;
				
	return (globals.mapServices);
}


function initBasemapToolbar() {
	//console.log('inside initBasemapToolbar...');
	var basemapToolbar = new simple_basemap_toolbar.SimpleBasemapToolbar({
		basemaps: [
			{services: [{id: 'GEBCO_08'}], label: 'Shaded Relief (GEBCO_08)', boundariesEnabled: true},
			{services: [{id: 'ETOPO1'}], label: 'Shaded Relief (ETOPO1)', boundariesEnabled: true},
			{services: [{id: 'Light Gray'}, {id: 'Light Gray Reference'}], label: 'Light Gray (Esri)', boundariesEnabled: false},
			{services: [{id: 'Ocean Basemap'}], label: 'Ocean Basemap (Esri)', boundariesEnabled: false},
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

function initIdentify(){
	//console.log('inside initIdentify...');
	
	//Setup common to all layers/sublayers
	var attributes = ['Survey ID', 'Survey Type', 'Platform Name', 'Survey Start Year', 'Survey End Year', 'Source Institution', 'Project', 'Country', 'Chief Scientist', 'Date Added'];
	var fieldUrls = {'Survey ID': {prefix: 'http://www.ngdc.noaa.gov/cgi-bin/mgg/gdas_tsea?RUNTYPE=www-ge&SURVS=', postfix: ''}};
	var displayFieldNames = ['Survey ID', 'Survey Start Year'];
 	var displayFieldDelimiters = {'Survey ID': ' (', 'Survey Start Year': ')'};
	
	globals.identifyDijit = new identify.Identify({
		map: globals.map,
		label: "Identify",
		defaultTolerance: 2,
		showGetDataButton: true,
		mapServices: [
		{
			id: "All Parameters",
			service: mapServiceById("All Parameters"),
			name: "All Parameters",
			displayOptions: {
				0: {layerAlias: "All Parameters", visible: false, attributes: attributes, fieldUrls: fieldUrls, displayFieldNames: displayFieldNames, displayFieldDelimiters: displayFieldDelimiters}
			},
			sortFunction: function(a, b) {
				//Sort by year descending, then alphabetical by survey ID
				if (a.feature.attributes['Survey Start Year'] == b.feature.attributes['Survey Start Year']) {
					return a.feature.attributes['Survey ID'] <= b.feature.attributes['Survey ID'] ? -1 : 1;
				}
				return a.feature.attributes['Survey Start Year'] < b.feature.attributes['Survey Start Year'] ? 1 : -1;
			}
		},
		{			
			id: "Bathymetry",
			service: mapServiceById("Bathymetry"),			
			name: "Bathymetry",
			displayOptions: {
				0: {layerAlias: "Bathymetry", visible: false, attributes: attributes, fieldUrls: fieldUrls, displayFieldNames: displayFieldNames, displayFieldDelimiters: displayFieldDelimiters},
				1: {layerAlias: "Bathymetry", visible: false, attributes: attributes, fieldUrls: fieldUrls, displayFieldNames: displayFieldNames, displayFieldDelimiters: displayFieldDelimiters}				
			},
			sortFunction: function(a, b) {
				//Sort by year descending, then alphabetical by survey ID
				if (a.feature.attributes['Survey Start Year'] == b.feature.attributes['Survey Start Year']) {
					return a.feature.attributes['Survey ID'] <= b.feature.attributes['Survey ID'] ? -1 : 1;
				}
				return a.feature.attributes['Survey Start Year'] < b.feature.attributes['Survey Start Year'] ? 1 : -1;
			}
		},
		{
			id: "Gravity",
			service: mapServiceById("Gravity"),
			name: "Gravity",
			displayOptions: {
				0: {layerAlias: "Gravity", visible: false, attributes: attributes, fieldUrls: fieldUrls, displayFieldNames: displayFieldNames, displayFieldDelimiters: displayFieldDelimiters},
				2: {layerAlias: "Gravity", visible: false, attributes: attributes, fieldUrls: fieldUrls, displayFieldNames: displayFieldNames, displayFieldDelimiters: displayFieldDelimiters}
			},
			sortFunction: function(a, b) {
				//Sort by year descending, then alphabetical by survey ID
				if (a.feature.attributes['Survey Start Year'] == b.feature.attributes['Survey Start Year']) {
					return a.feature.attributes['Survey ID'] <= b.feature.attributes['Survey ID'] ? -1 : 1;
				}
				return a.feature.attributes['Survey Start Year'] < b.feature.attributes['Survey Start Year'] ? 1 : -1;
			}
		},
		{
			id: "Magnetics",
			service: mapServiceById("Magnetics"),
			name: "Magnetics",
			displayOptions: {
				0: {layerAlias: "Magnetics", visible: false, attributes: attributes, fieldUrls: fieldUrls, displayFieldNames: displayFieldNames, displayFieldDelimiters: displayFieldDelimiters},
				3: {layerAlias: "Magnetics", visible: false, attributes: attributes, fieldUrls: fieldUrls, displayFieldNames: displayFieldNames, displayFieldDelimiters: displayFieldDelimiters}
			},
			sortFunction: function(a, b) {
				//Sort by year descending, then alphabetical by survey ID
				if (a.feature.attributes['Survey Start Year'] == b.feature.attributes['Survey Start Year']) {
					return a.feature.attributes['Survey ID'] <= b.feature.attributes['Survey ID'] ? -1 : 1;
				}
				return a.feature.attributes['Survey Start Year'] < b.feature.attributes['Survey Start Year'] ? 1 : -1;
			}
		},
		{
			id: "Single Channel Seismics",
			service: mapServiceById("Single Channel Seismics"),
			name: "Single Channel Seismics",
			displayOptions: {
				0: {layerAlias: "Single Channel Seismics", visible: false, attributes: attributes, fieldUrls: fieldUrls, displayFieldNames: displayFieldNames, displayFieldDelimiters: displayFieldDelimiters},
				8: {layerAlias: "Single Channel Seismics", visible: false, attributes: attributes, fieldUrls: fieldUrls, displayFieldNames: displayFieldNames, displayFieldDelimiters: displayFieldDelimiters}
			},
			sortFunction: function(a, b) {
				//Sort by year descending, then alphabetical by survey ID
				if (a.feature.attributes['Survey Start Year'] == b.feature.attributes['Survey Start Year']) {
					return a.feature.attributes['Survey ID'] <= b.feature.attributes['Survey ID'] ? -1 : 1;
				}
				return a.feature.attributes['Survey Start Year'] < b.feature.attributes['Survey Start Year'] ? 1 : -1;
			}
		},		
		{
			id: "Trackline Combined",
			service: mapServiceById("Trackline Combined"),
			name: "Trackline Combined",
			displayOptions: {
				4: {layerAlias: "Multi-Channel Seismics", visible: false, attributes: attributes, fieldUrls: fieldUrls, displayFieldNames: displayFieldNames, displayFieldDelimiters: displayFieldDelimiters},
				5: {layerAlias: "Seismic Refraction", visible: false, attributes: attributes, fieldUrls: fieldUrls, displayFieldNames: displayFieldNames, displayFieldDelimiters: displayFieldDelimiters},
				6: {layerAlias: "Shot-Point Navigation", visible: false, attributes: attributes, fieldUrls: fieldUrls, displayFieldNames: displayFieldNames, displayFieldDelimiters: displayFieldDelimiters},
				7: {layerAlias: "Side Scan Sonar", visible: false, attributes: attributes, fieldUrls: fieldUrls, displayFieldNames: displayFieldNames, displayFieldDelimiters: displayFieldDelimiters},
				9: {layerAlias: "Subbottom Profile", visible: false, attributes: attributes, fieldUrls: fieldUrls, displayFieldNames: displayFieldNames, displayFieldDelimiters: displayFieldDelimiters},
				10: {
					layerAlias: "Aeromagnetic Surveys", 
					visible: false, 
					attributes: ['Survey ID',
					             'Survey URL',
					             'Project URL',					             
					             'Source Institution', 
					             'Project ID',
					             'Full Project Name',
					             'Departure Date', 
					             'Departure Airport', 
					             'Arrival Date', 
					             'Arrival Airport', 
					             'Total Field (T)',
					             'Residual Field (R)',
					             'North Vector Component (X)',
					             'East Vector Component (Y)',
					             'Vertical Component (Z)',
					             'Magnetic Declination (D)',
					             'Horizontal Intensity (H)',
					             'Magnetic Inclination (I)',
					             'Electromagnetics (E)',
					             'Other (e.g. Radiometrics)'], 
					fieldUrls: {
						'Survey URL': { prefix: '', postfix: '', linkText: 'Survey Link'},
						'Project URL': { prefix: '', postfix: '', linkText: 'Project Link'}
					},
					displayFieldNames: ['Survey ID', 'Project ID'],
				 	displayFieldDelimiters: {'Survey ID': ' (', 'Project ID': ')'}
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
	dojo.byId("getDataButton").innerHTML = 'Get Marine Data';
}

//called on Map onLoad event
function mapInitializedCustom(theMap) {
	//console.log('inside mapInitializedCustom...');
}

//called after all layers added to map
function mapReadyCustom(theMap) {
	//console.log('inside mapReadyCustom...');
	
	//construct PairedMapServiceLayers. Modifies the mapServiceList
	new layers.PairedMapServiceLayer({
		id: "All Parameters",
		tiledServiceId: "All Parameters (tiled)",
		dynamicServiceId: "All Parameters (dynamic)",
		mapServiceList: globals.mapServices,
		visible: false,
		map: globals.map,
		cutoffZoom: 7 - globals.firstZoomLevel,
		defaultVisibleLayers: [0]
	});				
	new layers.PairedMapServiceLayer({
		id: "Bathymetry",
		tiledServiceId: "Bathymetry (tiled)",
		dynamicServiceId: "Bathymetry (dynamic)",
		mapServiceList: globals.mapServices,
		visible: false,
		map: globals.map,
		cutoffZoom: 7 - globals.firstZoomLevel,
		defaultVisibleLayers: [1]
	});
	new layers.PairedMapServiceLayer({
		id: "Gravity",
		tiledServiceId: "Gravity (tiled)",
		dynamicServiceId: "Gravity (dynamic)",
		mapServiceList: globals.mapServices,
		visible: false,
		map: globals.map,
		cutoffZoom: 7 - globals.firstZoomLevel,
		defaultVisibleLayers: [2]
	});
	new layers.PairedMapServiceLayer({
		id: "Magnetics",
		tiledServiceId: "Magnetics (tiled)",
		dynamicServiceId: "Magnetics (dynamic)",
		mapServiceList: globals.mapServices,
		visible: false,
		map: globals.map,
		cutoffZoom: 7 - globals.firstZoomLevel,
		defaultVisibleLayers: [3]
	});
	new layers.PairedMapServiceLayer({
		id: "Single Channel Seismics",
		tiledServiceId: "Single Channel Seismics (tiled)",
		dynamicServiceId: "Single Channel Seismics (dynamic)",
		mapServiceList: globals.mapServices,
		visible: false,
		map: globals.map,
		cutoffZoom: 7 - globals.firstZoomLevel,
		defaultVisibleLayers: [8]
	});
	new layers.PairedMapServiceLayer({
		id: "GEBCO_08",
		tiledServiceId: "GEBCO_08 (tiled)",
		dynamicServiceId: "GEBCO_08 (dynamic)",
		mapServiceList: globals.mapServices,
		visible: false,
		map: globals.map,
		cutoffZoom: 9 - globals.firstZoomLevel
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
	
	globals.mapServices[12].setVisibleLayers([9999]); //Manually set all the sublayers to invisible for "Trackline Combined"
			
	initBasemapToolbar();	
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
			{layer:mapServiceById('All Parameters')._tiledService, title: " "},
			{layer:mapServiceById('All Parameters')._dynamicService, title: " "},
			{layer:mapServiceById('Bathymetry')._tiledService, title: " "},
			{layer:mapServiceById('Bathymetry')._dynamicService, title: " "},
			{layer:mapServiceById('Gravity')._tiledService, title: " "},
			{layer:mapServiceById('Gravity')._dynamicService, title: " "},
			{layer:mapServiceById('Magnetics')._tiledService, title: " "},
			{layer:mapServiceById('Magnetics')._dynamicService, title: " "},
			{layer:mapServiceById('Single Channel Seismics')._tiledService, title: " "},	
			{layer:mapServiceById('Single Channel Seismics')._dynamicService, title: " "},	            			
			{layer:mapServiceById('Trackline Combined'), title: " "}
		],
		respectCurrentMapScale: false
	}, "legend");
	globals.legend.startup();
		
	if (dojo.isIE <= 8) {
		surveysStore = null;
	}	
	
	dojo.subscribe("/survey_select/MarineSurveySelectDialog", filterMarineSurveys);
	dojo.subscribe("/survey_select/AeroSurveySelectDialog", filterAeroSurveys);
	globals.tracklineMapService = mapServiceById('Trackline Combined');
		
	//Set up the QueryTasks for the zoom-to operation
	var marineLayerUrl = globals.tracklineMapService.url+"/0";
	var aeroLayerUrl = globals.tracklineMapService.url+"/10";
	
	globals.marineQueryTask = new esri.tasks.QueryTask(marineLayerUrl);
	globals.marineQuery = new esri.tasks.Query();
	globals.marineQuery.returnGeometry = true;
	globals.marineQuery.maxAllowableOffset = 100000; //Generalize the geometries. Max tolerance of 100km (doesn't have to be accurate)
	globals.marineQuery.outFields = [];
	globals.marineQuery.where = '1 = 1';
	dojo.connect(globals.marineQueryTask, "onComplete", calcBbox);	
	
	globals.marineQueryTaskCrossing180 = new esri.tasks.QueryTask(marineLayerUrl);
	globals.marineQueryCrossing180 = new esri.tasks.Query();
	globals.marineQueryCrossing180.returnGeometry = true;
	globals.marineQueryCrossing180.outSpatialReference = new esri.SpatialReference({wkt: "PROJCS[\"WGS_1984_Web_Mercator_Auxiliary_Sphere\",GEOGCS[\"GCS_WGS_1984\",DATUM[\"D_WGS_1984\",SPHEROID[\"WGS_1984\",6378137.0,298.257223563]],PRIMEM[\"Greenwich\",0.0],UNIT[\"Degree\",0.0174532925199433]],PROJECTION[\"Mercator_Auxiliary_Sphere\"],PARAMETER[\"False_Easting\",0.0],PARAMETER[\"False_Northing\",0.0],PARAMETER[\"Central_Meridian\",180],PARAMETER[\"Standard_Parallel_1\",0.0],PARAMETER[\"Auxiliary_Sphere_Type\",0.0],UNIT[\"Meter\",1.0]]"});
	globals.marineQueryCrossing180.maxAllowableOffset = 100000; //Generalize the geometries. Max tolerance of 100km (doesn't have to be accurate)
	globals.marineQueryCrossing180.outFields = [];
	globals.marineQueryCrossing180.where = '1 = 1';
	dojo.connect(globals.marineQueryTaskCrossing180, "onComplete", calcBboxCrossing180);
	
	globals.aeroQueryTask = new esri.tasks.QueryTask(aeroLayerUrl);
	globals.aeroQuery = new esri.tasks.Query();
	globals.aeroQuery.returnGeometry = true;
	globals.aeroQuery.maxAllowableOffset = 100000; //Generalize the geometries. Max tolerance of 100km (doesn't have to be accurate)
	globals.aeroQuery.outFields = [];
	globals.aeroQuery.where = '1 = 1';
	dojo.connect(globals.aeroQueryTask, "onComplete", calcBbox);	
	
	globals.aeroQueryTaskCrossing180 = new esri.tasks.QueryTask(aeroLayerUrl);
	globals.aeroQueryCrossing180 = new esri.tasks.Query();
	globals.aeroQueryCrossing180.returnGeometry = true;
	globals.aeroQueryCrossing180.outSpatialReference = new esri.SpatialReference({wkt: "PROJCS[\"WGS_1984_Web_Mercator_Auxiliary_Sphere\",GEOGCS[\"GCS_WGS_1984\",DATUM[\"D_WGS_1984\",SPHEROID[\"WGS_1984\",6378137.0,298.257223563]],PRIMEM[\"Greenwich\",0.0],UNIT[\"Degree\",0.0174532925199433]],PROJECTION[\"Mercator_Auxiliary_Sphere\"],PARAMETER[\"False_Easting\",0.0],PARAMETER[\"False_Northing\",0.0],PARAMETER[\"Central_Meridian\",180],PARAMETER[\"Standard_Parallel_1\",0.0],PARAMETER[\"Auxiliary_Sphere_Type\",0.0],UNIT[\"Meter\",1.0]]"});
	globals.aeroQueryCrossing180.maxAllowableOffset = 100000; //Generalize the geometries. Max tolerance of 100km (doesn't have to be accurate)
	globals.aeroQueryCrossing180.outFields = [];
	globals.aeroQueryCrossing180.where = '1 = 1';
	dojo.connect(globals.aeroQueryTaskCrossing180, "onComplete", calcBboxCrossing180);
	
	toggleVisibleLayers();
	
	updateSurveyCounts(); //Update the number of surveys reported in the TOC
}

function toggleLayer(index) {	
	if (index == 0) { //All Parameters
		setLayerVisibility('All Parameters', [], dijit.byId('chkLayer0').checked);
		globals.visibleGeodasLayers[0].visible = dijit.byId('chkLayer0').checked;
	} else if (index == 1) { //Bathymetry
		setLayerVisibility('Bathymetry', [], dijit.byId('chkLayer1').checked);
		globals.visibleGeodasLayers[1].visible = dijit.byId('chkLayer1').checked;
	} else if (index == 2) { //Gravity
		setLayerVisibility('Gravity', [], dijit.byId('chkLayer2').checked);
		globals.visibleGeodasLayers[2].visible = dijit.byId('chkLayer2').checked;
	} else if (index == 3) { //Magnetics
		setLayerVisibility('Magnetics', [], dijit.byId('chkLayer3').checked);
		globals.visibleGeodasLayers[3].visible = dijit.byId('chkLayer3').checked;
	} else if (index == 4) { //Multi-Channel Seismics
		setLayerVisibility('Trackline Combined', [4], dijit.byId('chkLayer4').checked);
		globals.visibleGeodasLayers[5].visible = dijit.byId('chkLayer4').checked;
	} else if (index == 5) { //Seismic Refraction
		setLayerVisibility('Trackline Combined', [5], dijit.byId('chkLayer5').checked);
		globals.visibleGeodasLayers[7].visible = dijit.byId('chkLayer5').checked;
	} else if (index == 6) { //Shot-Point Navigation
		setLayerVisibility('Trackline Combined', [6], dijit.byId('chkLayer6').checked);
		globals.visibleGeodasLayers[8].visible = dijit.byId('chkLayer6').checked;
	} else if (index == 7) { //Side Scan Sonar
		setLayerVisibility('Trackline Combined', [7], dijit.byId('chkLayer7').checked);
		globals.visibleGeodasLayers[6].visible = dijit.byId('chkLayer7').checked;		
	} else if (index == 8) { //Single Channel Seismics
		setLayerVisibility('Single Channel Seismics', [], dijit.byId('chkLayer8').checked);
		globals.visibleGeodasLayers[4].visible = dijit.byId('chkLayer8').checked;		
	} else if (index == 9) {//index == 9 Subbottom Profile
		setLayerVisibility('Trackline Combined', [9], dijit.byId('chkLayer9').checked);
		globals.visibleGeodasLayers[9].visible = dijit.byId('chkLayer9').checked;
	} else if (index == 10) {//index == 10 Aeromagnetic Surveys
		setLayerVisibility('Trackline Combined', [10], dijit.byId('chkLayer10').checked);
		globals.visibleGeodasLayers[10].visible = dijit.byId('chkLayer10').checked;
	}
}
