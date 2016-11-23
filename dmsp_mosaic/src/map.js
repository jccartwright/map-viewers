/*
 * generic setup for viewers.  Expects to be paired with a local mapConfig.js
 * which is loaded prior to this script.
 * 
 * All maps have a few common elements:
 *   - toolbar in upper left containing select by rectangle, select by coordinate tools
 *   - coordinate readout in lower left
 *   - basemap toolbar in upper right
 *   - overview map in lower right
 *   
 * Lifecycle methods:
 *    - init. called when DOM and dojo.require() classes loaded (dojo.addOnLoad event)
 *    - preInit. defined in mapConfig, called prior to any other initialization
 *    - checkPrerequisities. standard implementation, but can be overridden in mapConfig
 *    - getMapServiceList. defined in mapConfig.
 *    - mapInitialized. called as soon as first layer added to map
 *    - mapInitializedCustom
 *    
 * Events:
 *    - ngdc/mapReady
 *    - ngdc/mapClick
 *    - ngdc/drawRectangle
 * 	
 */
if (! globals.mapConfigLoaded) {
	console.warn ('mapConfig.js does not appear to have been loaded');
}

/*
 * set the initial extent.
 * Can be overridden in mapConfig.js
 */
if (!getInitialExtent) {
	var getInitialExtent = function(){
		var geoExtent = new esri.geometry.Extent(globals.initialExtentString);
		
		var queryParams = dojo.queryToObject(window.location.search.slice(1));
		if (queryParams.minx && queryParams.miny && queryParams.maxx && queryParams.maxy) {
			//override default initial extent based on request parameters in geographic
			var minx = parseFloat(queryParams.minx);
			var miny = parseFloat(queryParams.miny);
			var maxx = parseFloat(queryParams.maxx);
			var maxy = parseFloat(queryParams.maxy);
			if (minx && miny && maxx && maxy) {
				geoExtent = new esri.geometry.Extent({
					"xmin": minx,
					"ymin": miny,
					"xmax": maxx,
					"ymax": maxy,
					"spatialReference": {
						"wkid": 4326
					}
				});
			} else {
				console.error("invalid values provided for initial extent")
			}
		}
		if (globals.srid === 3857) {
			return (esri.geometry.geographicToWebMercator(geoExtent));
		} else {
			return(geoExtent);
		}
	};
} else {
	//console.log('using application-specific getInitialExtent function');
}


/*
 * verify that required DOM elements and global variables are set. 
 * Can be overridden in mapConfig.js
 */
if (!checkPrerequisites) {
	var checkPrerequisites = function() {
		if (globals.debug) { console.log ("checking prerequisites..."); }
		if (!dojo.byId('mapDiv')) { console.error("missing element 'mapDiv'"); }
		if (!dojo.byId('loadingImg')) { console.error("missing element 'loadingImg'"); }
		if (!dojo.byId('coordsDiv')) { console.error("missing element 'coordsDiv'"); }
		if (!dojo.byId('basemapToolbar')) { console.error("missing element 'coordsDiv'"); }
		if (!globals) { console.error("globals container not initialized"); }
		if (!globals.lods) {console.error("LODs not set"); }
		if (!globals.initialExtentString) {console.error("initial extent not set"); }
		if (!globals.srid) {console.error("SRID is not set"); }
	};
} else {
	//console.log('using application-specific checkPrerequisites function');
}


/*
 *  Standard Web Mercator zoom levels. Don't allow map zoom levels 0-2.
 *  Can be overridden in mapConfig.js
 */
