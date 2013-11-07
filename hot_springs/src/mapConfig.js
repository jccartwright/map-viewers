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
	new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/rest/services/hot_springs/MapServer", {
		id: "Hot Springs",
		visible: true
	})];
	globals.basemapLayers = [globals.mapServices[0], globals.mapServices[1], globals.mapServices[2]];
	globals.overlayLayers = [globals.mapServices[3],globals.mapServices[3]];
	return (globals.mapServices);
}

function initTOC(theMap) {
	//console.log('inside initTOC...');
	//WARNING: hardcoded element name
	globals.legend = new esri.dijit.Legend({map:globals.map, 
		layerInfos:[
			{layer:globals.mapServices[4], title: "Hot Springs"}		
		]}, "legend");
	globals.legend.startup();
}

function initIdentify() {
	//create the coordinate dialog
	//globals.coordDialog = new bboxDialog.BoundingBoxDialog({title:'Specify an Area of Interest', style: 'width:300px;'}); 

	var identifyTask = new esri.tasks.IdentifyTask(globals.mapServices[4].url);
	var identifyParams = new esri.tasks.IdentifyParameters();
	identifyParams.tolerance = 3;
	identifyParams.returnGeometry = true;
	identifyParams.layerIds = [0];
	identifyParams.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_ALL;
	identifyParams.width  = globals.map.width;
	identifyParams.height = globals.map.height;
        
	globals.map.infoWindow.resize(415, 150);
	globals.map.infoWindow.setContent(dijit.byId("identifyDiv").domNode);
	globals.map.infoWindow.setTitle("Identify Results");	

	function addToMap(idResults, mapPoint) {
		var divContent = "";
		
		if (idResults.length == 0) {
			//divContent = "<h2>no hot springs found at this location</h2>"
			globals.map.infoWindow.hide();
			return;
		}

		divContent += "<table border='1'><tr><th>Spring Name</th><th>State</th><th>Temp (&deg;F)</th><th>Temp (&deg;C)</th></tr>";	
		for (var i=0, il=idResults.length; i<il; i++) {
			var idResult = idResults[i];
			//TODO use a template?
			divContent += "<tr>";
			divContent += "<td>"+idResult.feature.attributes['SPRING_NAME']+"</td>";
			divContent += "<td>"+idResult.feature.attributes['STATE_CODE']+"</td>";
			divContent += "<td>"+idResult.feature.attributes['TEMP_F']+"</td>";
			divContent += "<td>"+idResult.feature.attributes['TEMP_C']+"</td>";
			divContent += "</tr>";	
		}
		divContent += "</table>"
		
		dijit.byId("identifyDiv").setContent(divContent);
		var screenPoint = globals.map.toScreen(mapPoint);
		globals.map.infoWindow.show(screenPoint, globals.map.getInfoWindowAnchor(screenPoint));
	}

	dojo.subscribe('Identify/mapClick',function(mapPoint) {
		globals.map.graphics.clear();
		identifyParams.geometry = mapPoint;
		identifyParams.mapExtent = globals.map.extent;
		identifyTask.execute(
			identifyParams,
			function(idResults) { 
				addToMap(idResults,mapPoint); 
			}
		);
	});
}

/*
function initIdentify() {
	console.log('inside initIdentify');
	var attributes = [
		'Spring Name',
		'State Code',
		'Temp F',
		'Temp C'
	];
	
	globals.identifyDijit = new identify.Identify({
		map: globals.map,
		label: "Identify",
		defaultTolerance: 2,
		featureGridHeaderText: 'Hot Springs Name',
		mapServices: [{
			id: "Hot Springs",
			url: globals.mapServices[4].url,
			displayOptions: {
				0: {
					attributes: attributes,
					visible: true,
					displayFieldNames: ['Spring Name']
				}
			}
		}],
		lineSymbol: new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 255, 0]), 2),
		fillSymbol: new esri.symbol.SimpleFillSymbol(
     		esri.symbol.SimpleFillSymbol.STYLE_SOLID, 
     		new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([ 64, 64, 64, 1 ]), 2), 
     		new dojo.Color([ 255, 255, 0, 0.3 ]))
	});
	
	globals.identifyDijit.startup();
	
	dojo.publish('/Identify/setLayerVisibility', [{serviceId: "Hot Springs", serviceUrl: globals.identifyDijit.mapServices[0].url, visibleLayers: [0]}]);
}
*/

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
