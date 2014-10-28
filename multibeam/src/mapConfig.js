var globals = {}; //container for global variables

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

dojo.subscribe("/Identify/getData", openGetDataWindow);

//mandatory lifecycle methods
//called just before common initialization
function preInit() {
	//console.log("inside preInit...");
	globals.namesStore = new dojo.data.ItemFileReadStore({url: "ships.json", urlPreventCache: true});
	globals.surveysStore = new dojo.data.ItemFileReadStore({url: "surveys.json",urlPreventCache: true});

/*	
	var gotItems = function(items, request){
	  console.log("inside gotItems: Number of items located: " + items.length);
	  var minYear = 9999;
	  var maxYear = -9999;
	  var year;
	  dojo.forEach(items,function(i){
	  	year = globals.surveysStore.getValue(i,'year');
		if (year) {
			if (year > maxYear) {
				maxYear = year
			};
			if (year < minYear) {
				minYear = year
			};
		}
	  });
	  console.log("minYear = "+minYear);
	  console.log("maxYear = "+maxYear);
	};
		
	globals.surveysStore.fetch({
		onComplete: gotItems
	});
*/
	//create the dialog
	globals.coordDialog = new bboxDialog.BoundingBoxDialog({title:'Specify an Area of Interest', style: 'width:300px;'}); 
	globals.getDataDialog = new multibeam.GetDataDialog({title:'Download Data', style: 'width:400px;'}); 
}

