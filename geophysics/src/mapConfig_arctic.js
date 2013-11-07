globals.scalebarZoomEnabled = 0;

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
	new esri.layers.ArcGISDynamicMapServiceLayer(globals.publicAgsHost + "/rest/services/web_mercator/trackline_combined_dynamic/MapServer", {
	 	id: "Trackline Combined",
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
	
	globals.firstTracklineServiceIndex = 2;
	globals.lastTracklineServiceIndex = 2;

	return (globals.mapServices);
}


function initBasemapToolbar() {
	//console.log('inside initBasemapToolbar...');	
	var basemapToolbar = new simple_basemap_toolbar.SimpleBasemapToolbar({
		basemaps: [
			{services: [{id: 'Arctic Basemap'}], label: 'Shaded Relief', boundariesEnabled: true}
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
			id: "Trackline Combined",
			service: mapServiceById("Trackline Combined"),
			name: "Trackline Combined",
			displayOptions: {
				0: {layerAlias: "All Parameters", visible: false, attributes: attributes, fieldUrls: fieldUrls, displayFieldNames: displayFieldNames, displayFieldDelimiters: displayFieldDelimiters},
				1: {layerAlias: "Bathymetry", visible: false, attributes: attributes, fieldUrls: fieldUrls, displayFieldNames: displayFieldNames, displayFieldDelimiters: displayFieldDelimiters},
				2: {layerAlias: "Gravity", visible: false, attributes: attributes, fieldUrls: fieldUrls, displayFieldNames: displayFieldNames, displayFieldDelimiters: displayFieldDelimiters},
				3: {layerAlias: "Magnetics", visible: false, attributes: attributes, fieldUrls: fieldUrls, displayFieldNames: displayFieldNames, displayFieldDelimiters: displayFieldDelimiters},				
				4: {layerAlias: "Multi-Channel Seismics", visible: false, attributes: attributes, fieldUrls: fieldUrls, displayFieldNames: displayFieldNames, displayFieldDelimiters: displayFieldDelimiters},
				5: {layerAlias: "Seismic Refraction", visible: false, attributes: attributes, fieldUrls: fieldUrls, displayFieldNames: displayFieldNames, displayFieldDelimiters: displayFieldDelimiters},
				6: {layerAlias: "Shot-Point Navigation", visible: false, attributes: attributes, fieldUrls: fieldUrls, displayFieldNames: displayFieldNames, displayFieldDelimiters: displayFieldDelimiters},
				7: {layerAlias: "Side Scan Sonar", visible: false, attributes: attributes, fieldUrls: fieldUrls, displayFieldNames: displayFieldNames, displayFieldDelimiters: displayFieldDelimiters},
				8: {layerAlias: "Single Channel Seismics", visible: false, attributes: attributes, fieldUrls: fieldUrls, displayFieldNames: displayFieldNames, displayFieldDelimiters: displayFieldDelimiters},				
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
		fillSymbol: new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([64, 64, 64, 1]), 2), new dojo.Color([255, 255, 0, 0.3])),
		geometryService: globals.geometryService
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
	
	mapServiceById('Trackline Combined').setVisibleLayers([9999]); //Manually set all the sublayers to invisible for "Trackline Combined"
			
	initBasemapToolbar();	
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
	
	globals.legend = new esri.dijit.Legend({map:globals.map,
		layerInfos:[		               			
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
	
	globals.arcticExcludedProjects = "PROJECT_ID NOT IN ('ADMAP Antarctic Mag Proj','Proj Mag World 53-70')"
	var layerDefs = [];
	layerDefs[10] = globals.arcticExcludedProjects;
	globals.tracklineMapService.setLayerDefinitions(layerDefs);
	
	//Set up the QueryTasks for the zoom-to operation
	var marineLayerUrl = globals.tracklineMapService.url+"/0";
	var aeroLayerUrl = globals.tracklineMapService.url+"/10";
	
	globals.marineQueryTask = new esri.tasks.QueryTask(marineLayerUrl);
	globals.marineQuery = new esri.tasks.Query();
	globals.marineQuery.returnGeometry = true;
	globals.marineQuery.maxAllowableOffset = 100000; //Generalize the geometries. Max tolerance of 100km (doesn't have to be accurate)
	globals.marineQuery.outFields = [];
	dojo.connect(globals.marineQueryTask, "onComplete", calcBbox);	
	
	globals.aeroQueryTask = new esri.tasks.QueryTask(aeroLayerUrl);
	globals.aeroQuery = new esri.tasks.Query();
	globals.aeroQuery.returnGeometry = true;
	globals.aeroQuery.maxAllowableOffset = 100000; //Generalize the geometries. Max tolerance of 100km (doesn't have to be accurate)
	globals.aeroQuery.outFields = [];
	dojo.connect(globals.aeroQueryTask, "onComplete", calcBbox);	
	
	toggleVisibleLayers();
	updateSurveyCounts(); //Update the number of surveys reported in the TOC
}

function toggleLayer(index) {	
	if (index == 0) { //All Parameters
		setLayerVisibility('Trackline Combined', [0], dijit.byId('chkLayer0').checked);
		globals.visibleGeodasLayers[0].visible = dijit.byId('chkLayer0').checked;
	} else if (index == 1) { //Bathymetry
		setLayerVisibility('Trackline Combined', [1], dijit.byId('chkLayer1').checked);
		globals.visibleGeodasLayers[1].visible = dijit.byId('chkLayer1').checked;		
	} else if (index == 2) { //Gravity
		setLayerVisibility('Trackline Combined', [2], dijit.byId('chkLayer2').checked);
		globals.visibleGeodasLayers[2].visible = dijit.byId('chkLayer2').checked;		
	} else if (index == 3) { //Magnetics
		setLayerVisibility('Trackline Combined', [3], dijit.byId('chkLayer3').checked);
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
		setLayerVisibility('Trackline Combined', [8], dijit.byId('chkLayer8').checked);
		globals.visibleGeodasLayers[4].visible = dijit.byId('chkLayer8').checked;
	} else if (index == 9) { //Subbottom Profile
		setLayerVisibility('Trackline Combined', [9], dijit.byId('chkLayer9').checked);
		globals.visibleGeodasLayers[4].visible = dijit.byId('chkLayer9').checked;		
	} else if (index == 10) {//index == 10 Aeromagnetic Surveys
		setLayerVisibility('Trackline Combined', [10], dijit.byId('chkLayer10').checked);
		globals.visibleGeodasLayers[10].visible = dijit.byId('chkLayer10').checked;
	}	
}