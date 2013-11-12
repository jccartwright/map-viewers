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
//TODO: clarify
globals.zoomModifier = 3;

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
	new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer", {
		id: "Imagery",
		visible: false,
		opacity: 1
	}), 
	new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer", {
		id: "Shaded Relief",
		visible: false,
		opacity: 1
	}),
	 
	new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/rest/services/web_mercator/graticule/MapServer", {
		id: "Graticule",
		visible: true,
		opacity: 0.5,
		imageParameters: imageParametersPng32
	}),
/*	
	new MapServicePair({
		id: "World Reference Map",
		tiledService: new esri.layers.ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/rest/services/web_mercator/world_reference_map/MapServer", {
			id: "World Reference Map (tiled)",
			visible: true,
			opacity: 1
		}),
		dynamicService: new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/rest/services/web_mercator/world_reference_map_dynamic/MapServer", {
			id: "World Reference Map (dynamic)",
			visible: false,
			opacity: 1,
			imageParameters: imageParametersPng32
		}),
		visible: true,
		opacity: 1,
		cutoffZoom: 8 - globals.zoomModifier,
		dynamicServiceSubLayer: null,
		map: globals.map
	}), 
*/	
	new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/rest/services/firedetects/MapServer", {
		id: "Fire Detects",
		imageParameters: imageParametersPng32,
		visible: true
	})];
	//globals.mapServices[4].setVisibleLayers([0]);  //"recent" group layer
	globals.mapServices[4].setVisibleLayers([1,2,3]); //recent layers visible. list individually for legend to work

	//globals.mapServices[4].setVisibleLayers([0,1,2,3,4,5]);
	/*
	//set layer definitions for archive layers
	globals.layerDefinitions = [];
	var now = new Date();
	var startDate = new Date(now.getUTCFullYear,now.getUTCMonth(),now.getUTCDate(),0,0,0);
	var endDate = new Date(now.getUTCFullYear,now.getUTCMonth(),now.getUTCDate(),23,59,59);
	startDate = new Date(2011,4,15);
	var dateString = formatDate(startDate);
	globals.layerDefinitions[5] = "OBSTIME between to_date('"+dateString+" 00:00:00','YYYY-MM-DD HH24:MI:SS') and to_date('"+dateString+" 23:59:59', 'YYYY-MM-DD HH24:MI:SS')";
	globals.layerDefinitions[6] = "OBSTIME between to_date('"+dateString+" 00:00:00','YYYY-MM-DD HH24:MI:SS') and to_date('"+dateString+" 23:59:59', 'YYYY-MM-DD HH24:MI:SS')";
	globals.layerDefinitions[7] = "BEGTIME between to_date('"+dateString+" 00:00:00','YYYY-MM-DD HH24:MI:SS') and to_date('"+dateString+" 23:59:59', 'YYYY-MM-DD HH24:MI:SS')";
	globals.mapServices[4].setLayerDefinitions(globals.layerDefinitions);
	*/
	globals.basemapLayers = [globals.mapServices[0], globals.mapServices[1], globals.mapServices[2]];
	globals.overlayLayers = [globals.mapServices[3],globals.mapServices[3]];
	return (globals.mapServices);
}

function formatDate(date) {
	var month = date.getUTCMonth()+1;
	return (date.getUTCFullYear()+"-"+month+"-"+date.getUTCDate());
}

function initLegend(theMap) {
	//console.log('inside initLegend...');
	
	//WARNING: hardcoded element name
	globals.legend = new esri.dijit.Legend({map:globals.map, 
		layerInfos:[
			{layer:globals.mapServices[4], title: "Fire Detects"}		
		]}, "legend");
	globals.legend.startup();
}

