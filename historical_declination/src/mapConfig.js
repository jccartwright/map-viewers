dojo.require("esri.map");
dojo.require("esri.dijit.OverviewMap");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.BorderContainer");
dojo.require("esri.dijit.Scalebar");
dojo.require("simple_basemap_toolbar.SimpleBasemapToolbar");
dojo.require("banner.Banner");
dojo.require("dijit.ToolbarSeparator");
dojo.require('layers.PairedMapServiceLayer');
dojo.require("esri.layers.FeatureLayer");
dojo.require("dijit.form.HorizontalSlider");
dojo.require("dijit.form.HorizontalRule"); 
dojo.require("dijit.form.HorizontalRuleLabels");
dojo.require("info_panel.InfoPanel");

var globals = {}; //container for global variables

globals.debug = false;
globals.mapConfigLoaded = true;

globals.publicAgsHost = "http://maps.ngdc.noaa.gov/arcgis";
globals.privateAgsHost = "http://agsdevel.ngdc.noaa.gov:6080/arcgis";
globals.arcgisOnlineHost = "http://server.arcgisonline.com/ArcGIS";

//set the initial extent. may be overridden with request parameters
globals.initialExtentString = {
	"xmin": -180,
	"ymin": -70,
	"xmax": 180,
	"ymax": 70,
	"spatialReference":{"wkid":4326}
};

//define the function getInitialExtent to override default behavior

//mandatory lifecycle methods
//called just before common initialization
function preInit() {
	console.log("inside preInit...");
	//console.log(globals.surveysStore);
	
	var mybanner = new banner.Banner({
		breadcrumbs: [
			{url: 'http://www.noaa.gov', label: 'NOAA'},
			{url: 'http://www.nesdis.noaa.gov', label: 'NESDIS'},
			{url: 'http://www.ngdc.noaa.gov', label: 'NGDC'},
			{url: 'http://maps.ngdc.noaa.gov/viewers', label: 'Maps'},
			{url: 'http://www.ngdc.noaa.gov/geomag/geomag.shtml', label: 'Geomagnetism'}			
		],
		dataUrl: "http://www.ngdc.noaa.gov/geomag/geomag.shtml",
		image: "/images/historical_magnetic_declination_viewer_logo.png"
	});
	mybanner.placeAt('banner');

	esri.config.defaults.io.proxyUrl = "http://maps.ngdc.noaa.gov/proxy.jsp";
	//esri.config.defaults.io.proxyUrl = "http://agsdevel.ngdc.noaa.gov/proxy.php"; 
	
	
}

//called after common initialization
function postInit() {
	console.log("inside postInit...");
}

//called on Map onLoad event
function mapInitializedCustom(theMap) {
	console.log('inside mapInitializedCustom...');
}


//called after all layers added to map
function mapReadyCustom(theMap) {
	console.log('inside mapReadyCustom...');
	
	initBasemapToolbar();	
	
	globals.scalebar = new esri.dijit.Scalebar({map: globals.map, scalebarUnit: "metric"}, dojo.byId("scalebar"));
	globals.scalebar.hide(); // scalebar is hidden by default at small scales
	
	//Show/hide the scalebar based on the zoom level.
	dojo.connect(globals.map, "onZoomEnd", function(level){
		if (level <= globals.scalebarZoomEnabled - globals.firstZoomLevel) {
			globals.scalebar.hide();
			if (dojo.byId("bottomBar")) {
				dojo.byId("bottomBar").style.width = "auto";
			}
		} else {
			globals.scalebar.show();
			if (dojo.byId("bottomBar")) { 
				dojo.byId("bottomBar").style.width = "340px";
			}
		}
	});
	
	globals.currentYear = 2015;
	
	addFeatureLayers();
	
	globals.linesLayer.setDefinitionExpression(appendMod('YEAR=' + globals.currentYear, 2, false));
	globals.linesLayer2.setDefinitionExpression(appendMod('YEAR=' + globals.currentYear, 2, true));
	if (globals.npLayer) {
		globals.npLayer.setDefinitionExpression('Year=' + globals.currentYear);
		globals.npLayer.show();
	}
	if (globals.spLayer) {
		globals.spLayer.setDefinitionExpression('Year=' + globals.currentYear);
		globals.spLayer.show();
	}
	
	globals.linesLayer.show();
	
	dojo.connect(dijit.byId('slider'), 'onChange', function(year) {
		globals.map.graphics.clear();
		dojo.byId('declinationValue').innerHTML = 'Click on the map to highlight a line';
		globals.currentYear = year;
		
		globals.linesLayer.setDefinitionExpression(appendMod('YEAR=' + year, 2, false));
		globals.linesLayer2.setDefinitionExpression(appendMod('YEAR=' + year, 2, true));
		if (globals.npLayer) {
			globals.npLayer.setDefinitionExpression('Year=' + year);
		}
		if (globals.spLayer) {
			globals.spLayer.setDefinitionExpression('Year=' + year);
		}
		dojo.byId('currentYear').innerHTML = 'Year: ' + year;
	});
	    
    //Listen for the onMouseUp event to identify a line at the click point.
    //We are not using map.onClick, since there is a ~500ms delay after clicking before the event is fired.
	dojo.connect(globals.map, 'onMouseUp', onMapClick); 
	
	//Keep track of whether the map is currently panning, so we can treat onMouseUp as a mapClick when appropriate
	dojo.connect(globals.map, 'onPanStart', function() {
    	globals.panning = true;
    });
    dojo.connect(globals.map, 'onPanEnd', function() {
    	globals.panning = false;
    });
    
	//On zoom, clear the highlight graphic and show/hide the intermediate lines based on the zoom level.
	//GOTCHA: you apparently can't set a FeatureLayer definition expression or refresh a layer at the same time as a zoom event.
	//it conflicts with the ArcGIS API, causing errors. Get around this with a 500ms timer.
    dojo.connect(globals.map, 'onZoomEnd', function(extent, zoomFactor, anchor, level) {
    	console.log('onZoomEnd ' + level);
    	globals.map.graphics.clear();
    	dojo.byId('declinationValue').innerHTML = 'Click on the map to highlight a line';
    	 
    	setTimeout(function(){
    		if (level >= 3) {
        		globals.linesLayer2.show();
        	} else {
        		globals.linesLayer2.hide();
        	}
    	}, 500);
    });
}