//called after common initialization
function postInit() {
//	console.log("inside postInit...");

	dojo.subscribe("/survey_select/SurveySelectDialog",surveySelectDialogHandler);

	//publish new event w/ extent, delta, levelChange, lod whenever ESRI onExtentChange event raised
	//dojo.connectPublisher('/extent/change', globals.map, 'onExtentChange');
	dojo.connect(globals.map,'onExtentChange',function(extent){
		//convert to geo
		//TODO currently assumes web_mercator
		var geoExtent = esri.geometry.webMercatorToGeographic(extent);
				
		//publish new event
		dojo.publish('/extent/change',[geoExtent]);
	});
	
	globals.selectSetExtent = new multibeam.SelectSetExtent(globals.mapServices[4].url+"/0");
	dojo.subscribe("/ngdc/FeatureSetExtent",function(bbox){
		//console.log('received /ngdc/FeatureSetExtent message: ',bbox);
		console.log(esri.geometry.webMercatorToGeographic(bbox));
		globals.map.setExtent(bbox, true);
	})
	
	dojo.subscribe('/ngdc/BoundingBoxDialog', this, function(data) {
		var minx = data.minx, maxx = data.maxx, miny = data.miny, maxy = data.maxy;
		
		//Handle the fact that the poles are at infinity in the Mercator projection
		//TODO set max in Dialog number entries
		if (miny === -90)
			miny = -89.99;
		if (maxy === 90)
			maxy = 89.99;
		
		//TODO: Handle projections other than Web Mercator	
		var ll = esri.geometry.geographicToWebMercator(new esri.geometry.Point(minx, miny));
		var ur = esri.geometry.geographicToWebMercator(new esri.geometry.Point(maxx, maxy));
		var geometry = new esri.geometry.Extent(ll.x, ll.y, ur.x, ur.y, new esri.SpatialReference({wkid: 3857}));
		addToMap(geometry);
		globals.map.setExtent(new esri.geometry.Extent(geometry.xmin, geometry.ymin, geometry.xmax, geometry.ymax, new esri.SpatialReference({wkid: 3857})), true);
	});		

/*
	//query used to determine current bbox
	var activeLayerUrl = globals.mapServices[4].url+"/0";
	globals.queryTask = new esri.tasks.QueryTask(activeLayerUrl);
	globals.query = new esri.tasks.Query();
	globals.query.returnGeometry = true;
	globals.query.maxAllowableOffset = 100000; //Generalize the geometries. Max tolerance of 100km (doesn't have to be accurate)
	globals.query.outFields = [];
	dojo.connect(globals.queryTask, "onComplete", calcBbox);	
	
	globals.queryTaskCrossing180 = new esri.tasks.QueryTask(activeLayerUrl);
	globals.queryCrossing180 = new esri.tasks.Query();
	globals.queryCrossing180.returnGeometry = true;
	globals.queryCrossing180.outSpatialReference = new esri.SpatialReference({wkt: "PROJCS[\"WGS_1984_Web_Mercator_Auxiliary_Sphere\",GEOGCS[\"GCS_WGS_1984\",DATUM[\"D_WGS_1984\",SPHEROID[\"WGS_1984\",6378137.0,298.257223563]],PRIMEM[\"Greenwich\",0.0],UNIT[\"Degree\",0.0174532925199433]],PROJECTION[\"Mercator_Auxiliary_Sphere\"],PARAMETER[\"False_Easting\",0.0],PARAMETER[\"False_Northing\",0.0],PARAMETER[\"Central_Meridian\",180],PARAMETER[\"Standard_Parallel_1\",0.0],PARAMETER[\"Auxiliary_Sphere_Type\",0.0],UNIT[\"Meter\",1.0]]"});
	globals.queryCrossing180.maxAllowableOffset = 100000; //Generalize the geometries. Max tolerance of 100km (doesn't have to be accurate)
	globals.queryCrossing180.outFields = [];
	dojo.connect(globals.queryTaskCrossing180, "onComplete", calcBboxCrossing180);	
*/
	
	
	
}
/*
function calcBbox(fset){
	console.log('inside calcBbox...');
	var bbox = null;
	if (fset.features.length == 0) {
		//console.log("FeatureSet empty, bbox is null");
		dojo.publish('/toaster/show', ['No features found']);
		//globals.map.setExtent(initialExtent, false);
		return bbox;
	}
	
	bbox = fset.features[0].geometry.getExtent();
	dojo.forEach(fset.features, function(i){
		//console.log(i.geometry.getExtent().xmin+", "+i.geometry.getExtent().ymin+", "+i.geometry.getExtent().xmax+", "+i.geometry.getExtent().ymax+", sr="+i.geometry.getExtent().spatialReference.wkt);
		bbox = bbox.union(i.geometry.getExtent());
	});
	//console.log("final bbox: " + bbox.xmin+", "+bbox.ymin+", "+bbox.xmax+", "+bbox.ymax+", sr="+bbox.spatialReference.wkt);
	
	//console.log(bbox);
	//if (bbox.spatialReference.wkid == 102100) {
	if (bbox.xmin == -20037497.257867113 || bbox.xmax == 20037497.257867113) {
		zoomToSelectionCrossing180();
	}
	else {
		globals.map.setExtent(bbox, true);
	}
}

function calcBboxCrossing180(fset) {
	console.log('inside calcBboxCrossing180...');
	var bbox = null;
	if (fset.features.length == 0) {
		//console.log("FeatureSet empty, bbox is null");
		dojo.publish('/toaster/show', ['No features found']);
		//globals.map.setExtent(initialExtent, false);
		return bbox;
	}
	
	bbox = fset.features[0].geometry.getExtent();
	dojo.forEach(fset.features, function(i){
		//console.log(i.geometry.getExtent().xmin+", "+i.geometry.getExtent().ymin+", "+i.geometry.getExtent().xmax+", "+i.geometry.getExtent().ymax+", sr="+i.geometry.getExtent().spatialReference.wkt);
		bbox = bbox.union(i.geometry.getExtent());
	});
	//console.log("final bbox: " + bbox.xmin+", "+bbox.ymin+", "+bbox.xmax+", "+bbox.ymax+", sr="+bbox.spatialReference.wkt);
	
	//console.log(bbox);
		
	var webMercExtent = new esri.geometry.Extent(bbox.xmin - 20037507.067161795, bbox.ymin, bbox.xmax - 20037507.067161795, bbox.ymax, new esri.SpatialReference({wkid: 3857}));
	//console.log(webMercExtent)
	globals.map.setExtent(webMercExtent, true);
}
*/


/**
 * called when SurveySelectDialog returns. Sets the layer definition for
 * the dynamic layer
 *
 * WARNING: hardcoded column names which depend on mapservice. Also
 * expects the cached layer to be first and the dynamic layer second
 * in the mapservice layerList.
 *
 * GLOBALS: services[], surveysStore, map, initialExtent, query, queryTask,
 * surveyShip, sourceInst, surveyName, surveyYear
 *
 * @param {Object} values
 */