if (!globals.lods) {
	globals.lods = 	[ 
	//{"level": 0, "resolution": 156543.03392800014,"scale": 5.91657527591555E8},
	//{"level": 1, "resolution": 78271.51696399994, "scale": 2.95828763795777E8},
	//{"level": 2,"resolution": 39135.75848200009,"scale": 1.47914381897889E8},
	{"level": 3,"resolution": 19567.87924099992,"scale": 7.3957190948944E7},
	{"level": 4,"resolution": 9783.93962049996,"scale": 3.6978595474472E7},
	{"level": 5,"resolution": 4891.96981024998,"scale": 1.8489297737236E7},
	{"level": 6,"resolution": 2445.98490512499,"scale": 9244648.868618},
	{"level": 7,"resolution": 1222.992452562495,"scale": 4622324.434309},
	{"level": 8,"resolution": 611.4962262813797,"scale": 2311162.217155},
	{"level": 9,"resolution": 305.7481131405575,"scale": 1155581.108577},
	{"level": 10,"resolution": 152.87405657041106,"scale": 577790.554289},
	{"level": 11,"resolution": 76.43702828507324,"scale": 288895.277144},
	{"level": 12,"resolution": 38.21851414253662,"scale": 144447.638572},
	{"level": 13,"resolution": 19.10925707126831,"scale": 72223.819286},
	{"level": 14,"resolution": 9.554628535634155,"scale": 36111.909643},
	{"level": 15,"resolution": 4.77731426794937,"scale": 18055.954822},
	{"level": 16,"resolution": 2.388657133974685,"scale": 9027.977411},
	{"level": 17,"resolution": 1.1943285668550503,"scale": 4513.988705},
	{"level": 18,"resolution": 0.5971642835598172,"scale": 2256.994353},
	{"level": 19,"resolution": 0.29858214164761665,"scale": 1128.497176}
	];
} else {
	//console.log('using application-specific LODs');
}

//called after DOM elements loaded
function init() {
	if (globals.debug) { console.log('inside init...'); }
	
	//application-specific initialization completed after common initialization.
	//defined in mapConfig.js
	preInit();

	//verify DOM elements and global variables needed by this point	
	checkPrerequisites();
	globals.servicesAdded = 0;     //counter for layer add.
	globals.identifyTasksRunning = 0;
	globals.loadingImg= dojo.byId("loadingImg"); //busy loading image	
	globals.initialExtent = getInitialExtent();

	var mapOptions = {
		wrapAround180: true,
		fitExtent: true,	
		extent: globals.initialExtent,		
		lods: globals.lods,
		logo: false
	};

	//populates the globals mapServices, basemapLayers, overlayLayers
	//defined in mapConfig.js
	getMapServiceList();

	//Initialize the map. WARNING: depends on element 'mapDiv' defined in HTML page
	globals.map = new esri.Map("mapDiv", mapOptions);

	//setup event handlers
	dojo.connect(globals.map, "onLoad", showLoading);		//still necessary?
	dojo.connect(globals.map, "onZoomStart", showLoading);	//still necessary?
	dojo.connect(globals.map, "onPanStart", showLoading);	//still necessary?
	dojo.connect(globals.map, "onMouseMove", showCoordinates);
	dojo.connect(globals.map, "onMouseDrag", showCoordinates);
    dojo.connect(globals.map, 'onLoad', mapInitialized);

	dojo.connect(globals.map, 'onLayerAdd',function(layer){
		if (globals.debug) { console.log('added layer ' + layer.url + " to map."); }
		globals.servicesAdded++;
		if (globals.servicesAdded === globals.mapServices.length) {
			dojo.publish("/ngdc/mapReady", [{map:globals.map}]);
		}
	});

	// standard buttons. WARNING: depends on elements defined in HTML page
	dojo.connect(dijit.byId('selectByRectBtn'),"onClick",function() {
		globals.map.graphics.clear();
		globals.drawToolbar.activate(esri.toolbars.Draw.EXTENT);
		globals.map.hideZoomSlider();
	});

	dojo.connect(dijit.byId('selectByCoordsBtn'),'onClick',function() {
		globals.coordDialog.show();
	});

	dojo.connect(globals.map, "onClick", function(evt) {
		globals.identifyTasksRunning = 0;
		dojo.publish('/ngdc/mapClick', [evt.mapPoint]);
	});

	//setup that can only happen after all layers added
	dojo.subscribe('/ngdc/mapReady', this, function(theMap){
		if (globals.debug) { console.log('All ' + globals.map.layerIds.length + ' layers added to map. Map ready!'); }
		
		//defined in mapConfig.js
		mapReadyCustom(theMap);
	});

	dojo.connect(globals.map,'onUpdateStart',function(){
		showLoading();
	});
	
	dojo.connect(globals.map,'onUpdateEnd',function(error){
		esri.hide(globals.loadingImg);
		globals.map.enableMapNavigation();
		globals.map.showZoomSlider();
	});
	
	//globals.mapServices defined in mapConfig.js
    dojo.forEach(globals.mapServices, function(service){
		globals.map.addLayer(service);		
    });
		
	
	//application-specific initialization completed after common initialization.
	//defined in mapConfig.js
	postInit();
} //end init function