function onMapClick(evt) {
	//Immediately return if the map is panning. This is not a mapClick.
	if (globals.panning) {
		return;
	}
	
	//Click point in map coordinates 
	var x = evt.mapPoint.x;
	var y = evt.mapPoint.y;
	console.log('map click X: ' + x);
	
	//If in Web Mercator, normalize the x coordinate so it's between -180 and 180 degrees
	if (globals.srid == 3857 || globals.srid == 102100) {
		var worldWidth = 40075014.4591886;
		while (x > worldWidth/2) {
			x -= worldWidth;
		}
		while (x < -worldWidth/2) {
			x += worldWidth;
		}
		console.log('normalized X: ' + x);
	}
	
	//Find the first isogonic line which is near the click point
	if (!findIntersectingLine(x, y, globals.linesLayer)) {
		findIntersectingLine(x, y, globals.linesLayer2);
	}
}

//Find the first isogonic line which intersects a tiny box around the click point.
//Highlight the line and update the declination text.
//Returns boolean indicating if a line was found.
function findIntersectingLine(x, y, layer) {
	globals.map.graphics.clear();
	
	//Immediately return if the layer is hidden
	if (!layer.visible) {
		return;
	}
	var map = globals.map;
	var value, highlightGraphic;
	
	var metersPerPixel = (map.extent.xmax - map.extent.xmin) / map.width;
	var boxWidth = metersPerPixel * 5; //10 pixel square
	
	//Construct a tiny extent around the click point in map coordinates
	var mapClickExtent = new esri.geometry.Extent(x-boxWidth, y-boxWidth, x+boxWidth, y+boxWidth, map.spatialReference); 	
	
	var declinationStr = 'Declination of highlighted line: ';
	var highlightSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 255, 0]), 3);
	
	//Loop through the graphics in the FeatureLayer
	for (var i = 0; i < layer.graphics.length; i++) {
		var graphic = layer.graphics[i];
		
		if (mapClickExtent.intersects(layer.graphics[i].geometry)) {
			//Feature intersects the map click box, highlight the feature and update text.
			
			//console.log(i + ' intersects');
			value = graphic.attributes.CONTOUR;
			
			if (value == 0) {
				declinationStr = declinationStr + value + ' degrees'; 
			} else if (value > 0) {
				declinationStr = declinationStr + value + ' degrees east of north';
			} else {
				declinationStr = declinationStr + (-value) + ' degrees west of north';
			}
			dojo.byId('declinationValue').innerHTML = declinationStr;
			
			map.graphics.clear();
			highlightGraphic = new esri.Graphic(graphic.geometry, highlightSymbol);
		    map.graphics.add(highlightGraphic);
		    return true; //Return after the first feature is found
		}
	}
	//No line was found. Update the text and return.
	dojo.byId('declinationValue').innerHTML = 'Click on the map to highlight a line';
	return false;
}

//Append a modulus operator to the definition expression string.
//Can be negated to get the opposite.
function appendMod(str, value, negate) {
	if (negate) {
		return str + ' AND NOT MOD(CONTOUR, ' + value + ')=0';
	} else {
		return str + ' AND MOD(CONTOUR, ' + value + ')=0';
	}
}

function launchViewer(name) {	
	if (name === 'Mercator') {
		window.open('index.html', 'declination');
	} else if (name === 'Arctic') {
		window.open('index_arctic.html', 'declination_arctic');
	} else { //Antarctic
		window.open('index_antarctic.html', 'declination_antarctic');
	}
}