function surveySelectDialogHandler(values){
	//console.log('inside dialogHandler: id='+values.id+'; id='+values.id+'; startYear='+values.startYear+'; ship='+values.ship+'; inst='+values.sourceInst+'; startDateAdded='+values.startDateAdded);
	globals.dialogValues = values;
	var layerDefinitions;// = [];
	var sql = [];

	if (! values) {
		console.log('no criteria specified in dialog');
		//Dialog contains default values. Clear the selection, enable the cached map services, and return.
		clearSelection();
		return;
	}	

	//survey_name takes precedence over ship, year - shouldn't have both
	if (values.survey) {
		sql.push("NGDC_ID = '"+values.survey+"'");
	}
	if (values.ship) {
		sql.push("PLATFORM = '"+values.ship+"'");
	}
	if (values.year) {
		sql.push('SURVEY_YEAR = '+values.year);
	}
	
	//save results to initialize next use of dialog 
	globals.surveyShip = values.ship;
	globals.surveyStartYear = values.startYear;
	globals.surveyName = values.name;
	
	layerDefinitions = sql.join(' and ');
	//console.log(layerDefinitions);
	
	//only one sublayer
	globals.mapServices[4].setLayerDefinitions([layerDefinitions]);
				
	//Publish layer definitions to the Identify dijit
	dojo.publish('/Identify/setLayerDefinitions', [{
		serviceId: globals.mapServices[4].id, 
		serviceUrl: globals.mapServices[4].url, 
		layerDefinitions: [layerDefinitions]
	}]);	
	
	
	//close any InfoWindow that may be displayed
	globals.map.infoWindow.hide();
	
	//update the display w/ filter criteria
	dojo.byId('filterDiv').innerHTML = formatFilterMessage(values);

	//calc extent of selected set
	if (values.zoomToSelection) {
		globals.selectSetExtent.setWhere(globals.mapServices[4].layerDefinitions[0]);
		//zoomToSelection();
	}
}

function formatFilterMessage(values) {
	if (values.name) {
		return('Survey: ' + values.name);
		return (txt);
	}
	
	var t = []
	if (values.ship) {
		t.push('Ship: ' + values.ship);
	} else {
		t.push('All Ships');
	}
	if (values.year) {
		t.push('Year: '+values.year); 				 	
	}
	return (t.join(', '));
}

/*
function zoomToSelection() {
	console.log('inside zoomToSelection');
	globals.query.where = globals.mapServices[4].layerDefinitions[0];
	globals.queryTask.execute(globals.query);
} 

function zoomToSelectionCrossing180() {
	console.log('inside zoomToSelectionCrossing180');
	globals.queryCrossing180.where = globals.selectMapService.layerDefinitions[0];
	globals.queryTaskCrossing180.execute(globals.queryCrossing180);
} 
*/

function clearSelection() {	
	//console.log("inside clearSelection()");
	globals.mapServices[4].setLayerDefinitions([]);
	
	var layerDefinitions = [];
	
	//Publish layer definitions to the Identify dijit
	dojo.publish('/Identify/setLayerDefinitions', [{
		serviceId: globals.mapServices[4].id, 
		serviceUrl: globals.mapServices[4].url, 
		layerDefinitions: layerDefinitions
	}]);	
		
	//Reset values for the Survey Select dialog
	globals.surveyShip = '';
	globals.sourceInst = '';
	globals.surveyStartYear = null;
	globals.surveyEndYear = null;
	globals.surveyStartYearAdded = null;
	globals.surveyEndYearAdded = null;
	
	dojo.byId('filterDiv').innerHTML = "All Surveys";
	
	globals.surveySelectDialog.reset(); //Reset to defaults in the Survey Select Dialog
	
	globals.map.setExtent(globals.initialExtent,true);
}


function openGetDataWindow(geometry) {
	//console.log("inside openGetDataWindow with ",geometry);

	var geoExtent = esri.geometry.webMercatorToGeographic(geometry);

	//if point, create a 1-degree box centered on the point	
	if (geoExtent instanceof esri.geometry.Point) {
		geoExtent = new esri.geometry.Extent(geoExtent.x-0.5, geoExtent.y-0.5, 
			geoExtent.x+0.5, geoExtent.y+0.5, new esri.SpatialReference({wkid: 4326}));
	}

	var url = dojo.string.substitute(
	   "http://www.ngdc.noaa.gov/nndc/struts/results?d=5&query=&t=101378&s=3&srid=8307&westbc=${0}&southbc=${1}&eastbc=${2}&northbc=${3}",
	   [geoExtent.xmin, geoExtent.ymin, geoExtent.xmax, geoExtent.ymax]);

	//console.log(url); 
	//var displayWindow = window.open(url, 'Multibeam Survey List');
	globals.getDataDialog.setExtent(geoExtent);

	globals.getDataDialog.show();
}


function getMapServiceList(){
	var imageParametersPng32 = new esri.layers.ImageParameters();
	imageParametersPng32.format = "png32";
	var imageParametersJpg = new esri.layers.ImageParameters();
	imageParametersJpg.format = "jpg";
	
	globals.mapServices = [
	new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer", {
		id: "Street Map",
		visible: true,
		opacity: 1
	}), 
	new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer", {
		id: "Ocean",
		visible: true,
		opacity: 1
	}), 