function initTOC(theMap) {
	//console.log('inside initTOC...');
		
	var tocData = {
		identifier: 'name',
		label: 'name',
		items: [ 
		{
			name: 'WFABBA',
			service: 'Fire Detects',
			subLayers: [1],
			type: 'item',
			checkbox: true,
			leaf: true,
			icon: 'blank'
		},
		{
			name: 'HMS',
			service: 'Fire Detects',
			subLayers: [2],
			type: 'item',
			checkbox: true,
			leaf: true,
			icon: 'blank'
		},
		{
			name: 'Smoke',
			service: 'Fire Detects',
			subLayers: [3],
			type: 'item',
			checkbox: true,
			leaf: true,
			icon: 'blank'
		}]
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
		model: model,
		showRoot: false,
		allowMultiState: true,
		//branchIcons: true,
		//nodeIcons: true,
		autoExpand: true
	});
	tree.placeAt("toc");
	
	dojo.subscribe('/toc/layer/show', this, function(data) {
		//console.log("Toggle layer: " + data.service + " " + data.subLayers + " " + data.state);
		var service = globals.mapServices[4];
		var subLayer = parseInt(data.subLayers);
		if (data.state) {
			//add to visible array
			service.visibleLayers.push(subLayer);
		} else {
			//remove from visible array
			service.visibleLayers.splice(service.visibleLayers.indexOf(subLayer),1);
		}
		service.setVisibleLayers(service.visibleLayers);
		//Publish layer visibility to Identify dijit
		//TODO
		dojo.publish('/Identify/setLayerVisibility', 
		[{serviceId: service.id, serviceUrl: service.url, visibleLayers: service.visibleLayers}]
		);

	});

}


function initIdentify(){
	//console.log('inside initIdentify...');
	globals.identifyDijit = new identify.Identify({
		map: globals.map,
		label: "Identify",
		defaultTolerance: 2,
		mapServices: [
		{
			id: "Fire Detects",
			url: globals.mapServices[4].url,
			name: "Fire Detects",
			layerOption: esri.tasks.IdentifyParameters.LAYER_OPTION_VISIBLE,
			displayOptions: {
				0: {
					
				},
				1: {
//					displayFieldNames: ['Satellite'],
//					layerAlias: 'WFABBA',
//					attributes: ['OBSTIME','TEMP4','TEMP11','ECOSYS','FIREFLG'],
//					fieldAliases: {'OBSTIME': 'Observation Time', 'TEMP4':'Temp 4','TEMP11':'Temp 11','ECOSYS':'Ecosystem','FIREFLG':'Fire Flag'}
					sortFunction: function(a, b) {
						if (a.feature.attributes['Observation Time'] == b.feature.attributes['Observation Time']) {
							return(0);
						}
						return a.feature.attributes['Observation Time'] <= b.feature.attributes['Observation Time'] ? -1 : 1;
					}
				},
				2: {
				},
				3: {
				},
				4: {
					
				},
				5: {
				}
			}
		}]});
	globals.identifyDijit.startup();
}


function initBasemapToolbar() {
	var basemapToolbar = new simple_basemap_toolbar.SimpleBasemapToolbar({
		overlays: [null,globals.mapServices[3]],
		basemaps: [globals.mapServices[2],globals.mapServices[0],globals.mapServices[1]],
        selectedBasemapIndex: 1
	});
	basemapToolbar.placeAt('basemapToolbar');
	basemapToolbar.startup();
	return(basemapToolbar);
}


function setDataRange() {
	var jsonpArgs = {
		//url: 'http://www.ngdc.noaa.gov/gis-support/fires/dateRange',
		url: 'http://maps.ngdc.noaa.gov/mapviewer-support/fires/daterange.groovy',
		callbackParamName:'callback',
		content: {
			//dataset:'WFABBA'
			dataset:'wfabba'
		},
		timeout: 3000,
		load: function(data) {
			//console.log(dojo.toJson(data,true));
			globals.dataRange = {
				'start_date': new Date(data.start_date),
				'end_date': new Date(data.end_date)
			};
			dojo.publish('/ngdc/dataRange',[globals.dataRange]);
		},
		
		error: function(error) {
			console.log(error);
		}
	};
	dojo.io.script.get(jsonpArgs);
}

//called on Map onLoad event
function mapInitializedCustom(theMap) {
	//console.log('inside mapInitializedCustom...');

	initLegend(theMap);		
	initIdentify(theMap);
	initTOC(theMap);
	
	//get the date range of the data for the DatePanel
	setDataRange();
	
}

//called after all layers added to map
function mapReadyCustom(theMap) {
	//console.log('inside mapReadyCustom...');
}