/*
 * setup that can happen as soon as first layer added to map
 */
function mapInitialized(/*esri.Map*/ theMap) {
	if (globals.debug) { console.log('map initialized...'); }
	
	var overviewMapDijit = new esri.dijit.OverviewMap({
		map: globals.map,
		attachTo:"bottom-right",
		width: 150,
		height: 120,
		visible: true,
		opacity: 0.3
	});
	overviewMapDijit.startup();

	//setup the toolbar for drawing
	globals.drawToolbar = new esri.toolbars.Draw(globals.map);
	dojo.connect(globals.drawToolbar, "onDrawEnd", addToMap);
	
	//defined in mapConfig.js
	initBasemapToolbar();

	//resize the map when the browser resizes - view the 'Resizing and repositioning the map' section in 
	//the following help topic for more details http://help.esri.com/EN/webapi/javascript/arcgis/help/jshelp_start.htm#jshelp/inside_guidelines.htm
	var resizeTimer;
	dojo.connect(dijit.byId('mapDiv'), 'resize', function(){ //resize the map if the div is resized
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(function(){
			globals.map.resize();
			globals.map.reposition();
		}, 500);
	});
	
	//application-specific processing required for the Map onLoad event. 
	//defined in mapConfig.js. 
	mapInitializedCustom(theMap);
}

function showLoading() {
	esri.show(globals.loadingImg);
	globals.map.disableMapNavigation();
	globals.map.hideZoomSlider();
}

function hideLoading(error) {
	esri.hide(globals.loadingImg);
	globals.map.enableMapNavigation();
	globals.map.showZoomSlider();
}

/*
function showCoordinates(evt) {
	//TODO: check for SRID
	var mp = esri.geometry.webMercatorToGeographic(evt.mapPoint);
	dojo.byId("coordsDiv").innerHTML = "Position: " + mp.x.toFixed(3) + ", " + mp.y.toFixed(3);
}
*/
	//Show coordinates when moving the mouse. 
	//For performance reasons, coordinates are only updated every 100ms.
	var waitToUpdate = false;
	var mouseMoveTimer;
	function showCoordinates(evt){
		if (!waitToUpdate) {
			waitToUpdate = true;
			var mp;
			if (globals.srid == 3857 || globals.srid == 102100) {
				//Transform Web Mercator coordinates to lat/long
				mp = esri.geometry.webMercatorToGeographic(evt.mapPoint);
			} else {
				mp = {};
				mp.x = evt.mapPoint.x;
				mp.y = evt.mapPoint.y;
			}
			dojo.byId("coordsDiv").innerHTML = "Position: " + mp.x.toFixed(3) + ", " + mp.y.toFixed(3);
			//Wait 100ms before allowing another update
			clearTimeout(mouseMoveTimer);
			mouseMoveTimer = setTimeout(function(){
				waitToUpdate = false;
			}, 100);
		}
	};

/*
 * handler for onDrawEnd event. publishes event "/ngdc/drawRectangle"
 */
function addToMap(geometry) {
	if (globals.debug) { console.log('inside addToMap with ', geometry); }
	switch (geometry.type) {
	case "polygon":
		var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_NONE, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255,0,0]), 2), new dojo.Color([255,255,0,0.25]));
    break;
	case "extent":
		var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_NONE, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255,0,0]), 2), new dojo.Color([255,255,0,0.25]));
		break;
	default:
		console.log("invalid geometry type: "+geometry.type);
	}
	var graphic = new esri.Graphic(geometry, symbol);
	globals.map.graphics.add(graphic);

 	//only allow one shape to be drawn
 	globals.drawToolbar.deactivate();
	globals.map.showZoomSlider();
	
	//send geometry
	dojo.publish('/ngdc/drawRectangle',[graphic]);
}

dojo.addOnLoad(init);