/*
	new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer", {
		id: "Imagery",
		visible: false,
		opacity: 1
	}), 
*/
	new esri.layers.ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/etopo1_hillshade/MapServer", {
		id: "Shaded Relief",
		visible: false,
		opacity: 1
	}),
	 
	new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/graticule/MapServer", {
		id: "Graticule",
		visible: true,
		opacity: 0.5,
		imageParameters: imageParametersPng32
	}),
	new esri.layers.ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/multibeam/MapServer", {
	 	id: "Multibeam Bathymetry (tiled)",
	 	visible: true,
	 	opacity: 1
	 }),
	new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/multibeam_dynamic/MapServer", {
	 	id: "Multibeam Bathymetry (dynamic)",
	 	visible: false,
	 	opacity: 1,
	 	imageParameters: imageParametersPng32
	 })

/*	
	new esri.layers.ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/world_reference_map/MapServer", {
			id: "World Reference Map (tiled)",
			visible: true,
			opacity: 1
	}),
	
	new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/world_reference_map_dynamic/MapServer", {
		id: "World Reference Map (dynamic)",
		visible: false,
		opacity: 1,
		imageParameters: imageParametersPng32
	})
*/		
	];
	//globals.mapServices[4].setVisibleLayers([0]);
	globals.basemapLayers = [globals.mapServices[0], globals.mapServices[1], globals.mapServices[2]];
	globals.overlayLayers = [globals.mapServices[3],globals.mapServices[3]];
	return (globals.mapServices);
}

function initIdentify(){
	//console.log('inside initIdentify...');
	globals.identifyDijit = new identify.Identify({
		map: globals.map,
		label: "Identify",
		defaultTolerance: 2,
		showGetDataButton: true,
		mapServices: [
		{
			id: "Multibeam",
			url: "http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/multibeam_dynamic/MapServer",
			name: "Multibeam",
			layerOption: esri.tasks.IdentifyParameters.LAYER_OPTION_VISIBLE,
			displayOptions: {
				0: {
					attributes: ['NGDC ID', 'Survey ID', 'Platform Name', 'Survey Year', 'Chief Scientist', 'Instrument', 'File Count', 'Track Length (km)', 'Total Time (hrs)', 'Bathymetry Beams', 'Amplitude Beams', 'Sidescan' ],
					fieldAliases: {'NGDC ID': 'Link to Data'},
					fieldUrls: {
						'NGDC ID': {
							prefix: 'http://www.ngdc.noaa.gov/nndc/struts/results?op_0=eq&t=101378&s=8&d=70&d=75&d=76&d=91&d=74&d=73&d=72&d=81&d=82&d=85&d=86&d=79&no_data=suppress&v_0=',
							postfix: '',
							linkText: 'Cruise File List'
						}
					},
					layerAlias: "Multibeam Bathymetry",
					displayFieldNames: ['Survey ID', 'Survey Year'],
					displayFieldDelimiters: {
						'Survey ID': ' (',
						'Survey Year': ')'						
					},
					visible: true				
						
				}
			}
		}]});
	globals.identifyDijit.startup();
}


function initBasemapToolbar() {
	//console.log('inside initBasemapToolbar...');
	var basemapToolbar = new simple_basemap_toolbar.SimpleBasemapToolbar({
		overlays: [null,globals.mapServices[3]],
		basemaps: [globals.mapServices[2],globals.mapServices[0],globals.mapServices[1]],
		basemapText: ['Terrain','Political','Ocean'],
        selectedBasemapIndex: 2
	});
	basemapToolbar.placeAt('basemapToolbar');
	basemapToolbar.startup();
	return(basemapToolbar);
}


//called on Map onLoad event
function mapInitializedCustom(theMap) {
	//console.log('inside mapInitializedCustom...');
	initIdentify(theMap);
	globals.surveySelectDialog = new survey_select.SurveySelectDialog({
		title: 'Select Surveys',
		shipsStore: globals.namesStore, 
		surveysStore: globals.surveysStore,
		defaultShip: globals.surveyShip,
		defaultStartYear: globals.surveyStartYear, 
		defaultEndYear: globals.surveyEndYear
	});
}

//called after all layers added to map
function mapReadyCustom(theMap) {
	//console.log('inside mapReadyCustom...');
	
	//construct PairedMapServiceLayers. Modifies the mapServiceList				
	new layers.PairedMapServiceLayer({
		id: "Multibeam",
		tiledServiceId: "Multibeam Bathymetry (tiled)",
		dynamicServiceId: "Multibeam Bathymetry (dynamic)",
		mapServiceList: globals.mapServices,
		visible: true,
		map: globals.map,
		cutoffZoom: 4
	});

}
